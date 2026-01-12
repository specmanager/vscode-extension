import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { vscodeApi, type Project, type User, type Spec, type Task, type Approval } from '@/lib/vscode-api';
import { cn } from '@/lib/utils';
import { Header } from '@/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ProjectDetailsTab } from '@/components/tabs/ProjectDetailsTab';
import { SpecsTab } from '@/components/tabs/SpecsTab';
import { TasksTab } from '@/components/tabs/TasksTab';
import { LogsTab } from '@/components/tabs/LogsTab';
import { ApprovalsTab } from '@/components/tabs/ApprovalsTab';
import {
  FileText,
  BookOpen,
  CheckSquare,
  ScrollText,
  AlertCircle,
} from 'lucide-react';

interface MainAppProps {
  user: User;
  onLogout: () => void;
}

export function MainApp({ user, onLogout }: MainAppProps) {
  const { t } = useTranslation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [specs, setSpecs] = useState<Spec[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [activeTab, setActiveTab] = useState('details');
  const [notification, setNotification] = useState<{
    message: string;
    level: 'info' | 'success' | 'error';
  } | null>(null);

  // Subscribe to messages
  useEffect(() => {
    const unsubscribes = [
      vscodeApi.onMessage('projects-updated', (msg) => {
        setProjects(msg.data || []);
      }),
      vscodeApi.onMessage('project-selected', (msg) => {
        setSelectedProjectId(msg.data.projectId);
      }),
      vscodeApi.onMessage('project-details-updated', (msg) => {
        setSelectedProject(msg.data);
      }),
      vscodeApi.onMessage('specs-updated', (msg) => {
        setSpecs(msg.data || []);
      }),
      vscodeApi.onMessage('tasks-updated', (msg) => {
        setTasks(msg.data || []);
      }),
      vscodeApi.onMessage('approvals-updated', (msg) => {
        setApprovals(msg.data || []);
      }),
      vscodeApi.onMessage('task-started', () => {
        // Refresh tasks
        if (selectedProjectId) {
          vscodeApi.getTasks(selectedProjectId);
        }
      }),
      vscodeApi.onMessage('task-completed', () => {
        // Refresh tasks
        if (selectedProjectId) {
          vscodeApi.getTasks(selectedProjectId);
        }
      }),
      vscodeApi.onMessage('approval-created', () => {
        // Refresh approvals
        if (selectedProjectId) {
          vscodeApi.getApprovals(selectedProjectId);
        }
      }),
      vscodeApi.onMessage('notification', (msg) => {
        setNotification(msg.data);
        setTimeout(() => setNotification(null), 3000);
      }),
      vscodeApi.onMessage('error', (msg) => {
        setNotification({ message: msg.data.message, level: 'error' });
        setTimeout(() => setNotification(null), 5000);
      }),
    ];

    // Initial data load
    vscodeApi.getProjects();

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, []);

  // Load project data when selected
  useEffect(() => {
    if (selectedProjectId) {
      vscodeApi.getProjectDetails(selectedProjectId);
      vscodeApi.getSpecs(selectedProjectId);
      vscodeApi.getTasks(selectedProjectId);
      vscodeApi.getApprovals(selectedProjectId);
    }
  }, [selectedProjectId]);

  const handleProjectChange = (projectId: string) => {
    vscodeApi.selectProject(projectId);
  };

  const pendingApprovalsCount = approvals.filter((a) => a.status === 'pending').length;

  return (
    <div className="sidebar-root">
      {/* Notification Banner */}
      {notification && (
        <div
          className={cn(
            'p-2 rounded text-xs font-medium mb-2',
            notification.level === 'success' && 'bg-green-100 text-green-800 border border-green-200',
            notification.level === 'error' && 'bg-red-100 text-red-800 border border-red-200',
            notification.level === 'info' && 'bg-blue-100 text-blue-800 border border-blue-200'
          )}
        >
          <div className="flex items-center justify-between">
            <span>{notification.message}</span>
            <button
              type="button"
              onClick={() => setNotification(null)}
              className="ml-2 hover:opacity-70"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <Header
        user={user}
        projects={projects}
        selectedProjectId={selectedProjectId}
        onProjectChange={handleProjectChange}
        onLogout={onLogout}
      />

      {/* Content */}
      {selectedProjectId ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col mt-3">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="details" className="text-xs" title={t('tabs.details')}>
              <FileText className="h-3 w-3" />
            </TabsTrigger>
            <TabsTrigger value="specs" className="text-xs" title={t('tabs.specs')}>
              <BookOpen className="h-3 w-3" />
            </TabsTrigger>
            <TabsTrigger value="tasks" className="text-xs" title={t('tabs.tasks')}>
              <CheckSquare className="h-3 w-3" />
            </TabsTrigger>
            <TabsTrigger value="logs" className="text-xs" title={t('tabs.logs')}>
              <ScrollText className="h-3 w-3" />
            </TabsTrigger>
            <TabsTrigger value="approvals" className="text-xs relative" title={t('tabs.approvals')}>
              <AlertCircle className="h-3 w-3" />
              {pendingApprovalsCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center rounded-full min-w-[16px]"
                >
                  {pendingApprovalsCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <div className="sidebar-scrollable-content">
            <TabsContent value="details" className="mt-0">
              <ProjectDetailsTab project={selectedProject} />
            </TabsContent>
            <TabsContent value="specs" className="mt-0">
              <SpecsTab specs={specs} />
            </TabsContent>
            <TabsContent value="tasks" className="mt-0">
              <TasksTab tasks={tasks} specs={specs} />
            </TabsContent>
            <TabsContent value="logs" className="mt-0">
              <LogsTab />
            </TabsContent>
            <TabsContent value="approvals" className="mt-0">
              <ApprovalsTab approvals={approvals} />
            </TabsContent>
          </div>
        </Tabs>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
          {projects.length === 0
            ? t('common.loading')
            : t('header.selectProject')}
        </div>
      )}
    </div>
  );
}
