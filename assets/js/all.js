import { nodeListForEach } from './utils'
import AutoComplete from './autocomplete'
import RefreshButton from './refresh-button'
import { PrintButton, ExportButton } from './print-and-export'
import { ShowHideLinkButton } from './show-hide-link-button'
import MojFilter from './moj-filter'
import { initSchedule } from './timeline-init'
import { formatDate } from '../../server/utils/utils'

function initAll() {
  var $autoCompleteElements = document.getElementsByName('autocompleteElements')
  nodeListForEach($autoCompleteElements, function ($autoCompleteElement) {
    new AutoComplete($autoCompleteElement)
  })

  var $mojFilters = document.querySelectorAll(`[data-module="moj-filter"]`)
  nodeListForEach($mojFilters, function ($mojFilter) {
    new MojFilter($mojFilter)
  })

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

  var $showHideLinkButtons = document.querySelectorAll('[class*=hmpps-show-hide-link-button]')
  nodeListForEach($showHideLinkButtons, function ($showHideLinkButton) {
    new ShowHideLinkButton($showHideLinkButton)
  })

  // Adds a timestamp to the printed page anywhere the data-printed-at attribute is present
  window.addEventListener('beforeprint', () => {
    const date = new Date()
    document.querySelectorAll('[data-printed-at]').forEach(el => {
      el.innerText = `Printed at ${formatDate(date, 'HH:mm')} on ${formatDate(date, 'iiii d MMMM yyyy')}`
    })
  })

  initSchedule()
}

export { initAll }
