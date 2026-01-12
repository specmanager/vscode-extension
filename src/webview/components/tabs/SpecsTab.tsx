import { useTranslation } from 'react-i18next';
import type { Spec } from '@/lib/vscode-api';
import { formatDistanceToNow, cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, FileText, Code, CheckCircle2 } from 'lucide-react';

interface SpecsTabProps {
  specs: Spec[];
}

const stageConfig = {
  requirements: { icon: FileText, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  design: { icon: BookOpen, color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  tasks: { icon: Code, color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
  implementation: { icon: Code, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  complete: { icon: CheckCircle2, color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
};

export function SpecsTab({ specs }: SpecsTabProps) {
  const { t } = useTranslation();

  if (specs.length === 0) {
    return (
      <div className="text-center text-muted-foreground text-sm py-8">
        {t('specs.empty')}
      </div>
    );
  }

  return (
    <div className="space-y-2 p-1">
      {specs.map((spec) => {
        const stage = stageConfig[spec.stage] || stageConfig.requirements;
        const StageIcon = stage.icon;

        return (
          <Card key={spec.id} className="cursor-pointer hover:bg-accent/50 transition-colors">
            <CardContent className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">{spec.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className={cn('text-xs', stage.color)}>
                      <StageIcon className="h-3 w-3 mr-1" />
                      {t(`specs.${spec.stage}`)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(spec.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
