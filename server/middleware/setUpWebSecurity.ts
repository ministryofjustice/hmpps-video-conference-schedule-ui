import crypto from 'crypto'
import express, { Router, Request, Response, NextFunction } from 'express'
import helmet from 'helmet'
import config from '../config'

export default function setUpWebSecurity(): Router {
  const router = express.Router()

  // Secure code best practice - see:
  // 1. https://expressjs.com/en/advanced/best-practice-security.html,
  // 2. https://www.npmjs.com/package/helmet
  router.use((_req: Request, res: Response, next: NextFunction) => {
    res.locals.cspNonce = crypto.randomBytes(16).toString('hex')
    next()
  })
  router.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          // This nonce allows us to use scripts with the use of the `cspNonce` local, e.g (in a Nunjucks template):
          // <script nonce="{{ cspNonce }}">
          // or
          // <link href="http://example.com/" rel="stylesheet" nonce="{{ cspNonce }}">
          // This ensures only scripts we trust are loaded, and not anything injected into the
          // page by an attacker.
          scriptSrc: [
            "'self'",
            (_req: Request, res: Response) => `'nonce-${res.locals.cspNonce}'`,
            config.apis.frontendComponents.url,
          ],
          styleSrc: [
            "'self'",
            (_req: Request, res: Response) => `'nonce-${res.locals.cspNonce}'`,
            config.apis.frontendComponents.url,
          ],
          fontSrc: ["'self'", config.apis.frontendComponents.url],
          formAction: [`'self' ${config.apis.hmppsAuth.externalUrl}`, config.apis.frontendComponents.url],
          connectSrc: ["'self' https://northeurope-0.in.applicationinsights.azure.com https://js.monitor.azure.com"],
        },
      },
      referrerPolicy: { policy: 'same-origin' },
      crossOriginEmbedderPolicy: true,
    }),
  )
  return router
}
