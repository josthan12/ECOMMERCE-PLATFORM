export type CatalogImageFolder = 'products' | 'variants' | 'categories' | 'hero' | 'placeholders'

const catalogImageFilenamePattern = /^[a-z0-9][a-z0-9._-]*\.(?:avif|jpe?g|png|webp)$/i

export function validateCatalogImageFilename(filename: string) {
  const trimmed = filename.trim()

  if (!trimmed) return 'Enter an image filename.'
  if (trimmed.includes('..') || !catalogImageFilenamePattern.test(trimmed)) {
    return 'Use a filename such as charizard-ex.webp (letters, numbers, dots, hyphens, or underscores).'
  }

  return null
}

export function getCatalogImagePath(folder: CatalogImageFolder, filename: string) {
  return `/images/${folder}/${filename.trim()}`
}

export function isCatalogImagePath(path: unknown, folder: CatalogImageFolder) {
  if (typeof path !== 'string') return false

  const prefix = `/images/${folder}/`
  if (!path.startsWith(prefix)) return false

  const filename = path.slice(prefix.length)
  return !validateCatalogImageFilename(filename) && path === getCatalogImagePath(folder, filename)
}

export function getCatalogImageFilename(path: unknown, folder: CatalogImageFolder) {
  if (!isCatalogImagePath(path, folder)) return null
  return (path as string).slice(`/images/${folder}/`.length)
}

export async function verifyCatalogImageFile(filename: string, folder: CatalogImageFolder) {
  const validationError = validateCatalogImageFilename(filename)
  if (validationError) return validationError

  const path = getCatalogImagePath(folder, filename)
  try {
    const response = await fetch(path, { method: 'HEAD', cache: 'no-store' })
    const contentType = response.headers.get('content-type')
    if (!response.ok) return `File not found at ${path}`
    if (!contentType?.startsWith('image/')) return `${path} is not an image file.`
    return null
  } catch {
    return `Could not verify ${path}.`
  }
}
