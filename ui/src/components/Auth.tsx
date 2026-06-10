import { useState } from 'react'
import { Card, CardContent } from './ui/card'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '../lib/supabaseClient'
import { Lock, Mail, User, CalendarHeart, ShieldCheck, Clock, Stethoscope } from 'lucide-react'
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
    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-[600px]">

      {/* Left Panel — Branding */}
      <div className="hidden lg:flex flex-col justify-between bg-indigo-500 rounded-l-2xl p-10 text-white relative overflow-hidden">
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
      <Card className="border-0 lg:border lg:border-l-0 lg:rounded-l-none rounded-2xl lg:rounded-r-2xl shadow-2xl lg:shadow-xl bg-card">
        <CardContent className="p-8 sm:p-12 flex flex-col justify-center min-h-[600px]">

          {/* Mobile-only brand */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="p-2 bg-indigo-500 rounded-xl">
              <CalendarHeart size={20} className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">Linki Health</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">
              {isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
            </h2>
            <p className="text-muted-foreground">
              {isLogin ? 'Ingresa a tu portal de salud para gestionar tus citas.' : 'Regístrate gratis y agenda tu primera cita hoy.'}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-xl text-sm">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {!isLogin && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
                    <User size={14}/> Nombre
                  </label>
                  <Input {...register('name' as any)} placeholder="Juan Pérez" className={cn("h-11", (errors as any).name && "border-red-500")} />
                  {(errors as any).name && <p className="text-xs text-red-500">{(errors as any).name.message as string}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">Teléfono</label>
                  <Input {...register('phone' as any)} type="tel" placeholder="+54 9 11..." className={cn("h-11", (errors as any).phone && "border-red-500")} />
                  {(errors as any).phone && <p className="text-xs text-red-500">{(errors as any).phone.message as string}</p>}
                </div>
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
                <Mail size={14}/> Correo electrónico
              </label>
              <Input {...register('email')} type="email" placeholder="tucorreo@ejemplo.com" className={cn("h-11", errors.email && "border-red-500")} />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message as string}</p>}
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
                <Lock size={14}/> Contraseña
              </label>
              <Input {...register('password')} type="password" placeholder="••••••••" className={cn("h-11", errors.password && "border-red-500")} />
              {errors.password && <p className="text-xs text-red-500">{errors.password.message as string}</p>}
            </div>

            <Button type="submit" disabled={loading} className="w-full h-12 mt-2 shadow-md text-base font-medium">
              {loading ? 'Procesando...' : isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
            <button type="button" onClick={() => { setIsLogin(!isLogin); setErrorMsg('') }} className="ml-2 font-semibold text-indigo-500 hover:underline">
              {isLogin ? 'Regístrate gratis' : 'Inicia sesión'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
