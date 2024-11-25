import express from 'express'
import Agent, { HttpsAgent } from 'agentkeepalive'
import superagent from 'superagent'
import { URLSearchParams } from 'url'
import _ from 'lodash'
import logger from '../../logger'
import sanitiseError from '../sanitisedError'
import type { ApiConfig } from '../config'
import generateOauthClientToken from '../authentication/clientCredentials'
import config from '../config'
import TokenStore from './tokenStore/tokenStore'
import RedisTokenStore from './tokenStore/redisTokenStore'
import { createRedisClient } from './redisClient'
import InMemoryTokenStore from './tokenStore/inMemoryTokenStore'

export enum TokenType {
  USER_TOKEN = 'USER_TOKEN',
  SYSTEM_TOKEN = 'SYSTEM_TOKEN',
}

interface Request {
  path: string
  query?: object | string
  headers?: Record<string, string>
  responseType?: string
  raw?: boolean
}

interface RequestWithBody extends Request {
  data?: Record<string, unknown>
  retry?: boolean
}

function getSystemClientTokenFromHmppsAuth(username: string): Promise<superagent.Response> {
  const timeoutSpec = config.apis.hmppsAuth.timeout
  const hmppsAuthUrl = config.apis.hmppsAuth.url

  const clientToken = generateOauthClientToken(
    config.apis.hmppsAuth.systemClientId,
    config.apis.hmppsAuth.systemClientSecret,
  )

  const grantRequest = new URLSearchParams({
    grant_type: 'client_credentials',
    username,
  }).toString()

  return superagent
    .post(`${hmppsAuthUrl}/oauth/token`)
    .set('Authorization', clientToken)
    .set('content-type', 'application/x-www-form-urlencoded')
    .send(grantRequest)
    .timeout(timeoutSpec)
}

export default abstract class RestClient {
  agent: Agent

  tokenStore: TokenStore

  protected constructor(
    private readonly name: string,
    private readonly apiConfig: ApiConfig,
  ) {
    this.agent = apiConfig.url.startsWith('https') ? new HttpsAgent(apiConfig.agent) : new Agent(apiConfig.agent)
    this.tokenStore = config.redis.enabled ? new RedisTokenStore(createRedisClient()) : new InMemoryTokenStore()
  }

  private apiUrl() {
    return this.apiConfig.url
  }

  private timeoutConfig() {
    return this.apiConfig.timeout
  }

  private async getSystemClientToken(username: string): Promise<string> {
    const token = await this.tokenStore.getToken(username)
    if (token) {
      return token
    }

    const newToken = await getSystemClientTokenFromHmppsAuth(username)

    // set TTL slightly less than expiry of token. Async but no need to wait
    await this.tokenStore.setToken(username, newToken.body.access_token, newToken.body.expires_in - 60)

    return newToken.body.access_token
  }

  async get<Response = unknown>(
    { path, query = {}, headers = {}, responseType = '', raw = false }: Request,
    user: Express.User,
    client = TokenType.SYSTEM_TOKEN,
  ): Promise<Response> {
    logger.info(
      `${this.name} GET: ${path}${_.isEmpty(query) ? '' : `?${new URLSearchParams(query as Record<string, string>).toString()}`}`,
    )

    const token = client === TokenType.SYSTEM_TOKEN ? await this.getSystemClientToken(user.username) : user.token

    try {
      const result = await superagent
        .get(`${this.apiUrl()}${path}`)
        .query(query)
        .agent(this.agent)
        .retry(2, (err, res) => {
          if (err) logger.info(`Retry handler found ${this.name} API error with ${err.code} ${err.message}`)
          return undefined // retry handler only for logging retries, not to influence retry logic
        })
        .auth(token, { type: 'bearer' })
        .set(headers)
        .responseType(responseType)
        .timeout(this.timeoutConfig())

      return raw ? result : result.body
    } catch (error) {
      const sanitisedError = sanitiseError(error)
      logger.warn({ ...sanitisedError }, `Error calling ${this.name}, path: '${path}', verb: 'GET'`)
      throw sanitisedError
    }
  }

  private async requestWithBody<Response = unknown>(
    method: 'patch' | 'post' | 'put',
    { path, query = {}, headers = {}, responseType = '', data = {}, raw = false, retry = false }: RequestWithBody,
    user: Express.User,
    client = TokenType.SYSTEM_TOKEN,
  ): Promise<Response> {
    logger.info(
      `${this.name} ${method.toUpperCase()}: ${path}${_.isEmpty(query) ? '' : `?${new URLSearchParams(query as Record<string, string>).toString()}`}`,
    )

    const token = client === TokenType.SYSTEM_TOKEN ? await this.getSystemClientToken(user.username) : user.token

    try {
      const result = await superagent[method](`${this.apiUrl()}${path}`)
        .query(query)
        .send(data)
        .agent(this.agent)
        .retry(2, (err, res) => {
          if (retry === false) {
            return false
          }
          if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message}`)
          return undefined // retry handler only for logging retries, not to influence retry logic
        })
        .auth(token, { type: 'bearer' })
        .set(headers)
        .responseType(responseType)
        .timeout(this.timeoutConfig())

      return raw ? result : result.body
    } catch (error) {
      const sanitisedError = sanitiseError(error)
      logger.warn({ ...sanitisedError }, `Error calling ${this.name}, path: '${path}', verb: '${method.toUpperCase()}'`)
      throw sanitisedError
    }
  }

  async patch<Response = unknown>(
    request: RequestWithBody,
    user: Express.User,
    client = TokenType.SYSTEM_TOKEN,
  ): Promise<Response> {
    return this.requestWithBody('patch', request, user, client)
  }

  async post<Response = unknown>(
    request: RequestWithBody,
    user: Express.User,
    client = TokenType.SYSTEM_TOKEN,
  ): Promise<Response> {
    return this.requestWithBody('post', request, user, client)
  }

  async put<Response = unknown>(
    request: RequestWithBody,
    user: Express.User,
    client = TokenType.SYSTEM_TOKEN,
  ): Promise<Response> {
    return this.requestWithBody('put', request, user, client)
  }

  async delete<Response = unknown>(
    { path, query = {}, headers = {}, responseType = '', raw = false }: Request,
    user: Express.User,
    client = TokenType.SYSTEM_TOKEN,
  ): Promise<Response> {
    logger.info(
      `${this.name} DELETE: ${path}${_.isEmpty(query) ? '' : `?${new URLSearchParams(query as Record<string, string>).toString()}`}`,
    )

    const token = client === TokenType.SYSTEM_TOKEN ? await this.getSystemClientToken(user.username) : user.token

    try {
      const result = await superagent
        .delete(`${this.apiUrl()}${path}`)
        .query(query)
        .agent(this.agent)
        .retry(2, (err, res) => {
          if (err) logger.info(`Retry handler found ${this.name} API error with ${err.code} ${err.message}`)
          return undefined // retry handler only for logging retries, not to influence retry logic
        })
        .auth(token, { type: 'bearer' })
        .set(headers)
        .responseType(responseType)
        .timeout(this.timeoutConfig())

      return raw ? result : result.body
    } catch (error) {
      const sanitisedError = sanitiseError(error)
      logger.warn({ ...sanitisedError }, `Error calling ${this.name}, path: '${path}', verb: 'DELETE'`)
      throw sanitisedError
    }
  }

  async pipeFileStream(
    { path, query = {}, headers = {}, responseType = '' }: Request,
    response: express.Response,
    user: Express.User,
    client = TokenType.SYSTEM_TOKEN,
  ): Promise<void> {
    logger.info(
      `${this.name} PIPE FILESTREAM: ${path}${_.isEmpty(query) ? '' : `?${new URLSearchParams(query as Record<string, string>).toString()}`}`,
    )

    const token = client === TokenType.SYSTEM_TOKEN ? await this.getSystemClientToken(user.username) : user.token

    return new Promise((resolve, reject) => {
      const stream = superagent
        .get(`${this.apiUrl()}${path}`)
        .query(query)
        .agent(this.agent)
        .retry(2, (err, res) => {
          if (err) logger.info(`Retry handler found ${this.name} API error with ${err.code} ${err.message}`)
          return undefined // retry handler only for logging retries, not to influence retry logic
        })
        .auth(token, { type: 'bearer' })
        .set(headers)
        .responseType(responseType)
        .timeout(this.timeoutConfig())

      stream.on('end', () => {
        resolve()
      })

      stream.on('response', res => {
        if (res.status !== 200) {
          logger.warn(res.error, `Error calling ${this.name}`)
          stream.abort()
          reject(res.error)
        }

        response.set('content-disposition', res.headers['content-disposition'])
      })

      stream.pipe(response)
    })
  }
}
