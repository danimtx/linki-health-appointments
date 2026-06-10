import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import { AppointmentsWizard } from './components/AppointmentsWizard';
import { Dashboard } from './components/Dashboard';
import { Auth } from './components/Auth';
import { ToastProvider } from './components/Toast';
import { useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import { useAuthStore } from './store';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isInitialized } = useAuthStore();
  if (!isInitialized) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

function App() {
  const setAuth = useAuthStore(state => state.setAuth);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuth(
        session?.user ? { name: session.user.user_metadata?.name || session.user.email || '', email: session.user.email || '' } : null, 
        session?.access_token || null
      );
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuth(
        session?.user ? { name: session.user.user_metadata?.name || session.user.email || '', email: session.user.email || '' } : null, 
        session?.access_token || null
      );
    });

    return () => subscription.unsubscribe();
  }, [setAuth]);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<div className="min-h-screen bg-background flex items-center justify-center lg:p-4"><Auth /></div>} />
        
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<AppointmentsWizard />} />
          <Route path="doctors" element={<div className="p-8 text-center text-muted-foreground">Doctors Page (Próximamente)</div>} />
          <Route path="appointments" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      <ToastProvider />
    </BrowserRouter>
  );
}

export default App;
