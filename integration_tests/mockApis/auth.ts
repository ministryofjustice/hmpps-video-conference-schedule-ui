import jwt from 'jsonwebtoken'
import { Response } from 'superagent'

import { stubFor, getMatchingRequests } from './wiremock'
import tokenVerification from './tokenVerification'

const createToken = (roles: string[] = []) => {
  // authorities in the session are always prefixed by ROLE.
  const authorities = roles.map(role => (role.startsWith('ROLE_') ? role : `ROLE_${role}`))
  const payload = {
    user_name: 'USER1',
    scope: ['read'],
    auth_source: 'nomis',
    authorities,
    jti: '83b50a10-cca6-41db-985f-e87efb303ddb',
    client_id: 'clientid',
  }

  return jwt.sign(payload, 'secret', { expiresIn: '1h' })
}

const getSignInUrl = (): Promise<string> =>
  getMatchingRequests({
    method: 'GET',
    urlPath: '/auth/oauth/authorize',
  }).then(data => {
    const { requests } = data.body
    const stateValue = requests[requests.length - 1].queryParams.state.values[0]
    return `/sign-in/callback?code=codexxxx&state=${stateValue}`
  })

const favicon = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/favicon.ico',
    },
    response: {
      status: 200,
    },
  })

const ping = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/auth/health/ping',
    },
    response: {
      status: 200,
    },
  })

const redirect = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/auth/oauth/authorize\\?response_type=code&redirect_uri=.+?&state=.+?&client_id=clientid',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        Location: 'http://localhost:3007/sign-in/callback?code=codexxxx&state=stateyyyy',
      },
      body: '<html><body>Sign in page<h1>Sign in</h1></body></html>',
    },
  })

const signOut = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/auth/sign-out.*',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
      body: '<html><body>Sign in page<h1>Sign in</h1></body></html>',
    },
  })

const manageDetails = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/auth/account-details.*',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
      body: '<html><body><h1>Your account details</h1></body></html>',
    },
  })

const token = (roles: string[] = []) =>
  stubFor({
    request: {
      method: 'POST',
      urlPattern: '/auth/oauth/token',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        Location: 'http://localhost:3007/sign-in/callback?code=codexxxx&state=stateyyyy',
      },
      jsonBody: {
        access_token: createToken(roles),
        token_type: 'bearer',
        user_name: 'USER1',
        expires_in: 599,
        scope: 'read',
        internalUser: true,
      },
    },
  })

const feComponents = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/frontend-components-api/components\\?component=header&component=footer',
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: JSON.parse(`{
        "header": {
          "html": "\\n    \\n<header class=\\"connect-dps-external-header govuk-!-display-none-print\\" role=\\"banner\\">\\n  <div class=\\"connect-dps-external-header__container\\">\\n    <div class=\\"connect-dps-external-header__title\\">\\n      <a class=\\"connect-dps-external-header__link connect-dps-external-header__title__organisation-name\\" href=\\"#\\">\\n        <svg role=\\"presentation\\" focusable=\\"false\\" class=\\"connect-dps-external-header__logo\\" xmlns=\\"http://www.w3.org/2000/svg\\" viewbox=\\"0 0 40 40\\" height=\\"40\\" width=\\"40\\">\\n          <path fill-rule=\\"evenodd\\" d=\\"M38.1 16.9c.1 1.8 2.2 1.3 1.9 2.7 0-.9-3-.8-3-2.6 0-.3.1-.7.3-.9-.1-.1-.2-.1-.5-.1-.6 0-1.2.6-1.2 1.3 0 2.2 3 2.6 3 5.1 0 .6-.2 1-.6 1.2.2 0 .7-.1.8-.3-.2 1-1.2 1-1.6.6h-.3c.2.4.4.8.9.7-.9.7-2-.2-1.8-1.2-.2-.3-.4-.7-.6-.9-.1-.2-.2-.1-.2.1 0 .8-.6 1.6-.6 2.1 0 .6.6 1.1.8 1.1s.3-.2.4-.2c.1.1.1.2.1.7 0 .2 0 1 .1 1.7 0-.2.2-.3.3-.4.2-.1.4-.2.7-.1.1 0 .3.1.3.2.1.1.1.2.1.3 0 .2-.2.4-.3.6-.2.1-.3.2-.6.1-.2 0-.3-.1-.4-.2v-.1.7c0 .6-.1.8-.3.9 0-.1-.2-.2-.3-.2-.1 0-.3.1-.3.2 0 .2.3.2.3.6s-.8.8-1.3.8c.1-.2.2-.8.3-1.1-.1.1-.3.3-.4.7-.1.4-.3.4-.6.3.2-.2.6-1.1 1-1.3.4-.3.6-.4.7-1.1.1-.7 0-1.1 0-1.7 0-.8-.3-.7-.6-.7-.6 0-2.6-1.3-2.6-2.7v-.4c-.9 0-1.5.2-1.5 1.1 0 .3 0 .6.2.8.2.1.3.3 0 .4-.3.1-3.1 1.3-3.1 1.3-.3.1-.4 0-.6-.2-.1-.2-.3-.2-.4-.1-.2.1.1.2.1.4s-.1.7-1.3.6l.3-.6c.1-.2.1-.3.1-.3-.1 0-.1.1-.2.3l-.3.4h-.4l1-1c.2-.2.6-.4 1.1-.4.7-.1 2.9-.4 2.9-1.1 0-.8-.9-.8-.9-1.9 0-1 .4-2 3-1.9-.2-.7-.9-1.1-1.6-1.2-1.3-.3-1.7-1.2-1.8-2.1h-1c-.8 0-1.2-.3-1.5-.1-.1.1-.1.2 0 .3.1.2.3.7.6 1 .1 0 .4 0 .4.2s-.1.2-.1.3 0 .2.1.2.1-.1.1-.2c.1-.1.3-.1.7 0 .2.2.6.6.7 1-.3-.1-.8-.3-.9-.3s-.1.1 0 .1.4.2.6.3v.3c-.1-.1-.7-.4-1.1-.6-.3-.1-.6-.2-.8-.7-.2-.4-.8-1.6-1-1.9-.1-.2-.1-.3 0-.4.1-.1.1-.2.2-.3.1-.2.2-.2.4-.2s.8 0 1-.1c0 0 .1 0 .2-.1-.6-.6-1.2-1.4-1.2-1.6-.1-.1-.2-.2-.3-.2s-.2 0-.3.1l-.1.1c0-.1-.1-.1-.1-.2l-.3-.3c.2-.1.3-.3.4-.3.1-.1.2-.2.3-.2h.3c.2 0 .2 0 .3.1.2.2.6.4.8.7 0 0 .1 0 .1.1l.1-.1c.1-.1.2-.1.3-.1s.2.1.3.2.2.3.2.6v.2l.6.6c.1-.7.4-1.4.9-2h-.1v-.1c.1-.3.2-.9.3-1.1v-.3l.8.3.1-.1c.7-.7 2.3-1.1 2.3-2.1 0-.2-.1-.6-.3-.8.1.1.1.3.1.6 0 .2-.4.8-1.1.8-.3 0-.7-.3-.8-.3s-.2.1-.3.1c0 .4-.2.8-.3.8.1-.2 0-.6 0-.6-.1 0-.1.1-.1.4 0 .3-.2.7-.7.7.1-.1.2-.6.1-.7-.1-.1-.2.1-.3.1s-.2-.1-.2-.2-.2 0-.2-.1.2-.3.4-.3c.2-.1.6-.2.6-.4-.1-.2-.9.1-1.1.3-.4.3-.2-.1-.3-.2-.2-.4 0-.4.2-.7.2-.2.8-.7 1.5-1 0-.2.1-.3.3-.4.2-.1.6-.2.8-.3l-3.8-4c-.1-.1-.1-.1 0-.2 0 0 .1 0 .2.1l4 3.9c.3-.6.4-.9.3-1.3.4.2.9.7 1 1.2 1.2 0 1.6.8 1.9.4 0 .2-.1.3-.6.4 1.5.3 1 1.3 1.8 1.4-.1.1-.3.2-.6.1.9 1.3 0 2.1.7 2.8-.2.1-.7-.1-.9-.6.2 1.1-.1 1.7.1 2.1-.3.1-.6-.2-.7-.6-.1.2-.1.4-.2.7l.3.1-.1.1c-.6.6-.8.9-.9 1l-.1.1-.1-.1c-.3.4-.7.8-.7 1.2 0 .4.6 1.3 1.2 2.1v-.2c0-.1.1-.3.2-.4.1-.1.2-.1.4-.1s.4.1.6.3c.1.2.2.3.2.6 0 .1-.1.3-.2.4-.1.1-.2.1-.4.1-.1 0-.3-.1-.4-.1.4.6.9 1.2 1.1 1.7.4.9.9 1.4 1.3 1.4.6 0 1.1-.4 1.1-1.1 0-2.3-3-2.6-3-5.2 0-1.2 1-1.8 1.7-1.8.4 0 .7.1.9.3h.2c1.5 0 .6 1.9 1.7 2-.3.5-1 .2-1.3-.7zM30.3 10c.3-.2.8-.3 1.2-.3-.3-.1-.6-.3-.8-.3-.4-.1-.3.4-.4.6zm-2.7 5.5c0-.1 0-.3-.1-.3 0 0-.1-.1-.2-.1s-.1 0-.2.1-.1.2-.1.3c0 .2.1.4.3.4.1 0 .1 0 .2-.1 0 0 .1-.1.1-.3zm8.7 12.6v.2c.1.2.4.2.7 0 .1-.1.2-.2.2-.3v-.2c-.1-.1-.1-.1-.2-.1s-.3 0-.4.1c-.2.1-.3.2-.3.3zm-1.9-8.3c0 .1.1.3.2.4.1.1.2.2.4.2.1 0 .1 0 .2-.1s.1-.1.1-.2-.1-.3-.2-.4c-.1-.1-.2-.2-.4-.2-.1 0-.1 0-.2.1s-.1.1-.1.2zm-.8-3.2c.3-.3.9-1 .9-1l-.3-.3v.6c-.1-.1-.2-.2-.2-.3l-.2.3c.1 0 .3 0 .3.1-.2.2-.6.1-.7 0-.2-.2-.3-.3-.3-.4.1-.1.3-.1.4.1.2 0 .2-.2.2-.3-.1-.1-.2-.1-.3-.1.3-.2.6-.4.4-.9-.4.1-.6.3-.7.7 0-.1-.1-.3-.2-.3s-.3.1-.3.3c.2-.1.4.1.3.3-.1.1-.3.1-.6 0-.3-.4-.3-.6-.1-.9.1.1.1.2.1.4l.3-.6c-.1 0-.2.1-.3 0 .1-.1.2-.2.4-.3l-.7-.2c.1.2 0 .4 0 .6-.1-.1-.2-.2-.2-.3l-.3.6c.1-.1.3-.1.4-.1-.1.2-.4.3-.7.2-.2-.1-.3-.3-.3-.4.1-.1.3-.1.4.1.2-.1.2-.3.1-.4-.1-.1-.2-.1-.4 0 .3-.3.4-.6.3-1-.3.1-.6.4-.6.8 0-.1-.1-.2-.2-.2s-.3.1-.2.3c.2-.1.4.1.3.3-.1.1-.2.1-.6 0-.2-.1-.4-.2-.3-.6.1 0 .2.2.3.2l.1-.4h-.3c.1-.1.3-.2.4-.3l-.4-.2s-.2.9-.4 1.3l4.2 2.3zm0 7.9c.1-.2.1-.6 0-.7-.2-.1-.4 0-.7.2-.1.2-.1.6 0 .7.1.1.5 0 .7-.2zm1.1-1.9c.1-.2.1-.6 0-.7-.2-.1-.4 0-.7.2-.1.2-.1.6 0 .7.3.1.6 0 .7-.2zM27.4 18c.2-.1.4 0 .7 0 .2.1.3.3.4.4v.4l-.3.3c-.2.1-.4 0-.7 0-.5-.1-.6-.4-.5-.8.1-.2.2-.3.4-.3zm.2 1c.1.1.3.1.4 0 .1 0 .1-.1.2-.1v-.2c0-.1-.1-.2-.3-.3-.1-.1-.3-.1-.4 0-.1 0-.1.1-.2.1-.1.1.1.3.3.5zm4.8 7.2c.1-.1.2-.2.4-.2s.3.1.4.2c.1.1.2.3.2.6 0 .2-.1.4-.2.6-.1.1-.2.2-.4.2-.1 0-.3-.1-.4-.2-.1-.1-.2-.3-.2-.6 0-.2 0-.5.2-.6zm.3 1.1c.1 0 .2 0 .2-.1.1-.1.1-.2.2-.4 0-.3-.1-.6-.3-.6-.1 0-.2 0-.2.1-.1.1-.1.2-.2.4 0 .2 0 .3.1.4.1.1.1.2.2.2zm-4.8-13.8c.2-.1.3-.2.6-.2.1 0 .2.1.3.2s.1.2.1.4-.1.3-.3.6c-.3.2-.8.2-.9 0-.1-.3 0-.6.2-1zm0 .7v.2c.1.1.3.1.6 0 .1-.1.2-.2.2-.3v-.2c0-.1-.1-.1-.2-.1s-.2 0-.3.1c-.2 0-.3.2-.3.3zm5.7 13.7c.2-.1.4-.2.7-.1.4.1.8.4.7.8 0 .2-.1.3-.3.4-.1.1-.3.1-.6.1s-.3-.1-.6-.2c-.1-.1-.2-.3-.1-.6-.1-.2 0-.3.2-.4zm.4.9c.3 0 .6-.1.6-.3 0-.2-.2-.3-.4-.4-.2 0-.3 0-.4.1 0 0-.1.1-.1.2-.2.1 0 .3.3.4zm3.3-1.9c0-.6.4-1 1-1s1 .4 1 1-.4 1-1 1c-.5 0-1-.4-1-1zm.3 0c0 .4.3.8.8.8s.8-.3.8-.8c0-.4-.3-.8-.8-.8-.4.1-.8.5-.8.8zm-23.3-5.8c-.1.3.1.3.1.7 0 .3-.2.4-.6.6.2-.4 0-.7-.3-.8.1.8-.6.9-.8.8.2 0 .3-.4.2-.8-.1.2-.4.4-.7.4s-.4-.2-.6-.4c.3.2.6 0 .6-.2 0-.1-.3-.2-.3-.4 0-.6.6-.3.6-.8 0-.2-.1-.3-.2-.3s-.3.1-.3.3c-.3-.2 0-.9-.1-1.2 0 .7-.4.6-.6.9-.2-.2 0-.7-.2-1.2-.1.6-.3.4-.3.9-.6-.3-1.7-.2-2 .2 1 .8 2.2 1.2 2.2 2.4 0 .9-1.5 1.3-1.5 1.9 0 .6 1.5 2 2.2 2 .2 0 .3-.3.6-.3h.6c.2 0 .3.2.3.3.3 0 .8.6.3 1-.1-.2-.3-.6-.8-.3.2.4 0 .8-.4 1 .1-.2.2-.6-.1-.6s0 .2-.7.2c-.6 0-.6 0-.8-.3-.2-.3-.4-.4-.6-.4s-.2.3 0 .6c-1.2 0-.7-1.2-1.3-1.6v.9c-.4-.5-.8-.9-.8-1.3-.1-.3 0-.6-.3-.8-.1 0-.2-.1-.2-.3 0-.1.1-.1.3-.2.2-.1.6-.3.6-1 0-.4-.1-1.1-.9-1.7.1 1 0 1.9-.4 2.7-.6 1-1.7 1.7-2.2 1.9-.6.2-1.3.4-1.3 1.2 0 1.4.7 2.2 1.2 2.2.4 0 .3-.4.9-.4.2 0 .6.1.6.3.3-.1.7.1.7.4 0 .3-.1.4-.3.6.2-.4-.3-.4-.4-.4-.1.1 0 .2 0 .4s-.1.4-.4.6c.1-.1.1-.3-.2-.3-.2 0-.3.4-.7.4-.6 0-.7-.2-1.2-.1-.3.1-.3.3-.2.3-.7 0-.6-.8-.4-.9.1-.1.2-.2 0-.4-.2-.1-.6 0-.7.3-.6-1.1.2-1 0-2.2-.1.6-.4.9-.7 1 .1-.2-.1-.8-.1-1.2 0-.9.6-1.2.6-1.4 0-.2-.2-.4 0-.6.1-.1.3.1.6.1.7 0 1.2-.9 1.3-2 .1-1.2.7-2.1 1.1-3 0-.1 0-.3.1-.4-.6.7-1 1.6-1.7 2.1.1.8-1.5 1.7-2.3 1 .3 0 .8-.1 1-.6-.1 0-.2 0-.3-.1-.6.3-1.3-.1-1.3-.7.2.2.4.3.8.2.2-.1.1-.4.1-.8 0-2.3 3.6-3.9 3.6-5.8 0-.6-.3-.9-.8-.9-.2 0-.4.1-.7.2.2.1.3.3.3.6 0 2.1-3.5 1.9-3.7 3.3-.1-1.8 2-1.4 2.1-2.9-.4.7-1.2 1.1-1.7.9 1.1 0 .8-2.2 2-2.2.1 0 .2 0 .4.1.3-.3.8-.4 1.1-.4.6 0 1.3.3 1.3 1.3 0 2.2-3.6 3.7-3.6 5.8 0 .7.4 1 1 1 1.2 0 2.1-2.2 3.5-4.1.9-1.2 1.5-3.7 2-4.9-.7.4-.8 1.8-1.6 1.9.4-.3.1-1.4.4-2.3.1-.3.1-.6.1-.9-.4.6-.3 2.2-1.1 2.4.3-.3 0-.9 0-1.4 0-1 .6-1.1.6-2.1-.4.2-.3 1.4-1.2 1.4.7-.7 0-1.3.8-2.1-.4-.2-.8-.6-.8-.9.3-.2.7-.3 1-.3-.3-.2-.2-.4 0-.7.1.2.2.3.3.3.3-.1.8-.6 1.5-.8.5-.2 1.3-.5 1.6-.5.1 0 .1-.2.1-.3.2 0 .6 0 .7.3.2-.2.6-.3.9-.3.2.4.2.8 0 1.2.4 0 .7.4 1.1.3-.3.4-.8.3-1.2.2 1.2.3 1.5 1.6 2.1 1.7-1.2.7-1.7-.3-2.3-.3 1.7.9 1.7 1.9 2.1 1.9-.6.4-.9-.1-1.6-.3 1.3.9 1.3 1.6 1.2 2.1.3.2.2.6.2 1 .2-.1.6-.2.8-.2-.1.1-.2.2-.2.3-.7.8-1.1 1.4-1.5 2.4-.3-.2-.6-.6-.8-.7-.2-.2-.6-.2-.7-.2.4.4 1.8 2 2.2 2.4.4.4.3.8.4 1.2.4.4.8.7.7.9zM7.5 10.2c.4 0 .6-.6.4-.9-.4.2-1 .3-1.3.4.5.2.5.5.9.5zm2.3 2.5c.4-.2.4-.7.3-.9-.1-.2-.2-.4-.3-.4-.2 0-.4-.1-.4-.3-.1-.2.2-.3.4-.6-.2-.1-.4-.2-.2-.3.2-.1.4.1.4 0 .1-.1-.1-.2-.2-.3s-.2-.1-.3 0l-1.2.4c-.1 0-.3 0-.3.1s-.1.3 0 .3.1-.3.3-.3.2.1 0 .4c.4 0 .6-.1.7.2.1.2 0 .3-.1.6-.1.1 0 .3 0 .6.1.2.5.7.9.5zm.1-3.5c.2-.2 0-.4.3-.9-.3.2-.8.5-1.3.7.3.3.7.5 1 .2zm-.7-3.1c.1.1.1.2.1.3-.1 0-.1-.1-.3-.2v.6c.1-.1.2-.1.2-.2 0 .3-.1.6-.3.6l-.3-.3c0-.1.1-.2.2-.1 0-.3-.2-.3-.3-.2.1-.4.1-.6-.2-.7-.3.3-.1.4.1.6-.2-.1-.5.1-.2.4 0-.2.2-.1.2 0s-.1.3-.4.4c-.3.1-.4-.1-.5-.3.1 0 .2 0 .4.1l.1-.5c-.1.3-.2.3-.3.4 0-.1.1-.4.1-.4l-.7.2s.3.1.4.2c0 0-.1.1-.4 0l.2.4c0-.2.1-.3.2-.3.1.2.1.4-.2.6-.2.2-.4.1-.4 0-.1-.1 0-.3.2-.2 0-.3-.3-.3-.3-.1 0-.3-.1-.6-.4-.6-.1.3 0 .6.3.7-.2 0-.3.1-.1.3 0-.2.1-.2.2-.1s0 .2-.1.3c-.1.1-.3.1-.6-.2h.2L6 7.3v.3c-.1-.1-.1-.1-.1-.3l-.2.2c.2.2.6.5.9.9.3-.2 1-.6 1.5-.7.4-.2 1.1-.4 1.6-.4-.1-.6 0-1 0-1.2h-.5zm-2.7-.7l.2.4.1-.3v.6c0 .1.1.3.3.3.1 0 .3-.1.3-.3 0-.1-.1-.2-.1-.2 0-.1-.2-.3-.3-.4h.4v-.4l-.4.2v-.4l-.4.1.2.3-.3.1zm1.4.4c.1-.2.1-.3 0-.4-.1-.1-.2-.1-.3 0-.1.1-.1.2 0 .3.1.1.2.1.3.1zm.6-.5c.1-.1.1-.2 0-.3s-.2-.1-.3 0-.2.2 0 .3c.1.1.2.1.3 0zm.5.1c.1-.1.1-.2 0-.3s-.2-.1-.3 0c-.1.1-.1.2 0 .3.1.1.3.1.3 0zm.2.5c.1.1.2.1.3 0s.1-.2 0-.3h-.3c-.2 0-.2.3 0 .3zm-2.7.4c.1 0 .2-.1.2-.2s-.1-.2-.2-.2-.2.1-.2.2.1.2.2.2zm-.7.1c.1 0 .2-.1.2-.2S6 6 5.8 6c-.1 0-.2.1-.2.2s.1.2.2.2zm-.1.2c0-.1-.1-.2-.2-.2s-.2.1-.2.2.1.2.2.2.2 0 .2-.2zm.1.7c0-.1-.1-.2-.2-.2s-.2.1-.2.2.1.2.2.2.2-.1.2-.2zm15.7 16.9c-.1 0-.1.1-.1.1 0 .1 1-.1 1 .1 0 .1-.2.2-.6.2h-.1c0 .1.1.1.1.1v.1s0 .1 0 0h-.1s-.1 0 0 .1h-.1v-.1h-.1v-.1h.1l.1.1.1-.1-.1-.1h-.3c.1.1.1.2.1.3v.1h-.1s0 .1-.1.1H21c0-.1.1 0 .1-.1 0 0 0-.1.1-.1s.1.1.2.1h.1-.1v-.1c-.1 0-.1.1-.2.1 0 .1-.1.2-.1.2l-.1.1c-.1 0-.1 0-.1.1v-.1h-.1l-.1.1v-.1s0 .1-.1.1c0 0-.1 0-.1-.1v.2s-.1 0-.1-.1v-.1c-.1.1-.1 0-.1 0s0-.1.1-.1h.1c-.1 0-.1 0-.1-.1h.1v.1h.4v-.1c-.1 0-.1 0-.1-.1-.4-.2-.4-.3-.4-.3-.1 0-.2 0-.1-.1 0 .1.1.1.1 0 0 0-.1 0 0-.1v-.1h.1-.1.1l.1.1h.1v.1c0 .1 0 .1.1.1s.1.2.2.2v-.2s0-.1.1-.1l.1-.1v-.1h.2s.1 0 .1.1h.1s0 .1-.1.1c0 0 0 .1-.1.2.4-.1.8 0 .9 0 .2 0 .4-.1.4-.1 0-.1-1 .1-1-.1-.4-.4-.3-.4-.2-.4 0 0 0-.1 0 0 .2-.2.6 0 .7-.1 0 0-.2.1-.3.1.3.1.4-.1.8 0-.3-.1-.7.3-1.2 0 0 .1 0 0 0 0zm-.7 0c0 .1 0 .1 0 0 .1.1.1.1 0 0 .1.1.1.1 0 0zm0 0s-.1 0 0 0c-.1 0-.1 0 0 0-.1.1 0 0 0 0zm-.1.3s0 .1 0 0c0 .1.1.1 0 0 .1 0 .1 0 0 0 .1 0 .1 0 0 0 .1-.1.1-.1.1 0h-.1c0-.2 0-.2 0 0 0-.2.1-.2 0 0zm1.1-1.6c-.1 0-.3 0-.3.1s.7.1.9.1c.3 0 .3.1.3.1 0 .1-.3.1-.6.1h.3c.1 0 0 0 0 0h.1v.2h-.1c0 .1-.1 0-.1.1v.1h-.1v-.1s0 .1-.1.1 0-.1.1-.1H22s0-.1.1-.1h.1v-.1h-.5v.1s.1.1 0 .1h-.1s0 .1-.1.1h-.3c0-.1.1 0 .1-.1h-.1s0-.1.1-.1.1.1.2.1h.1-.1c-.1 0 0-.1 0-.2h-.1c-.4-.1-.2.1-.4.1 0 0 0 .1-.1.1 0 .1-.1.2-.2.1-.1 0-.2 0-.2.1v-.1h-.1c0 .1-.1.1-.1.1v-.2s0 .1-.1.1c0 0-.1 0-.1-.1v.2s-.1 0-.1-.1v-.1c-.1.1-.1 0-.1 0s0-.1.1-.1h.1c-.1 0-.1-.1-.1-.1h.1v.1c0 .1.2 0 .2 0h.2v-.1h-.1c-.1-.1-.1 0-.1 0-.1 0-.2 0-.1-.1 0 .1.1.1.1 0-.1 0-.1 0 0-.1v-.1s0-.1.1 0h-.1.1l.1.1h.1v.1c0 .1 0 .1.1.1h.1v-.1s0-.1.1-.1l.1-.1V23h.2s.1 0 .1.1h.1s0 .1-.1.1c0 0 0 .1-.1.2.3-.1 1 0 1.2 0 .1 0 .4 0 .4-.1 0 0 0-.1-.2-.1s-1 .2-1-.1c-.2-.3.1-.3.2-.2.1-.1.1-.1 0 0 .2-.2.6 0 .7-.1 0 0-.2.1-.3.1.3.1.4-.1.8 0-.3-.1-.8.1-1.2 0 .1 0 .1 0 0 0zm-.9 0s-.1-.1 0 0c-.1 0-.1 0 0 0zm.1.1s-.1 0 0 0l-.1-.1c-.1.1 0 .1.1.1h-.1v.1l.1-.1c-.1.1-.1.1 0 0-.1.1-.1.1 0 0-.1 0-.1 0 0 0-.1 0-.1 0 0 0-.1 0-.1 0 0 0zm0 0c0-.1 0-.1 0 0 0-.1 0 0 0 0zm2.2-.9s0 .1 0 0c0 .1 0 .1 0 0 0 .1 0 .1 0 0v.1c0 .1-.1 0-.1.1 0 0 .1 0 0 .1H23v-.1s0 .1-.1.1v-.1h-.2s0-.1.1-.1h.1v-.1h-.2c-.1 0-.1.1-.2.1h-.2v.1s.1.1 0 .1h-.1s0 .1-.1.1h-.3c0-.1.1 0 .1-.1h-.1s0-.1.1-.1.1.1.2.1h.1-.2c-.1 0-.1-.1 0-.2 0 0 0 .1-.1.1-.6-.1-.3.2-.8.1 0 0 0 .1-.1.1h-.1l-.1.1c-.1 0-.1 0-.2.1v-.1h-.1c0 .1-.1.1-.1.1v-.2s0 .1-.1.1c0 0-.1 0-.1-.1v.2s-.1 0-.1-.1v-.1c-.1.1-.1 0-.1 0s0-.1.1-.1h.1c-.1 0-.1-.1-.1-.1h.1v.1c0 .1.2 0 .2 0h.2s-.1-.1 0-.1v-.1h-.1l-.2-.2v-.1c-.1 0-.2 0-.1-.1 0 .1.1.1.1 0-.1 0-.1-.1 0-.1v-.1s0-.1.1 0c0 0-.1 0-.1-.1h.1s0 .1.1.1h.1v.1c0 .1 0 .1.1.1s.1.1.2.1v-.1s0-.1.1-.1l.1-.1v-.1h.3s.1 0 .1.1h.1s0 .1-.1.1c0 0 0 .1-.1.2.4-.1 1.5 0 1.7 0 .1 0 .4 0 .4-.1 0 0 0-.1-.3-.1-.2 0-1.3.2-1.3-.1 0-.2.3-.1.7-.1.1-.1.6 0 .7 0 0 0-.2.1-.3.1.3.1.4-.1.8 0-.2-.1-.7.2-1.1.1h-.1c-.2 0-.6 0-.6.1 0 .2.9.1 1.2.1.3 0 .4.1.4.1 0 .1-.3.1-.4.1h.3c-.4-.1-.4-.1-.3 0-.1 0 0-.1 0 0zm-2.2-.5s0 .1 0 0c.1.1.1.1.1 0H21zm-.1 0s0-.2 0 0c0 0-.1 0 0 0zm-.1.2c.1.1.1 0 0 0 .1 0 .1 0 0 0 .1 0 .1-.1 0 0l.1-.1h-.1c.1 0 .1 0 0 .1.1-.1.1-.1 0 0 .1-.1 0 0 0 0zm-1.9-2c0 .1-.3.1-.4.1h.5v.2c0 .1-.1 0-.1.1 0 0 .1 0 0 .1h-.1v-.1.1-.1h-.2s0-.1.1-.1h.1V20h-.2c-.1 0-.1.1-.2.1h-.2v.1s.1.1 0 .1H18s0 .1-.1.1h-.3c0-.1.1 0 .1-.1h-.1s0-.1.1-.1.1.1.2.1h.1-.1c-.1 0-.1-.1 0-.1h-.1c-.6-.1-.3.2-.8.1 0 0 0 .1-.1.1l-.1.1h-.1c-.1 0-.2 0-.2.1v-.2h-.1c0 .1-.1.1-.1.1v-.2s0 .1-.1.1c0 0-.1 0-.1-.1v.2s-.1 0-.1-.1v-.1c-.1.1-.1 0-.1 0s0-.1.1-.1h.1c-.1 0-.1-.1-.1-.1v.1c0 .1.2 0 .2 0h.2v-.1h-.1l-.2-.2v-.1c-.1 0-.2 0-.1-.1 0 .1.1.1.1 0-.1 0-.1-.1 0-.1v-.1s0-.1.1 0c0 0-.1 0-.1-.1h.1s0 .1.1.1h.1v.1c0 .1 0 .1.1.1s.1.1.1.1v-.1s0-.1.1-.1l.1-.1v-.1h.3s.1 0 .1.1h.1s0 .1-.1.1c0 .1 0 .1-.1.2.5-.1 1.5 0 1.8 0-.4.1-.1 0 0 0-.1-.1-.1-.1-.4-.1-.2 0-1.3.2-1.3-.1 0-.2.3-.1.7-.1.1-.1.6 0 .7 0 0 0-.2.1-.3.1.3.1.6-.1.8 0-.3-.1-.7.2-1.1.1h-.1c-.2 0-.6 0-.6.1 0 .2.9.1 1.2.1.3-.3.4-.2.4-.1zm-2.3-.2c.1.1.1.1.1 0h-.1zm-.1-.2s-.1 0 0 0c-.1 0-.1 0 0 0 0 .2 0 0 0 0zm-.1.3c0 .1 0 .1 0 0 0 .1.1.1 0 0 .1.1.1 0 0 0 .1 0 .1 0 0 0l.1-.1h-.1c.1 0 .1 0 0 .1.1 0 .1 0 0 0 .1 0 0 0 0 0zm2.6-1.4c0 .1-.3.2-.6.2h.6v.2h-.1c0 .1-.1 0-.1.1 0 0 .1 0 0 .1h-.1v-.1.2-.1h-.2s0-.1.1-.1h.1v-.1h-.2c-.1 0-.1.1-.2.1h-.2v.1c.1 0 .1.1 0 .1H18s0 .1-.1.1h-.1.1-.2c0-.1.1 0 .1-.1h-.1s0-.1.1-.1.1.2.2.1h.1-.1c-.1 0-.1-.1 0-.2h-.1c-.4-.1-.2.2-.6.2h-.1c0 .1-.2.2-.2.2-.1.1-.1 0-.2.1v-.2h-.1c0 .1-.1.1-.1.1V19s0 .1-.1.1c0 0-.1 0-.1-.1v.2s-.1 0-.1-.1V19c-.2 0-.2-.1-.2-.1s0-.1.1-.1h.1c-.1 0-.1-.1-.1-.1H16v.1c0 .1.2 0 .2 0h.2v-.1h-.1c-.1 0-.1-.1-.1-.1v-.1c-.1 0-.2 0-.1-.1 0 .1.1.1.1 0-.1 0-.1-.1 0-.1v-.1s0-.1.1 0c0 0-.1 0-.1-.1h.1s0 .1.1.1V18s.1 0 .1.1v.1c0 .1 0 .1.1.1s.1.1.1.1h.1v-.1s0-.1.1-.1l.1-.1V18h.3s.1 0 .1.1v.1h.1s0 .1-.1.1c0 0 0 .1-.1.2.4-.1 1.1 0 1.3 0 0-.1.3-.1.4-.2-.1-.1-.1-.1-.4-.1-.2 0-1.1.2-1.1-.1 0-.1.2-.1.4-.1.2-.1.4 0 .6-.1 0 0-.1.1-.2.1.3.1.6-.1.9.1-.2-.1-.8.1-1.1 0H18c-.2 0-.3 0-.3.1 0 .2.7.1 1 .1.2-.1.3-.1.3 0zm-2.5.3c-.1 0-.1 0 0 0zm.5-.5c.1.1.1.1.1 0H17zm-.1-.1s-.2 0 0 0c0 .1 0 .1 0 0zm-.2.3c.2.1.2 0 0 0 .2 0 .2 0 0 0 .2-.1.2-.1 0 0l.1-.1h-.1c.2 0 .2 0 0 .1.2-.1.2-.1 0 0 .2-.1 0-.1 0 0zm1.8-1.2c.1 0 .2.1.3.1h.2v.2c0 .1-.1 0-.1.1 0 0 .1 0 0 .1h-.1v-.2h-.2s0-.1.1-.1h.1v-.1h-.4v.2h-.1v.1h-.4c0-.1.1 0 .1-.1h-.1s0-.1.1-.1.1.1.2.1h.1-.1v-.2h-.1c-.3 0-.1.1-.2.1 0 0-.1.1-.2.1v-.1h-.1l-.1.1c-.1 0-.1 0-.1.1v-.1h-.1l-.1.1v-.1s0 .1-.1.1c0 0-.1 0-.1-.1v.2s-.1 0-.1-.1v-.1c-.1.1-.1 0-.1 0s0-.1.1-.1h.1c-.1 0-.1 0-.1-.1h.1v.1h.3s.1 0 .2-.1l-.1-.1c-.1 0-.2 0-.1-.1 0 .1.1.1.1 0-.1 0-.1 0 0-.1v-.1h.1-.1.1v.1h.1v.2l.1.1V17s0-.1.1-.1l.1-.1v-.1h.4s0 .1-.1.1c0 0-.1.1-.1.2.1-.1.2 0 .4.1.3-.1.5-.1.5-.2 0-.2-.9 0-.9-.3 0 0 0-.1.1-.1v-.1c.1-.1.2-.1.3-.2 0 0 0 .1-.1.2.2 0 .2-.3.7-.2-.3.1-.3.3-.8.4l-.1.1c0 .2.9 0 .9.3-.1 0-.2.1-.6.1zm-.7-.4c0 .1 0 .1 0 0 .1.1.1.1 0 0 .1.1 0 0 0 0zm0 0c-.2 0-.2 0 0 0-.2 0-.2 0 0 0-.2 0-.2 0 0 0zm-.2.2c-.1 0-.1 0 0 0 0 .1 0 0 0 0 .1-.1.1-.1.1 0h-.1c0-.1 0-.1 0 0 0-.1 0-.1 0 0zm1.3 5.1c.1 0 .1 0 .1.1s-.1.1-.2.1l-.1 2.4h.1v.2c0 .1-.1.1-.2.1 0 .3-.2.4-.4.4-.1 0-.3-.1-.3-.3 0-.1.1-.2.2-.2s.1 0 .1.1-.2 0-.2.1 0 .1.1.1.2-.1.2-.2c0-.2-.2-.2-.4-.2-1.3-.4-2.1-1.8-2.1-2.8h-.1l.1-.2-.1.1c-.1 0-.2-.1-.2-.2s.1-.2.2-.2.2.1.2.2l.1-.2c.2.1.6.2.9.2.7 0 1.2-.3 1.5-.3.2.1.4.4.5.7zm-2.6.2c-.1 1.2.8 2.1 1.7 2.4l-1.7-2.4zm1.8 2.3c0-.1 0-.3.1-.4l-1.3-1.8h-.3l1.5 2.2zm.1-.8c0-.1 0-.3.1-.4l-.8-1.1c-.1 0-.2.1-.3.1l1 1.4zm.2-1.7c0-.2 0-.3-.1-.3s-.4.1-.7.2l.7 1c0-.2.1-.4.1-.7v-.1c-.1 0-.1-.1-.1-.1h.1zm4.3-2.6c.1 0 .1-.1.1-.1h-.1s.1 0 0-.1c0-.1-.1-.1-.1 0s-.4 0-.4-.3l.1.1h.1c.1 0 .1-.1.1-.1 0-.1-.1-.2-.3-.3-.1 0-.1-.1-.1-.1 0-.1 0-.2-.1-.4v-.2c-.1.1-.1.3.1.6.1.1.4.3.4.4 0 0 0 .1-.1.1h-.1s-.1 0-.1-.1c-.1-.1-.2-.3-.3-.4-.1-.2-.1-.3-.1-.6.1-.1-.1-.4-.1-.6v-.1h-.1s0-.1-.1-.1-.1 0-.1-.1c0 0 0 .1-.1.1h-.4c-.1 0-.1 0 0 .1v.2-.1h.1v.1h-.1v.1h.3c0 .1-.2.1-.2.3l-.1-.1-.1-.1-.1-.1c-.1 0-.1-.1-.1-.1v-.1l-.1-.1v.2s0-.1-.1-.1c0 0 0-.1-.1 0 0 0 0 .1.1.1h-.1v.2h-.1c-.1.1 0 .2.1.1v.3c0 .1.1.2.3.3l-.2.2s-.1.1-.2.1l-.1-.1h-.2.2-.1s-.1.1 0 .1v-.1s.1.1.1 0v.1s.1.1.1 0l-.1-.1v-.1s0 .1.1 0v-.1h.2s0-.1.1-.1h.1s0-.1.1-.1c0 .3.3.2.4.4-.1 0-.2-.1-.3-.1s-.2.1-.2.2.1.2.1.3h-.2c-.1 0-.1-.1-.2-.1 0 0-.1 0-.1.1h.1s-.1 0-.1.1c0 0 0 .1.1 0 0 0 0 .1.1 0h.1s0-.1.1 0h.2v-.1c0-.1-.1-.1-.1-.1 0-.1.1-.2.2-.2 0 .1.1.3.3.4.1 0 .2-.1.2-.1v.1h-.1s-.1 0-.1.1h.1s.1.1.1 0c0 0-.1.1 0 .1s0-.1.1-.1v.1h.1v-.1s.1 0 .1-.1c1 .6 1 .6 1 .4 0 .2 0 .2 0 0 0 .2 0 0 0 0zm.7.6c.1 0 .2.1.2.2l-.1.1s.1.1.1.2c-.1 0-.1 0-.2-.1 0 .1 0 .1-.1.1s-.2 0-.2-.1c0 .1.2 0 .1 0h-1.5c0 .1 0 .2-.1.3-.1-.1-.1-.2-.1-.3h-1.3c0 .1.1.1.1 0 0 .1-.1.2-.2.2H20s-.1.1-.2.1c0-.1 0-.1.1-.2-.1 0-.1 0-.1-.1s0-.2.2-.2c-.1 0 0 .2 0 .1v-1.9c-.1 0-.2 0-.3-.1.1-.1.2-.1.3-.1v-1.8c-.1 0-.1.1 0 .1-.1 0-.2-.1-.1-.2l.1-.1s-.1-.1-.1-.2c.1 0 .1 0 .2.1 0-.1 0-.1.1-.1s.2 0 .2.2c0-.1-.1-.1-.1 0 .3.1.8.2 1.1.4.3.2.7.6 1 .9l.1.1c0-.1.1-.1.3-.1-.2.3-.3.3-.3.3.4.7.8 1.4.9 2.3V20zm-1.3-2.3c-.2-.3-.6-.6-.9-.8-.2-.2-.6-.3-.9-.4v.2c-.1 0-.1 0-.1-.1v1.2c.1 0 .1 0 .1.1v.1c.1 0 .1 0 .2.1-.1.1-.1.1-.2.1.1 0 .1.1 0 .1l-.1.1V20s.1-.1.2-.1c0 .1 0 .1-.1.2h1c0-.1 0-.1.1-.1h.1c0-.1 0-.1.1-.2.1.1.1.1.1.2 0-.1.1-.1.1 0l.1.1H23s-.1-.1-.1-.2h.1c-.1-.7-.3-1.2-.7-1.8h-.1s-.1-.1 0-.1c0 0-.1.1-.2 0 0-.1 0-.1.1-.2v-.1zm4.2 2.7v.4c0 1-.2 2.1-.6 3-.3.9-.9 1.8-1.5 2.4-.3.3-.7.7-1 .9-.1.1-.4.2-2-.2-.2 0-.3-.1-.6-.1 0-.2 0-.3.1-.4.1-.2.1-.3.2-.4.1 0 .1-.1.2-.1.6-.2 1-.7 1.5-1.2.4-.6.8-1.1 1-1.8.2-.7.3-1.3.3-2h-4.5v5c.3 0 1 .1 1 .1-.1.2-.2.4-.2.8-.6-.1-1-.3-1.6-.6.4-.2.6-.2.8-.2v-4.9h-4.7c0-.2-.1-.6-.2-.7-.2-.3-.3-.4-.3-.9 0-.2-.1-.6-.3-.8-.1-.1-.7-.8-.8-.9.3-.9.9-1.8 1.5-2.4.4-.4.9-.9 1.5-1.2-.2-.2-.6-.4-.6-.9 0-.2.1-.4.2-.6-.3-.9-.8-2-1.2-2.6l.9-.4c-.2.3-.2.8-.2 1 .2-.2.4-.4.6-.7 0 .3.2.8.3 1-.2 0-.4-.1-.8 0 .1.2.6.6 1.1.3.3-.1.7-.2.7-.6 0-.1-.1-.3-.3-.3s-.2.3-.1.4c-.2-.1-.6-.9-.1-1 .3-.1.7.3.8.7 0-.2.2-.7.6-.7.4 0 .3.8.1 1 0-.2-.2-.4-.3-.4s-.2.1-.2.3c0 .2.3.4.8.4.3 0 1.1-.1 1.1-.9-.2 0-.7.2-.8.4V9.4c.2.3.6.6.8.6-.1-.3-.3-.7-.7-.9h1.7c-.3.2-.6.6-.7.9.2 0 .6-.2.8-.4v1.2c-.2-.2-.6-.4-.8-.4.1.8.8.9 1.1.9.4 0 .8-.1.8-.4 0-.2-.1-.3-.2-.3s-.2.1-.3.4c0-.2-.2-1.1.2-1.1.3 0 .4.3.6.8.1-.3.4-.8.8-.7.3.1.1.9-.1 1 .1-.1 0-.4-.1-.4-.2 0-.3.1-.3.3 0 .2.3.4.7.6.6.1 1-.2 1.1-.4-.2-.1-.4-.1-.8.1.1-.2.3-.8.3-1 .1.3.2.6.6.7 0-.2 0-.7-.2-1l.9.4c-.4.4-1 1.6-1.2 2.6.2.1.3.3.3.7 0 .4-.2.7-.6.9.6.3 1 .8 1.5 1.2.3.3.6.8.9 1.2 0 0-.1.1-.1.2-.1.1-.2.2-.2.3-.1.1-.1.2-.1.3 0 .1 0 .2.1.4l1 2c-.6 0-.4.2-.2.3zm-7-5c-.6 0-1.2.1-1.8.4-.6.2-1.1.7-1.5 1.2-.4.6-.8 1.1-1 1.8-.2.7-.3 1.3-.3 2.1h4.6v-5.5zm.1-2.2c1.6 0 2.6.4 3.2.9.3-.2.6-.4.6-.7 0-.9-2.5-1-3.7-1-1.2 0-3.7.1-3.7 1 0 .2.1.4.6.7.5-.4 1.5-.9 3-.9zm4.7 7.7c0-.7-.1-1.4-.3-2.1-.2-.7-.6-1.2-1-1.8-.4-.6-.9-.9-1.5-1.2-.6-.2-1.1-.4-1.7-.4v5.5h4.5zm11 11.1c0-.1-.1-.1-.1-.1-1.5.4-3.2-.8-4.9-1.9-1.5-1-2.8-1.9-4-1.9-.4 0-.8.1-1.1.2-.4.2-.7.6-.9 1.1-.2.4-.4.8-.6 1.1-.2.3-.3.6-.3.8 0 .2.1.4.3.7.1.2.4.3.8.6.1 0 .1.1.2.1.3.1.4.2.4.4-.6.2-1.3.4-2.1.6-.9.1-2 .2-3.1.2s-2.1-.1-3.1-.2c-.9-.1-1.6-.3-2.1-.6 0-.2.2-.3.6-.4.1 0 .1-.1.2-.1.3-.1.6-.3.8-.4.2-.2.3-.3.3-.6s-.1-.6-.3-.8c-.1-.2-.3-.6-.6-1.1-.2-.4-.6-.9-.9-1.1-.3-.2-.7-.2-1.1-.2-1.2 0-2.6.9-4 1.9-1.8 1.1-3.6 2.3-4.9 1.9-.1 0-.1 0-.1.1s0 .1.1.1c.4.2.8.4 1.2.8.6.4 1 .8 1.6.8.6 0 1.1-.1 1.8-.6.6-.3 1.2-.7 1.8-1.1 1.1-.8 2.3-1.6 3.5-1.7l-.3.3c-.3.3-.7.6-.7 1.1 0 .4.1.7.3 1.1.1.1.1.2.2.4s.2.4.2.8c0 .1.1.3.1.4.1.2.2.8 1 1.2 1 .4 2.6.8 4.9.8 2.2 0 3.9-.2 4.9-.8.8-.4 1-.9 1-1.2 0-.2.1-.3.1-.4.1-.3.1-.6.2-.8.1-.2.2-.3.2-.6.2-.3.3-.6.3-.9 0-.6-.3-.8-.7-1.1l-.3-.3c1.1.1 2.3.9 3.5 1.7.6.4 1.2.8 1.8 1.1.7.3 1.2.6 1.8.6.6 0 1-.3 1.6-.8.3-.3.8-.6 1.2-.8-.9-.2-.7-.3-.7-.4zm-14.6-1.4c.4 0 .7.3.7.7 0 .3-.2.6-.3.8-.1-.2-.1-.3-.2-.3-.2 0-.1 1.1-.8 1.1v.2c0 .2-.2.4-.4.4s-.5-.3-.5-.5v-.2c-.7 0-.6-1.1-.8-1.1-.1 0-.2.1-.2.3-.1-.2-.3-.4-.3-.8 0-.3.2-.7.7-.7h.2V29c.7.1 1.2.2 1.8.2v1.2c0 .2 0 .2.1.2zm-1.1 2.6c.1 0 .2-.1.2-.2s-.1-.2-.2-.2-.2.1-.2.2.1.2.2.2zm1.5-1.5c.1-.1.1-.3.1-.4 0-.2-.1-.4-.4-.4-.6 0-.4.8-.7.8-.1 0-.2-.1-.2-.2 0-.2.3-.4.3-.8s-.3-.6-.6-.8c-.3.2-.6.6-.6.8 0 .3.3.6.3.8 0 .1-.1.2-.2.2-.2 0-.1-.8-.7-.8-.3 0-.4.3-.4.4 0 .1 0 .2.1.4l.2-.2c.4 0 .2 1.1.8 1.1.2 0 .3-.1.3-.3 0-.1-.1-.2-.1-.3 0-.1.1-.2.2-.2s.2 0 .2.2c0 .1-.1.2-.1.3s.1.3.3.3c.4 0 .3-1.1.8-1.1.3 0 .3.1.4.2zm.3-4.1c.7.1 1.5.3 1.9.2l-.1.1c-.2.2-.4.3-.7.6-.7.4-1.3.7-1.8.7-.6 0-1.3-.1-2.1-.3-.7-.2-1.3-.4-1.8-.7-.2.2-.6.2-.9.1-.3-.1-.6-.6-.6-.8v-.1l-.7-.7c-.7-.7-1.1-1.6-1.5-2.4-.1-.4-.3-.9-.3-1.3.6.2.8 0 1-.2.1 0 .1.2.1.2.7 0 1-.4 1.1-.8.1.4.1.8.3 1.1.2.7.6 1.2 1 1.8.1.2.3.3.4.4.1 0 .2-.1.3-.1.2 0 .4.1.7.3.2.2.2.4.2.7 1.3.4 2.5.8 3.5 1.2zM17.4 26c.1 0 .1.1.2.1 0-.1-.1-.2-.2-.4-.1-.1-.3-.2-.6-.2-.4 0-.8.4-1 .6-.1 0-.2 0-.3-.1 0 .1.1.2.1.3-.2.3-.3.7-.3.9 0 .1.2.4.4.7.2.1.3.1.6 0-.1-.1-.2-.1-.3-.2-.1 0-.2-.1-.2-.2v-.1c0-.1 0-.2.1-.3v-.3h.1c.1.1.3.1.4.1 0 0 .1 0 .1-.1.1-.1 0-.3-.2-.4l-.1-.4.1-.1c.1-.1.1-.2.2-.2.5.1.6.1.9.3zm.7 1.9c.2 0 .4-.2.4-.4s-.2-.4-.4-.4-.4.2-.4.4c-.1.3.2.4.4.4zm1.9.7c.2 0 .4-.2.4-.4s-.2-.4-.4-.4-.4.2-.4.4c0 .1.2.4.4.4zM20 5c-.2-.2-.4-.4-.4-.8.2 0 .6.2.8.4V3.5c-.3.3-.5.5-.9.5 0-.2.2-.6.4-.8h-1.1c.2.3.4.6.4.8-.2 0-.6-.2-.8-.4v1.1c.2-.2.4-.4.8-.4 0 .3-.2.6-.4.8H20zm-1.6 1.4c.1.4.6.8 1 .8s.9-.3 1-.8h-2zm1.2-.4h.8c-.1-.4-.4-.8-.8-.8V6zm-.4 0v-.8c-.4.1-.8.4-.8.8h.8zm.8 1.5c-.1 0-.2.1-.3.1V9h.3V7.5zm-1.1 1.6h.3V7.7c-.1 0-.2-.1-.3-.1v1.5zm1.2-1.8c0 .2.1.3.3.3s.3-.1.3-.3c0-.2-.1-.3-.3-.3s-.3.1-.3.3zm1-.1c.2 0 .3-.1.3-.3 0-.1-.1-.2-.3-.2s-.3.1-.3.3c0 .1.2.2.3.2zM22 7c.2 0 .3-.1.3-.3 0-.2-.1-.3-.3-.3s-.3.1-.3.3c0 .2.1.3.3.3zm2.2.8c.2 0 .3-.1.3-.3 0-.2-.1-.3-.3-.3s-.3.1-.3.3c0 .2.2.3.3.3zm-.5-.6c.2 0 .3-.1.3-.3 0-.2-.1-.3-.3-.3s-.3.1-.3.3c-.1.2 0 .3.3.3zm-.9-.2c.2 0 .3-.1.3-.3 0-.2-.1-.3-.3-.3s-.3.1-.3.3c-.1.1.2.3.3.3zm1.8 2.4c-.2 0-.3.1-.3.3 0 .2.1.3.3.3s.3-.1.3-.3c0-.2-.1-.3-.3-.3zm.1-.7c-.2 0-.3.1-.3.3 0 .2.1.3.3.3s.3-.1.3-.3c0-.2-.1-.3-.3-.3zm-.4-.5c0 .2.1.3.3.3s.4-.1.4-.3c0-.2-.1-.3-.3-.3s-.4.1-.4.3zm-5.9-.5c.2 0 .3-.1.3-.3 0-.2-.1-.3-.3-.3s-.3.1-.3.3c0 0 .2.3.3.3zm-.8-.5c.2 0 .3-.1.3-.3 0-.2-.1-.3-.3-.3s-.3.1-.3.3c.1.2.2.3.3.3zm-.7-.2c.2 0 .3-.1.3-.3 0-.2-.1-.3-.3-.3s-.3.1-.3.3c-.1.2.1.3.3.3zm-2.3.8c.2 0 .3-.1.3-.3 0-.2-.1-.3-.3-.3s-.3.1-.3.3c0 .2.1.3.3.3zm.6-.6c.2 0 .3-.1.3-.3 0-.2-.1-.3-.3-.3s-.3.1-.3.3c-.1.2.2.3.3.3zm.9-.2c.2 0 .3-.1.3-.3 0-.2-.1-.3-.3-.3s-.3.1-.3.3c-.1.1.1.3.3.3zm-1.5 2.8c0-.2-.1-.3-.3-.3s-.3 0-.3.3c0 .2.1.3.3.3.1 0 .3-.1.3-.3zm-.2-.8c0-.2-.1-.3-.3-.3-.2 0-.3.1-.3.3 0 .2.1.3.3.3.2 0 .3-.2.3-.3zm-.2-.5c.2 0 .3-.1.3-.3 0-.2-.1-.3-.3-.3s-.4.1-.4.3c0 .1.3.3.4.3zm7.7.3c-.1.1-.4.4-.4.8 0 .2.2.6.3.8.1-.3.4-.4.4-.8 0-.3-.2-.5-.3-.8zm-4.9 0c-.2.3-.3.6-.3.9 0 .3.3.4.4.8.1-.3.3-.6.3-.8 0-.5-.3-.8-.4-.9z\\"></path>\\n\\n          <image src=\\"/assets/images/crest.svg\\" xlink:href=\\"\\" width=\\"40\\" height=\\"40\\"></image>\\n        </svg>\\n        HMPPS\\n      </a>\\n\\n      <a class=\\"connect-dps-external-header__link connect-dps-external-header__title__service-name\\" href=\\"#\\">Digital Services</a>\\n\\n      \\n          <strong class=\\"govuk-tag\\">\\n  DEV\\n</strong>\\n\\n      \\n    </div>\\n\\n    <nav aria-label=\\"Account navigation\\">\\n      <ul class=\\"connect-dps-external-header__navigation\\">\\n        \\n          <li class=\\"connect-dps-external-header__navigation__item\\">\\n            <a data-qa=\\"manageDetails\\" class=\\"connect-dps-external-header__link\\" href=\\"http://localhost:9091/auth/account-details\\" data-test=\\"manage-account-link\\">\\n              <span data-qa=header-user-name>J. Smith</span>\\n              <span class=\\"connect-dps-external-header__link__sub-text\\">Manage your details</span>\\n            </a>\\n          </li>\\n        \\n\\n        <li class=\\"connect-dps-external-header__navigation__item\\">\\n          <a data-qa=\\"signOut\\" class=\\"connect-dps-external-header__link\\" href=\\"/sign-out\\">Sign out</a>\\n        </li>\\n      </ul>\\n    </nav>\\n  </div>\\n</header>\\n",
          "css": [
            "https://frontend-components-dev.hmpps.service.justice.gov.uk/assets/stylesheets/header.css"
          ],
          "javascript": []
        },
        "footer": {
          "html": "\\n    <footer class=\\"govuk-footer govuk-!-display-none-print\\" role=\\"contentinfo\\">\\n  <div class=\\"govuk-width-container \\">\\n    \\n    <div class=\\"govuk-footer__meta\\">\\n      <div class=\\"govuk-footer__meta-item govuk-footer__meta-item--grow\\">\\n        \\n          <h2 class=\\"govuk-visually-hidden\\">Support links</h2>\\n          \\n            <ul class=\\"govuk-footer__inline-list\\">\\n              \\n                <li class=\\"govuk-footer__inline-list-item\\">\\n                  <a class=\\"govuk-footer__link\\" href=\\"#\\">\\n                    Feedback and support\\n                  </a>\\n                </li>\\n              \\n                <li class=\\"govuk-footer__inline-list-item\\">\\n                  <a class=\\"govuk-footer__link\\" href=\\"#\\">\\n                    Terms and conditions\\n                  </a>\\n                </li>\\n              \\n            </ul>\\n          \\n          \\n        \\n        <svg\\n          aria-hidden=\\"true\\"\\n          focusable=\\"false\\"\\n          class=\\"govuk-footer__licence-logo\\"\\n          xmlns=\\"http://www.w3.org/2000/svg\\"\\n          viewBox=\\"0 0 483.2 195.7\\"\\n          height=\\"17\\"\\n          width=\\"41\\"\\n        >\\n          <path\\n            fill=\\"currentColor\\"\\n            d=\\"M421.5 142.8V.1l-50.7 32.3v161.1h112.4v-50.7zm-122.3-9.6A47.12 47.12 0 0 1 221 97.8c0-26 21.1-47.1 47.1-47.1 16.7 0 31.4 8.7 39.7 21.8l42.7-27.2A97.63 97.63 0 0 0 268.1 0c-36.5 0-68.3 20.1-85.1 49.7A98 98 0 0 0 97.8 0C43.9 0 0 43.9 0 97.8s43.9 97.8 97.8 97.8c36.5 0 68.3-20.1 85.1-49.7a97.76 97.76 0 0 0 149.6 25.4l19.4 22.2h3v-87.8h-80l24.3 27.5zM97.8 145c-26 0-47.1-21.1-47.1-47.1s21.1-47.1 47.1-47.1 47.2 21 47.2 47S123.8 145 97.8 145\\"\\n          />\\n        </svg>\\n        <span class=\\"govuk-footer__licence-description\\">\\n          \\n            All content is available under the\\n            <a\\n              class=\\"govuk-footer__link\\"\\n              href=\\"https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/\\"\\n              rel=\\"license\\"\\n            >Open Government Licence v3.0</a>, except where otherwise stated\\n          \\n        </span>\\n      </div>\\n      <div class=\\"govuk-footer__meta-item\\">\\n        <a\\n          class=\\"govuk-footer__link govuk-footer__copyright-logo\\"\\n          href=\\"https://www.nationalarchives.gov.uk/information-management/re-using-public-sector-information/uk-government-licensing-framework/crown-copyright/\\"\\n        >© Crown copyright</a>\\n      </div>\\n    </div>\\n  </div>\\n</footer>\\n\\n",
          "css": [
            "https://frontend-components-dev.hmpps.service.justice.gov.uk/assets/stylesheets/footer.css"
          ],
          "javascript": []
        }
      }`),
    },
  })

export default {
  getSignInUrl,
  stubAuthPing: ping,
  stubAuthManageDetails: manageDetails,
  stubSignIn: (roles: string[]): Promise<[Response, Response, Response, Response, Response, Response]> =>
    Promise.all([favicon(), redirect(), signOut(), token(roles), feComponents(), tokenVerification.stubVerifyToken()]),
}
