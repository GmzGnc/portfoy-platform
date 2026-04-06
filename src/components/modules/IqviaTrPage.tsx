'use client'

import { useMemo } from 'react'
import { useStore } from '@/store'
import { formatTL, formatNumber, formatGrowth } from '@/lib/utils'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts'

const MOLECULE_COLORS: Record<string, string> = {
  SEMAGLUTIDE: '#1D9E75',
  TIRZEPATIDE: '#EF9F27',
  EXENATIDE: '#378ADD',
  DULAGLUTIDE: '#7F77DD',
  LIRAGLUTIDE: '#888780',
}

const MOLECULES = ['SEMAGLUTIDE', 'TIRZEPATIDE', 'EXENATIDE', 'DULAGLUTIDE', 'LIRAGLUTIDE']

// Hardcoded from Excel (always available even before upload)
const TR_DATA = [
  { mol: 'SEMAGLUTIDE',  y2021: 0,      y2022: 0,      y2023: 0,      y2024: 38273,  ytd: 184257,  tl2024: 235_429_500, tlYtd: 1_124_283_000 },
  { mol: 'EXENATIDE',    y2021: 276189, y2022: 261954, y2023: 250498, y2024: 262623, ytd: 117462,  tl2024: 170_909_700, tlYtd: 96_752_320 },
  { mol: 'TIRZEPATIDE',  y2021: 0,      y2022: 0,      y2023: 0,      y2024: 0,      ytd: 34473,   tl2024: 0,           tlYtd: 287_492_400 },
  { mol: 'DULAGLUTIDE',  y2021: 22501,  y2022: 25119,  y2023: 24610,  y2024: 22056,  ytd: 6491,    tl2024: 132_006_500, tlYtd: 48_908_840 },
  { mol: 'LIRAGLUTIDE',  y2021: 34956,  y2022: 37344,  y2023: 14632,  y2024: 9633,   ytd: 3587,    tl2024: 10_093_350,  tlYtd: 4_504_698 },
]

export default function IqviaTrPage() {
  const { iqviaTr } = useStore()

  // Yıllık trend için bar chart verisi
  const trendData = useMemo(() => [
    { year: '2021', ...Object.fromEntries(TR_DATA.map(r => [r.mol, r.y2021])) },
    { year: '2022', ...Object.fromEntries(TR_DATA.map(r => [r.mol, r.y2022])) },
    { year: '2023', ...Object.fromEntries(TR_DATA.map(r => [r.mol, r.y2023])) },
    { year: '2024', ...Object.fromEntries(TR_DATA.map(r => [r.mol, r.y2024])) },
    { year: '2025 YTD', ...Object.fromEntries(TR_DATA.map(r => [r.mol, r.ytd])) },
  ], [])

  // TL gelir karşılaştırması
  const revenueData = useMemo(() => TR_DATA.map(r => ({
    mol: r.mol.charAt(0) + r.mol.slice(1).toLowerCase(),
    tl2024: r.tl2024,
    tlYtd: r.tlYtd,
  })), [])

  // Toplam pazar
  const totalYtdUnits = TR_DATA.reduce((s, r) => s + r.ytd, 0)
  const totalYtdTL = TR_DATA.reduce((s, r) => s + r.tlYtd, 0)
  const total2024Units = TR_DATA.reduce((s, r) => s + r.y2024, 0)
  const total2024TL = TR_DATA.reduce((s, r) => s + r.tl2024, 0)

  const customTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-surface-0 border border-border rounded-lg shadow-modal p-3 text-xs min-w-[160px]">
        <p className="font-medium text-ink-primary mb-2">{label}</p>
        {payload.map((p: any) => (
          <div key={p.dataKey} className="flex items-center justify-between gap-4 py-0.5">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-sm" style={{ background: p.fill || p.color }} />
              <span className="text-ink-secondary capitalize">{p.dataKey.toLowerCase()}</span>
            </span>
            <span className="font-medium text-ink-primary">{formatNumber(p.value)}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-in">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'YTD 2025 Toplam Hacim', value: formatNumber(totalYtdUnits, true), sub: 'adet · Haz 2025', color: 'text-brand-600' },
          { label: 'YTD 2025 Toplam Gelir', value: formatTL(totalYtdTL, true), sub: 'Tüm GLP-1', color: 'text-brand-600' },
          { label: '2024 Hacim', value: formatNumber(total2024Units, true), sub: 'adet · Yıllık', color: 'text-ink-primary' },
          { label: '2024 Gelir', value: formatTL(total2024TL, true), sub: 'Tüm GLP-1', color: 'text-ink-primary' },
        ].map((kpi, i) => (
          <div key={i} className="metric-card">
            <p className="text-xs text-ink-secondary mb-1.5">{kpi.label}</p>
            <p className={`text-2xl font-medium ${kpi.color}`}>{kpi.value}</p>
            <p className="text-[11px] text-ink-tertiary mt-1">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Adet Trendi */}
        <div className="card p-4">
          <h3 className="text-sm font-medium text-ink-primary mb-1">Yıllık Adet Trendi</h3>
          <p className="text-xs text-ink-tertiary mb-4">2021–2025 YTD · Molekül bazlı</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={trendData} barSize={8} barGap={1}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => formatNumber(v, true)} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip content={customTooltip} />
              {MOLECULES.map(mol => (
                <Bar key={mol} dataKey={mol} fill={MOLECULE_COLORS[mol]} radius={[2, 2, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-3">
            {MOLECULES.map(mol => (
              <span key={mol} className="flex items-center gap-1.5 text-[10px] text-ink-secondary">
                <span className="w-2 h-2 rounded-sm" style={{ background: MOLECULE_COLORS[mol] }} />
                {mol.charAt(0) + mol.slice(1).toLowerCase()}
              </span>
            ))}
          </div>
        </div>

        {/* TL Gelir Karşılaştırması */}
        <div className="card p-4">
          <h3 className="text-sm font-medium text-ink-primary mb-1">TL Gelir Karşılaştırması</h3>
          <p className="text-xs text-ink-tertiary mb-4">2024 Yıllık vs YTD 2025 (Haziran)</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueData} barSize={14} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="mol" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => formatTL(v, true)} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v: number, name: string) => [formatTL(v, true), name === 'tl2024' ? '2024 Yıllık' : 'YTD 2025']}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '0.5px solid #e5e7eb' }}
              />
              <Bar dataKey="tl2024" fill="#B5D4F4" name="2024 Yıllık" radius={[2, 2, 0, 0]} />
              <Bar dataKey="tlYtd" fill="#1D9E75" name="YTD 2025" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-3">
            <span className="flex items-center gap-1.5 text-[10px] text-ink-secondary"><span className="w-2 h-2 rounded-sm bg-blue-200" />2024 Yıllık</span>
            <span className="flex items-center gap-1.5 text-[10px] text-ink-secondary"><span className="w-2 h-2 rounded-sm bg-brand-400" />YTD 2025</span>
          </div>
        </div>
      </div>

      {/* Molekül Detay Tablosu */}
      <div className="card overflow-hidden">
        <div className="px-4 pt-4 pb-2 border-b border-border">
          <h3 className="text-sm font-medium text-ink-primary">Molekül Detay Tablosu</h3>
          <p className="text-xs text-ink-tertiary mt-0.5">IQVIA Türkiye · GLP-1 Segmenti · {iqviaTr.length > 0 ? 'Excel\'den yüklendi' : 'Dahili veri'}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Molekül', '2021 Adet', '2022 Adet', '2023 Adet', '2024 Adet', 'YTD 2025 Adet', 'YTD 2025 TL', 'YTD Pay %'].map(h => (
                  <th key={h} className="text-left text-[10px] font-medium text-ink-tertiary uppercase tracking-wider px-4 py-2.5">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TR_DATA.map((row, i) => {
                const ytdShare = totalYtdUnits > 0 ? (row.ytd / totalYtdUnits * 100) : 0
                const prevYear = row.y2024
                const ytdGrowthVs24 = prevYear > 0
                  ? ((row.ytd * 2 - prevYear) / prevYear * 100)
                  : row.ytd > 0 ? 999 : 0

                return (
                  <tr key={i} className="border-b border-border/60 hover:bg-surface-1 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: MOLECULE_COLORS[row.mol] }} />
                        <div>
                          <p className="font-medium text-ink-primary capitalize">{row.mol.toLowerCase()}</p>
                        </div>
                      </div>
                    </td>
                    {[row.y2021, row.y2022, row.y2023, row.y2024].map((v, j) => (
                      <td key={j} className="px-4 py-3 text-ink-secondary tabular-nums">
                        {v > 0 ? formatNumber(v) : <span className="text-ink-tertiary">—</span>}
                      </td>
                    ))}
                    <td className="px-4 py-3 font-medium text-ink-primary tabular-nums">
                      {row.ytd > 0 ? formatNumber(row.ytd) : <span className="text-ink-tertiary">—</span>}
                    </td>
                    <td className="px-4 py-3 font-medium text-brand-600 tabular-nums">
                      {row.tlYtd > 0 ? formatTL(row.tlYtd, true) : <span className="text-ink-tertiary">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 bg-surface-2 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${ytdShare}%`, background: MOLECULE_COLORS[row.mol] }} />
                        </div>
                        <span className="text-xs font-medium text-ink-secondary">{ytdShare.toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {/* Total row */}
              <tr className="bg-surface-1 font-medium">
                <td className="px-4 py-3 text-ink-primary">Toplam</td>
                <td className="px-4 py-3 tabular-nums text-ink-secondary">{formatNumber(TR_DATA.reduce((s, r) => s + r.y2021, 0))}</td>
                <td className="px-4 py-3 tabular-nums text-ink-secondary">{formatNumber(TR_DATA.reduce((s, r) => s + r.y2022, 0))}</td>
                <td className="px-4 py-3 tabular-nums text-ink-secondary">{formatNumber(TR_DATA.reduce((s, r) => s + r.y2023, 0))}</td>
                <td className="px-4 py-3 tabular-nums text-ink-secondary">{formatNumber(total2024Units)}</td>
                <td className="px-4 py-3 tabular-nums text-ink-primary">{formatNumber(totalYtdUnits)}</td>
                <td className="px-4 py-3 tabular-nums text-brand-600">{formatTL(totalYtdTL, true)}</td>
                <td className="px-4 py-3 text-ink-secondary">100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
