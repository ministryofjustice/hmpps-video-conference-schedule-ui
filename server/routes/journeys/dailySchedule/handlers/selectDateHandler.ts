// eslint-disable-next-line max-classes-per-file
import { Request, Response } from 'express'
import { Expose, Transform } from 'class-transformer'
import { formatDate } from 'date-fns'
import { IsNotEmpty } from 'class-validator'
import { PageHandler } from '../../../interfaces/pageHandler'
import { Page } from '../../../../services/auditService'
import IsValidDate from '../../../validators/isValidDate'
import { parseDatePickerDate } from '../../../../utils/utils'

class Body {
  @Expose()
  @Transform(({ value }) => parseDatePickerDate(value))
  @IsValidDate({ message: 'Enter a valid date' })
  @IsNotEmpty({ message: 'Enter a date' })
  date: Date
}

export default class SelectDateHandler implements PageHandler {
  public PAGE_NAME = Page.SELECT_DATE_PAGE

  public BODY = Body

  GET = async (req: Request, res: Response) => res.render('pages/dailySchedule/selectDate', { date: req.query.date })

  POST = async (req: Request, res: Response) => {
    const { date } = req.body
    if (req.session.journey?.scheduleFilters) delete req.session.journey.scheduleFilters
    return res.redirect(`/?date=${formatDate(date, 'yyyy-MM-dd')}`)
  }
}
