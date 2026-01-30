// Import admin module
import './module/hmnet-forms'
// Import CMS blocks
import './module/sw-cms/blocks'
// Import CMS elements
import './module/sw-cms/elements'

// Snippets
import deDE from './snippet/de-DE.json'
import enGB from './snippet/en-GB.json'

Shopware.Locale.extend('de-DE', deDE)
Shopware.Locale.extend('en-GB', enGB)
