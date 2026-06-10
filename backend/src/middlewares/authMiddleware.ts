import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import prisma from '../utils/prisma';

// Extender el Request de Express para inyectar el usuario
export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    email: string;
  };
}

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_ANON_KEY as string
);

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Acceso denegado. Token no proporcionado.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      throw new Error('Invalid token');
    }

    const userId = data.user.id;
    const userEmail = data.user.email || '';
    const userName = data.user.user_metadata?.name || userEmail.split('@')[0];
    const userPhone = data.user.user_metadata?.phone || null;

    // Sync user with Postgres database to ensure Foreign Keys work
    await prisma.user.upsert({
      where: { id: userId },
      update: {
        email: userEmail,
        name: userName,
        phone: userPhone,
      },
      create: {
        id: userId,
        email: userEmail,
        name: userName,
        phone: userPhone,
        password_hash: 'supabase_managed', // Dummy password since Supabase handles it
      }
    });

    req.user = {
      id: userId,
      email: userEmail,
      role: 'PATIENT',
    };
    
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    return res.status(403).json({ success: false, message: 'Token inválido o expirado.' });
  }
};
