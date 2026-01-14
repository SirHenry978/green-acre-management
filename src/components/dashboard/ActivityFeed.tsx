import { activities, users, branches, Activity } from '@/data/dummyData';
import { 
  Sprout, 
  Scissors, 
  UtensilsCrossed, 
  Stethoscope, 
  Wrench, 
  DollarSign,
  ShoppingCart 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const activityIcons: Record<Activity['type'], React.ElementType> = {
  planting: Sprout,
  harvesting: Scissors,
  feeding: UtensilsCrossed,
  treatment: Stethoscope,
  maintenance: Wrench,
  sale: DollarSign,
  purchase: ShoppingCart,
};

const activityColors: Record<Activity['type'], string> = {
  planting: 'bg-success/10 text-success',
  harvesting: 'bg-accent/20 text-accent-foreground',
  feeding: 'bg-warning/10 text-warning',
  treatment: 'bg-primary/10 text-primary',
  maintenance: 'bg-muted text-muted-foreground',
  sale: 'bg-success/10 text-success',
  purchase: 'bg-destructive/10 text-destructive',
};

interface ActivityFeedProps {
  branchId?: string;
  limit?: number;
}

export const ActivityFeed = ({ branchId, limit = 5 }: ActivityFeedProps) => {
  const filteredActivities = activities
    .filter(a => !branchId || a.branchId === branchId)
    .slice(0, limit);

  const getStaffName = (staffId: string) => {
    return users.find(u => u.id === staffId)?.name || 'Unknown';
  };

  const getBranchName = (bId: string) => {
    return branches.find(b => b.id === bId)?.name || 'Unknown';
  };

  return (
    <div className="card-farm p-5">
      <h3 className="font-display font-semibold text-lg mb-4">Recent Activities</h3>
      <div className="space-y-4">
        {filteredActivities.map((activity) => {
          const Icon = activityIcons[activity.type];
          const colorClass = activityColors[activity.type];

          return (
            <div key={activity.id} className="flex items-start gap-3 animate-fade-in">
              <div className={cn("rounded-lg p-2", colorClass)}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{activity.description}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span>{getStaffName(activity.staffId)}</span>
                  <span>•</span>
                  <span>{getBranchName(activity.branchId)}</span>
                  <span>•</span>
                  <span>{new Date(activity.date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
