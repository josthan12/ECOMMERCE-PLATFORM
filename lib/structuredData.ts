const LOCAL_SITE_URL = 'http://localhost:3000'

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim()

  if (!configuredUrl) {
    return LOCAL_SITE_URL
  }

  try {
    return new URL(configuredUrl).origin
  } catch {
    return LOCAL_SITE_URL
  }
}

export function absoluteUrl(pathOrUrl: string) {
  return new URL(pathOrUrl, `${getSiteUrl()}/`).toString()
}

export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}
