/**
 * Content Security Policy compliant schedule layout setup function.
 * Maps data-* attributes to CSS Custom Properties without inline styles
 * This is for cross-browser compatibility without using inline styles.
 */

function initSchedule() {
  // 1. Update row structures
  document.querySelectorAll('[data-row-height]').forEach(row => {
    row.style.setProperty('--row-height', row.dataset.rowHeight)
  })

  // 2. Update timeline grids
  document.querySelectorAll('[data-total-hours]').forEach(grid => {
    grid.style.setProperty('--total-hours', grid.dataset.totalHours)
  })

  // 3. Batch process all dynamic floating cards and status lines in one sweep
  const placementSelectors = ['.appointment-card', '.free-space-line', '.booked-space-line'].join(', ')

  document.querySelectorAll(placementSelectors).forEach(el => {
    const { left, width, top } = el.dataset
    if (left) el.style.setProperty('--left', left)
    if (width) el.style.setProperty('--width', width)
    if (top) el.style.setProperty('--top', top)
  })
}

export { initSchedule }
