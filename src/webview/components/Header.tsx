import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { vscodeApi, type Project, type User } from '@/lib/vscode-api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe, LogOut, User as UserIcon } from 'lucide-react';

interface HeaderProps {
  user: User;
  projects: Project[];
  selectedProjectId: string | null;
  onProjectChange: (projectId: string) => void;
  onLogout: () => void;
}

export function Header({
  user,
  projects,
  selectedProjectId,
  onProjectChange,
  onLogout,
}: HeaderProps) {
  const { t, i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'en');

  const handleLanguageChange = (language: string) => {
    setCurrentLanguage(language);
    if (language === 'auto') {
      localStorage.removeItem('specmanager-language');
      i18n.changeLanguage(undefined);
    } else {
      localStorage.setItem('specmanager-language', language);
      i18n.changeLanguage(language);
    }
    vscodeApi.setLanguage(language);
  };

  return (
    <div className="sidebar-sticky-header space-y-3">
      {/* Title Row */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">{t('header.title')}</h1>
        <div className="flex items-center space-x-1">
          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" title={t('language.selector')}>
                <Globe className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => handleLanguageChange('auto')}
                className={cn(currentLanguage === 'auto' && 'bg-accent')}
              >
                {t('language.auto')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleLanguageChange('en')}
                className={cn(currentLanguage === 'en' && 'bg-accent')}
              >
                {t('language.english')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleLanguageChange('ja')}
                className={cn(currentLanguage === 'ja' && 'bg-accent')}
              >
                {t('language.japanese')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleLanguageChange('zh')}
                className={cn(currentLanguage === 'zh' && 'bg-accent')}
              >
                {t('language.chinese')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleLanguageChange('es')}
                className={cn(currentLanguage === 'es' && 'bg-accent')}
              >
                {t('language.spanish')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                {user.githubAvatarUrl ? (
                  <img
                    src={user.githubAvatarUrl}
                    alt={user.name}
                    className="h-5 w-5 rounded-full"
                  />
                ) : (
                  <UserIcon className="h-4 w-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="px-2 py-1.5 text-sm">
                <div className="font-medium">{user.name}</div>
                <div className="text-xs text-muted-foreground">{user.email}</div>
              </div>
              <DropdownMenuItem onClick={onLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                {t('header.logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Project Selector */}
      <Select value={selectedProjectId || ''} onValueChange={onProjectChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={t('header.selectProject')} />
        </SelectTrigger>
        <SelectContent>
          {projects.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              {project.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
