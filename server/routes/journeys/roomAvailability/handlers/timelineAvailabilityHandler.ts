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

export default class TimelineAvailabilityHandler implements PageHandler {
  constructor(private readonly roomAvailabilityService: RoomAvailabilityService) {}

  public PAGE_NAME = Page.TIMELINE_AVAILABILITY_PAGE

  public BODY = Body

  GET = async (req: Request, res: Response) => {
    const { user } = res.locals
    const enabledPrisons = config.featureToggles.roomAvailabilityEnabledPrisons?.split(',')

    if (enabledPrisons && enabledPrisons.includes(user.activeCaseLoadId)) {
      const prison = req.middleware!.prison!

      // Use the query parameter date in preference or default to today if a weekday, or the next Monday
      const dateFromQueryParam = new Date(req.query.date?.toString())
      const date = startOfDay(isValid(dateFromQueryParam) ? dateFromQueryParam : new Date())
      const weekDay = isWeekend(date) ? nextMonday(date) : date

      // Default to the morning period if nothing is provided in the URL params
      const period: Period = <Period>req.query.period || 'AM'

      // Get the session data to display in the template
      const sessionData = await this.roomAvailabilityService.getTimelineAvailability(prison.code, weekDay, period, user)

      res.render('pages/roomAvailability/timelineAvailability', {
        prison,
        date: weekDay,
        period,
        appointmentsLink: `${config.activitiesAndAppointmentsUrl}/appointments/create/start-group`,
        sessionData,
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
