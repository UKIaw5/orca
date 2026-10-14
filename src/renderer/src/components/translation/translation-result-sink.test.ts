import { describe, expect, it, vi } from 'vitest'

const { toastMock } = vi.hoisted(() => ({
  toastMock: Object.assign(vi.fn(), {
    loading: vi.fn(),
    success: vi.fn(),
    error: vi.fn()
  })
}))
vi.mock('sonner', () => ({ toast: toastMock }))

import { createToastResultSink } from './translation-result-sink'

describe('createToastResultSink', () => {
  it('replaces the loading toast with a typed success toast so the spinner stops', () => {
    const sink = createToastResultSink()
    sink.showPending('hi')
    sink.showResult({ source: 'hi', translated: 'やあ', truncated: false })
    expect(toastMock.loading).toHaveBeenCalledWith('Translating…', { id: 'translate-selection' })
    expect(toastMock.success).toHaveBeenCalledWith(
      'やあ',
      expect.objectContaining({ id: 'translate-selection' })
    )
    expect(toastMock).not.toHaveBeenCalled()
  })
})
