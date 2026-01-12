import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { vscodeApi, type Approval } from '@/lib/vscode-api';
import { cn, formatDistanceToNow } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle2, XCircle, RotateCcw, Clock } from 'lucide-react';

interface ApprovalsTabProps {
  approvals: Approval[];
}

const statusConfig = {
  pending: {
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  },
  approved: {
    icon: CheckCircle2,
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
  rejected: {
    icon: XCircle,
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  },
  'needs-revision': {
    icon: RotateCcw,
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  },
};

export function ApprovalsTab({ approvals }: ApprovalsTabProps) {
  const { t } = useTranslation();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const pendingApprovals = approvals.filter((a) => a.status === 'pending');

  const handleRespond = async (
    approvalId: string,
    status: 'approved' | 'rejected' | 'needs-revision'
  ) => {
    setProcessingId(approvalId);
    try {
      vscodeApi.respondToApproval(approvalId, status, responseText[approvalId]);
      setResponseText((prev) => ({ ...prev, [approvalId]: '' }));
      setExpandedId(null);
    } finally {
      setTimeout(() => setProcessingId(null), 1000);
    }
  };

  if (pendingApprovals.length === 0) {
    return (
      <div className="text-center text-muted-foreground text-sm py-8">
        <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>{t('approvals.empty')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-1">
      {pendingApprovals.map((approval) => {
        const status = statusConfig[approval.status];
        const StatusIcon = status.icon;
        const isExpanded = expandedId === approval.id;

        return (
          <Card key={approval.id}>
            <CardContent className="p-3 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={cn('text-xs', status.color)}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {t(`approvals.status.${approval.status}`)}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {t(`approvals.type.${approval.type}`)}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(approval.requestedAt)}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-1">
                <Button
                  size="sm"
                  className="h-6 px-2 text-xs"
                  disabled={processingId === approval.id}
                  onClick={() => handleRespond(approval.id, 'approved')}
                >
                  {t('approvals.approve')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  disabled={processingId === approval.id}
                  onClick={() => handleRespond(approval.id, 'rejected')}
                >
                  {t('approvals.reject')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  disabled={processingId === approval.id}
                  onClick={() => setExpandedId(isExpanded ? null : approval.id)}
                >
                  {t('approvals.requestRevision')}
                </Button>
              </div>

              {/* Response Input */}
              {isExpanded && (
                <div className="space-y-2">
                  <Textarea
                    placeholder={t('approvals.responsePlaceholder')}
                    value={responseText[approval.id] || ''}
                    onChange={(e) =>
                      setResponseText((prev) => ({
                        ...prev,
                        [approval.id]: e.target.value,
                      }))
                    }
                    className="text-xs h-20"
                  />
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      className="h-6 px-2 text-xs"
                      disabled={processingId === approval.id}
                      onClick={() => handleRespond(approval.id, 'needs-revision')}
                    >
                      Submit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => setExpandedId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
