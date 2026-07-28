// eslint-disable-next-line max-classes-per-file
import { Request, Response } from 'express'
import { Expose, Transform } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'
import {
  formatDate,
  isMonday,
  isThursday,
  isTuesday,
  isValid,
  isWednesday,
  isWeekend,
  nextFriday,
  nextMonday,
  nextThursday,
  nextTuesday,
  nextWednesday,
  previousMonday,
  startOfDay,
} from 'date-fns'
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

export default class WorkingWeekAvailabilityCheckerHandler implements PageHandler {
  constructor(private readonly roomAvailabilityService: RoomAvailabilityService) {}

  public PAGE_NAME = Page.WOKRING_WEEK_AVAILABILTY_CHECKER_PAGE

  public BODY = Body

  GET = async (req: Request, res: Response) => {
    const enabledPrisons = config.featureToggles.availabilityCheckerPrisons?.split(',')
    const { user } = res.locals

    if (enabledPrisons && enabledPrisons.includes(user.activeCaseLoadId)) {
      const prison = req.middleware!.prison!
      const dateFromQueryParam = new Date(req.query.date?.toString())
      const date = startOfDay(isValid(dateFromQueryParam) ? dateFromQueryParam : new Date())
      const weekDay = isWeekend(date) ? nextMonday(date) : date
      const period: Period = <Period>req.query.period || 'AM'
      const { startDate, endDate } = this.startAndEndOfWeek(weekDay)

      const [mondayAvailability, tuesdayAvailability, wednesdayAvailability, thursdayAvailability, fridayAvailability] =
        await Promise.all([
          this.roomAvailabilityService.getRoomAvailability(prison.code, startDate, startDate, period, user),
          this.roomAvailabilityService.getRoomAvailability(
            prison.code,
            nextTuesday(startDate),
            nextTuesday(startDate),
            period,
            user,
          ),
          this.roomAvailabilityService.getRoomAvailability(
            prison.code,
            nextWednesday(startDate),
            nextWednesday(startDate),
            period,
            user,
          ),
          this.roomAvailabilityService.getRoomAvailability(
            prison.code,
            nextThursday(startDate),
            nextThursday(startDate),
            period,
            user,
          ),
          this.roomAvailabilityService.getRoomAvailability(prison.code, endDate, endDate, period, user),
        ])

      res.render('pages/availabilityChecker/workingWeekAvailabilityChecker', {
        prison,
        date: weekDay,
        period,
        appointmentsLink: `${config.activitiesAndAppointmentsUrl}/appointments`,
        monday: startDate,
        tuesday: nextTuesday(startDate),
        wednesday: nextWednesday(startDate),
        thursday: nextThursday(startDate),
        friday: endDate,
        mondayAvailability,
        tuesdayAvailability,
        wednesdayAvailability,
        thursdayAvailability,
        fridayAvailability,
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

    const weekDay = startOfDay(date)

    let selectedDay

    if (isMonday(weekDay)) {
      selectedDay = '#monday'
    } else if (isTuesday(weekDay)) {
      selectedDay = '#tuesday'
    } else if (isWednesday(weekDay)) {
      selectedDay = '#wednesday'
    } else if (isThursday(weekDay)) {
      selectedDay = '#thursday'
    } else {
      selectedDay = '#friday'
    }

    return res.redirect(`availability-checker?${queryParams}${selectedDay}`)
  }

  private startAndEndOfWeek = (date: Date) => {
    if (isMonday(date)) {
      return {
        startDate: date,
        endDate: nextFriday(date),
      }
    }

    return {
      startDate: previousMonday(date),
      endDate: nextFriday(previousMonday(date)),
    }
  }
}
