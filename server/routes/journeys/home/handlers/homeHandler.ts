import { Request, Response } from 'express'
import { Page } from '../../../../services/auditService'
import { PageHandler } from '../../../interfaces/pageHandler'
import PrisonService from '../../../../services/prisonService'

export default class HomeHandler implements PageHandler {
  public PAGE_NAME = Page.HOME_PAGE

  constructor(private readonly prisonService: PrisonService) {}

  GET = async (req: Request, res: Response) => {
    const { user } = res.locals

    const prison = await this.prisonService.getPrison(user.activeCaseLoadId, user)

    res.render('pages/home/home', {
      prisonName: prison.prisonName,
    })
  }
}
