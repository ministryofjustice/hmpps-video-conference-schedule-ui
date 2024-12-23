import { stubGet } from './wiremock'

export default {
  stubBookAVideoLinkPing: () => stubGet('/book-a-video-link-api/health/ping'),
  stubGetVideoLinkBookings: () =>
    stubGet('/book-a-video-link-api/schedule/prison/MDI\\?date=.*', [
      {
        videoBookingId: 1,
        prisonerNumber: 'G9566GQ',
        startTime: '07:45',
        endTime: '08:00',
        prisonLocKey: 'ROOM_1',
        appointmentType: 'VLB_COURT_PRE',
        courtDescription: 'Aberystwyth Civil',
        hearingTypeDescription: 'Appeal',
      },
      {
        videoBookingId: 1,
        prisonerNumber: 'G9566GQ',
        startTime: '08:00',
        endTime: '09:00',
        prisonLocKey: 'ROOM_1',
        appointmentType: 'VLB_COURT_MAIN',
        courtDescription: 'Aberystwyth Civil',
        hearingTypeDescription: 'Appeal',
      },
      {
        videoBookingId: 1,
        prisonerNumber: 'G9566GQ',
        startTime: '09:00',
        endTime: '09:15',
        prisonLocKey: 'ROOM_1',
        appointmentType: 'VLB_COURT_POST',
        courtDescription: 'Aberystwyth Civil',
        hearingTypeDescription: 'Appeal',
      },
    ]),
}
