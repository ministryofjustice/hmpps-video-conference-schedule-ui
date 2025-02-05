import { Request, Response } from 'express'
import { PageHandler } from '../../../interfaces/pageHandler'
import { Page } from '../../../../services/auditService'

export default class ClearFilterHandler implements PageHandler {
  public PAGE_NAME = Page.CLEAR_FILTER

  GET = async (req: Request, res: Response) => {
    const clearAll = req.query.all === 'true'
    const { wing, appointmentType, period, appointmentLocation, courtOrProbationTeam } = req.query

    if (clearAll) {
      delete req.session.journey?.scheduleFilters
    } else {
      const filters = req.session.journey?.scheduleFilters

      if (filters) {
        if (wing) {
          filters.wing = filters.wing?.filter(w => w !== wing)
          if (filters.wing?.length === 0) delete filters.wing
        }

        if (appointmentType) {
          filters.appointmentType = filters.appointmentType?.filter(a => a !== appointmentType)
          if (filters.appointmentType?.length === 0) delete filters.appointmentType
        }

        if (period) {
          filters.period = filters.period?.filter(p => p !== period)
          if (filters.period?.length === 0) delete filters.period
        }

        if (appointmentLocation) {
          filters.appointmentLocation = filters.appointmentLocation?.filter(a => a !== appointmentLocation)
          if (filters.appointmentLocation?.length === 0) delete filters.appointmentLocation
        }

        if (courtOrProbationTeam) {
          filters.courtOrProbationTeam = filters.courtOrProbationTeam?.filter(c => c !== courtOrProbationTeam)
          if (filters.courtOrProbationTeam?.length === 0) delete filters.courtOrProbationTeam
        }

        // If all properties are removed, delete the entire object
        if (Object.keys(filters).length === 0) {
          delete req.session.journey.scheduleFilters
        }
      }
    }

    res.redirect(req.get('Referrer') || '/')
  }
}
