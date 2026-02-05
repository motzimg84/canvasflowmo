// PROJECT: CanvasFlow Pro
// MODULE: Enhanced Gantt Chart Component with Grid Alignment, Scrolling, View Modes & Progress

import { useMemo, useRef, useEffect, useState } from 'react';
import { Activity } from '@/hooks/useActivities';
import { Project } from '@/hooks/useProjects';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { differenceInDays, addDays, format, startOfDay, min, max, startOfWeek, startOfMonth, endOfWeek, endOfMonth, addWeeks, addMonths } from 'date-fns';
import { BarChart3, Calendar, CalendarDays, CalendarRange } from 'lucide-react';
import { cn } from '@/lib/utils';
import { calculateActivityAlarm } from '@/lib/activity-utils';

interface GanttChartProps {
  activities: Activity[];
  projects: Project[];
  onEditActivity?: (activity: Activity) => void;
}

type ViewMode = 'day' | 'week' | 'month';

const COLUMN_WIDTH = {
  day: 40,    // pixels per day
  week: 100,  // pixels per week
  month: 120, // pixels per month
};

const LABEL_WIDTH = 140; // Fixed width for activity labels
const BAR_HEIGHT = 24;   // Height of activity bars
const MIN_BAR_WIDTH_FOR_TEXT = 60; // Minimum width to show text inside bar

export const GanttChart = ({ activities, projects, onEditActivity }: GanttChartProps) => {
  const { t } = useLanguage();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('day');

  // Only show "doing" activities (per PRD)
  const doingActivities = activities.filter(a => a.status === 'doing');

  const { startDate, endDate, totalUnits, columns, todayPosition } = useMemo(() => {
    const today = startOfDay(new Date());
    
    if (doingActivities.length === 0) {
      // Default range: 2 weeks before and after today
      const defaultStart = addDays(today, -14);
      const defaultEnd = addDays(today, 14);
      
      return {
        startDate: defaultStart,
        endDate: defaultEnd,
        totalUnits: 28,
        columns: generateColumns(defaultStart, defaultEnd, viewMode),
        todayPosition: 14 * COLUMN_WIDTH[viewMode],
      };
    }

    // Calculate date range from activities
    const allDates = doingActivities.flatMap(activity => {
      const start = startOfDay(new Date(activity.start_date));
      const plannedEnd = activity.duration_days
        ? addDays(start, activity.duration_days)
        : today;
      const isOverdue = activity.duration_days && today > plannedEnd;
      const visualEnd = isOverdue ? today : plannedEnd;
      return [start, visualEnd];
    });

    const minDate = min([...allDates, today]);
    const maxDate = max([...allDates, addDays(today, 14)]);
    
    // Add padding based on view mode
    let chartStart: Date;
    let chartEnd: Date;
    
    switch (viewMode) {
      case 'week':
        chartStart = startOfWeek(addDays(minDate, -7), { weekStartsOn: 1 });
        chartEnd = endOfWeek(addDays(maxDate, 7), { weekStartsOn: 1 });
        break;
      case 'month':
        chartStart = startOfMonth(addMonths(minDate, -1));
        chartEnd = endOfMonth(addMonths(maxDate, 1));
        break;
      default: // day
        chartStart = addDays(minDate, -7);
        chartEnd = addDays(maxDate, 7);
    }

    const cols = generateColumns(chartStart, chartEnd, viewMode);
    const todayPos = calculatePosition(today, chartStart, viewMode);

    return {
      startDate: chartStart,
      endDate: chartEnd,
      totalUnits: cols.length,
      columns: cols,
      todayPosition: todayPos,
    };
  }, [doingActivities, viewMode]);

  // Generate columns based on view mode
  function generateColumns(start: Date, end: Date, mode: ViewMode): { date: Date; label: string; subLabel?: string }[] {
    const cols: { date: Date; label: string; subLabel?: string }[] = [];
    let current = start;

    while (current <= end) {
      switch (mode) {
        case 'day':
          cols.push({
            date: current,
            label: format(current, 'd'),
            subLabel: format(current, 'EEE'),
          });
          current = addDays(current, 1);
          break;
        case 'week':
          cols.push({
            date: current,
            label: `W${format(current, 'w')}`,
            subLabel: format(current, 'MMM d'),
          });
          current = addWeeks(current, 1);
          break;
        case 'month':
          cols.push({
            date: current,
            label: format(current, 'MMM'),
            subLabel: format(current, 'yyyy'),
          });
          current = addMonths(current, 1);
          break;
      }
    }
    return cols;
  }

  // Calculate pixel position for a date
  function calculatePosition(date: Date, chartStart: Date, mode: ViewMode): number {
    const days = differenceInDays(date, chartStart);
    switch (mode) {
      case 'week':
        return (days / 7) * COLUMN_WIDTH.week;
      case 'month':
        return (days / 30) * COLUMN_WIDTH.month;
      default: // day
        return days * COLUMN_WIDTH.day;
    }
  }

  // Calculate bar width for duration
  function calculateWidth(startDate: Date, endDate: Date, mode: ViewMode): number {
    const days = Math.max(1, differenceInDays(endDate, startDate));
    switch (mode) {
      case 'week':
        return Math.max(COLUMN_WIDTH.week * 0.5, (days / 7) * COLUMN_WIDTH.week);
      case 'month':
        return Math.max(COLUMN_WIDTH.month * 0.5, (days / 30) * COLUMN_WIDTH.month);
      default: // day
        return Math.max(COLUMN_WIDTH.day * 0.8, days * COLUMN_WIDTH.day);
    }
  }

  // Auto-scroll to center "Today" on mount and when view changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const containerWidth = container.clientWidth;
      const scrollTarget = todayPosition - (containerWidth / 2) + LABEL_WIDTH;
      container.scrollLeft = Math.max(0, scrollTarget);
    }
  }, [todayPosition, viewMode]);

  const getProjectColor = (projectId: string | null) => {
    if (!projectId) return 'hsl(var(--muted))';
    const project = projects.find(p => p.id === projectId);
    return project?.color || 'hsl(var(--muted))';
  };

  const totalWidth = columns.length * COLUMN_WIDTH[viewMode];

  // Handle bar click to open edit modal
  const handleBarClick = (activity: Activity) => {
    if (onEditActivity) {
      onEditActivity(activity);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5 text-primary" />
            {t.ganttChart}
          </CardTitle>
          
          {/* View Mode Switcher */}
          <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v as ViewMode)}>
            <ToggleGroupItem value="day" aria-label={t.dayView} className="text-xs px-3">
              <CalendarDays className="h-4 w-4 mr-1" />
              {t.dayView}
            </ToggleGroupItem>
            <ToggleGroupItem value="week" aria-label={t.weekView} className="text-xs px-3">
              <CalendarRange className="h-4 w-4 mr-1" />
              {t.weekView}
            </ToggleGroupItem>
            <ToggleGroupItem value="month" aria-label={t.monthView} className="text-xs px-3">
              <Calendar className="h-4 w-4 mr-1" />
              {t.monthView}
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </CardHeader>
      <CardContent>
        {doingActivities.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-muted-foreground">
            {t.noDoingActivities}
          </div>
        ) : (
          <div className="flex">
            {/* Fixed Labels Column */}
            <div className="flex-shrink-0" style={{ width: LABEL_WIDTH }}>
              {/* Header placeholder */}
              <div className="h-14 border-b border-border" />
              
              {/* Activity labels */}
              <div className="space-y-1 pt-2">
                {doingActivities.map(activity => (
                  <div key={activity.id} className="h-8 flex items-center">
                    <span className="text-sm truncate pr-2 text-foreground font-medium">
                      {activity.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Scrollable Timeline */}
            <ScrollArea 
              className="flex-1 overflow-x-auto" 
              ref={scrollContainerRef}
            >
              <div style={{ width: totalWidth, minWidth: '100%' }}>
                {/* Date Headers */}
                <div className="flex border-b border-border">
                  {columns.map((col, i) => (
                    <div
                      key={i}
                      className="flex-shrink-0 text-center border-r border-border/50"
                      style={{ width: COLUMN_WIDTH[viewMode] }}
                    >
                      <div className="text-xs font-medium text-foreground py-1">
                        {col.label}
                      </div>
                      {col.subLabel && (
                        <div className="text-[10px] text-muted-foreground pb-1">
                          {col.subLabel}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Grid and Bars */}
                <div className="relative">
                  {/* Grid columns */}
                  <div className="absolute inset-0 flex pointer-events-none">
                    {columns.map((col, i) => {
                      const isToday = viewMode === 'day' && 
                        format(col.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                      return (
                        <div
                          key={i}
                          className={cn(
                            "flex-shrink-0 h-full border-r border-border/30",
                            isToday && "bg-primary/5"
                          )}
                          style={{ width: COLUMN_WIDTH[viewMode] }}
                        />
                      );
                    })}
                  </div>

                  {/* Today marker */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-destructive z-20"
                    style={{ left: todayPosition }}
                  >
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-destructive whitespace-nowrap bg-background px-1 rounded">
                      {t.today}
                    </span>
                  </div>

                  {/* Activity Bars */}
                  <div className="relative space-y-1 pt-2">
                    {doingActivities.map(activity => {
                      const activityStart = startOfDay(new Date(activity.start_date));
                      
                      // Use shared alarm calculation (single source of truth with Canvas)
                      const alarmInfo = calculateActivityAlarm(activity);
                      const isOverdue = alarmInfo.isOverdue;
                      const visualEnd = alarmInfo.visualEndDate;
                      
                      const barLeft = calculatePosition(activityStart, startDate, viewMode);
                      const barWidth = calculateWidth(activityStart, visualEnd, viewMode);
                      
                      // Progress calculations
                      const progressPercent = activity.progress || 0;
                      const progressWidth = (progressPercent / 100) * barWidth;
                      
                      // Determine if text fits inside bar
                      const showTextInside = barWidth >= MIN_BAR_WIDTH_FOR_TEXT;
                      
                      return (
                        <div key={activity.id} className="relative h-8">
                          {/* Main bar container */}
                          <div
                            className={cn(
                              'gantt-bar absolute top-1 rounded-md cursor-pointer transition-all hover:ring-2 hover:ring-primary/50 hover:ring-offset-1 overflow-hidden',
                              isOverdue && 'critical-alarm'
                            )}
                            style={{
                              left: barLeft,
                              width: barWidth,
                              height: BAR_HEIGHT,
                              backgroundColor: getProjectColor(activity.project_id),
                            }}
                            onClick={() => handleBarClick(activity)}
                            title={activity.title}
                          >
                            {/* Progress fill */}
                            <div
                              className="absolute inset-y-0 left-0 rounded-l-md transition-all"
                              style={{
                                width: progressWidth,
                                backgroundColor: 'rgba(255, 255, 255, 0.35)',
                              }}
                            />
                            
                            {/* Inner progress bar with darker shade */}
                            <div
                              className="absolute inset-y-1 left-1 rounded transition-all"
                              style={{
                                width: Math.max(0, progressWidth - 8),
                                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                              }}
                            />
                            
                            {/* Progress percentage inside bar */}
                            {showTextInside && (
                              <span className="absolute inset-0 flex items-center px-2 text-xs font-medium text-white truncate z-10">
                                {progressPercent}%
                              </span>
                            )}
                          </div>
                          
                          {/* Activity title outside bar (if bar is too small) */}
                          {!showTextInside && (
                            <span
                              className="absolute top-1 text-xs font-medium text-foreground truncate max-w-[100px]"
                              style={{
                                left: barLeft + barWidth + 4,
                                lineHeight: `${BAR_HEIGHT}px`,
                              }}
                            >
                              {activity.title}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
