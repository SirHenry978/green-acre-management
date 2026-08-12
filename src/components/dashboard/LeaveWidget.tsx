import { useEffect, useState } from 'react';
import { supabase } from '@/lib/backend';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Clock, CheckCircle2, XCircle, ArrowRight, Palmtree, Stethoscope, Home } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface LeaveBalance {
  annual_leave_total: number;
  annual_leave_used: number;
  sick_leave_total: number;
  sick_leave_used: number;
  family_leave_total: number;
  family_leave_used: number;
}

interface LeaveRequest {
  id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  days_count: number;
  status: string;
  created_at: string;
}

export const LeaveWidget = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState<LeaveBalance | null>(null);
  const [recentRequests, setRecentRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const year = new Date().getFullYear();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [balRes, reqRes] = await Promise.all([
        supabase.from('leave_balances').select('*').eq('year', year).limit(1),
        supabase.from('leave_requests').select('*').order('created_at', { ascending: false }).limit(5),
      ]);
      if (balRes.data?.[0]) setBalance(balRes.data[0] as unknown as LeaveBalance);
      setRecentRequests((reqRes.data as unknown as LeaveRequest[]) || []);
      setLoading(false);
    };
    load();
  }, [year]);

  const statusConfig: Record<string, { color: string; icon: typeof CheckCircle2 }> = {
    approved: { color: 'bg-success/10 text-success border-success/20', icon: CheckCircle2 },
    pending: { color: 'bg-warning/10 text-warning border-warning/20', icon: Clock },
    rejected: { color: 'bg-destructive/10 text-destructive border-destructive/20', icon: XCircle },
  };

  const leaveCards = balance
    ? [
        {
          label: 'Annual Leave',
          icon: Palmtree,
          total: balance.annual_leave_total,
          used: balance.annual_leave_used,
          color: 'text-primary',
          bg: 'bg-primary/10',
        },
        {
          label: 'Sick Leave',
          icon: Stethoscope,
          total: balance.sick_leave_total,
          used: balance.sick_leave_used,
          color: 'text-warning',
          bg: 'bg-warning/10',
        },
        {
          label: 'Family Leave',
          icon: Home,
          total: balance.family_leave_total,
          used: balance.family_leave_used,
          color: 'text-accent',
          bg: 'bg-accent/10',
        },
      ]
    : [];

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-20 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Leave Balances */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              Leave Summary {year}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/leave')}
              className="gap-1"
            >
              Apply Leave <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {balance ? (
            <div className="grid gap-3 sm:grid-cols-3">
              {leaveCards.map((lc) => {
                const remaining = lc.total - lc.used;
                const pct = lc.total > 0 ? (lc.used / lc.total) * 100 : 0;
                return (
                  <div
                    key={lc.label}
                    className={`rounded-lg border p-3 ${lc.bg}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <lc.icon className={`h-4 w-4 ${lc.color}`} />
                      <span className="text-sm font-medium">{lc.label}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{remaining} remaining</span>
                        <span>{lc.used}/{lc.total} used</span>
                      </div>
                      <Progress value={pct} className="h-2" />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No leave allocation found for {year}.{' '}
              <button onClick={() => navigate('/hr')} className="text-primary underline">
                Go to HR to allocate
              </button>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recent Leave Requests */}
      {recentRequests.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              Recent Leave Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentRequests.map((req) => {
                const cfg = statusConfig[req.status] || statusConfig.pending;
                const StatusIcon = cfg.icon;
                return (
                  <div
                    key={req.id}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <StatusIcon className={`h-4 w-4 ${cfg.color.split(' ')[1]}`} />
                      <div>
                        <p className="text-sm font-medium capitalize">
                          {req.leave_type} Leave
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {req.start_date} → {req.end_date} · {req.days_count} day(s)
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className={cfg.color}>
                      {req.status}
                    </Badge>
                  </div>
                );
              })}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-3 text-primary"
              onClick={() => navigate('/hr')}
            >
              View all requests →
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
