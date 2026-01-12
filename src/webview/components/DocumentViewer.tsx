import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Copy, Download, FileText } from 'lucide-react';

interface DocumentViewerProps {
  content: string | null | undefined;
  type: 'requirements' | 'design' | 'plan';
  specTitle?: string;
}

export function DocumentViewer({ content, type, specTitle }: DocumentViewerProps) {
  const { t } = useTranslation();

  const handleCopy = async () => {
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      // Could add toast notification here
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleExport = () => {
    if (!content) return;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const filename = specTitle
      ? `${specTitle.toLowerCase().replace(/\s+/g, '-')}-${type}.md`
      : `${type}.md`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-[#858585]">
        <FileText className="h-10 w-10 mb-3 opacity-50" />
        <p className="text-sm">{t('documents.noContent')}</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex gap-2 p-3 border-b border-[#2d2d2d]">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="h-7 text-xs gap-1.5 bg-[#3c3c3c] border-[#3c3c3c] hover:bg-[#4c4c4c]"
        >
          <Copy className="h-3 w-3" />
          {t('documents.copy')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          className="h-7 text-xs gap-1.5 bg-[#3c3c3c] border-[#3c3c3c] hover:bg-[#4c4c4c]"
        >
          <Download className="h-3 w-3" />
          {t('documents.export')}
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-3">
        <Card className="bg-[#252526] border-[#2d2d2d]">
          <CardContent className="p-4">
            <pre className="whitespace-pre-wrap font-mono text-xs text-[#cccccc] leading-relaxed">
              {content}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
