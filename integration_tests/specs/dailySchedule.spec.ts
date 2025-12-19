import { expect, test } from '@playwright/test'

import { login, resetStubs } from '../testUtils'
import HomePage from '../pages/homePage'
import componentsApi from '../mockApis/componentsApi'
import bookAVideoLinkApi from '../mockApis/bookAVideoLinkApi'
import activitiesAndAppointmentsApi from '../mockApis/activitiesAndAppointmentsApi'
import locationsInsidePrisonApi from '../mockApis/locationsInsidePrisonApi'
import prisonerSearchApi from '../mockApis/prisonerSearchApi'
import CancellationsPage from '../pages/cancellationsPage'

test.describe('Daily schedule', () => {
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

  test('User can view daily schedule', async ({ page }) => {
    await login(page, { name: 'A TestUser' })
    const homePage = await HomePage.verifyOnPage(page)
    await expect(homePage.appointmentStats).toHaveText('5')
    await expect(homePage.prisonerStats).toHaveText('3')
    await expect(homePage.cancelledAppointmentStats).toHaveText('2')
    await expect(homePage.missingVideoLinkStats).toHaveText('1')
    await homePage.showFiltersButton.click()
    await homePage.selectCheckbox('Video Link - Court Hearing')
    await homePage.selectCheckbox('Morning (AM)')
    await expect(page.getByText('Filter returned 3 results.')).not.toBeVisible()
    await homePage.applyFiltersButton.click()
    await expect(page.getByText('Filter returned 3 results.')).toBeVisible()
    await homePage.clearFiltersLink.first().click()
    await homePage.showFiltersButton.click()
    await homePage.selectCheckbox('Video Link - Probation')
    await homePage.applyFiltersButton.click()
    await expect(page.getByText('Filter returned 0 results.')).toBeVisible()
    await homePage.printAllMovementSlipsLink.click()
  })

  test('User can view daily schedule cancelled appointments', async ({ page }) => {
    await login(page, { name: 'A TestUser' })
    const homePage = await HomePage.verifyOnPage(page)
    await homePage.viewCancellationsLink.first().click()
    const cancellationsPage = await CancellationsPage.verifyOnPage(page)
    await expect(cancellationsPage.cancelledAppointmentStats).toHaveText('2')
  })

  test('User can view daily schedule with pick-up times', async ({ page }) => {
    await login(page, { name: 'A TestUser' })
    const homePage = await HomePage.verifyOnPage(page)
    await homePage.showAllPickUpTimesButton.click()
  })

  test('User can view daily schedule without pick-up times', async ({ page }) => {
    await bookAVideoLinkApi.stubGetPrisonNoPickupTime()
    await login(page, { name: 'A TestUser' })
    const homePage = await HomePage.verifyOnPage(page)
    await expect(homePage.showAllPickUpTimesButton).not.toBeVisible()
  })

  test('User can see tags', async ({ page }) => {
    await login(page, { name: 'A TestUser' })
    await HomePage.verifyOnPage(page)
    const tagLocator = page.locator('.govuk-tag--status')
    await expect(tagLocator).toHaveCount(3)
    await expect(tagLocator.nth(0)).toHaveText('Link missing')
    await expect(tagLocator.nth(1)).toHaveText('Pin protected')
    await expect(tagLocator.nth(2)).toHaveText('Check room')
  })
})
