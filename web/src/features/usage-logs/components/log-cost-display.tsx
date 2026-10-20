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
import {
  CrownIcon,
  Wallet01Icon,
  Wrench01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslation } from 'react-i18next'

import { StatusBadge } from '@/components/status-badge'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { getCurrencyDisplay } from '@/lib/currency'
import { formatLogQuota } from '@/lib/format'
import { cn } from '@/lib/utils'

import { hasToolSurcharge } from '../lib/format'
import type { LogOtherData } from '../types'

const COST_HEAT_THRESHOLDS = [0.5, 0.1, 0.05, 0.01, 0.005, 0.001] as const

const COST_HEAT_CLASS: Record<string, string> = {
  '0.5': 'border-destructive/60 bg-destructive/30 text-destructive',
  '0.1': 'border-destructive/45 bg-destructive/18 text-destructive',
  '0.05': 'border-warning/55 bg-warning/28 text-warning',
  '0.01': 'border-warning/40 bg-warning/18 text-warning',
  '0.005': 'border-warning/25 bg-warning/10 text-warning/80',
  '0.001': 'border-border/80 bg-muted/50 text-muted-foreground',
  '0': 'border-border/50 bg-muted/30 text-muted-foreground/70',
}

function resolveCostHeat(quota: number): { tier: string; className: string } {
  const quotaPerUnit = getCurrencyDisplay().config.quotaPerUnit
  const usd = quotaPerUnit > 0 ? quota / quotaPerUnit : 0
  for (const threshold of COST_HEAT_THRESHOLDS) {
    if (usd >= threshold) {
      const tier = String(threshold)
      return { tier, className: COST_HEAT_CLASS[tier] }
    }
  }
  return { tier: '0', className: COST_HEAT_CLASS['0'] }
}

interface LogCostDisplayProps {
  quota: number
  other: LogOtherData | null
  showBillingSource?: boolean
}

function ToolSurchargeMarker() {
  const { t } = useTranslation()
  const label = t('Includes tool-call surcharge')

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Badge
            variant='warning'
            className='h-5 min-w-5 cursor-help gap-0 rounded-full px-1'
            role='img'
            aria-label={label}
            tabIndex={0}
            data-tool-surcharge-indicator='true'
          >
            <HugeiconsIcon
              icon={Wrench01Icon}
              strokeWidth={2}
              aria-hidden='true'
            />
            <span
              className='text-[9px] leading-none font-bold'
              aria-hidden='true'
            >
              +
            </span>
          </Badge>
        }
      />
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

export function LogCostDisplay(props: LogCostDisplayProps) {
  const { t } = useTranslation()
  const isSubscription = props.other?.billing_source === 'subscription'
  const showToolSurcharge = hasToolSurcharge(props.other)
  const quota = isSubscription
    ? (props.other?.subscription_consumed ?? props.quota)
    : props.quota
  let source: string | undefined

  // A log billed to a subscription always names its funding source: that
  // subscription may have expired since, and the viewer may hold no active
  // plan today. Only the wallet marker is contextual and follows
  // showBillingSource.
  if (isSubscription) {
    source = t('Subscription')
  } else if (
    props.showBillingSource &&
    props.other?.billing_source === 'wallet'
  ) {
    source = t('Wallet')
  }

  const costHeat = resolveCostHeat(quota)

  return (
    <TooltipProvider>
      <div className='inline-flex w-fit items-center gap-1.5'>
        <StatusBadge
          type='badge'
          variant='neutral'
          size='lg'
          copyable={false}
          data-cost-tier={costHeat.tier}
          className={cn(
            'rounded-md border font-semibold tabular-nums',
            costHeat.className
          )}
        >
          {source ? (
            <Tooltip>
              <TooltipTrigger
                render={
                  <span
                    className='inline-flex shrink-0 cursor-help items-center'
                    role='img'
                    aria-label={source}
                    tabIndex={0}
                  >
                    <HugeiconsIcon
                      icon={isSubscription ? CrownIcon : Wallet01Icon}
                      className='size-3.5'
                      strokeWidth={2}
                      aria-hidden='true'
                    />
                  </span>
                }
              />
              <TooltipContent>{source}</TooltipContent>
            </Tooltip>
          ) : null}
          <span className='whitespace-nowrap'>{formatLogQuota(quota)}</span>
        </StatusBadge>
        {showToolSurcharge ? <ToolSurchargeMarker /> : null}
      </div>
    </TooltipProvider>
  )
}
