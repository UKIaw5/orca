// @vitest-environment happy-dom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const translateSelectedText = vi.fn()

vi.mock('@/i18n/i18n', () => ({ translate: (_key: string, fallback: string) => fallback }))
vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ open, children }: { open: boolean; children: ReactNode }) => (
    <div data-open={open}>{children}</div>
  ),
  DropdownMenuTrigger: ({ children }: { children: ReactNode }) => children,
  DropdownMenuContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuItem: ({ onSelect, children }: { onSelect: () => void; children: ReactNode }) => (
    <button onClick={onSelect}>{children}</button>
  )
}))
vi.mock('./translate-selection', () => ({
  translateSelectedText: (text: string) => translateSelectedText(text)
}))

const { DomSelectionTranslateMenu } = await import('./DomSelectionTranslateMenu')

function selectParagraph(paragraph: HTMLElement, rect: DOMRect): void {
  window.getSelection()?.selectAllChildren(paragraph)
  vi.spyOn(Range.prototype, 'getClientRects').mockReturnValue(
    Object.assign([rect], { item: (index: number) => [rect][index] ?? null })
  )
}

const SELECTION_RECT = new DOMRect(0, 0, 100, 20)

describe('DomSelectionTranslateMenu', () => {
  afterEach(() => {
    cleanup()
    window.getSelection()?.removeAllRanges()
    vi.restoreAllMocks()
    vi.clearAllMocks()
  })

  it('opens on a right-click over the selection and translates the selected text', () => {
    render(
      <>
        <p>Read me</p>
        <DomSelectionTranslateMenu />
      </>
    )
    selectParagraph(screen.getByText('Read me'), SELECTION_RECT)

    expect(fireEvent.contextMenu(screen.getByText('Read me'), { clientX: 10, clientY: 10 })).toBe(
      false
    )
    fireEvent.click(screen.getByText('Translate Selection to Japanese'))

    expect(translateSelectedText).toHaveBeenCalledWith('Read me')
  })

  it('ignores a right-click away from the selection', () => {
    render(
      <>
        <p>Read me</p>
        <DomSelectionTranslateMenu />
      </>
    )
    selectParagraph(screen.getByText('Read me'), SELECTION_RECT)

    expect(fireEvent.contextMenu(screen.getByText('Read me'), { clientX: 500, clientY: 500 })).toBe(
      true
    )
  })

  it('leaves surfaces that already claimed the event alone', () => {
    render(
      <>
        <p onContextMenu={(event) => event.preventDefault()}>Read me</p>
        <DomSelectionTranslateMenu />
      </>
    )
    selectParagraph(screen.getByText('Read me'), SELECTION_RECT)
    fireEvent.contextMenu(screen.getByText('Read me'), { clientX: 10, clientY: 10 })

    expect(screen.getByText('Translate Selection to Japanese').closest('[data-open]')).toBeTruthy()
    expect(
      screen.getByText('Translate Selection to Japanese').closest('[data-open="true"]')
    ).toBeNull()
  })

  it('leaves editable fields to the native menu', () => {
    render(
      <>
        <textarea aria-label="field" defaultValue="Read me" />
        <DomSelectionTranslateMenu />
      </>
    )
    selectParagraph(screen.getByLabelText('field'), SELECTION_RECT)

    expect(
      fireEvent.contextMenu(screen.getByLabelText('field'), { clientX: 10, clientY: 10 })
    ).toBe(true)
  })
})
