import { Request, Response } from 'express'
import { startOfDay, isValid } from 'date-fns'
import { Page } from '../../../../services/auditService'
import { PageHandler } from '../../../interfaces/pageHandler'
import PrisonService from '../../../../services/prisonService'
import ScheduleService from '../../../../services/scheduleService'

export default class DailyScheduleHandler implements PageHandler {
  public PAGE_NAME = Page.DAILY_SCHEDULE_PAGE

  constructor(
    private readonly prisonService: PrisonService,
    private readonly scheduleService: ScheduleService,
  ) {}

  GET = async (req: Request, res: Response) => {
    const { user } = res.locals

    const dateFromQueryParam = new Date(req.query.date?.toString())
    const statusFromQueryParam = req.query.status as 'ACTIVE' | 'CANCELLED'

    const date = startOfDay(isValid(dateFromQueryParam) ? dateFromQueryParam : new Date())
    const status = ['ACTIVE', 'CANCELLED'].includes(statusFromQueryParam) ? statusFromQueryParam : 'ACTIVE'

    const [prison, schedule] = await Promise.all([
      this.prisonService.getPrison(user.activeCaseLoadId, user),
      this.scheduleService.getSchedule(
        user.activeCaseLoadId,
        startOfDay(isValid(date) ? date : new Date()),
        status,
        user,
      ),
    ])

    res.render('pages/dailySchedule/dailySchedule', {
      prisonName: prison.prisonName,
      schedule,
      date,
      isPastDay: startOfDay(date) < startOfDay(new Date()),
      status,
    })
  }
}
