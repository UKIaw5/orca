// @vitest-environment happy-dom

import { describe, expect, it } from 'vitest'
import { readActiveTranslationSelection } from '../translation/translation-selection-source'
import { installTerminalTranslateSelection } from './terminal-translate-selection'

describe('installTerminalTranslateSelection', () => {
  it('exposes the terminal selection only while the pane has focus', () => {
    const container = document.createElement('div')
    installTerminalTranslateSelection({ getSelection: () => 'select me' }, container)
    expect(readActiveTranslationSelection()).toBe('')
    container.dispatchEvent(new Event('focusin'))
    expect(readActiveTranslationSelection()).toBe('select me')
    container.dispatchEvent(new Event('focusout'))
    expect(readActiveTranslationSelection()).toBe('')
  })
})
