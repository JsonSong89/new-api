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
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createInstance } from 'i18next'
import type { ReactNode } from 'react'
import { I18nextProvider, initReactI18next } from 'react-i18next'
import { beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    to,
    search,
    preload,
    children,
    onClick,
    ...rest
  }: {
    to: string
    search?: Record<string, string>
    preload?: false | 'intent' | 'viewport' | 'render'
    children?: ReactNode
    onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void
    title?: string
    'aria-label'?: string
    className?: string
  }) => {
    const params = new URLSearchParams(search)
    const query = params.toString()
    return (
      <a
        href={query ? `${to}?${query}` : to}
        data-preload={preload === false ? 'false' : preload}
        onClick={onClick}
        {...rest}
      >
        {children}
      </a>
    )
  },
}))

const { ChannelIdLink } = await import('../channel-id-link')

const i18n = createInstance()
await i18n.use(initReactI18next).init({
  lng: 'en',
  resources: {
    en: {
      translation: {
        'Locate channel #{{id}}': 'Locate channel #{{id}}',
      },
    },
  },
})

function renderLink(channelId: number) {
  return render(
    <I18nextProvider i18n={i18n}>
      <ChannelIdLink channelId={channelId} />
    </I18nextProvider>
  )
}

describe('channel ID link', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders #263 as a keyboard-focusable link to the channels filter', () => {
    renderLink(263)

    const link = screen.getByRole('link', { name: 'Locate channel #263' })
    expect(link).toHaveAttribute('href', '/channels?filter=263')
    expect(link).toHaveAttribute('data-preload', 'false')
    expect(link).toHaveTextContent('#263')
    expect(link).toHaveAttribute('title', 'Locate channel #263')
    link.focus()
    expect(link).toHaveFocus()
  })

  test('stops click bubbling so parent row handlers do not fire', async () => {
    const parentClick = vi.fn()
    const user = userEvent.setup()

    render(
      <I18nextProvider i18n={i18n}>
        <button type='button' onClick={parentClick}>
          <ChannelIdLink channelId={88} />
        </button>
      </I18nextProvider>
    )

    await user.click(screen.getByRole('link', { name: 'Locate channel #88' }))
    expect(parentClick).not.toHaveBeenCalled()
  })
})
