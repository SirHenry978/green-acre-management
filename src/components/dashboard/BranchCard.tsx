import { Branch, getFarmTypeIcon } from '@/data/dummyData';
import { MapPin, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface BranchCardProps {
  branch: Branch;
  onClick?: () => void;
}

export const BranchCard = ({ branch, onClick }: BranchCardProps) => {
  const profit = branch.monthlyRevenue - branch.monthlyExpenses;
  const profitMargin = ((profit / branch.monthlyRevenue) * 100).toFixed(1);
  const isPositive = profit > 0;

  return (
    <div
      onClick={onClick}
      className="card-farm p-5 cursor-pointer hover:shadow-farm-lg transition-all duration-200 animate-slide-up"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{getFarmTypeIcon(branch.farmType)}</span>
          <div>
            <h3 className="font-semibold font-display text-lg">{branch.name}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{branch.location}</span>
            </div>
          </div>
        </div>
        <Badge
          variant={branch.status === 'active' ? 'default' : 'secondary'}
          className={cn(
            branch.status === 'active' 
              ? 'bg-success/10 text-success hover:bg-success/20' 
              : 'bg-muted text-muted-foreground'
          )}
        >
          {branch.status}
        </Badge>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>Staff</span>
          </div>
          <span className="font-medium">{branch.totalStaff}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Farm Type</span>
          <span className="font-medium capitalize">{branch.farmType}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Size</span>
          <span className="font-medium">{branch.size}</span>
        </div>

        <div className="border-t border-border pt-3 mt-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Monthly Profit</span>
            <div className={cn(
              "flex items-center gap-1 font-semibold",
              isPositive ? "text-success" : "text-destructive"
            )}>
              {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span>${profit.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground">({profitMargin}%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
