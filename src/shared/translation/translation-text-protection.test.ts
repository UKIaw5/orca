import { describe, expect, it } from 'vitest'
import { protectCodeTokens, restoreProtectedText } from './translation-text-protection'

describe('translation text protection', () => {
  it.each([
    ['Run `pnpm test` to check.', '<span translate="no">`pnpm test`</span>'],
    ['Edit src/main/index.ts now.', '<span translate="no">src/main/index.ts</span>'],
    ['Open C:\\Users\\me\\a.txt please.', '<span translate="no">C:\\Users\\me\\a.txt</span>'],
    ['Call getUserName first.', '<span translate="no">getUserName</span>'],
    ['Set max_line_length high.', '<span translate="no">max_line_length</span>'],
    ['Pass --no-verify here.', '<span translate="no">--no-verify</span>'],
    ['See https://example.com/a?b=1 now', '<span translate="no">https://example.com/a?b=1</span>']
  ])('protects code-like tokens in %j', (input, expected) => {
    expect(protectCodeTokens(input)).toContain(expected)
  })

  it('leaves plain prose unwrapped', () => {
    expect(protectCodeTokens('The quick brown fox.')).toBe('The quick brown fox.')
  })

  it('does not wrap a hyphenated word as a flag', () => {
    expect(protectCodeTokens('a well-known fact')).not.toContain('translate="no"')
  })

  it('escapes markup characters in the source', () => {
    expect(protectCodeTokens('if a < b && c > d')).toBe('if a &lt; b &amp;&amp; c &gt; d')
  })

  it('round-trips arbitrary text', () => {
    const text = 'Use `foo_bar` in <div> & src/a.ts via getValue() --flag'
    expect(restoreProtectedText(protectCodeTokens(text))).toBe(text)
  })

  it('decodes entities and strips tags from provider output', () => {
    expect(
      restoreProtectedText(
        '<span translate="no">getUser</span> は &quot;a&quot; &#39;b&#39; &amp; c'
      )
    ).toBe('getUser は "a" \'b\' & c')
  })
})
