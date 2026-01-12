import { useTranslation } from 'react-i18next';
import { Task } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';

interface TaskProgressProps {
  tasks: Task[];
}

export function TaskProgress({ tasks }: TaskProgressProps) {
  const { t } = useTranslation();

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'running').length,
    failed: tasks.filter(t => t.status === 'failed').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    blocked: tasks.filter(t => t.status === 'blocked').length,
  };

  const overallProgress = stats.total > 0
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('tasks.progress')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('tasks.progress')}</span>
            <span className="font-medium">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        <div className="grid grid-cols-4 gap-3 text-sm">
          <div className="space-y-1">
            <div className="text-muted-foreground">{t('tasks.total')}</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground">{t('tasks.completed')}</div>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground">{t('tasks.inProgress')}</div>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground">{t('tasks.failed')}</div>
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
