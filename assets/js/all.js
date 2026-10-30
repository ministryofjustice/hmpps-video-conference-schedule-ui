import { nodeListForEach } from './utils'
import AutoComplete from './autocomplete'
import RefreshButton from './refresh-button'
import { PrintButton, ExportButton } from './print-and-export'
import { ShowHideLinkButton } from './show-hide-link-button'
import MojFilter from './moj-filter'
import { initSchedule } from './timeline-init'

function HmppsTabs($tabsElement) {
  const tab = new URLSearchParams(location.search).get('tab')

  if (tab) {
    const value = { MON: 'monday', TUE: 'tuesday', WED: 'wednesday', THU: 'thursday', FRI: 'friday' }[tab]
    const url = new URL(location.href)
    url.searchParams.delete('tab')
    history.replaceState(null, '', url.toString())
    setTimeout(() => $tabsElement.querySelector(`#tab_${value}`)?.click(), 0)
  }
}

function HmppsHash($hashInputElement) {
  addEventListener('hashchange', () => {
    const value = { '#monday': 'MON', '#tuesday': 'TUE', '#wednesday': 'WED', '#thursday': 'THU', '#friday': 'FRI' }[location.hash]
    $hashInputElement.value = value ?? ''
  })
}

function initAll() {
  var $tabsElements = document.querySelectorAll(`[data-module="hmpps-tabs"]`)
  nodeListForEach($tabsElements, function ($tabsElement) {
    new HmppsTabs($tabsElement)
  })

  var $hashInputElements = document.querySelectorAll(`input[data-module="hmpps-hash"]`)
  nodeListForEach($hashInputElements, function ($hashInputElement) {
    new HmppsHash($hashInputElement)
  })

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

  initSchedule()
}

export { initAll }
