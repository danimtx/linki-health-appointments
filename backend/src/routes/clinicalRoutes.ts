import { Router } from 'express';
import clinicalController from '../controllers/clinicalController';

const router = Router();

// GET /api/v1/clinical/specialties
router.get('/specialties', clinicalController.getSpecialties.bind(clinicalController));

// GET /api/v1/clinical/doctors?specialtyId=123
router.get('/doctors', clinicalController.getDoctors.bind(clinicalController));

export default router;
