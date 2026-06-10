export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Linki Health API',
    version: '1.0.0',
    description: 'API documentation para el módulo de Programación de Citas',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Servidor Local',
    },
  ],
  paths: {
    '/api/v1/clinical/specialties': {
      get: {
        summary: 'Obtiene la lista de especialidades',
        tags: ['Clinical'],
        responses: {
          '200': {
            description: 'Lista de especialidades obtenida con éxito',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          name: { type: 'string' },
                          description: { type: 'string', nullable: true },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/clinical/doctors': {
      get: {
        summary: 'Obtiene la lista de doctores',
        tags: ['Clinical'],
        parameters: [
          {
            name: 'specialtyId',
            in: 'query',
            description: 'ID de la especialidad para filtrar médicos',
            required: false,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Lista de médicos obtenida con éxito',
          },
        },
      },
    },
    '/api/v1/availability/doctors/{doctorId}': {
      get: {
        summary: 'Obtiene horarios disponibles',
        tags: ['Appointments'],
        parameters: [
          { name: 'doctorId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'date', in: 'query', required: true, schema: { type: 'string', format: 'date' }, description: 'YYYY-MM-DD' }
        ],
        responses: {
          '200': { description: 'Lista de horarios (ej. ["09:00", "09:30"])' }
        }
      }
    },
    '/api/v1/appointments': {
      post: {
        summary: 'Reserva una cita médica',
        tags: ['Appointments'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  patientId: { type: 'string' },
                  doctorId: { type: 'string' },
                  date: { type: 'string', format: 'date', description: 'YYYY-MM-DD' },
                  startTime: { type: 'string', description: 'HH:mm' }
                }
              }
            }
          }
        },
        responses: {
          '201': { description: 'Cita creada' },
          '409': { description: 'El horario seleccionado ya no está disponible (Double Booking prevented)' }
        }
      },
      get: {
        summary: 'Obtiene las citas de un paciente',
        tags: ['Appointments'],
        parameters: [
          { name: 'patientId', in: 'query', required: true, schema: { type: 'string' } }
        ],
        responses: {
          '200': { description: 'Historial de citas' }
        }
      }
    }
  },
};
