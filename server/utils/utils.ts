import { format, isValid, parse, parseISO, startOfToday, subMinutes } from 'date-fns'

const properCase = (word: string): string =>
  word.length >= 1 ? word[0].toUpperCase() + word.toLowerCase().slice(1) : word

const isBlank = (str: string): boolean => !str || /^\s*$/.test(str)

/**
 * Converts a name (first name, last name, middle name, etc.) to proper case equivalent, handling double-barreled names
 * correctly (i.e. each part in a double-barreled is converted to proper case).
 * @param name name to be converted.
 * @returns name converted to proper case.
 */
const properCaseName = (name: string): string => (isBlank(name) ? '' : name.split('-').map(properCase).join('-'))

export const convertToTitleCase = (sentence: string): string =>
  isBlank(sentence) ? '' : sentence.split(' ').map(properCaseName).join(' ')

export const initialiseName = (fullName?: string): string | null => {
  // this check is for the authError page
  if (!fullName) return null

  if (fullName === 'External user') return fullName

  const array = fullName.split(' ')
  return `${array[0][0]}. ${array.reverse()[0]}`
}

export const formatDate = (date: string | Date, fmt = 'd MMMM yyyy') => {
  if (!date) return undefined
  const richDate = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(richDate)) return undefined
  return format(richDate, fmt)
}

export const parseDate = (date: string, fromFormat = 'yyyy-MM-dd') => {
  if (!date) return null
  return parse(date, fromFormat, new Date())
}

export const parseDatePickerDate = (datePickerDate: string): Date => {
  if (!datePickerDate) return null

  const dateFormatPattern = /(\d{1,2})([-/,. ])(\d{1,2})[-/,. ](\d{2,4})/

  if (!dateFormatPattern.test(datePickerDate)) return new Date(NaN)

  const dateMatches = datePickerDate.match(dateFormatPattern)

  const separator = dateMatches[2]
  const year = dateMatches[4]

  const date = parse(datePickerDate, `dd${separator}MM${separator}${'y'.repeat(year.length)}`, startOfToday())
  if (!isValid(date)) return new Date(NaN)

  return date
}

export const toFullCourtLink = (hmctsNumber: string) => {
  if (!hmctsNumber || hmctsNumber.length < 1) {
    return undefined
  }
  return `HMCTS${hmctsNumber}@meet.video.justice.gov.uk`
}

export const removeThirtyMinutes = (timeValue: string) => {
  if (!timeValue || timeValue.length < 1) {
    return undefined
  }
  const date = parse(timeValue, 'HH:mm', startOfToday())
  if (!isValid(date)) {
    return undefined
  }
  const newTime = subMinutes(date, 30)
  return format(newTime, 'HH:mm')
}
