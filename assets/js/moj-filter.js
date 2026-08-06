import { FilterToggleButton } from '@ministryofjustice/frontend'

function MojFilter(container) {
  this.container = container
  this.toggleButton = container.querySelector('.moj-action-bar__filter')
  this.filtersApplied = container.getAttribute('filters-applied') === 'true'

  FilterToggleButton.prototype.setupResponsiveChecks = () => undefined

  new FilterToggleButton(container, {
    bigModeMediaQuery: '(min-width: 48.063em)',
    startHidden: !this.filtersApplied,
    toggleButton: {
      container: this.toggleButton,
      showText: 'Show filter',
      hideText: 'Hide filter',
      classes: 'govuk-button--blue',
    },
    toggleButtonContainer: {
      selector: '.moj-action-bar__filter',
    },
    closeButton: {
      text: 'Close',
    },
    closeButtonContainer: {
      selector: '.moj-filter__header-action',
    },
  })
}

export default MojFilter
