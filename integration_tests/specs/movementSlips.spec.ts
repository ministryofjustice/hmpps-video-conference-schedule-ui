import { expect, test } from '@playwright/test'

import { format } from 'date-fns'
import { login, resetStubs } from '../testUtils'
import componentsApi from '../mockApis/componentsApi'
import bookAVideoLinkApi from '../mockApis/bookAVideoLinkApi'
import activitiesAndAppointmentsApi from '../mockApis/activitiesAndAppointmentsApi'
import locationsInsidePrisonApi from '../mockApis/locationsInsidePrisonApi'
import prisonerSearchApi from '../mockApis/prisonerSearchApi'
import MovementSlipsPage from '../pages/movementSlipsPage'
import { formatDate } from '../../server/utils/utils'

const today = format(new Date(), 'yyyy-MM-dd')

test.describe('Movement slips', () => {
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

  test('User can view movement slips ordered by cell location', async ({ page }) => {
    await login(page, { name: 'A TestUser' })
    await page.goto(`/movement-slips?date=${today}`)
    const movementSlipsPage = await MovementSlipsPage.verifyOnPage(page)
    await expect(movementSlipsPage.prisoner(1)).toHaveText('John Smith, G9566GQ. Location: MDI-1-1-001')
    await expect(movementSlipsPage.prisoner(2)).toHaveText('Damire Stoneheart, W4356WE. Location: MDI-3-4-001')
    await expect(movementSlipsPage.prisoner(3)).toHaveText('Billy Kid, B8965HE. Location: MDI-5-4-001')
  })

  test('User can view movement slips with pick-up time 10 minutes before', async ({ page }) => {
    await bookAVideoLinkApi.stubGetPrison(10)
    await login(page, { name: 'A TestUser' })
    await page.goto(`/movement-slips?date=${today}`)

    const movementSlipsPage = await MovementSlipsPage.verifyOnPage(page)
    await expect(movementSlipsPage.slipHeader(1)).toHaveText(
      'Moorland (HMP) Video appointment movement authorisation slip',
    )
    await expect(movementSlipsPage.prisoner(1)).toHaveText('John Smith, G9566GQ. Location: MDI-1-1-001')
    await expect(movementSlipsPage.date(1)).toHaveText(formatDate(today) as string)
    await expect(movementSlipsPage.preCourtHearing(1)).toHaveText('09:45 to 10:00')
    await expect(movementSlipsPage.courtHearing('appeal', 1)).toHaveText('10:00 to 11:00')
    await expect(movementSlipsPage.postCourtHearing(1)).toHaveText('11:00 to 11:15')
    await expect(movementSlipsPage.pickUpTime(1)).toHaveText('09:35')
    await expect(movementSlipsPage.location(1)).toHaveText('A Wing Video Link')
    await expect(movementSlipsPage.notes(1)).toHaveText('notes for prisoner')

    await expect(movementSlipsPage.slipHeader(2)).toHaveText(
      'Moorland (HMP) Video appointment movement authorisation slip',
    )
    await expect(movementSlipsPage.prisoner(2)).toHaveText('Damire Stoneheart, W4356WE. Location: MDI-3-4-001')
    await expect(movementSlipsPage.date(2)).toHaveText(formatDate(today) as string)
    await expect(movementSlipsPage.pickUpTime(2)).toHaveText('16:50')
    await expect(movementSlipsPage.anotherPrison(2)).toHaveText('17:00 to 18:00')
    await expect(movementSlipsPage.location(2)).toHaveText('D Wing Video Link')
    await expect(movementSlipsPage.notes(2)).toHaveText('VLAP notes for prisoner W4356WE')

    await expect(movementSlipsPage.slipHeader(3)).toHaveText(
      'Moorland (HMP) Video appointment movement authorisation slip',
    )
    await expect(movementSlipsPage.prisoner(3)).toHaveText('Billy Kid, B8965HE. Location: MDI-5-4-001')
    await expect(movementSlipsPage.date(3)).toHaveText(formatDate(today) as string)
    await expect(movementSlipsPage.pickUpTime(3)).toHaveText('05:50')
    await expect(movementSlipsPage.legalAppointment(3)).toHaveText('06:00 to 07:00')
    await expect(movementSlipsPage.location(3)).toHaveText('E Wing Video Link')
    await expect(movementSlipsPage.notes(3)).toHaveText('VLLA notes for prisoner B8965HE')
  })

  test('User can view movement slips with pick-up time 20 minutes before', async ({ page }) => {
    await bookAVideoLinkApi.stubGetPrison(20)
    await login(page, { name: 'A TestUser' })
    await page.goto(`/movement-slips?date=${today}`)

    const movementSlipsPage = await MovementSlipsPage.verifyOnPage(page)
    await expect(movementSlipsPage.slipHeader(1)).toHaveText(
      'Moorland (HMP) Video appointment movement authorisation slip',
    )
    await expect(movementSlipsPage.prisoner(1)).toHaveText('John Smith, G9566GQ. Location: MDI-1-1-001')
    await expect(movementSlipsPage.date(1)).toHaveText(formatDate(today) as string)
    await expect(movementSlipsPage.preCourtHearing(1)).toHaveText('09:45 to 10:00')
    await expect(movementSlipsPage.courtHearing('appeal', 1)).toHaveText('10:00 to 11:00')
    await expect(movementSlipsPage.postCourtHearing(1)).toHaveText('11:00 to 11:15')
    await expect(movementSlipsPage.pickUpTime(1)).toHaveText('09:25')
    await expect(movementSlipsPage.location(1)).toHaveText('A Wing Video Link')
    await expect(movementSlipsPage.notes(1)).toHaveText('notes for prisoner')

    await expect(movementSlipsPage.slipHeader(2)).toHaveText(
      'Moorland (HMP) Video appointment movement authorisation slip',
    )
    await expect(movementSlipsPage.prisoner(2)).toHaveText('Damire Stoneheart, W4356WE. Location: MDI-3-4-001')
    await expect(movementSlipsPage.date(2)).toHaveText(formatDate(today) as string)
    await expect(movementSlipsPage.pickUpTime(2)).toHaveText('16:40')
    await expect(movementSlipsPage.anotherPrison(2)).toHaveText('17:00 to 18:00')
    await expect(movementSlipsPage.location(2)).toHaveText('D Wing Video Link')
    await expect(movementSlipsPage.notes(2)).toHaveText('VLAP notes for prisoner W4356WE')

    await expect(movementSlipsPage.slipHeader(3)).toHaveText(
      'Moorland (HMP) Video appointment movement authorisation slip',
    )
    await expect(movementSlipsPage.prisoner(3)).toHaveText('Billy Kid, B8965HE. Location: MDI-5-4-001')
    await expect(movementSlipsPage.date(3)).toHaveText(formatDate(today) as string)
    await expect(movementSlipsPage.pickUpTime(3)).toHaveText('05:40')
    await expect(movementSlipsPage.legalAppointment(3)).toHaveText('06:00 to 07:00')
    await expect(movementSlipsPage.location(3)).toHaveText('E Wing Video Link')
    await expect(movementSlipsPage.notes(3)).toHaveText('VLLA notes for prisoner B8965HE')
  })

  test('User can view movement slips with no pick-up time', async ({ page }) => {
    await bookAVideoLinkApi.stubGetPrisonNoPickupTime()
    await login(page, { name: 'A TestUser' })
    await page.goto(`/movement-slips?date=${today}`)

    const movementSlipsPage = await MovementSlipsPage.verifyOnPage(page)
    await expect(movementSlipsPage.slipHeader(1)).toHaveText(
      'Moorland (HMP) Video appointment movement authorisation slip',
    )
    await expect(movementSlipsPage.prisoner(1)).toHaveText('John Smith, G9566GQ. Location: MDI-1-1-001')
    await expect(movementSlipsPage.date(1)).toHaveText(formatDate(today) as string)
    await expect(movementSlipsPage.preCourtHearing(1)).toHaveText('09:45 to 10:00')
    await expect(movementSlipsPage.courtHearing('appeal', 1)).toHaveText('10:00 to 11:00')
    await expect(movementSlipsPage.postCourtHearing(1)).toHaveText('11:00 to 11:15')
    await expect(movementSlipsPage.pickUpTime(1)).not.toBeVisible()
    await expect(movementSlipsPage.location(1)).toHaveText('A Wing Video Link')
    await expect(movementSlipsPage.notes(1)).toHaveText('notes for prisoner')
  })
})
