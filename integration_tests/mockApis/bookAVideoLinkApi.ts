import { format } from 'date-fns'
import type { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import { formatDate } from '../../server/utils/utils'

const today = format(new Date(), 'yyyy-MM-dd')

export default {
  stubPing: (httpStatus = 200): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/book-a-video-link-api/health/ping',
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { status: httpStatus === 200 ? 'UP' : 'DOWN' },
      },
    }),
  stubGetVideoLinkBookings: (): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/book-a-video-link-api/schedule/prison/MDI\\?date=(.)*&includeCancelled=true',
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [
          {
            videoBookingId: 1292,
            prisonAppointmentId: 3194,
            bookingType: 'COURT',
            statusCode: 'ACTIVE',
            videoUrl: 'https://test-gov.uk',
            createdByPrison: false,
            courtId: 304,
            courtCode: 'ABERCV',
            courtDescription: 'Aberystwyth Civil',
            hearingType: 'APPEAL',
            hearingTypeDescription: 'Appeal',
            probationTeamId: null,
            probationTeamCode: null,
            probationTeamDescription: null,
            probationMeetingType: null,
            probationMeetingTypeDescription: null,
            prisonCode: 'MDI',
            prisonerNumber: 'G9566GQ',
            appointmentType: 'VLB_COURT_PRE',
            appointmentTypeDescription: 'Video link booking - pre hearing',
            prisonLocKey: 'MDI-RES-AWING-AWVL',
            prisonLocDesc: 'A Wing Video Link',
            dpsLocationId: '00000000-0000-0000-0000-000000000000',
            appointmentDate: today,
            startTime: '09:45',
            endTime: '10:00',
            createdTime: '2025-07-04T12:03:46.068391',
            updatedTime: '2025-07-15T11:44:31.476393',
            probationOfficerName: null,
            probationOfficerEmailAddress: null,
            notesForStaff: 'staff notes',
            notesForPrisoners: 'notes for prisoner',
            hmctsNumber: null,
            guestPin: null,
          },
          {
            videoBookingId: 1292,
            prisonAppointmentId: 3195,
            bookingType: 'COURT',
            statusCode: 'ACTIVE',
            videoUrl: null,
            createdByPrison: false,
            courtId: 304,
            courtCode: 'ABERCV',
            courtDescription: 'Aberystwyth Civil',
            hearingType: 'APPEAL',
            hearingTypeDescription: 'Appeal',
            probationTeamId: null,
            probationTeamCode: null,
            probationTeamDescription: null,
            probationMeetingType: null,
            probationMeetingTypeDescription: null,
            prisonCode: 'MDI',
            prisonerNumber: 'G9566GQ',
            appointmentType: 'VLB_COURT_MAIN',
            appointmentTypeDescription: 'Video link booking - hearing',
            prisonLocKey: 'MDI-RES-AWING-AWVL',
            prisonLocDesc: 'A Wing Video Link',
            dpsLocationId: '00000000-0000-0000-0000-000000000000',
            appointmentDate: today,
            startTime: '10:00',
            endTime: '11:00',
            createdTime: '2025-07-04T12:03:46.068391',
            updatedTime: '2025-07-15T11:44:31.476393',
            probationOfficerName: null,
            probationOfficerEmailAddress: null,
            notesForStaff: 'staff notes',
            notesForPrisoners: 'notes for prisoner',
            hmctsNumber: null,
            guestPin: '4567',
          },
          {
            videoBookingId: 1292,
            prisonAppointmentId: 3196,
            bookingType: 'COURT',
            statusCode: 'ACTIVE',
            videoUrl: 'https://test-gov.uk',
            createdByPrison: false,
            courtId: 304,
            courtCode: 'ABERCV',
            courtDescription: 'Aberystwyth Civil',
            hearingType: 'APPEAL',
            hearingTypeDescription: 'Appeal',
            probationTeamId: null,
            probationTeamCode: null,
            probationTeamDescription: null,
            probationMeetingType: null,
            probationMeetingTypeDescription: null,
            prisonCode: 'MDI',
            prisonerNumber: 'G9566GQ',
            appointmentType: 'VLB_COURT_POST',
            appointmentTypeDescription: 'Video link booking - post hearing',
            prisonLocKey: 'MDI-RES-AWING-AWVL',
            prisonLocDesc: 'A Wing Video Link',
            dpsLocationId: '00000000-0000-0000-0000-000000000000',
            appointmentDate: today,
            startTime: '11:00',
            endTime: '11:15',
            createdTime: '2025-07-04T12:03:46.068391',
            updatedTime: '2025-07-15T11:44:31.476393',
            probationOfficerName: null,
            probationOfficerEmailAddress: null,
            notesForStaff: 'staff notes',
            notesForPrisoners: 'notes for prisoner',
            hmctsNumber: null,
            guestPin: null,
            checkAvailability: true,
          },
        ],
      },
    }),
  stubGetCourts: (): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/book-a-video-link-api/courts',
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [],
      },
    }),
  stubGetProbationTeams: (): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/book-a-video-link-api/probation-teams',
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [],
      },
    }),
  stubGetPrison: (pickUpTime: number = 30): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/book-a-video-link-api/prisons/MDI',
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          prisonId: 1,
          code: 'MDI',
          name: 'Moorland (HMP)',
          enabled: true,
          pickUpTime,
        },
      },
    }),
  stubGetPrisonNoPickupTime: (): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/book-a-video-link-api/prisons/MDI',
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          prisonId: 1,
          code: 'MDI',
          name: 'Moorland (HMP)',
          enabled: true,
          pickUpTime: null,
        },
      },
    }),
  stubGetVideoLinkEvents: ({
    monday,
    tuesday,
    wednesday,
    thursday,
    friday,
  }: {
    monday: Date
    tuesday: Date
    wednesday: Date
    thursday: Date
    friday: Date
  }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        urlPattern: '/book-a-video-link-api/video-events/prison/MDI/list-by-location',
        bodyPatterns: [
          {
            equalToJson: {
              startDate: formatDate(monday, 'yyyy-MM-dd'),
              endDate: formatDate(friday, 'yyyy-MM-dd'),
            },
          },
        ],
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          prisonCode: 'MDI',
          startDate: formatDate(monday, 'yyyy-MM-dd'),
          endDate: formatDate(friday, 'yyyy-MM-dd'),
          locations: [
            {
              dpsLocationId: 'vvc-room-1',
              localName: 'VCC Room 1',
              capacity: 6,
              events: [
                {
                  eventDate: formatDate(monday, 'yyyy-MM-dd'),
                  startTime: '08:00',
                  endTime: '09:00',
                },
                {
                  eventDate: formatDate(monday, 'yyyy-MM-dd'),
                  startTime: '10:00',
                  endTime: '10:30',
                },
                {
                  eventDate: formatDate(monday, 'yyyy-MM-dd'),
                  startTime: '12:00',
                  endTime: '12:15',
                },
                {
                  eventDate: formatDate(monday, 'yyyy-MM-dd'),
                  startTime: '12:30',
                  endTime: '12:45',
                },
                {
                  eventDate: formatDate(tuesday, 'yyyy-MM-dd'),
                  startTime: '08:40',
                  endTime: '09:00',
                },
                {
                  eventDate: formatDate(wednesday, 'yyyy-MM-dd'),
                  startTime: '08:00',
                  endTime: '09:00',
                },
                {
                  eventDate: formatDate(wednesday, 'yyyy-MM-dd'),
                  startTime: '10:00',
                  endTime: '11:00',
                },
                {
                  eventDate: formatDate(wednesday, 'yyyy-MM-dd'),
                  startTime: '12:00',
                  endTime: '13:00',
                },
                {
                  eventDate: formatDate(thursday, 'yyyy-MM-dd'),
                  startTime: '11:30',
                  endTime: '12:00',
                },
                {
                  eventDate: formatDate(friday, 'yyyy-MM-dd'),
                  startTime: '08:00',
                  endTime: '09:00',
                },
                {
                  eventDate: formatDate(friday, 'yyyy-MM-dd'),
                  startTime: '09:00',
                  endTime: '10:00',
                },
                {
                  eventDate: formatDate(friday, 'yyyy-MM-dd'),
                  startTime: '10:00',
                  endTime: '11:00',
                },
                {
                  eventDate: formatDate(friday, 'yyyy-MM-dd'),
                  startTime: '11:00',
                  endTime: '12:00',
                },
                {
                  eventDate: formatDate(friday, 'yyyy-MM-dd'),
                  startTime: '12:00',
                  endTime: '13:00',
                },
              ],
            },
          ],
        },
      },
    }),
}
