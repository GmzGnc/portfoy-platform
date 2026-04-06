'use client'

import { useStore } from '@/store'
import { cn } from '@/lib/utils'
import {
  BarChart2, Globe, ShieldCheck, Star, AlertTriangle,
  Settings, CheckSquare, Database, Upload, Layers
} from 'lucide-react'

interface SidebarSection {
  label: string
  items: SidebarItem[]
}

interface SidebarItem {
  id: string
  label: string
  icon: React.ReactNode
  badge?: string | number
  badgeVariant?: 'brand' | 'amber' | 'blue' | 'red' | 'gray'
  page: string
}

const badgeColors = {
  brand: 'bg-brand-50 text-brand-600',
  amber: 'bg-amber-50 text-amber-700',
  blue: 'bg-blue-50 text-blue-700',
  red: 'bg-red-50 text-red-700',
  gray: 'bg-surface-2 text-ink-secondary',
}

export default function Sidebar({
  activePage,
  onPageChange,
}: {
  activePage: string
  onPageChange: (page: string) => void
}) {
  const { alerts, candidates, titckProducts, tasks } = useStore()
  const unreadAlerts = alerts.filter(a => !a.isRead).length
  const openTasks = tasks.filter(t => t.status !== 'done').length
  const highPriority = candidates.filter(c => c.priority === 'high').length

  const sections: SidebarSection[] = [
    {
      label: 'Pazar Verisi',
      items: [
        { id: 'iqvia-tr', label: 'IQVIA Türkiye', icon: <BarChart2 className="w-3.5 h-3.5" />, badge: 'GLP-1', badgeVariant: 'brand', page: 'iqvia-tr' },
        { id: 'iqvia-global', label: 'IQVIA Global', icon: <Globe className="w-3.5 h-3.5" />, badge: 'USD', badgeVariant: 'blue', page: 'iqvia-global' },
      ],
    },
    {
      label: 'Portföy',
      items: [
        { id: 'candidates', label: 'Aday Moleküller', icon: <Star className="w-3.5 h-3.5" />, badge: highPriority > 0 ? highPriority : undefined, badgeVariant: 'amber', page: 'candidates' },
        { id: 'criteria', label: 'Kriter & Ağırlık', icon: <Layers className="w-3.5 h-3.5" />, page: 'criteria' },
        { id: 'tasks', label: 'Görev Takibi', icon: <CheckSquare className="w-3.5 h-3.5" />, badge: openTasks > 0 ? openTasks : undefined, badgeVariant: 'amber', page: 'tasks' },
      ],
    },
    {
      label: 'Regülasyon',
      items: [
        { id: 'titck', label: 'TİTCK Ruhsat', icon: <ShieldCheck className="w-3.5 h-3.5" />, badge: titckProducts.length > 0 ? titckProducts.length.toLocaleString('tr-TR') : 'Yükle', badgeVariant: titckProducts.length > 0 ? 'gray' : 'amber', page: 'titck' },
      ],
    },
    {
      label: 'Sistem',
      items: [
        { id: 'upload', label: 'Veri Yükle', icon: <Upload className="w-3.5 h-3.5" />, page: 'upload' },
        { id: 'sources', label: 'Veri Kaynakları', icon: <Database className="w-3.5 h-3.5" />, page: 'sources' },
        { id: 'alerts', label: 'Uyarılar', icon: <AlertTriangle className="w-3.5 h-3.5" />, badge: unreadAlerts > 0 ? unreadAlerts : undefined, badgeVariant: 'red', page: 'alerts' },
        { id: 'settings', label: 'Ayarlar', icon: <Settings className="w-3.5 h-3.5" />, page: 'settings' },
      ],
    },
  ]

  return (
    <aside className="w-[200px] flex-shrink-0 bg-surface-0 border-r border-border flex flex-col overflow-y-auto">
      {sections.map((section, si) => (
        <div key={si} className="px-3 pt-4 pb-2">
          <p className="text-[10px] font-medium text-ink-tertiary uppercase tracking-wider px-2 mb-1.5">
            {section.label}
          </p>
          {section.items.map(item => (
            <button
              key={item.id}
              onClick={() => onPageChange(item.page)}
              className={cn('sidebar-item w-full text-left', activePage === item.page && 'active')}
            >
              <span className={cn('flex-shrink-0', activePage === item.page ? 'text-brand-400' : 'text-ink-tertiary')}>
                {item.icon}
              </span>
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge !== undefined && (
                <span className={cn('badge text-[9px] px-1.5 py-0', badgeColors[item.badgeVariant ?? 'gray'])}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      ))}
    </aside>
  )
}
