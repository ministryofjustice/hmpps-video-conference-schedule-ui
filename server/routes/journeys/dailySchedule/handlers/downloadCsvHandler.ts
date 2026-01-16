import * as converter from 'json-2-csv'
import { Request, Response } from 'express'
import { isValid, startOfDay } from 'date-fns'
import { Page } from '../../../../services/auditService'
import { PageHandler } from '../../../interfaces/pageHandler'
import ScheduleService, { DailySchedule, ScheduleItem } from '../../../../services/scheduleService'
import { convertToTitleCase, formatDate, removeMinutes, toFullCourtLinkPrint } from '../../../../utils/utils'

export default class DownloadCsvHandler implements PageHandler {
  public PAGE_NAME = Page.DOWNLOAD_DAILY_SCHEDULE

  constructor(private readonly scheduleService: ScheduleService) {}

  GET = async (req: Request, res: Response) => {
    const prison = req.middleware!.prison!
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

    const csv = prison.pickUpTime
      ? converter.json2csv(this.convertScheduleToCsvRowsWithPickUpTimes(schedule, prison.pickUpTime))
      : converter.json2csv(this.convertScheduleToCsvRows(schedule))

    res.header('Content-Type', 'text/csv')
    res.attachment(`daily-schedule${status === 'CANCELLED' ? '-cancelled' : ''}-${formatDate(date, 'yyyy-MM-dd')}.csv`)
    res.send(csv)
  }

  private convertScheduleToCsvRows = (schedule: DailySchedule) => {
    return schedule.appointmentGroups.flatMap(group =>
      group.map(item => ({
        'Prisoner name': convertToTitleCase(`${item.prisoner.lastName} ${item.prisoner.firstName}`),
        'Prison number': item.prisoner.prisonerNumber,
        'Cell number': item.prisoner.cellLocation,
        'Appointment start time': item.startTime,
        'Appointment end time': item.endTime || '',
        'Appointment type': item.appointmentTypeDescription,
        'Appointment subtype': item.appointmentSubtypeDescription || '',
        'Room location': item.appointmentLocationDescription,
        'Court or probation team': item.externalAgencyDescription || '',
        'Video link': this.courtLinkFor(item) || '',
        'Last updated': item.lastUpdatedOrCreated
          ? formatDate(item.lastUpdatedOrCreated, "d MMMM yyyy 'at' HH:mm")
          : '',
        'Probation officer name': this.probationOfficerNameOrUndefined(item) || '',
      })),
    )
  }

  private convertScheduleToCsvRowsWithPickUpTimes = (schedule: DailySchedule, pickUpTime: number) => {
    return schedule.appointmentGroups.flatMap(group =>
      group.map((item, index) => ({
        'Prisoner name': convertToTitleCase(`${item.prisoner.lastName} ${item.prisoner.firstName}`),
        'Prison number': item.prisoner.prisonerNumber,
        'Cell number': item.prisoner.cellLocation,
        'Pick-up time': index === 0 ? removeMinutes(item.startTime, pickUpTime) : '',
        'Appointment start time': item.startTime,
        'Appointment end time': item.endTime || '',
        'Appointment type': item.appointmentTypeDescription,
        'Appointment subtype': item.appointmentSubtypeDescription || '',
        'Room location': item.appointmentLocationDescription,
        'Court or probation team': item.externalAgencyDescription || '',
        'Video link': this.courtLinkFor(item) || '',
        'Last updated': item.lastUpdatedOrCreated
          ? formatDate(item.lastUpdatedOrCreated, "d MMMM yyyy 'at' HH:mm")
          : '',
        'Probation officer name': this.probationOfficerNameOrUndefined(item) || '',
      })),
    )
  }

  private courtLinkFor = (item: ScheduleItem) => {
    if (item.videoLinkRequired) {
      if (item.videoLink) {
        return item.videoLink
      }
      if (item.hmctsNumber) {
        return toFullCourtLinkPrint(item.hmctsNumber)
      }
    }

    return undefined
  }

  private probationOfficerNameOrUndefined = (item: ScheduleItem) => {
    return item.appointmentTypeDescription === 'Probation Meeting'
      ? item.probationOfficerName || 'Not yet known'
      : undefined
  }
}
