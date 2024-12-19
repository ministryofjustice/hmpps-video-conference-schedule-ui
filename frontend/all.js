import { nodeListForEach } from './utils'
import RefreshButton from './components/refresh-button/refresh-button'

function initAll() {
  var $refreshButtons = document.querySelectorAll('[class*=js-refresh]')
  nodeListForEach($refreshButtons, function ($refreshButton) {
    new RefreshButton($refreshButton)
  })
}

export { initAll }
