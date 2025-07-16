import HmppsAuditClient, { AuditEvent } from '../data/hmppsAuditClient'

export enum Page {
  CLEAR_FILTER = 'CLEAR_FILTER',
  DAILY_SCHEDULE_PAGE = 'DAILY_SCHEDULE_PAGE',
  DOWNLOAD_DAILY_SCHEDULE = 'DOWNLOAD_DAILY_SCHEDULE',
  MOVEMENT_SLIPS = 'MOVEMENT_SLIPS',
  SELECT_DATE_PAGE = 'SELECT_DATE_PAGE',
}

export interface PageViewEventDetails {
  who: string
  subjectId?: string
  subjectType?: string
  correlationId?: string
  details?: string
}

export default class AuditService {
  constructor(private readonly hmppsAuditClient: HmppsAuditClient) {}

  async logAuditEvent(event: AuditEvent) {
    await this.hmppsAuditClient.sendMessage(event)
  }

  async logPageView(page: Page, eventDetails: PageViewEventDetails) {
    const event: AuditEvent = {
      ...eventDetails,
      what: `PAGE_VIEW_${page}`,
    }
    await this.hmppsAuditClient.sendMessage(event)
  }
}
