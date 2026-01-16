// PROJECT: CanvasFlow Pro
// MODULE: Gantt Chart Component

import { useMemo } from 'react';
import { Activity } from '@/hooks/useActivities';
import { Project } from '@/hooks/useProjects';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { differenceInDays, addDays, format, startOfDay, min, max } from 'date-fns';
import { BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GanttChartProps {
  activities: Activity[];
  projects: Project[];
}

export const GanttChart = ({ activities, projects }: GanttChartProps) => {
  const { t } = useLanguage();

  // Only show "doing" activities (per PRD)
  const doingActivities = activities.filter(a => a.status === 'doing');

  const { startDate, endDate, totalDays, todayOffset } = useMemo(() => {
    if (doingActivities.length === 0) {
      const today = startOfDay(new Date());
      return {
        startDate: today,
        endDate: addDays(today, 14),
        totalDays: 14,
        todayOffset: 0,
      };
    }

    const today = startOfDay(new Date());
    
    // Calculate date range from activities
    const allDates = doingActivities.flatMap(activity => {
      const start = startOfDay(new Date(activity.start_date));
      // Auto-growth rule: if no duration, end = today
      const end = activity.duration_days 
        ? addDays(start, activity.duration_days)
        : today;
      return [start, end];
    });

    const minDate = min([...allDates, today]);
    const maxDate = max([...allDates, addDays(today, 7)]);
    
    // Add padding
    const chartStart = addDays(minDate, -2);
    const chartEnd = addDays(maxDate, 2);
    const days = differenceInDays(chartEnd, chartStart);
    const todayPos = differenceInDays(today, chartStart);

    return {
      startDate: chartStart,
      endDate: chartEnd,
      totalDays: days,
      todayOffset: (todayPos / days) * 100,
    };
  }, [doingActivities]);

  const getProjectColor = (projectId: string | null) => {
    if (!projectId) return 'hsl(var(--muted))';
    const project = projects.find(p => p.id === projectId);
    return project?.color || 'hsl(var(--muted))';
  };

  const getProjectName = (projectId: string | null) => {
    if (!projectId) return t.privateActivity;
    const project = projects.find(p => p.id === projectId);
    return project?.name || t.privateActivity;
  };

  // Generate date headers
  const dateHeaders = useMemo(() => {
    const headers = [];
    for (let i = 0; i <= totalDays; i += Math.max(1, Math.floor(totalDays / 10))) {
      const date = addDays(startDate, i);
      headers.push({
        date,
        offset: (i / totalDays) * 100,
      });
    }
    return headers;
  }, [startDate, totalDays]);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="h-5 w-5 text-primary" />
          {t.ganttChart}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {doingActivities.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-muted-foreground">
            {t.noDoingActivities}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Date header */}
            <div className="relative h-8 border-b border-border">
              {dateHeaders.map(({ date, offset }, i) => (
                <div
                  key={i}
                  className="absolute top-0 text-xs text-muted-foreground"
                  style={{ left: `${offset}%`, transform: 'translateX(-50%)' }}
                >
                  {format(date, 'MMM d')}
                </div>
              ))}
            </div>

            {/* Gantt bars */}
            <div className="relative space-y-3">
              {/* Today marker */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-destructive z-10"
                style={{ left: `${todayOffset}%` }}
              >
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-medium text-destructive whitespace-nowrap">
                  {t.today}
                </span>
              </div>

              {doingActivities.map(activity => {
                const activityStart = startOfDay(new Date(activity.start_date));
                const today = startOfDay(new Date());
                
                // Auto-growth: if no duration, end = today
                const activityEnd = activity.duration_days
                  ? addDays(activityStart, activity.duration_days)
                  : today;
                
                const startOffset = Math.max(0, (differenceInDays(activityStart, startDate) / totalDays) * 100);
                const width = Math.max(5, (differenceInDays(activityEnd, activityStart) / totalDays) * 100);
                
                const isOverdue = activity.duration_days && today > activityEnd;
                
                return (
                  <div key={activity.id} className="relative h-10">
                    <div className="flex items-center h-full">
                      <span className="w-32 text-sm truncate pr-2 text-foreground">
                        {activity.title}
                      </span>
                      <div className="flex-1 relative h-7 bg-muted/30 rounded">
                        <div
                          className={cn(
                            'gantt-bar absolute h-full rounded flex items-center px-2 text-xs font-medium',
                            isOverdue && 'critical-alarm'
                          )}
                          style={{
                            left: `${startOffset}%`,
                            width: `${Math.min(width, 100 - startOffset)}%`,
                            backgroundColor: getProjectColor(activity.project_id),
                            color: '#fff',
                          }}
                        >
                          <span className="truncate opacity-90">
                            {getProjectName(activity.project_id)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
