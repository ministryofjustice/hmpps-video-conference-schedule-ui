import * as converter from 'json-2-csv'
import { Request, Response } from 'express'
import { startOfDay, isValid } from 'date-fns'
import { Page } from '../../../../services/auditService'
import { PageHandler } from '../../../interfaces/pageHandler'
import ScheduleService, { DailySchedule } from '../../../../services/scheduleService'
import { convertToTitleCase, formatDate } from '../../../../utils/utils'

export default class DownloadCsvHandler implements PageHandler {
  public PAGE_NAME = Page.DOWNLOAD_DAILY_SCHEDULE

  constructor(private readonly scheduleService: ScheduleService) {}

  GET = async (req: Request, res: Response) => {
    const { user } = res.locals
    const filters = req.session.journey?.scheduleFilters

    const dateFromQueryParam = new Date(req.query.date?.toString())
    const statusFromQueryParam = req.query.status as 'ACTIVE' | 'CANCELLED'

    const date = startOfDay(isValid(dateFromQueryParam) ? dateFromQueryParam : new Date())
    const status = ['ACTIVE', 'CANCELLED'].includes(statusFromQueryParam) ? statusFromQueryParam : 'ACTIVE'

    const schedule = await this.scheduleService.getSchedule(
      user.activeCaseLoadId,
      startOfDay(isValid(date) ? date : new Date()),
      filters,
      status,
      user,
    )

    const csv = converter.json2csv(this.convertScheduleToCsvRows(schedule))
    res.header('Content-Type', 'text/csv')
    res.attachment(`daily-schedule${status === 'CANCELLED' ? '-cancelled' : ''}-${formatDate(date, 'yyyy-MM-dd')}.csv`)
    res.send(csv)
  }

  private convertScheduleToCsvRows = (schedule: DailySchedule) => {
    return schedule.appointmentGroups.flatMap(group =>
      group.map(a => ({
        'Prisoner name': convertToTitleCase(`${a.prisoner.firstName} ${a.prisoner.lastName}`),
        'Prison number': a.prisoner.prisonerNumber,
        'Cell number': a.prisoner.cellLocation,
        'Appointment start time': a.startTime,
        'Appointment end time': a.endTime || '',
        'Appointment type': a.appointmentTypeDescription,
        'Appointment subtype': a.appointmentSubtypeDescription || '',
        'Room location': a.appointmentLocationDescription,
        'Court or probation team': a.externalAgencyDescription || '',
        'Video link': a.videoLink || '',
        'Last updated': formatDate(a.lastUpdatedOrCreated, "d MMMM yyyy 'at' HH:mm"),
      })),
    )
  }
}
