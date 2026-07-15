// eslint-disable-next-line max-classes-per-file
import { Request, Response } from 'express'
import { Page } from '../../../../services/auditService'
import { PageHandler } from '../../../interfaces/pageHandler'
import config from '../../../../config'

class Body {}

export default class AvailabilityCheckerHandler implements PageHandler {
  public PAGE_NAME = Page.AVAILABILTY_CHECKER_PAGE

  public BODY = Body

  GET = async (req: Request, res: Response) => {
    const enabledPrisons = config.featureToggles.availabilityCheckerPrisons?.split(',')
    const { user } = res.locals

    if (enabledPrisons && enabledPrisons.includes(user.activeCaseLoadId)) {
      res.render('pages/availabilityChecker/availabilityChecker')
    } else {
      res.render('pages/error/404')
    }
  }
}
