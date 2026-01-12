import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { vscodeApi, type Project, type User, type Spec, type Task } from '@/lib/vscode-api';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { TaskProgress } from '@/components/TaskProgress';
import { TaskList } from '@/components/TaskList';
import { DocumentViewer } from '@/components/DocumentViewer';
import { ProjectDetailsTab } from '@/components/tabs/ProjectDetailsTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { User as UserIcon, LogOut, CheckSquare, FileText, Layout, Info, FolderOpen, BookOpen, RefreshCw } from 'lucide-react';

interface MainLayoutProps {
  user: User;
  onLogout: () => void;
}

export function MainLayout({ user, onLogout }: MainLayoutProps) {
  const { t } = useTranslation();

  // Data state
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [specs, setSpecs] = useState<Spec[]>([]);
  const [selectedSpecId, setSelectedSpecId] = useState<string | null>(null);
  const [selectedSpec, setSelectedSpec] = useState<Spec | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  // UI state
  const [activeTab, setActiveTab] = useState('tasks');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Subscribe to VSCode messages
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
        // Auto-select first spec if none selected
        if (msg.data && msg.data.length > 0 && !selectedSpecId) {
          const firstSpec = msg.data[0];
          setSelectedSpecId(firstSpec.id);
          setSelectedSpec(firstSpec);
          vscodeApi.getSpecTasks(firstSpec.id);
        }
      }),
      vscodeApi.onMessage('spec-updated', (msg) => {
        setSelectedSpec(msg.data);
      }),
      vscodeApi.onMessage('spec-tasks-updated', (msg) => {
        if (msg.data.specId === selectedSpecId) {
          setTasks(msg.data.tasks || []);
        }
      }),
      vscodeApi.onMessage('tasks-updated', (msg) => {
        // Filter tasks for selected spec if we have one
        if (selectedSpecId) {
          const specTasks = (msg.data || []).filter((t: Task) => t.specId === selectedSpecId);
          setTasks(specTasks);
        }
      }),
      vscodeApi.onMessage('task-started', () => {
        if (selectedSpecId) {
          vscodeApi.getSpecTasks(selectedSpecId);
        }
      }),
      vscodeApi.onMessage('task-completed', () => {
        if (selectedSpecId) {
          vscodeApi.getSpecTasks(selectedSpecId);
        }
      }),
    ];

    // Initial data load
    vscodeApi.getProjects();

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, [selectedSpecId]);

  // Load project data when project selected
  useEffect(() => {
    if (selectedProjectId) {
      vscodeApi.getProjectDetails(selectedProjectId);
      vscodeApi.getSpecs(selectedProjectId);
      // Reset spec selection when project changes
      setSelectedSpecId(null);
      setSelectedSpec(null);
      setTasks([]);
    }
  }, [selectedProjectId]);

  // Load spec data when spec selected
  useEffect(() => {
    if (selectedSpecId) {
      vscodeApi.getSpec(selectedSpecId);
      vscodeApi.getSpecTasks(selectedSpecId);
    }
  }, [selectedSpecId]);

  const handleProjectChange = (projectId: string) => {
    vscodeApi.selectProject(projectId);
  };

  const handleSpecChange = (specId: string) => {
    setSelectedSpecId(specId);
    const spec = specs.find(s => s.id === specId);
    if (spec) {
      setSelectedSpec(spec);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    vscodeApi.refreshAll();
    // Reset after a short delay
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="flex flex-col h-screen bg-[#1e1e1e] text-[#cccccc]">
      {/* Compact Header */}
      <div className="border-b border-[#2d2d2d] bg-[#252526] p-2 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 px-2 hover:bg-[#3c3c3c]">
                <UserIcon className="h-3.5 w-3.5 mr-1.5" />
                <span className="text-xs truncate max-w-[100px]">{user.name || user.email}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 bg-[#252526] border-[#3c3c3c]">
              <DropdownMenuLabel className="text-xs text-[#858585]">{user.email}</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#3c3c3c]" />
              <DropdownMenuItem onClick={onLogout} className="text-xs cursor-pointer hover:bg-[#3c3c3c]">
                <LogOut className="h-3.5 w-3.5 mr-2" />
                {t('auth.logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              title={t('common.refresh')}
              className="h-7 w-7 p-0 hover:bg-[#3c3c3c]"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <LanguageSwitcher />
          </div>
        </div>

        {/* Project Selector */}
        <div className="flex items-center gap-1.5">
          <FolderOpen className="h-3.5 w-3.5 text-[#858585]" />
          <Select
            value={selectedProjectId || ''}
            onValueChange={handleProjectChange}
          >
            <SelectTrigger className="h-7 text-xs bg-[#3c3c3c] border-[#3c3c3c] flex-1">
              <SelectValue placeholder={t('projects.selectProject')} />
            </SelectTrigger>
            <SelectContent className="bg-[#252526] border-[#3c3c3c]">
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id} className="text-xs">
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Spec Selector */}
        {selectedProjectId && specs.length > 0 && (
          <div className="flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-[#858585]" />
            <Select
              value={selectedSpecId || ''}
              onValueChange={handleSpecChange}
            >
              <SelectTrigger className="h-7 text-xs bg-[#3c3c3c] border-[#3c3c3c] flex-1">
                <SelectValue placeholder={t('specs.selectSpec')} />
              </SelectTrigger>
              <SelectContent className="bg-[#252526] border-[#3c3c3c]">
                {specs.map((spec) => (
                  <SelectItem key={spec.id} value={spec.id} className="text-xs">
                    {spec.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Content Area */}
      {!selectedProjectId ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center text-[#858585]">
            <FolderOpen className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">{t('projects.selectProject')}</p>
          </div>
        </div>
      ) : !selectedSpecId ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center text-[#858585]">
            <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">
              {specs.length === 0 ? t('specs.noSpecs') : t('specs.selectSpec')}
            </p>
          </div>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="w-full justify-start rounded-none bg-[#252526] border-b border-[#2d2d2d] p-0 h-9">
            <TabsTrigger
              value="tasks"
              className="rounded-none data-[state=active]:bg-[#1e1e1e] data-[state=active]:border-b-2 data-[state=active]:border-[#007acc] h-9 text-xs px-3"
            >
              <CheckSquare className="h-3 w-3 mr-1.5" />
              {t('tabs.tasks')}
            </TabsTrigger>
            <TabsTrigger
              value="details"
              className="rounded-none data-[state=active]:bg-[#1e1e1e] data-[state=active]:border-b-2 data-[state=active]:border-[#007acc] h-9 text-xs px-3"
            >
              <Info className="h-3 w-3 mr-1.5" />
              {t('tabs.details')}
            </TabsTrigger>
            <TabsTrigger
              value="requirements"
              className="rounded-none data-[state=active]:bg-[#1e1e1e] data-[state=active]:border-b-2 data-[state=active]:border-[#007acc] h-9 text-xs px-3"
            >
              <FileText className="h-3 w-3 mr-1.5" />
              Req
            </TabsTrigger>
            <TabsTrigger
              value="design"
              className="rounded-none data-[state=active]:bg-[#1e1e1e] data-[state=active]:border-b-2 data-[state=active]:border-[#007acc] h-9 text-xs px-3"
            >
              <Layout className="h-3 w-3 mr-1.5" />
              Design
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="tasks" className="h-full m-0 p-3 overflow-auto">
              <TaskProgress tasks={tasks} />
              <div className="mt-3">
                <TaskList tasks={tasks} />
              </div>
            </TabsContent>

            <TabsContent value="details" className="h-full m-0 overflow-auto">
              <ProjectDetailsTab project={selectedProject} />
            </TabsContent>

            <TabsContent value="requirements" className="h-full m-0 overflow-hidden">
              <DocumentViewer
                content={selectedSpec?.requirementsContent}
                type="requirements"
                specTitle={selectedSpec?.title}
              />
            </TabsContent>

            <TabsContent value="design" className="h-full m-0 overflow-hidden">
              <DocumentViewer
                content={selectedSpec?.designContent}
                type="design"
                specTitle={selectedSpec?.title}
              />
            </TabsContent>
          </div>
        </Tabs>
      )}
    </div>
  );
}
