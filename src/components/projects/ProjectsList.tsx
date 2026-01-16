// PROJECT: CanvasFlow Pro
// MODULE: Projects List Component

import { useState } from 'react';
import { Project } from '@/hooks/useProjects';
import { useLanguage } from '@/contexts/LanguageContext';
import { ProjectModal } from './ProjectModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Plus, MoreVertical, Folder } from 'lucide-react';

interface ProjectsListProps {
  projects: Project[];
  usedColors: string[];
  onCreateProject: (data: { name: string; color: string }) => void;
  onUpdateProject: (data: { id: string; name: string; color: string }) => void;
  onDeleteProject: (id: string) => void;
}

export const ProjectsList = ({
  projects,
  usedColors,
  onCreateProject,
  onUpdateProject,
  onDeleteProject,
}: ProjectsListProps) => {
  const { t } = useLanguage();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const handleSave = (data: { name: string; color: string }) => {
    if (editingProject) {
      onUpdateProject({ id: editingProject.id, ...data });
    } else {
      onCreateProject(data);
    }
    setEditingProject(null);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setEditingProject(null);
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Folder className="h-5 w-5 text-primary" />
              Projects
            </CardTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => setModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t.noProjects}
            </p>
          ) : (
            <div className="space-y-2">
              {projects.map(project => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    <span className="text-sm font-medium">{project.name}</span>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(project)}>
                        {t.edit}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDeleteProject(project.id)}
                        className="text-destructive"
                      >
                        {t.delete}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ProjectModal
        open={modalOpen}
        onClose={handleClose}
        onSave={handleSave}
        project={editingProject}
        usedColors={usedColors}
      />
    </>
  );
};
