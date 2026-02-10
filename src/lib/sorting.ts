// PROJECT: CanvasFlow Pro
// MODULE: Sorting Utilities

import { Activity } from '@/hooks/useActivities';
import { Project } from '@/hooks/useProjects';

/**
 * Sort projects alphabetically (A-Z) by name.
 */
export const sortProjects = (projects: Project[]): Project[] => {
  return [...projects].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  );
};

/**
 * Sort activities by hierarchical priority:
 * 1. Project Name (A-Z), with null project_id ("Privado") sorted alphabetically as "Privado"
 * 2. Start Date (chronological)
 * 3. Title (A-Z) as tie-breaker
 */
export const sortActivities = (activities: Activity[], projects: Project[], privateLabel = 'Privado'): Activity[] => {
  const projectNameMap = new Map<string, string>();
  projects.forEach(p => projectNameMap.set(p.id, p.name));

  return [...activities].sort((a, b) => {
    // 1. By project name (A-Z)
    const nameA = a.project_id ? (projectNameMap.get(a.project_id) || '') : privateLabel;
    const nameB = b.project_id ? (projectNameMap.get(b.project_id) || '') : privateLabel;
    const projectCmp = nameA.localeCompare(nameB, undefined, { sensitivity: 'base' });
    if (projectCmp !== 0) return projectCmp;

    // 2. By start date (chronological)
    const dateA = new Date(a.start_date).getTime();
    const dateB = new Date(b.start_date).getTime();
    if (dateA !== dateB) return dateA - dateB;

    // 3. By title (A-Z)
    return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
  });
};
