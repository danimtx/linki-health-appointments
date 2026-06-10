const API_BASE = 'http://localhost:3000/api/v1'

export interface Specialty {
  id: string
  name: string
  iconUrl?: string
  description?: string
}

export interface Doctor {
  id: string
  name: string
  bio: string
  specialty: string
  rating?: number
}

import { useAuthStore } from './store'

export interface AppointmentPayload {
  doctor_id: string
  date: string
  start_time: string
}

export interface Slot {
  time: string;
  status: 'AVAILABLE' | 'LOCKED' | 'CONFIRMED';
  lockExpiresAt?: string;
}

const getAuthHeaders = (): Record<string, string> => {
  const token = useAuthStore.getState().token
  return token ? { 'Authorization': `Bearer ${token}` } : {}
}

export const api = {
  auth: {
    login: async (credentials: any) => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      })
      if (!res.ok) throw new Error('Login failed')
      return res.json()
    },
    register: async (data: any) => {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Register failed')
      return res.json()
    }
  },

  getSpecialties: async (): Promise<Specialty[]> => {
    try {
      const res = await fetch(`${API_BASE}/clinical/specialties`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      if (Array.isArray(data)) return data
      if (data && Array.isArray(data.data)) return data.data
      throw new Error('Invalid format')
    } catch (e) {
      // Mock fallback for demonstration
      return [
        { id: '1', name: 'Cardiología', description: 'Cuidado del corazón y sistema circulatorio' },
        { id: '2', name: 'Pediatría', description: 'Atención médica integral para niños y adolescentes' },
        { id: '3', name: 'Dermatología', description: 'Especialistas en piel, cabello y uñas' },
        { id: '4', name: 'Neurología', description: 'Trastornos del sistema nervioso' },
      ]
    }
  },
  
  getDoctors: async (specialtyId: string): Promise<Doctor[]> => {
    try {
      const res = await fetch(`${API_BASE}/clinical/doctors?specialty_id=${specialtyId}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      if (Array.isArray(data)) return data
      if (data && Array.isArray(data.data)) return data.data
      throw new Error('Invalid format')
    } catch (e) {
      // Mock fallback
      return [
        { id: '101', name: 'Dra. Elena Ramos', bio: 'Especialista con 10 años de experiencia.', specialty: 'Cardiología', rating: 4.9 },
        { id: '102', name: 'Dr. Carlos Mendoza', bio: 'Egresado de la UBA, experto en arritmias.', specialty: 'Cardiología', rating: 4.7 },
      ]
    }
  },

  getAvailability: async (doctorId: string, date: string): Promise<Slot[]> => {
    try {
      const res = await fetch(`${API_BASE}/availability/doctors/${doctorId}?date=${date}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      if (Array.isArray(data)) return data
      if (data && Array.isArray(data.data)) return data.data
      throw new Error('Invalid format')
    } catch (e) {
      // Mock fallback
      return [
        { time: '09:00', status: 'AVAILABLE' }, 
        { time: '09:30', status: 'AVAILABLE' }, 
        { time: '10:00', status: 'CONFIRMED' }, 
        { time: '11:30', status: 'LOCKED', lockExpiresAt: new Date(Date.now() + 30000).toISOString() }, 
        { time: '14:00', status: 'AVAILABLE' }
      ]
    }
  },

  lockAppointment: async (payload: AppointmentPayload): Promise<any> => {
    const res = await fetch(`${API_BASE}/appointments/lock`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(payload)
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Locking failed')
    return data
  },

  confirmAppointment: async (appointmentId: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/appointments/${appointmentId}/confirm`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Confirmation failed')
    return data
  },

  getAppointments: async (): Promise<any[]> => {
    const res = await fetch(`${API_BASE}/appointments`, {
      headers: { ...getAuthHeaders() }
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Failed to fetch')
    if (Array.isArray(data)) return data
    if (data && Array.isArray(data.data)) return data.data
    return []
  }
}
