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

export default class WeeklyAvailabilityHandler implements PageHandler {
  constructor(
    private readonly roomAvailabilityService: RoomAvailabilityService,
    private readonly telemetryService: TelemetryService,
  ) {}

  public PAGE_NAME = Page.WORKING_WEEK_AVAILABILITY_PAGE

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
      const { monday, friday } = this.startAndEndOfWeek(weekDay)
      const roomAvailability = await this.roomAvailabilityService.getRoomAvailability(
        prison.code,
        monday,
        friday,
        period,
        user,
      )

      const dayFilter = (availability: RoomAvailability, day: Date) =>
        availability.date === formatDate(day, 'yyyy-MM-dd')
      const currentWorkingWeek = this.startAndEndOfWeek(new Date())
      const isCurrentWeek = isWithinInterval(weekDay, {
        start: startOfDay(currentWorkingWeek.monday),
        end: endOfDay(currentWorkingWeek.friday),
      })

      const eventToRecord = {
        prisonCode: prison.code,
        date: formatDate(date, 'yyyy-MM-dd'),
        period,
        username: user?.username,
      }

      this.telemetryService.trackEvent('DailySchedule_ViewRoomAvailability', eventToRecord)

      res.render('pages/roomAvailability/weeklyAvailability', {
        prison,
        date: weekDay,
        period,
        appointmentsLink: `${config.activitiesAndAppointmentsUrl}/appointments/create/start-group`,
        monday,
        tuesday: nextTuesday(monday),
        wednesday: nextWednesday(monday),
        thursday: nextThursday(monday),
        friday,
        mondayAvailability: roomAvailability.filter(ra => dayFilter(ra, monday)),
        tuesdayAvailability: roomAvailability.filter(ra => dayFilter(ra, nextTuesday(monday))),
        wednesdayAvailability: roomAvailability.filter(ra => dayFilter(ra, nextWednesday(monday))),
        thursdayAvailability: roomAvailability.filter(ra => dayFilter(ra, nextThursday(monday))),
        fridayAvailability: roomAvailability.filter(ra => dayFilter(ra, friday)),
        previousWeek: previousMonday(monday),
        nextWeek: nextMonday(friday),
        currentWeekStartDate: isCurrentWeek ? undefined : startOfDay(currentWorkingWeek.monday),
        showRoomAvailabilityLaunchBanner: true,
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

    return res.redirect(`room-availability?${queryParams}${overrideTabAnchorNavigation}`)
  }

  private startAndEndOfWeek = (date: Date) => {
    if (isMonday(date)) {
      return {
        monday: date,
        friday: nextFriday(date),
      }
    }

    return {
      monday: previousMonday(date),
      friday: nextFriday(previousMonday(date)),
    }
  }
}
