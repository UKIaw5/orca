import { describe, expect, it } from 'vitest'
import {
  closeTranslationPopup,
  getTranslationPopupState,
  rememberTranslationAnchor
} from './translation-popup-store'
import { createPopupResultSink } from './translation-result-sink'

describe('createPopupResultSink', () => {
  it('walks pending → result at the remembered anchor, and closes', () => {
    rememberTranslationAnchor({ x: 10, y: 20 })
    const sink = createPopupResultSink()
    sink.showPending('hi')
    expect(getTranslationPopupState()).toEqual({ status: 'pending', anchor: { x: 10, y: 20 } })
    sink.showResult({ source: 'hi', translated: 'やあ', truncated: true })
    expect(getTranslationPopupState()).toEqual({
      status: 'result',
      anchor: { x: 10, y: 20 },
      source: 'hi',
      translated: 'やあ',
      truncated: true
    })
    sink.showError('boom')
    expect(getTranslationPopupState()).toMatchObject({ status: 'error', message: 'boom' })
    closeTranslationPopup()
    expect(getTranslationPopupState()).toEqual({ status: 'closed' })
  })
})
