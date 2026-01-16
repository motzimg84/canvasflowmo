// PROJECT: CanvasFlow Pro
// MODULE: Project Creation/Edit Modal

import { useState, useEffect } from 'react';
import { Project } from '@/hooks/useProjects';
import { useLanguage } from '@/contexts/LanguageContext';
import { getAvailableColors, projectColors } from '@/lib/colors';
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
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { name: string; color: string }) => void;
  project?: Project | null;
  usedColors: string[];
}

export const ProjectModal = ({
  open,
  onClose,
  onSave,
  project,
  usedColors,
}: ProjectModalProps) => {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  const availableColors = getAvailableColors(
    project ? usedColors.filter(c => c !== project.color) : usedColors
  );

  useEffect(() => {
    if (project) {
      setName(project.name);
      setSelectedColor(project.color);
    } else {
      setName('');
      setSelectedColor(availableColors[0]?.value || '');
    }
  }, [project, open, availableColors]);

  const handleSave = () => {
    if (!name.trim() || !selectedColor) return;
    onSave({ name: name.trim(), color: selectedColor });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {project ? t.edit : t.addProject}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="projectName">{t.projectName}</Label>
            <Input
              id="projectName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.projectName}
            />
          </div>
          
          <div className="space-y-2">
            <Label>{t.selectColor}</Label>
            <div className="grid grid-cols-6 gap-2">
              {projectColors.map(color => {
                const isUsed = usedColors.includes(color.value) && color.value !== project?.color;
                const isSelected = selectedColor === color.value;
                
                return (
                  <button
                    key={color.value}
                    onClick={() => !isUsed && setSelectedColor(color.value)}
                    disabled={isUsed}
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center transition-all',
                      isUsed && 'opacity-30 cursor-not-allowed',
                      isSelected && 'ring-2 ring-offset-2 ring-foreground',
                      !isUsed && !isSelected && 'hover:scale-110'
                    )}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  >
                    {isSelected && <Check className="h-4 w-4 text-white" />}
                  </button>
                );
              })}
            </div>
            {availableColors.length === 0 && !project && (
              <p className="text-sm text-muted-foreground">
                All colors are in use
              </p>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t.cancel}
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!name.trim() || !selectedColor}
          >
            {t.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
