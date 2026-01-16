// PROJECT: CanvasFlow Pro
// MODULE: Canvas Column Component

import { Activity } from '@/hooks/useActivities';
import { Project } from '@/hooks/useProjects';
import { ActivityCard } from './ActivityCard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CanvasColumnProps {
  title: string;
  activities: Activity[];
  projects: Project[];
  status: 'todo' | 'doing' | 'finished';
  onAddActivity?: () => void;
  onMoveActivity: (id: string, status: 'todo' | 'doing' | 'finished') => void;
  onEditActivity: (activity: Activity) => void;
  onDeleteActivity: (id: string) => void;
  emptyMessage: string;
  className?: string;
}

export const CanvasColumn = ({
  title,
  activities,
  projects,
  status,
  onAddActivity,
  onMoveActivity,
  onEditActivity,
  onDeleteActivity,
  emptyMessage,
  className,
}: CanvasColumnProps) => {
  const getProjectForActivity = (activity: Activity) => {
    return projects.find(p => p.id === activity.project_id);
  };

  const statusColors = {
    todo: 'border-t-chart-5',
    doing: 'border-t-primary',
    finished: 'border-t-chart-3',
  };

  return (
    <div className={cn(
      'flex flex-col bg-card rounded-lg border shadow-sm overflow-hidden',
      statusColors[status],
      'border-t-4',
      className
    )}>
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">{title}</h3>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {activities.length}
          </span>
        </div>
        {onAddActivity && (
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onAddActivity}>
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="flex-1 p-3 space-y-2 overflow-y-auto min-h-[200px] max-h-[calc(100vh-350px)]">
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            {emptyMessage}
          </p>
        ) : (
          activities.map(activity => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              project={getProjectForActivity(activity)}
              onMove={(newStatus) => onMoveActivity(activity.id, newStatus)}
              onEdit={() => onEditActivity(activity)}
              onDelete={() => onDeleteActivity(activity.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};
