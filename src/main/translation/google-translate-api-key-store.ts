import { createEncryptedApiKeyFileStore } from '../credentials/encrypted-api-key-file-store'

const store = createEncryptedApiKeyFileStore({
  fileName: 'google-translate-api-key.enc',
  envelopePrefix: 'orca-google-translate-api-key:v1:',
  providerLabel: 'Google Translate',
  logScope: 'translation'
})

export const hasGoogleTranslateApiKey = store.has
export const getGoogleTranslateApiKeyProtection = store.protection
export const saveGoogleTranslateApiKey = store.save
export const readGoogleTranslateApiKey = store.read
export const clearGoogleTranslateApiKey = store.clear
