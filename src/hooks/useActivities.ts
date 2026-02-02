// PROJECT: CanvasFlow Pro
// MODULE: Activities Hook

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEffect } from 'react';

export interface Activity {
  id: string;
  project_id: string | null;
  title: string;
  status: 'todo' | 'doing' | 'finished';
  start_date: string;
  duration_days: number | null;
  progress: number | null;
  notes: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const useActivities = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['activities', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as Activity[];
    },
    enabled: !!user,
  });

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('activities-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activities',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['activities'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  const createActivity = useMutation({
    mutationFn: async ({
      title,
      project_id,
      start_date,
      duration_days,
    }: {
      title: string;
      project_id?: string | null;
      start_date?: string;
      duration_days?: number | null;
    }) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('activities')
        .insert({
          title,
          project_id: project_id || null,
          start_date: start_date || new Date().toISOString(),
          duration_days: duration_days || null,
          user_id: user.id,
          status: 'todo',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateActivity = useMutation({
    mutationFn: async ({
      id,
      title,
      project_id,
      status,
      start_date,
      duration_days,
      progress,
      notes,
    }: {
      id: string;
      title?: string;
      project_id?: string | null;
      status?: 'todo' | 'doing' | 'finished';
      start_date?: string;
      duration_days?: number | null;
      progress?: number | null;
      notes?: string | null;
    }) => {
      // If moving to finished, delete the activity (per PRD rule)
      if (status === 'finished') {
        const { error } = await supabase
          .from('activities')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        toast.success(t.deleteMsg);
        return null;
      }

      const updateData: Record<string, unknown> = {};
      if (title !== undefined) updateData.title = title;
      if (project_id !== undefined) updateData.project_id = project_id;
      if (status !== undefined) updateData.status = status;
      if (start_date !== undefined) updateData.start_date = start_date;
      if (duration_days !== undefined) updateData.duration_days = duration_days;
      if (progress !== undefined) updateData.progress = progress;
      if (notes !== undefined) updateData.notes = notes;

      const { data, error } = await supabase
        .from('activities')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteActivity = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });

  // Computed activities by status
  const todoActivities = activities.filter(a => a.status === 'todo');
  const doingActivities = activities.filter(a => a.status === 'doing');

  return {
    activities,
    todoActivities,
    doingActivities,
    isLoading,
    createActivity,
    updateActivity,
    deleteActivity,
  };
};
