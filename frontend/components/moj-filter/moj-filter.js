function MojFilter($filter) {
  this.toggleButton = $filter.querySelector('.moj-action-bar__filter')

  new MOJFrontend.FilterToggleButton({
    bigModeMediaQuery: '(min-width: 48.063em)',
    startHidden: true,
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
