function RefreshButton(button) {
  this.refreshButton = button

  this.refreshButton.addEventListener('click', e => {
    e.preventDefault()
    window.location.reload()
  })
}

export default RefreshButton
