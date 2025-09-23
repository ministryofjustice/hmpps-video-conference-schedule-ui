import Page, { PageElement } from './page'

export default class MovementSlipsPage extends Page {
  constructor() {
    super('Print movement slips')
  }

  header = (slipNumber: number): PageElement => this.getByDataQa('movement-slip-header', slipNumber)

  prisoner = (slipNumber: number): PageElement => this.getByDataQa('prisoner-name-and-number', slipNumber)

  date = (slipNumber: number): PageElement => this.getByDataQa('date', slipNumber)

  preCourtHearing = (slipNumber: number): PageElement => this.getByDataQa('pre-court-hearing', slipNumber)

  courtHearing = (type: string, slipNumber: number): PageElement =>
    cy.get(`[data-qa="court-hearing---${type}-${slipNumber}"]`)

  postCourtHearing = (slipNumber: number): PageElement => this.getByDataQa('post-court-hearing', slipNumber)

  anotherPrison = (slipNumber: number): PageElement => cy.get(`[data-qa="another-prison-${slipNumber}"]`)

  legalAppointment = (slipNumber: number): PageElement => cy.get(`[data-qa="legal-appointment-${slipNumber}"]`)

  pickUpTime = (slipNumber: number): PageElement => this.getByDataQa('pick-up-time', slipNumber)

  location = (slipNumber: number): PageElement => this.getByDataQa('location', slipNumber)

  notes = (slipNumber: number): PageElement => this.getByDataQa('notes', slipNumber)

  assertNoPickUpTime = (slipNumber: number) => this.getByDataQa('pick-up-time', slipNumber).should('not.exist')

  private getByDataQa = (dataQa: string, slipNumber: number): PageElement =>
    cy.get(`[data-qa="${dataQa}-${slipNumber}"]`)
}
