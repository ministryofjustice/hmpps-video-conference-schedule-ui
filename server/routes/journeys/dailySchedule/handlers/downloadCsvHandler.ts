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

    const dateFromQueryParam = new Date(req.query.date?.toString())
    const statusFromQueryParam = req.query.status as 'ACTIVE' | 'CANCELLED'

    const date = startOfDay(isValid(dateFromQueryParam) ? dateFromQueryParam : new Date())
    const status = ['ACTIVE', 'CANCELLED'].includes(statusFromQueryParam) ? statusFromQueryParam : 'ACTIVE'

    const schedule = await this.scheduleService.getSchedule(
      user.activeCaseLoadId,
      startOfDay(isValid(date) ? date : new Date()),
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
        prisonerName: convertToTitleCase(`${a.prisoner.firstName} ${a.prisoner.lastName}`),
        prisonerNumber: a.prisoner.prisonerNumber,
        cellNumber: a.prisoner.cellLocation,
        appointmentStartTime: a.startTime,
        appointmentEndTime: a.endTime || '',
        appointmentType: a.appointmentType,
        appointmentSubtype: a.appointmentSubtype || '',
        roomLocation: a.appointmentLocationDescription,
        courtOrProbationTeam: a.externalAgencyDescription || '',
        videoLink: a.videoLink || '',
        lastUpdated: formatDate(a.lastUpdatedOrCreated, "d MMMM yyyy 'at' HH:mm"),
        dateExported: formatDate(new Date(), "d MMMM yyyy 'at' HH:mm"),
      })),
    )
  }
}
