import { expect, test } from '@playwright/test'
import hmppsAuth from '../mockApis/hmppsAuth'

import { login, resetStubs } from '../testUtils'
import HomePage from '../pages/homePage'
import componentsApi from '../mockApis/componentsApi'
import bookAVideoLinkApi from '../mockApis/bookAVideoLinkApi'
import activitiesAndAppointmentsApi from '../mockApis/activitiesAndAppointmentsApi'
import locationsInsidePrisonApi from '../mockApis/locationsInsidePrisonApi'
import prisonerSearchApi from '../mockApis/prisonerSearchApi'

test.describe('SignIn', () => {
  test.beforeEach(async () => {
    await activitiesAndAppointmentsApi.stubIsAppointmentsRolledOut()
    await activitiesAndAppointmentsApi.stubGetAppointmentCategories()
    await activitiesAndAppointmentsApi.stubGetAppointments()
    await bookAVideoLinkApi.stubGetPrison()
    await bookAVideoLinkApi.stubGetCourts()
    await bookAVideoLinkApi.stubGetProbationTeams()
    await bookAVideoLinkApi.stubGetVideoLinkBookings()
    await componentsApi.stubComponents()
    await locationsInsidePrisonApi.stubGetAppointmentLocations()
    await locationsInsidePrisonApi.stubGetResidentialHierarchy()
    await prisonerSearchApi.stubGetPrisoners()
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  test('Unauthenticated user directed to auth', async ({ page }) => {
    await hmppsAuth.stubSignInPage()
    await page.goto('/')

    await expect(page.getByRole('heading')).toHaveText('Sign in')
  })

  test('Unauthenticated user navigating to sign in page directed to auth', async ({ page }) => {
    await hmppsAuth.stubSignInPage()
    await page.goto('/sign-in')

    await expect(page.getByRole('heading')).toHaveText('Sign in')
  })

  test('Authenticated user sees the home page', async ({ page }) => {
    await login(page, { name: 'A TestUser' })

    await HomePage.verifyOnPage(page)
  })

  test('User can sign out', async ({ page }) => {
    await login(page)

    const homePage = await HomePage.verifyOnPage(page)
    await homePage.signOut()

    await expect(page.getByRole('heading')).toHaveText('Sign in')
  })

  test('Token verification failure takes user to sign in page', async ({ page }) => {
    await login(page, { active: false })

    await expect(page.getByRole('heading')).toHaveText('Sign in')
  })

  test('Token verification failure clears user session', async ({ page }) => {
    await login(page, { name: 'A TestUser', active: false })

    await expect(page.getByRole('heading')).toHaveText('Sign in')

    await login(page, { name: 'Some OtherTestUser', active: true })

    await HomePage.verifyOnPage(page)
  })
})
