import type { SuperAgentRequest } from 'superagent'
import { format } from 'date-fns'
import { stubFor } from './wiremock'
import { formatDate } from '../../server/utils/utils'

const today = format(new Date(), 'yyyy-MM-dd')

export default {
  stubPing: (httpStatus = 200): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/official-visits-api/health/ping',
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { status: httpStatus === 200 ? 'UP' : 'DOWN' },
      },
    }),
  stubGetOfficialVisits: (): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        urlPattern: '/official-visits-api/official-visit/prison/MDI/find-by-criteria\\?page=0&size=200.*',
        bodyPatterns: [
          {
            equalToJson: {
              startDate: formatDate(today, 'yyyy-MM-dd'),
              endDate: formatDate(today, 'yyyy-MM-dd'),
              visitTypes: ['VIDEO'],
            },
          },
        ],
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          content: [
            {
              officialVisitId: 1,
              prisonCode: 'MDI',
              visitStatus: 'SCHEDULED',
              visitStatusDescription: 'Scheduled',
              visitTypeCode: 'VIDEO',
              visitTypeDescription: 'Video visit',
              visitDate: formatDate(today, 'yyyy-MM-dd'),
              startTime: '10:00',
              endTime: '11:00',
              dpsLocationId: '00000000-0000-0000-0000-000000000000',
              locationDescription: 'Legal visits ward',
              visitSlotId: 1,
              staffNotes: 'Legal representation details',
              prisonerNotes: 'Please arrive 10 minutes early',
              createdBy: 'Fred Bloggs',
              createdTime: `${formatDate(today, 'yyyy-MM-dd')} 09:00`,
              prisoner: {
                prisonerNumber: 'Z5461FA',
              },
            },
            {
              officialVisitId: 2,
              prisonCode: 'MDI',
              visitStatus: 'CANCELLED',
              visitStatusDescription: 'Scheduled',
              visitTypeCode: 'VIDEO',
              visitTypeDescription: 'Video visit',
              visitDate: formatDate(today, 'yyyy-MM-dd'),
              startTime: '12:00',
              endTime: '13:00',
              dpsLocationId: '00000000-0000-0000-0000-000000000000',
              locationDescription: 'Legal visits ward',
              visitSlotId: 1,
              staffNotes: 'Legal representation details',
              prisonerNotes: 'Please arrive 10 minutes early',
              createdBy: 'Fred Bloggs',
              createdTime: `${formatDate(today, 'yyyy-MM-dd')} 09:00`,
              prisoner: {
                prisonerNumber: 'Z5461FA',
              },
            },
          ],
        },
      },
    }),
  stubGetNoOfficialVisits: (): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        urlPattern: '/official-visits-api/official-visit/prison/MDI/find-by-criteria\\?page=0&size=200.*',
        bodyPatterns: [
          {
            equalToJson: {
              startDate: formatDate(today, 'yyyy-MM-dd'),
              endDate: formatDate(today, 'yyyy-MM-dd'),
              visitTypes: ['VIDEO'],
            },
          },
        ],
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { content: [] },
      },
    }),
}
