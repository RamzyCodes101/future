export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? ''
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2024-10-01'

/**
 * Whether the site should read from Sanity at all.
 *
 * Everything degrades to the built-in sample catalogue when this is false, so
 * `next build` and `next dev` both work with no environment variables set.
 */
export const sanityEnabled = Boolean(projectId)
