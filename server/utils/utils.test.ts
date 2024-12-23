import { isValid, parse } from 'date-fns'
import { convertToTitleCase, initialiseName, simpleDateToDate } from './utils'

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
  ])('%s initialiseName(%s)', (_: string, a: string, expected: string) => {
    expect(initialiseName(a)).toEqual(expected)
  })
})

describe('simpleDateToDate', () => {
  it('has all empty fields', () => {
    expect(simpleDateToDate({ day: '', month: '', year: '' })).toEqual(null)
  })

  it('is invalid', () => {
    expect(isValid(simpleDateToDate({ day: '31', month: '02', year: '2022' }))).toBeFalsy()
  })

  it('is valid', () => {
    const date = simpleDateToDate({ day: '20', month: '03', year: '2022' })
    expect(date).toEqual(parse('2022-03-20', 'yyyy-MM-dd', new Date()))
  })
})
