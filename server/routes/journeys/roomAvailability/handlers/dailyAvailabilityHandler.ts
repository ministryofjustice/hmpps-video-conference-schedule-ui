// eslint-disable-next-line max-classes-per-file
import { Request, Response } from 'express'
import { Expose, Transform } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'
import { formatDate, isValid, isWeekend, nextMonday, startOfDay } from 'date-fns'
import { Page } from '../../../../services/auditService'
import { PageHandler } from '../../../interfaces/pageHandler'
import config from '../../../../config'
import { parseDatePickerDate } from '../../../../utils/utils'
import IsValidDate from '../../../validators/isValidDate'
import RoomAvailabilityService from '../../../../services/roomAvailabilityService'
import { Period } from '../../../../services/appointmentService'
import IsWeekDay from '../../../validators/isWeekDay'

class Body {
  @Expose()
  @Transform(({ value }) => parseDatePickerDate(value))
  @IsValidDate({ message: 'Enter a valid date' })
  @IsNotEmpty({ message: 'Enter a date' })
  @IsWeekDay({ message: 'Select a working day' })
  date: Date

  @Expose()
  @IsNotEmpty({ message: 'Select a session' })
  period: string
}

export default class DailyAvailabilityHandler implements PageHandler {
  constructor(private readonly roomAvailabilityService: RoomAvailabilityService) {}

  public PAGE_NAME = Page.ROOM_AVAILABILITY_PAGE

  public BODY = Body

  GET = async (req: Request, res: Response) => {
    const enabledPrisons = config.featureToggles.roomAvailabilityEnabledPrisons?.split(',')
    const { user } = res.locals

    if (enabledPrisons && enabledPrisons.includes(user.activeCaseLoadId)) {
      const prison = req.middleware!.prison!
      const dateFromQueryParam = new Date(req.query.date?.toString())
      const date = startOfDay(isValid(dateFromQueryParam) ? dateFromQueryParam : new Date())
      const weekDay = isWeekend(date) ? nextMonday(date) : date

      const period: Period = <Period>req.query.period || 'AM'

      res.render('pages/roomAvailability/dailyAvailability', {
        prison,
        date: weekDay,
        period,
        appointmentsLink: `${config.activitiesAndAppointmentsUrl}/appointments/create/start-group`,
        roomAvailability: await this.roomAvailabilityService.getRoomAvailability(
          prison.code,
          weekDay,
          weekDay,
          period,
          user,
        ),
      })
    } else {
      res.render('pages/error/404')
    }
  }

  POST = async (req: Request, res: Response) => {
    const { date, period } = req.body
    const queryParams = new URLSearchParams({
      date: formatDate(date, 'yyyy-MM-dd'),
      period,
    })

    return res.redirect(`room-availability?${queryParams}`)
  }
}
