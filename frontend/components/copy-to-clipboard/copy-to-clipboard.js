function CopyButton(button) {
  this.copyButton = button

  this.copyButton.addEventListener('click', e => {
    e.preventDefault()

    const link = button.getAttribute('data-link')

    navigator.clipboard.writeText(link)
  })
}

export { CopyButton }
