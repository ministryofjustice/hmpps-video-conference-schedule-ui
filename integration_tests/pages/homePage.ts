import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class HomePage extends AbstractPage {
  readonly header: Locator

  readonly appointmentStats: Locator

  readonly prisonerStats: Locator

  readonly cancelledAppointmentStats: Locator

  readonly missingVideoLinkStats: Locator

  readonly showFiltersButton: Locator

  readonly applyFiltersButton: Locator

  readonly clearFiltersLink: Locator

  readonly printAllMovementSlipsLink: Locator

  readonly viewCancellationsLink: Locator

  readonly showAllPickUpTimesButton: Locator

  private constructor(page: Page) {
    super(page)
    this.header = page.locator('h1', { hasText: 'Video link daily schedule: Moorland (HMP)' })
    this.appointmentStats = page.locator(`span[data-qa='stat-appointments-listed']`)
    this.prisonerStats = page.locator(`span[data-qa='stat-number-of-prisoners']`)
    this.cancelledAppointmentStats = page.locator(`span[data-qa='stat-cancelled-appointments']`)
    this.missingVideoLinkStats = page.locator(`span[data-qa='stat-missing-video-links']`)
    this.showFiltersButton = page.getByRole('button', { name: 'Show filter' })
    this.applyFiltersButton = page.getByRole('button', { name: 'Apply filters' })
    this.clearFiltersLink = page.getByRole('link', { name: 'Clear filters' })
    this.printAllMovementSlipsLink = page.getByRole('link', { name: 'Print all movement slips' })
    this.viewCancellationsLink = page.getByRole('link', { name: 'View' })
    this.showAllPickUpTimesButton = page.getByRole('button', { name: 'Show all pick-up times' })
  }

  static async verifyOnPage(page: Page): Promise<HomePage> {
    const homePage = new HomePage(page)
    await expect(homePage.header).toBeVisible()
    return homePage
  }
}
