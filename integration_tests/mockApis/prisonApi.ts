import { stubGet } from './wiremock'

export default {
  stubPrisonApiPing: () => stubGet('/prison-api/health/ping'),
  stubGetAppointments: () =>
    stubGet('/prison-api/api/schedules/MDI/appointments\\?date=.*', [
      {
        id: 1,
        offenderNo: 'G9566GQ',
        startTime: '2024-12-12T07:45:00Z',
        endTime: '2024-12-12T08:00:00Z',
        locationId: 1,
        locationDescription: 'ROOM 1',
        appointmentTypeCode: 'VLB',
        appointmentTypeDescription: 'Video Link - Court Hearing',
      },
      {
        id: 2,
        offenderNo: 'G9566GQ',
        startTime: '2024-12-12T08:00:00Z',
        endTime: '2024-12-12T09:00:00Z',
        locationId: 1,
        locationDescription: 'ROOM 1',
        appointmentTypeCode: 'VLB',
        appointmentTypeDescription: 'Video Link - Court Hearing',
      },
      {
        id: 3,
        offenderNo: 'G9566GQ',
        startTime: '2024-12-12T09:00:00Z',
        endTime: '2024-12-12T09:15:00Z',
        locationId: 1,
        locationDescription: 'ROOM 1',
        appointmentTypeCode: 'VLB',
        appointmentTypeDescription: 'Video Link - Court Hearing',
      },
    ]),
}
