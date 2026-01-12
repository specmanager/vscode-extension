import { useTranslation } from 'react-i18next';
import type { Task } from '@/lib/vscode-api';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import {
  CheckCircle2,
  Clock,
  Circle,
  FileText,
  Target,
  ListChecks,
} from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
}

// Map API status to visual config
const statusConfig = {
  done: {
    icon: CheckCircle2,
    color: 'text-[#73c991]',
    bgColor: 'bg-[#252526] border border-[#2d2d2d]',
    badgeVariant: 'default' as const,
    label: 'done',
  },
  'in-progress': {
    icon: Clock,
    color: 'text-[#4fc1ff]',
    bgColor: 'bg-[#252526] border border-[#007acc]',
    badgeVariant: 'default' as const,
    label: 'inProgress',
  },
  pending: {
    icon: Circle,
    color: 'text-[#858585]',
    bgColor: 'bg-[#252526] border border-[#2d2d2d]',
    badgeVariant: 'secondary' as const,
    label: 'pending',
  },
};

export function TaskList({ tasks }: TaskListProps) {
  const { t } = useTranslation();

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-[#858585] text-sm">
        {t('tasks.noTasks')}
      </div>
    );
  }

  // Sort tasks by sortOrder
  const sortedTasks = [...tasks].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="space-y-2">
      {sortedTasks.map(task => {
        const config = statusConfig[task.status] || statusConfig.pending;
        const Icon = config.icon;

        // Parse implementation if it's a JSON string array
        let implementationSteps: string[] = [];
        if (task.implementation) {
          try {
            const parsed = JSON.parse(task.implementation);
            if (Array.isArray(parsed)) {
              implementationSteps = parsed;
            } else {
              implementationSteps = [task.implementation];
            }
          } catch {
            implementationSteps = [task.implementation];
          }
        }

        return (
          <Card key={task.id} className={config.bgColor}>
            <CardContent className="p-3">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${config.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-sm font-medium text-[#cccccc] leading-tight">
                        {task.taskNumber}. {task.title}
                      </h4>
                      <Badge
                        variant={config.badgeVariant}
                        className="flex-shrink-0 text-[10px] px-1.5 py-0"
                      >
                        {t(`tasks.${config.label}`)}
                      </Badge>
                    </div>

                    {task.files && task.files.length > 0 && (
                      <div className="mb-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-medium text-[#858585] mb-0.5">
                          <FileText className="h-3 w-3" />
                          <span className="text-xs font-semibold text-[#cccccc] uppercase tracking-wide">Files:</span>
                        </div>
                        <ul className="ml-4 space-y-0">
                          {task.files.map((file, idx) => (
                            <li key={idx} className="text-[11px] font-mono text-[#cccccc] truncate">
                              {file}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {task.purposes && task.purposes.length > 0 && (
                      <div className="mb-2">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Target className="w-3.5 h-3.5 text-[#858585]" />
                          <span className="text-xs font-semibold text-[#cccccc] uppercase tracking-wide">Purpose:</span>
                        </div>
                        <p className="text-sm text-[#858585] leading-relaxed italic">
                          {task.purposes}
                        </p>
                      </div>
                    )}

                    {implementationSteps.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <ListChecks className="w-3.5 h-3.5 text-[#858585]" />
                          <span className="text-xs font-semibold text-[#cccccc] uppercase tracking-wide">Implementation:</span>
                        </div>
                        <ol className="ml-5 space-y-1 list-decimal list-outside">
                          {implementationSteps.slice(0, 3).map((step, idx) => (
                            <li key={idx} className="text-sm text-[#cccccc] leading-relaxed">
                              {step}
                            </li>
                          ))}
                          {implementationSteps.length > 3 && (
                            <li className="text-sm text-[#858585]">
                              +{implementationSteps.length - 3} more...
                            </li>
                          )}
                        </ol>
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
