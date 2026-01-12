import { useTranslation } from 'react-i18next';
import { Document } from '../types';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Copy, Download } from 'lucide-react';
import { toast } from 'sonner';

interface DocumentViewerProps {
  document: Document;
}

export function DocumentViewer({ document }: DocumentViewerProps) {
  const { t } = useTranslation();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(document.content);
      toast.success(t('documents.copied'));
    } catch (error) {
      toast.error(t('common.error'));
    }
  };

  const handleExport = () => {
    const blob = new Blob([document.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = `${document.type}-${document.id}.md`;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(t('common.success'));
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 pt-5">
        <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
          <Copy className="h-4 w-4" />
          {t('documents.copy')}
        </Button>
        <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
          <Download className="h-4 w-4" />
          {t('documents.export')}
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
              {document.content}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
