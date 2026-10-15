import { describe, expect, it, vi } from 'vitest'
import { createGoogleTranslateProvider } from './google-translate-provider'

const LANGS = { from: 'en', to: 'ja' }

function readSentQuery(init: RequestInit): string {
  const body: unknown = JSON.parse(String(init.body))
  if (typeof body === 'object' && body !== null && 'q' in body && typeof body.q === 'string') {
    return body.q
  }
  throw new Error('request body has no q')
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status })
}

describe('createGoogleTranslateProvider', () => {
  it('sends protected html with header auth and restores identifiers', async () => {
    const fetchImpl = vi.fn(async (_url: string, init: RequestInit) => {
      const sentQuery = readSentQuery(init)
      // Fake MT: keeps no-translate spans, "translates" the prose around them.
      return jsonResponse({
        data: {
          translations: [
            { translatedText: sentQuery.replace('Call ', '呼び出し: ').replace(' first.', '。') }
          ]
        }
      })
    })
    const provider = createGoogleTranslateProvider({ readApiKey: () => 'KEY', fetchImpl })

    const result = await provider.translate('Call getUserName first.', LANGS)

    expect(result).toBe('呼び出し: getUserName。')
    const [url, init] = fetchImpl.mock.calls[0]
    expect(url).not.toContain('KEY')
    expect(new Headers(init.headers).get('X-goog-api-key')).toBe('KEY')
    expect(JSON.parse(String(init.body))).toEqual({
      q: 'Call <span translate="no">getUserName</span> first.',
      source: 'en',
      target: 'ja',
      format: 'html'
    })
  })

  it('decodes html entities in the response', async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse({ data: { translations: [{ translatedText: '&quot;a&quot; &amp; b' }] } })
    )
    const provider = createGoogleTranslateProvider({ readApiKey: () => 'KEY', fetchImpl })
    await expect(provider.translate('x', LANGS)).resolves.toBe('"a" & b')
  })

  it('fails without a key and does not call the network', async () => {
    const fetchImpl = vi.fn()
    const provider = createGoogleTranslateProvider({ readApiKey: () => null, fetchImpl })
    await expect(provider.translate('x', LANGS)).rejects.toThrow('not configured')
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('tells the user to re-enter a key that cannot be decrypted', async () => {
    const fetchImpl = vi.fn()
    const readApiKey = (): string => {
      throw new Error('Google Translate API key could not be decrypted')
    }
    const provider = createGoogleTranslateProvider({ readApiKey, fetchImpl })
    await expect(provider.translate('x', LANGS)).rejects.toThrow('Re-enter it in Settings')
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('surfaces the API error message without the key', async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse({ error: { message: 'API key not valid.' } }, 400)
    )
    const provider = createGoogleTranslateProvider({ readApiKey: () => 'SECRET', fetchImpl })
    await expect(provider.translate('x', LANGS)).rejects.toMatchObject({
      message: 'Google Translate failed (400): API key not valid.'
    })
  })

  it('reports network failures without leaking the cause', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error('getaddrinfo ENOTFOUND for key=SECRET')
    })
    const provider = createGoogleTranslateProvider({ readApiKey: () => 'SECRET', fetchImpl })
    await expect(provider.translate('x', LANGS)).rejects.toThrow('Could not reach Google Translate')
  })

  it('rejects malformed success bodies', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ data: {} }))
    const provider = createGoogleTranslateProvider({ readApiKey: () => 'KEY', fetchImpl })
    await expect(provider.translate('x', LANGS)).rejects.toThrow('unexpected response')
  })
})
