import { tokens, fetchMe } from './api';

export { canRequestAdvice, validProblem } from '../../supabase/functions/farm-advice/policy';

export interface FarmProblem {
  kind: 'crop' | 'livestock';
  subject: string;
  description: string;
  context: string;
}

export async function requestFarmAdvice(problem: FarmProblem, onText: (text: string) => void, signal: AbortSignal) {
  // Refresh an expired Django token before starting; never replay a billed AI request.
  await fetchMe();
  if (signal.aborted) throw new DOMException('Stopped', 'AbortError');
  const token = tokens.access;
  if (!token) throw new Error('Please sign in again.');
  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/farm-advice`, {
    method: 'POST', signal,
    headers: { 'Content-Type': 'application/json', apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${token}` },
    body: JSON.stringify(problem),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Advice is unavailable. Please try again later.');
  }
  if (!response.body) throw new Error('The advice response was empty.');
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '', answer = '', completed = false;
  try {
    while (true) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const event = JSON.parse(line.slice(6));
        if (event.error) throw new Error(event.error);
        if (typeof event.text === 'string') { answer += event.text; onText(answer); }
        if (event.done) completed = true;
      }
      if (done) break;
    }
  } finally { await reader.cancel().catch(() => undefined); reader.releaseLock(); }
  if (!completed) throw new Error('The connection ended before advice was complete.');
  if (!answer.trim()) throw new Error('No advice was returned.');
}