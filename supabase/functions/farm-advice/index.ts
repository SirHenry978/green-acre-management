import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { createResponsesCall } from './responses.ts';
import { adviceInstructions, canRequestAdvice, validProblem } from './policy.ts';
import { getLovableAiGatewayResponseHeaders } from './run-id.ts';

const json = (error: string, status: number) => new Response(JSON.stringify({ error }), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json('Method not allowed.', 405);
  const authorization = req.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) return json('Please sign in.', 401);
  const base = Deno.env.get('FARMIQ_DJANGO_API_URL')?.replace(/\/$/, '');
  if (!base || !base.startsWith('https://')) return json('Farm advice is not connected to your account server yet. Ask your administrator to connect the Django server’s public HTTPS address.', 503);
  let me;
  try {
    const auth = await fetch(`${base}/api/me/`, { headers: { Authorization: authorization }, redirect: 'error', signal: req.signal });
    if (auth.status === 401 || auth.status === 403) return json('Your session has expired. Please sign in again.', 401);
    if (!auth.ok) return json('Your account server is unavailable.', 503);
    me = await auth.json();
  } catch { return json('Cannot verify your account with the farm server.', 503); }
  if (!canRequestAdvice(me.role, me.branch_id)) return json('Farm advice is available only to branch managers with an assigned branch and administrators.', 403);
  let body;
  try { body = await req.json(); } catch { return json('Enter a valid problem description.', 400); }
  if (!validProblem(body)) return json('Choose crop or livestock, enter the name and at least 20 characters describing the problem.', 400);
  const key = Deno.env.get('LOVABLE_API_KEY');
  if (!key) return json('Lovable AI is not configured.', 401);
  const db = createClient(Deno.env.get('SUPABASE_URL') || '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '');
  const { data: blocked, error: stateError } = await db.from('farm_advice_access_state').select('status,message').eq('id', 'gateway').maybeSingle();
  if (stateError) return json('Cannot check AI availability. Please try again later.', 503);
  if (blocked) return json(blocked.message, blocked.status);

  async function failure(error: unknown) {
    const e = error as { statusCode?: number; responseBody?: string; message?: string };
    let upstream;
    try { upstream = JSON.parse(e.responseBody || '{}'); } catch { upstream = {}; }
    const status = e.statusCode && e.statusCode >= 400 && e.statusCode <= 599 ? e.statusCode : 502;
    const message = upstream.error?.message || upstream.message || e.message || 'Advice is unavailable. Please try again later.';
    // Persist terminal credit/policy/provider blocks. No background probes or retries.
    if (status === 402 || status === 403) {
      await db.from('farm_advice_access_state').upsert({ id: 'gateway', status, message });
    }
    return { message, status };
  }
  try {
    const { result, gateway } = createResponsesCall(req, { baseURL: 'https://ai.gateway.lovable.dev/v1', apiKey: key, model: 'openai/gpt-6-astra' }, [{ role: 'user', content: JSON.stringify({ kind: body.kind, subject: body.subject, description: body.description, context: body.context }) }], adviceInstructions);
    const iterator = result.fullStream[Symbol.asyncIterator]();
    // Wait for upstream success or error before committing HTTP headers.
    let first = await iterator.next();
    while (!first.done && (first.value.type === 'start' || first.value.type === 'start-step')) first = await iterator.next();
    if (!first.done && first.value.type === 'error') {
      const denied = await failure(first.value.error);
      return json(denied.message, denied.status);
    }
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (event: object) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        let hasText = false;
        try {
          let item = first;
          while (!item.done) {
            const part = item.value;
            if (part.type === 'text-delta') { hasText = true; send({ text: part.text }); }
            if (part.type === 'error') { const denied = await failure(part.error); send({ error: denied.message, status: denied.status }); return; }
            item = await iterator.next();
          }
          send(hasText ? { done: true } : { error: 'No advice was returned. This request has ended.' });
        } catch (error) {
          if (!req.signal.aborted) { const denied = await failure(error); send({ error: denied.message, status: denied.status }); }
        } finally { controller.close(); }
      },
      async cancel() { await iterator.return?.(); },
    });
    const headers = new Headers({ ...corsHeaders, 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' });
    const runId = gateway.getRunId();
    if (runId) headers.set('X-Lovable-AIG-Run-ID', runId);
    return new Response(stream, { headers: getLovableAiGatewayResponseHeaders(undefined, headers) });
  } catch (error) {
    if (req.signal.aborted) return json('Stopped.', 499);
    const denied = await failure(error);
    return json(denied.message, denied.status);
  }
});