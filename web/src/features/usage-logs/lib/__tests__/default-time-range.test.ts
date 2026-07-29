import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { getDefaultCommonLogsTimeRange } from '../utils'

describe('common logs default time range', () => {
  test('ends at the end of the current day before 23:00', () => {
    const { start, end } = getDefaultCommonLogsTimeRange(
      new Date(2026, 6, 29, 22, 30, 0)
    )

    assert.deepEqual(
      [
        start.getFullYear(),
        start.getMonth(),
        start.getDate(),
        start.getHours(),
      ],
      [2026, 6, 29, 0]
    )
    assert.deepEqual(
      [
        end.getFullYear(),
        end.getMonth(),
        end.getDate(),
        end.getHours(),
        end.getMinutes(),
        end.getSeconds(),
      ],
      [2026, 6, 29, 23, 59, 59]
    )
  })

  test('ends at the end of the following day from 23:00', () => {
    const { end } = getDefaultCommonLogsTimeRange(
      new Date(2026, 6, 29, 23, 0, 0)
    )

    assert.deepEqual(
      [
        end.getFullYear(),
        end.getMonth(),
        end.getDate(),
        end.getHours(),
        end.getMinutes(),
        end.getSeconds(),
      ],
      [2026, 6, 30, 23, 59, 59]
    )
  })
})
