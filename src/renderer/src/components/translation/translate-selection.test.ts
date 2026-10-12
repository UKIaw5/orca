import { describe, expect, it, vi } from 'vitest'
import { translateSelectedText } from './translate-selection'
import {
  readActiveTranslationSelection,
  registerActiveTranslationSelectionSource
} from './translation-selection-source'
import type { TranslationResultSink } from './translation-result-sink'

vi.mock('@/i18n/i18n', () => ({
  translate: (_key: string, fallback: string) => fallback
}))
vi.mock('sonner', () => ({ toast: Object.assign(vi.fn(), { loading: vi.fn(), error: vi.fn() }) }))

function fakeSink(): TranslationResultSink {
  return { showPending: vi.fn(), showResult: vi.fn(), showError: vi.fn() }
}

describe('translateSelectedText', () => {
  it('shows pending then the translated result', async () => {
    const sink = fakeSink()
    const translateText = vi.fn(async () => ({
      ok: true as const,
      translated: 'こんにちは',
      truncated: false
    }))
    await translateSelectedText('  hello ', sink, translateText)
    expect(translateText).toHaveBeenCalledWith('hello')
    expect(sink.showPending).toHaveBeenCalledWith('hello')
    expect(sink.showResult).toHaveBeenCalledWith({
      source: 'hello',
      translated: 'こんにちは',
      truncated: false
    })
  })

  it('asks for a selection instead of calling the provider', async () => {
    const sink = fakeSink()
    const translateText = vi.fn()
    await translateSelectedText('   ', sink, translateText)
    expect(translateText).not.toHaveBeenCalled()
    expect(sink.showError).toHaveBeenCalledWith('Select some text to translate.')
  })

  it('shows the provider error message', async () => {
    const sink = fakeSink()
    await translateSelectedText('x', sink, async () => ({ ok: false as const, error: 'bad key' }))
    expect(sink.showError).toHaveBeenCalledWith('bad key')
  })

  it('shows a short error when the IPC call rejects', async () => {
    const sink = fakeSink()
    await translateSelectedText('x', sink, async () => {
      throw new Error('ipc down')
    })
    expect(sink.showError).toHaveBeenCalledWith('Translation failed.')
  })
})

describe('active selection source', () => {
  it('reads the latest registered source and ignores a stale release', () => {
    const releaseA = registerActiveTranslationSelectionSource({ readSelection: () => 'a' })
    const releaseB = registerActiveTranslationSelectionSource({ readSelection: () => 'b' })
    expect(readActiveTranslationSelection()).toBe('b')
    releaseA()
    expect(readActiveTranslationSelection()).toBe('b')
    releaseB()
    expect(readActiveTranslationSelection()).toBe('')
  })
})
