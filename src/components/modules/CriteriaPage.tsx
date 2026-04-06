'use client'

import { useStore } from '@/store'
import { cn, scoreColor } from '@/lib/utils'
import { RefreshCw } from 'lucide-react'

const CATEGORY_COLORS: Record<string, string> = {
  market: 'bg-brand-50 text-brand-600',
  regulatory: 'bg-blue-50 text-blue-700',
  financial: 'bg-amber-50 text-amber-700',
  clinical: 'bg-purple-50 text-purple-700',
}
const CATEGORY_LABELS: Record<string, string> = {
  market: 'Pazar', regulatory: 'Regülasyon', financial: 'Finansal', clinical: 'Klinik',
}

export default function CriteriaPage() {
  const { criteria, candidates, updateCriteriaWeight, recalculateScores } = useStore()
  const totalWeight = criteria.reduce((s, c) => s + c.weight, 0)
  const isBalanced = totalWeight === 100

  return (
    <div className="space-y-5 animate-in">
      <div className="flex items-center gap-3">
        <div>
          <h2 className="font-medium text-ink-primary">Kriter & Ağırlıklandırma</h2>
          <p className="text-xs text-ink-tertiary mt-0.5">Toplantı kararları doğrultusunda belirlendi — Gizem, Hakan, Humanis, Gamze</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full', isBalanced ? 'bg-brand-50 text-brand-600' : 'bg-red-50 text-red-600')}>
            Toplam: {totalWeight}%
          </span>
          <button onClick={recalculateScores} className="btn-primary text-xs">
            <RefreshCw className="w-3 h-3" />
            Skorları Güncelle
          </button>
        </div>
      </div>

      {!isBalanced && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
          Ağırlıklar toplamı 100 olmalıdır. Şu an: {totalWeight}. Lütfen ayarlayın, ardından "Skorları Güncelle" butonuna tıklayın.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {criteria.map((c, i) => (
          <div key={c.id} className={cn('card p-4 stagger-' + (i + 1), 'animate-in')}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-ink-primary text-sm">{c.label}</h3>
                  <span className={cn('badge text-[9px]', CATEGORY_COLORS[c.category])}>
                    {CATEGORY_LABELS[c.category]}
                  </span>
                </div>
                <p className="text-xs text-ink-tertiary leading-relaxed">{c.description}</p>
              </div>
              <div className="flex-shrink-0 text-right">
                <span className="text-2xl font-medium text-ink-primary">%{c.weight}</span>
              </div>
            </div>

            {/* Slider */}
            <div className="flex items-center gap-3 mt-3">
              <span className="text-[10px] text-ink-tertiary w-5 text-center">0</span>
              <input
                type="range"
                min={0}
                max={40}
                step={1}
                value={c.weight}
                onChange={e => updateCriteriaWeight(c.id, Number(e.target.value))}
                className="flex-1 accent-brand-400"
              />
              <span className="text-[10px] text-ink-tertiary w-8 text-center">40</span>
            </div>

            {/* Molecule scores for this criterion */}
            <div className="mt-3 pt-3 border-t border-border/60 space-y-1.5">
              {candidates
                .slice()
                .sort((a, b) => {
                  const va = a.scores[c.id as keyof typeof a.scores] ?? 0
                  const vb = b.scores[c.id as keyof typeof b.scores] ?? 0
                  return c.id === 'patentRisk' ? va - vb : vb - va
                })
                .map(mol => {
                  const raw = mol.scores[c.id as keyof typeof mol.scores] ?? 0
                  const display = c.id === 'patentRisk' ? 100 - raw : raw
                  return (
                    <div key={mol.id} className="flex items-center gap-2">
                      <span className="text-[10px] text-ink-secondary w-20 truncate">{mol.name}</span>
                      <div className="flex-1 h-1.5 bg-surface-2 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${display}%`, background: scoreColor(display) }} />
                      </div>
                      <span className="text-[10px] font-medium w-6 text-right" style={{ color: scoreColor(display) }}>{display}</span>
                    </div>
                  )
                })}
            </div>
          </div>
        ))}
      </div>

      {/* Current ranking preview */}
      <div className="card p-4">
        <h3 className="text-sm font-medium text-ink-primary mb-3">Mevcut Sıralama (Ağırlıklı Skor)</h3>
        <div className="space-y-2">
          {[...candidates]
            .sort((a, b) => (b.weightedScore ?? 0) - (a.weightedScore ?? 0))
            .map((mol, i) => (
              <div key={mol.id} className="flex items-center gap-3">
                <span className="text-xs text-ink-tertiary w-5 text-center font-medium">#{i + 1}</span>
                <span className="text-sm text-ink-primary font-medium w-28">{mol.name}</span>
                <div className="flex-1 h-2 bg-surface-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${mol.weightedScore ?? 0}%`, background: scoreColor(mol.weightedScore ?? 0) }}
                  />
                </div>
                <span className="text-sm font-medium w-12 text-right" style={{ color: scoreColor(mol.weightedScore ?? 0) }}>
                  {mol.weightedScore ?? 0}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
