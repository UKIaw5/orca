// @vitest-environment happy-dom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/i18n/i18n', () => ({
  translate: (_key: string, fallback: string, params?: Record<string, string>) =>
    fallback.replace(/\{\{(\w+)\}\}/g, (_match, name: string) => params?.[name] ?? '')
}))
vi.mock('@/hooks/useShortcutLabel', () => ({ useShortcutLabel: () => 'Unassigned' }))
type StoreState = { settings: { terminalRightClickToPaste?: boolean } | null }
const storeState: StoreState = { settings: null }
vi.mock('../../store', () => ({
  useAppStore: (select: (state: StoreState) => unknown) => select(storeState)
}))
vi.mock('sonner', () => ({ toast: { error: vi.fn() } }))

const api = {
  getApiKeyStatus: vi.fn(),
  saveApiKey: vi.fn(),
  clearApiKey: vi.fn(),
  translate: vi.fn()
}

const { TranslationPane } = await import('./TranslationPane')

describe('TranslationPane', () => {
  beforeEach(() => {
    vi.stubGlobal('window', Object.assign(window, { api: { translation: api } }))
    api.getApiKeyStatus.mockResolvedValue({ configured: false, protection: null })
  })
  afterEach(() => {
    storeState.settings = null
    cleanup()
    vi.clearAllMocks()
  })

  it('says selected text leaves the machine', async () => {
    render(<TranslationPane />)
    expect(await screen.findByText(/sent to Google Cloud Translation/)).toBeTruthy()
  })

  it('saves a trimmed-nonempty key and shows it as configured', async () => {
    api.saveApiKey.mockResolvedValue({ configured: true, protection: 'sealed' })
    render(<TranslationPane />)
    const input = await screen.findByLabelText('Google Cloud Translation API key')
    const save = screen.getByRole('button', { name: 'Save Key' })
    expect(save.hasAttribute('disabled')).toBe(true)
    fireEvent.change(input, { target: { value: 'AIza-test' } })
    fireEvent.click(save)
    await waitFor(() => expect(screen.getByText('Configured')).toBeTruthy())
    expect(api.saveApiKey).toHaveBeenCalledWith('AIza-test')
  })

  it('removes a configured key', async () => {
    api.getApiKeyStatus.mockResolvedValue({ configured: true, protection: 'sealed' })
    api.clearApiKey.mockResolvedValue({ configured: false, protection: null })
    render(<TranslationPane />)
    fireEvent.click(await screen.findByRole('button', { name: 'Remove API key' }))
    await waitFor(() => expect(screen.queryByText('Configured')).toBeNull())
  })

  it('warns when the stored key is unencrypted', async () => {
    api.getApiKeyStatus.mockResolvedValue({ configured: true, protection: 'plaintext' })
    render(<TranslationPane />)
    expect((await screen.findByRole('alert')).textContent).toContain('Your Google Translate key')
  })

  it('explains how to reach the terminal menu when right-click pastes', async () => {
    storeState.settings = { terminalRightClickToPaste: true }
    render(<TranslationPane />)
    expect(await screen.findByText(/Ctrl\+right-click opens the menu/)).toBeTruthy()
  })

  it('omits the terminal menu hint when right-click opens the menu', async () => {
    storeState.settings = { terminalRightClickToPaste: false }
    render(<TranslationPane />)
    await screen.findByText(/sent to Google Cloud Translation/)
    expect(screen.queryByText(/Ctrl\+right-click/)).toBeNull()
  })
})
