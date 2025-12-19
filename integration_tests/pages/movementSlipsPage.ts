import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class MovementSlipsPage extends AbstractPage {
  readonly header: Locator

  private constructor(page: Page) {
    super(page)
    this.header = page.locator('h1', { hasText: 'Print movement slips' })
  }

  static async verifyOnPage(page: Page): Promise<MovementSlipsPage> {
    const movementSlipsPage = new MovementSlipsPage(page)
    await expect(movementSlipsPage.header).toBeVisible()
    await movementSlipsPage.verifyNoAccessViolationsOnPage()
    return movementSlipsPage
  }

  slipHeader = (slipNumber: number) => this.getByDataQa('movement-slip-header', slipNumber)

  prisoner = (slipNumber: number) => this.getByDataQa('prisoner-name-and-number', slipNumber)

  date = (slipNumber: number) => this.getByDataQa('date', slipNumber)

  preCourtHearing = (slipNumber: number) => this.getByDataQa('pre-court-hearing', slipNumber)

  courtHearing = (type: string, slipNumber: number) =>
    this.page.locator(`[data-qa='court-hearing---${type}-${slipNumber}']`)

  postCourtHearing = (slipNumber: number) => this.getByDataQa('post-court-hearing', slipNumber)

  anotherPrison = (slipNumber: number) => this.getByDataQa('another-prison', slipNumber)

  legalAppointment = (slipNumber: number) => this.getByDataQa('legal-appointment', slipNumber)

  pickUpTime = (slipNumber: number) => this.getByDataQa('pick-up-time', slipNumber)

  location = (slipNumber: number) => this.getByDataQa('location', slipNumber)

  notes = (slipNumber: number) => this.getByDataQa('notes', slipNumber)

  private getByDataQa = (dataQa: string, slipNumber: number) => this.page.locator(`[data-qa='${dataQa}-${slipNumber}']`)
}
