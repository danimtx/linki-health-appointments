import { Router } from 'express';
import appointmentController from '../controllers/appointmentController';
import { requireAuth } from '../middlewares/authMiddleware';

const router = Router();

// GET /api/v1/availability/doctors/:doctorId?date=YYYY-MM-DD
router.get('/availability/doctors/:doctorId', appointmentController.getAvailability.bind(appointmentController));

// POST /api/v1/appointments/lock (Requiere autenticación)
router.post('/appointments/lock', requireAuth, appointmentController.lockAppointment.bind(appointmentController));

// PUT /api/v1/appointments/:id/confirm (Requiere autenticación)
router.put('/appointments/:id/confirm', requireAuth, appointmentController.confirmAppointment.bind(appointmentController));

// GET /api/v1/appointments (Requiere autenticación)
router.get('/appointments', requireAuth, appointmentController.getPatientAppointments.bind(appointmentController));

export default router;
