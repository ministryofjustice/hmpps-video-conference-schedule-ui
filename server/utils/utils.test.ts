import { addHours, addMinutes, addSeconds, isValid, parse, startOfToday } from 'date-fns'

import {
  convertToTitleCase,
  initialiseName,
  parseDate,
  parseDatePickerDate,
  toFullCourtLink,
  toFullCourtLinkPrint,
  isValidUrl,
  isBeforeNow,
  removeMinutes,
} from './utils'

describe('convert to title case', () => {
  it.each([
    [null, null, ''],
    ['empty string', '', ''],
    ['Lower case', 'robert', 'Robert'],
    ['Upper case', 'ROBERT', 'Robert'],
    ['Mixed case', 'RoBErT', 'Robert'],
    ['Multiple words', 'RobeRT SMiTH', 'Robert Smith'],
    ['Leading spaces', '  RobeRT', '  Robert'],
    ['Trailing spaces', 'RobeRT  ', 'Robert  '],
    ['Hyphenated', 'Robert-John SmiTH-jONes-WILSON', 'Robert-John Smith-Jones-Wilson'],
  ])('%s convertToTitleCase(%s)', (_: string, a: string, expected: string) => {
    expect(convertToTitleCase(a)).toEqual(expected)
  })
})

describe('initialise name', () => {
  it.each([
    [null, null, null],
    ['Empty string', '', null],
    ['One word', 'robert', 'r. robert'],
    ['Two words', 'Robert James', 'R. James'],
    ['Three words', 'Robert James Smith', 'R. Smith'],
    ['Double barrelled', 'Robert-John Smith-Jones-Wilson', 'R. Smith-Jones-Wilson'],
    ['External user', 'External user', 'External user'],
  ])('%s initialiseName(%s)', (_: string, a: string, expected: string) => {
    expect(initialiseName(a)).toEqual(expected)
  })
})

describe('parseDate', () => {
  it.each([
    ['2022-02-17', undefined, new Date(2022, 1, 17)],
    ['17/02/2022', 'dd/MM/yyyy', new Date(2022, 1, 17)],
  ])('%s parseDate(%s, %s)', (date: string, fmt: string, expected: Date) => {
    expect(parseDate(date, fmt)).toEqual(expected)
  })
})

describe('parseDatePickerDate', () => {
  it('is not a date', () => {
    expect(isValid(parseDatePickerDate('bad string'))).toBeFalsy()
  })

  it('is invalid date', () => {
    expect(isValid(parseDatePickerDate('31/02/2022'))).toBeFalsy()
  })

  it.each([
    { datePickerDate: '23-10-2023', separator: '-' },
    { datePickerDate: '23/10/2023', separator: '/' },
    { datePickerDate: '23,10,2023', separator: ',' },
    { datePickerDate: '23.10.2023', separator: '.' },
    { datePickerDate: '23 10 2023', separator: ' ' },
  ])("parses date string when separator is '$separator'", async ({ datePickerDate }) => {
    const date = parseDatePickerDate(datePickerDate)

    expect(date).toEqual(parse('2023-10-23', 'yyyy-MM-dd', new Date()))
  })

  it('parses one digit day and month and two digit year', () => {
    const date = parseDatePickerDate('2/9/23')

    expect(date).toEqual(parse('2023-09-02', 'yyyy-MM-dd', new Date()))
  })

  it('parses three digit year', () => {
    const date = parseDatePickerDate('02/09/223')

    expect(date).toEqual(parse('0223-09-02', 'yyyy-MM-dd', new Date()))
  })
})

describe('toFullCourtLink', () => {
  const prefix = 'https://join.meet.video.justice.gov.uk/#?conference='
  const suffix = '@meet.video.justice.gov.uk'

  it.each([
    ['1234', `${prefix}hmcts1234${suffix}`],
    ['0878', `${prefix}hmcts0878${suffix}`],
    ['12', `${prefix}hmcts12${suffix}`],
    ['', undefined],
    [undefined, undefined],
  ])("expands court link [%s] to full link '%s'", (input, expected) => {
    expect(toFullCourtLink(input)).toEqual(expected)
  })
})

describe('toFullCourtLinkPrint', () => {
  it.each([
    ['1234', 'HMCTS 1234'],
    ['0878', 'HMCTS 0878'],
    ['12', 'HMCTS 12'],
    ['', undefined],
    [undefined, undefined],
  ])("expands court link [%s] to full link '%s'", (input, expected) => {
    expect(toFullCourtLinkPrint(input)).toEqual(expected)
  })
})

describe('removeMinutes', () => {
  it.each([
    ['10:30', 10, '10:20'],
    ['09:30', 20, '09:10'],
    ['12:15', 30, '11:45'],
    ['00:15', 40, '23:35'],
    ['AABB', 50, undefined],
    ['', 60, undefined],
    [undefined, undefined, undefined],
  ])("returns a time [%s] minutes before [%s] as '%s'", (time, minutes, expected) => {
    expect(removeMinutes(time, minutes)).toEqual(expected)
  })
})

describe('isValidUrl', () => {
  it.each([
    ['https://www.google.com/a-page', true],
    ['http://www.google.co.uk/another-page', true],
    ['bingo.net', false],
    ['Swindon Crown Court hmtcs3456', false],
    ['mailto:test@some.address.com', false],
    ['hmcts1234@meet.video.justice.gov.uk', false],
    ['https://meet.video.justice.gov.uk/#?conference=hmcts1234@meet.video.justice.gov.uk&pin=4567', true],
    [undefined, false],
  ])("url [%s] is valid '%s'", (input, expected) => {
    expect(isValidUrl(input)).toEqual(expected)
  })
})

describe('isBeforeNow - (beware - string print shows UTC date/time, not BST)', () => {
  const dateToday = startOfToday()
  it.each([
    ['10:30', addMinutes(addHours(dateToday, 10), 45), true],
    ['09:30', addMinutes(addHours(dateToday, 9), 20), false],
    ['12:15', addMinutes(addHours(dateToday, 12), 14), false],
    ['12:15', addMinutes(addHours(dateToday, 12), 16), true],
    ['00:15', addMinutes(dateToday, 14), false],
    ['00:15', addMinutes(dateToday, 16), true],
    ['10:15', addSeconds(addMinutes(addHours(dateToday, 10), 15), 1), true],
    ['10:15', addSeconds(addMinutes(addHours(dateToday, 10), 14), 59), false],
    ['AABB', addHours(dateToday, 1), false],
    ['', addHours(dateToday, 1), false],
    [undefined, addHours(dateToday, 1), false],
  ])("time [%s] isBeforeNow compared to '%s' expect %s", (inputTime, referenceDate: Date, expected) => {
    expect(isBeforeNow(inputTime, referenceDate)).toBe(expected)
  })
})
