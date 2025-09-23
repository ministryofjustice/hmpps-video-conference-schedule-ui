import Page, { PageElement } from './page'

export default class DailySchedulePage extends Page {
  constructor() {
    super('Video link daily schedule: Moorland (HMP)')
  }

  showFiltersButton = (): PageElement => this.getButton('Show filter')

  applyFiltersButton = (): PageElement => this.getButton('Apply filters')

  setCheckboxByLabel(labelText: string, shouldBeChecked: boolean = true) {
    cy.contains('.govuk-checkboxes__label', labelText)
      .prev('input[type="checkbox"]')
      .then($checkbox => {
        if (shouldBeChecked) {
          cy.wrap($checkbox).check()
        } else {
          cy.wrap($checkbox).uncheck()
        }
      })
  }

  printAllMovementSlips = (): PageElement => this.getLink('Print all movement slips')

  showAllPickUpTimes = (): PageElement => this.getButton('Show all pick-up times')

  assertNoPickUpTimes = () => this.getButton('Show all pick-up times').should('not.exist')

  appointmentStats = (): PageElement => this.pageStat('appointments-listed')

  prisonerStats = (): PageElement => this.pageStat('number-of-prisoners')

  cancelledAppointmentStats = (): PageElement => this.pageStat('cancelled-appointments')

  missingVideoLinkStats = (): PageElement => this.pageStat('missing-video-links')

  showCancellations = (): PageElement => this.getLink('View')
}
