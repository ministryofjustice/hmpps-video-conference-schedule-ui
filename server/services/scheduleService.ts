import _ from 'lodash'
import {
  isAfter,
  isBefore,
  isToday,
  isTomorrow,
  isYesterday,
  parseISO,
  set,
  startOfToday,
  startOfYesterday,
  subHours,
} from 'date-fns'
import AppointmentService, { Appointment } from './appointmentService'
import BookAVideoLinkApiClient from '../data/bookAVideoLinkApiClient'
import { BvlsAppointment } from '../@types/bookAVideoLinkApi/types'
import PrisonerSearchApiClient from '../data/prisonerSearchApiClient'
import { Prisoner } from '../@types/prisonerSearchApi/types'
import { parseDate } from '../utils/utils'
import NomisMappingApiClient from '../data/nomisMappingApiClient'
import ManageUsersApiClient from '../data/manageUsersApiClient'

const RELEVANT_ALERTS = {
  ACCT_OPEN: 'HA',
  PEEP: 'PEEP',
  ESCAPE_LIST: 'XEL',
  CONTROLLED_UNLOCK: 'XCU',
  STAFF_ASSAULTER: 'XSA',
  RISK_TO_FEMALES: 'XRF',
}

type ScheduleItem = {
  appointmentId: number
  prisoner: {
    prisonerNumber: string
    firstName: string
    lastName: string
    cellLocation: string
    inPrison: boolean
    hasAlerts: boolean
  }
  status: 'ACTIVE' | 'CANCELLED'
  startTime: string
  endTime: string
  appointmentDescription: string
  appointmentLocationDescription: string
  tags: string[] // TODO: Logic for displaying "New" and "Updated" tags
  videoLinkRequired: boolean
  videoBookingId?: number
  videoLink?: string
  appointmentType?: string
  externalAgencyDescription?: string
  viewAppointmentLink: string
  cancelledTime?: string
  cancelledBy?: string
  lastUpdatedOrCreated: string
}

export type DailySchedule = {
  appointmentsListed: number
  numberOfPrisoners: number
  cancelledAppointments: number
  missingVideoLinks: number
  appointmentGroups: ScheduleItem[][]
}

export default class ScheduleService {
  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly nomisMappingApiClient: NomisMappingApiClient,
    private readonly bookAVideoLinkApiClient: BookAVideoLinkApiClient,
    private readonly prisonerSearchApiClient: PrisonerSearchApiClient,
    private readonly manageUsersApiClient: ManageUsersApiClient,
  ) {}

  public async getSchedule(
    prisonId: string,
    date: Date,
    showStatus: 'ACTIVE' | 'CANCELLED',
    user: Express.User,
  ): Promise<DailySchedule> {
    const [scheduledAppointments, bvlsAppointments] = await Promise.all([
      this.appointmentService.getVideoLinkAppointments(prisonId, date, user),
      this.bookAVideoLinkApiClient.getVideoLinkAppointments(prisonId, date, user),
    ])

    const prisoners = await this.prisonerSearchApiClient.getByPrisonerNumbers(
      _.uniq(scheduledAppointments.map(appointment => appointment.offenderNo)),
      user,
    )

    const scheduleItems = await Promise.all(
      scheduledAppointments.map(appointment => this.createScheduleItem(appointment, bvlsAppointments, prisoners, user)),
    )

    // TODO: Apply filter rules here
    const filteredItems = scheduleItems.filter(() => true)

    const displayItems = filteredItems.filter(item => item.status === showStatus)

    const groupedAppointments = _.chain(displayItems)
      .groupBy(item => item.videoBookingId ?? item.appointmentId + item.prisoner.prisonerNumber)
      .sortBy(groups => groups[0].startTime)
      .value()

    return {
      cancelledAppointments: filteredItems.filter(item => item.status === 'CANCELLED').length,
      appointmentsListed: displayItems.length,
      numberOfPrisoners: _.uniq(displayItems.map(item => item.prisoner.prisonerNumber)).length,
      missingVideoLinks: displayItems.filter(item => item.videoLinkRequired && !item.videoLink).length,
      appointmentGroups: Object.values(groupedAppointments),
    }
  }

  private async createScheduleItem(
    scheduledAppointment: Appointment,
    bvlsAppointments: BvlsAppointment[],
    prisoners: Prisoner[],
    user: Express.User,
  ): Promise<ScheduleItem> {
    const bvlsAppointment = await this.matchBvlsAppointmentTo(scheduledAppointment, bvlsAppointments, user)
    const createdTime = bvlsAppointment?.createdTime || scheduledAppointment.createdTime
    const updatedTime = bvlsAppointment?.updatedTime || scheduledAppointment.updatedTime
    const videoLinkRequired = bvlsAppointment?.appointmentType === 'VLB_COURT_MAIN'

    const buildTags = () => {
      const appointmentDate = parseDate(scheduledAppointment.date)
      const createdTimeParsed = createdTime && parseISO(createdTime)
      const updatedTimeParsed = updatedTime && parseISO(updatedTime)

      const isInRange = (time: Date, start: Date, end: Date) => isAfter(time, start) && isBefore(new Date(), end)

      const isNew =
        (isToday(appointmentDate) && isToday(createdTimeParsed)) ||
        (isToday(appointmentDate) &&
          isYesterday(createdTimeParsed) &&
          isInRange(createdTimeParsed, set(startOfYesterday(), { hours: 15 }), set(startOfToday(), { hours: 10 }))) ||
        (isTomorrow(appointmentDate) && isAfter(createdTimeParsed, set(startOfToday(), { hours: 15 })))

      const isUpdated =
        (isToday(appointmentDate) &&
          isToday(updatedTimeParsed) &&
          isAfter(updatedTimeParsed, subHours(new Date(), 1))) ||
        (isToday(appointmentDate) &&
          isYesterday(updatedTimeParsed) &&
          isInRange(updatedTimeParsed, set(startOfYesterday(), { hours: 15 }), set(startOfToday(), { hours: 10 }))) ||
        (isTomorrow(appointmentDate) && isAfter(updatedTimeParsed, set(startOfToday(), { hours: 15 })))

      return [
        isNew ? 'NEW' : undefined,
        isUpdated ? 'UPDATED' : undefined,
        videoLinkRequired && !bvlsAppointment?.videoUrl ? 'LINK_MISSING' : undefined,
      ].filter(Boolean)
    }

    return {
      prisoner: this.getPrisoner(scheduledAppointment, prisoners, user),
      appointmentId: scheduledAppointment.id,
      status: scheduledAppointment.status,
      startTime: scheduledAppointment.startTime,
      endTime: scheduledAppointment.endTime,
      appointmentDescription: this.getAppointmentDescription(bvlsAppointment, scheduledAppointment),
      appointmentLocationDescription: scheduledAppointment.locationDescription,
      videoBookingId: bvlsAppointment?.videoBookingId,
      videoLinkRequired,
      videoLink: videoLinkRequired && bvlsAppointment?.videoUrl,
      appointmentType:
        (bvlsAppointment?.appointmentType === 'VLB_COURT_MAIN' && bvlsAppointment?.hearingTypeDescription) ||
        (bvlsAppointment?.appointmentType === 'VLB_PROBATION' && bvlsAppointment?.probationMeetingTypeDescription),
      externalAgencyDescription:
        (bvlsAppointment?.appointmentType === 'VLB_COURT_MAIN' && bvlsAppointment?.courtDescription) ||
        (bvlsAppointment?.appointmentType === 'VLB_PROBATION' && bvlsAppointment?.probationTeamDescription),
      tags: buildTags(),
      viewAppointmentLink: scheduledAppointment.viewAppointmentLink,
      cancelledTime: scheduledAppointment.cancelledTime,
      cancelledBy: await this.getCancelledBy(scheduledAppointment, bvlsAppointment, user),
      lastUpdatedOrCreated: updatedTime || createdTime,
    }
  }

  private getPrisoner(scheduledAppointment: Appointment, prisoners: Prisoner[], user: Express.User) {
    const prisoner = prisoners.find(p => p.prisonerNumber === scheduledAppointment.offenderNo)

    return {
      prisonerNumber: prisoner.prisonerNumber,
      firstName: prisoner.firstName,
      lastName: prisoner.lastName,
      cellLocation: prisoner.prisonId === user.activeCaseLoadId ? prisoner.cellLocation : 'Out of prison',
      inPrison: prisoner.prisonId === user.activeCaseLoadId,
      hasAlerts: prisoner.alerts.filter(a => Object.values(RELEVANT_ALERTS).includes(a.alertCode)).length > 0,
    }
  }

  private getAppointmentDescription(bvlsAppointment: BvlsAppointment, scheduledAppointment: Appointment) {
    if (bvlsAppointment?.appointmentType === 'VLB_COURT_PRE') return 'Pre-hearing'
    if (bvlsAppointment?.appointmentType === 'VLB_COURT_POST') return 'Post-hearing'
    return scheduledAppointment.appointmentTypeDescription.replaceAll(/Video Link - /g, '')
  }

  private async matchBvlsAppointmentTo(
    appointment: Appointment,
    bvlsAppointments: BvlsAppointment[],
    user: Express.User,
  ): Promise<BvlsAppointment> {
    const basicMatch = bvlsAppointments.filter(bvlsAppointment => {
      return (
        bvlsAppointment.statusCode === appointment.status &&
        bvlsAppointment.prisonerNumber === appointment.offenderNo &&
        bvlsAppointment.startTime === appointment.startTime &&
        bvlsAppointment.endTime === appointment.endTime
      )
    })

    if (basicMatch.length) {
      const locationMapping = await this.nomisMappingApiClient.getLocationMappingByNomisId(appointment.locationId, user)

      return basicMatch.find(bvlsAppointment => bvlsAppointment.dpsLocationId === locationMapping.dpsLocationId)
    }

    return undefined
  }

  private async getCancelledBy(appointment: Appointment, bvlsAppointment: BvlsAppointment, user: Express.User) {
    const cancelledBy = bvlsAppointment?.updatedBy || appointment.cancelledBy
    if (cancelledBy) {
      const cancelledByUser = await this.manageUsersApiClient.getUserByUsername(cancelledBy, user).catch(err => {
        if (err.status !== 404) {
          throw err
        }
        return undefined
      })

      if (cancelledByUser) {
        return bvlsAppointment && cancelledByUser.authSource === 'auth' ? 'External user' : cancelledByUser.name
      }
    }
    return undefined
  }
}
