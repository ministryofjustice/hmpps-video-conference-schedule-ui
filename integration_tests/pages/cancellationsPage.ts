import { expect, Locator, Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class CancellationsPage extends AbstractPage {
  readonly header: Locator

  readonly cancelledAppointmentStats: Locator

  private constructor(page: Page) {
    super(page)
    this.header = page.locator('h1', { hasText: 'Cancelled video appointments: Moorland (HMP)' })
    this.cancelledAppointmentStats = page.locator(`span[data-qa='stat-cancelled-appointments']`)
  }

  static async verifyOnPage(page: Page): Promise<CancellationsPage> {
    const cancellationsPage = new CancellationsPage(page)
    await expect(cancellationsPage.header).toBeVisible()
    return cancellationsPage
  }
}
