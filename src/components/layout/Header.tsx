'use client'

import { useStore } from '@/store'
import { cn, formatDate } from '@/lib/utils'
import { Bell, Upload, Wifi, WifiOff, RefreshCw } from 'lucide-react'

export default function Header() {
  const { alerts, dataSources, isLoading } = useStore()
  const unreadCount = alerts.filter(a => !a.isRead).length

  return (
    <header className="bg-surface-0 border-b border-border flex items-center gap-4 px-5 h-14 flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 bg-brand-400 rounded-md flex items-center justify-center flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="1" width="5" height="5" rx="1.5" fill="white" opacity="0.9"/>
            <rect x="8" y="1" width="5" height="5" rx="1.5" fill="white" opacity="0.6"/>
            <rect x="1" y="8" width="5" height="5" rx="1.5" fill="white" opacity="0.6"/>
            <rect x="8" y="8" width="5" height="5" rx="1.5" fill="white" opacity="0.3"/>
          </svg>
        </div>
        <div>
          <span className="font-medium text-[14px] text-ink-primary tracking-tight">Portföy Platformu</span>
          <span className="text-ink-tertiary text-[11px] ml-2 hidden sm:inline">Ürün Seçim & Değerlendirme</span>
        </div>
      </div>

      {/* Data source badges */}
      <div className="hidden md:flex items-center gap-2 ml-4">
        {Object.values(dataSources).filter(ds => ds.type !== 'manual').map(ds => (
          <div key={ds.type} className={cn(
            'flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-full font-medium',
            ds.isConnected
              ? 'bg-brand-50 text-brand-600'
              : 'bg-surface-2 text-ink-tertiary'
          )}>
            {ds.isConnected
              ? <Wifi className="w-2.5 h-2.5" />
              : <WifiOff className="w-2.5 h-2.5" />
            }
            {ds.label}
            {ds.lastUpdated && (
              <span className="opacity-70">· {formatDate(ds.lastUpdated, 'short')}</span>
            )}
          </div>
        ))}
      </div>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-2">
        {isLoading && (
          <div className="flex items-center gap-2 text-[11px] text-ink-secondary animate-pulse">
            <RefreshCw className="w-3 h-3 animate-spin" />
            Yükleniyor...
          </div>
        )}

        {/* Notifications */}
        <button className="relative btn-ghost p-2 rounded-md">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-medium">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Upload hint */}
        <div className="flex items-center gap-1.5 text-[11px] text-ink-tertiary border border-border rounded-md px-2.5 py-1.5">
          <Upload className="w-3 h-3" />
          Excel yükle
        </div>
      </div>
    </header>
  )
}
