import { useState, useEffect } from 'react';
import { Moon, Sun, CalendarHeart, User, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { useAuthStore } from '../../store';
import { supabase } from '../../lib/supabaseClient';

export const Navbar = () => {
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark') || 
           (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-3 sm:px-4 h-16 flex items-center justify-between gap-2">
        
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <div className="p-2 bg-indigo-500 rounded-xl group-hover:scale-105 transition-transform shadow-sm">
            <CalendarHeart size={18} className="text-white sm:w-5 sm:h-5" />
          </div>
          <span className="hidden sm:block text-xl font-bold tracking-tight">Linki Health</span>
        </Link>
        
        {/* Links */}
        <nav className="flex items-center justify-center gap-4 sm:gap-8 flex-1">
          <Link 
            to="/" 
            className={cn("text-xs sm:text-sm font-medium transition-colors hover:text-indigo-500 whitespace-nowrap", location.pathname === '/' ? "text-indigo-500" : "text-muted-foreground")}
          >
            Reservar
          </Link>
          <Link 
            to="/appointments" 
            className={cn("text-xs sm:text-sm font-medium transition-colors hover:text-indigo-500 whitespace-nowrap", location.pathname === '/appointments' ? "text-indigo-500" : "text-muted-foreground")}
          >
            Mis Citas
          </Link>
        </nav>

        {/* Controls */}
        <div className="flex items-center gap-1 sm:gap-4 shrink-0">
          <button 
            className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
            onClick={() => setIsDark(!isDark)}
            aria-label="Alternar modo oscuro"
          >
            {isDark ? <Sun size={18} className="sm:w-5 sm:h-5" /> : <Moon size={18} className="sm:w-5 sm:h-5" />}
          </button>
          
          {user ? (
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="hidden lg:inline-flex text-sm font-medium text-muted-foreground">
                Hola, {user.name.split(' ')[0]}
              </span>
              <button 
                className="p-2 rounded-lg text-red-500/80 hover:bg-red-500/10 hover:text-red-500 transition-colors flex items-center gap-2" 
                onClick={handleLogout}
                aria-label="Cerrar sesión"
              >
                <LogOut size={18} className="sm:w-5 sm:h-5" />
                <span className="hidden sm:inline-flex text-sm font-medium">Salir</span>
              </button>
            </div>
          ) : (
            <Button variant="outline" size="sm" className="hidden sm:flex gap-2" onClick={() => navigate('/login')}>
              <User size={16} /> Iniciar Sesión
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
