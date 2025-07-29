import Page, { PageElement } from './page'

export default class MovementSlipsPage extends Page {
  constructor() {
    super('Print movement slips')
  }

  header = (): PageElement => cy.get('[data-qa=movement-slip-header]')

  prisoner = (): PageElement => cy.get('[data-qa=prisoner-name-and-number]')

  date = (): PageElement => cy.get('[data-qa=date]')

  preCourtHearing = (): PageElement => cy.get('[data-qa=pre-court-hearing]')

  courtHearing = (type: string): PageElement => cy.get(`[data-qa="court-hearing---${type}"]`)

  postCourtHearing = (): PageElement => cy.get('[data-qa=post-court-hearing]')

  pickUpTime = (): PageElement => cy.get('[data-qa=pick-up-time]')

  location = (): PageElement => cy.get('[data-qa=location]')

  notes = (): PageElement => cy.get('[data-qa=notes]')
}
