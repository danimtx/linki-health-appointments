import prisma from '../utils/prisma';
import { Prisma } from '@prisma/client';

export class AppointmentService {
  /**
   * Bloquea un slot por 30 segundos (PENDING)
   */
  async lockAppointment(data: { patientId: string; doctorId: string; date: string; startTime: string }) {
    try {
      return await prisma.$transaction(async (tx) => {
        const lockThreshold = new Date(Date.now() - 60 * 1000);
      const existingAppt = await tx.appointment.findFirst({
        where: {
          doctorId: data.doctorId,
          date: new Date(data.date + 'T12:00:00Z'),
          startTime: data.startTime,
          OR: [
            { status: 'CONFIRMED' },
            { status: 'COMPLETED' },
            { status: 'PENDING', createdAt: { gte: lockThreshold } }
          ]
        },
      });

      if (existingAppt) throw new Error('SLOT_OCCUPIED');

      const dateObj = new Date(data.date + 'T12:00:00Z');
      const dayOfWeek = dateObj.getUTCDay();
      const rule = await tx.scheduleRule.findUnique({
        where: { doctorId_dayOfWeek: { doctorId: data.doctorId, dayOfWeek } },
      });

      if (!rule) throw new Error('INVALID_SCHEDULE');

      const [h, m] = data.startTime.split(':').map(Number);
      let totalMins = h * 60 + m + rule.slotDurationMin;
      const endH = Math.floor(totalMins / 60);
      const endM = totalMins % 60;
      const endTime = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;

      // Delete any expired pending lock for this exact user/slot before inserting new to avoid clutter
      await tx.appointment.deleteMany({
        where: { patientId: data.patientId, doctorId: data.doctorId, date: new Date(data.date + 'T12:00:00Z'), startTime: data.startTime, status: 'PENDING' }
      });

      return await tx.appointment.create({
        data: {
          patientId: data.patientId,
          doctorId: data.doctorId,
          date: new Date(data.date + 'T12:00:00Z'),
          startTime: data.startTime,
          endTime,
          status: 'PENDING', // Locked for 60s
        },
      });
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });
    } catch (e: any) {
      // P2034 is Prisma's error code for transaction conflict/serialization failure
      if (e.code === 'P2034' || e.message.includes('serialization') || e.message.includes('SLOT_OCCUPIED')) {
        throw new Error('SLOT_OCCUPIED');
      }
      throw e;
    }
  }

  /**
   * Confirma una cita PENDING si no ha expirado
   */
  async confirmAppointment(appointmentId: string, patientId: string) {
    return await prisma.$transaction(async (tx) => {
      const appt = await tx.appointment.findUnique({ where: { id: appointmentId } });
      if (!appt || appt.patientId !== patientId) throw new Error('NOT_FOUND');
      if (appt.status === 'CONFIRMED') return appt;
      
      const lockThreshold = new Date(Date.now() - 60 * 1000);
      if (appt.status === 'PENDING' && appt.createdAt < lockThreshold) {
        throw new Error('LOCK_EXPIRED');
      }

      return await tx.appointment.update({
        where: { id: appointmentId },
        data: { status: 'CONFIRMED' }
      });
    });
  }

  /**
   * Obtiene las citas de un paciente
   */
  async getPatientAppointments(patientId: string) {
    return prisma.appointment.findMany({
      where: { patientId },
      include: {
        doctor: {
          include: { user: true, specialty: true }
        }
      },
      orderBy: { date: 'desc' },
    });
  }
}

export default new AppointmentService();
