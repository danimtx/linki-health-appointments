import { Request, Response, NextFunction } from 'express';
import availabilityService from '../services/availabilityService';
import appointmentService from '../services/appointmentService';
import { AuthRequest } from '../middlewares/authMiddleware';

export class AppointmentController {
  async getAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const doctorId = req.params.doctorId;
      const date = req.query.date as string;

      if (!doctorId || !date) {
        return res.status(400).json({ success: false, message: 'doctorId y date son requeridos' });
      }

      const slots = await availabilityService.getAvailableSlots(doctorId, date);
      res.json({ success: true, data: slots });
    } catch (error) {
      next(error);
    }
  }

  async lockAppointment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const patientId = req.user?.id;
      const { doctor_id, date, start_time } = req.body;
      const doctorId = doctor_id || req.body.doctorId;
      const startTime = start_time || req.body.startTime;

      if (!patientId || !doctorId || !date || !startTime) {
        return res.status(400).json({ success: false, message: 'Faltan campos requeridos' });
      }

      const appointment = await appointmentService.lockAppointment({ patientId, doctorId, date, startTime });
      res.status(201).json({ success: true, data: appointment, message: 'Horario bloqueado por 30 segundos' });
    } catch (error: any) {
      if (error.message === 'SLOT_OCCUPIED') {
        return res.status(409).json({ success: false, message: 'El horario seleccionado ya no está disponible. Por favor, elige otro.' });
      }
      next(error);
    }
  }

  async confirmAppointment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const patientId = req.user?.id;
      const appointmentId = req.params.id;

      if (!patientId || !appointmentId) {
        return res.status(400).json({ success: false, message: 'Faltan campos requeridos' });
      }

      const appointment = await appointmentService.confirmAppointment(appointmentId, patientId);
      res.json({ success: true, data: appointment, message: 'Cita confirmada con éxito' });
    } catch (error: any) {
      if (error.message === 'LOCK_EXPIRED') {
        return res.status(408).json({ success: false, message: 'El tiempo de reserva (30s) ha expirado. Debes seleccionar el horario nuevamente.' });
      }
      if (error.message === 'NOT_FOUND') {
        return res.status(404).json({ success: false, message: 'Cita no encontrada.' });
      }
      next(error);
    }
  }

  async getPatientAppointments(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const patientId = req.user?.id;
      if (!patientId) return res.status(400).json({ success: false, message: 'patientId es requerido' });

      const appointments = await appointmentService.getPatientAppointments(patientId);
      res.json({ success: true, data: appointments });
    } catch (error) {
      next(error);
    }
  }
}

export default new AppointmentController();
