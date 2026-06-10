import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppointmentStore, useAuthStore, type AppointmentStep } from '../store'
import { api, type Specialty, type Doctor, type Slot } from '../api'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Input } from './ui/input'
import { cn } from '../lib/utils'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Check, Calendar, Clock, Star, Activity, Stethoscope, Brain, Baby, ArrowRight, Ticket, User, Mail, Phone, Lock, Heart, Smile } from 'lucide-react'
import { useToastStore } from './Toast'

// --- Utility: step configuration ---
const stepsOrder: AppointmentStep[] = ['specialty', 'doctor', 'datetime', 'details', 'summary', 'success']
const stepTitles: Record<AppointmentStep, string> = {
  specialty: 'Selecciona Especialidad',
  doctor: 'Elige un Profesional',
  datetime: 'Fecha y Hora',
  details: 'Tus Datos',
  summary: 'Confirmación',
  success: '¡Cita Agendada!'
}

// --- Icons mapper ---
const getIcon = (name: string) => {
  switch (name.toLowerCase()) {
    case 'cardiología': return <Activity className="w-7 h-7 text-indigo-500" />
    case 'pediatría': return <Baby className="w-7 h-7 text-indigo-500" />
    case 'dermatología': return <Stethoscope className="w-7 h-7 text-indigo-500" />
    case 'neurología': return <Brain className="w-7 h-7 text-indigo-500" />
    case 'psicología': return <Smile className="w-7 h-7 text-indigo-500" />
    case 'medicina general': return <Heart className="w-7 h-7 text-indigo-500" />
    default: return <Stethoscope className="w-7 h-7 text-indigo-500" />
  }
}

export function AppointmentsWizard() {
  const { currentStep, setStep, reset } = useAppointmentStore()
  const currentIndex = stepsOrder.indexOf(currentStep)

  const handleBack = () => {
    if (currentIndex > 0) {
      setStep(stepsOrder[currentIndex - 1])
    }
  }

  // Animation variants
  const variants: any = {
    initial: { x: 50, opacity: 0 },
    enter: { x: 0, opacity: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
    exit: { x: -50, opacity: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <GlobalTimer />
      {/* Header / Progress */}
      {currentStep !== 'success' && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={handleBack}
              disabled={currentIndex === 0}
              className={`p-2 rounded-lg transition-colors ${currentIndex === 0 ? 'opacity-0 cursor-default' : 'hover:bg-muted text-muted-foreground'}`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-semibold tracking-tight">
              {stepTitles[currentStep]}
            </h2>
            <div className="w-9" /> {/* Spacer */}
          </div>
          
          {/* Progress Bar */}
          <div className="flex items-center justify-center gap-2">
            {stepsOrder.slice(0, 5).map((step, idx) => (
              <React.Fragment key={step}>
                <div 
                  className={cn(
                    "h-2 rounded-full transition-all duration-500",
                    idx === currentIndex 
                      ? 'w-8 bg-indigo-500' 
                      : idx < currentIndex 
                        ? 'w-2.5 bg-indigo-500/40' 
                        : 'w-2.5 bg-muted'
                  )}
                />
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Main Wizard Area */}
      <div className="relative min-h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            variants={variants}
            initial="initial"
            animate="enter"
            exit="exit"
            className="w-full"
          >
            {currentStep === 'specialty' && <StepSpecialty />}
            {currentStep === 'doctor' && <StepDoctor />}
            {currentStep === 'datetime' && <StepDateTime />}
            {currentStep === 'details' && <StepDetails />}
            {currentStep === 'summary' && <StepSummary />}
            {currentStep === 'success' && <StepSuccess onRestart={reset} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

// --- Step 1: Specialty ---
function StepSpecialty() {
  const { setSpecialty, specialtyId } = useAppointmentStore()
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getSpecialties().then(data => {
      setSpecialties(data)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="text-center py-20 animate-pulse text-muted-foreground">Cargando especialidades...</div>

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {specialties.map((spec) => (
        <Card 
          key={spec.id} 
          className={cn(
            "cursor-pointer transition-all duration-200",
            specialtyId === spec.id 
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 ring-1 ring-indigo-500/20' 
              : 'premium-panel'
          )}
          onClick={() => setSpecialty(spec.id)}
        >
          <CardContent className="flex flex-col items-center text-center p-8">
            <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 mb-4">
              {getIcon(spec.name)}
            </div>
            <h3 className="font-semibold text-lg mb-2">{spec.name}</h3>
            <p className="text-sm text-muted-foreground">{spec.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// --- Step 2: Doctor ---
function StepDoctor() {
  const { specialtyId, setDoctor } = useAppointmentStore()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (specialtyId) {
      api.getDoctors(specialtyId).then(data => {
        setDoctors(data)
        setLoading(false)
      })
    }
  }, [specialtyId])

  if (loading) return <div className="text-center py-20 animate-pulse text-muted-foreground">Buscando profesionales...</div>

  return (
    <div className="grid grid-cols-1 gap-4">
      {doctors.map((doc) => (
        <Card 
          key={doc.id} 
          className="premium-panel cursor-pointer group"
          onClick={() => setDoctor(doc.id)}
        >
          <CardContent className="p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            <div className="flex items-center gap-6 flex-1">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-muted flex-shrink-0 overflow-hidden ring-2 ring-background shadow-md">
                 <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${doc.name}`} alt={doc.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-bold text-xl group-hover:text-indigo-500 transition-colors">{doc.name}</h3>
                <p className="text-sm font-medium text-indigo-500 mb-2">{doc.specialty}</p>
                <p className="text-sm text-muted-foreground line-clamp-2 max-w-md mb-3">
                  {doc.bio || "Profesional de la salud comprometido con el bienestar integral de sus pacientes."}
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-amber-500 text-sm font-medium bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded-md">
                    <Star className="w-4 h-4 fill-current" />
                    {doc.rating || '5.0'}
                  </div>
                  <span className="text-xs text-muted-foreground">+100 pacientes atendidos</span>
                </div>
              </div>
            </div>
            
            <div className="w-full sm:w-auto mt-4 sm:mt-0 flex justify-end">
              <Button variant="outline" className="w-full sm:w-auto group-hover:bg-indigo-500 group-hover:text-white group-hover:border-indigo-500 transition-all">
                Elegir Profesional
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// --- Global Timer Component ---
function GlobalTimer() {
  const { lockExpiresAt, setStep, currentStep } = useAppointmentStore()
  const [timeLeft, setTimeLeft] = useState<number | null>(null)

  useEffect(() => {
    if (!lockExpiresAt || currentStep === 'success') {
      setTimeLeft(null)
      return
    }

    const targetTime = new Date(lockExpiresAt).getTime()

    const updateTimer = () => {
      const diff = Math.floor((targetTime - Date.now()) / 1000)
      if (diff <= 0) {
        setTimeLeft(0)
        if (currentStep === 'details' || currentStep === 'summary') {
          useToastStore.getState().toast('Tiempo agotado', 'El horario fue liberado. Selecciona otro horario disponible.', 'error')
          setStep('datetime')
        }
      } else {
        setTimeLeft(diff)
      }
    }
    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [lockExpiresAt, currentStep, setStep])

  if (timeLeft === null || timeLeft <= 0 || currentStep === 'datetime' || currentStep === 'success') return null

  return (
    <div className="fixed bottom-4 right-4 bg-indigo-500 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-bounce">
      <Clock size={20} />
      <span className="font-mono font-bold text-lg">00:{timeLeft.toString().padStart(2, '0')}</span>
      <span className="text-sm font-medium text-indigo-100">para confirmar</span>
    </div>
  )
}

// --- Step 3: DateTime ---
function StepDateTime() {
  const { doctorId, setDateTime } = useAppointmentStore()
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [lockingTime, setLockingTime] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [daySlotCounts, setDaySlotCounts] = useState<Record<string, { total: number, available: number }>>({})
  
  // Helper: get local YYYY-MM-DD
  const toLocalDateStr = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

  // Generate next 7 candidate days (we'll filter out ones with no availability)
  const today = new Date()
  const todayStr = toLocalDateStr(today)
  const allCandidateDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    return toLocalDateStr(d)
  })

  // Helper: filter past slots for today
  const filterPastSlots = (slots: Slot[], dateStr: string) => {
    if (dateStr !== todayStr) return slots
    const now = new Date()
    const currentMin = now.getHours() * 60 + now.getMinutes()
    return slots.filter(slot => {
      const [h, m] = slot.time.split(':').map(Number)
      return (h * 60 + m) > currentMin
    })
  }

  // On mount: pre-fetch all candidate days to know which ones have available slots
  useEffect(() => {
    if (!doctorId) return
    let cancelled = false
    
    const fetchAllDays = async () => {
      const counts: Record<string, { total: number, available: number }> = {}
      
      for (const day of allCandidateDays) {
        try {
          const slots = await api.getAvailability(doctorId, day)
          const filtered = filterPastSlots(slots, day)
          const available = filtered.filter(s => s.status === 'AVAILABLE').length
          counts[day] = { total: filtered.length, available }
        } catch {
          counts[day] = { total: 0, available: 0 }
        }
      }
      
      if (!cancelled) {
        setDaySlotCounts(counts)
        // Auto-select first day that has any slots (even if all locked, show them)
        const firstDayWithSlots = allCandidateDays.find(d => counts[d]?.total > 0)
        if (firstDayWithSlots && !selectedDate) {
          setSelectedDate(firstDayWithSlots)
        }
      }
    }
    
    fetchAllDays()
    return () => { cancelled = true }
  }, [doctorId])

  // Filter to only show days that have at least some slots (past time slots already removed for today)
  const visibleDays = allCandidateDays.filter(d => {
    const info = daySlotCounts[d]
    return info && info.total > 0
  })

  // Fetch slots for selected date with polling
  useEffect(() => {
    if (doctorId && selectedDate) {
      setLoading(true)
      const fetchAvailability = () => {
        api.getAvailability(doctorId, selectedDate)
          .then(data => {
            const filtered = filterPastSlots(data, selectedDate)
            setAvailableSlots(filtered)
            setLoading(false)

            // Update day counts for this date
            const available = filtered.filter(s => s.status === 'AVAILABLE').length
            setDaySlotCounts(prev => ({ ...prev, [selectedDate]: { total: filtered.length, available } }))
          })
          .catch(console.error)
      }
      
      fetchAvailability()
      const intervalId = setInterval(fetchAvailability, 3000)
      return () => clearInterval(intervalId)
    }
  }, [doctorId, selectedDate])

  const handleTimeSelect = async (time: string) => {
    setLockingTime(time)
    try {
      const res = await api.lockAppointment({ doctor_id: doctorId!, date: selectedDate, start_time: time })
      const lockExpiresAt = new Date(Date.now() + 60 * 1000).toISOString()
      setDateTime(selectedDate, time, res.data.id, lockExpiresAt)
    } catch (e: any) {
      useToastStore.getState().toast('Horario no disponible', 'El horario seleccionado ya fue tomado. Elige otro.', 'error')
      api.getAvailability(doctorId!, selectedDate).then(data => {
        setAvailableSlots(filterPastSlots(data, selectedDate))
      })
    } finally {
      setLockingTime(null)
    }
  }

  const formatDay = (dateStr: string) => {
    const d = new Date(dateStr + 'T12:00:00') // noon to avoid timezone shift
    const isToday = dateStr === todayStr
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    const isTomorrow = dateStr === toLocalDateStr(tomorrow)
    
    const label = d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })
    if (isToday) return `Hoy · ${d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`
    if (isTomorrow) return `Mañana · ${d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`
    return label
  }

  // Count available slots for a day
  const getAvailableCount = (dateStr: string) => daySlotCounts[dateStr]?.available ?? 0
  const allSlotsLocked = !loading && availableSlots.length > 0 && availableSlots.every(s => s.status === 'LOCKED' || s.status === 'CONFIRMED')
  const noSlotsAtAll = !loading && availableSlots.length === 0

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Date Selector */}
      <div className="lg:col-span-1 space-y-3">
        <h4 className="font-medium flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-indigo-500" /> Días disponibles
        </h4>
        {visibleDays.length === 0 && Object.keys(daySlotCounts).length > 0 ? (
          <div className="text-center py-8 px-4 bg-muted/50 rounded-xl border border-dashed border-border">
            <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground font-medium mb-1">Sin disponibilidad esta semana</p>
            <p className="text-sm text-muted-foreground">Este profesional no tiene horarios abiertos en los próximos 7 días. Prueba con otro profesional.</p>
          </div>
        ) : (
          visibleDays.map(d => {
            const avail = getAvailableCount(d)
            return (
              <button
                key={d}
                onClick={() => setSelectedDate(d)}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-lg border transition-all flex items-center justify-between",
                  selectedDate === d 
                    ? 'bg-indigo-500 text-white border-indigo-500 shadow-md' 
                    : 'bg-card text-foreground border-border hover:border-indigo-400/50'
                )}
              >
                <span className="capitalize text-sm font-medium">{formatDay(d)}</span>
                {avail > 0 ? (
                  <span className={cn(
                    "text-xs font-semibold px-2 py-0.5 rounded-full",
                    selectedDate === d 
                      ? 'bg-white/20 text-white' 
                      : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                  )}>
                    {avail} {avail === 1 ? 'libre' : 'libres'}
                  </span>
                ) : (
                  <span className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded-full",
                    selectedDate === d ? 'bg-white/20 text-white/70' : 'bg-muted text-muted-foreground'
                  )}>
                    Lleno
                  </span>
                )}
              </button>
            )
          })
        )}
      </div>

      {/* Time Slots */}
      <div className="lg:col-span-2">
        <h4 className="font-medium flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-indigo-500" /> Horarios
        </h4>
        {loading ? (
          <div className="animate-pulse flex gap-3 flex-wrap">
            {[1,2,3,4,5,6].map(i => <div key={i} className="w-24 h-12 bg-muted rounded-lg"></div>)}
          </div>
        ) : allSlotsLocked ? (
          // All slots exist but every single one is taken
          <div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-6">
              {availableSlots.map(slot => (
                <button
                  key={slot.time}
                  disabled
                  className="px-3 py-3 time-pill font-medium bg-muted text-muted-foreground cursor-not-allowed opacity-60 flex flex-col items-center gap-1"
                >
                  <span className="text-base">{slot.time}</span>
                  <span className="text-[10px] uppercase tracking-wider flex items-center gap-1 font-semibold mt-1">
                    <Lock size={10} /> {slot.status === 'CONFIRMED' ? 'Ocupado' : 'Bloqueado'}
                  </span>
                </button>
              ))}
            </div>
            <div className="text-center py-4 px-4 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900/30">
              <p className="text-amber-700 dark:text-amber-400 font-medium text-sm">Todos los horarios de este día están ocupados. Selecciona otro día con cupos disponibles.</p>
            </div>
          </div>
        ) : noSlotsAtAll ? (
          <div className="text-center py-12 px-4 bg-muted/50 rounded-xl border border-dashed border-border">
            <Clock className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground font-medium mb-1">Sin horarios para este día</p>
            <p className="text-sm text-muted-foreground">El profesional no atiende este día o los horarios ya pasaron. Prueba con otro día.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {availableSlots.map(slot => {
              const isLocked = slot.status === 'LOCKED' || slot.status === 'CONFIRMED'
              return (
                <button
                  key={slot.time}
                  disabled={isLocked || lockingTime === slot.time}
                  onClick={() => handleTimeSelect(slot.time)}
                  className={cn(
                    "px-3 py-3 time-pill font-medium transition-all flex flex-col items-center gap-1",
                    isLocked 
                      ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-60' 
                      : lockingTime === slot.time
                        ? 'opacity-50 cursor-wait bg-card'
                        : 'bg-card text-foreground hover:border-indigo-500 hover:text-indigo-500 hover:-translate-y-0.5 hover:shadow-sm'
                  )}
                >
                  <span className="text-base">{lockingTime === slot.time ? '⏳' : slot.time}</span>
                  {isLocked && (
                    <span className="text-[10px] uppercase tracking-wider flex items-center gap-1 font-semibold mt-1">
                      <Lock size={10} /> {slot.status === 'CONFIRMED' ? 'Ocupado' : 'Bloqueado'}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// --- Step 4: Details Form ---
const detailsSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  email: z.string().email('Ingresa un correo electrónico válido'),
  phone: z.string().min(8, 'El teléfono debe tener al menos 8 dígitos')
})
type DetailsFormValues = z.infer<typeof detailsSchema>

function StepDetails() {
  const { setPatientDetails } = useAppointmentStore()
  const user = useAuthStore(state => state.user)
  
  const { register, handleSubmit, formState: { errors } } = useForm<DetailsFormValues>({
    resolver: zodResolver(detailsSchema),
    defaultValues: { 
      name: user?.name || '', 
      email: user?.email || '', 
      phone: '' 
    }
  })

  const onSubmit = (data: DetailsFormValues) => {
    setPatientDetails(data)
  }

  return (
    <Card className="max-w-md mx-auto premium-panel">
      <CardContent className="p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <User className="w-4 h-4" /> Nombre completo
            </label>
            <Input 
              placeholder="Ej. María Pérez" 
              {...register('name')}
              className={cn(errors.name && "border-red-500 focus-visible:ring-red-500")}
            />
            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Mail className="w-4 h-4" /> Correo electrónico
            </label>
            <Input 
              type="email" 
              placeholder="maria@ejemplo.com" 
              {...register('email')}
              className={cn(errors.email && "border-red-500 focus-visible:ring-red-500")}
            />
            {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Phone className="w-4 h-4" /> Teléfono
            </label>
            <Input 
              type="tel" 
              placeholder="+54 9 11 1234-5678" 
              {...register('phone')}
              className={cn(errors.phone && "border-red-500 focus-visible:ring-red-500")}
            />
            {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>}
          </div>
          <Button type="submit" className="w-full h-12 text-md font-medium shadow-md">
            Continuar al resumen <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

// --- Step 5: Summary Ticket ---
function StepSummary() {
  const { appointmentId, date, time, patientDetails, setStep, lockExpiresAt } = useAppointmentStore()
  const [loading, setLoading] = useState(false)
  const [timeLeftLocal, setTimeLeftLocal] = useState<number>(0)
  
  useEffect(() => {
    if (!lockExpiresAt) return
    const target = new Date(lockExpiresAt).getTime()
    const update = () => {
      const diff = Math.floor((target - Date.now()) / 1000)
      setTimeLeftLocal(Math.max(0, diff))
    }
    update()
    const int = setInterval(update, 1000)
    return () => clearInterval(int)
  }, [lockExpiresAt])

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await api.confirmAppointment(appointmentId!)
      setStep('success')
    } catch (e: any) {
      useToastStore.getState().toast('Error en la reserva', 'No se pudo confirmar la cita. Intenta de nuevo.', 'error')
      if (e.message.includes('expirado')) setStep('datetime')
    } finally {
      setLoading(false)
    }
  }

  const d = new Date(date || '')
  const formattedDate = d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-card rounded-xl shadow-xl overflow-hidden border border-border">
        
        {/* Ticket Header */}
        <div className="bg-indigo-500 p-6 text-white text-center relative overflow-hidden flex flex-col items-center">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <Ticket className="w-24 h-24 rotate-12" />
          </div>
          <p className="text-indigo-100 uppercase tracking-widest text-xs font-bold mb-1">Ticket de reserva</p>
          <h3 className="text-2xl font-semibold relative z-10 mb-2">Cita Médica</h3>
          <div className="bg-white/20 px-3 py-1 text-sm rounded-lg font-medium inline-flex items-center gap-2">
            <Clock size={14}/> <span>00:{timeLeftLocal.toString().padStart(2, '0')} para confirmar</span>
          </div>
        </div>

        {/* Ticket Body */}
        <div className="p-8 space-y-6">
          <div className="flex justify-between items-center pb-6 border-b border-dashed border-border">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Fecha</p>
              <p className="font-semibold capitalize">{formattedDate}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Hora</p>
              <p className="font-semibold text-indigo-500 text-xl">{time}</p>
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Paciente</p>
            <p className="font-medium">{patientDetails?.name}</p>
            <p className="text-sm text-muted-foreground">{patientDetails?.email}</p>
          </div>
        </div>

        {/* Ticket Tear */}
        <div className="ticket-border h-4 w-full"></div>

        <div className="p-6 bg-muted/50">
          <Button 
            onClick={handleConfirm} 
            disabled={loading}
            className="w-full h-14 text-lg font-medium shadow-lg hover:-translate-y-0.5 transition-transform"
          >
            {loading ? 'Confirmando...' : 'Confirmar reserva'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// --- Step 6: Success ---
function StepSuccess({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="text-center py-16 px-4">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="w-24 h-24 bg-green-100 dark:bg-green-950/40 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-inner"
      >
        <Check className="w-12 h-12 text-green-600 dark:text-green-400" />
      </motion.div>
      <h2 className="text-3xl font-bold mb-4">¡Reserva exitosa!</h2>
      <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
        Hemos enviado un correo con los detalles de tu cita. Recuerda llegar 10 minutos antes de la hora programada.
      </p>
      <Button variant="outline" onClick={onRestart} className="h-12 px-8 font-medium">
        Agendar otra cita
      </Button>
    </div>
  )
}
