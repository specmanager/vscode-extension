import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { TaskProgress } from './TaskProgress';
import { TaskList } from './TaskList';
import { DocumentViewer } from './DocumentViewer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { User, LogOut, CheckSquare, FileText, Layout, Info } from 'lucide-react';

export function MainLayout() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { projects, selectedProject, selectedSpec, selectProject, selectSpec } = useApp();
  const [activeTab, setActiveTab] = useState('tasks');

  const specs = selectedProject?.specs || [];
  const tasks = selectedSpec?.tasks || [];

  return (
    <div className="flex flex-col h-screen bg-[#1e1e1e] text-[#cccccc]">
      {/* Compact Header */}
      <div className="border-b border-[#2d2d2d] bg-[#252526] p-2 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <User className="h-4 w-4 mr-1" />
                <span className="text-xs truncate max-w-[100px]">{user?.username}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                {t('auth.logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <LanguageSwitcher />
        </div>

        <Select
          value={selectedProject?.id || ''}
          onValueChange={selectProject}
        >
          <SelectTrigger className="h-8 text-xs bg-[#3c3c3c] border-[#3c3c3c]">
            <SelectValue placeholder={t('projects.selectProject')} />
          </SelectTrigger>
          <SelectContent>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedProject && (
          <Select
            value={selectedSpec?.id || ''}
            onValueChange={selectSpec}
          >
            <SelectTrigger className="h-8 text-xs bg-[#3c3c3c] border-[#3c3c3c]">
              <SelectValue placeholder={t('specs.selectSpec')} />
            </SelectTrigger>
            <SelectContent>
              {specs.map((spec) => (
                <SelectItem key={spec.id} value={spec.id}>
                  {spec.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Content Area */}
      {!selectedProject ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center text-[#858585]">
            <Info className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">{t('projects.selectProject')}</p>
          </div>
        </div>
      ) : !selectedSpec ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center text-[#858585]">
            <Info className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">{t('specs.selectSpec')}</p>
          </div>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="w-full justify-start rounded-none bg-[#252526] border-b border-[#2d2d2d] p-0 h-10">
            <TabsTrigger
              value="tasks"
              className="rounded-none data-[state=active]:bg-[#1e1e1e] data-[state=active]:border-b-2 data-[state=active]:border-[#007acc] h-10 text-xs"
            >
              <CheckSquare className="h-3.5 w-3.5 mr-1.5" />
              {t('tasks.title')}
            </TabsTrigger>
            <TabsTrigger
              value="details"
              className="rounded-none data-[state=active]:bg-[#1e1e1e] data-[state=active]:border-b-2 data-[state=active]:border-[#007acc] h-10 text-xs"
            >
              <Info className="h-3.5 w-3.5 mr-1.5" />
              Details
            </TabsTrigger>
            <TabsTrigger
              value="requirements"
              className="rounded-none data-[state=active]:bg-[#1e1e1e] data-[state=active]:border-b-2 data-[state=active]:border-[#007acc] h-10 text-xs"
            >
              <FileText className="h-3.5 w-3.5 mr-1.5" />
              Req
            </TabsTrigger>
            <TabsTrigger
              value="design"
              className="rounded-none data-[state=active]:bg-[#1e1e1e] data-[state=active]:border-b-2 data-[state=active]:border-[#007acc] h-10 text-xs"
            >
              <Layout className="h-3.5 w-3.5 mr-1.5" />
              Design
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="tasks" className="h-full m-0 p-3 overflow-auto">
              <TaskProgress tasks={tasks} />
              <div className="mt-4">
                <TaskList tasks={tasks} />
              </div>
            </TabsContent>

            <TabsContent value="details" className="h-full m-0 p-3 overflow-auto">
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-semibold text-[#cccccc] mb-1">
                    {selectedProject.name}
                  </h3>
                  <p className="text-xs text-[#858585]">{selectedProject.description}</p>
                </div>
                <div className="border-t border-[#2d2d2d] pt-3">
                  <h4 className="text-xs font-semibold text-[#cccccc] mb-1">
                    {selectedSpec.name}
                  </h4>
                  <p className="text-xs text-[#858585]">{selectedSpec.description}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="requirements" className="h-full m-0">
              <DocumentViewer document={selectedSpec.requirements} />
            </TabsContent>

            <TabsContent value="design" className="h-full m-0">
              <DocumentViewer document={selectedSpec.design} />
            </TabsContent>
          </div>
        </Tabs>
      )}
    </div>
  );
}
