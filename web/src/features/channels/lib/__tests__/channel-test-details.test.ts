import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { formatChannelTestDetails } from '../channel-test-details'

describe('formatChannelTestDetails', () => {
  test('places the HTTP status and aggregated stream content before raw diagnostics', () => {
    const formatted = formatChannelTestDetails(
      {
        request_body: '{"model":"test"}',
        response_body: 'data: chunk-1\n\ndata: chunk-2',
        response_content: 'chunk-1chunk-2',
        response_status: 200,
      },
      'fallback'
    )

    assert.ok(
      formatted.indexOf('response_status') <
        formatted.indexOf('response_content')
    )
    assert.ok(
      formatted.indexOf('response_content') <
        formatted.indexOf('response_body')
    )
    assert.match(formatted, /chunk-1chunk-2/)
  })

  test('returns the failure message when transport details are unavailable', () => {
    assert.equal(
      formatChannelTestDetails(undefined, 'request failed'),
      'request failed'
    )
  })
})
