import { useEffect, useRef, useState } from 'react';
import { Leaf, ShieldAlert, Sparkles, Square, Bug, Copy, Check } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { canRequestAdvice, requestFarmAdvice, validProblem, type FarmProblem } from '@/lib/farmAdvice';

export default function FarmAdvice() {
  const { user, branch } = useAuth();
  const [problem, setProblem] = useState<FarmProblem>({ kind: 'crop', subject: '', description: '', context: '' });
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => {
    controller.current?.abort(); setAnswer(''); setError('');
  }, [user?.id, user?.branchId, branch?.id]);
  const allowed = canRequestAdvice(user?.role, user?.branchId);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!allowed || busy || !validProblem(problem)) return;
    setBusy(true); setAnswer(''); setError(''); setCopied(false);
    const pending = new AbortController(); controller.current = pending;
    try { await requestFarmAdvice(problem, setAnswer, pending.signal); }
    catch (cause) {
      setError(pending.signal.aborted ? 'Stopped. Any partial advice is incomplete.' : cause instanceof Error ? cause.message : 'Advice is unavailable.');
    } finally { setBusy(false); controller.current = null; }
  }
  return <DashboardLayout>
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b pb-5">
        <div><h1 className="font-display text-2xl font-semibold flex items-center gap-2"><Leaf className="h-6 w-6 text-primary" />Farm advice</h1><p className="mt-1 text-sm text-muted-foreground">{branch?.name || 'Farm management'}</p></div>
        <span className="text-sm text-primary flex items-center gap-2"><Sparkles className="h-4 w-4" />Lovable AI</span>
      </header>
      {!allowed ? <p role="alert" className="text-destructive">Only branch managers with an assigned branch and administrators can request farm advice.</p> : <>
        <div className="flex gap-3 border-l-4 border-warning bg-warning/10 p-4 text-sm"><ShieldAlert className="h-5 w-5 shrink-0 text-warning" /><p>For sudden deaths, collapse, severe breathing difficulty or suspected poisoning, contact a veterinarian immediately. AI guidance is not a diagnosis.</p></div>
        <div className="grid gap-8 lg:grid-cols-2">
          <form onSubmit={submit} className="space-y-5">
            <Tabs value={problem.kind} onValueChange={kind => setProblem({ ...problem, kind: kind as FarmProblem['kind'] })}>
              <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="crop" disabled={busy} className="gap-2"><Leaf className="h-4 w-4" />Crops</TabsTrigger><TabsTrigger value="livestock" disabled={busy} className="gap-2"><Bug className="h-4 w-4" />Livestock</TabsTrigger></TabsList>
            </Tabs>
            <div className="space-y-2"><Label htmlFor="advice-subject">{problem.kind === 'crop' ? 'Crop and growth stage' : 'Animal species and age'}</Label><Input id="advice-subject" value={problem.subject} onChange={e => setProblem({ ...problem, subject: e.target.value })} required minLength={2} maxLength={120} disabled={busy} placeholder={problem.kind === 'crop' ? 'Maize, six weeks after planting' : 'Dairy cattle, adult cows'} /></div>
            <div className="space-y-2"><Label htmlFor="advice-description">What is happening?</Label><Textarea id="advice-description" className="min-h-40" value={problem.description} onChange={e => setProblem({ ...problem, description: e.target.value })} required minLength={20} maxLength={6000} disabled={busy} placeholder="Symptoms, when they started, and how many plants or animals are affected" /></div>
            <div className="space-y-2"><Label htmlFor="advice-context">Conditions and steps already taken (optional)</Label><Textarea id="advice-context" className="min-h-24" value={problem.context} onChange={e => setProblem({ ...problem, context: e.target.value })} maxLength={2000} disabled={busy} placeholder="Recent weather, watering, feed changes, treatments or location" /></div>
            <div className="flex flex-wrap gap-3"><Button disabled={busy || !validProblem(problem)} type="submit" className="gap-2"><Sparkles className="h-4 w-4" />{busy ? 'Considering the problem…' : 'Suggest next steps'}</Button>{busy && <Button type="button" variant="outline" onClick={() => controller.current?.abort()} className="gap-2"><Square className="h-4 w-4" />Stop</Button>}</div>
            {error && <p role="alert" className="text-sm text-destructive break-words">{error}</p>}
          </form>
          <section aria-label="Advice" className="min-w-0 border-t pt-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <div className="flex justify-between items-center gap-3"><h2 className="font-display text-lg font-semibold">Practical next steps</h2>{answer && !busy && !error && <Button variant="ghost" size="icon" title="Copy advice" aria-label="Copy advice" onClick={async () => { try { await navigator.clipboard.writeText(answer); setCopied(true); } catch { setError('Could not copy advice.'); } }}>{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</Button>}</div>
            {!answer && !busy && <Leaf className="mx-auto mt-16 h-16 w-16 text-muted-foreground/30" />}
            {busy && !answer && <p role="status" className="mt-6 text-sm text-muted-foreground">Reviewing observations…</p>}
            <div aria-live="polite" aria-busy={busy} className="mt-5 whitespace-pre-wrap break-words text-sm leading-7">{answer}</div>
          </section>
        </div>
      </>}
    </div>
  </DashboardLayout>;
}