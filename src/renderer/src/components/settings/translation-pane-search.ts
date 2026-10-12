import { translate } from '@/i18n/i18n'
import { createLocalizedCatalog } from '@/i18n/localized-catalog'
import { translateSearchKeyword } from './settings-search-keywords'

export const getTranslationPaneSearchEntries = createLocalizedCatalog(() => [
  {
    title: translate('translation.settings.searchTitle', 'Translate Selection'),
    description: translate(
      'translation.settings.searchDescription',
      'Translate selected English text into Japanese with Google Cloud Translation.'
    ),
    keywords: [
      ...translateSearchKeyword('translation.settings.searchKeyword.translate', 'translate'),
      ...translateSearchKeyword('translation.settings.searchKeyword.translation', 'translation'),
      ...translateSearchKeyword('translation.settings.searchKeyword.japanese', 'japanese'),
      ...translateSearchKeyword('translation.settings.searchKeyword.google', 'google'),
      ...translateSearchKeyword('translation.settings.searchKeyword.apiKey', 'api key')
    ]
  }
])
