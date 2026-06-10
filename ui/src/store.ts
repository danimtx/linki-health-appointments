import { create } from 'zustand'

export type AppointmentStep = 'specialty' | 'doctor' | 'datetime' | 'details' | 'summary' | 'success'

interface AppointmentState {
  currentStep: AppointmentStep
  specialtyId: string | null
  doctorId: string | null
  date: string | null
  time: string | null
  appointmentId: string | null
  lockExpiresAt: string | null
  patientDetails: {
    name: string
    email: string
    phone: string
  } | null
  setStep: (step: AppointmentStep) => void
  setSpecialty: (id: string) => void
  setDoctor: (id: string) => void
  setDateTime: (date: string, time: string, appointmentId?: string, lockExpiresAt?: string) => void
  setPatientDetails: (details: { name: string; email: string; phone: string }) => void
  reset: () => void
}

export const useAppointmentStore = create<AppointmentState>((set) => ({
  currentStep: 'specialty',
  specialtyId: null,
  doctorId: null,
  date: null,
  time: null,
  appointmentId: null,
  lockExpiresAt: null,
  patientDetails: null,

  setStep: (step) => set({ currentStep: step }),
  setSpecialty: (id) => set({ specialtyId: id, currentStep: 'doctor', doctorId: null, date: null, time: null, appointmentId: null, lockExpiresAt: null }),
  setDoctor: (id) => set({ doctorId: id, currentStep: 'datetime', date: null, time: null, appointmentId: null, lockExpiresAt: null }),
  setDateTime: (date, time, appointmentId, lockExpiresAt) => set({ date, time, appointmentId, lockExpiresAt, currentStep: 'details' }),
  setPatientDetails: (details) => set({ patientDetails: details, currentStep: 'summary' }),
  reset: () => set({
    currentStep: 'specialty',
    specialtyId: null,
    doctorId: null,
    date: null,
    time: null,
    appointmentId: null,
    lockExpiresAt: null,
    patientDetails: null,
  }),
}))

interface AuthState {
  token: string | null
  user: { name: string, email: string } | null
  isInitialized: boolean
  setAuth: (user: { name: string, email: string } | null, token: string | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isInitialized: false,
  setAuth: (user, token) => set({ user, token, isInitialized: true }),
  logout: () => set({ token: null, user: null })
}))
