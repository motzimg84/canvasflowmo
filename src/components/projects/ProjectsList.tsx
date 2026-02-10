// PROJECT: CanvasFlow Pro
// MODULE: Projects List Component

import { useState } from 'react';
import { Project } from '@/hooks/useProjects';
import { useLanguage } from '@/contexts/LanguageContext';
import { ProjectModal } from './ProjectModal';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Plus, MoreVertical, Folder, Lock, X } from 'lucide-react';

export const PRIVATE_PROJECT_ID = '__private__';

interface ProjectsListProps {
  projects: Project[];
  usedColors: string[];
  activeProjectIds: Set<string>;
  onToggleProject: (projectId: string) => void;
  onClearFilters: () => void;
  onCreateProject: (data: { name: string; color: string }) => void;
  onUpdateProject: (data: { id: string; name: string; color: string }) => void;
  onDeleteProject: (id: string) => void;
}

export const ProjectsList = ({
  projects,
  usedColors,
  activeProjectIds,
  onToggleProject,
  onClearFilters,
  onCreateProject,
  onUpdateProject,
  onDeleteProject,
}: ProjectsListProps) => {
  const { t } = useLanguage();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

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

  const filterCount = activeProjectIds.size;

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Folder className="h-5 w-5 text-primary" />
              Projects
              {filterCount > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {t.projectsSelected.replace('{count}', String(filterCount))}
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-1">
              {filterCount > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={onClearFilters}
                  title={t.clearFilters}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => setModalOpen(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {/* Build a merged list: Privado + user projects, sorted alphabetically */}
            {(() => {
              const privateEntry = {
                id: PRIVATE_PROJECT_ID,
                name: t.privateActivity,
                color: '',
                isPrivate: true,
              };
              const allEntries = [
                privateEntry,
                ...projects.map(p => ({ id: p.id, name: p.name, color: p.color, isPrivate: false })),
              ].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

              return allEntries.map(entry => {
                const isActive = activeProjectIds.has(entry.id);

                if (entry.isPrivate) {
                  return (
                    <div
                      key={entry.id}
                      onClick={() => onToggleProject(PRIVATE_PROJECT_ID)}
                      className={`flex items-center justify-between p-2 rounded-md transition-colors group cursor-pointer ${
                        isActive
                          ? 'bg-primary/10 border-l-2 border-primary'
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={isActive}
                          onCheckedChange={() => onToggleProject(PRIVATE_PROJECT_ID)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Lock className="h-3 w-3 text-muted-foreground" />
                        <span className={`text-sm font-medium ${isActive ? 'text-primary' : ''}`}>
                          {t.privateActivity}
                        </span>
                      </div>
                    </div>
                  );
                }

                const project = projects.find(p => p.id === entry.id)!;
                return (
                  <div
                    key={project.id}
                    onClick={() => onToggleProject(project.id)}
                    className={`flex items-center justify-between p-2 rounded-md transition-colors group cursor-pointer ${
                      isActive
                        ? 'bg-primary/10 border-l-2 border-primary'
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={isActive}
                        onCheckedChange={() => onToggleProject(project.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: project.color }}
                      />
                      <span className={`text-sm font-medium ${isActive ? 'text-primary' : ''}`}>
                        {project.name}
                      </span>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(project); }}>
                          {t.edit}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => { e.stopPropagation(); setDeleteTarget(project); }}
                          className="text-destructive"
                        >
                          {t.delete}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              });
            })()}

            {projects.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-2">
                {t.noProjects}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <ProjectModal
        open={modalOpen}
        onClose={handleClose}
        onSave={handleSave}
        project={editingProject}
        usedColors={usedColors}
      />

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        onConfirm={() => {
          if (deleteTarget) {
            onDeleteProject(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        itemName={deleteTarget?.name}
      />
    </>
  );
};
