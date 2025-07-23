import DailySchedulePage from '../pages/dailySchedule'
import AuthSignInPage from '../pages/signIn/authSignIn'
import Page from '../pages/page'

context('Daily schedule', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', ['ROLE_PRISON'])
    cy.task('stubUser')
    cy.task('stubGetPrison')
    cy.task('stubIsAppointmentsRolledOut')
    cy.task('stubGetAppointmentCategories')
    cy.task('stubGetAppointmentLocations')
    cy.task('stubGetCourts')
    cy.task('stubGetProbationTeams')
    cy.task('stubGetResidentialHierarchy')
    cy.task('stubGetAppointments')
    cy.task('stubGetVideoLinkBookings')
    cy.task('stubGetPrisoners')
    cy.task('stubGetLocationMapping')
  })

  it('Unauthenticated user directed to auth', () => {
    cy.visit('/')
    Page.verifyOnPage(AuthSignInPage)
  })

  it('Unauthenticated user navigating to sign in page directed to auth', () => {
    cy.visit('/sign-in')
    Page.verifyOnPage(AuthSignInPage)
  })

  it('Token verification failure takes user to sign in page', () => {
    cy.signIn()
    Page.verifyOnPage(DailySchedulePage)
    cy.task('stubVerifyToken', false)

    // can't do a visit here as cypress requires only one domain
    cy.request('/').its('body').should('contain', 'Sign in')
  })

  it('Token verification failure clears user session', () => {
    cy.signIn()
    Page.verifyOnPage(DailySchedulePage)
    cy.task('stubVerifyToken', false)

    // can't do a visit here as cypress requires only one domain
    cy.request('/').its('body').should('contain', 'Sign in')

    cy.signIn()
  })

  it('User can view daily schedule', () => {
    cy.task('stubVerifyToken', true)
    cy.signIn()

    const dailySchedulePage = Page.verifyOnPage(DailySchedulePage)
    dailySchedulePage.showFiltersButton().click()
    dailySchedulePage.setCheckboxByLabel('Video Link - Court Hearing', true)
    dailySchedulePage.setCheckboxByLabel('Morning (AM)', true)
    dailySchedulePage.applyFiltersButton().click()
    cy.get('p.govuk-body').should('be.visible').and('contain.text', 'Filter returned 3 results.')

    dailySchedulePage.setCheckboxByLabel('Video Link - Court Hearing', false)
    dailySchedulePage.setCheckboxByLabel('Video Link - Probation', true)
    dailySchedulePage.applyFiltersButton().click()
    cy.get('p.govuk-body').should('be.visible').and('contain.text', 'Filter returned 0 results.')
  })
})
