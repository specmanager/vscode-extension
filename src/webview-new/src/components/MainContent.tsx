import { useTranslation } from 'react-i18next';
import { useApp } from '../contexts/AppContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardDescription, CardHeader, CardTitle } from './ui/card';
import { TaskProgress } from './TaskProgress';
import { DocumentViewer } from './DocumentViewer';
import { TaskList } from './TaskList';
import { FileText, Palette, CheckSquare } from 'lucide-react';

export function MainContent() {
  const { t } = useTranslation();
  const { selectedProject, selectedSpec } = useApp();

  if (!selectedProject || !selectedSpec) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-medium text-muted-foreground">
            {t('projects.select')}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t('specs.select')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      <div className="border-b bg-background p-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">{selectedSpec.name}</h2>
          <p className="text-sm text-muted-foreground">{selectedSpec.description}</p>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          <TaskProgress tasks={selectedSpec.tasks} />

          <Tabs defaultValue="requirements" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="requirements" className="gap-2">
                <FileText className="h-4 w-4" />
                {t('nav.requirements')}
              </TabsTrigger>
              <TabsTrigger value="design" className="gap-2">
                <Palette className="h-4 w-4" />
                {t('nav.design')}
              </TabsTrigger>
              <TabsTrigger value="tasks" className="gap-2">
                <CheckSquare className="h-4 w-4" />
                {t('nav.tasks')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="requirements" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t('nav.requirements')}</CardTitle>
                  <CardDescription>
                    {t('nav.requirements')} for {selectedSpec.name}
                  </CardDescription>
                </CardHeader>
              </Card>
              <DocumentViewer document={selectedSpec.requirements} />
            </TabsContent>

            <TabsContent value="design" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t('nav.design')}</CardTitle>
                  <CardDescription>
                    {t('nav.design')} documentation for {selectedSpec.name}
                  </CardDescription>
                </CardHeader>
              </Card>
              <DocumentViewer document={selectedSpec.design} />
            </TabsContent>

            <TabsContent value="tasks" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t('nav.tasks')}</CardTitle>
                  <CardDescription>
                    Track real-time progress of AI agents working on {selectedSpec.name}
                  </CardDescription>
                </CardHeader>
              </Card>
              <TaskList tasks={selectedSpec.tasks} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
