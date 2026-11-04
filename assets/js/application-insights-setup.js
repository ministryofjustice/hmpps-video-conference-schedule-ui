import { ApplicationInsights } from '@microsoft/applicationinsights-web'
import { ClickAnalyticsPlugin } from '@microsoft/applicationinsights-clickanalytics-js'

if (window.applicationInsightsConnectionString) {
  const clickPluginInstance = new ClickAnalyticsPlugin()
  const clickPluginConfig = {
    autoCapture: true,
    dataTags: {
      useDefaultContentNameOrId: true,
      customDataPrefix: 'data-custom-',
    },
  }

  const init = new ApplicationInsights({
    config: {
      connectionString: window.applicationInsightsConnectionString,
      extensions: [clickPluginInstance],
      extensionConfig: {
        [clickPluginInstance.identifier]: clickPluginConfig,
      },
      autoTrackPageVisitTime: true,
    },
  })
  const appInsights = init.loadAppInsights()
  appInsights.addTelemetryInitializer(function (envelope) {
    envelope.tags['ai.cloud.role'] = window.applicationInsightsApplicationName
    envelope.tags['ai.application.ver'] = window.buildNumber
  })
  appInsights.setAuthenticatedUserContext(window.authenticatedUser)
  appInsights.trackPageView()
}
