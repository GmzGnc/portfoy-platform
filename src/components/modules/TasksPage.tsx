'use client'

import { useStore } from '@/store'
import { cn, taskStatusLabel, taskStatusColor } from '@/lib/utils'
import { CheckSquare, Clock, AlertCircle, User } from 'lucide-react'
import type { Task } from '@/types'

const STATUS_ORDER = ['in_progress', 'open', 'blocked', 'done']

export default function TasksPage() {
  const { tasks, updateTask } = useStore()

  const grouped = STATUS_ORDER.reduce<Record<string, Task[]>>((acc, s) => {
    acc[s] = tasks.filter(t => t.status === s)
    return acc
  }, {})

  return (
    <div className="space-y-5 animate-in">
      <div>
        <h2 className="font-medium text-ink-primary">Görev Takibi</h2>
        <p className="text-xs text-ink-tertiary mt-0.5">Toplantı kararları ve takip görevleri</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Açık', count: grouped.open?.length ?? 0, icon: <Clock className="w-4 h-4" />, color: 'text-blue-600' },
          { label: 'Devam Ediyor', count: grouped.in_progress?.length ?? 0, icon: <AlertCircle className="w-4 h-4" />, color: 'text-amber-600' },
          { label: 'Engellendi', count: grouped.blocked?.length ?? 0, icon: <AlertCircle className="w-4 h-4" />, color: 'text-red-600' },
          { label: 'Tamamlandı', count: grouped.done?.length ?? 0, icon: <CheckSquare className="w-4 h-4" />, color: 'text-brand-600' },
        ].map((s, i) => (
          <div key={i} className="metric-card flex items-center gap-3">
            <span className={s.color}>{s.icon}</span>
            <div>
              <p className="text-xl font-medium text-ink-primary">{s.count}</p>
              <p className="text-[11px] text-ink-tertiary">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Task groups */}
      {STATUS_ORDER.map(status => {
        const group = grouped[status] ?? []
        if (group.length === 0) return null
        return (
          <div key={status}>
            <div className="flex items-center gap-2 mb-2">
              <span className={cn('badge', taskStatusColor(status))}>{taskStatusLabel(status)}</span>
              <span className="text-xs text-ink-tertiary">{group.length} görev</span>
            </div>
            <div className="space-y-2">
              {group.map(task => (
                <div key={task.id} className="card p-4 hover:shadow-card-hover transition-all">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => updateTask(task.id, { status: task.status === 'done' ? 'open' : 'done' })}
                      className={cn(
                        'w-5 h-5 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors',
                        task.status === 'done'
                          ? 'bg-brand-400 border-brand-400'
                          : 'border-border hover:border-brand-300'
                      )}
                    >
                      {task.status === 'done' && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm font-medium', task.status === 'done' ? 'text-ink-tertiary line-through' : 'text-ink-primary')}>
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-xs text-ink-tertiary mt-1 leading-relaxed">{task.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        {task.assignees.map(a => (
                          <span key={a} className="flex items-center gap-1 text-[11px] text-ink-secondary">
                            <User className="w-3 h-3" />{a}
                          </span>
                        ))}
                        {task.tags.map(tag => (
                          <span key={tag} className="badge badge-gray">{tag}</span>
                        ))}
                        <span className={cn('badge ml-auto', { high: 'badge-red', medium: 'badge-amber', low: 'badge-gray' }[task.priority])}>
                          {{ high: 'Yüksek', medium: 'Orta', low: 'Düşük' }[task.priority]}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <select
                        value={task.status}
                        onChange={e => updateTask(task.id, { status: e.target.value as Task['status'] })}
                        className="input text-[11px] py-1 px-2 w-auto"
                        onClick={e => e.stopPropagation()}
                      >
                        <option value="open">Açık</option>
                        <option value="in_progress">Devam Ediyor</option>
                        <option value="blocked">Engellendi</option>
                        <option value="done">Tamamlandı</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
