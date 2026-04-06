'use client'

import { useMemo, useState } from 'react'
import { formatTL, formatNumber, formatPercent, cn } from '@/lib/utils'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Dot,
} from 'recharts'

const MOLECULES = ['Tirzepatide', 'Exenatide', 'Semaglutide', 'Dulaglutide', 'Liraglutide'] as const

type Scenario = 'pessimistic' | 'base' | 'optimistic'

const SCENARIO_FACTOR: Record<Scenario, number> = {
  pessimistic: 0.7,
  base: 1,
  optimistic: 1.3,
}

type YearPL = {
  revenue: number
  cogs: number
  grossProfit: number
  grossMarginPct: number
  opex: number
  ebitda: number
  ebitdaMarginPct: number
}

function buildPL(
  volumes: [number, number, number],
  unitPrice: number,
  cogsPct: number,
  opexAnnual: number
): YearPL[] {
  return volumes.map(units => {
    const revenue = units * unitPrice
    const cogs = revenue * (cogsPct / 100)
    const grossProfit = revenue - cogs
    const grossMarginPct = revenue > 0 ? (grossProfit / revenue) * 100 : 0
    const opex = opexAnnual
    const ebitda = grossProfit - opex
    const ebitdaMarginPct = revenue > 0 ? (ebitda / revenue) * 100 : 0
    return {
      revenue,
      cogs,
      grossProfit,
      grossMarginPct,
      opex,
      ebitda,
      ebitdaMarginPct,
    }
  })
}

export default function FinancialPage() {
  const [molecule, setMolecule] = useState<string>(MOLECULES[0])
  const [unitPrice, setUnitPrice] = useState(4_500)
  const [vol1, setVol1] = useState(45_000)
  const [vol2, setVol2] = useState(72_000)
  const [vol3, setVol3] = useState(95_000)
  const [cogsPct, setCogsPct] = useState(38)
  const [opexAnnual, setOpexAnnual] = useState(8_500_000)
  const [marketSharePct, setMarketSharePct] = useState(100)
  const [launchInvestment, setLaunchInvestment] = useState(12_000_000)
  const [scenario, setScenario] = useState<Scenario>('base')

  const factor = SCENARIO_FACTOR[scenario]
  const share = marketSharePct / 100

  const volumes = useMemo<[number, number, number]>(
    () =>
      [
        Math.round(vol1 * factor * share),
        Math.round(vol2 * factor * share),
        Math.round(vol3 * factor * share),
      ],
    [vol1, vol2, vol3, factor, share]
  )

  const plByYear = useMemo(
    () => buildPL(volumes, unitPrice, cogsPct, opexAnnual),
    [volumes, unitPrice, cogsPct, opexAnnual]
  )

  const total3YRevenue = plByYear.reduce((s, y) => s + y.revenue, 0)
  const total3YEbitda = plByYear.reduce((s, y) => s + y.ebitda, 0)

  const roiPct = useMemo(() => {
    if (launchInvestment <= 0) return null
    return ((total3YEbitda - launchInvestment) / launchInvestment) * 100
  }, [total3YEbitda, launchInvestment])

  const { chartData, breakEvenMonth, breakEvenInRange } = useMemo(() => {
    const monthly: number[] = []
    for (let m = 1; m <= 36; m++) {
      const yearIdx = Math.min(Math.ceil(m / 12) - 1, 2)
      monthly.push(plByYear[yearIdx].ebitda / 12)
    }
    let cum = -launchInvestment
    const points: { month: number; kümülatif: number; bePoint: boolean }[] = []
    let beMonth: number | null = null
    for (let i = 0; i < 36; i++) {
      const prevCum = cum
      cum += monthly[i]
      const crossedUp = prevCum < 0 && cum >= 0
      const fromZeroLaunch = i === 0 && launchInvestment === 0 && cum >= 0
      if (beMonth === null && (crossedUp || fromZeroLaunch)) {
        beMonth = i + 1
      }
      points.push({
        month: i + 1,
        kümülatif: cum,
        bePoint: false,
      })
    }
    if (beMonth !== null) {
      const p = points[beMonth - 1]
      if (p) p.bePoint = true
    }
    return {
      chartData: points,
      breakEvenMonth: beMonth,
      breakEvenInRange: beMonth !== null,
    }
  }, [plByYear, launchInvestment])

  const chartTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: Record<string, unknown> }[] }) => {
    if (!active || !payload?.length) return null
    const p = payload[0].payload as { month: number; kümülatif: number }
    return (
      <div className="bg-surface-0 border border-border rounded-lg shadow-modal p-2 text-xs">
        <p className="font-medium text-ink-primary mb-1">{p.month}. ay</p>
        <p className="text-ink-secondary">Kümülatif nakit: {formatTL(p.kümülatif, true)}</p>
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-in">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-display text-ink-primary">P&amp;L Finansal Model</h2>
        <span className="badge badge-brand">{molecule}</span>
      </div>
      <p className="text-xs text-ink-tertiary max-w-2xl">
        3 yıllık gelir tablosu, kümülatif nakit akışı ile başabaş noktası ve senaryo analizi (hacim ±%30).
      </p>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ['pessimistic', 'Kötümser (−%30 hacim)'],
            ['base', 'Temel'],
            ['optimistic', 'İyimser (+%30 hacim)'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setScenario(key)}
            className={cn(scenario === key ? 'btn-primary' : 'btn-secondary', 'text-xs')}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
        {/* Girdiler */}
        <div className="card p-4 space-y-4">
          <h3 className="text-sm font-medium text-ink-primary">Girdiler</h3>

          <div>
            <label className="block text-xs text-ink-secondary mb-1.5">Molekül</label>
            <select
              className="input"
              value={molecule}
              onChange={e => setMolecule(e.target.value)}
            >
              {MOLECULES.map(m => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-ink-secondary">Birim fiyat (TL)</label>
              <span className="text-xs font-medium text-ink-primary">{formatTL(unitPrice)}</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={500}
                max={50_000}
                step={100}
                value={Math.min(unitPrice, 50_000)}
                onChange={e => setUnitPrice(Number(e.target.value))}
                className="flex-1 accent-brand-400"
              />
              <input
                type="number"
                className="input w-28 tabular-nums text-right"
                min={0}
                value={unitPrice}
                onChange={e => setUnitPrice(Math.max(0, Number(e.target.value) || 0))}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {([
              [1, vol1, setVol1],
              [2, vol2, setVol2],
              [3, vol3, setVol3],
            ] as const).map(([y, v, setV]) => (
              <div key={y}>
                <label className="block text-xs text-ink-secondary mb-1.5">Hacim Y{y} (adet)</label>
                <input
                  type="number"
                  className="input tabular-nums text-right w-full"
                  min={0}
                  value={v}
                  onChange={e => setV(Math.max(0, Math.round(Number(e.target.value) || 0)))}
                />
              </div>
            ))}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-ink-secondary">SMM / COGS (%)</label>
              <span className="text-xs font-medium text-ink-primary">{formatPercent(cogsPct, 0)}</span>
            </div>
            <input
              type="range"
              min={5}
              max={85}
              step={1}
              value={cogsPct}
              onChange={e => setCogsPct(Number(e.target.value))}
              className="w-full accent-brand-400"
            />
          </div>

          <div>
            <label className="block text-xs text-ink-secondary mb-1.5">İşletme giderleri (TL/yıl)</label>
            <input
              type="number"
              className="input tabular-nums text-right"
              min={0}
              value={opexAnnual}
              onChange={e => setOpexAnnual(Math.max(0, Number(e.target.value) || 0))}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-ink-secondary">Pazar payı varsayımı (%)</label>
              <span className="text-xs font-medium text-ink-primary">{formatPercent(marketSharePct, 0)}</span>
            </div>
            <input
              type="range"
              min={1}
              max={100}
              step={1}
              value={marketSharePct}
              onChange={e => setMarketSharePct(Number(e.target.value))}
              className="w-full accent-brand-400"
            />
          </div>

          <div>
            <label className="block text-xs text-ink-secondary mb-1.5">Lansman yatırımı (TL, tek sefer)</label>
            <input
              type="number"
              className="input tabular-nums text-right"
              min={0}
              value={launchInvestment}
              onChange={e => setLaunchInvestment(Math.max(0, Number(e.target.value) || 0))}
            />
          </div>
        </div>

        {/* Çıktılar */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="metric-card">
              <p className="text-xs text-ink-secondary mb-1.5">3Y Toplam Gelir</p>
              <p className="text-xl font-medium text-brand-600">{formatTL(total3YRevenue, true)}</p>
            </div>
            <div className="metric-card">
              <p className="text-xs text-ink-secondary mb-1.5">3Y Toplam FAVÖK</p>
              <p className="text-xl font-medium text-brand-600">{formatTL(total3YEbitda, true)}</p>
            </div>
            <div className="metric-card">
              <p className="text-xs text-ink-secondary mb-1.5">Başabaş ayı</p>
              <p className="text-xl font-medium text-ink-primary">
                {breakEvenInRange && breakEvenMonth !== null ? `${breakEvenMonth}. ay` : '36 ay içinde yok'}
              </p>
            </div>
            <div className="metric-card">
              <p className="text-xs text-ink-secondary mb-1.5">ROI % (3Y FAVÖK − lansman)</p>
              <p className="text-xl font-medium text-ink-primary">
                {roiPct === null ? '—' : `${roiPct.toFixed(1)}%`}
              </p>
            </div>
          </div>

          <div className="card p-4 overflow-x-auto">
            <h3 className="text-sm font-medium text-ink-primary mb-3">3 Yıllık P&amp;L</h3>
            <table className="w-full text-xs min-w-[520px]">
              <thead>
                <tr className="text-left text-ink-tertiary border-b border-border">
                  <th className="py-2 pr-3 font-medium">Kalem</th>
                  <th className="py-2 px-2 font-medium tabular-nums">Yıl 1</th>
                  <th className="py-2 px-2 font-medium tabular-nums">Yıl 2</th>
                  <th className="py-2 px-2 font-medium tabular-nums">Yıl 3</th>
                </tr>
              </thead>
              <tbody className="text-ink-primary">
                {(
                  [
                    ['Gelir', (y: YearPL) => formatTL(y.revenue)],
                    ['SMM (COGS)', (y: YearPL) => formatTL(y.cogs)],
                    ['Brüt kâr', (y: YearPL) => formatTL(y.grossProfit)],
                    ['Brüt kâr marjı %', (y: YearPL) => formatPercent(y.grossMarginPct)],
                    ['İşletme giderleri', (y: YearPL) => formatTL(y.opex)],
                    ['FAVÖK (EBITDA)', (y: YearPL) => formatTL(y.ebitda)],
                    ['FAVÖK marjı %', (y: YearPL) => formatPercent(y.ebitdaMarginPct)],
                  ] as const
                ).map(([label, fmt]) => (
                  <tr key={label} className="border-b border-border/70">
                    <td className="py-2 pr-3 text-ink-secondary">{label}</td>
                    {plByYear.map((y, i) => (
                      <td key={i} className="py-2 px-2 tabular-nums text-right">
                        {fmt(y)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-[10px] text-ink-tertiary mt-2">
              Etkin hacim (senaryo × pazar payı): Y1 {formatNumber(volumes[0])} · Y2 {formatNumber(volumes[1])} · Y3{' '}
              {formatNumber(volumes[2])} adet
            </p>
          </div>

          <div className="card p-4">
            <h3 className="text-sm font-medium text-ink-primary mb-1">Başabaş — kümülatif nakit (36 ay)</h3>
            <p className="text-xs text-ink-tertiary mb-3">
              Aylık FAVÖK eşit dağılım; sıfır çizgisini kestiği ay başabaş (lansman yatırımı dahil).
            </p>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10, fill: '#6b7280' }}
                  label={{ value: 'Ay', position: 'insideBottom', offset: -4, fontSize: 10, fill: '#9ca3af' }}
                />
                <YAxis
                  tickFormatter={v => formatTL(Number(v), true)}
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  width={72}
                />
                <Tooltip content={chartTooltip as never} />
                <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="4 4" />
                <Line
                  type="monotone"
                  dataKey="kümülatif"
                  name="Kümülatif nakit"
                  stroke="#1D9E75"
                  strokeWidth={2}
                  dot={(props: { cx?: number; cy?: number; payload?: { bePoint?: boolean } }) =>
                    props.payload?.bePoint && props.cx !== undefined && props.cy !== undefined ? (
                      <Dot cx={props.cx} cy={props.cy} r={6} fill="#EF9F27" stroke="#fff" strokeWidth={2} />
                    ) : (
                      <></>
                    )
                  }
                  activeDot={{ r: 4, fill: '#1D9E75' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
