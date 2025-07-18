const production = process.env.NODE_ENV === 'production'

function get<T>(name: string, fallback: T, options = { requireInProduction: false }): T | string {
  if (process.env[name]) {
    return process.env[name]
  }
  if (fallback !== undefined && (!production || !options.requireInProduction)) {
    return fallback
  }
  throw new Error(`Missing env var ${name}`)
}

const requiredInProduction = { requireInProduction: true }

export class AgentConfig {
  // Sets the working socket to timeout after timeout milliseconds of inactivity on the working socket.
  timeout: number

  constructor(timeout = 8000) {
    this.timeout = timeout
  }
}

export interface ApiConfig {
  url: string
  timeout: {
    // sets maximum time to wait for the first byte to arrive from the server, but it does not limit how long the
    // entire download can take.
    response: number
    // sets a deadline for the entire request (including all uploads, redirects, server processing time) to complete.
    // If the response isn't fully downloaded within that time, the request will be aborted.
    deadline: number
  }
  agent: AgentConfig
}

const auditConfig = () => {
  const auditEnabled = get('AUDIT_ENABLED', 'false') === 'true'
  return {
    enabled: auditEnabled,
    queueUrl: get(
      'AUDIT_SQS_QUEUE_URL',
      'http://localhost:4566/000000000000/mainQueue',
      auditEnabled && requiredInProduction,
    ),
    serviceName: get('AUDIT_SERVICE_NAME', 'UNASSIGNED', auditEnabled && requiredInProduction),
    region: get('AUDIT_SQS_REGION', 'eu-west-2'),
  }
}

export default {
  buildNumber: get('BUILD_NUMBER', '1_0_0', requiredInProduction),
  productId: get('PRODUCT_ID', 'UNASSIGNED', requiredInProduction),
  gitRef: get('GIT_REF', 'xxxxxxxxxxxxxxxxxxx', requiredInProduction),
  branchName: get('GIT_BRANCH', 'xxxxxxxxxxxxxxxxxxx', requiredInProduction),
  production,
  https: production,
  staticResourceCacheDuration: '1h',
  redis: {
    enabled: get('REDIS_ENABLED', 'false', requiredInProduction) === 'true',
    host: get('REDIS_HOST', 'localhost', requiredInProduction),
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_AUTH_TOKEN,
    tls_enabled: get('REDIS_TLS_ENABLED', 'false'),
  },
  session: {
    secret: get('SESSION_SECRET', 'app-insecure-default-session', requiredInProduction),
    expiryMinutes: Number(get('WEB_SESSION_TIMEOUT_IN_MINUTES', 120)),
  },
  apis: {
    hmppsAuth: {
      url: get('HMPPS_AUTH_URL', 'http://localhost:9090/auth', requiredInProduction),
      healthPath: '/health/ping',
      externalUrl: get('HMPPS_AUTH_EXTERNAL_URL', get('HMPPS_AUTH_URL', 'http://localhost:9090/auth')),
      timeout: {
        response: Number(get('HMPPS_AUTH_TIMEOUT_RESPONSE', 10000)),
        deadline: Number(get('HMPPS_AUTH_TIMEOUT_DEADLINE', 10000)),
      },
      agent: new AgentConfig(Number(get('HMPPS_AUTH_TIMEOUT_RESPONSE', 10000))),
      apiClientId: get('API_CLIENT_ID', 'clientid', requiredInProduction),
      apiClientSecret: get('API_CLIENT_SECRET', 'clientsecret', requiredInProduction),
      systemClientId: get('SYSTEM_CLIENT_ID', 'clientid', requiredInProduction),
      systemClientSecret: get('SYSTEM_CLIENT_SECRET', 'clientsecret', requiredInProduction),
    },
    manageUsersApi: {
      url: get('MANAGE_USERS_API_URL', 'http://localhost:9091', requiredInProduction),
      healthPath: '/health/ping',
      timeout: {
        response: Number(get('MANAGE_USERS_API_TIMEOUT_RESPONSE', 10000)),
        deadline: Number(get('MANAGE_USERS_API_TIMEOUT_DEADLINE', 10000)),
      },
      agent: new AgentConfig(Number(get('MANAGE_USERS_API_TIMEOUT_RESPONSE', 10000))),
    },
    tokenVerification: {
      url: get('TOKEN_VERIFICATION_API_URL', 'http://localhost:8100', requiredInProduction),
      healthPath: '/health/ping',
      timeout: {
        response: Number(get('TOKEN_VERIFICATION_API_TIMEOUT_RESPONSE', 5000)),
        deadline: Number(get('TOKEN_VERIFICATION_API_TIMEOUT_DEADLINE', 5000)),
      },
      agent: new AgentConfig(Number(get('TOKEN_VERIFICATION_API_TIMEOUT_RESPONSE', 5000))),
      enabled: get('TOKEN_VERIFICATION_ENABLED', 'false') === 'true',
    },
    frontendComponents: {
      url: get('FRONTEND_COMPONENT_API_URL', 'http://localhost:8082', requiredInProduction),
      healthPath: '/health',
      timeout: {
        response: Number(get('FRONTEND_COMPONENT_API_TIMEOUT_RESPONSE', 5000)),
        deadline: Number(get('FRONTEND_COMPONENT_API_TIMEOUT_DEADLINE', 5000)),
      },
      agent: new AgentConfig(Number(get('FRONTEND_COMPONENT_API_TIMEOUT_RESPONSE', 5000))),
    },
    activitiesAndAppointmentsApi: {
      url: get('ACTIVITIES_AND_APPOINTMENTS_API_URL', 'http://localhost:8083', requiredInProduction),
      healthPath: '/health/ping',
      timeout: {
        response: Number(get('ACTIVITIES_AND_APPOINTMENTS_API_TIMEOUT_RESPONSE', 30000)),
        deadline: Number(get('ACTIVITIES_AND_APPOINTMENTS_API_TIMEOUT_DEADLINE', 30000)),
      },
      agent: new AgentConfig(Number(get('ACTIVITIES_AND_APPOINTMENTS_API_TIMEOUT_RESPONSE', 30000))),
    },
    bookAVideoLinkApi: {
      url: get('BOOK_A_VIDEO_LINK_API_URL', 'http://localhost:8084', requiredInProduction),
      healthPath: '/health/ping',
      timeout: {
        response: Number(get('BOOK_A_VIDEO_LINK_API_TIMEOUT_RESPONSE', 30000)),
        deadline: Number(get('BOOK_A_VIDEO_LINK_API_TIMEOUT_DEADLINE', 30000)),
      },
      agent: new AgentConfig(Number(get('BOOK_A_VIDEO_LINK_API_TIMEOUT_RESPONSE', 30000))),
    },
    locationsInsidePrisonApi: {
      url: get('LOCATIONS_INSIDE_PRISON_API_URL', 'http://localhost:8085', requiredInProduction),
      healthPath: '/health/ping',
      timeout: {
        response: Number(get('LOCATIONS_INSIDE_PRISON_API_TIMEOUT_RESPONSE', 30000)),
        deadline: Number(get('LOCATIONS_INSIDE_PRISON_API_TIMEOUT_DEADLINE', 30000)),
      },
      agent: new AgentConfig(Number(get('LOCATIONS_INSIDE_PRISON_API_TIMEOUT_RESPONSE', 30000))),
    },
    nomisMappingApi: {
      url: get('NOMIS_MAPPING_API_URL', 'http://localhost:8086', requiredInProduction),
      healthPath: '/health/ping',
      timeout: {
        response: Number(get('NOMIS_MAPPING_API_TIMEOUT_RESPONSE', 30000)),
        deadline: Number(get('NOMIS_MAPPING_API_TIMEOUT_DEADLINE', 30000)),
      },
      agent: new AgentConfig(Number(get('NOMIS_MAPPING_API_TIMEOUT_RESPONSE', 30000))),
    },
    prisonApi: {
      url: get('PRISON_API_URL', 'http://localhost:8087', requiredInProduction),
      healthPath: '/health/ping',
      timeout: {
        response: Number(get('PRISON_API_TIMEOUT_RESPONSE', 30000)),
        deadline: Number(get('PRISON_API_TIMEOUT_DEADLINE', 30000)),
      },
      agent: new AgentConfig(Number(get('PRISON_API_TIMEOUT_RESPONSE', 30000))),
    },
    prisonRegisterApi: {
      url: get('PRISON_REGISTER_API_URL', 'http://localhost:8088', requiredInProduction),
      healthPath: '/health/ping',
      timeout: {
        response: Number(get('PRISON_REGISTER_API_TIMEOUT_RESPONSE', 30000)),
        deadline: Number(get('PRISON_REGISTER_API_TIMEOUT_DEADLINE', 30000)),
      },
      agent: new AgentConfig(Number(get('PRISON_REGISTER_API_TIMEOUT_RESPONSE', 30000))),
    },
    prisonerSearchApi: {
      url: get('PRISONER_SEARCH_API_URL', 'http://localhost:8089', requiredInProduction),
      healthPath: '/health/ping',
      timeout: {
        response: Number(get('PRISONER_SEARCH_API_TIMEOUT_RESPONSE', 30000)),
        deadline: Number(get('PRISONER_SEARCH_API_TIMEOUT_DEADLINE', 30000)),
      },
      agent: new AgentConfig(Number(get('PRISONER_SEARCH_API_TIMEOUT_RESPONSE', 30000))),
    },
  },
  sqs: {
    audit: auditConfig(),
  },
  dpsUrl: get('DPS_URL', 'http://localhost:3000', requiredInProduction),
  activitiesAndAppointmentsUrl: get('ACTIVITIES_AND_APPOINTMENTS_URL', 'http://localhost:3000', requiredInProduction),
  domain: get('INGRESS_URL', 'http://localhost:3000', requiredInProduction),
  environmentName: get('ENVIRONMENT_NAME', ''),
  feedbackUrl: get('FEEDBACK_URL', '#'),
  applicationInsightsConnectionString: get('APPLICATIONINSIGHTS_CONNECTION_STRING', '', requiredInProduction),
  featureBulkPrintMovementSlips: get('FEATURE_BULK_PRINT_MOVEMENT_SLIPS', 'false') === 'true',
  featureToggles: {
    hmctsLinkAndGuestPin: get('FEATURE_HMCTS_LINK_GUEST_PIN', 'false') === 'true',
    pickUpTimes: get('FEATURE_PICK_UP_TIMES', 'false') === 'true',
  },
}
