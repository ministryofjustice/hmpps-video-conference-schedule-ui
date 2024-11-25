import $ from 'jquery'
import * as GOVUKFrontend from 'govuk-frontend'
import * as MOJFrontend from '@ministryofjustice/frontend'
import * as VideoConferenceScheduleFrontend from './all'

// JQuery required by MoJ frontend.
// https://design-patterns.service.justice.gov.uk/get-started/setting-up-javascript/
window.$ = $

// Make GOVUKFrontend And MOJFrontend globally accessible
window.GOVUKFrontend = GOVUKFrontend
window.MOJFrontend = MOJFrontend

GOVUKFrontend.initAll()
MOJFrontend.initAll()
VideoConferenceScheduleFrontend.initAll()

export default {
  ...VideoConferenceScheduleFrontend,
}
