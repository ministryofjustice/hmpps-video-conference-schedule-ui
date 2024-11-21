import Page, { PageElement } from './page'

export default class HomePage extends Page {
  constructor() {
    super('Daily video conference schedule')
  }

  headerUserName = (): PageElement => cy.get('[data-qa=header-user-name]')

  headerPhaseBanner = (): PageElement => cy.get('[data-qa=header-phase-banner]')
}
