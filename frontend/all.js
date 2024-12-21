import { nodeListForEach } from './utils'
import RefreshButton from './components/refresh-button/refresh-button'

function initAll() {
  var $refreshButtons = document.querySelectorAll('[class*=hmpps-refresh]')
  nodeListForEach($refreshButtons, function ($refreshButton) {
    new RefreshButton($refreshButton)
  })
}

export { initAll }
