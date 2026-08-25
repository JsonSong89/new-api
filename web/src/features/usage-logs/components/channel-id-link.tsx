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
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { StatusBadge } from '@/components/status-badge'
import { cn } from '@/lib/utils'

export function ChannelIdLink(props: {
  channelId: number
  className?: string
}) {
  const { t } = useTranslation()
  const locateLabel = t('Locate channel #{{id}}', { id: props.channelId })

  return (
    <Link
      to='/channels'
      search={{ filter: String(props.channelId) }}
      className={cn(
        'focus-visible:ring-ring inline-flex max-w-full min-w-0 rounded-md outline-none focus-visible:ring-2',
        props.className
      )}
      title={locateLabel}
      aria-label={locateLabel}
      onClick={(event) => event.stopPropagation()}
    >
      <StatusBadge
        label={`#${props.channelId}`}
        autoColor={String(props.channelId)}
        size='sm'
        showDot={false}
        copyable={false}
        className='cursor-pointer font-mono hover:underline'
      />
    </Link>
  )
}
