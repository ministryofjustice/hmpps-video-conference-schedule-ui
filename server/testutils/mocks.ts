import { OfficialVisitSearchResults, OfficialVisit } from '../@types/officialVisitsApi/types'

export const mockPrisoner = {
  firstName: 'John',
  lastName: 'Smith',
  prisonerNumber: 'A1337AA',
  prisonCode: 'MDI',
  dateOfBirth: '1989-06-01',
  cellLocation: '1-1-001',
  prisonName: 'Example Prison (EXP)',
}

export const mockOfficialVisit = {
  officialVisitId: 1,
  prisonCode: 'MDI',
  prisonDescription: 'Moorland (HMP & YOI)',
  visitStatus: 'SCHEDULED',
  visitStatusDescription: 'Completed',
  visitTypeCode: 'VIDEO',
  visitTypeDescription: 'Telephone',
  visitDate: '2022-12-23',
  startTime: '10:00',
  endTime: '11:00',
  dpsLocationId: 'aaaa-bbbb-9f9f9f9f-9f9f9f9f',
  locationDescription: 'Legal visits ward',
  visitSlotId: 1,
  staffNotes: 'Legal representation details',
  prisonerNotes: 'Please arrive 10 minutes early',
  visitorConcernNotes: 'string',
  numberOfVisitors: 3,
  completionCode: 'VISITOR_CANCELLED',
  completionDescription: 'string',
  createdBy: 'Fred Bloggs',
  createdTime: '2025-12-02 14:45',
  updatedBy: 'Jane Bloggs',
  updatedTime: '22025-12-04 09:50',
  visitorIssues: false,
  prisoner: {
    ...mockPrisoner,
    dateOfBirth: '2025-12-19',
    cellLocation: 'string',
    middleNames: 'string',
    offenderBookId: 0,
    attendanceCode: 'string',
    attendanceCodeDescription: 'string',
  },
} as OfficialVisit

export const mockOfficialVisitSearchResults = {
  content: [mockOfficialVisit],
  page: {
    totalElements: 1,
    totalPages: 1,
    number: 0,
    size: 10,
  },
} as OfficialVisitSearchResults
