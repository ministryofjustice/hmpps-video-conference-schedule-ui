import { type Locator, type Page } from '@playwright/test'

export default class AbstractPage {
  readonly page: Page

  /** username that appears in the header */
  readonly usersName: Locator

  /** phase banner that appears in the header */
  readonly phaseBanner: Locator

  /** link to sign out */
  readonly signoutLink: Locator

  /** link to manage user details */
  readonly manageUserDetails: Locator

  protected constructor(page: Page) {
    this.page = page
    this.phaseBanner = page.getByTestId('header-phase-banner')
    this.usersName = page.getByTestId('header-user-name')
    this.signoutLink = page.getByText('Sign out')
    this.manageUserDetails = page.getByTestId('manageDetails')
  }

  async signOut() {
    await this.signoutLink.first().click()
  }

  async selectCheckbox(text: string) {
    await this.page.getByRole('checkbox', { name: text }).click()
  }
}
