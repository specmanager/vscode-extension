import { useTranslation } from 'react-i18next';
import { Task } from '../types';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import {
  CheckCircle2,
  Clock,
  XCircle,
  Circle,
  Ban,
  Bot,
  FileText,
  Target,
} from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
}

const statusConfig = {
  completed: {
    icon: CheckCircle2,
    color: 'text-[#73c991]', // VS Code green
    bgColor: 'bg-[#252526] border border-[#2d2d2d]',
    badgeVariant: 'default' as const,
  },
  running: {
    icon: Clock,
    color: 'text-[#4fc1ff]', // VS Code light blue
    bgColor: 'bg-[#252526] border border-[#007acc]',
    badgeVariant: 'default' as const,
  },
  failed: {
    icon: XCircle,
    color: 'text-[#f48771]', // VS Code red
    bgColor: 'bg-[#252526] border border-[#f48771]',
    badgeVariant: 'destructive' as const,
  },
  pending: {
    icon: Circle,
    color: 'text-[#858585]', // VS Code gray
    bgColor: 'bg-[#252526] border border-[#2d2d2d]',
    badgeVariant: 'secondary' as const,
  },
  blocked: {
    icon: Ban,
    color: 'text-[#ce9178]', // VS Code orange
    bgColor: 'bg-[#252526] border border-[#ce9178]',
    badgeVariant: 'outline' as const,
  },
};

export function TaskList({ tasks }: TaskListProps) {
  const { t } = useTranslation();

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-[#858585]">
        {t('tasks.noTasks')}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map(task => {
        const config = statusConfig[task.status];
        const Icon = config.icon;

        return (
          <Card key={task.id} className={config.bgColor}>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${config.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h4 className="font-medium">{task.title}</h4>
                      <Badge variant={config.badgeVariant} className="flex-shrink-0 capitalize">
                        {t(`tasks.${task.status}`)}
                      </Badge>
                    </div>

                    {task.files && task.files.length > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center gap-2 text-xs font-medium text-[#858585] mb-1">
                          <FileText className="h-3.5 w-3.5" />
                          <span>Files:</span>
                        </div>
                        <ul className="ml-5 space-y-0.5">
                          {task.files.map((file, idx) => (
                            <li key={idx} className="text-xs font-mono text-[#cccccc]">
                              {file}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {task.implementation && task.implementation.length > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center gap-2 text-xs font-medium text-[#858585] mb-1">
                          <Target className="h-3.5 w-3.5" />
                          <span>Implementation:</span>
                        </div>
                        <ol className="ml-5 space-y-1 list-decimal list-outside">
                          {task.implementation.map((step, idx) => (
                            <li key={idx} className="text-xs text-[#cccccc] pl-1">
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {task.purpose && (
                      <div className="mb-3">
                        <div className="flex items-center gap-2 text-xs font-medium text-[#858585] mb-1">
                          <Target className="h-3.5 w-3.5" />
                          <span>Purpose:</span>
                        </div>
                        <p className="ml-5 text-xs text-[#cccccc]">
                          {task.purpose}
                        </p>
                      </div>
                    )}

                    {task.status === 'running' && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-[#858585]">{t('tasks.progress')}</span>
                          <span className="font-medium text-[#4fc1ff]">{Math.round(task.progress)}%</span>
                        </div>
                        <Progress value={task.progress} className="h-1.5 bg-[#3c3c3c]" />
                      </div>
                    )}

                    {task.agent && (
                      <div className="flex items-center gap-2 text-xs text-[#858585] mt-2">
                        <Bot className="h-3.5 w-3.5" />
                        <span>{task.agent}</span>
                      </div>
                    )}
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
