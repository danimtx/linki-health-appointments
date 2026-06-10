import { Request, Response, NextFunction } from 'express';
import clinicalService from '../services/clinicalService';

export class ClinicalController {
  async getSpecialties(req: Request, res: Response, next: NextFunction) {
    try {
      const specialties = await clinicalService.getSpecialties();
      res.json({ success: true, data: specialties });
    } catch (error) {
      next(error);
    }
  }

  async getDoctors(req: Request, res: Response, next: NextFunction) {
    try {
      const specialtyId = (req.query.specialty_id || req.query.specialtyId) as string | undefined;
      const doctors = await clinicalService.getDoctors(specialtyId);
      
      // Mapeamos para devolver una estructura más limpia al frontend
      const mappedDoctors = doctors.map(doc => ({
        id: doc.id,
        name: doc.user.name,
        specialty: doc.specialty.name,
        bio: doc.bio,
        rating: doc.rating,
      }));

      res.json({ success: true, data: mappedDoctors });
    } catch (error) {
      next(error);
    }
  }
}

export default new ClinicalController();
