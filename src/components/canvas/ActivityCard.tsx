// PROJECT: CanvasFlow Pro
// MODULE: Activity Card Component

import { useState } from 'react';
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { RichTextDisplay } from '@/components/ui/rich-text-editor';
import { MoreHorizontal, ArrowRight, Calendar, Clock, AlertTriangle, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { calculateActivityAlarm } from '@/lib/activity-utils';

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
  const [notesOpen, setNotesOpen] = useState(false);
  const hasNotes = activity.notes && activity.notes !== '<p></p>';

  // Use shared alarm calculation (single source of truth)
  const alarmInfo = calculateActivityAlarm(activity);
  const alarmState = alarmInfo.state;
  
  // Calculate days info for display
  const daysInfo = (() => {
    if (alarmState === 'ghost') {
      const startDate = new Date(activity.start_date);
      const today = new Date();
      const daysLate = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      return { label: t.startWarning, days: daysLate };
    }
    
    if (alarmState === 'critical' && alarmInfo.daysOverdue > 0) {
      return { label: t.overdueAlarm, days: alarmInfo.daysOverdue };
    }
    
    return null;
  })();

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
        
        {/* Collapsible Notes Section */}
        {hasNotes && (
          <Collapsible open={notesOpen} onOpenChange={setNotesOpen} className="mt-2">
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground w-full justify-start"
              >
                <FileText className="h-3 w-3 mr-1" />
                {notesOpen ? t.hideNotes : t.showNotes}
                {notesOpen ? <ChevronUp className="h-3 w-3 ml-auto" /> : <ChevronDown className="h-3 w-3 ml-auto" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 pt-2 border-t">
              <RichTextDisplay content={activity.notes || ''} className="text-xs" />
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
};
