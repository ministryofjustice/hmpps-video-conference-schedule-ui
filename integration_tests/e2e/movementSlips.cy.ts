import Page from '../pages/page'
import MovementSlipsPage from '../pages/movementSlipsPage'

context('Movement slips', () => {
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

  it('User can view movement slips', () => {
    cy.task('stubVerifyToken', true)
    cy.signIn()
    cy.visit({ url: '/movement-slips?date=2050-07-28' })

    const movementSlipsPage = Page.verifyOnPage(MovementSlipsPage)
    movementSlipsPage.header().contains('Moorland (HMP)')
    movementSlipsPage.prisoner().contains('John Smith, G9566GQ')
    movementSlipsPage.date().contains('28 July 2050')
    movementSlipsPage.preCourtHearing().contains('09:45')
    movementSlipsPage.courtHearing('appeal').contains('10:00')
    movementSlipsPage.postCourtHearing().contains('11:00')
    movementSlipsPage.pickUpTime().contains('09:15')
    movementSlipsPage.location().contains('A Wing Video Link')
    movementSlipsPage.notes().contains('notes for prisoner')
  })
})
