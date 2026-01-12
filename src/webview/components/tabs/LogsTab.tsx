import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollText } from 'lucide-react';

export function LogsTab() {
  const { t } = useTranslation();

  return (
    <div className="space-y-3 p-1">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <ScrollText className="h-4 w-4" />
            {t('logs.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground text-sm py-8">
            <ScrollText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>{t('logs.comingSoon')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
