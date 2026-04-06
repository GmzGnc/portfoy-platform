'use client'

import { useState } from 'react'
import { useStore } from '@/store'
import { cn, priorityLabel, priorityColor, patentStatusLabel, patentStatusColor, scoreColor, formatDate } from '@/lib/utils'
import { Star, ChevronDown, ChevronUp, Info, Edit2 } from 'lucide-react'
import type { CandidateMolecule } from '@/types'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts'

function ScoreBar({ label, value, inverted = false }: { label: string; value: number; inverted?: boolean }) {
  const displayVal = inverted ? 100 - value : value
  const color = scoreColor(displayVal)
  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] text-ink-secondary min-w-[120px]">{label}</span>
      <div className="score-bar">
        <div className="score-bar-fill" style={{ width: `${displayVal}%`, background: color }} />
      </div>
      <span className="text-[11px] font-medium min-w-[28px] text-right" style={{ color }}>
        {displayVal}
      </span>
    </div>
  )
}

function MoleculeCard({
  mol,
  isSelected,
  onSelect,
  rank,
}: {
  mol: CandidateMolecule
  isSelected: boolean
  onSelect: () => void
  rank: number
}) {
  const [expanded, setExpanded] = useState(false)
  const { criteria } = useStore()

  const radarData = criteria.map(c => ({
    subject: c.label.split(' ')[0],
    value: c.id === 'patentRisk' ? 100 - (mol.scores[c.id as keyof typeof mol.scores] ?? 50) : (mol.scores[c.id as keyof typeof mol.scores] ?? 50),
    fullMark: 100,
  }))

  return (
    <div
      className={cn('mol-card transition-all duration-200', isSelected && 'selected')}
      onClick={onSelect}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <span className="text-xs font-medium text-ink-tertiary mt-0.5 w-5 text-center">#{rank}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-medium text-ink-primary">{mol.name}</h3>
            <span className={cn('badge', priorityColor(mol.priority))}>{priorityLabel(mol.priority)}</span>
          </div>
          <p className="text-xs text-ink-secondary mt-0.5">{mol.brands.join(' · ')}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="text-right">
            <p className="text-lg font-medium" style={{ color: scoreColor(mol.weightedScore ?? 0) }}>
              {mol.weightedScore ?? '—'}
            </p>
            <p className="text-[9px] text-ink-tertiary">/ 100</p>
          </div>
        </div>
      </div>

      {/* Quick metrics */}
      <div className="grid grid-cols-5 gap-2 mb-3">
        {[
          { label: 'ATC', value: mol.atcCodes[0] ?? '—' },
          { label: 'Patent', value: patentStatusLabel(mol.patent.status), color: patentStatusColor(mol.patent.status) },
          { label: 'TR Ruhsat', value: { licensed: 'Var', pending: 'Bekliyor', not_licensed: 'Yok', suspended: 'Askıda' }[mol.trLicenseStatus] },
          { label: 'Endikasyon', value: mol.indications.join(', ') },
          { label: 'Mekanizma', value: mol.mechanismOfAction ?? '—' },
        ].map((m, i) => (
          <div key={i}>
            <p className="text-[9px] text-ink-tertiary uppercase tracking-wider mb-0.5">{m.label}</p>
            <p className={cn('text-[11px] font-medium truncate', m.color ?? 'text-ink-primary')}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Score bars */}
      <div className="space-y-1.5 mb-3">
        <ScoreBar label="Pazar Potansiyeli" value={mol.scores.marketPotential} />
        <ScoreBar label="Büyüme İvmesi" value={mol.scores.growthMomentum} />
        <ScoreBar label="Patent Riski" value={mol.scores.patentRisk} inverted />
        <ScoreBar label="Rekabet" value={mol.scores.competitivePosition} />
        <ScoreBar label="Finansal Uyum" value={mol.scores.financialFit} />
      </div>

      {/* Weighted score bar */}
      <div className="flex items-center gap-3 pt-2 border-t border-border/60">
        <span className="text-[11px] text-ink-secondary">Ağırlıklı Skor</span>
        <div className="flex-1 score-bar">
          <div
            className="score-bar-fill"
            style={{ width: `${mol.weightedScore ?? 0}%`, background: scoreColor(mol.weightedScore ?? 0) }}
          />
        </div>
        <span className="text-[12px] font-medium" style={{ color: scoreColor(mol.weightedScore ?? 0) }}>
          {mol.weightedScore ?? 0}/100
        </span>
      </div>

      {/* Expand */}
      <button
        className="flex items-center gap-1 text-[11px] text-ink-tertiary mt-2 hover:text-ink-secondary transition-colors"
        onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
      >
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        {expanded ? 'Küçült' : 'Detay & Radar'}
      </button>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-border/60 grid grid-cols-2 gap-4 animate-in">
          {/* Notes */}
          <div>
            <p className="text-[10px] font-medium text-ink-tertiary uppercase tracking-wider mb-2">Notlar</p>
            <p className="text-xs text-ink-secondary leading-relaxed">{mol.notes}</p>
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-ink-tertiary">Patent bitiş</span>
                <span className="text-ink-secondary">{formatDate(mol.patent.expiryDate)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-ink-tertiary">TR ruhsat tarihi</span>
                <span className="text-ink-secondary">{formatDate(mol.trLicenseDate)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-ink-tertiary">Takvim listesi</span>
                <span className={mol.isInTitckSchedule ? 'text-amber-600' : 'text-ink-secondary'}>
                  {mol.isInTitckSchedule ? 'Evet' : 'Hayır'}
                </span>
              </div>
            </div>
          </div>
          {/* Radar */}
          <div>
            <p className="text-[10px] font-medium text-ink-tertiary uppercase tracking-wider mb-2">Skor Radar</p>
            <ResponsiveContainer width="100%" height={140}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: '#9ca3af' }} />
                <Radar name={mol.name} dataKey="value" stroke={scoreColor(mol.weightedScore ?? 0)} fill={scoreColor(mol.weightedScore ?? 0)} fillOpacity={0.15} strokeWidth={1.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}

export default function CandidatesPage() {
  const { candidates, selectedMoleculeId, selectMolecule, recalculateScores } = useStore()
  const [sortBy, setSortBy] = useState<'score' | 'priority' | 'name'>('score')
  const [filterPriority, setFilterPriority] = useState<string>('all')

  const sorted = [...candidates]
    .filter(c => filterPriority === 'all' || c.priority === filterPriority)
    .sort((a, b) => {
      if (sortBy === 'score') return (b.weightedScore ?? 0) - (a.weightedScore ?? 0)
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      const order = { high: 0, medium: 1, low: 2, watch: 3 }
      return order[a.priority] - order[b.priority]
    })

  return (
    <div className="space-y-4 animate-in">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <div>
          <h2 className="font-medium text-ink-primary">Aday Moleküller</h2>
          <p className="text-xs text-ink-tertiary mt-0.5">GLP-1 segmenti · Toplantı kararları baz alınmıştır</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={recalculateScores} className="btn-secondary text-xs">
            Skorları Hesapla
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Toplam Aday', value: candidates.length, sub: 'molekül' },
          { label: 'Yüksek Öncelik', value: candidates.filter(c => c.priority === 'high').length, sub: 'ileri analiz', color: 'text-amber-600' },
          { label: 'Patent Sona Erdi', value: candidates.filter(c => c.patent.status === 'expired').length, sub: 'jenerik fırsatı', color: 'text-brand-600' },
          { label: 'Ort. Ağırlıklı Skor', value: Math.round(candidates.reduce((s, c) => s + (c.weightedScore ?? 0), 0) / candidates.length), sub: '/ 100' },
        ].map((kpi, i) => (
          <div key={i} className="metric-card">
            <p className="text-xs text-ink-secondary mb-1.5">{kpi.label}</p>
            <p className={cn('text-2xl font-medium', kpi.color ?? 'text-ink-primary')}>{kpi.value}</p>
            <p className="text-[11px] text-ink-tertiary mt-1">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-ink-tertiary">Filtre:</span>
        {(['all', 'high', 'medium', 'low', 'watch'] as const).map(p => (
          <button
            key={p}
            onClick={() => setFilterPriority(p)}
            className={cn(
              'text-[11px] px-2.5 py-1 rounded-full border transition-all',
              filterPriority === p
                ? 'bg-brand-400 text-white border-brand-400'
                : 'bg-surface-0 border-border text-ink-secondary hover:border-brand-200'
            )}
          >
            {p === 'all' ? 'Tümü' : priorityLabel(p)}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-ink-tertiary">Sırala:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="input text-xs py-1 w-auto"
          >
            <option value="score">Skor</option>
            <option value="priority">Öncelik</option>
            <option value="name">İsim</option>
          </select>
        </div>
      </div>

      {/* Molecule cards */}
      <div className="space-y-3">
        {sorted.map((mol, i) => (
          <MoleculeCard
            key={mol.id}
            mol={mol}
            isSelected={selectedMoleculeId === mol.id}
            onSelect={() => selectMolecule(mol.id === selectedMoleculeId ? null : mol.id)}
            rank={i + 1}
          />
        ))}
      </div>
    </div>
  )
}
