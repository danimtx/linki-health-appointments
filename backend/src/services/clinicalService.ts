import prisma from '../utils/prisma';

export class ClinicalService {
  /**
   * Obtiene todas las especialidades disponibles.
   */
  async getSpecialties() {
    return prisma.specialty.findMany({
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Obtiene los médicos. Opcionalmente filtra por especialidad.
   */
  async getDoctors(specialtyId?: string) {
    return prisma.doctorProfile.findMany({
      where: specialtyId ? { specialtyId } : undefined,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        specialty: {
          select: {
            name: true,
          },
        },
      },
    });
  }
}

export default new ClinicalService();
