'use client'

import { useMemo, useState } from 'react'
import { differenceInMonths } from 'date-fns'
import { cn } from '@/lib/utils'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Scale } from 'lucide-react'

const BRAND = '#1D9E75'
const CHART_MIN_YEAR = 2015
const CHART_MAX_YEAR = 2040

type PatentStatus = 'protected' | 'expiring' | 'expired'

type PatentMolecule = {
  id: string
  name: string
  patentHolder: string
  patentStartYear: number
  expiryDate: string
  exclusivityEnd: string
  estimatedTrMarketEntry: string
  patentRiskScore: number
  /** Piyasa giriş penceresi sonu (grafik için) */
  marketWindowEndYear: number
}

const MOLECULES: PatentMolecule[] = [
  {
    id: 'semaglutide',
    name: 'Semaglutide',
    patentHolder: 'Novo Nordisk',
    patentStartYear: 2017,
    expiryDate: '2033-12-31',
    exclusivityEnd: '2033-12-31',
    estimatedTrMarketEntry: '2035-06-30',
    patentRiskScore: 78,
    marketWindowEndYear: 2038,
  },
  {
    id: 'tirzepatide',
    name: 'Tirzepatide',
    patentHolder: 'Eli Lilly',
    patentStartYear: 2022,
    expiryDate: '2036-06-15',
    exclusivityEnd: '2036-06-15',
    estimatedTrMarketEntry: '2037-12-01',
    patentRiskScore: 85,
    marketWindowEndYear: 2040,
  },
  {
    id: 'dulaglutide',
    name: 'Dulaglutide',
    patentHolder: 'Eli Lilly',
    patentStartYear: 2014,
    expiryDate: '2027-09-30',
    exclusivityEnd: '2027-09-30',
    estimatedTrMarketEntry: '2029-03-01',
    patentRiskScore: 52,
    marketWindowEndYear: 2032,
  },
  {
    id: 'liraglutide',
    name: 'Liraglutide',
    patentHolder: 'Novo Nordisk',
    patentStartYear: 2009,
    expiryDate: '2023-06-30',
    exclusivityEnd: '2023-06-30',
    estimatedTrMarketEntry: '2024-12-01',
    patentRiskScore: 12,
    marketWindowEndYear: 2030,
  },
  {
    id: 'exenatide',
    name: 'Exenatide',
    patentHolder: 'AstraZeneca (Amylin)',
    patentStartYear: 2005,
    expiryDate: '2018-11-30',
    exclusivityEnd: '2018-11-30',
    estimatedTrMarketEntry: '2020-06-01',
    patentRiskScore: 5,
    marketWindowEndYear: 2026,
  },
]

function patentStatus(expiryIso: string, now: Date = new Date()): PatentStatus {
  const expiry = new Date(expiryIso)
  if (expiry < now) return 'expired'
  const threeYears = new Date(now)
  threeYears.setFullYear(threeYears.getFullYear() + 3)
  if (expiry <= threeYears) return 'expiring'
  return 'protected'
}

function statusColors(status: PatentStatus) {
  switch (status) {
    case 'protected':
      return { bar: '#E24B4A', badge: 'badge-red', label: 'Korumalı' }
    case 'expiring':
      return { bar: '#D97706', badge: 'badge-amber', label: 'Yakında sona eriyor' }
    case 'expired':
      return { bar: '#059669', badge: '', label: 'Süresi doldu' }
  }
}

function formatTrDate(iso: string) {
  return new Date(iso).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function monthsUntilGeneric(entryIso: string, now: Date = new Date()) {
  const entry = new Date(entryIso)
  const m = differenceInMonths(entry, now)
  if (m <= 0) return { text: 'Jenerik giriş penceresi açık / geçti', months: 0 }
  return { text: `${m} ay`, months: m }
}

export default function PatentPage() {
  const [showBarrierMonths, setShowBarrierMonths] = useState(false)

  const chartData = useMemo(
    () =>
      MOLECULES.map(m => {
        const expiryY = new Date(m.expiryDate).getFullYear()
        const lead = Math.max(0, m.patentStartYear - CHART_MIN_YEAR)
        /* Koruma bloğu eksende patent bitiş yılında bitsin: lead + patentSpan = expiryY - CHART_MIN_YEAR */
        const patentSpan = Math.max(0, expiryY - CHART_MIN_YEAR - lead)
        const windowSpan = Math.max(0, m.marketWindowEndYear - expiryY)
        return {
          name: m.name,
          lead,
          patentSpan,
          windowSpan,
          status: patentStatus(m.expiryDate),
        }
      }),
    []
  )

  const ganttTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null
    const row = payload[0]?.payload
    if (!row) return null
    return (
      <div className="bg-surface-0 border border-border rounded-lg shadow-modal p-3 text-xs min-w-[200px]">
        <p className="font-medium text-ink-primary mb-2">{row.name}</p>
        <p className="text-ink-secondary">
          <span className="text-ink-tertiary">Koruma: </span>
          {CHART_MIN_YEAR + row.lead} – {CHART_MIN_YEAR + row.lead + row.patentSpan}
        </p>
        <p className="text-ink-secondary mt-1">
          <span className="text-ink-tertiary">Piyasa giriş penceresi: </span>
          {CHART_MIN_YEAR + row.lead + row.patentSpan} –{' '}
          {CHART_MIN_YEAR + row.lead + row.patentSpan + row.windowSpan}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-display text-ink-primary">GLP-1 Patent Takibi</h2>
          <p className="text-xs text-ink-tertiary mt-1 max-w-xl">
            Patent bitiş tarihleri ve jenerik piyasa giriş penceresi — yatay zaman çizelgesi (Gantt
            tarzı).
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowBarrierMonths(v => !v)}
          className={cn('btn-primary shrink-0', showBarrierMonths && 'ring-2 ring-brand-200')}
        >
          <Scale className="w-4 h-4" />
          Patent Engeli Hesapla
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'Korumalı molekül', value: MOLECULES.filter(m => patentStatus(m.expiryDate) === 'protected').length, sub: 'Kırmızı segment' },
          { label: 'Yakında sona erecek', value: MOLECULES.filter(m => patentStatus(m.expiryDate) === 'expiring').length, sub: '3 yıl içinde' },
          { label: 'Süresi dolmuş', value: MOLECULES.filter(m => patentStatus(m.expiryDate) === 'expired').length, sub: 'Jenerik penceresi' },
        ].map((k, i) => (
          <div key={i} className="metric-card">
            <p className="text-xs text-ink-secondary mb-1.5">{k.label}</p>
            <p className="text-2xl font-medium text-brand-600">{k.value}</p>
            <p className="text-[11px] text-ink-tertiary mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="card p-4">
        <h3 className="text-sm font-medium text-ink-primary mb-1">Patent &amp; piyasa giriş zaman çizelgesi</h3>
        <p className="text-xs text-ink-tertiary mb-1">
          Her satırda kırmızı / amber / yeşil: koruma dönemi;{' '}
          <span className="text-brand-600 font-medium">yeşil tonlu</span> blok: patent sonrası
          jenerik giriş penceresi (temsilî süre).
        </p>
        <div className="flex flex-wrap gap-4 text-[10px] text-ink-secondary mb-3">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-2 rounded-sm bg-red-500" /> Korumalı
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-2 rounded-sm bg-amber-600" /> Yakında sona eriyor
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-2 rounded-sm bg-emerald-600" /> Süresi doldu
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-2 rounded-sm opacity-70" style={{ background: BRAND }} />
            Piyasa giriş penceresi
          </span>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
            barCategoryGap={12}
            barGap={2}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, CHART_MAX_YEAR - CHART_MIN_YEAR]}
              tickFormatter={v => String(CHART_MIN_YEAR + Number(v))}
              tick={{ fontSize: 10, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={92}
              tick={{ fontSize: 11, fill: '#374151' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={ganttTooltip} />
            <Bar dataKey="lead" stackId="gantt" fill="transparent" name="lead" legendType="none" />
            <Bar dataKey="patentSpan" stackId="gantt" name="patentSpan" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={statusColors(entry.status as PatentStatus).bar} />
              ))}
            </Bar>
            <Bar
              dataKey="windowSpan"
              stackId="gantt"
              name="windowSpan"
              fill={BRAND}
              fillOpacity={0.45}
              radius={[4, 0, 0, 4]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {showBarrierMonths && (
        <div className="card p-4 border-brand-200 bg-brand-50/30">
          <h4 className="text-sm font-medium text-ink-primary mb-3">
            Tahmini jenerik girişe kalan süre (TR, ruhsat gecikmesi dahil)
          </h4>
          <ul className="space-y-2 text-sm">
            {MOLECULES.map(m => {
              const { text, months } = monthsUntilGeneric(m.estimatedTrMarketEntry)
              return (
                <li key={m.id} className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border last:border-0 pb-2 last:pb-0">
                  <span className="font-medium text-ink-primary">{m.name}</span>
                  <span className="text-ink-secondary">
                    Tahmini TR giriş: {formatTrDate(m.estimatedTrMarketEntry)}
                    <span className="text-brand-600 font-medium ml-2">
                      {months > 0 ? `≈ ${text}` : text}
                    </span>
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {MOLECULES.map(m => {
          const status = patentStatus(m.expiryDate)
          const sc = statusColors(status)
          return (
            <div
              key={m.id}
              className={cn(
                'card p-4 card-hover',
                status === 'protected' && 'border-l-4 border-l-red-400',
                status === 'expiring' && 'border-l-4 border-l-amber-500',
                status === 'expired' && 'border-l-4 border-l-emerald-500'
              )}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <h4 className="text-sm font-medium text-ink-primary">{m.name}</h4>
                {status === 'expired' ? (
                  <span className="badge bg-emerald-50 text-emerald-800">{sc.label}</span>
                ) : (
                  <span className={cn('badge text-[10px]', sc.badge)}>{sc.label}</span>
                )}
              </div>
              <dl className="space-y-2 text-xs">
                <div>
                  <dt className="text-ink-tertiary">Patent sahibi</dt>
                  <dd className="text-ink-primary font-medium">{m.patentHolder}</dd>
                </div>
                <div>
                  <dt className="text-ink-tertiary">Patent bitiş</dt>
                  <dd className="text-ink-primary">{formatTrDate(m.expiryDate)}</dd>
                </div>
                <div>
                  <dt className="text-ink-tertiary">Münhasırlık sonu</dt>
                  <dd className="text-ink-primary">{formatTrDate(m.exclusivityEnd)}</dd>
                </div>
                <div>
                  <dt className="text-ink-tertiary">Tahmini TR piyasa girişi</dt>
                  <dd className="text-brand-600 font-medium">{formatTrDate(m.estimatedTrMarketEntry)}</dd>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <dt className="text-ink-tertiary">Patent risk skoru</dt>
                  <dd>
                    <span
                      className={cn(
                        'badge',
                        m.patentRiskScore >= 60 ? 'badge-red' : m.patentRiskScore >= 35 ? 'badge-amber' : 'badge-gray'
                      )}
                    >
                      {m.patentRiskScore}/100
                    </span>
                  </dd>
                </div>
              </dl>
              {showBarrierMonths && (
                <p className="mt-3 text-[11px] text-ink-secondary border-t border-border pt-2">
                  Engelleme:{' '}
                  <strong className="text-ink-primary">
                    {monthsUntilGeneric(m.estimatedTrMarketEntry).text}
                  </strong>{' '}
                  (tahmini TR jenerik girişe)
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
