import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    isPositive: boolean;
  };
  badge?: {
    text: string;
    color: string;
  };
  className?: string;
}

export function StatsCard({ title, value, change, badge, className }: StatsCardProps) {
  return (
    <Card className={cn('bg-muted p-6 rounded-xl border-border', className)}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {badge && (
          <span className={`text-xs px-2 py-1 ${badge.color} rounded-full`}>
            {badge.text}
          </span>
        )}
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold">{value}</span>
        {change && (
          <div className={`flex items-center text-sm ${change.isPositive ? 'text-green-500' : 'text-red-500'}`}>
            <i className={`ri-arrow-${change.isPositive ? 'up' : 'down'}-line mr-1`}></i>
            <span>{change.value}</span>
          </div>
        )}
      </div>
    </Card>
  );
}
