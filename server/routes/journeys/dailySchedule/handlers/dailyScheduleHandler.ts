import { Request, Response } from 'express'
import { startOfDay, isValid } from 'date-fns'
import { Page } from '../../../../services/auditService'
import { PageHandler } from '../../../interfaces/pageHandler'
import PrisonService from '../../../../services/prisonService'
import ScheduleService from '../../../../services/scheduleService'
import ReferenceDataService from '../../../../services/referenceDataService'

export default class DailyScheduleHandler implements PageHandler {
  public PAGE_NAME = Page.DAILY_SCHEDULE_PAGE

  constructor(
    private readonly referenceDataService: ReferenceDataService,
    private readonly prisonService: PrisonService,
    private readonly scheduleService: ScheduleService,
  ) {}

  GET = async (req: Request, res: Response) => {
    const { user } = res.locals

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
          appointmentsRolledOut,
          appointmentTypes,
          appointmentLocations,
          courtsAndProbationTeams,
          wings,
        })
      : res.render('pages/dailySchedule/cancelledAppointments', {
          prisonName: prison.prisonName,
          schedule,
          date,
        })
  }
}
