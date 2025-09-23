import Page, { PageElement } from './page'

export default class CancelledVideoAppointmentsPage extends Page {
  constructor() {
    super('Cancelled video appointments: Moorland (HMP)')
  }

  cancelledAppointmentStats = (): PageElement => this.pageStat('cancelled-appointments')
}
