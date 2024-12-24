import _ from 'lodash'
import AppointmentService from './appointmentService'
import BookAVideoLinkApiClient from '../data/bookAVideoLinkApiClient'
import { Appointment } from '../@types/prisonApi/types'
import { BvlsAppointment } from '../@types/bookAVideoLinkApi/types'
import { formatDate } from '../utils/utils'
import LocationsService from './locationsService'
import PrisonerSearchApiClient from '../data/prisonerSearchApiClient'
import { Prisoner } from '../@types/prisonerSearchApi/types'
import config from '../config'

const RELEVANT_ALERTS = ['HA', 'PEEP', 'XEL', 'XCU']

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
}

export type DailySchedule = {
  appointmentsListed: number
  missingVideoLinks: number
  appointmentGroups: ScheduleItem[][]
}

export default class ScheduleService {
  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly locationsService: LocationsService,
    private readonly bookAVideoLinkApiClient: BookAVideoLinkApiClient,
    private readonly prisonerSearchApiClient: PrisonerSearchApiClient,
  ) {}

  public async getSchedule(prisonId: string, date: Date, user: Express.User): Promise<DailySchedule> {
    const [scheduledAppointments, bvlsAppointments] = await Promise.all([
      this.appointmentService.getVideoLinkAppointments(prisonId, date, user),
      this.bookAVideoLinkApiClient.getScheduledVideoLinkAppointments(prisonId, date, user),
    ])

    const prisoners = await this.prisonerSearchApiClient.getByPrisonerNumbers(
      _.uniq(scheduledAppointments.map(appointment => appointment.offenderNo)),
      user,
    )

    const scheduleItems = await Promise.all(
      scheduledAppointments.map(appointment => this.createScheduleItem(appointment, bvlsAppointments, prisoners, user)),
    )

    // TODO Filter scheduleItems by user defined filters here

    const groupedAppointments = _.chain(scheduleItems)
      .groupBy(item => item.videoBookingId ?? item.appointmentId)
      .sortBy(groups => groups[0].startTime)
      .value()

    return {
      appointmentsListed: scheduleItems.length,
      missingVideoLinks: scheduleItems.filter(item => item.videoLinkRequired && !item.videoLink).length,
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

    return {
      prisoner: this.getPrisoner(scheduledAppointment, prisoners, user),
      appointmentId: scheduledAppointment.id,
      startTime: formatDate(scheduledAppointment.startTime, 'HH:mm'),
      endTime: formatDate(scheduledAppointment.endTime, 'HH:mm'),
      appointmentDescription: this.getAppointmentDescription(bvlsAppointment, scheduledAppointment),
      appointmentLocationDescription: scheduledAppointment.locationDescription,
      videoBookingId: bvlsAppointment?.videoBookingId,
      videoLinkRequired: bvlsAppointment?.appointmentType === 'VLB_COURT_MAIN',
      videoLink: bvlsAppointment?.appointmentType === 'VLB_COURT_MAIN' && bvlsAppointment?.videoUrl,
      appointmentType:
        (bvlsAppointment?.appointmentType === 'VLB_COURT_MAIN' && bvlsAppointment?.hearingTypeDescription) ||
        (bvlsAppointment?.appointmentType === 'VLB_PROBATION' && bvlsAppointment?.probationMeetingTypeDescription),
      externalAgencyDescription:
        (bvlsAppointment?.appointmentType === 'VLB_COURT_MAIN' && bvlsAppointment?.courtDescription) ||
        (bvlsAppointment?.appointmentType === 'VLB_PROBATION' && bvlsAppointment?.probationTeamDescription),
      tags: [],
      viewAppointmentLink: `${config.dpsUrl}/appointment-details/${scheduledAppointment.id}`,
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
      hasAlerts: prisoner.alerts.filter(a => RELEVANT_ALERTS.includes(a.alertCode)).length > 0,
    }
  }

  private getAppointmentDescription(bvlsAppointment: BvlsAppointment, scheduledAppointment: Appointment) {
    if (bvlsAppointment?.appointmentType === 'VLB_COURT_PRE') return 'Pre-hearing'
    if (bvlsAppointment?.appointmentType === 'VLB_COURT_POST') return 'Post-hearing'
    return scheduledAppointment.appointmentTypeDescription.replace('Video Link - ', '')
  }

  private async matchBvlsAppointmentTo(
    appointment: Appointment,
    bvlsAppointments: BvlsAppointment[],
    user: Express.User,
  ): Promise<BvlsAppointment> {
    const basicMatch = bvlsAppointments.find(bvlsAppointment => {
      return (
        bvlsAppointment.prisonerNumber === appointment.offenderNo &&
        bvlsAppointment.startTime === formatDate(appointment.startTime, 'HH:mm') &&
        bvlsAppointment.endTime === formatDate(appointment.endTime, 'HH:mm')
      )
    })

    if (basicMatch) {
      const locationKey = await this.locationsService
        .getLocationByNomisId(appointment.locationId, user)
        .then(location => location.key)

      if (basicMatch.prisonLocKey === locationKey) return basicMatch
    }

    return undefined
  }
}
