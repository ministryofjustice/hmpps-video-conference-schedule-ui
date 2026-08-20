import { expect, type Locator, type Page } from '@playwright/test'
import { getDay } from 'date-fns'
import AbstractPage from './abstractPage'
import { formatDate } from '../../server/utils/utils'

export enum WeekDay {
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
}

export enum Session {
  MORNING = 'Morning',
  AFTERNOON = 'Afternoon',
  EVENING = 'Evening',
}

export default class RoomAvailabilityPage extends AbstractPage {
  private readonly header: Locator

  private readonly date: Locator

  private readonly morningSession: Locator

  private readonly afternoonSession: Locator

  private readonly eveningSession: Locator

  private readonly updateButton: Locator

  private readonly previousWeekLink: Locator

  private readonly currentWeekLink: Locator

  private readonly nextWeekLink: Locator

  private constructor(page: Page) {
    super(page)
    this.header = page.locator('h1', { hasText: 'Check video room availability:  Moorland (HMP)' })
    this.date = page.getByLabel('Date')
    this.morningSession = page.locator('#period')
    this.afternoonSession = page.locator('#period-2')
    this.eveningSession = page.locator('#period-3')
    this.updateButton = page.getByRole('button', { name: 'Update' })
    this.previousWeekLink = page.getByRole('link', { name: 'Previous week' })
    this.currentWeekLink = page.getByRole('link', { name: 'Current week' })
    this.nextWeekLink = page.getByRole('link', { name: 'Next week' })
  }

  static async verifyOnPage(page: Page): Promise<RoomAvailabilityPage> {
    const availabilityCheckerPage = new RoomAvailabilityPage(page)
    await expect(availabilityCheckerPage.header).toBeVisible()
    await availabilityCheckerPage.verifyNoAccessViolationsOnPage()
    return availabilityCheckerPage
  }

  async selectDate(date: Date) {
    await this.date.fill(formatDate(date, 'dd/MM/yyyy') as string)
  }

  async selectSession(session: Session) {
    if (session === Session.MORNING) {
      await this.morningSession.check()
    }

    if (session === Session.AFTERNOON) {
      await this.afternoonSession.check()
    }

    if (session === Session.EVENING) {
      await this.eveningSession.check()
    }
  }

  async assertSessionSelected(session: Session) {
    await expect(this.page.getByLabel(session)).toBeChecked()
  }

  async update() {
    await this.updateButton.click()
  }

  async previousWeek() {
    await this.previousWeekLink.click()
  }

  async currentWeek() {
    await this.currentWeekLink.click()
  }

  async nextWeek() {
    await this.nextWeekLink.click()
  }

  async selectWeekDayTab(date: Date) {
    const day = getDay(date)
    expect(day).toBeGreaterThan(0)
    expect(day).toBeLessThan(6)

    let dayOfWeek: string = ''

    switch (day) {
      case 1:
        dayOfWeek = WeekDay.MONDAY
        break
      case 2:
        dayOfWeek = WeekDay.TUESDAY
        break
      case 3:
        dayOfWeek = WeekDay.WEDNESDAY
        break
      case 4:
        dayOfWeek = WeekDay.THURSDAY
        break
      case 5:
        dayOfWeek = WeekDay.FRIDAY
        break
      default:
        break
    }

    await this.page.locator(`a[id="tab_${dayOfWeek}"]`).click()
  }

  async assertWeekDayTabSelected(day: WeekDay) {
    const expected = await this.page.locator(`a[id="tab_${day}"]`).getAttribute('aria-selected')

    expect(expected).toBeTruthy()
  }

  async assertRoomAvailable(roomIdentifier: string, date: Date, hour: number) {
    await expect(
      this.getByDataQa(`${roomIdentifier}-available-${formatDate(date, 'yyyy-MM-dd')}-${hour}`),
    ).toContainText('Available')
  }

  async assertRoomPartiallyAvailable(roomIdentifier: string, date: Date, startTime: string, endTime: string) {
    await expect(
      this.getByDataQa(`${roomIdentifier}-partial-${formatDate(date, 'yyyy-MM-dd')}-${startTime}-${endTime}`),
    ).toContainText(`${startTime} - ${endTime}`)
  }

  async assertRoomBooked(roomIdentifier: string, date: Date, hour: number) {
    await expect(this.getByDataQa(`${roomIdentifier}-booked-${formatDate(date, 'yyyy-MM-dd')}-${hour}`)).toContainText(
      'Booked',
    )
  }

  private getByDataQa = (dataQa: string) => this.page.locator(`[data-qa='${dataQa}']`)

  async assertBannerIsVisible(expectedText: string, expectedUrl: string) {
    const bannerElement = this.page.locator('.technical-updates-banner')

    await expect(bannerElement).toBeVisible()
    await expect(bannerElement).toContainText(expectedText)

    const actualUrl = await this.page.locator(`a[data-qa='room-availability-banner-feedback-url']`).getAttribute('href')

    expect(actualUrl).toEqual(expectedUrl)
  }
}
