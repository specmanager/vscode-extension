import { useTranslation } from 'react-i18next';
import type { Task } from '@/lib/vscode-api';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';

interface TaskProgressProps {
  tasks: Task[];
}

export function TaskProgress({ tasks }: TaskProgressProps) {
  const { t } = useTranslation();

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'done').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    pending: tasks.filter(t => t.status === 'pending').length,
  };

  const overallProgress = stats.total > 0
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;

  return (
    <Card className="bg-[#252526] border-[#2d2d2d]">
      <CardContent className="p-3">
        {/* Title row with progress bar */}
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xs font-medium text-[#cccccc] whitespace-nowrap">
            {t('tasks.progress')}
          </span>
          <div className="flex-1 flex items-center gap-2">
            <Progress value={overallProgress} className="h-1.5 bg-[#3c3c3c] flex-1" />
            <span className="text-xs font-medium text-[#cccccc] w-8 text-right">
              {overallProgress}%
            </span>
          </div>
        </div>

        {/* Compact stats row */}
        <div className="flex justify-between text-center">
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold text-[#73c991]">{stats.completed}</span>
            <span className="text-[10px] text-[#858585]">{t('tasks.done')}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold text-[#4fc1ff]">{stats.inProgress}</span>
            <span className="text-[10px] text-[#858585]">{t('tasks.inProgress')}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold text-[#858585]">{stats.pending}</span>
            <span className="text-[10px] text-[#858585]">{t('tasks.pending')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
