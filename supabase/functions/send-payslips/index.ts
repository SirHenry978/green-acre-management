import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RecipientSchema = z.object({
  employee_id: z.string(),
  name: z.string(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  net_pay: z.number(),
  gross_pay: z.number(),
  total_deductions: z.number(),
  payment_method: z.string().optional(),
});
const BodySchema = z.object({
  run_id: z.string(),
  period_start: z.string(),
  period_end: z.string(),
  recipients: z.array(RecipientSchema).max(500),
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten() }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const { period_start, period_end, recipients } = parsed.data;

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    const fmt = (n: number) => new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(n);

    let sent = 0;
    const errors: string[] = [];

    for (const r of recipients) {
      if (!r.email) continue;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color:#228B22;">Payslip — ${period_start} to ${period_end}</h2>
          <p>Hello ${r.name},</p>
          <p>Your payslip summary for the above period:</p>
          <table style="width:100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding:8px; border:1px solid #eee;">Gross Pay</td><td style="padding:8px; border:1px solid #eee; text-align:right;">${fmt(r.gross_pay)}</td></tr>
            <tr><td style="padding:8px; border:1px solid #eee;">Total Deductions</td><td style="padding:8px; border:1px solid #eee; text-align:right;">${fmt(r.total_deductions)}</td></tr>
            <tr style="background:#228B22;color:white;"><td style="padding:8px;"><strong>Net Pay</strong></td><td style="padding:8px; text-align:right;"><strong>${fmt(r.net_pay)}</strong></td></tr>
          </table>
          <p>Payment Method: <strong>${(r.payment_method || 'bank').replace('_', ' ')}</strong></p>
          <p>Log in to your account to view and download the full payslip PDF.</p>
        </div>
      `;

      if (RESEND_API_KEY) {
        const resp = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Payroll <onboarding@resend.dev>',
            to: r.email,
            subject: `Payslip ${period_start} to ${period_end}`,
            html,
          }),
        });
        if (resp.ok) sent++;
        else {
          const err = await resp.text();
          errors.push(`${r.email}: ${err.slice(0, 100)}`);
        }
      } else {
        // No email provider configured — log only
        console.log(`[payslip-stub] would email ${r.email}: net=${r.net_pay}`);
        sent++;
      }
    }

    return new Response(JSON.stringify({ sent, errors, provider: RESEND_API_KEY ? 'resend' : 'stub' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
