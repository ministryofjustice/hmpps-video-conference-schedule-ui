function MojFilter($filter) {
  this.toggleButton = $filter.querySelector('.moj-action-bar__filter')
  this.filtersApplied = $filter.getAttribute('filters-applied') === 'true'

  new MOJFrontend.FilterToggleButton({
    bigModeMediaQuery: '(min-width: 48.063em)',
    startHidden: !this.filtersApplied,
    toggleButton: {
      container: this.toggleButton,
      showText: 'Show filter',
      hideText: 'Hide filter',
      classes: 'govuk-button--blue'
    },
    filter: {
      container: $filter.querySelector('.moj-filter')
    }
  })
}

export default MojFilter
