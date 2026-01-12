import { useTranslation } from 'react-i18next';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Layers, FileText, LogOut } from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';

export function Sidebar() {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const { projects, selectedProject, selectedSpec, selectProject, selectSpec } = useApp();

  return (
    <div className="w-64 border-r bg-slate-50 dark:bg-slate-900 flex flex-col h-screen">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Layers className="h-4 w-4 text-primary-foreground" />
          </div>
          <h1 className="font-bold text-lg">{t('app.name')}</h1>
        </div>
        <LanguageSwitcher />
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              {t('projects.select')}
            </label>
            <Select
              value={selectedProject?.id}
              onValueChange={selectProject}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('projects.select')} />
              </SelectTrigger>
              <SelectContent>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedProject && (
            <>
              <Separator />
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  {t('specs.select')}
                </label>
                <div className="space-y-1">
                  {selectedProject.specs.map(spec => (
                    <Button
                      key={spec.id}
                      variant={selectedSpec?.id === spec.id ? 'secondary' : 'ghost'}
                      className="w-full justify-start gap-2"
                      onClick={() => selectSpec(spec.id)}
                    >
                      <FileText className="h-4 w-4" />
                      <span className="truncate">{spec.name}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          {t('nav.logout')}
        </Button>
      </div>
    </div>
  );
}
