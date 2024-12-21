import { Request, Response } from 'express'
import { Page } from '../../../../services/auditService'
import { PageHandler } from '../../../interfaces/pageHandler'
import PrisonService from '../../../../services/prisonService'

export default class DailyScheduleHandler implements PageHandler {
  public PAGE_NAME = Page.DAILY_SCHEDULE_PAGE

  constructor(private readonly prisonService: PrisonService) {}

  GET = async (req: Request, res: Response) => {
    const { user } = res.locals

    const prison = await this.prisonService.getPrison(user.activeCaseLoadId, user)

    res.render('pages/dailySchedule/dailySchedule', {
      prisonName: prison.prisonName,
    })
  }
}
