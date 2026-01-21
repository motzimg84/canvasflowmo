// PROJECT: CanvasFlow Pro
// MODULE: Activity Creation/Edit Modal

import { useState, useEffect } from 'react';
import { Activity } from '@/hooks/useActivities';
import { Project } from '@/hooks/useProjects';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';

interface ActivityModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    title: string;
    project_id: string | null;
    start_date: string;
    duration_days: number | null;
    progress: number | null;
  }) => void;
  activity?: Activity | null;
  projects: Project[];
}

export const ActivityModal = ({
  open,
  onClose,
  onSave,
  activity,
  projects,
}: ActivityModalProps) => {
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState<string>('none');
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [durationDays, setDurationDays] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    if (activity) {
      setTitle(activity.title);
      setProjectId(activity.project_id || 'none');
      setStartDate(format(new Date(activity.start_date), 'yyyy-MM-dd'));
      setDurationDays(activity.duration_days?.toString() || '');
      setProgress(activity.progress || 0);
    } else {
      setTitle('');
      setProjectId('none');
      setStartDate(format(new Date(), 'yyyy-MM-dd'));
      setDurationDays('');
      setProgress(0);
    }
  }, [activity, open]);

  const handleSave = () => {
    if (!title.trim()) return;
    
    onSave({
      title: title.trim(),
      project_id: projectId === 'none' ? null : projectId,
      start_date: new Date(startDate).toISOString(),
      duration_days: durationDays ? parseInt(durationDays) : null,
      progress: progress,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {activity ? t.edit : t.addActivity}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t.activityTitle}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.activityTitle}
            />
          </div>
          
          <div className="space-y-2">
            <Label>{t.projectName}</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger>
                <SelectValue placeholder={t.projectName} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t.privateActivity}</SelectItem>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: project.color }}
                      />
                      {project.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">{t.startDate}</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration">{t.duration} ({t.daysLabel})</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                placeholder="∞"
              />
            </div>
          </div>

          {/* Progress Field */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>{t.progress}</Label>
              <span className="text-sm font-medium text-muted-foreground">{progress}%</span>
            </div>
            <Slider
              value={[progress]}
              onValueChange={(value) => setProgress(value[0])}
              max={100}
              step={5}
              className="w-full"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t.cancel}
          </Button>
          <Button onClick={handleSave} disabled={!title.trim()}>
            {t.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
