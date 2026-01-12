import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { vscodeApi } from '@/lib/vscode-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Github, Mail, Lock, Loader2 } from 'lucide-react';

interface LoginPageProps {
  error?: string;
}

export function LoginPage({ error }: LoginPageProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState(error);

  // Listen for auth responses to reset loading state
  useEffect(() => {
    const unsubscribes = [
      vscodeApi.onMessage('auth-status', () => {
        setIsLoading(false);
      }),
      vscodeApi.onMessage('auth-error', (msg) => {
        setIsLoading(false);
        setLoginError(msg.data.message);
      }),
    ];

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, []);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError(undefined);

    try {
      vscodeApi.loginWithCredentials(email, password);
    } catch (err) {
      setLoginError((err as Error).message);
      setIsLoading(false);
    }
  };

  const handleGitHubLogin = () => {
    setIsLoading(true);
    setLoginError(undefined);
    vscodeApi.loginWithGitHub();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{t('login.title')}</CardTitle>
          <CardDescription>{t('login.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loginError && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {loginError}
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder={t('login.email')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
                disabled={isLoading}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder={t('login.password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('login.signingIn')}
                </>
              ) : (
                t('login.signIn')
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {t('login.orContinueWith')}
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleGitHubLogin}
            disabled={isLoading}
          >
            <Github className="mr-2 h-4 w-4" />
            {t('login.github')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
