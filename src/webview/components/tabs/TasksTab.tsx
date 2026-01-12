import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { Task, Spec } from '@/lib/vscode-api';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle2, Circle, PlayCircle, FileCode, Target } from 'lucide-react';

interface TasksTabProps {
  tasks: Task[];
  specs: Spec[];
}

const statusConfig = {
  pending: {
    icon: Circle,
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    borderColor: 'border-gray-300 dark:border-gray-600',
  },
  'in-progress': {
    icon: PlayCircle,
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    borderColor: 'border-orange-500',
  },
  done: {
    icon: CheckCircle2,
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    borderColor: 'border-green-500',
  },
};

export function TasksTab({ tasks, specs }: TasksTabProps) {
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [specFilter, setSpecFilter] = useState<string>('all');

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (statusFilter !== 'all' && task.status !== statusFilter) {
        return false;
      }
      if (specFilter !== 'all' && task.specId !== specFilter) {
        return false;
      }
      return true;
    });
  }, [tasks, statusFilter, specFilter]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'done').length;
    const inProgress = tasks.filter((t) => t.status === 'in-progress').length;
    const pending = tasks.filter((t) => t.status === 'pending').length;
    const progress = total > 0 ? (completed / total) * 100 : 0;

    return { total, completed, inProgress, pending, progress };
  }, [tasks]);

  if (tasks.length === 0) {
    return (
      <div className="text-center text-muted-foreground text-sm py-8">
        {t('tasks.empty')}
      </div>
    );
  }

  return (
    <div className="space-y-3 p-1">

      {/* Filters */}
      <div className="grid grid-cols-2 gap-2">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder={t('tasks.filter')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('tasks.all')}</SelectItem>
            <SelectItem value="pending">{t('tasks.pending')}</SelectItem>
            <SelectItem value="in-progress">{t('tasks.inProgress')}</SelectItem>
            <SelectItem value="done">{t('tasks.done')}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={specFilter} onValueChange={setSpecFilter}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Spec" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Specs</SelectItem>
            {specs.map((spec) => (
              <SelectItem key={spec.id} value={spec.id}>
                {spec.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>


      {/* Stats */}
      <Card>
        <CardContent className="p-2">
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <div className="text-lg font-medium">{stats.total}</div>
              <div className="text-xs text-muted-foreground">{t('tasks.stats.total')}</div>
            </div>
            <div>
              <div className="text-lg font-medium text-green-600">{stats.completed}</div>
              <div className="text-xs text-muted-foreground">{t('tasks.stats.completed')}</div>
            </div>
            <div>
              <div className="text-lg font-medium text-orange-600">{stats.inProgress}</div>
              <div className="text-xs text-muted-foreground">{t('tasks.status.in-progress')}</div>
            </div>
            <div>
              <div className="text-lg font-medium text-blue-600">{Math.round(stats.progress)}%</div>
              <div className="text-xs text-muted-foreground">{t('tasks.stats.progress')}</div>
            </div>
          </div>
          <Progress value={stats.progress} className="h-2 mt-3" />
        </CardContent>
      </Card>

      

      {/* Task List */}
      <div className="space-y-2">
        {filteredTasks.map((task) => {
          const status = statusConfig[task.status];
          const StatusIcon = status.icon;
          const spec = specs.find((s) => s.id === task.specId);

          return (
            <Card key={task.id} className={cn('transition-colors', status.borderColor)}>
              <CardContent className="p-3">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-muted-foreground">
                          #{task.taskNumber}
                        </span>
                        <h3 className="font-medium text-sm">{task.title}</h3>
                      </div>
                      {spec && (
                        <div className="text-xs text-muted-foreground mt-1">{spec.title}</div>
                      )}
                    </div>
                    <Badge variant="secondary" className={cn('text-xs', status.color)}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {t(`tasks.status.${task.status}`)}
                    </Badge>
                  </div>

                  {/* Files */}
                  {task.files && task.files.length > 0 && (
                    <div className="flex items-start gap-2">
                      <FileCode className="h-3 w-3 text-muted-foreground mt-0.5" />
                      <div className="flex flex-wrap gap-1">
                        {task.files.map((file, index) => (
                           <code key={index} className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700 font-mono">
                          {file}
                        </code>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* implementation */}
                  {task.implementation && (
                    <div className="flex items-start gap-2">
                      <Target className="h-3 w-3 text-muted-foreground mt-0.5" />
                      <div className="text-xs text-muted-foreground">
                        {task.implementation}
                      </div>
                    </div>
                  )}

                  {/* Purposes */}
                  {task.purposes && (
                    <div className="flex items-start gap-2">
                      <Target className="h-3 w-3 text-muted-foreground mt-0.5" />
                      <div className="text-xs text-muted-foreground">
                        {task.purposes}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
