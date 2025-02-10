import { stubGet, stubPost } from './wiremock'

export default {
  stubActivitiesAndAppointmentsPing: () => stubGet('/activities-and-appointments-api/health/ping'),
  stubIsAppointmentsRolledOut: () => stubGet('/activities-and-appointments-api/rollout/MDI', { prisonLive: true }),
  stubGetAppointments: () =>
    stubPost('/activities-and-appointments-api/appointments/MDI/search', [
      {
        appointmentId: 1,
        attendees: [{ prisonerNumber: 'G9566GQ' }],
        startTime: '07:45',
        endTime: '08:00',
        internalLocation: { id: 1, description: 'ROOM 1' },
        category: { code: 'VLB', description: 'Video Link - Court Hearing' },
      },
      {
        appointmentId: 2,
        attendees: [{ prisonerNumber: 'G9566GQ' }],
        startTime: '08:00',
        endTime: '09:00',
        internalLocation: { id: 1, description: 'ROOM 1' },
        category: { code: 'VLB', description: 'Video Link - Court Hearing' },
      },
      {
        appointmentId: 3,
        attendees: [{ prisonerNumber: 'G9566GQ' }],
        startTime: '09:00',
        endTime: '09:15',
        internalLocation: { id: 1, description: 'ROOM 1' },
        category: { code: 'VLB', description: 'Video Link - Court Hearing' },
      },
    ]),
  stubGetAppointmentCategories: () =>
    stubGet('/activities-and-appointments-api/appointment-categories', [
      {
        code: 'VLB',
        description: 'Video Link - Court Hearing',
      },
      {
        code: 'VLPM',
        description: 'Video Link - Probation Meeting',
      },
    ]),
}
