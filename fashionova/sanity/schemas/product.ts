import { defineArrayMember, defineField, defineType } from 'sanity'

export const variant = defineType({
  name: 'variant',
  title: 'Size / colour',
  type: 'object',
  fields: [
    defineField({ name: 'size', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'colour', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'stock',
      title: 'How many in stock',
      type: 'number',
      initialValue: 0,
      validation: (r) => r.required().min(0).integer(),
    }),
    defineField({ name: 'sku', title: 'SKU (optional)', type: 'string' }),
  ],
  preview: {
    select: { size: 'size', colour: 'colour', stock: 'stock' },
    prepare: ({ size, colour, stock }) => ({
      title: `${colour} · ${size}`,
      subtitle: stock > 0 ? `${stock} in stock` : 'Sold out',
    }),
  },
})

export const product = defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  groups: [
    { name: 'essentials', title: 'Essentials', default: true },
    { name: 'detail', title: 'Fabric & care' },
    { name: 'advanced', title: 'Advanced' },
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Product name',
      type: 'string',
      group: 'essentials',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Web address',
      type: 'slug',
      group: 'essentials',
      options: { source: 'name', maxLength: 96 },
      description: 'Generated from the name. Click Generate.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'images',
      title: 'Photographs',
      type: 'array',
      group: 'essentials',
      of: [
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'alt',
              title: 'Describe this photo',
              type: 'string',
              description: 'For screen readers and search. One short sentence.',
              validation: (r) => r.required(),
            }),
          ],
        }),
      ],
      validation: (r) => r.min(1).error('Add at least one photograph'),
    }),
    defineField({
      name: 'price',
      title: 'Price (GHS)',
      type: 'number',
      group: 'essentials',
      description: 'Just the number, in cedis. For example: 1450',
      validation: (r) => r.required().positive(),
    }),
    defineField({
      name: 'compareAtPrice',
      title: 'Was price (GHS)',
      type: 'number',
      group: 'essentials',
      description:
        'Optional. Only fill this in for a sale — it shows struck through next to the price.',
      validation: (r) =>
        r.positive().custom((was, ctx) => {
          const now = (ctx.document as { price?: number } | undefined)?.price
          if (was && now && was <= now) return 'The was-price should be higher than the price'
          return true
        }),
    }),
    defineField({
      name: 'category',
      type: 'reference',
      group: 'essentials',
      to: [{ type: 'category' }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'variants',
      title: 'Sizes and colours',
      type: 'array',
      group: 'essentials',
      of: [defineArrayMember({ type: 'variant' })],
      description: 'One row per size and colour, each with its own stock count.',
      validation: (r) => r.min(1).error('Add at least one size'),
    }),
    defineField({
      name: 'status',
      type: 'string',
      group: 'essentials',
      options: {
        list: ['draft', 'active', 'sold out', 'archived'],
        layout: 'radio',
      },
      initialValue: 'draft',
      description: 'Only "active" products appear on the website.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'featured',
      title: 'Show on the homepage',
      type: 'boolean',
      group: 'essentials',
      initialValue: false,
    }),
    defineField({
      name: 'madeToOrder',
      title: 'Made to order',
      type: 'boolean',
      group: 'essentials',
      initialValue: false,
      description: 'Tick if this is sewn after ordering — the page shows a 7–14 day lead time.',
    }),
    defineField({
      name: 'description',
      type: 'array',
      group: 'detail',
      of: [defineArrayMember({ type: 'block' })],
    }),
    defineField({
      name: 'fabric',
      type: 'string',
      group: 'detail',
      description: 'e.g. 100% Ghanaian-milled cotton poplin, hand-appliquéd panel',
    }),
    defineField({ name: 'careInstructions', title: 'Care instructions', type: 'text', group: 'detail', rows: 3 }),
    defineField({
      name: 'model3d',
      title: '3D model (optional)',
      type: 'file',
      group: 'advanced',
      options: { accept: '.glb' },
      description: 'A .glb file. If present, the product page shows a 3D viewer.',
    }),
  ],
  orderings: [
    { title: 'Price, high to low', name: 'priceDesc', by: [{ field: 'price', direction: 'desc' }] },
    { title: 'Price, low to high', name: 'priceAsc', by: [{ field: 'price', direction: 'asc' }] },
    { title: 'Name', name: 'nameAsc', by: [{ field: 'name', direction: 'asc' }] },
  ],
  preview: {
    select: { title: 'name', price: 'price', status: 'status', media: 'images.0' },
    prepare: ({ title, price, status, media }) => ({
      title,
      subtitle: `GHS ${price?.toLocaleString('en-GH') ?? '—'}${status !== 'active' ? ` · ${status}` : ''}`,
      media,
    }),
  },
})
