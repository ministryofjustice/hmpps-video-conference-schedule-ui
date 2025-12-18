import { expect, test } from '@playwright/test'
import hmppsAuth from '../mockApis/hmppsAuth'
import tokenVerification from '../mockApis/tokenVerification'

import { resetStubs } from '../testUtils'
import prisonApi from '../mockApis/prisonApi'
import manageUsersApi from '../mockApis/manageUsersApi'
import nomisMappingApi from '../mockApis/nomisMappingApi'
import locationsInsidePrisonApi from '../mockApis/locationsInsidePrisonApi'
import bookAVideoLinkApi from '../mockApis/bookAVideoLinkApi'
import activitiesAndAppointmentsApi from '../mockApis/activitiesAndAppointmentsApi'
import prisonerSearchApi from '../mockApis/prisonerSearchApi'
import prisonRegisterApi from '../mockApis/prisonRegisterApi'
import componentsApi from '../mockApis/componentsApi'

test.describe('Health', () => {
  test.afterEach(async () => {
    await resetStubs()
  })

  test.describe('All healthy', () => {
    test.beforeEach(async () => {
      await Promise.all([
        activitiesAndAppointmentsApi.stubPing(),
        bookAVideoLinkApi.stubPing(),
        componentsApi.stubPing(),
        hmppsAuth.stubPing(),
        manageUsersApi.stubPing(),
        locationsInsidePrisonApi.stubPing(),
        nomisMappingApi.stubPing(),
        prisonApi.stubPing(),
        prisonRegisterApi.stubPing(),
        prisonerSearchApi.stubPing(),
        tokenVerification.stubPing(),
      ])
    })

    test('Health check is accessible and status is UP', async ({ page }) => {
      const response = await page.request.get('/health')
      const payload = await response.json()
      expect(payload.status).toBe('UP')
    })

    test('Ping is accessible and status is UP', async ({ page }) => {
      const response = await page.request.get('/ping')
      const payload = await response.json()
      expect(payload.status).toBe('UP')
    })

    test('Info is accessible', async ({ page }) => {
      const response = await page.request.get('/info')
      const payload = await response.json()
      expect(payload.build.name).toBe('hmpps-video-conference-schedule-ui')
    })
  })

  test.describe('Some unhealthy', () => {
    test.beforeEach(async () => {
      await Promise.all([
        activitiesAndAppointmentsApi.stubPing(),
        bookAVideoLinkApi.stubPing(),
        componentsApi.stubPing(),
        hmppsAuth.stubPing(),
        manageUsersApi.stubPing(),
        locationsInsidePrisonApi.stubPing(),
        nomisMappingApi.stubPing(),
        prisonApi.stubPing(),
        prisonRegisterApi.stubPing(),
        prisonerSearchApi.stubPing(),
        tokenVerification.stubPing(500),
      ])
    })

    test('Health check status is down', async ({ page }) => {
      const response = await page.request.get('/health')
      const payload = await response.json()
      expect(payload.status).toBe('DOWN')
      expect(payload.components.hmppsAuth.status).toBe('UP')
      expect(payload.components.tokenVerification.status).toBe('DOWN')
      expect(payload.components.tokenVerification.details.status).toBe(500)
      expect(payload.components.tokenVerification.details.attempts).toBe(3)
    })
  })
})
