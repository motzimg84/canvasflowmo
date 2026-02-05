 // PROJECT: CanvasFlow Pro
 // MODULE: Shared Activity Utility Functions
 // PURPOSE: Single source of truth for alarm states across Canvas and Gantt views
 
 import { addDays, startOfDay, isPast } from 'date-fns';
 import { Activity } from '@/hooks/useActivities';
 
 export type AlarmState = 'critical' | 'ghost' | 'normal';
 
 export interface ActivityAlarmInfo {
   state: AlarmState;
   isOverdue: boolean;
   daysOverdue: number;
   plannedEndDate: Date | null;
   visualEndDate: Date;
 }
 
 /**
  * Calculate the alarm state for an activity.
  * This is the SINGLE SOURCE OF TRUTH for both Canvas cards and Gantt bars.
  * 
  * Rules:
  * - 'critical': Doing activity where current_time > scheduled_end_date
  * - 'ghost': Todo activity where start_date has passed
  * - 'normal': All other cases
  */
 export function calculateActivityAlarm(activity: Activity): ActivityAlarmInfo {
   const today = startOfDay(new Date());
   const startDate = startOfDay(new Date(activity.start_date));
   
   // Calculate planned end date (only if duration is set)
   const plannedEndDate = activity.duration_days
     ? addDays(startDate, activity.duration_days)
     : null;
   
   // Default visual end is today (for auto-growth activities without duration)
   let visualEndDate = plannedEndDate || today;
   let isOverdue = false;
   let daysOverdue = 0;
   let state: AlarmState = 'normal';
   
   if (activity.status === 'doing') {
     // Critical alarm: overdue (planned end date has passed and has duration)
     if (plannedEndDate && isPast(plannedEndDate)) {
       isOverdue = true;
       daysOverdue = Math.floor((today.getTime() - plannedEndDate.getTime()) / (1000 * 60 * 60 * 24));
       visualEndDate = today; // Expand bar to today
       state = 'critical';
     }
   }
   
   if (activity.status === 'todo') {
     // Ghost warning: should have started already
     if (isPast(startDate)) {
       state = 'ghost';
     }
   }
   
   return {
     state,
     isOverdue,
     daysOverdue,
     plannedEndDate,
     visualEndDate,
   };
 }