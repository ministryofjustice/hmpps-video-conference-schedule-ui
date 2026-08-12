// eslint-disable-next-line max-classes-per-file
import { Request, Response } from 'express'
import { Expose, Transform } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'
import {
  endOfDay,
  formatDate,
  isMonday,
  isValid,
  isWeekend,
  isWithinInterval,
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
import RoomAvailabilityService, { RoomAvailability } from '../../../../services/roomAvailabilityService'
import { Period } from '../../../../services/appointmentService'
import IsWeekDay from '../../../validators/isWeekDay'
import TelemetryService from '../../../../services/telemetryService'

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
  constructor(
    private readonly roomAvailabilityService: RoomAvailabilityService,
    private readonly telemetryService: TelemetryService,
  ) {}

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
      const roomAvailability = await this.roomAvailabilityService.getRoomAvailability(
        prison.code,
        startDate,
        endDate,
        period,
        user,
      )

      const dayFilter = (availability: RoomAvailability, day: Date) =>
        availability.date === formatDate(day, 'yyyy-MM-dd')
      const currentWeek = this.startAndEndOfWeek(new Date())
      const isCurrentWeek = isWithinInterval(weekDay, {
        start: startOfDay(currentWeek.startDate),
        end: endOfDay(currentWeek.endDate),
      })

      const eventToRecord = {
        prisonCode: prison.code,
        date: formatDate(date, 'yyyy-MM-dd'),
        period,
        username: user?.username,
      }

      this.telemetryService.trackEvent('DailySchedule_ViewAvailabilityCheck', eventToRecord)

      res.render('pages/availabilityChecker/workingWeekAvailabilityChecker', {
        prison,
        date: weekDay,
        period,
        appointmentsLink: `${config.activitiesAndAppointmentsUrl}/appointments/create/start-group`,
        monday: startDate,
        tuesday: nextTuesday(startDate),
        wednesday: nextWednesday(startDate),
        thursday: nextThursday(startDate),
        friday: endDate,
        mondayAvailability: roomAvailability.filter(ra => dayFilter(ra, startDate)),
        tuesdayAvailability: roomAvailability.filter(ra => dayFilter(ra, nextTuesday(startDate))),
        wednesdayAvailability: roomAvailability.filter(ra => dayFilter(ra, nextWednesday(startDate))),
        thursdayAvailability: roomAvailability.filter(ra => dayFilter(ra, nextThursday(startDate))),
        fridayAvailability: roomAvailability.filter(ra => dayFilter(ra, endDate)),
        previousWeek: previousMonday(startDate),
        nextWeek: nextMonday(endDate),
        currentWeekStartDate: isCurrentWeek ? undefined : startOfDay(currentWeek.startDate),
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

    // If a tab has been select prior to POST it is remembered; this makes sure it is overridden.
    const overrideTabAnchorNavigation = '#'

    return res.redirect(`availability-checker?${queryParams}${overrideTabAnchorNavigation}`)
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
