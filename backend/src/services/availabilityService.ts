import prisma from '../utils/prisma';

export class AvailabilityService {
  /**
   * Obtiene los horarios disponibles para un médico en una fecha específica.
   * @param doctorId ID del médico
   * @param dateString Fecha en formato 'YYYY-MM-DD'
   */
  async getAvailableSlots(doctorId: string, dateString: string): Promise<any[]> {
    const dateObj = new Date(dateString);
    // JavaScript getDate: 0 = Sunday, 1 = Monday. Prisma ScheduleRule: 1 = Monday, 0 = Sunday.
    const dayOfWeek = dateObj.getUTCDay(); 

    // 1. Obtener la regla de disponibilidad del médico para ese día
    const scheduleRule = await prisma.scheduleRule.findUnique({
      where: {
        doctorId_dayOfWeek: {
          doctorId,
          dayOfWeek,
        },
      },
    });

    if (!scheduleRule) {
      return []; // El médico no atiende ese día
    }

    // 2. Obtener las citas ya reservadas (CONFIRMED, o PENDING activas en los últimos 60s)
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        date: new Date(dateString),
        status: { not: 'CANCELLED' }
      },
      select: {
        startTime: true,
        status: true,
        createdAt: true
      },
    });

    const occupiedSlots = new Map<string, any>();
    const lockThreshold = new Date(Date.now() - 60 * 1000);

    for (const appt of existingAppointments) {
      if (appt.status === 'CONFIRMED' || appt.status === 'COMPLETED') {
        occupiedSlots.set(appt.startTime, { status: 'CONFIRMED' });
      } else if (appt.status === 'PENDING' && appt.createdAt >= lockThreshold) {
        if (!occupiedSlots.has(appt.startTime) || occupiedSlots.get(appt.startTime).status !== 'CONFIRMED') {
          occupiedSlots.set(appt.startTime, { 
            status: 'LOCKED', 
            lockExpiresAt: new Date(appt.createdAt.getTime() + 60 * 1000) 
          });
        }
      }
    }

    // 3. Calcular todos los slots posibles basados en la jornada
    const availableSlots: any[] = [];
    let currentSlotMin = this.timeToMinutes(scheduleRule.startTime);
    const endMin = this.timeToMinutes(scheduleRule.endTime);

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const isToday = todayStr === dateString;
    const currentMinToday = now.getHours() * 60 + now.getMinutes();

    while (currentSlotMin + scheduleRule.slotDurationMin <= endMin) {
      const slotString = this.minutesToTime(currentSlotMin);
      
      // Si el slot es hoy, el horario debe ser mayor a la hora actual
      if (!isToday || currentSlotMin > currentMinToday) {
        if (occupiedSlots.has(slotString)) {
          const occ = occupiedSlots.get(slotString);
          availableSlots.push({ time: slotString, status: occ.status, lockExpiresAt: occ.lockExpiresAt });
        } else {
          availableSlots.push({ time: slotString, status: 'AVAILABLE' });
        }
      }
      
      currentSlotMin += scheduleRule.slotDurationMin;
    }

    return availableSlots;
  }

  // Helpers para manejar horas (ej. "09:30")
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private minutesToTime(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
}

export default new AvailabilityService();
