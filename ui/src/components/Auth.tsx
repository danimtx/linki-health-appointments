import { useState, useEffect } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '../lib/supabaseClient'
import { Lock, Mail, User, CalendarHeart, ShieldCheck, Clock, Stethoscope, Moon, Sun, Phone } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '../lib/utils'

const loginSchema = z.object({
  email: z.string().email('Correo inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres')
})

const registerSchema = loginSchema.extend({
  name: z.string().min(3, 'Mínimo 3 caracteres'),
  phone: z.string().min(8, 'Mínimo 8 dígitos')
})

export const Auth = ({ onComplete }: { onComplete?: () => void }) => {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const navigate = useNavigate()

  // Theme state — reads from localStorage, persists across reloads
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark')
  })

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [isDark])

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(isLogin ? loginSchema : registerSchema)
  })

  const onSubmit = async (data: any) => {
    setLoading(true)
    setErrorMsg('')
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: { name: data.name, phone: data.phone }
          }
        })
        if (error) throw error
      }
      if (onComplete) onComplete()
      else navigate('/')
    } catch (e: any) {
      if (e.message.includes('Invalid login credentials')) {
        setErrorMsg('Credenciales inválidas. Revisa tu correo y contraseña.')
      } else {
        setErrorMsg(e.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const features = [
    { icon: <Clock className="w-5 h-5" />, text: 'Reserva en menos de 2 minutos' },
    { icon: <Stethoscope className="w-5 h-5" />, text: '8 profesionales, 6 especialidades' },
    { icon: <ShieldCheck className="w-5 h-5" />, text: 'Tu horario queda bloqueado al instante' },
  ]

  return (
    <div className="w-full min-h-screen lg:min-h-0 lg:max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-0">

      {/* Left Panel — Branding (Desktop only) */}
      <div className="hidden lg:flex flex-col justify-between bg-indigo-500 rounded-l-2xl p-10 text-white relative overflow-hidden min-h-[600px]">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-64 h-64 rounded-full border-[40px] border-white/20" />
          <div className="absolute bottom-20 left-[-40px] w-48 h-48 rounded-full border-[30px] border-white/20" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
              <CalendarHeart size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight">Linki Health</span>
          </div>

          <h1 className="text-4xl font-bold leading-tight mb-4 display-text">
            Tu salud,{'\n'}a un clic de distancia
          </h1>
          <p className="text-indigo-100 text-lg leading-relaxed max-w-md">
            Agenda citas médicas con los mejores profesionales. Sin llamadas, sin esperas.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-3 text-indigo-100">
              <div className="p-2 bg-white/10 rounded-lg">{f.icon}</div>
              <span className="text-sm font-medium">{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex flex-col bg-background lg:bg-card lg:border lg:border-l-0 lg:rounded-l-none lg:rounded-r-2xl lg:shadow-xl">
        
        {/* Mobile Header Bar */}
        <div className="flex items-center justify-between px-5 pt-safe-top py-4 lg:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500 rounded-xl">
              <CalendarHeart size={18} className="text-white" />
            </div>
            <span className="text-base font-bold tracking-tight">Linki Health</span>
          </div>
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2.5 rounded-xl bg-muted text-muted-foreground active:scale-95 transition-transform"
            aria-label="Cambiar tema"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        {/* Desktop Theme Toggle (top-right corner) */}
        <div className="hidden lg:flex justify-end p-6 pb-0">
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2.5 rounded-xl bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
            aria-label="Cambiar tema"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 lg:px-12 py-6 lg:py-8">

          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">
              {isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              {isLogin ? 'Ingresa a tu portal de salud para gestionar tus citas.' : 'Regístrate gratis y agenda tu primera cita hoy.'}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-xl text-sm">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
                    <User size={14}/> Nombre completo
                  </label>
                  <Input {...register('name' as any)} placeholder="Juan Pérez" className={cn("h-12 text-base", (errors as any).name && "border-red-500")} />
                  {(errors as any).name && <p className="text-xs text-red-500">{(errors as any).name.message as string}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
                    <Phone size={14}/> Teléfono
                  </label>
                  <Input {...register('phone' as any)} type="tel" placeholder="+54 9 11..." className={cn("h-12 text-base", (errors as any).phone && "border-red-500")} />
                  {(errors as any).phone && <p className="text-xs text-red-500">{(errors as any).phone.message as string}</p>}
                </div>
              </>
            )}
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
                <Mail size={14}/> Correo electrónico
              </label>
              <Input {...register('email')} type="email" placeholder="tucorreo@ejemplo.com" className={cn("h-12 text-base", errors.email && "border-red-500")} />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message as string}</p>}
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
                <Lock size={14}/> Contraseña
              </label>
              <Input {...register('password')} type="password" placeholder="••••••••" className={cn("h-12 text-base", errors.password && "border-red-500")} />
              {errors.password && <p className="text-xs text-red-500">{errors.password.message as string}</p>}
            </div>

            <div className="pt-2">
              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full h-14 shadow-md text-base font-semibold rounded-xl active:scale-[0.98] transition-transform"
              >
                {loading ? 'Procesando...' : isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
            <button 
              type="button" 
              onClick={() => { setIsLogin(!isLogin); setErrorMsg('') }} 
              className="ml-2 font-semibold text-indigo-500 hover:underline active:opacity-70"
            >
              {isLogin ? 'Regístrate gratis' : 'Inicia sesión'}
            </button>
          </div>
        </div>

        {/* Mobile: Feature pills at the bottom */}
        <div className="px-6 pb-8 pt-2 lg:hidden">
          <div className="flex flex-wrap gap-2 justify-center">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-full text-xs text-muted-foreground">
                {f.icon}
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
