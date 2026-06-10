import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando el seeder...');

  // Limpiar la base de datos antes de poblar (opcional, para evitar duplicados si corremos el seed varias veces)
  await prisma.appointment.deleteMany();
  await prisma.scheduleRule.deleteMany();
  await prisma.doctorProfile.deleteMany();
  await prisma.specialty.deleteMany();
  await prisma.patientProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log('Base de datos limpiada. Insertando especialidades...');

  // 1. Crear Especialidades
  const cardiologia = await prisma.specialty.create({
    data: { name: 'Cardiología', description: 'Especialista en el corazón y vasos sanguíneos' },
  });
  const pediatria = await prisma.specialty.create({
    data: { name: 'Pediatría', description: 'Atención médica de bebés, niños y adolescentes' },
  });
  const dermatologia = await prisma.specialty.create({
    data: { name: 'Dermatología', description: 'Especialista en piel, cabello y uñas' },
  });
  const medicinaGeneral = await prisma.specialty.create({
    data: { name: 'Medicina General', description: 'Primer nivel de atención médica' },
  });
  const neurologia = await prisma.specialty.create({
    data: { name: 'Neurología', description: 'Trastornos del sistema nervioso y cerebro' },
  });
  const psicologia = await prisma.specialty.create({
    data: { name: 'Psicología', description: 'Salud mental y bienestar emocional' },
  });
  console.log('Insertando médicos...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // Helper para crear médicos
  const createDoctor = async (name: string, email: string, specialtyId: string, bio: string) => {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password_hash: passwordHash,
        role: Role.DOCTOR,
        doctorProfile: {
          create: {
            specialtyId,
            bio,
            rating: 4.8 + Math.random() * 0.2, // Rating entre 4.8 y 5.0
          },
        },
      },
      include: { doctorProfile: true },
    });
    return user;
  };

  // 2. Crear Médicos (Usuarios + DoctorProfile)
  const drCarlos = await createDoctor('Dr. Carlos Rodríguez', 'carlos.rodriguez@linki.com', cardiologia.id, 'Más de 15 años de experiencia en cirugía cardiovascular.');
  const draAna = await createDoctor('Dra. Ana Martínez', 'ana.martinez@linki.com', pediatria.id, 'Especialista en desarrollo infantil y nutrición pediátrica.');
  const draLaura = await createDoctor('Dra. Laura Gómez', 'laura.gomez@linki.com', dermatologia.id, 'Experta en tratamientos para acné y cuidado preventivo de la piel.');
  const drJuan = await createDoctor('Dr. Juan Pérez', 'juan.perez@linki.com', medicinaGeneral.id, 'Atención integral para toda la familia. Promotor de la salud preventiva.');
  
  // Nuevos médicos
  const drMendoza = await createDoctor('Dr. Luis Mendoza', 'luis.mendoza@linki.com', neurologia.id, 'Subespecialista en migrañas y trastornos del sueño.');
  const draElena = await createDoctor('Dra. Elena Silva', 'elena.silva@linki.com', psicologia.id, 'Terapia cognitivo-conductual y manejo de estrés y ansiedad.');
  const drRoberto = await createDoctor('Dr. Roberto Santos', 'roberto.santos@linki.com', cardiologia.id, 'Especialista en arritmias y rehabilitación cardíaca post-infarto.');
  const draSofia = await createDoctor('Dra. Sofía Castro', 'sofia.castro@linki.com', dermatologia.id, 'Dermatología estética y tratamiento de alopecia.');

  console.log('Insertando reglas de disponibilidad (Horarios)...');

  // 3. Crear Reglas de Disponibilidad (De Lunes a Sábado, de 09:00 a 14:00)
  // dayOfWeek: 1 (Lunes) a 6 (Sábado)
  const doctors = [drCarlos, draAna, draLaura, drJuan, drMendoza, draElena, drRoberto, draSofia];

  for (const doc of doctors) {
    if (!doc.doctorProfile) continue;
    
    for (let day = 1; day <= 6; day++) {
      await prisma.scheduleRule.create({
        data: {
          doctorId: doc.doctorProfile.id,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '14:00',
          slotDurationMin: 30, // Citas de media hora
        },
      });
    }
  }

  console.log('¡Seeder ejecutado con éxito! La base de datos tiene datos.');
}

main()
  .catch((e) => {
    console.error(e);
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
