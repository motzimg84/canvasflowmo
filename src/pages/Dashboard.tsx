// PROJECT: CanvasFlow Pro
// MODULE: Dashboard Page

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProjects } from '@/hooks/useProjects';
import { useActivities, Activity } from '@/hooks/useActivities';
import { CanvasColumn } from '@/components/canvas/CanvasColumn';
import { ActivityModal } from '@/components/canvas/ActivityModal';
import { GanttChart } from '@/components/gantt/GanttChart';
import { ProjectsList } from '@/components/projects/ProjectsList';
import { AIChatSidebar } from '@/components/chat/AIChatSidebar';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Language, languageNames } from '@/lib/i18n';
import { LogOut, Layers, Globe } from 'lucide-react';
import { getRandomAvailableColor } from '@/lib/colors';

const Dashboard = () => {
  const { signOut, user } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { projects, usedColors, createProject, updateProject, deleteProject } = useProjects();
  const { todoActivities, doingActivities, activities, createActivity, updateActivity, deleteActivity } = useActivities();
  
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  const handleMoveActivity = (id: string, status: 'todo' | 'doing' | 'finished') => {
    updateActivity.mutate({ id, status });
  };

  const handleSaveActivity = (data: { title: string; project_id: string | null; start_date: string; duration_days: number | null }) => {
    if (editingActivity) {
      updateActivity.mutate({ id: editingActivity.id, ...data });
    } else {
      createActivity.mutate(data);
    }
    setEditingActivity(null);
  };

  // AI-triggered project creation with auto-color
  const handleAICreateProject = (name: string) => {
    const color = getRandomAvailableColor(usedColors) || '#4A90D9';
    createProject.mutate({ name, color });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">{t.appName}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
              <SelectTrigger className="w-32">
                <Globe className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(languageNames) as Language[]).map(lang => (
                  <SelectItem key={lang} value={lang}>{languageNames[lang]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="ghost" size="icon" onClick={() => signOut()}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <ProjectsList
              projects={projects}
              usedColors={usedColors}
              onCreateProject={(data) => createProject.mutate(data)}
              onUpdateProject={(data) => updateProject.mutate(data)}
              onDeleteProject={(id) => deleteProject.mutate(id)}
            />
          </div>

          {/* Canvas */}
          <div className="lg:col-span-3 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CanvasColumn
                title={t.todo}
                status="todo"
                activities={todoActivities}
                projects={projects}
                onAddActivity={() => setActivityModalOpen(true)}
                onMoveActivity={handleMoveActivity}
                onEditActivity={(a) => { setEditingActivity(a); setActivityModalOpen(true); }}
                onDeleteActivity={(id) => deleteActivity.mutate(id)}
                emptyMessage={t.noActivities}
              />
              <CanvasColumn
                title={t.doing}
                status="doing"
                activities={doingActivities}
                projects={projects}
                onMoveActivity={handleMoveActivity}
                onEditActivity={(a) => { setEditingActivity(a); setActivityModalOpen(true); }}
                onDeleteActivity={(id) => deleteActivity.mutate(id)}
                emptyMessage={t.noActivities}
              />
            </div>

            {/* Gantt */}
            <GanttChart activities={activities} projects={projects} />
          </div>
        </div>
      </main>

      <ActivityModal
        open={activityModalOpen}
        onClose={() => { setActivityModalOpen(false); setEditingActivity(null); }}
        onSave={handleSaveActivity}
        activity={editingActivity}
        projects={projects}
      />

      {/* AI Chat Sidebar */}
      <AIChatSidebar
        projects={projects}
        activities={activities}
        onCreateProject={handleAICreateProject}
        onMoveActivity={handleMoveActivity}
      />
    </div>
  );
};

export default Dashboard;
