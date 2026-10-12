import { describe, expect, it, vi } from 'vitest'
import { createTranslationService } from './translation-service'
import type { TranslationProvider } from './translation-provider'

function fakeProvider(): TranslationProvider & { translate: ReturnType<typeof vi.fn> } {
  return { id: 'fake', translate: vi.fn(async (text: string) => `ja:${text}`) }
}

describe('createTranslationService', () => {
  it('passes the language pair and returns the translation', async () => {
    const provider = fakeProvider()
    const service = createTranslationService({ provider })
    await expect(service.translate('  hello  ')).resolves.toEqual({
      translated: 'ja:hello',
      truncated: false,
      cached: false
    })
    expect(provider.translate).toHaveBeenCalledWith('hello', { from: 'en', to: 'ja' })
  })

  it('rejects blank input without calling the provider', async () => {
    const provider = fakeProvider()
    await expect(createTranslationService({ provider }).translate('   ')).rejects.toThrow()
    expect(provider.translate).not.toHaveBeenCalled()
  })

  it('truncates long input and reports it', async () => {
    const provider = fakeProvider()
    const result = await createTranslationService({ provider, maxChars: 5 }).translate('abcdefgh')
    expect(result).toEqual({ translated: 'ja:abcde', truncated: true, cached: false })
  })

  it('serves repeated text from cache', async () => {
    const provider = fakeProvider()
    const service = createTranslationService({ provider })
    await service.translate('same')
    const second = await service.translate('same')
    expect(second.cached).toBe(true)
    expect(provider.translate).toHaveBeenCalledTimes(1)
  })

  it('evicts the least recently used entry', async () => {
    const provider = fakeProvider()
    const service = createTranslationService({ provider, cacheSize: 2 })
    await service.translate('a')
    await service.translate('b')
    await service.translate('a')
    await service.translate('c')
    await service.translate('a')
    await service.translate('b')
    expect(provider.translate).toHaveBeenCalledTimes(4)
  })

  it('does not cache failures', async () => {
    const provider = fakeProvider()
    provider.translate.mockRejectedValueOnce(new Error('boom'))
    const service = createTranslationService({ provider })
    await expect(service.translate('x')).rejects.toThrow('boom')
    await expect(service.translate('x')).resolves.toMatchObject({ cached: false })
  })
})
