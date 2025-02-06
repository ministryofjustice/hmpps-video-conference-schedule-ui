import LocationsInsidePrisonApiClient from '../data/locationsInsidePrisonApiClient'
import BookAVideoLinkApiClient from '../data/bookAVideoLinkApiClient'
import ActivitiesAndAppointmentsApiClient from '../data/activitiesAndAppointmentsApiClient'
import { ResidentialHierarchy } from '../@types/locationsInsidePrisonApi/types'

export type CellsByWing = {
  fullLocationPath: string
  localName: string
  cells: string[]
}[]

export default class ReferenceDataService {
  constructor(
    private readonly locationsInsidePrisonApiClient: LocationsInsidePrisonApiClient,
    private readonly activitiesAndAppointmentsApiClient: ActivitiesAndAppointmentsApiClient,
    private readonly bookAVideoLinkApiClient: BookAVideoLinkApiClient,
  ) {}

  public async getAppointmentLocations(prisonId: string, user: Express.User) {
    return this.locationsInsidePrisonApiClient.getAppointmentLocations(prisonId, user)
  }

  public async getAppointmentCategories(user: Express.User) {
    return this.activitiesAndAppointmentsApiClient
      .getAppointmentCategories(user)
      .then(categories => categories.filter(c => c.code.startsWith('VL')))
  }

  public async getCellsByWing(prisonId: string, user: Express.User): Promise<CellsByWing> {
    const extractCells = (subLocations: ResidentialHierarchy[]): string[] =>
      subLocations.flatMap(loc =>
        loc.locationType === 'CELL' ? [loc.fullLocationPath] : extractCells(loc.subLocations || []),
      )

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
