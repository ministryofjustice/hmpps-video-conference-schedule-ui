// eslint-disable-next-line max-classes-per-file
import { Request, Response } from 'express'
import { startOfDay, isValid } from 'date-fns'
import { Expose, Transform } from 'class-transformer'
import _ from 'lodash'
import { Page } from '../../../../services/auditService'
import { PageHandler } from '../../../interfaces/pageHandler'
import PrisonService from '../../../../services/prisonService'
import ScheduleService from '../../../../services/scheduleService'
import ReferenceDataService from '../../../../services/referenceDataService'

class Body {
  @Expose()
  @Transform(({ value }) => (value ? _.uniq([value].flat()).filter(Boolean) : undefined))
  wing: string[]

  @Expose()
  @Transform(({ value }) => (value ? _.uniq([value].flat()).filter(Boolean) : undefined))
  appointmentType: string[]

  @Expose()
  @Transform(({ value }) => (value ? _.uniq([value].flat()).filter(Boolean) : undefined))
  period: string[]

  @Expose()
  @Transform(({ value }) => (value ? _.uniq([value].flat()).filter(Boolean) : undefined))
  appointmentLocation: string[]

  @Expose()
  @Transform(({ value }) => (value ? _.uniq([value].flat()).filter(Boolean) : undefined))
  courtOrProbationTeam: string[]
}

export default class DailyScheduleHandler implements PageHandler {
  public PAGE_NAME = Page.DAILY_SCHEDULE_PAGE

  public BODY = Body

  constructor(
    private readonly referenceDataService: ReferenceDataService,
    private readonly prisonService: PrisonService,
    private readonly scheduleService: ScheduleService,
  ) {}

  GET = async (req: Request, res: Response) => {
    const { user } = res.locals
    const filters = req.session.journey?.scheduleFilters

    const dateFromQueryParam = new Date(req.query.date?.toString())
    const statusFromQueryParam = req.query.status as 'ACTIVE' | 'CANCELLED'

    const date = startOfDay(isValid(dateFromQueryParam) ? dateFromQueryParam : new Date())
    const status = ['ACTIVE', 'CANCELLED'].includes(statusFromQueryParam) ? statusFromQueryParam : 'ACTIVE'

    const [
      prison,
      appointmentsRolledOut,
      appointmentTypes,
      appointmentLocations,
      courtsAndProbationTeams,
      wings,
      schedule,
    ] = await Promise.all([
      this.prisonService.getPrison(user.activeCaseLoadId, user),
      this.prisonService.isAppointmentsRolledOutAt(user.activeCaseLoadId, user),
      this.referenceDataService.getAppointmentCategories(user),
      this.referenceDataService.getAppointmentLocations(user.activeCaseLoadId, user),
      this.referenceDataService.getCourtsAndProbationTeams(user),
      this.referenceDataService.getCellsByWing(user.activeCaseLoadId, user),
      this.scheduleService.getSchedule(
        user.activeCaseLoadId,
        startOfDay(isValid(date) ? date : new Date()),
        filters,
        status,
        user,
      ),
    ])

    return status === 'ACTIVE'
      ? res.render('pages/dailySchedule/dailySchedule', {
          prisonName: prison.prisonName,
          schedule,
          date,
          isPastDay: startOfDay(date) < startOfDay(new Date()),
          appointmentTypes,
          appointmentLocations,
          courtsAndProbationTeams,
          wings,
          appointmentsRolledOut,
        })
      : res.render('pages/dailySchedule/cancelledAppointments', {
          prisonName: prison.prisonName,
          appointmentsRolledOut,
          schedule,
          date,
        })
  }

  POST = async (req: Request, res: Response) => {
    const { wing, appointmentType, period, appointmentLocation, courtOrProbationTeam } = req.body

    req.session.journey ??= {}
    req.session.journey.scheduleFilters =
      wing || appointmentType || period || appointmentLocation || courtOrProbationTeam
        ? { wing, appointmentType, period, appointmentLocation, courtOrProbationTeam }
        : undefined

    res.redirect(req.get('Referrer') || '/')
  }
}
