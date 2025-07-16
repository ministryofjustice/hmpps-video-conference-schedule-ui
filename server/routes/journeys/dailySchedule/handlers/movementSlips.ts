import { Request, Response } from 'express'
import { isValid, startOfDay } from 'date-fns'
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
            startTime: this.getStartTime(group, 'Another Prison'),
          }
        : undefined,
      court: this.isAppointmentType(AppointmentType.COURT, group)
        ? {
            preStartTime: this.getStartTime(group, 'Pre-hearing'),
            startTime: this.getStartTime(group, 'Court Hearing'),
            postStartTime: this.getStartTime(group, 'Post-hearing'),
            hearingType: this.getHearingType(group),
          }
        : undefined,
      legal: this.isAppointmentType(AppointmentType.LEGAL, group)
        ? {
            startTime: this.getStartTime(group, 'Legal Appointment'),
          }
        : undefined,
      parole: this.isAppointmentType(AppointmentType.PAROLE, group)
        ? {
            startTime: this.getStartTime(group, 'Parole Hearing'),
          }
        : undefined,
      probation: this.isAppointmentType(AppointmentType.PROBATION, group)
        ? {
            startTime: this.getStartTime(group, 'Probation Meeting'),
            meetingType: this.getMeetingType(group),
          }
        : undefined,
      officialOther: this.isAppointmentType(AppointmentType.OFFICAL_OTHER, group)
        ? {
            startTime: this.getStartTime(group, 'Official Other'),
          }
        : undefined,
      pickUpTime: removeThirtyMinutes(group[0].startTime),
      location: this.getLocation(group),
      notes: group[0].notesForPrisoner,
      code: group[0].appointmentTypeCode,
    }))
  }

  private isAppointmentType = (appointmentType: AppointmentType, group: ScheduleItem[]) => {
    return group.find(g => g.appointmentTypeCode === appointmentType)
  }

  private getHearingType = (group: ScheduleItem[]) =>
    group.find(g => g.appointmentTypeDescription.startsWith('Court Hearing'))?.appointmentSubtypeDescription

  private getMeetingType = (group: ScheduleItem[]) =>
    group.find(g => g.appointmentTypeDescription.startsWith('Probation Meeting'))?.appointmentSubtypeDescription

  private getStartTime = (group: ScheduleItem[], type: string) =>
    group.find(g => g.appointmentTypeDescription.startsWith(type))?.startTime

  private getLocation = (group: ScheduleItem[]) => {
    let location = group.find(g =>
      g.appointmentTypeDescription.startsWith('Another Prison'),
    )?.appointmentLocationDescription

    if (isNotEmpty(location)) {
      return location
    }

    location = group.find(g => g.appointmentTypeDescription.startsWith('Court Hearing'))?.appointmentLocationDescription

    if (isNotEmpty(location)) {
      return location
    }

    location = group.find(g =>
      g.appointmentTypeDescription.startsWith('Legal Appointment'),
    )?.appointmentLocationDescription

    if (isNotEmpty(location)) {
      return location
    }

    location = group.find(g =>
      g.appointmentTypeDescription.startsWith('Official Other'),
    )?.appointmentLocationDescription

    if (isNotEmpty(location)) {
      return location
    }

    location = group.find(g =>
      g.appointmentTypeDescription.startsWith('Parole Hearing'),
    )?.appointmentLocationDescription

    if (isNotEmpty(location)) {
      return location
    }

    location = group.find(g =>
      g.appointmentTypeDescription.startsWith('Probation Meeting'),
    )?.appointmentLocationDescription

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
  OFFICAL_OTHER = 'VLOO',
  PAROLE = 'VLPA',
  PROBATION = 'VLPM',
}
