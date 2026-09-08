import { useNavigate } from 'react-router-dom';
import { Bell, FileText, Receipt, UserCog, CheckCircle2, Info, CheckCheck, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useNotifications, timeAgo, type NotificationCategory } from '@/lib/notifications';

const iconFor: Record<NotificationCategory, React.ElementType> = {
  invoice: FileText,
  receipt: Receipt,
  profile: UserCog,
  approval: CheckCircle2,
  general: Info,
};

export const NotificationsMenu = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markRead, markAllRead, clearNotifications } =
    useNotifications();

  const open = (id: string, link: string) => {
    markRead(id);
    navigate(link);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[22rem] p-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <p className="text-sm font-semibold">Notifications</p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs gap-1"
              onClick={markAllRead}
              disabled={unreadCount === 0}
            >
              <CheckCheck className="h-3 w-3" /> Mark all
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs gap-1"
              onClick={clearNotifications}
              disabled={notifications.length === 0}
            >
              <Trash2 className="h-3 w-3" /> Clear
            </Button>
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <Bell className="mx-auto h-8 w-8 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">You're all caught up</p>
          </div>
        ) : (
          <ScrollArea className="max-h-96">
            <ul className="divide-y divide-border">
              {notifications.map((n) => {
                const Icon = iconFor[n.category] ?? Info;
                return (
                  <li key={n.id}>
                    <button
                      onClick={() => open(n.id, n.link)}
                      className={`flex w-full gap-3 px-3 py-3 text-left transition-colors hover:bg-muted/60 ${
                        n.read ? '' : 'bg-primary/5'
                      }`}
                    >
                      <span className="mt-0.5 rounded-full bg-primary/10 p-2 shrink-0">
                        <Icon className="h-4 w-4 text-primary" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium">{n.title}</span>
                          {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                          {n.message}
                        </span>
                        <span className="mt-1 flex items-center justify-between">
                          <span className="text-[11px] text-muted-foreground">
                            {timeAgo(n.createdAt)}
                          </span>
                          <span className="text-[11px] font-medium text-primary">View details →</span>
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
