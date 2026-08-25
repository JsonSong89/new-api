import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import {
  aggregateChannelTestStream,
  buildChannelTestDetailView,
  formatChannelTestDetails,
} from '../channel-test-details'

const reasoningStream = [
  'data: {"choices":[{"delta":{"content":"","reasoning_content":"We"}}]}',
  'data: {"choices":[{"delta":{"content":"","reasoning_content":" need 6.1.2"}}]}',
  'data: [DONE]',
].join('\n\n')

describe('aggregateChannelTestStream', () => {
  test('joins empty-content reasoning chunks into one reply', () => {
    assert.equal(aggregateChannelTestStream(reasoningStream), 'We need 6.1.2')
  })
})

describe('formatChannelTestDetails', () => {
  test('shows status code and aggregated text instead of raw SSE chunks', () => {
    const formatted = formatChannelTestDetails(
      {
        request_body: '{"model":"test"}',
        request_method: 'POST',
        request_url: 'https://example.com/v1/chat/completions',
        response_body: reasoningStream,
        response_content: reasoningStream,
        response_status: 200,
      },
      'fallback'
    )

    assert.match(formatted, /^HTTP 200/)
    assert.match(formatted, /We need 6\.1\.2/)
    assert.match(formatted, /POST https:\/\/example.com\/v1\/chat\/completions/)
    assert.doesNotMatch(formatted, /reasoning_content/)
  })

  test('returns the failure message when transport details are unavailable', () => {
    assert.equal(
      formatChannelTestDetails(undefined, 'request failed'),
      'request failed'
    )
  })
})

describe('buildChannelTestDetailView', () => {
  test('exposes status and aggregated response as structured fields', () => {
    const view = buildChannelTestDetailView(
      {
        request_method: 'POST',
        request_url: 'https://example.com/v1/chat/completions',
        response_content: reasoningStream,
        response_status: 200,
      },
      'fallback'
    )

    assert.equal(view.statusCode, 200)
    assert.equal(view.responseText, 'We need 6.1.2')
    assert.equal(view.requestLine, 'POST https://example.com/v1/chat/completions')
  })
})
