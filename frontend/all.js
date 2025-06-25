import { nodeListForEach } from './utils'
import AutoComplete from './components/autocomplete/autocomplete'
import RefreshButton from './components/refresh-button/refresh-button'
import { PrintButton, ExportButton } from './components/action-bar/print-and-export'
import MojFilter from './components/moj-filter/moj-filter'
import { CopyButton } from './components/copy-to-clipboard/copy-to-clipboard'

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

  var $copyButtons = document.querySelectorAll('[class*=govuk-button--copy]')
  nodeListForEach($copyButtons, function ($copyButton) {
    new CopyButton($copyButton)
  })
}

export { initAll }
