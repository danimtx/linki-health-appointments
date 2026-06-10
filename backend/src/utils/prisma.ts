import { PrismaClient } from '@prisma/client';

// Agregamos un log para ver en consola las queries (opcional, útil para debugging)
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

export default prisma;
