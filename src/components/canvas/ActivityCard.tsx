// PROJECT: CanvasFlow Pro
// MODULE: Activity Card Component

import { useMemo } from 'react';
import { Activity } from '@/hooks/useActivities';
import { Project } from '@/hooks/useProjects';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, ArrowRight, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { format, differenceInDays, addDays, isPast } from 'date-fns';
import { cn } from '@/lib/utils';

interface ActivityCardProps {
  activity: Activity;
  project?: Project;
  onMove: (status: 'todo' | 'doing' | 'finished') => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const ActivityCard = ({
  activity,
  project,
  onMove,
  onEdit,
  onDelete,
}: ActivityCardProps) => {
  const { t } = useLanguage();

  // Calculate alarm states
  const alarmState = useMemo(() => {
    const startDate = new Date(activity.start_date);
    const today = new Date();
    
    if (activity.status === 'doing') {
      // Calculate end date for doing activities
      const endDate = activity.duration_days 
        ? addDays(startDate, activity.duration_days)
        : today;
      
      // Critical alarm: overdue (end date is past)
      if (isPast(endDate) && activity.duration_days) {
        return 'critical';
      }
    }
    
    if (activity.status === 'todo') {
      // Ghost warning: should have started already
      if (isPast(startDate)) {
        return 'ghost';
      }
    }
    
    return 'normal';
  }, [activity]);

  const daysInfo = useMemo(() => {
    const startDate = new Date(activity.start_date);
    const today = new Date();
    
    if (activity.status === 'todo' && isPast(startDate)) {
      const daysLate = differenceInDays(today, startDate);
      return { label: t.startWarning, days: daysLate };
    }
    
    if (activity.status === 'doing' && activity.duration_days) {
      const endDate = addDays(startDate, activity.duration_days);
      if (isPast(endDate)) {
        const daysOverdue = differenceInDays(today, endDate);
        return { label: t.overdueAlarm, days: daysOverdue };
      }
    }
    
    return null;
  }, [activity, t]);

  return (
    <Card
      className={cn(
        'group cursor-pointer transition-all hover:shadow-md',
        alarmState === 'critical' && 'critical-alarm border-destructive',
        alarmState === 'ghost' && 'ghost-warning border-muted-foreground'
      )}
      style={{
        borderLeftWidth: '4px',
        borderLeftColor: project?.color || 'hsl(var(--border))',
      }}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate">{activity.title}</h4>
            {project && (
              <span 
                className="inline-block text-xs px-2 py-0.5 rounded-full mt-1"
                style={{ 
                  backgroundColor: `${project.color}20`,
                  color: project.color,
                }}
              >
                {project.name}
              </span>
            )}
            {!project && (
              <span className="inline-block text-xs px-2 py-0.5 rounded-full mt-1 bg-muted text-muted-foreground">
                {t.privateActivity}
              </span>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                {t.edit}
              </DropdownMenuItem>
              {activity.status !== 'todo' && (
                <DropdownMenuItem onClick={() => onMove('todo')}>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  {t.moveToTodo}
                </DropdownMenuItem>
              )}
              {activity.status !== 'doing' && (
                <DropdownMenuItem onClick={() => onMove('doing')}>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  {t.moveToDoing}
                </DropdownMenuItem>
              )}
              {activity.status !== 'finished' && (
                <DropdownMenuItem onClick={() => onMove('finished')}>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  {t.moveToFinished}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                {t.delete}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {format(new Date(activity.start_date), 'MMM d')}
          </div>
          {activity.duration_days && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {activity.duration_days} {t.daysLabel}
            </div>
          )}
        </div>
        
        {daysInfo && (
          <div className={cn(
            "flex items-center gap-1 mt-2 text-xs font-medium",
            alarmState === 'critical' ? 'text-destructive' : 'text-muted-foreground'
          )}>
            <AlertTriangle className="h-3 w-3" />
            {daysInfo.label} (+{daysInfo.days} {t.daysLabel})
          </div>
        )}
      </CardContent>
    </Card>
  );
};
