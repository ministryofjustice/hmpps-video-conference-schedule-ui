/* eslint-disable no-param-reassign */

import path from 'path'
import nunjucks from 'nunjucks'
import express from 'express'
import fs from 'fs'
import {
  convertToTitleCase,
  formatDate,
  initialiseName,
  isBeforeNow,
  isValidUrl,
  isYearBoundaryDate,
  removeMinutes,
  toFullCourtLink,
  toFullCourtLinkPrint,
} from './utils'
import { ApplicationInfo } from '../applicationInfo'
import config from '../config'
import { FieldValidationError } from '../middleware/setUpFlash'
import logger from '../../logger'

const production = process.env.NODE_ENV === 'production'

export default function nunjucksSetup(app: express.Express, applicationInfo: ApplicationInfo): void {
  app.set('view engine', 'njk')

  app.locals.asset_path = '/assets/'
  app.locals.applicationName = 'Video Conference Schedule'
  app.locals.authUrl = config.apis.hmppsAuth.externalUrl
  app.locals.dpsUrl = config.dpsUrl
  app.locals.environmentName = config.environmentName
  app.locals.environmentNameColour = config.environmentName === 'PRE-PRODUCTION' ? 'govuk-tag--green' : ''
  app.locals.feedbackUrl = config.feedbackUrl
  app.locals.roomAvailabilityFeedbackUrl = config.roomAvailabilityFeedbackUrl
  app.locals.applicationInsightsConnectionString = config.applicationInsightsConnectionString
  app.locals.applicationInsightsApplicationName = applicationInfo.applicationName
  app.locals.buildNumber = config.buildNumber

  app.use((req, res, next) => {
    res.locals.session = req.session
    next()
  })

  let assetManifest: Record<string, string> = {}

  try {
    const assetMetadataPath = path.resolve(__dirname, '../../assets/manifest.json')
    assetManifest = JSON.parse(fs.readFileSync(assetMetadataPath, 'utf8'))
  } catch (e) {
    if (process.env.NODE_ENV !== 'test') {
      logger.error(e, 'Could not read asset manifest file')
    }
  }

  // Cachebusting version string
  if (production) {
    // Version only changes with new commits
    app.locals.version = applicationInfo.gitShortHash
  } else {
    // Version changes every request
    app.use((req, res, next) => {
      res.locals.version = Date.now().toString()
      return next()
    })
  }

  const njkEnv = nunjucks.configure(
    [
      path.join(__dirname, '../../server/views'),
      'node_modules/govuk-frontend/dist/',
      'node_modules/govuk-frontend/dist/components/',
      'node_modules/@ministryofjustice/frontend/',
      'node_modules/@ministryofjustice/frontend/moj/components/',
      'node_modules/@ministryofjustice/hmpps-connect-dps-components/dist/assets/',
    ],
    {
      autoescape: true,
      express: app,
      watch: process.env.NODE_ENV === 'live-development',
    },
  )

  njkEnv.addFilter('initialiseName', initialiseName)
  njkEnv.addFilter('convertToTitleCase', convertToTitleCase)
  njkEnv.addFilter('assetMap', (url: string) => assetManifest[url] || url)
  njkEnv.addFilter('formatDate', formatDate)
  njkEnv.addFilter('findError', (v: FieldValidationError[], i: string) => v?.find(e => e.fieldId === i))
  njkEnv.addFilter('filterFalsy', list => list.filter(Boolean))
  njkEnv.addFilter('toFullCourtLink', toFullCourtLink)
  njkEnv.addFilter('toFullCourtLinkPrint', toFullCourtLinkPrint)
  njkEnv.addFilter('removeMinutes', removeMinutes)
  njkEnv.addFilter('isValidUrl', isValidUrl)
  njkEnv.addFilter('isBeforeNow', isBeforeNow)
  njkEnv.addFilter('isYearBoundaryDate', isYearBoundaryDate)

  njkEnv.addGlobal('now', () => new Date())
  njkEnv.addGlobal('dpsUrl', config.dpsUrl)
  njkEnv.addGlobal('activitiesAndAppointmentsUrl', config.activitiesAndAppointmentsUrl)
  njkEnv.addGlobal('temporaryBlockingLocations', config.featureToggles.temporaryBlockingLocations)
}
