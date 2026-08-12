import { ReactNode, useEffect, useState } from 'react';
import { hydrateAppData } from '@/data/liveData';
import { Sprout } from 'lucide-react';

/**
 * Loads the shared reference data (branches, users, customers, ...) from the
 * backend before the routed app renders, so no page falls back to local data.
 */
export const DataBootstrap = ({ children }: { children: ReactNode }) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    hydrateAppData()
      .catch(() => undefined)
      .finally(() => { if (!cancelled) setReady(true); });
    return () => { cancelled = true; };
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background">
        <Sprout className="h-8 w-8 text-primary animate-pulse" />
        <p className="text-sm text-muted-foreground">Loading farm data…</p>
      </div>
    );
  }

  return <>{children}</>;
};
