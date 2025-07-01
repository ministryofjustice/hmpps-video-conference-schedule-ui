import { isValid, parse } from 'date-fns'
import {
  convertToTitleCase,
  initialiseName,
  parseDate,
  parseDatePickerDate,
  toFullCourtLink,
  removeThirtyMinutes,
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
  it.each([
    ['1234', 'HMCTS1234@meet.video.justice.gov.uk'],
    ['0878', 'HMCTS0878@meet.video.justice.gov.uk'],
    ['12', 'HMCTS12@meet.video.justice.gov.uk'],
    ['', undefined],
    [undefined, undefined],
  ])("expands court link [%s] to full link '%s'", (input, expected) => {
    expect(toFullCourtLink(input)).toEqual(expected)
  })
})

describe('removeThirtyMinutes', () => {
  it.each([
    ['10:30', '10:00'],
    ['09:30', '09:00'],
    ['12:15', '11:45'],
    ['00:15', '23:45'],
    ['AABB', undefined],
    ['', undefined],
    [undefined, undefined],
  ])("returns a time 30 minutes before [%s] as '%s'", (input, expected) => {
    expect(removeThirtyMinutes(input)).toEqual(expected)
  })
})
