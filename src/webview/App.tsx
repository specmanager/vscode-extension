import { useState, useEffect } from 'react';
import { vscodeApi, type User } from '@/lib/vscode-api';
import { LoginPage } from '@/pages/LoginPage';
import { MainLayout } from '@/pages/MainLayout';
import { useVSCodeTheme } from '@/hooks/useVSCodeTheme';
import { cn } from '@/lib/utils';

function App() {
  const theme = useVSCodeTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [loginError, setLoginError] = useState<string | undefined>();

  useEffect(() => {
    const unsubscribes = [
      vscodeApi.onMessage('auth-status', (msg) => {
        setIsAuthenticated(msg.data.authenticated);
        setUser(msg.data.user || null);
        setIsLoading(false);
        setLoginError(undefined);
      }),
      vscodeApi.onMessage('auth-error', (msg) => {
        setLoginError(msg.data.message);
        setIsLoading(false);
      }),
    ];

    // Check auth status on load
    vscodeApi.checkAuth();

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, []);

  const handleLogout = () => {
    vscodeApi.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  if (isLoading) {
    return (
      <div className={cn('sidebar-root flex items-center justify-center', `vscode-${theme}`)}>
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className={cn(`vscode-${theme}`)}>
      {!isAuthenticated ? (
        <LoginPage error={loginError} />
      ) : user ? (
        <MainLayout user={user} onLogout={handleLogout} />
      ) : (
        <LoginPage error="Failed to load user data" />
      )}
    </div>
  );
}

export default App;
