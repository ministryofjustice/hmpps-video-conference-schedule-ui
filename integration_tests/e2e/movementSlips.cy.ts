import { format } from 'date-fns'
import Page from '../pages/page'
import MovementSlipsPage from '../pages/movementSlipsPage'
import { formatDate } from '../../server/utils/utils'

const today = format(new Date(), 'yyyy-MM-dd')

context('Movement slips', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', ['ROLE_PRISON'])
    cy.task('stubUser')
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

  it('User can view movement slips ordered by cell location', () => {
    cy.task('stubGetPrison')
    cy.task('stubVerifyToken', true)
    cy.signIn()
    cy.visit({ url: `/movement-slips?date=${today}` })

    const movementSlipsPage = Page.verifyOnPage(MovementSlipsPage)
    movementSlipsPage.prisoner(1).contains('John Smith, G9566GQ. Location: MDI-1-1-001')
    movementSlipsPage.prisoner(2).contains('Damire Stoneheart, W4356WE. Location: MDI-3-4-001')
    movementSlipsPage.prisoner(3).contains('Billy Kid, B8965HE. Location: MDI-5-4-001')
  })

  it('User can view movement slips with pick-up time 10 minutes before', () => {
    cy.task('stubGetPrison', 10)
    cy.task('stubVerifyToken', true)
    cy.signIn()
    cy.visit({ url: `/movement-slips?date=${today}` })

    const movementSlipsPage = Page.verifyOnPage(MovementSlipsPage)
    movementSlipsPage.header(1).contains('Moorland (HMP)')
    movementSlipsPage.prisoner(1).contains('John Smith, G9566GQ. Location: MDI-1-1-001')
    movementSlipsPage.date(1).contains(formatDate(today))
    movementSlipsPage.preCourtHearing(1).contains('09:45')
    movementSlipsPage.courtHearing('appeal', 1).contains('10:00')
    movementSlipsPage.postCourtHearing(1).contains('11:00')
    movementSlipsPage.pickUpTime(1).contains('09:35')
    movementSlipsPage.location(1).contains('A Wing Video Link')
    movementSlipsPage.notes(1).contains('notes for prisoner')

    movementSlipsPage.header(2).contains('Moorland (HMP)')
    movementSlipsPage.prisoner(2).contains('Damire Stoneheart, W4356WE. Location: MDI-3-4-001')
    movementSlipsPage.date(2).contains(formatDate(today))
    movementSlipsPage.pickUpTime(2).contains('16:50')
    movementSlipsPage.anotherPrison(2).contains('17:00')
    movementSlipsPage.location(2).contains('D Wing Video Link')

    movementSlipsPage.header(3).contains('Moorland (HMP)')
    movementSlipsPage.prisoner(3).contains('Billy Kid, B8965HE. Location: MDI-5-4-001')
    movementSlipsPage.date(3).contains(formatDate(today))
    movementSlipsPage.pickUpTime(3).contains('05:50')
    movementSlipsPage.legalAppointment(3).contains('06:00')
    movementSlipsPage.location(3).contains('E Wing Video Link')
  })

  it('User can view movement slips with pick-up time 20 minutes before', () => {
    cy.task('stubGetPrison', 20)
    cy.task('stubVerifyToken', true)
    cy.signIn()
    cy.visit({ url: `/movement-slips?date=${today}` })

    const movementSlipsPage = Page.verifyOnPage(MovementSlipsPage)
    movementSlipsPage.header(1).contains('Moorland (HMP)')
    movementSlipsPage.prisoner(1).contains('John Smith, G9566GQ. Location: MDI-1-1-001')
    movementSlipsPage.date(1).contains(formatDate(today))
    movementSlipsPage.preCourtHearing(1).contains('09:45')
    movementSlipsPage.courtHearing('appeal', 1).contains('10:00')
    movementSlipsPage.postCourtHearing(1).contains('11:00')
    movementSlipsPage.pickUpTime(1).contains('09:25')
    movementSlipsPage.location(1).contains('A Wing Video Link')
    movementSlipsPage.notes(1).contains('notes for prisoner')
  })

  it('User can view movement slips with no pick-up time', () => {
    cy.task('stubGetPrison', null)
    cy.task('stubVerifyToken', true)
    cy.signIn()
    cy.visit({ url: `/movement-slips?date=${today}` })

    const movementSlipsPage = Page.verifyOnPage(MovementSlipsPage)
    movementSlipsPage.header(1).contains('Moorland (HMP)')
    movementSlipsPage.prisoner(1).contains('John Smith, G9566GQ. Location: MDI-1-1-001')
    movementSlipsPage.date(1).contains(formatDate(today))
    movementSlipsPage.preCourtHearing(1).contains('09:45')
    movementSlipsPage.courtHearing('appeal', 1).contains('10:00')
    movementSlipsPage.postCourtHearing(1).contains('11:00')
    movementSlipsPage.assertNoPickUpTime(1)
    movementSlipsPage.location(1).contains('A Wing Video Link')
    movementSlipsPage.notes(1).contains('notes for prisoner')
  })
})
