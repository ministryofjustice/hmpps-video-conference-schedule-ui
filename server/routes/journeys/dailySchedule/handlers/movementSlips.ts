import { Request, Response } from 'express'
import { isValid, startOfDay, startOfToday } from 'date-fns'
import { isNotEmpty } from 'class-validator'
import { PageHandler } from '../../../interfaces/pageHandler'
import { Page } from '../../../../services/auditService'
import PrisonService from '../../../../services/prisonService'
import ScheduleService, { DailySchedule, ScheduleItem } from '../../../../services/scheduleService'
import { convertToTitleCase, removeThirtyMinutes } from '../../../../utils/utils'

export default class MovementSlipsHandler implements PageHandler {
  public PAGE_NAME = Page.MOVEMENT_SLIPS

  constructor(
    private readonly prisonService: PrisonService,
    private readonly scheduleService: ScheduleService,
  ) {}

  GET = async (req: Request, res: Response) => {
    const { user } = res.locals
    const filters = req.session.journey?.scheduleFilters
    const dateFromQueryParam = new Date(req.query.date?.toString())
    const date = startOfDay(isValid(dateFromQueryParam) ? dateFromQueryParam : new Date())

    // Cannot print historic movement slips so redirects back to homepage if date is before today
    if (date <= startOfToday()) {
      return res.redirect('/')
    }

    const [prison, schedule] = await Promise.all([
      this.prisonService.getPrison(user.activeCaseLoadId, user),
      this.scheduleService.getSchedule(
        user.activeCaseLoadId,
        startOfDay(isValid(date) ? date : new Date()),
        filters,
        'ACTIVE',
        user,
      ),
    ])

    return res.render('pages/dailySchedule/movementSlips', {
      movementSlips: this.convertToMovementSlips(schedule, prison.prisonName, date),
    })
  }

  private convertToMovementSlips = (schedule: DailySchedule, prisonName: string, date: Date) => {
    return schedule.appointmentGroups.map(group => ({
      prisonName,
      prisonerName: convertToTitleCase(`${group[0].prisoner.firstName} ${group[0].prisoner.lastName}`),
      prisonerNumber: group[0].prisoner.prisonerNumber,
      date,
      anotherPrison: this.isAppointmentType(AppointmentType.ANOTHER_PRISON, group)
        ? {
            startTime: this.getStartTime(group, AppointmentType.ANOTHER_PRISON),
          }
        : undefined,
      court: this.isAppointmentType(AppointmentType.COURT, group)
        ? {
            preStartTime: this.getStartTime(group, AppointmentType.COURT, 'Pre-hearing'),
            startTime: this.getStartTime(group, AppointmentType.COURT, 'Court Hearing'),
            postStartTime: this.getStartTime(group, AppointmentType.COURT, 'Post-hearing'),
            hearingType: this.getHearingType(group),
          }
        : undefined,
      legal: this.isAppointmentType(AppointmentType.LEGAL, group)
        ? {
            startTime: this.getStartTime(group, AppointmentType.LEGAL),
          }
        : undefined,
      parole: this.isAppointmentType(AppointmentType.PAROLE, group)
        ? {
            startTime: this.getStartTime(group, AppointmentType.PAROLE),
          }
        : undefined,
      probation: this.isAppointmentType(AppointmentType.PROBATION, group)
        ? {
            startTime: this.getStartTime(group, AppointmentType.PROBATION),
            meetingType: this.getMeetingType(group),
          }
        : undefined,
      officialOther: this.isAppointmentType(AppointmentType.OFFICIAL_OTHER, group)
        ? {
            startTime: this.getStartTime(group, AppointmentType.OFFICIAL_OTHER),
          }
        : undefined,
      pickUpTime: removeThirtyMinutes(group[0].startTime),
      location: this.getLocation(group),
      notes: group[0].notesForPrisoner,
    }))
  }

  private isAppointmentType = (appointmentType: AppointmentType, group: ScheduleItem[]) => {
    return group.find(g => g.appointmentTypeCode === appointmentType)
  }

  private getHearingType = (group: ScheduleItem[]) =>
    group.find(
      g =>
        g.appointmentTypeCode === AppointmentType.COURT &&
        // Need to match on text as can have different text (pre/post) but same appointment type code
        g.appointmentTypeDescription.includes('Court Hearing'),
    )?.appointmentSubtypeDescription

  private getMeetingType = (group: ScheduleItem[]) =>
    group.find(g => g.appointmentTypeCode === AppointmentType.PROBATION)?.appointmentSubtypeDescription

  private getStartTimeOld = (group: ScheduleItem[], type: string) =>
    group.find(g => g.appointmentTypeDescription.includes(type))?.startTime

  private getStartTime = (group: ScheduleItem[], type: AppointmentType, desc?: string) => {
    if (desc) {
      return group.find(g => g.appointmentTypeCode === type && g.appointmentTypeDescription.includes(desc))?.startTime
    }
    return group.find(g => g.appointmentTypeCode === type)?.startTime
  }

  private getLocation = (group: ScheduleItem[]) => {
    let location = group.find(
      g => g.appointmentTypeCode === AppointmentType.ANOTHER_PRISON,
    )?.appointmentLocationDescription

    if (isNotEmpty(location)) {
      return location
    }

    location = group.find(
      g =>
        g.appointmentTypeCode === AppointmentType.COURT &&
        // Need to match on text as can have different text (pre/post) but same appointment type code
        g.appointmentTypeDescription.includes('Court Hearing'),
    )?.appointmentLocationDescription

    if (isNotEmpty(location)) {
      return location
    }

    location = group.find(g => g.appointmentTypeCode === AppointmentType.LEGAL)?.appointmentLocationDescription

    if (isNotEmpty(location)) {
      return location
    }

    location = group.find(g => g.appointmentTypeCode === AppointmentType.OFFICIAL_OTHER)?.appointmentLocationDescription

    if (isNotEmpty(location)) {
      return location
    }

    location = group.find(g => g.appointmentTypeCode === AppointmentType.PAROLE)?.appointmentLocationDescription

    if (isNotEmpty(location)) {
      return location
    }

    location = group.find(g => g.appointmentTypeCode === AppointmentType.PROBATION)?.appointmentLocationDescription

    if (isNotEmpty(location)) {
      return location
    }

    return undefined
  }
}

enum AppointmentType {
  ANOTHER_PRISON = 'VLAP',
  COURT = 'VLB',
  LEGAL = 'VLLA',
  OFFICIAL_OTHER = 'VLOO',
  PAROLE = 'VLPA',
  PROBATION = 'VLPM',
}
