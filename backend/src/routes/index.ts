import { Router } from 'express';
import clinicalRoutes from './clinicalRoutes';
import appointmentRoutes from './appointmentRoutes';

const router = Router();

router.use('/clinical', clinicalRoutes);
router.use('/', appointmentRoutes);

export default router;
