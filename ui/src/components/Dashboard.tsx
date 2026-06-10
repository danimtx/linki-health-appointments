import { useEffect, useState } from 'react'
import { Card, CardContent } from './ui/card'
import { Calendar, Clock, Stethoscope, Ticket } from 'lucide-react'
import { api } from '../api'

export const Dashboard = () => {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const now = new Date()
  const isPast = (appt: any) => {
    if (!appt.date || !appt.startTime) return false
    const d = new Date(appt.date)
    const [h, m] = appt.startTime.split(':').map(Number)
    d.setHours(h, m, 0, 0)
    return d < now
  }

  const upcoming = appointments.filter(a => a.status === 'CONFIRMED' && !isPast(a))
  const history = appointments.filter(a => a.status === 'CANCELLED' || a.status === 'COMPLETED' || (a.status === 'CONFIRMED' && isPast(a)))

  useEffect(() => {
    api.getAppointments()
      .then(data => {
        setAppointments(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setError('No se pudieron cargar las citas. Intenta de nuevo más tarde.')
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="p-20 text-center animate-pulse text-muted-foreground">Cargando tus citas...</div>
  if (error) return <div className="p-20 text-center text-red-500">{error}</div>
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Mis Citas</h1>
        <p className="text-muted-foreground">Gestiona y revisa tu historial de consultas médicas.</p>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-500" /> Próximas Citas
        </h2>
        
        <div className="grid gap-4">
          {upcoming.map(appointment => (
            <Card key={appointment.id} className="premium-panel">
              <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center">
                    <Ticket className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{appointment.doctor?.specialty?.name || 'Especialidad médica'}</h3>
                    <p className="text-muted-foreground flex items-center gap-1 mt-1">
                      <Stethoscope className="w-4 h-4" /> {appointment.doctor?.user?.name || 'Doctor'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col md:items-end gap-2">
                  <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-lg text-sm font-medium">
                    <Calendar className="w-4 h-4" /> {new Date(appointment.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </div>
                  <div className="flex items-center gap-2 text-indigo-500 font-semibold px-4">
                    <Clock className="w-4 h-4" /> {appointment.startTime} hrs
                  </div>
                </div>

              </CardContent>
            </Card>
          ))}
          {upcoming.length === 0 && (
            <p className="text-muted-foreground py-4">No tienes citas futuras programadas.</p>
          )}
        </div>

        <h2 className="text-xl font-semibold flex items-center gap-2 mt-12">
           Historial
        </h2>
        
        <div className="grid gap-4 opacity-70">
          {history.map(appointment => (
            <Card key={appointment.id} className="bg-muted/50 border-dashed">
              <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="font-medium">{appointment.doctor?.specialty?.name || 'Especialidad'}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{appointment.doctor?.user?.name || 'Doctor'}</p>
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-4">
                  <span>{new Date(appointment.date).toLocaleDateString('es-ES')}</span>
                  <span>{appointment.startTime}</span>
                  <span className="px-2 py-1 bg-muted rounded text-xs font-medium">{appointment.status === 'CANCELLED' ? 'Cancelada' : 'Completada'}</span>
                </div>
              </CardContent>
            </Card>
          ))}
          {history.length === 0 && (
             <p className="text-muted-foreground py-4">No hay historial de citas.</p>
          )}
        </div>

      </div>
    </div>
  )
}
