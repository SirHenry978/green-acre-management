import { useEffect } from 'react';
import { supabase } from '@/lib/backend';
import { useAuth } from '@/contexts/AuthContext';
import { notify } from '@/lib/notifications';

const SEEN_KEY = 'farmiq_seen_approvals';

const SOURCES = [
  { table: 'requisitions', label: 'Requisition', link: '/requisitions', title: (r: any) => r.req_number || 'New requisition' },
  { table: 'leave_requests', label: 'Leave request', link: '/hr', title: () => 'Leave request' },
  { table: 'accommodation_applications', label: 'Accommodation application', link: '/accommodation', title: () => 'Accommodation application' },
] as const;

function getSeen(): string[] {
  try {
    return JSON.parse(localStorage.getItem(SEEN_KEY) || '[]');
  } catch {
    return [];
  }
}

/** Notifies approvers when items are waiting for their approval. */
export const usePendingApprovalAlerts = () => {
  const { user } = useAuth();
  const canApprove = user?.role === 'super_admin' || user?.role === 'branch_manager';

  useEffect(() => {
    if (!canApprove) return;
    let cancelled = false;

    const check = async () => {
      const seen = new Set(getSeen());
      let changed = false;

      for (const src of SOURCES) {
        try {
          const { data } = await supabase
            .from(src.table)
            .select('*')
            .eq('status', 'pending');
          if (cancelled || !Array.isArray(data)) continue;

          for (const row of data.slice(0, 5)) {
            const key = `${src.table}:${row.id}`;
            if (seen.has(key)) continue;
            seen.add(key);
            changed = true;
            notify({
              title: 'Pending approval',
              message: `${src.title(row)} is waiting for your approval`,
              category: 'approval',
              link: src.link,
            });
          }
        } catch {
          /* table may be unavailable */
        }
      }

      if (changed) {
        localStorage.setItem(SEEN_KEY, JSON.stringify([...seen].slice(-300)));
      }
    };

    check();
    const timer = window.setInterval(check, 120000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [canApprove]);
};
