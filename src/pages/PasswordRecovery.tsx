import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, KeyRound, Mail, Sprout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { confirmPasswordReset, requestPasswordReset } from '@/lib/api';

export default function PasswordRecovery({ reset = false }: { reset?: boolean }) {
  const [params] = useSearchParams();
  const uid = params.get('uid') || '';
  const token = params.get('token') || '';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const missingLink = reset && (!uid || !token);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    if (reset && password !== confirmation) {
      setError('Passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      if (reset) await confirmPasswordReset(uid, token, password);
      else await requestPasswordReset(email);
      setPassword('');
      setConfirmation('');
      setDone(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Please try again later.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
            <Sprout className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">FarmIQ</h1>
          <h2 className="text-lg font-medium">{reset ? 'Reset password' : 'Forgot password'}</h2>
        </div>
        {done ? (
          <p role="status" className="text-sm text-center text-foreground">
            {reset ? 'Your password has been changed. Sign in with your new password.' : 'If an account matches that email, a password reset link will be sent. Please check your inbox and spam folder.'}
          </p>
        ) : missingLink ? (
          <div className="space-y-4">
            <p role="alert" className="text-sm text-destructive">This reset link is incomplete. Request a new link.</p>
            <Button asChild className="w-full"><Link to="/forgot-password">Request new link</Link></Button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            {reset ? (
              <>
                <div className="space-y-2">
                  <label htmlFor="new-password" className="block text-sm font-medium">New password</label>
                  <input id="new-password" type="password" autoComplete="new-password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} className="input-farm" disabled={busy} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="confirm-password" className="block text-sm font-medium">Confirm password</label>
                  <input id="confirm-password" type="password" autoComplete="new-password" required minLength={8} value={confirmation} onChange={e => setConfirmation(e.target.value)} className="input-farm" disabled={busy} />
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <label htmlFor="recovery-email" className="block text-sm font-medium">Email address</label>
                <input id="recovery-email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} className="input-farm" disabled={busy} />
              </div>
            )}
            {error && <p role="alert" className="text-sm text-destructive break-words">{error}</p>}
            {reset && error && <Button variant="link" asChild><Link to="/forgot-password">Request new link</Link></Button>}
            <Button type="submit" className="w-full h-11 gap-2" disabled={busy}>
              {reset ? <KeyRound className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
              {busy ? 'Please wait…' : reset ? 'Save new password' : 'Send reset link'}
            </Button>
          </form>
        )}
        <Button asChild variant="link" className="w-full gap-2"><Link to="/login"><ArrowLeft className="h-4 w-4" />Back to sign in</Link></Button>
      </div>
    </main>
  );
}