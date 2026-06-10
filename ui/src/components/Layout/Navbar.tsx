import React, { useState, useEffect } from 'react';
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
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-2 bg-indigo-500 rounded-xl group-hover:scale-105 transition-transform shadow-sm">
            <CalendarHeart size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Linki Health</span>
        </Link>
        
        <nav className="flex items-center gap-4 md:gap-8 overflow-x-auto">
          <Link 
            to="/" 
            className={cn("text-sm font-medium transition-colors hover:text-indigo-500 whitespace-nowrap", location.pathname === '/' ? "text-indigo-500" : "text-muted-foreground")}
          >
            Nueva Reserva
          </Link>
          <Link 
            to="/appointments" 
            className={cn("text-sm font-medium transition-colors hover:text-indigo-500 whitespace-nowrap", location.pathname === '/appointments' ? "text-indigo-500" : "text-muted-foreground")}
          >
            Mis Citas
          </Link>
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          <button 
            className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
            onClick={() => setIsDark(!isDark)}
            aria-label="Alternar modo oscuro"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          {user ? (
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline-flex text-sm font-medium">
                Hola, {user.name.split(' ')[0]}
              </span>
              <Button variant="ghost" className="hidden sm:flex gap-2 text-muted-foreground" onClick={handleLogout}>
                <LogOut size={16} /> Salir
              </Button>
            </div>
          ) : (
            <Button variant="outline" className="hidden sm:flex gap-2" onClick={() => navigate('/login')}>
              <User size={16} /> Iniciar Sesión
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
