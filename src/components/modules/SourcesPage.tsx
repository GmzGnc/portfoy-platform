'use client'

import { useStore } from '@/store'
import { cn, formatDate } from '@/lib/utils'
import { Wifi, WifiOff, Database, Upload, RefreshCw, Settings } from 'lucide-react'

export default function SourcesPage() {
  const { dataSources } = useStore()

  const sourceInfo = {
    excel_upload: {
      icon: <Upload className="w-4 h-4" />,
      description: 'portföy_doc.xlsx dosyasından IQVIA TR, IQVIA Global ve TİTCK verilerini yükler',
      sheets: ['IMS_Tr', 'IMS_global', 'titck_ruhsat', 'titck_etken', 'titck_takvimlendirme'],
      futureNote: 'Şu an aktif olan birincil veri kaynağı',
    },
    iqvia_api: {
      icon: <Database className="w-4 h-4" />,
      description: 'IQVIA REST API üzerinden gerçek zamanlı satış, pazar payı ve trend verisi',
      sheets: ['Satış Verileri', 'Pazar Payı', 'Trend Analizi'],
      futureNote: 'Gelecek: NEXT_PUBLIC_IQVIA_API_URL env değişkeni tanımlandığında aktif olur',
    },
    midas_api: {
      icon: <Database className="w-4 h-4" />,
      description: 'Midas sistemi kullanıcı adı/şifre ile oturum açarak satış tahmini ve pazar öngörüleri',
      sheets: ['Satış Tahminleri', 'Pazar Öngörüleri'],
      futureNote: 'Gelecek: NEXT_PUBLIC_MIDAS_URL + MIDAS_USERNAME + MIDAS_PASSWORD ile aktif olur',
    },
    titck_api: {
      icon: <Database className="w-4 h-4" />,
      description: 'TİTCK resmi API — ruhsat listesi, etkin madde ve takvimlendirme verileri',
      sheets: ['Ruhsatlı Ürünler', 'Etkin Maddeler', 'Takvimlendirme'],
      futureNote: 'Gelecek: TİTCK API erişim sağlandığında aktif olur. Şimdilik Excel kullanılıyor.',
    },
    manual: {
      icon: <Settings className="w-4 h-4" />,
      description: 'Kullanıcı tarafından manuel olarak girilen patent, finansal ve klinik veriler',
      sheets: ['Aday Moleküller', 'Değerlendirme Kriterleri'],
      futureNote: 'Her zaman aktif',
    },
  }

  return (
    <div className="space-y-5 animate-in">
      <div>
        <h2 className="font-medium text-ink-primary">Veri Kaynakları</h2>
        <p className="text-xs text-ink-tertiary mt-0.5">
          Adapter mimarisi — yeni kaynaklar eklemek için sadece adapter yazılır, diğer kod değişmez
        </p>
      </div>

      <div className="space-y-3">
        {Object.entries(dataSources).map(([key, ds]) => {
          const info = sourceInfo[key as keyof typeof sourceInfo]
          return (
            <div key={key} className="card p-4">
              <div className="flex items-start gap-3">
                <div className={cn(
                  'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
                  ds.isConnected ? 'bg-brand-50 text-brand-400' : 'bg-surface-2 text-ink-tertiary'
                )}>
                  {info?.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-medium text-ink-primary text-sm">{ds.label}</h3>
                    <span className={cn('badge text-[9px]', ds.isConnected ? 'badge-brand' : 'badge-gray')}>
                      {ds.isConnected ? (
                        <><Wifi className="w-2.5 h-2.5 inline mr-1" />Bağlı</>
                      ) : (
                        <><WifiOff className="w-2.5 h-2.5 inline mr-1" />Bağlı Değil</>
                      )}
                    </span>
                    {ds.lastUpdated && (
                      <span className="text-[10px] text-ink-tertiary">{formatDate(ds.lastUpdated, 'medium')}</span>
                    )}
                  </div>
                  <p className="text-xs text-ink-secondary leading-relaxed mb-2">{info?.description}</p>

                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {info?.sheets.map(s => (
                      <span key={s} className="badge badge-gray">{s}</span>
                    ))}
                  </div>

                  {info?.futureNote && (
                    <p className="text-[11px] text-ink-tertiary italic">{info.futureNote}</p>
                  )}

                  {ds.endpoint && (
                    <p className="text-[10px] text-ink-tertiary font-mono mt-1">{ds.endpoint}</p>
                  )}
                  {ds.configKey && (
                    <p className="text-[10px] text-blue-600 font-mono mt-0.5">env: {ds.configKey}</p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Architecture note */}
      <div className="card p-4 bg-brand-50/30 border-brand-100">
        <h3 className="text-sm font-medium text-ink-primary mb-2">Adapter Mimarisi</h3>
        <p className="text-xs text-ink-secondary leading-relaxed mb-3">
          Her veri kaynağı <code className="bg-surface-2 px-1 rounded">IIqviaAdapter</code> veya <code className="bg-surface-2 px-1 rounded">ITitckAdapter</code> interface'ini implement eder.
          API geçişi için sadece <code className="bg-surface-2 px-1 rounded">src/lib/adapters/index.ts</code> dosyasındaki <code className="bg-surface-2 px-1 rounded">AdapterRegistry</code> güncellenir.
        </p>
        <div className="grid grid-cols-3 gap-2 text-[11px] text-ink-secondary">
          <div className="bg-surface-0 rounded p-2"><strong className="text-ink-primary block mb-1">Şimdi</strong>Excel → Parser → Store</div>
          <div className="bg-surface-0 rounded p-2"><strong className="text-ink-primary block mb-1">IQVIA API Hazır</strong>NEXT_PUBLIC_IQVIA_API_URL set et → Otomatik geçiş</div>
          <div className="bg-surface-0 rounded p-2"><strong className="text-ink-primary block mb-1">Midas Robot</strong>Credentials set et → login() → Otomatik çekme</div>
        </div>
      </div>
    </div>
  )
}
