import * as converter from 'json-2-csv'
import { Request, Response } from 'express'
import { startOfDay, isValid, formatDate } from 'date-fns'
import { Page } from '../../../../services/auditService'
import { PageHandler } from '../../../interfaces/pageHandler'
import ScheduleService from '../../../../services/scheduleService'

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

    const csv = converter.json2csv(schedule.appointmentGroups.flat())
    res.header('Content-Type', 'text/csv')
    res.attachment(`daily-schedule${status === 'CANCELLED' ? '-cancelled' : ''}-${formatDate(date, 'yyyy-MM-dd')}.csv`)
    res.send(csv)
  }
}
