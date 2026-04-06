'use client'

import { useStore } from '@/store'
import { cn, alertTypeColor, formatDate } from '@/lib/utils'
import type { Alert } from '@/types'

const TYPE_LABELS: Record<Alert['type'], string> = {
  critical: 'Kritik',
  warning: 'Uyarı',
  info: 'Bilgi',
  opportunity: 'Fırsat',
}

export default function AlertsPage() {
  const { alerts, markAlertRead } = useStore()

  const sorted = [...alerts].sort((a, b) => {
    const order = { critical: 0, warning: 1, opportunity: 2, info: 3 }
    if (order[a.type] !== order[b.type]) return order[a.type] - order[b.type]
    return b.createdAt.getTime() - a.createdAt.getTime()
  })

  const unread = sorted.filter(a => !a.isRead)
  const read = sorted.filter(a => a.isRead)

  return (
    <div className="space-y-5 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-medium text-ink-primary">Sistem Uyarıları</h2>
          <p className="text-xs text-ink-tertiary mt-0.5">{unread.length} okunmamış</p>
        </div>
        {unread.length > 0 && (
          <button
            className="btn-secondary text-xs"
            onClick={() => unread.forEach(a => markAlertRead(a.id))}
          >
            Tümünü okundu işaretle
          </button>
        )}
      </div>

      {unread.length > 0 && (
        <div>
          <p className="text-xs font-medium text-ink-secondary uppercase tracking-wider mb-2">Okunmamış</p>
          <div className="space-y-2">
            {unread.map(alert => (
              <AlertCard key={alert.id} alert={alert} onRead={() => markAlertRead(alert.id)} />
            ))}
          </div>
        </div>
      )}

      {read.length > 0 && (
        <div>
          <p className="text-xs font-medium text-ink-secondary uppercase tracking-wider mb-2">Okunmuş</p>
          <div className="space-y-2 opacity-70">
            {read.map(alert => (
              <AlertCard key={alert.id} alert={alert} onRead={() => markAlertRead(alert.id)} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function AlertCard({ alert, onRead }: { alert: Alert; onRead: () => void }) {
  return (
    <div
      className={cn(
        'card p-4 flex gap-3 cursor-pointer hover:shadow-card-hover transition-all',
        !alert.isRead && 'border-l-2',
        !alert.isRead && alert.type === 'critical' && 'border-l-red-500',
        !alert.isRead && alert.type === 'warning' && 'border-l-amber-400',
        !alert.isRead && alert.type === 'info' && 'border-l-blue-400',
        !alert.isRead && alert.type === 'opportunity' && 'border-l-brand-400',
      )}
      onClick={onRead}
    >
      <div className={cn('w-2 h-2 rounded-full flex-shrink-0 mt-1.5', alertTypeColor(alert.type))} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className={cn(
            'badge text-[9px]',
            { critical: 'badge-red', warning: 'badge-amber', info: 'badge-blue', opportunity: 'badge-brand' }[alert.type]
          )}>
            {TYPE_LABELS[alert.type]}
          </span>
          <p className="text-sm font-medium text-ink-primary">{alert.title}</p>
        </div>
        <p className="text-xs text-ink-secondary leading-relaxed">{alert.message}</p>
        <div className="flex items-center gap-3 mt-2 text-[10px] text-ink-tertiary">
          {alert.molecule && <span>Molekül: {alert.molecule}</span>}
          <span>{formatDate(alert.createdAt, 'short')}</span>
          <span className="ml-auto">
            {{ excel_upload: 'IQVIA Excel', titck_api: 'TİTCK', iqvia_api: 'IQVIA API', midas_api: 'Midas', manual: 'Manuel' }[alert.source]}
          </span>
        </div>
      </div>
    </div>
  )
}
