// PROJECT: CanvasFlow Pro
// MODULE: Enhanced Gantt Chart Component with Fullscreen, Mobile, Responsive

import { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import { Activity } from '@/hooks/useActivities';
import { Project } from '@/hooks/useProjects';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { differenceInDays, addDays, format, startOfDay, min, max, startOfWeek, startOfMonth, endOfWeek, endOfMonth, addWeeks, addMonths } from 'date-fns';
import { BarChart3, Calendar, CalendarDays, CalendarRange, Maximize2, Minimize2, Crosshair } from 'lucide-react';
import { cn } from '@/lib/utils';
import { calculateActivityAlarm } from '@/lib/activity-utils';

interface GanttChartProps {
  activities: Activity[];
  projects: Project[];
  onEditActivity?: (activity: Activity) => void;
}

type ViewMode = 'day' | 'week' | 'month';

const COLUMN_WIDTH = { day: 40, week: 100, month: 120 };
const LABEL_WIDTH = 140;
const BAR_HEIGHT = 24;
const MIN_BAR_WIDTH_FOR_TEXT = 60;

// --- Helper functions (pure, no hooks) ---

function generateColumns(start: Date, end: Date, mode: ViewMode) {
  const cols: { date: Date; label: string; subLabel?: string }[] = [];
  let current = start;
  while (current <= end) {
    switch (mode) {
      case 'day':
        cols.push({ date: current, label: format(current, 'd'), subLabel: format(current, 'EEE') });
        current = addDays(current, 1);
        break;
      case 'week':
        cols.push({ date: current, label: `W${format(current, 'w')}`, subLabel: format(current, 'MMM d') });
        current = addWeeks(current, 1);
        break;
      case 'month':
        cols.push({ date: current, label: format(current, 'MMM'), subLabel: format(current, 'yyyy') });
        current = addMonths(current, 1);
        break;
    }
  }
  return cols;
}

function calculatePosition(date: Date, chartStart: Date, mode: ViewMode): number {
  const days = differenceInDays(date, chartStart);
  switch (mode) {
    case 'week': return (days / 7) * COLUMN_WIDTH.week;
    case 'month': return (days / 30) * COLUMN_WIDTH.month;
    default: return days * COLUMN_WIDTH.day;
  }
}

function calculateWidth(start: Date, end: Date, mode: ViewMode): number {
  const days = Math.max(1, differenceInDays(end, start));
  switch (mode) {
    case 'week': return Math.max(COLUMN_WIDTH.week * 0.5, (days / 7) * COLUMN_WIDTH.week);
    case 'month': return Math.max(COLUMN_WIDTH.month * 0.5, (days / 30) * COLUMN_WIDTH.month);
    default: return Math.max(COLUMN_WIDTH.day * 0.8, days * COLUMN_WIDTH.day);
  }
}

// --- Component ---

export const GanttChart = ({ activities, projects, onEditActivity }: GanttChartProps) => {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const doingActivities = activities.filter(a => a.status === 'doing');

  const { startDate, columns, todayPosition } = useMemo(() => {
    const today = startOfDay(new Date());

    if (doingActivities.length === 0) {
      const defaultStart = addDays(today, -14);
      const defaultEnd = addDays(today, 14);
      return {
        startDate: defaultStart,
        columns: generateColumns(defaultStart, defaultEnd, viewMode),
        todayPosition: 14 * COLUMN_WIDTH[viewMode],
      };
    }

    const allDates = doingActivities.flatMap(activity => {
      const start = startOfDay(new Date(activity.start_date));
      const plannedEnd = activity.duration_days ? addDays(start, activity.duration_days) : today;
      const visualEnd = (activity.duration_days && today > plannedEnd) ? today : plannedEnd;
      return [start, visualEnd];
    });

    const minDate = min([...allDates, today]);
    const maxDate = max([...allDates, addDays(today, 14)]);

    let chartStart: Date, chartEnd: Date;
    switch (viewMode) {
      case 'week':
        chartStart = startOfWeek(addDays(minDate, -7), { weekStartsOn: 1 });
        chartEnd = endOfWeek(addDays(maxDate, 7), { weekStartsOn: 1 });
        break;
      case 'month':
        chartStart = startOfMonth(addMonths(minDate, -1));
        chartEnd = endOfMonth(addMonths(maxDate, 1));
        break;
      default:
        chartStart = addDays(minDate, -7);
        chartEnd = addDays(maxDate, 7);
    }

    return {
      startDate: chartStart,
      columns: generateColumns(chartStart, chartEnd, viewMode),
      todayPosition: calculatePosition(today, chartStart, viewMode),
    };
  }, [doingActivities, viewMode]);

  // Smooth scroll to center today - find the actual scrollable viewport inside ScrollArea
  const scrollToToday = useCallback((smooth = true) => {
    const scrollEl = scrollContainerRef.current;
    if (!scrollEl) return;
    // Radix ScrollArea renders the scrollable viewport as a child div
    const viewport = scrollEl.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement | null;
    const target = viewport || scrollEl;
    const containerWidth = target.clientWidth;
    const scrollTarget = todayPosition - (containerWidth / 2);
    target.scrollTo({
      left: Math.max(0, scrollTarget),
      behavior: smooth ? 'smooth' : 'auto',
    });
  }, [todayPosition]);

  // Auto-scroll on mount and view change
  useEffect(() => {
    scrollToToday(false);
  }, [scrollToToday, viewMode]);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!chartContainerRef.current) return;
    if (!isFullscreen) {
      chartContainerRef.current.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }, [isFullscreen]);

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Re-center after fullscreen change
  useEffect(() => {
    const timer = setTimeout(() => scrollToToday(true), 150);
    return () => clearTimeout(timer);
  }, [isFullscreen, scrollToToday]);

  const getProjectColor = (projectId: string | null) => {
    if (!projectId) return 'hsl(var(--muted))';
    const project = projects.find(p => p.id === projectId);
    return project?.color || 'hsl(var(--muted))';
  };

  const totalWidth = columns.length * COLUMN_WIDTH[viewMode];

  return (
    <TooltipProvider>
      <div
        ref={chartContainerRef}
        className={cn(
          'transition-all duration-300',
          isFullscreen && 'bg-background p-4 flex flex-col h-screen'
        )}
      >
        <Card className={cn('h-full', isFullscreen && 'flex-1 flex flex-col')}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5 text-primary" />
                {t.ganttChart}
              </CardTitle>

              <div className="flex items-center gap-1 flex-wrap">
                {/* Center on Today */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => scrollToToday(true)}>
                      <Crosshair className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t.centerToday}</TooltipContent>
                </Tooltip>

                {/* Fullscreen toggle */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={toggleFullscreen}>
                      {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{isFullscreen ? t.exitFullscreen : t.fullscreen}</TooltipContent>
                </Tooltip>

                {/* View Mode Switcher */}
                <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v as ViewMode)}>
                  <ToggleGroupItem value="day" aria-label={t.dayView} className="text-xs px-3">
                    <CalendarDays className="h-4 w-4 mr-1" />
                    {!isMobile && t.dayView}
                  </ToggleGroupItem>
                  <ToggleGroupItem value="week" aria-label={t.weekView} className="text-xs px-3">
                    <CalendarRange className="h-4 w-4 mr-1" />
                    {!isMobile && t.weekView}
                  </ToggleGroupItem>
                  <ToggleGroupItem value="month" aria-label={t.monthView} className="text-xs px-3">
                    <Calendar className="h-4 w-4 mr-1" />
                    {!isMobile && t.monthView}
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>
          </CardHeader>

          <CardContent className={cn(isFullscreen && 'flex-1 overflow-hidden')}>
            {doingActivities.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-muted-foreground">
                {t.noDoingActivities}
              </div>
            ) : (
              <div className="flex" style={isFullscreen ? { height: 'calc(100% - 2rem)' } : undefined}>
                {/* Fixed Labels Column */}
                <div className="flex-shrink-0" style={{ width: LABEL_WIDTH }}>
                  <div className="h-14 border-b border-border" />
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
                  className={cn('flex-1 overflow-x-auto', isFullscreen && 'h-full')}
                  ref={scrollContainerRef}
                  style={{ touchAction: 'pan-x pan-y pinch-zoom' }}
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
                          <div className="text-xs font-medium text-foreground py-1">{col.label}</div>
                          {col.subLabel && (
                            <div className="text-[10px] text-muted-foreground pb-1">{col.subLabel}</div>
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
                          const alarmInfo = calculateActivityAlarm(activity);
                          const isOverdue = alarmInfo.isOverdue;
                          const daysOverdue = alarmInfo.daysOverdue;
                          const visualEnd = alarmInfo.visualEndDate;

                          const barLeft = calculatePosition(activityStart, startDate, viewMode);
                          const barWidth = calculateWidth(activityStart, visualEnd, viewMode);
                          const progressPercent = activity.progress || 0;
                          const progressWidth = (progressPercent / 100) * barWidth;
                          const showTextInside = barWidth >= MIN_BAR_WIDTH_FOR_TEXT;

                          const barElement = (
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
                              onClick={() => onEditActivity?.(activity)}
                            >
                              <div
                                className="absolute inset-y-0 left-0 rounded-l-md transition-all"
                                style={{ width: progressWidth, backgroundColor: 'rgba(255, 255, 255, 0.35)' }}
                              />
                              <div
                                className="absolute inset-y-1 left-1 rounded transition-all"
                                style={{ width: Math.max(0, progressWidth - 8), backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
                              />
                              {showTextInside && (
                                <span className="absolute inset-0 flex items-center px-2 text-xs font-medium text-white truncate z-10">
                                  {progressPercent}%
                                </span>
                              )}
                            </div>
                          );

                          return (
                            <div key={activity.id} className="relative h-8">
                              <Tooltip>
                                <TooltipTrigger asChild>{barElement}</TooltipTrigger>
                                <TooltipContent
                                  side="top"
                                  className={cn(isOverdue && 'bg-destructive text-destructive-foreground border-destructive')}
                                >
                                  <p className="font-medium">{activity.title}</p>
                                  {isOverdue && (
                                    <p className="text-sm">{t.daysOverdue.replace('{count}', String(daysOverdue))}</p>
                                  )}
                                </TooltipContent>
                              </Tooltip>

                              {!showTextInside && (
                                <span
                                  className="absolute top-1 text-xs font-medium text-foreground truncate max-w-[100px]"
                                  style={{ left: barLeft + barWidth + 4, lineHeight: `${BAR_HEIGHT}px` }}
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
      </div>
    </TooltipProvider>
  );
};
