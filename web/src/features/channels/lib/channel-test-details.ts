export type ChannelTestDetailView = {
  statusCode?: number
  responseText: string
  requestLine: string
  requestBody: string
  requestHeaders: string
  copyText: string
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }
  return undefined
}

function asTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function looksLikeSse(text: string): boolean {
  return /(?:^|\n)data:\s*/.test(text)
}

function readDeltaText(
  payload: Record<string, unknown>,
  keys: string[]
): string {
  if (typeof payload.delta === 'string' && payload.delta) {
    return payload.delta
  }

  const choices = payload.choices
  const firstChoice = Array.isArray(choices) ? asRecord(choices[0]) : undefined
  const delta = asRecord(firstChoice?.delta) ?? asRecord(payload.delta)
  if (!delta) return ''

  for (const key of keys) {
    const value = delta[key]
    if (typeof value === 'string' && value) {
      return value
    }
  }
  return ''
}

export function aggregateChannelTestStream(raw: string): string {
  if (!looksLikeSse(raw)) {
    return raw.trim()
  }

  let content = ''
  let reasoning = ''
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed.startsWith('data:')) continue
    const payloadText = trimmed.slice(5).trim()
    if (!payloadText || payloadText === '[DONE]') continue

    let payload: Record<string, unknown>
    try {
      payload = JSON.parse(payloadText) as Record<string, unknown>
    } catch {
      continue
    }

    const chunkContent = readDeltaText(payload, ['content', 'text'])
    if (chunkContent) {
      content += chunkContent
      continue
    }
    reasoning += readDeltaText(payload, ['reasoning_content', 'reasoning'])
  }

  if (content) return content
  if (reasoning) return reasoning
  return raw.trim()
}

function prettyJson(value: string): string {
  try {
    return JSON.stringify(JSON.parse(value), null, 2)
  } catch {
    return value
  }
}

function formatHeaders(headers: Record<string, unknown> | undefined): string {
  if (!headers) return ''
  return Object.entries(headers)
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join('\n')
}

function getChannelTestStatusCode(
  details: Record<string, unknown> | undefined
): number | undefined {
  const status = details?.response_status
  return typeof status === 'number' && Number.isFinite(status)
    ? status
    : undefined
}

export function buildChannelTestDetailView(
  details: Record<string, unknown> | undefined,
  fallback: string
): ChannelTestDetailView {
  if (!details) {
    return {
      responseText: fallback,
      requestLine: '',
      requestBody: '',
      requestHeaders: '',
      copyText: fallback,
    }
  }

  const rawContent = asTrimmedString(details.response_content)
  const rawBody = asTrimmedString(details.response_body)
  const aggregatedSource = rawContent || rawBody
  const responseText =
    aggregateChannelTestStream(aggregatedSource) || fallback
  const method = asTrimmedString(details.request_method)
  const requestUrl = asTrimmedString(details.request_url)
  const requestLine = [method, requestUrl].filter(Boolean).join(' ')
  const requestBody = prettyJson(asTrimmedString(details.request_body))
  const requestHeaders = formatHeaders(asRecord(details.request_headers))
  const statusCode = getChannelTestStatusCode(details)

  const copyParts = [
    statusCode != null ? `HTTP ${statusCode}` : '',
    responseText,
    requestLine,
    requestBody,
  ].filter(Boolean)

  return {
    statusCode,
    responseText,
    requestLine,
    requestBody,
    requestHeaders,
    copyText: copyParts.join('\n\n'),
  }
}

export function formatChannelTestDetails(
  details: Record<string, unknown> | undefined,
  fallback: string
): string {
  return buildChannelTestDetailView(details, fallback).copyText
}
