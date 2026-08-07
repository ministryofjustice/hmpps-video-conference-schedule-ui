import * as GOVUKFrontend from 'govuk-frontend'
import * as MOJFrontend from '@ministryofjustice/frontend'
import * as VideoConferenceScheduleFrontend from './all'
import './application-insights-setup'

//Make packages globally accessible
window.GOVUKFrontend = GOVUKFrontend
window.MOJFrontend = MOJFrontend

GOVUKFrontend.initAll()
MOJFrontend.initAll()
VideoConferenceScheduleFrontend.initAll()

export default {
  ...VideoConferenceScheduleFrontend,
}
