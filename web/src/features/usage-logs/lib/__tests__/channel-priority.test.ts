/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { describe, expect, test } from 'vitest'

import { getChannelPriorityPromptValue } from '../channel-priority'

describe('channel priority prompt value', () => {
  test('uses the current priority so the prompt does not always show 0', () => {
    expect(getChannelPriorityPromptValue(42)).toBe('42')
    expect(getChannelPriorityPromptValue(-3)).toBe('-3')
  })

  test('uses 0 only when the current priority is 0 or missing', () => {
    expect(getChannelPriorityPromptValue(0)).toBe('0')
    expect(getChannelPriorityPromptValue(undefined)).toBe('0')
    expect(getChannelPriorityPromptValue(null)).toBe('0')
  })
})
