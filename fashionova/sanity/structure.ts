import type { StructureResolver } from 'sanity/structure'

/**
 * The Studio's left-hand navigation.
 *
 * Deliberately not the default "one list per document type". The two things
 * the brand owner does most often — publish a product and change a price —
 * each get their own entry at the top, and the pricing desk is pre-sorted by
 * price so a whole season can be repriced in one pass.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Fashionova')
    .items([
      S.listItem()
        .title('Products')
        .child(
          S.list()
            .title('Products')
            .items([
              S.listItem()
                .title('All products')
                .child(S.documentTypeList('product').title('All products')),
              S.listItem()
                .title('Live on the site')
                .child(
                  S.documentTypeList('product')
                    .title('Live on the site')
                    .filter('_type == "product" && status == "active"')
                ),
              S.listItem()
                .title('Drafts')
                .child(
                  S.documentTypeList('product')
                    .title('Drafts')
                    .filter('_type == "product" && status == "draft"')
                ),
              S.listItem()
                .title('Sold out')
                .child(
                  S.documentTypeList('product')
                    .title('Sold out')
                    .filter('_type == "product" && status == "sold out"')
                ),
            ])
        ),

      // Every live product, most expensive first, with the price in the
      // subtitle. Open one, change the number, publish.
      S.listItem()
        .title('Pricing')
        .child(
          S.documentTypeList('product')
            .title('Pricing — highest first')
            .filter('_type == "product" && status == "active"')
            .defaultOrdering([{ field: 'price', direction: 'desc' }])
        ),

      S.divider(),

      S.documentTypeListItem('order').title('Orders'),

      S.divider(),

      S.documentTypeListItem('collection').title('Collections'),
      S.documentTypeListItem('category').title('Categories'),
      S.documentTypeListItem('lookbookEntry').title('Lookbook'),
      S.documentTypeListItem('journalPost').title('Journal'),

      S.divider(),

      S.listItem()
        .title('Site settings')
        .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
    ])
