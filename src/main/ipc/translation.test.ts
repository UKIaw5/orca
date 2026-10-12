import { beforeEach, describe, expect, it, vi } from 'vitest'

const { handlers, keyStore, fetchMock } = vi.hoisted(() => ({
  handlers: new Map<string, (event: unknown, ...args: unknown[]) => unknown>(),
  keyStore: { key: null as string | null },
  fetchMock: vi.fn()
}))

vi.mock('electron', () => ({
  ipcMain: {
    handle: (channel: string, fn: (event: unknown, ...args: unknown[]) => unknown) =>
      handlers.set(channel, fn)
  }
}))

vi.mock('../translation/google-translate-api-key-store', () => ({
  hasGoogleTranslateApiKey: () => keyStore.key !== null,
  getGoogleTranslateApiKeyProtection: () => (keyStore.key === null ? null : 'sealed'),
  readGoogleTranslateApiKey: () => keyStore.key,
  saveGoogleTranslateApiKey: (key: string) => {
    keyStore.key = key.trim()
  },
  clearGoogleTranslateApiKey: () => {
    keyStore.key = null
  }
}))

import { registerTranslationHandlers } from './translation'

function invoke(channel: string, ...args: unknown[]): unknown {
  const handler = handlers.get(channel)
  if (!handler) {
    throw new Error(`no handler ${channel}`)
  }
  return handler({}, ...args)
}

describe('translation IPC handlers', () => {
  beforeEach(() => {
    handlers.clear()
    keyStore.key = null
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
    registerTranslationHandlers()
  })

  it('reports, saves and clears the key status', async () => {
    expect(await invoke('translation:getApiKeyStatus')).toEqual({
      configured: false,
      protection: null
    })
    expect(await invoke('translation:saveApiKey', ' abc ')).toEqual({
      configured: true,
      protection: 'sealed'
    })
    expect(keyStore.key).toBe('abc')
    expect(await invoke('translation:clearApiKey')).toEqual({
      configured: false,
      protection: null
    })
  })

  it('returns an error result instead of throwing when no key is set', async () => {
    expect(await invoke('translation:translate', 'hello')).toEqual({
      ok: false,
      error: 'Google Translate API key is not configured'
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('translates through the provider and reports success', async () => {
    keyStore.key = 'KEY'
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ data: { translations: [{ translatedText: 'こんにちは' }] } }))
    )
    expect(await invoke('translation:translate', 'hello')).toEqual({
      ok: true,
      translated: 'こんにちは',
      truncated: false
    })
  })

  it('rejects non-string input', async () => {
    expect(await invoke('translation:translate', 42)).toEqual({
      ok: false,
      error: 'Nothing to translate'
    })
  })
})
