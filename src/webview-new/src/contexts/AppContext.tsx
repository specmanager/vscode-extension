import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project, Spec, Task } from '../types';
import { mockProjects } from '../data/mockData';

interface AppContextType {
  projects: Project[];
  selectedProject: Project | null;
  selectedSpec: Spec | null;
  selectProject: (projectId: string) => void;
  selectSpec: (specId: string) => void;
  updateTaskProgress: (taskId: string, progress: number, status: Task['status']) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedSpec, setSelectedSpec] = useState<Spec | null>(null);

  useEffect(() => {
    if (projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0]);
      if (projects[0].specs.length > 0) {
        setSelectedSpec(projects[0].specs[0]);
      }
    }
  }, [projects, selectedProject]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProjects(prev => {
        return prev.map(project => ({
          ...project,
          specs: project.specs.map(spec => ({
            ...spec,
            tasks: spec.tasks.map(task => {
              if (task.status === 'running' && task.progress < 100) {
                const increment = Math.random() * 5;
                const newProgress = Math.min(task.progress + increment, 100);
                return {
                  ...task,
                  progress: newProgress,
                  status: newProgress >= 100 ? 'completed' : 'running',
                  updatedAt: new Date().toISOString(),
                };
              }
              return task;
            }),
          })),
        }));
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const selectProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setSelectedProject(project);
      if (project.specs.length > 0) {
        setSelectedSpec(project.specs[0]);
      } else {
        setSelectedSpec(null);
      }
    }
  };

  const selectSpec = (specId: string) => {
    if (!selectedProject) return;
    const spec = selectedProject.specs.find(s => s.id === specId);
    if (spec) {
      setSelectedSpec(spec);
    }
  };

  const updateTaskProgress = (taskId: string, progress: number, status: Task['status']) => {
    setProjects(prev => {
      return prev.map(project => ({
        ...project,
        specs: project.specs.map(spec => ({
          ...spec,
          tasks: spec.tasks.map(task =>
            task.id === taskId
              ? { ...task, progress, status, updatedAt: new Date().toISOString() }
              : task
          ),
        })),
      }));
    });
  };

  useEffect(() => {
    if (selectedProject && selectedSpec) {
      const updatedProject = projects.find(p => p.id === selectedProject.id);
      if (updatedProject) {
        setSelectedProject(updatedProject);
        const updatedSpec = updatedProject.specs.find(s => s.id === selectedSpec.id);
        if (updatedSpec) {
          setSelectedSpec(updatedSpec);
        }
      }
    }
  }, [projects, selectedProject, selectedSpec]);

  return (
    <AppContext.Provider
      value={{
        projects,
        selectedProject,
        selectedSpec,
        selectProject,
        selectSpec,
        updateTaskProgress,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
