import { ApplicationInsights } from '@microsoft/applicationinsights-web'
import { ClickAnalyticsPlugin } from '@microsoft/applicationinsights-clickanalytics-js'

if (window.applicationInsightsConnectionString) {
  const clickPluginInstance = new ClickAnalyticsPlugin()
  const clickPluginConfig = {
    autoCapture: true,
    dataTags: {
      useDefaultContentNameOrId: true,
    },
  }
  const snippet = {
    config: {
      connectionString: window.applicationInsightsConnectionString,
      extensions: [
        clickPluginInstance,
      ],
      extensionConfig: {
        [clickPluginInstance.identifier]: clickPluginConfig,
      },
      autoTrackPageVisitTime: true,
    },
  }

  const init = new ApplicationInsights(snippet)
  const appInsights = init.loadAppInsights()
  appInsights.addTelemetryInitializer(function (envelope) {
    envelope.tags["ai.cloud.role"] = window.applicationInsightsApplicationName
    envelope.tags["ai.application.ver"] = window.buildNumber
  });
  appInsights.setAuthenticatedUserContext(window.authenticatedUser)
  appInsights.trackPageView();

  initMetricClickEvents(appInsights)
}

function initMetricClickEvents(appInsights) {
  Array.from(document.querySelectorAll('[data-track-click-event]')).forEach(el => {
    if (!el.dataset.trackClickEvent) return

    el.addEventListener('click', () => {
      const name = el.dataset.trackClickEvent
      const properties = el.dataset.trackEventProperties ? JSON.parse(el.dataset.trackEventProperties) : undefined
      const measurements = el.dataset.trackEventMeasurements ? JSON.parse(el.dataset.trackEventMeasurements) : undefined

      appInsights.trackEvent({ name, properties, measurements })
    })
  })
}
