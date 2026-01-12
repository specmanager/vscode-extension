import { useAuth } from './contexts/AuthContext';
import { LoginScreen } from './components/LoginScreen';
import { MainLayout } from './components/MainLayout';
import { Toaster } from 'sonner';

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {isAuthenticated ? <MainLayout /> : <LoginScreen />}
      <Toaster position="top-right" />
    </>
  );
}

export default App;
