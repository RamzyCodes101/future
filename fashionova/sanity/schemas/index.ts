import type { SchemaTypeDefinition } from 'sanity'
import { product, variant } from './product'
import {
  category,
  collection,
  journalPost,
  lookbookEntry,
  order,
  siteSettings,
} from './content'

export const schemaTypes: SchemaTypeDefinition[] = [
  product,
  variant,
  category,
  collection,
  lookbookEntry,
  journalPost,
  order,
  siteSettings,
]
