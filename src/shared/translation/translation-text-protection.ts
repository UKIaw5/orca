const PROTECTED_PATTERNS: RegExp[] = [
  /`[^`\n]+`/g,
  /\bhttps?:\/\/[^\s)>\]"']+/g,
  /(?:[A-Za-z]:\\|\\\\)[^\s"'`<>|]+/g,
  /(?<![\w.@/-])(?:~|\.{1,2})?\/[\w.@-]+(?:\/[\w.@-]+)*\/?/g,
  /(?<![\w.@/-])[\w@-]+(?:\/[\w.@-]+)*\/[\w@-]+\.\w+\b/g,
  /(?<![\w.@/-])[\w@-]+(?:\/[\w.@-]+){2,}\/?/g,
  /(?<![\w-])--?[a-zA-Z][\w-]*/g,
  /\b[a-z][a-z0-9]*(?:[A-Z][a-z0-9]*)+\b/g,
  /\b[A-Z][a-z0-9]+(?:[A-Z][a-z0-9]*)+\b/g,
  /\b[A-Za-z0-9]+(?:_[A-Za-z0-9]+)+\b/g,
  /\b[\w.]+\(\)/g
]

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'"
}

function escapeHtml(text: string): string {
  return text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

function decodeHtmlEntities(text: string): string {
  return text.replace(
    /&(?:#(\d+)|#x([\da-f]+)|([a-z]+));/gi,
    (match, dec?: string, hex?: string, name?: string) => {
      if (dec || hex) {
        const codePoint = dec ? Number(dec) : Number.parseInt(hex ?? '', 16)
        return Number.isInteger(codePoint) && codePoint <= 0x10ffff
          ? String.fromCodePoint(codePoint)
          : match
      }
      return ENTITIES[(name ?? '').toLowerCase()] ?? match
    }
  )
}

function findProtectedRanges(text: string): [number, number][] {
  const ranges: [number, number][] = []
  for (const pattern of PROTECTED_PATTERNS) {
    for (const match of text.matchAll(pattern)) {
      ranges.push([match.index, match.index + match[0].length])
    }
  }
  ranges.sort((a, b) => a[0] - b[0] || b[1] - a[1])
  const merged: [number, number][] = []
  for (const range of ranges) {
    const last = merged.at(-1)
    if (last && range[0] < last[1]) {
      last[1] = Math.max(last[1], range[1])
    } else {
      merged.push([range[0], range[1]])
    }
  }
  return merged
}

/** Wraps code-like tokens in translate="no" spans; output is HTML for providers that accept it. */
export function protectCodeTokens(text: string): string {
  let html = ''
  let cursor = 0
  for (const [start, end] of findProtectedRanges(text)) {
    html += escapeHtml(text.slice(cursor, start))
    html += `<span translate="no">${escapeHtml(text.slice(start, end))}</span>`
    cursor = end
  }
  return html + escapeHtml(text.slice(cursor))
}

/** Inverse of protectCodeTokens: strips markup and decodes entities back to plain text. */
export function restoreProtectedText(html: string): string {
  return decodeHtmlEntities(html.replace(/<\/?[a-z][^>]*>/gi, ''))
}
