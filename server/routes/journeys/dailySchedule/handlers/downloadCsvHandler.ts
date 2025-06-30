import * as converter from 'json-2-csv'
import { Request, Response } from 'express'
import { startOfDay, isValid } from 'date-fns'
import { Page } from '../../../../services/auditService'
import { PageHandler } from '../../../interfaces/pageHandler'
import ScheduleService, { DailySchedule, ScheduleItem } from '../../../../services/scheduleService'
import { convertToTitleCase, formatDate, removeThirtyMinutes, toFullCourtLink } from '../../../../utils/utils'
import config from '../../../../config'

export default class DownloadCsvHandler implements PageHandler {
  public PAGE_NAME = Page.DOWNLOAD_DAILY_SCHEDULE

  constructor(private readonly scheduleService: ScheduleService) {}

  GET = async (req: Request, res: Response) => {
    const { user } = res.locals
    const filters = req.session.journey?.scheduleFilters

    const dateFromQueryParam = new Date(req.query.date?.toString())
    const statusFromQueryParam = req.query.status as 'ACTIVE' | 'CANCELLED'

    const date = startOfDay(isValid(dateFromQueryParam) ? dateFromQueryParam : new Date())
    const status = ['ACTIVE', 'CANCELLED'].includes(statusFromQueryParam) ? statusFromQueryParam : 'ACTIVE'

    const schedule = await this.scheduleService.getSchedule(
      user.activeCaseLoadId,
      startOfDay(isValid(date) ? date : new Date()),
      filters,
      status,
      user,
    )

    const csv = config.featureToggles.pickUpTimes
      ? converter.json2csv(this.convertScheduleToCsvRowsWithPickUpTimes(schedule))
      : converter.json2csv(this.convertScheduleToCsvRows(schedule))

    res.header('Content-Type', 'text/csv')
    res.attachment(`daily-schedule${status === 'CANCELLED' ? '-cancelled' : ''}-${formatDate(date, 'yyyy-MM-dd')}.csv`)
    res.send(csv)
  }

  private convertScheduleToCsvRows = (schedule: DailySchedule) => {
    return schedule.appointmentGroups.flatMap(group =>
      group.map(item => ({
        'Prisoner name': convertToTitleCase(`${item.prisoner.firstName} ${item.prisoner.lastName}`),
        'Prison number': item.prisoner.prisonerNumber,
        'Cell number': item.prisoner.cellLocation,
        'Appointment start time': item.startTime,
        'Appointment end time': item.endTime || '',
        'Appointment type': item.appointmentTypeDescription,
        'Appointment subtype': item.appointmentSubtypeDescription || '',
        'Room location': item.appointmentLocationDescription,
        'Court or probation team': item.externalAgencyDescription || '',
        'Video link': this.courtLinkFor(item) || '',
        'Last updated': formatDate(item.lastUpdatedOrCreated, "d MMMM yyyy 'at' HH:mm"),
      })),
    )
  }

  private convertScheduleToCsvRowsWithPickUpTimes = (schedule: DailySchedule) => {
    return schedule.appointmentGroups.flatMap(group =>
      group.map((item, index) => ({
        'Prisoner name': convertToTitleCase(`${item.prisoner.firstName} ${item.prisoner.lastName}`),
        'Prison number': item.prisoner.prisonerNumber,
        'Cell number': item.prisoner.cellLocation,
        'Pick-up time': index === 0 ? removeThirtyMinutes(item.startTime) : '',
        'Appointment start time': item.startTime,
        'Appointment end time': item.endTime || '',
        'Appointment type': item.appointmentTypeDescription,
        'Appointment subtype': item.appointmentSubtypeDescription || '',
        'Room location': item.appointmentLocationDescription,
        'Court or probation team': item.externalAgencyDescription || '',
        'Video link': this.courtLinkFor(item) || '',
        'Last updated': formatDate(item.lastUpdatedOrCreated, "d MMMM yyyy 'at' HH:mm"),
      })),
    )
  }

  private courtLinkFor = (item: ScheduleItem) => {
    if (item.videoLinkRequired) {
      if (item.videoLink) {
        return item.videoLink
      }
      if (item.hmctsNumber) {
        return toFullCourtLink(item.hmctsNumber)
      }
    }

    return undefined
  }
}
