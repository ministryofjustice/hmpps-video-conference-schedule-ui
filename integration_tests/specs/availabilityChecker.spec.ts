import { expect, test } from '@playwright/test'
import { previousFriday, previousMonday, previousThursday, previousTuesday, previousWednesday } from 'date-fns'
import bookAVideoLinkApi from '../mockApis/bookAVideoLinkApi'
import componentsApi from '../mockApis/componentsApi'
import manageUsersApi from '../mockApis/manageUsersApi'
import { resetStubs } from '../mockApis/wiremock'
import { login } from '../testUtils'
import AvailabilityCheckerPage, { Session, WeekDay } from '../pages/availabilityCheckerPage'

test.describe('Availability Checker', () => {
  const monday = new Date('2026-07-27')
  const tuesday = new Date('2026-07-28')
  const wednesday = new Date('2026-07-29')
  const thursday = new Date('2026-07-30')
  const friday = new Date('2026-07-31')

  test.beforeEach(async () => {
    await bookAVideoLinkApi.stubGetPrison()
    await bookAVideoLinkApi.stubGetCourts()
    await bookAVideoLinkApi.stubGetProbationTeams()
    await bookAVideoLinkApi.stubGetVideoLinkEvents({
      monday,
      tuesday,
      wednesday,
      thursday,
      friday,
    })
    await componentsApi.stubComponents()
    await manageUsersApi.stubUser()
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  test('User can view the availability checker', async ({ page }) => {
    await login(page, { name: 'A TestUser' }, '/availability-checker?date=2026-07-27')

    const availabilityCheckerPage = await AvailabilityCheckerPage.verifyOnPage(page)
    await availabilityCheckerPage.assertSessionSelected(Session.MORNING)
    await availabilityCheckerPage.assertRoomBooked('vvc-room-1', monday, 8)
    await availabilityCheckerPage.assertRoomAvailable('vvc-room-1', monday, 9)
    await availabilityCheckerPage.assertRoomPartiallyAvailable('vvc-room-1', monday, '10:30', '11:00')
    await availabilityCheckerPage.assertRoomAvailable('vvc-room-1', monday, 11)
    await availabilityCheckerPage.assertRoomPartiallyAvailable('vvc-room-1', monday, '12:15', '12:30')
    await availabilityCheckerPage.assertRoomPartiallyAvailable('vvc-room-1', monday, '12:45', '13:00')
  })

  test('User can view each tab on the availability checker', async ({ page }) => {
    await login(page, { name: 'A TestUser' }, '/availability-checker?date=2026-07-27&period=AM')

    const availabilityCheckerPage = await AvailabilityCheckerPage.verifyOnPage(page)
    await availabilityCheckerPage.assertSessionSelected(Session.MORNING)
    await availabilityCheckerPage.assertWeekDayTabSelected(WeekDay.MONDAY)

    await availabilityCheckerPage.selectWeekDayTab(tuesday)
    await availabilityCheckerPage.assertWeekDayTabSelected(WeekDay.TUESDAY)
    await availabilityCheckerPage.assertRoomPartiallyAvailable('vvc-room-1', tuesday, '08:00', '08:40')
    await availabilityCheckerPage.assertRoomAvailable('vvc-room-1', tuesday, 9)
    await availabilityCheckerPage.assertRoomAvailable('vvc-room-1', tuesday, 10)
    await availabilityCheckerPage.assertRoomAvailable('vvc-room-1', tuesday, 11)
    await availabilityCheckerPage.assertRoomAvailable('vvc-room-1', tuesday, 12)

    await availabilityCheckerPage.selectWeekDayTab(wednesday)
    await availabilityCheckerPage.assertWeekDayTabSelected(WeekDay.WEDNESDAY)
    await availabilityCheckerPage.assertRoomBooked('vvc-room-1', wednesday, 8)
    await availabilityCheckerPage.assertRoomAvailable('vvc-room-1', wednesday, 9)
    await availabilityCheckerPage.assertRoomBooked('vvc-room-1', wednesday, 10)
    await availabilityCheckerPage.assertRoomAvailable('vvc-room-1', wednesday, 11)
    await availabilityCheckerPage.assertRoomBooked('vvc-room-1', wednesday, 12)

    await availabilityCheckerPage.selectWeekDayTab(thursday)
    await availabilityCheckerPage.assertWeekDayTabSelected(WeekDay.THURSDAY)
    await availabilityCheckerPage.assertRoomAvailable('vvc-room-1', thursday, 8)
    await availabilityCheckerPage.assertRoomAvailable('vvc-room-1', thursday, 9)
    await availabilityCheckerPage.assertRoomAvailable('vvc-room-1', thursday, 10)
    await availabilityCheckerPage.assertRoomPartiallyAvailable('vvc-room-1', thursday, '11:00', '11:30')
    await availabilityCheckerPage.assertRoomAvailable('vvc-room-1', thursday, 12)

    await availabilityCheckerPage.selectWeekDayTab(friday)
    await availabilityCheckerPage.assertWeekDayTabSelected(WeekDay.FRIDAY)
    await availabilityCheckerPage.assertRoomBooked('vvc-room-1', friday, 8)
    await availabilityCheckerPage.assertRoomBooked('vvc-room-1', friday, 9)
    await availabilityCheckerPage.assertRoomBooked('vvc-room-1', friday, 10)
    await availabilityCheckerPage.assertRoomBooked('vvc-room-1', friday, 11)
    await availabilityCheckerPage.assertRoomBooked('vvc-room-1', friday, 12)
  })

  test('User can change the date and session on the availability checker', async ({ page }) => {
    await login(page, { name: 'A TestUser' }, '/availability-checker?date=2026-07-27&period=AM')

    const availabilityCheckerPage = await AvailabilityCheckerPage.verifyOnPage(page)
    await availabilityCheckerPage.assertSessionSelected(Session.MORNING)

    await bookAVideoLinkApi.stubGetVideoLinkEvents({
      monday: previousMonday(monday),
      tuesday: previousTuesday(tuesday),
      wednesday: previousWednesday(wednesday),
      thursday: previousThursday(thursday),
      friday: previousFriday(friday),
    })

    await availabilityCheckerPage.selectDate(previousMonday(monday))
    await availabilityCheckerPage.selectSession(Session.AFTERNOON)

    // Selecting Friday tab to ensure it stripped from the URL after posting/updating the page
    await availabilityCheckerPage.selectWeekDayTab(friday)
    await expect(page).toHaveURL('/availability-checker?date=2026-07-27&period=AM#friday')

    await availabilityCheckerPage.update()

    await availabilityCheckerPage.assertSessionSelected(Session.AFTERNOON)
    await availabilityCheckerPage.assertWeekDayTabSelected(WeekDay.MONDAY)

    await expect(page).toHaveURL('/availability-checker?date=2026-07-20&period=PM#')
  })

  test('User can view previous week and next week on the availability checker', async ({ page }) => {
    await login(page, { name: 'A TestUser' }, '/availability-checker?date=2026-07-27&period=AM')

    const availabilityCheckerPage = await AvailabilityCheckerPage.verifyOnPage(page)
    await availabilityCheckerPage.assertSessionSelected(Session.MORNING)

    await bookAVideoLinkApi.stubGetVideoLinkEvents({
      monday: previousMonday(monday),
      tuesday: previousTuesday(tuesday),
      wednesday: previousWednesday(wednesday),
      thursday: previousThursday(thursday),
      friday: previousFriday(friday),
    })
    await availabilityCheckerPage.previousWeek()

    await availabilityCheckerPage.assertWeekDayTabSelected(WeekDay.MONDAY)
    await availabilityCheckerPage.selectWeekDayTab(previousTuesday(tuesday))
    await availabilityCheckerPage.assertWeekDayTabSelected(WeekDay.TUESDAY)
    await availabilityCheckerPage.selectWeekDayTab(previousWednesday(wednesday))
    await availabilityCheckerPage.assertWeekDayTabSelected(WeekDay.WEDNESDAY)
    await availabilityCheckerPage.selectWeekDayTab(previousThursday(thursday))
    await availabilityCheckerPage.assertWeekDayTabSelected(WeekDay.THURSDAY)
    await availabilityCheckerPage.selectWeekDayTab(previousFriday(friday))
    await availabilityCheckerPage.assertWeekDayTabSelected(WeekDay.FRIDAY)

    await bookAVideoLinkApi.stubGetVideoLinkEvents({
      monday,
      tuesday,
      wednesday,
      thursday,
      friday,
    })

    await availabilityCheckerPage.nextWeek()
    await availabilityCheckerPage.assertWeekDayTabSelected(WeekDay.MONDAY)
    await availabilityCheckerPage.selectWeekDayTab(tuesday)
    await availabilityCheckerPage.assertWeekDayTabSelected(WeekDay.TUESDAY)
    await availabilityCheckerPage.selectWeekDayTab(wednesday)
    await availabilityCheckerPage.assertWeekDayTabSelected(WeekDay.WEDNESDAY)
    await availabilityCheckerPage.selectWeekDayTab(thursday)
    await availabilityCheckerPage.assertWeekDayTabSelected(WeekDay.THURSDAY)
    await availabilityCheckerPage.selectWeekDayTab(friday)
    await availabilityCheckerPage.assertWeekDayTabSelected(WeekDay.FRIDAY)
  })
})
