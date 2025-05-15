import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { useQuery } from '@tanstack/react-query';

interface Activity {
  id: number;
  action: string;
  entityType: string;
  details: {
    name: string;
    network?: string;
    action?: string;
  };
  createdAt: string;
}

export function ActivityFeed() {
  const { data: activities = [] } = useQuery<Activity[]>({
    queryKey: ['/api/activities/1'], // Using mock user ID 1
  });

  const getActivityIcon = (action: string, entityType: string) => {
    if (action === 'deploy' && entityType === 'contract') {
      return { icon: 'ri-code-line', bg: 'bg-primary bg-opacity-10 text-primary' };
    } else if (action === 'update' && entityType === 'file') {
      return { icon: 'ri-file-edit-line', bg: 'bg-amber-500 bg-opacity-10 text-amber-500' };
    } else if (action === 'create' && entityType === 'project') {
      return { icon: 'ri-user-add-line', bg: 'bg-green-500 bg-opacity-10 text-green-500' };
    } else if (action === 'create' && entityType === 'token') {
      return { icon: 'ri-coin-line', bg: 'bg-purple-500 bg-opacity-10 text-purple-500' };
    }
    
    return { icon: 'ri-information-line', bg: 'bg-blue-500 bg-opacity-10 text-blue-500' };
  };

  const getActivityText = (activity: Activity) => {
    const { action, entityType, details } = activity;
    
    if (action === 'deploy' && entityType === 'contract') {
      return (
        <p className="text-sm">
          <span className="font-medium">{details.name}</span> contract deployed to{' '}
          <span className="text-green-500">{details.network}</span>
        </p>
      );
    } else if (action === 'update' && entityType === 'file') {
      return (
        <p className="text-sm">
          Updated <span className="font-medium">{details.name}</span>
          {details.action && ` ${details.action}`}
        </p>
      );
    } else if (action === 'create' && entityType === 'project') {
      return (
        <p className="text-sm">
          New project <span className="font-medium">{details.name}</span> created
        </p>
      );
    } else if (action === 'create' && entityType === 'token') {
      return (
        <p className="text-sm">
          Created <span className="font-medium">{details.name}</span> token
        </p>
      );
    }
    
    return (
      <p className="text-sm">
        {action} {entityType} {details.name}
      </p>
    );
  };

  const formatTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  return (
    <Card className="bg-muted rounded-xl border-border overflow-hidden mt-6">
      <CardHeader className="p-4 border-b border-border">
        <CardTitle className="font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      
      <CardContent className="p-4">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No recent activity</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const { icon, bg } = getActivityIcon(activity.action, activity.entityType);
              
              return (
                <div key={activity.id} className="flex items-start">
                  <div className={`w-8 h-8 rounded-full ${bg} flex items-center justify-center flex-shrink-0 mr-3`}>
                    <i className={icon}></i>
                  </div>
                  <div>
                    {getActivityText(activity)}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTime(activity.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
