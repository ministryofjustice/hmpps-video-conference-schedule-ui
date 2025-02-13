function MojFilter($filter) {
  this.toggleButton = $filter.querySelector('.moj-action-bar__filter')
  this.filtersApplied = $filter.getAttribute('filters-applied') === 'true'

  // The MOJFrontend component from the moj-frontend library contains a bug where the filters will pop out and expand
  // when the media changes from `print` to `screen`, i.e. when you close the print dialogue. Overriding the following function
  // resolves that, although this will just mean that the smaller screens (ipad, phones) may not behave as expected. Meh.
  MOJFrontend.FilterToggleButton.prototype.setupResponsiveChecks = () => undefined;

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
