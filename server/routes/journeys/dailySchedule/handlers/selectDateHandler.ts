// eslint-disable-next-line max-classes-per-file
import { Request, Response } from 'express'
import { Expose, Transform } from 'class-transformer'
import { formatDate, startOfToday } from 'date-fns'
import { PageHandler } from '../../../interfaces/pageHandler'
import { Page } from '../../../../services/auditService'
import IsValidDate from '../../../validators/isValidDate'
import { simpleDateToDate } from '../../../../utils/utils'

class Body {
  @Expose()
  @Transform(({ value }) => simpleDateToDate(value))
  @IsValidDate({ message: 'Enter a valid date' })
  date: Date
}

export default class SelectDateHandler implements PageHandler {
  public PAGE_NAME = Page.SELECT_DATE_PAGE

  public BODY = Body

  GET = async (req: Request, res: Response) => res.render('pages/dailySchedule/selectDate')

  POST = async (req: Request, res: Response) => {
    const { date } = req.body
    return res.redirect(`/?date=${formatDate(date, 'yyyy-MM-dd')}`)
  }
}
