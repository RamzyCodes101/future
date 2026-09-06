import { defineArrayMember, defineField, defineType } from 'sanity'

export const category = defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'description', type: 'text', rows: 2 }),
  ],
})

const imageWithAlt = {
  type: 'image' as const,
  options: { hotspot: true },
  fields: [
    defineField({
      name: 'alt',
      title: 'Describe this photo',
      type: 'string',
      validation: (r) => r.required(),
    }),
  ],
}

export const collection = defineType({
  name: 'collection',
  title: 'Collection',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'slug', type: 'slug', options: { source: 'title' }, validation: (r) => r.required() }),
    defineField({ name: 'season', type: 'string', description: 'e.g. SS26' }),
    defineField({
      name: 'standfirst',
      title: 'Opening paragraph',
      type: 'text',
      rows: 3,
    }),
    defineField({ name: 'heroImage', ...imageWithAlt }),
    defineField({
      name: 'products',
      type: 'array',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'product' }] })],
      description: 'Drag to reorder — this is the order they appear in.',
    }),
  ],
})

export const lookbookEntry = defineType({
  name: 'lookbookEntry',
  title: 'Lookbook image',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Caption', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'image', ...imageWithAlt, validation: (r) => r.required() }),
    defineField({ name: 'credit', title: 'Photo credit', type: 'string' }),
    defineField({ name: 'order', type: 'number', initialValue: 0 }),
  ],
  orderings: [{ title: 'Order', name: 'order', by: [{ field: 'order', direction: 'asc' }] }],
})

export const journalPost = defineType({
  name: 'journalPost',
  title: 'Journal post',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'slug', type: 'slug', options: { source: 'title' }, validation: (r) => r.required() }),
    defineField({ name: 'excerpt', type: 'text', rows: 2, validation: (r) => r.required() }),
    defineField({
      name: 'publishedAt',
      title: 'Publish date',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (r) => r.required(),
    }),
    defineField({ name: 'image', ...imageWithAlt }),
    defineField({ name: 'body', type: 'array', of: [defineArrayMember({ type: 'block' })] }),
  ],
  orderings: [{ title: 'Newest', name: 'newest', by: [{ field: 'publishedAt', direction: 'desc' }] }],
})

export const order = defineType({
  name: 'order',
  title: 'Order',
  type: 'document',
  // Orders are written by the Paystack webhook. Editing them by hand would put
  // the site out of step with what Paystack actually settled.
  readOnly: true,
  fields: [
    defineField({ name: 'reference', type: 'string' }),
    defineField({ name: 'email', type: 'string' }),
    defineField({ name: 'customerName', type: 'string' }),
    defineField({ name: 'phone', type: 'string' }),
    defineField({ name: 'total', title: 'Total (GHS)', type: 'number' }),
    defineField({ name: 'shippingZone', type: 'string' }),
    defineField({ name: 'address', type: 'text', rows: 3 }),
    defineField({ name: 'channel', title: 'Paid with', type: 'string' }),
    defineField({
      name: 'status',
      type: 'string',
      options: { list: ['pending', 'paid', 'in production', 'shipped', 'delivered', 'refunded'] },
    }),
    defineField({
      name: 'lines',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'name', type: 'string' }),
            defineField({ name: 'size', type: 'string' }),
            defineField({ name: 'colour', type: 'string' }),
            defineField({ name: 'quantity', type: 'number' }),
            defineField({ name: 'price', type: 'number' }),
          ],
        }),
      ],
    }),
    defineField({ name: 'placedAt', type: 'datetime' }),
  ],
  orderings: [{ title: 'Newest', name: 'newest', by: [{ field: 'placedAt', direction: 'desc' }] }],
  preview: {
    select: { title: 'reference', subtitle: 'customerName', total: 'total' },
    prepare: ({ title, subtitle, total }) => ({
      title: `${subtitle ?? 'Customer'} — GHS ${total?.toLocaleString('en-GH') ?? '—'}`,
      subtitle: title,
    }),
  },
})

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  fields: [
    defineField({
      name: 'announcement',
      title: 'Announcement bar',
      type: 'string',
      description: 'The thin line of text at the very top of every page. Leave empty to hide it.',
    }),
    defineField({
      name: 'freeShippingThreshold',
      title: 'Free delivery over (GHS)',
      type: 'number',
      description: 'Orders above this amount ship free within Greater Accra.',
    }),
    defineField({
      name: 'shippingZones',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'label', type: 'string' }),
            defineField({ name: 'rate', title: 'Rate (GHS)', type: 'number' }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'whatsappNumber',
      title: 'WhatsApp number',
      type: 'string',
      description: 'Full international format, digits only. e.g. 233200000000',
    }),
    defineField({ name: 'studioAddress', type: 'string' }),
    defineField({ name: 'email', type: 'string' }),
    defineField({ name: 'instagram', title: 'Instagram handle', type: 'string' }),
  ],
  preview: { prepare: () => ({ title: 'Site settings' }) },
})
