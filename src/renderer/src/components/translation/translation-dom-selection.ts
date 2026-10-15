export function readDomSelectionText(): string {
  return window.getSelection()?.toString() ?? ''
}

// Why: a right-click elsewhere must not translate text the user isn't pointing at.
export function readDomSelectionAtPoint(x: number, y: number): string {
  const selection = window.getSelection()
  if (!selection || selection.isCollapsed) {
    return ''
  }
  for (let index = 0; index < selection.rangeCount; index += 1) {
    for (const rect of selection.getRangeAt(index).getClientRects()) {
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        return selection.toString()
      }
    }
  }
  return ''
}
