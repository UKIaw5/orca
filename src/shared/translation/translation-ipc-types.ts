import type { SecretAtRestProtection } from '../secure-storage/secret-at-rest-protection'

export type TranslationKeyStatus = {
  configured: boolean
  protection: SecretAtRestProtection | null
}

export type TranslationIpcResult =
  | { ok: true; translated: string; truncated: boolean }
  | { ok: false; error: string }
