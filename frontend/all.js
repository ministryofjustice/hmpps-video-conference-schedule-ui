import { nodeListForEach } from './utils'
import RefreshButton from './components/refresh-button/refresh-button'
import { PrintButton, ExportButton } from './components/action-bar/print-and-export'

function initAll() {
  var $refreshButtons = document.querySelectorAll('[class*=hmpps-refresh]')
  nodeListForEach($refreshButtons, function ($refreshButton) {
    new RefreshButton($refreshButton)
  })

  var $printButtons = document.querySelectorAll('[class*=hmpps-print-and-export--print]')
  nodeListForEach($printButtons, function ($printButton) {
    new PrintButton($printButton)
  })

  var $exportButtons = document.querySelectorAll('[class*=hmpps-print-and-export--export]')
  nodeListForEach($exportButtons, function ($exportButton) {
    new ExportButton($exportButton)
  })
}

export { initAll }
