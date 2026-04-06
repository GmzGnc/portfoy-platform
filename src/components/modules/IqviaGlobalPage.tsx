'use client'

import { useMemo, useState } from 'react'
import { useStore } from '@/store'
import { formatUSD, formatNumber } from '@/lib/utils'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend
} from 'recharts'

const GLOBAL_DATA = [
  { mol: 'SEMAGLUTIDE',    region: 'NORTH AMERICA',   u22: 124_266_399, u23: 185_031_067, u24: 202_548_900, usd22: 18_222_310_000, usd23: 31_736_270_000, usd24: 39_598_660_000 },
  { mol: 'SEMAGLUTIDE',    region: 'EUROPE - KEY 5',  u22: 37_688_219,  u23: 100_891_317, u24: 188_057_600, usd22: 853_400_000,    usd23: 1_276_284_000,  usd24: 1_651_492_000 },
  { mol: 'SEMAGLUTIDE',    region: 'EUROPE - OTHER',  u22: 39_568_748,  u23: 103_290_636, u24: 168_143_700, usd22: 720_617_100,    usd23: 1_143_531_000,  usd24: 1_531_290_000 },
  { mol: 'SEMAGLUTIDE',    region: 'ASIA MAJOR',      u22: 83_447_319,  u23: 154_736_959, u24: 202_296_700, usd22: 371_451_300,    usd23: 738_408_200,    usd24: 874_137_700 },
  { mol: 'SEMAGLUTIDE',    region: 'SOUTH AMERICA',   u22: 11_590_045,  u23: 24_565_237,  u24: 41_842_080,  usd22: 501_218_600,    usd23: 719_116_500,    usd24: 775_629_400 },
  { mol: 'SEMAGLUTIDE',    region: 'MIDDLE EAST',     u22: 11_132_989,  u23: 17_408_082,  u24: 16_872_890,  usd22: 149_779_100,    usd23: 222_383_800,    usd24: 325_654_300 },
  { mol: 'SEMAGLUTIDE',    region: 'CENTRAL AMERICA', u22: 2_175_396,   u23: 13_511_982,  u24: 26_094_300,  usd22: 55_142_450,     usd23: 152_933_000,    usd24: 236_885_800 },
  { mol: 'SEMAGLUTIDE',    region: 'SOUTHEAST ASIA',  u22: 7_201_339,   u23: 18_622_769,  u24: 29_337_010,  usd22: 190_647_000,    usd23: 369_089_500,    usd24: 489_862_100 },
  { mol: 'TIRZEPATIDE',    region: 'NORTH AMERICA',   u22: 11_763_956,  u23: 53_134_239,  u24: 93_965_550,  usd22: 2_726_306_000,  usd23: 12_825_490_000, usd24: 23_474_680_000 },
  { mol: 'TIRZEPATIDE',    region: 'EUROPE - KEY 5',  u22: 0,           u23: 56_652,      u24: 4_448_424,   usd22: 0,              usd23: 2_992_347,      usd24: 585_263_300 },
  { mol: 'TIRZEPATIDE',    region: 'EUROPE - OTHER',  u22: 0,           u23: 44_520,      u24: 1_484_720,   usd22: 0,              usd23: 4_310_323,      usd24: 158_644_400 },
  { mol: 'TIRZEPATIDE',    region: 'ASIA MAJOR',      u22: 0,           u23: 1_648_324,   u24: 7_546_100,   usd22: 0,              usd23: 29_780_940,     usd24: 144_035_200 },
  { mol: 'TIRZEPATIDE',    region: 'MIDDLE EAST',     u22: 222_388,     u23: 3_286_972,   u24: 6_245_502,   usd22: 19_729_850,     usd23: 262_950_100,    usd24: 753_473_000 },
  { mol: 'TIRZEPATIDE',    region: 'SOUTHEAST ASIA',  u22: 0,           u23: 173_646,     u24: 1_592_224,   usd22: 0,              usd23: 9_577_449,      usd24: 121_144_200 },
  { mol: 'DULAGLUTIDE',    region: 'NORTH AMERICA',   u22: 75_960_310,  u23: 78_622_056,  u24: 54_126_980,  usd22: 15_207_820_000, usd23: 16_045_590_000, usd24: 11_568_830_000 },
  { mol: 'DULAGLUTIDE',    region: 'EUROPE - KEY 5',  u22: 47_982_285,  u23: 52_810_047,  u24: 46_263_920,  usd22: 996_178_200,    usd23: 1_119_928_000,  usd24: 974_307_400 },
  { mol: 'DULAGLUTIDE',    region: 'EUROPE - OTHER',  u22: 16_143_769,  u23: 17_967_098,  u24: 17_122_110,  usd22: 317_262_800,    usd23: 362_800_200,    usd24: 344_177_000 },
  { mol: 'DULAGLUTIDE',    region: 'ASIA MAJOR',      u22: 21_925_997,  u23: 18_135_342,  u24: 14_677_660,  usd22: 386_374_200,    usd23: 281_205_100,    usd24: 209_527_200 },
  { mol: 'LIRAGLUTIDE',    region: 'NORTH AMERICA',   u22: 10_910_221,  u23: 9_368_620,   u24: 4_943_215,   usd22: 2_985_249_000,  usd23: 2_198_797_000,  usd24: 713_029_300 },
  { mol: 'LIRAGLUTIDE',    region: 'EUROPE - KEY 5',  u22: 6_673_483,   u23: 5_571_705,   u24: 2_403_914,   usd22: 288_169_500,    usd23: 250_631_300,    usd24: 115_481_700 },
  { mol: 'LIRAGLUTIDE',    region: 'EUROPE - OTHER',  u22: 3_319_644,   u23: 2_715_604,   u24: 1_293_278,   usd22: 145_283_000,    usd23: 117_362_800,    usd24: 53_421_740 },
  { mol: 'LIRAGLUTIDE',    region: 'ASIA MAJOR',      u22: 6_288_174,   u23: 6_017_543,   u24: 5_447_120,   usd22: 262_776_100,    usd23: 230_582_900,    usd24: 196_751_700 },
  { mol: 'EXENATIDE',      region: 'NORTH AMERICA',   u22: 3_560_698,   u23: 2_315_679,   u24: 1_721_570,   usd22: 641_263_300,    usd23: 453_341_100,    usd24: 343_439_200 },
  { mol: 'EXENATIDE',      region: 'EUROPE - KEY 5',  u22: 1_575_420,   u23: 1_119_362,   u24: 1_068_552,   usd22: 39_371_710,     usd23: 31_251_900,     usd24: 29_536_540 },
  { mol: 'EXENATIDE',      region: 'EUROPE - OTHER',  u22: 834_781,     u23: 818_365,     u24: 1_004_823,   usd22: 17_242_790,     usd23: 16_808_260,     usd24: 20_679_050 },
  { mol: 'EXENATIDE',      region: 'ASIA MAJOR',      u22: 119_320,     u23: 69_658,      u24: 51_476,      usd22: 4_751_483,      usd23: 2_731_852,      usd24: 1_918_400 },
]

const MOL_COLORS: Record<string, string> = {
  SEMAGLUTIDE: '#1D9E75', TIRZEPATIDE: '#EF9F27',
  DULAGLUTIDE: '#7F77DD', LIRAGLUTIDE: '#888780', EXENATIDE: '#378ADD',
}

const MOLECULES = ['SEMAGLUTIDE', 'TIRZEPATIDE', 'DULAGLUTIDE', 'LIRAGLUTIDE', 'EXENATIDE']

export default function IqviaGlobalPage() {
  const [selectedMol, setSelectedMol] = useState<string | null>(null)

  // Molekül bazlı toplam USD
  const molTotals = useMemo(() => {
    const map: Record<string, { usd22: number; usd23: number; usd24: number; u22: number; u23: number; u24: number }> = {}
    GLOBAL_DATA.forEach(r => {
      if (!map[r.mol]) map[r.mol] = { usd22: 0, usd23: 0, usd24: 0, u22: 0, u23: 0, u24: 0 }
      map[r.mol].usd22 += r.usd22
      map[r.mol].usd23 += r.usd23
      map[r.mol].usd24 += r.usd24
      map[r.mol].u22 += r.u22
      map[r.mol].u23 += r.u23
      map[r.mol].u24 += r.u24
    })
    return map
  }, [])

  const molChartData = useMemo(() =>
    MOLECULES.map(mol => ({
      mol: mol.charAt(0) + mol.slice(1).toLowerCase(),
      '2022': Math.round(molTotals[mol]?.usd22 / 1e9 * 10) / 10,
      '2023': Math.round(molTotals[mol]?.usd23 / 1e9 * 10) / 10,
      '2024': Math.round(molTotals[mol]?.usd24 / 1e9 * 10) / 10,
    })), [molTotals])

  // Toplam pazar trend
  const totalTrend = useMemo(() => [
    { year: '2022', total: Object.values(molTotals).reduce((s, v) => s + v.usd22, 0) / 1e9 },
    { year: '2023', total: Object.values(molTotals).reduce((s, v) => s + v.usd23, 0) / 1e9 },
    { year: '2024', total: Object.values(molTotals).reduce((s, v) => s + v.usd24, 0) / 1e9 },
  ], [molTotals])

  // Seçili molekül bölge dağılımı
  const regionData = useMemo(() => {
    if (!selectedMol) return []
    return GLOBAL_DATA.filter(r => r.mol === selectedMol).map(r => ({
      region: r.region.replace('EUROPE - ', 'EUR ').replace('CENTRAL AMERICA', 'C. AMERICA').replace('SOUTHEAST ASIA', 'SE ASIA'),
      '2022': Math.round(r.usd22 / 1e6),
      '2023': Math.round(r.usd23 / 1e6),
      '2024': Math.round(r.usd24 / 1e6),
    })).sort((a, b) => b['2024'] - a['2024'])
  }, [selectedMol])

  const total2024 = Object.values(molTotals).reduce((s, v) => s + v.usd24, 0)

  return (
    <div className="space-y-5 animate-in">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Global GLP-1 (2024)', value: formatUSD(total2024, true), sub: 'Toplam pazar', color: 'text-brand-600' },
          { label: 'Semaglutide 2024', value: formatUSD(molTotals['SEMAGLUTIDE']?.usd24 ?? 0, true), sub: `${((molTotals['SEMAGLUTIDE']?.usd24 ?? 0) / total2024 * 100).toFixed(0)}% pay`, color: 'text-brand-600' },
          { label: 'Tirzepatide 2024', value: formatUSD(molTotals['TIRZEPATIDE']?.usd24 ?? 0, true), sub: '+92% vs 2023', color: 'text-amber-600' },
          { label: 'Büyüme 2022→2024', value: '+88%', sub: 'Toplam GLP-1 pazarı', color: 'text-brand-600' },
        ].map((kpi, i) => (
          <div key={i} className="metric-card">
            <p className="text-xs text-ink-secondary mb-1.5">{kpi.label}</p>
            <p className={`text-2xl font-medium ${kpi.color}`}>{kpi.value}</p>
            <p className="text-[11px] text-ink-tertiary mt-1">{kpi.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Molekül karşılaştırması */}
        <div className="card p-4">
          <h3 className="text-sm font-medium text-ink-primary mb-1">Molekül Karşılaştırması — USD Milyar</h3>
          <p className="text-xs text-ink-tertiary mb-4">2022–2024 · Tüm bölgeler</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={molChartData} barSize={12} barGap={1}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="mol" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `$${v}B`} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => [`$${v}B`, '']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="2022" fill="#B5D4F4" radius={[2, 2, 0, 0]} />
              <Bar dataKey="2023" fill="#85B7EB" radius={[2, 2, 0, 0]} />
              <Bar dataKey="2024" fill="#1D9E75" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-3">
            {[['2022', '#B5D4F4'], ['2023', '#85B7EB'], ['2024', '#1D9E75']].map(([y, c]) => (
              <span key={y} className="flex items-center gap-1.5 text-[10px] text-ink-secondary">
                <span className="w-2 h-2 rounded-sm" style={{ background: c }} />{y}
              </span>
            ))}
          </div>
        </div>

        {/* Total Trend */}
        <div className="card p-4">
          <h3 className="text-sm font-medium text-ink-primary mb-1">Toplam Pazar Trendi</h3>
          <p className="text-xs text-ink-tertiary mb-4">Tüm GLP-1 · USD Milyar</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={totalTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `$${v.toFixed(0)}B`} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => [`$${v.toFixed(1)}B`, 'Toplam GLP-1']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Line type="monotone" dataKey="total" stroke="#1D9E75" strokeWidth={2.5} dot={{ fill: '#1D9E75', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Molekül seç → bölge dağılımı */}
      <div className="card p-4">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <h3 className="text-sm font-medium text-ink-primary">Bölge Dağılımı</h3>
          <div className="flex gap-2 flex-wrap">
            {MOLECULES.map(mol => (
              <button
                key={mol}
                onClick={() => setSelectedMol(selectedMol === mol ? null : mol)}
                className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                  selectedMol === mol
                    ? 'text-white border-transparent'
                    : 'bg-surface-0 border-border text-ink-secondary hover:border-brand-200'
                }`}
                style={selectedMol === mol ? { background: MOL_COLORS[mol], borderColor: MOL_COLORS[mol] } : {}}
              >
                {mol.charAt(0) + mol.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {selectedMol && regionData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={regionData} barSize={12} barGap={1} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
              <XAxis type="number" tickFormatter={v => `$${v}M`} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="region" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} width={80} />
              <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}M`, '']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="2022" fill="#B5D4F4" radius={[0, 2, 2, 0]} />
              <Bar dataKey="2023" fill="#85B7EB" radius={[0, 2, 2, 0]} />
              <Bar dataKey="2024" fill={MOL_COLORS[selectedMol]} radius={[0, 2, 2, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-32 text-ink-tertiary text-sm">
            Bölge dağılımı için bir molekül seçin
          </div>
        )}
      </div>

      {/* Summary table */}
      <div className="card overflow-hidden">
        <div className="px-4 pt-4 pb-2 border-b border-border">
          <h3 className="text-sm font-medium text-ink-primary">Özet Tablo — 2024 USD</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Molekül', '2022 USD', '2023 USD', '2024 USD', 'Büyüme 22→24', 'Pay 2024'].map(h => (
                  <th key={h} className="text-left text-[10px] font-medium text-ink-tertiary uppercase tracking-wider px-4 py-2.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOLECULES.map(mol => {
                const d = molTotals[mol] ?? { usd22: 0, usd23: 0, usd24: 0 }
                const growth = d.usd22 > 0 ? ((d.usd24 - d.usd22) / d.usd22 * 100) : d.usd24 > 0 ? 9999 : 0
                const share = total2024 > 0 ? d.usd24 / total2024 * 100 : 0
                return (
                  <tr key={mol} className="border-b border-border/60 hover:bg-surface-1 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: MOL_COLORS[mol] }} />
                        <span className="font-medium text-ink-primary capitalize">{mol.toLowerCase()}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-secondary tabular-nums">{formatUSD(d.usd22, true)}</td>
                    <td className="px-4 py-3 text-ink-secondary tabular-nums">{formatUSD(d.usd23, true)}</td>
                    <td className="px-4 py-3 font-medium text-ink-primary tabular-nums">{formatUSD(d.usd24, true)}</td>
                    <td className="px-4 py-3">
                      <span className={growth > 0 ? 'text-brand-600 font-medium' : 'text-red-600 font-medium'}>
                        {growth > 500 ? 'Yeni' : `${growth >= 0 ? '+' : ''}${growth.toFixed(0)}%`}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-surface-2 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${Math.min(share, 100)}%`, background: MOL_COLORS[mol] }} />
                        </div>
                        <span className="text-xs text-ink-secondary">{share.toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
