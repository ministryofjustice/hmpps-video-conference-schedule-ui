import { stubGet } from './wiremock'

export default {
  stubBookAVideoLinkPing: () => stubGet('/book-a-video-link-api/health/ping'),
}
