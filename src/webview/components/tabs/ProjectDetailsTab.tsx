import { useTranslation } from 'react-i18next';
import type { Project } from '@/lib/vscode-api';
import { formatDate, formatDistanceToNow } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, GitBranch, Calendar, Clock } from 'lucide-react';
import { vscodeApi } from '@/lib/vscode-api';

interface ProjectDetailsTabProps {
  project: Project | null;
}

export function ProjectDetailsTab({ project }: ProjectDetailsTabProps) {
  const { t } = useTranslation();

  if (!project) {
    return (
      <div className="text-center text-[#858585] text-sm py-8">
        {t('common.loading')}
      </div>
    );
  }

  return (
    <div className="space-y-3 p-3">
      <Card className="bg-[#252526] border-[#2d2d2d]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-[#cccccc]">{t('project.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name */}
          <div className="space-y-1">
            <div className="text-xs text-[#858585]">{t('project.name')}</div>
            <div className="font-medium text-[#cccccc]">{project.name}</div>
          </div>

          {/* Repository */}
          {project.githubRepositoryFullName ? (
            <div className="space-y-1">
              <div className="text-xs text-[#858585]">{t('project.repository')}</div>
              <button
                onClick={() => {
                  if (project.githubRepositoryUrl) {
                    vscodeApi.openExternalUrl(project.githubRepositoryUrl);
                  }
                }}
                className="flex items-center gap-2 text-[#007acc] hover:text-[#3794d1]"
              >
                <ExternalLink className="h-3 w-3" />
                <span className="text-sm">{project.githubRepositoryFullName}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="text-xs text-[#858585]">{t('project.repository')}</div>
              <div className="text-sm text-[#858585] italic">
                {t('project.noRepository')}
              </div>
            </div>
          )}

          {/* Default Branch */}
          {project.githubRepositoryDefaultBranch && (
            <div className="space-y-1">
              <div className="text-xs text-[#858585]">{t('project.branch')}</div>
              <div className="flex items-center gap-2">
                <GitBranch className="h-3 w-3 text-[#858585]" />
                <span className="text-sm font-mono text-[#cccccc]">
                  {project.githubRepositoryDefaultBranch}
                </span>
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-xs text-[#858585]">{t('project.created')}</div>
              <div className="flex items-center gap-2 text-sm text-[#cccccc]">
                <Calendar className="h-3 w-3 text-[#858585]" />
                {formatDate(project.createdAt)}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-[#858585]">{t('project.updated')}</div>
              <div className="flex items-center gap-2 text-sm text-[#cccccc]">
                <Clock className="h-3 w-3 text-[#858585]" />
                {formatDistanceToNow(project.updatedAt)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
