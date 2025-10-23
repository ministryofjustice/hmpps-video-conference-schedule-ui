/* eslint-disable no-console */
import { defineConfig } from 'cypress'
import { resetStubs } from './integration_tests/mockApis/wiremock'
import auth from './integration_tests/mockApis/auth'
import tokenVerification from './integration_tests/mockApis/tokenVerification'
import manageUsersApi from './integration_tests/mockApis/manageUsersApi'
import bookAVideoLinkApi from './integration_tests/mockApis/bookAVideoLinkApi'
import prisonRegisterApi from './integration_tests/mockApis/prisonRegisterApi'
import locationsInsidePrisonApi from './integration_tests/mockApis/locationsInsidePrisonApi'
import prisonApi from './integration_tests/mockApis/prisonApi'
import prisonerSearchApi from './integration_tests/mockApis/prisonerSearchApi'
import nomisMappingApi from './integration_tests/mockApis/nomisMappingApi'
import activitiesAndAppointmentsApi from './integration_tests/mockApis/activitiesAndAppointmentsApi'
import componentsApi from './integration_tests/mockApis/componentsApi'

export default defineConfig({
  chromeWebSecurity: false,
  fixturesFolder: 'integration_tests/fixtures',
  screenshotsFolder: 'integration_tests/screenshots',
  videosFolder: 'integration_tests/videos',
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    configFile: 'reporter-config.json',
  },
  taskTimeout: 60000,
  e2e: {
    setupNodeEvents(on) {
      on('task', {
        reset: resetStubs,
        log: message => console.log(message) || null,
        table: message => console.table(message) || null,
        ...auth,
        ...tokenVerification,
        ...manageUsersApi,
        ...activitiesAndAppointmentsApi,
        ...bookAVideoLinkApi,
        ...locationsInsidePrisonApi,
        ...nomisMappingApi,
        ...prisonApi,
        ...prisonRegisterApi,
        ...prisonerSearchApi,
        ...componentsApi,
      })
    },
    baseUrl: 'http://localhost:3007',
    excludeSpecPattern: '**/!(*.cy).ts',
    specPattern: 'integration_tests/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'integration_tests/support/index.ts',
  },
})
