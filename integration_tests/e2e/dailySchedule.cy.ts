import DailySchedulePage from '../pages/dailySchedule'
import AuthSignInPage from '../pages/signIn/authSignIn'
import Page from '../pages/page'
import CancelledVideoAppointmentsPage from '../pages/cancelledVideoAppointments'

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
    dailySchedulePage.appointmentStats().contains(5)
    dailySchedulePage.prisonerStats().contains(3)
    dailySchedulePage.cancelledAppointmentStats().contains(2)
    dailySchedulePage.missingVideoLinkStats().contains(1)
    dailySchedulePage.showFiltersButton().click()
    dailySchedulePage.setCheckboxByLabel('Video Link - Court Hearing', true)
    dailySchedulePage.setCheckboxByLabel('Morning (AM)', true)
    dailySchedulePage.applyFiltersButton().click()
    cy.get('p.govuk-body').should('be.visible').and('contain.text', 'Filter returned 3 results.')

    dailySchedulePage.setCheckboxByLabel('Video Link - Court Hearing', false)
    dailySchedulePage.setCheckboxByLabel('Video Link - Probation', true)
    dailySchedulePage.applyFiltersButton().click()
    cy.get('p.govuk-body').should('be.visible').and('contain.text', 'Filter returned 0 results.')
    dailySchedulePage.printAllMovementSlips().click()
  })

  it('User can view daily schedule cancelled appointments', () => {
    cy.task('stubVerifyToken', true)
    cy.signIn()

    const dailySchedulePage = Page.verifyOnPage(DailySchedulePage)
    dailySchedulePage.showCancellations().click()

    const cancellationsPage = Page.verifyOnPage(CancelledVideoAppointmentsPage)
    cancellationsPage.cancelledAppointmentStats().contains(2)
  })

  it('User can view daily schedule with pick-up times', () => {
    cy.task('stubVerifyToken', true)
    cy.signIn()

    const dailySchedulePage = Page.verifyOnPage(DailySchedulePage)
    dailySchedulePage.showAllPickUpTimes().click()
  })

  it('User can view daily schedule without pick-up times', () => {
    cy.task('stubGetPrison', null)
    cy.task('stubVerifyToken', true)
    cy.signIn()

    const dailySchedulePage = Page.verifyOnPage(DailySchedulePage)
    dailySchedulePage.assertNoPickUpTimes()
  })

  it('User can see tags', () => {
    cy.task('stubVerifyToken', true)
    cy.signIn()

    cy.get('.govuk-tag--status').should('have.length', 3)
    cy.get('.govuk-tag--status').eq(0).should('contain.text', 'Link missing')
    cy.get('.govuk-tag--status').eq(1).should('contain.text', 'Pin protected')
    cy.get('.govuk-tag--status').eq(2).should('contain.text', 'Check room')
  })
})
