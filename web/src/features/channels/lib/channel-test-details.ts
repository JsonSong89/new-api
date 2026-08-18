const CHANNEL_TEST_DETAIL_KEYS = [
  'response_status',
  'response_content',
  'request_method',
  'request_url',
  'request_headers',
  'request_body',
  'response_headers',
  'response_body',
] as const

export function formatChannelTestDetails(
  details: Record<string, unknown> | undefined,
  fallback: string
): string {
  if (!details) return fallback

  const orderedDetails: Record<string, unknown> = {}
  for (const key of CHANNEL_TEST_DETAIL_KEYS) {
    if (details[key] !== undefined) {
      orderedDetails[key] = details[key]
    }
  }
  for (const [key, value] of Object.entries(details)) {
    if (!(key in orderedDetails)) {
      orderedDetails[key] = value
    }
  }
  return JSON.stringify(orderedDetails, null, 2)
}
