// @vitest-environment happy-dom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { registerActiveTranslationSelectionSource } from '../translation/translation-selection-source'

const translateSelectedText = vi.fn()

vi.mock('@/i18n/i18n', () => ({ translate: (_key: string, fallback: string) => fallback }))
vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenuItem: ({
    onSelect,
    children
  }: {
    onSelect: () => void
    children: React.ReactNode
  }) => <button onClick={onSelect}>{children}</button>
}))
vi.mock('../translation/translate-selection', () => ({
  translateSelectedText: (text: string) => translateSelectedText(text)
}))

const { TerminalTranslateMenuItem } = await import('./TerminalTranslateMenuItem')

describe('TerminalTranslateMenuItem', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('translates the selection captured when the menu opened, even after focus left the pane', () => {
    const unregister = registerActiveTranslationSelectionSource({ readSelection: () => 'hello' })
    render(<TerminalTranslateMenuItem />)
    unregister()
    fireEvent.click(screen.getByText('Translate Selection to Japanese'))
    expect(translateSelectedText).toHaveBeenCalledWith('hello')
  })

  it('renders nothing without a selection', () => {
    const { container } = render(<TerminalTranslateMenuItem />)
    expect(container.innerHTML).toBe('')
  })
})
