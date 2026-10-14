// @vitest-environment happy-dom

import { describe, expect, it } from 'vitest'
import { Editor } from '@tiptap/core'
import { createRichMarkdownExtensions } from './rich-markdown-extensions'
import { createRichMarkdownEditorCodec } from './rich-markdown-source-transport'
import { readRichMarkdownSelectionText } from './rich-markdown-translate-selection'

describe('readRichMarkdownSelectionText', () => {
  it('returns the selected text and nothing for a caret', () => {
    const editor = new Editor({
      element: document.createElement('div'),
      extensions: createRichMarkdownExtensions({ codec: createRichMarkdownEditorCodec() }),
      content: 'Call getUserName first.',
      contentType: 'markdown'
    })
    try {
      editor.commands.setTextSelection({ from: 1, to: 5 })
      expect(readRichMarkdownSelectionText(editor)).toBe('Call')
      editor.commands.setTextSelection(3)
      expect(readRichMarkdownSelectionText(editor)).toBe('')
    } finally {
      editor.destroy()
    }
  })
})
