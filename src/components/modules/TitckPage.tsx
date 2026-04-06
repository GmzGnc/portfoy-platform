'use client'

import { useState, useMemo } from 'react'
import { useStore } from '@/store'
import { formatDate } from '@/lib/utils'
import { Search, Shield, Clock, AlertTriangle } from 'lucide-react'

export default function TitckPage() {
  const { titckProducts, titckIngredients, titckSchedule } = useStore()
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'products' | 'ingredients' | 'schedule'>('products')

  const filteredProducts = useMemo(() => {
    if (!search) return titckProducts.slice(0, 100)
    const q = search.toLowerCase()
    return titckProducts
      .filter(p => p.productName.toLowerCase().includes(q) || p.activeIngredient.toLowerCase().includes(q) || p.atcCode.toLowerCase().includes(q))
      .slice(0, 100)
  }, [titckProducts, search])

  const filteredIngredients = useMemo(() => {
    if (!search) return titckIngredients.slice(0, 100)
    const q = search.toLowerCase()
    return titckIngredients.filter(i => i.name.toLowerCase().includes(q)).slice(0, 100)
  }, [titckIngredients, search])

  const TABS = [
    { id: 'products', label: 'Ruhsatlı Ürünler', count: titckProducts.length > 0 ? titckProducts.length : '~22.292' },
    { id: 'ingredients', label: 'Etkin Maddeler', count: titckIngredients.length > 0 ? titckIngredients.length : '852' },
    { id: 'schedule', label: 'Takvimlendirme', count: titckSchedule.length > 0 ? titckSchedule.length : '36' },
  ]

  return (
    <div className="space-y-4 animate-in">
      <div>
        <h2 className="font-medium text-ink-primary">TİTCK Ruhsat Takibi</h2>
        <p className="text-xs text-ink-tertiary mt-0.5">
          {titckProducts.length > 0 ? `${titckProducts.length.toLocaleString('tr-TR')} ürün yüklendi` : 'Excel yükleyerek tüm verilere erişin'}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Ruhsatlı Ürün', value: titckProducts.length > 0 ? titckProducts.length.toLocaleString('tr-TR') : '22.292', icon: <Shield className="w-4 h-4 text-brand-400" /> },
          { label: 'Etkin Madde', value: titckIngredients.length > 0 ? titckIngredients.length : '852', icon: <Shield className="w-4 h-4 text-blue-400" /> },
          { label: 'Takvimli Madde', value: titckSchedule.length > 0 ? titckSchedule.length : '36', icon: <Clock className="w-4 h-4 text-amber-400" /> },
          { label: 'Askıdaki Ürün', value: titckProducts.filter(p => p.suspendStatus > 0).length || '—', icon: <AlertTriangle className="w-4 h-4 text-red-400" /> },
        ].map((kpi, i) => (
          <div key={i} className="metric-card flex items-center gap-3">
            {kpi.icon}
            <div>
              <p className="text-xl font-medium text-ink-primary">{kpi.value}</p>
              <p className="text-[11px] text-ink-tertiary">{kpi.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`stage-tab ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.label}
            <span className="ml-1.5 badge badge-gray">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-tertiary" />
        <input
          type="text"
          className="input pl-9"
          placeholder={activeTab === 'products' ? 'Ürün adı, etkin madde veya ATC kodu ara...' : 'Etkin madde ara...'}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Products */}
      {activeTab === 'products' && (
        <div className="card overflow-hidden">
          {titckProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Shield className="w-10 h-10 text-ink-tertiary mb-3" />
              <p className="font-medium text-ink-secondary">TİTCK verisi yüklenmedi</p>
              <p className="text-xs text-ink-tertiary mt-1">Excel dosyasını yükleyerek 22.292 ürüne erişin</p>
            </div>
          ) : (
            <>
              <p className="text-xs text-ink-tertiary px-4 py-2 border-b border-border bg-surface-1">
                {search ? `"${search}" için ${filteredProducts.length} sonuç` : `İlk 100 kayıt gösteriliyor (toplam ${titckProducts.length.toLocaleString('tr-TR')})`}
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {['Sıra No', 'Ürün Adı', 'Etkin Madde', 'ATC', 'Ruhsat Sahibi', 'Tarih', 'Durum'].map(h => (
                        <th key={h} className="text-left text-[10px] font-medium text-ink-tertiary uppercase tracking-wider px-3 py-2.5">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map(p => (
                      <tr key={p.siraNo} className="border-b border-border/60 hover:bg-surface-1 transition-colors">
                        <td className="px-3 py-2.5 text-ink-tertiary tabular-nums text-xs">{p.siraNo}</td>
                        <td className="px-3 py-2.5 max-w-[200px]">
                          <p className="text-xs font-medium text-ink-primary truncate">{p.productName}</p>
                        </td>
                        <td className="px-3 py-2.5 text-xs text-ink-secondary max-w-[160px]">
                          <p className="truncate">{p.activeIngredient}</p>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="text-[10px] font-mono bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded">
                            {p.atcCode}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-xs text-ink-secondary max-w-[160px]">
                          <p className="truncate">{p.licenseHolder}</p>
                        </td>
                        <td className="px-3 py-2.5 text-xs text-ink-secondary whitespace-nowrap">
                          {p.licenseDate ? formatDate(p.licenseDate, 'short') : '—'}
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={`badge text-[9px] ${p.suspendStatus === 0 ? 'badge-brand' : 'badge-red'}`}>
                            {p.suspendStatus === 0 ? 'Aktif' : 'Askıda'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* Ingredients */}
      {activeTab === 'ingredients' && (
        <div className="card overflow-hidden">
          {titckIngredients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="font-medium text-ink-secondary">Etkin madde verisi yüklenmedi</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {['No', 'Etkin Madde', 'Ürün Sayısı'].map(h => (
                      <th key={h} className="text-left text-[10px] font-medium text-ink-tertiary uppercase tracking-wider px-4 py-2.5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredIngredients.map(ing => (
                    <tr key={ing.no} className="border-b border-border/60 hover:bg-surface-1 transition-colors">
                      <td className="px-4 py-2.5 text-xs text-ink-tertiary tabular-nums">{ing.no}</td>
                      <td className="px-4 py-2.5 text-xs text-ink-primary">{ing.name}</td>
                      <td className="px-4 py-2.5">
                        <span className="badge badge-gray">{ing.productCount}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Schedule */}
      {activeTab === 'schedule' && (
        <div className="card overflow-hidden">
          {titckSchedule.length === 0 ? (
            // Show hardcoded data
            <div className="overflow-x-auto">
              <p className="text-xs text-ink-tertiary px-4 py-2 border-b border-border bg-surface-1">
                Dahili veri (Excel yüklemeden görüntüleniyor)
              </p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {['#', 'Etkin Madde', 'Beklenen Ürün', 'Öncelik'].map(h => (
                      <th key={h} className="text-left text-[10px] font-medium text-ink-tertiary uppercase tracking-wider px-4 py-2.5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { no: 1, name: 'amantadine hydrochloride', count: 1 },
                    { no: 5, name: 'cholecalciferol', count: 2 },
                    { no: 6, name: 'edoxaban tosylate', count: 3 },
                    { no: 7, name: 'empagliflozin, metformin hcl', count: 6 },
                    { no: 12, name: 'ibrutinib', count: 1 },
                    { no: 22, name: 'naloxone hydrochloride', count: 3 },
                    { no: 27, name: 'quetiapin fumarat', count: 6 },
                    { no: 29, name: 'ruxolitinib hemifumarate', count: 4 },
                    { no: 30, name: 'sacubitril valsartan sodium salt complex', count: 3 },
                    { no: 36, name: 'varenicline tartrate', count: 2 },
                  ].map(item => (
                    <tr key={item.no} className="border-b border-border/60 hover:bg-surface-1 transition-colors">
                      <td className="px-4 py-2.5 text-xs text-ink-tertiary">{item.no}</td>
                      <td className="px-4 py-2.5 text-xs text-ink-primary">{item.name}</td>
                      <td className="px-4 py-2.5">
                        <span className={`badge ${item.count >= 6 ? 'badge-red' : item.count >= 3 ? 'badge-amber' : 'badge-gray'}`}>
                          {item.count}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`badge ${item.count >= 6 ? 'badge-red' : item.count >= 3 ? 'badge-amber' : 'badge-gray'}`}>
                          {item.count >= 6 ? 'Yüksek' : item.count >= 3 ? 'Orta' : 'Normal'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {['#', 'Etkin Madde', 'Beklenen Ürün'].map(h => (
                      <th key={h} className="text-left text-[10px] font-medium text-ink-tertiary uppercase tracking-wider px-4 py-2.5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {titckSchedule.map(item => (
                    <tr key={item.no} className="border-b border-border/60 hover:bg-surface-1 transition-colors">
                      <td className="px-4 py-2.5 text-xs text-ink-tertiary">{item.no}</td>
                      <td className="px-4 py-2.5 text-xs text-ink-primary">{item.activeIngredient}</td>
                      <td className="px-4 py-2.5"><span className="badge badge-gray">{item.expectedProductCount}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
