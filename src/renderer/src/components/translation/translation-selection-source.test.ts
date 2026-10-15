// @vitest-environment happy-dom

import { afterEach, describe, expect, it } from 'vitest'
import {
  readActiveTranslationSelection,
  registerActiveTranslationSelectionSource
} from './translation-selection-source'

describe('readActiveTranslationSelection', () => {
  afterEach(() => {
    document.body.replaceChildren()
    window.getSelection()?.removeAllRanges()
  })

  function selectPageText(text: string): void {
    const paragraph = document.createElement('p')
    paragraph.textContent = text
    document.body.append(paragraph)
    window.getSelection()?.selectAllChildren(paragraph)
  }

  it('falls back to the page selection when no surface registered', () => {
    selectPageText('from the page')
    expect(readActiveTranslationSelection()).toBe('from the page')
  })

  it('prefers the registered surface over the page selection', () => {
    selectPageText('from the page')
    const unregister = registerActiveTranslationSelectionSource({ readSelection: () => 'editor' })
    expect(readActiveTranslationSelection()).toBe('editor')
    unregister()
  })
})
