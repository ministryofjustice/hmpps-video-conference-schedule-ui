import LocationsInsidePrisonApiClient from '../data/locationsInsidePrisonApiClient'
import BookAVideoLinkApiClient from '../data/bookAVideoLinkApiClient'
import ActivitiesAndAppointmentsApiClient from '../data/activitiesAndAppointmentsApiClient'
import { ResidentialHierarchy } from '../@types/locationsInsidePrisonApi/types'
import config from '../config'

export type CellsByWing = {
  fullLocationPath: string
  localName: string
  cells: string[]
}[]

export type VideoEventType = {
  code: string
  description: string
}

const APPOINTMENT_TYPES = [
  { code: 'VLAP', description: 'Video Link - Another Prison' },
  { code: 'VLLA', description: 'Video Link - Legal Appointment' },
  { code: 'VLOO', description: 'Video Link - Official Other' },
  { code: 'VLPA', description: 'Video Link - Parole Hearing' },
] as VideoEventType[]

const BVLS_TYPES = [
  { code: 'VLB', description: 'Video Link - Court Hearing' },
  { code: 'VLPM', description: 'Video Link - Probation Meeting' },
] as VideoEventType[]

export const OFFICIAL_VISIT_TYPE = { code: 'VLOV', description: 'Video Link - Official Visit' } as VideoEventType

export const VIDEO_EVENT_TYPES = [...APPOINTMENT_TYPES, ...BVLS_TYPES, OFFICIAL_VISIT_TYPE] as VideoEventType[]

export default class ReferenceDataService {
  constructor(
    private readonly locationsInsidePrisonApiClient: LocationsInsidePrisonApiClient,
    private readonly activitiesAndAppointmentsApiClient: ActivitiesAndAppointmentsApiClient,
    private readonly bookAVideoLinkApiClient: BookAVideoLinkApiClient,
  ) {}

  public async getVideoLocations(prisonId: string, user: Express.User) {
    return this.locationsInsidePrisonApiClient.getAppointmentLocations(prisonId, user)
  }

  public async getVideoEventTypes(user: Express.User) {
    return config.featureToggles.includeOfficialVisits
      ? VIDEO_EVENT_TYPES.sort((a, b) => a.description.localeCompare(b.description))
      : this.getAppointmentCategories(user)
  }

  public async getAppointmentCategories(user: Express.User) {
    return this.activitiesAndAppointmentsApiClient
      .getAppointmentCategories(user)
      .then(categories => categories.filter(c => c.code.startsWith('VL')))
  }

  public async getCellsByWing(prisonId: string, user: Express.User): Promise<CellsByWing> {
    const extractCells = (subLocations: ResidentialHierarchy[]): string[] =>
      subLocations?.flatMap(loc =>
        loc.locationType === 'CELL' ? [loc.fullLocationPath] : extractCells(loc.subLocations),
      ) || []

    return this.locationsInsidePrisonApiClient.getResidentialHierarchy(prisonId, user).then(wings =>
      wings.map(w => ({
        fullLocationPath: w.fullLocationPath,
        localName: w.localName || w.fullLocationPath,
        cells: extractCells(w.subLocations),
      })),
    )
  }

  public async getCourtsAndProbationTeams(user: Express.User) {
    const [courts, probationTeams] = await Promise.all([
      this.bookAVideoLinkApiClient.getCourts(user),
      this.bookAVideoLinkApiClient.getProbationTeams(user),
    ])

    return [...courts, ...probationTeams].sort((a, b) => a.description.localeCompare(b.description))
  }
}
