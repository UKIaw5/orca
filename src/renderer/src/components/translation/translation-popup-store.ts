export type TranslationPopupState =
  | { status: 'closed' }
  | { status: 'pending'; anchor: PopupAnchor }
  | {
      status: 'result'
      anchor: PopupAnchor
      source: string
      translated: string
      truncated: boolean
    }
  | { status: 'error'; anchor: PopupAnchor; message: string }

export type PopupAnchor = { x: number; y: number }

let state: TranslationPopupState = { status: 'closed' }
let lastPointer: PopupAnchor = { x: 160, y: 120 }
const listeners = new Set<() => void>()

function setState(next: TranslationPopupState): void {
  state = next
  listeners.forEach((listener) => listener())
}

export function subscribeTranslationPopup(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getTranslationPopupState(): TranslationPopupState {
  return state
}

export function closeTranslationPopup(): void {
  if (state.status !== 'closed') {
    setState({ status: 'closed' })
  }
}

// Why: selections live in canvases (Monaco, xterm), so the last pointer position is the only portable anchor.
export function rememberTranslationAnchor(anchor: PopupAnchor): void {
  lastPointer = anchor
}

export function currentTranslationAnchor(): PopupAnchor {
  return lastPointer
}

export function showTranslationPopupState(
  next: Exclude<TranslationPopupState, { status: 'closed' }>
): void {
  setState(next)
}
