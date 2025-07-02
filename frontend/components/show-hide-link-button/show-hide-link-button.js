/**
 * This component creates a button styled like a link which toggles all
 * govuk-details components on the page between their open and closed states, if
 * they are decorated with the appropriate CSS class.
 *
 * The css classes involved:
 *  - wrapper class hmpps-show-hide-links
 *  - button class hmpps-show-hide-link-button
 *  - details class show-hide-details
 */
var showing = false

function ShowHideLinkButton(button) {
  this.showHideLinkButton = button

  this.showHideLinkButton.addEventListener('click', e => {
    e.preventDefault()
    e.stopPropagation()

    let elements = document.querySelectorAll('.show-hide-details')
    elements.forEach(element => {
      if (showing) {
        if (element.attributes.getNamedItem('open')) {
          element.attributes.removeNamedItem('open')
        }
      } else {
        if (!element.attributes.getNamedItem('open')) {
          element.setAttribute('open', null)
        }
      }
    })

    showing = !showing
    this.showHideLinkButton.textContent = showing ? 'Hide all pick-up times' : 'Show all pick-up times'
  })
}

export { ShowHideLinkButton }
