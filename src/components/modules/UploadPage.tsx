'use client'

import ExcelUpload from '@/components/ui/ExcelUpload'
import { FileSpreadsheet, Info } from 'lucide-react'

export default function UploadPage({ onSuccess }: { onSuccess?: () => void }) {
  return (
    <div className="space-y-5 animate-in max-w-2xl">
      <div>
        <h2 className="font-medium text-ink-primary">Veri Yükle</h2>
        <p className="text-xs text-ink-tertiary mt-0.5">portföy_doc.xlsx dosyasını yükleyerek tüm IQVIA ve TİTCK verilerine erişin</p>
      </div>

      <ExcelUpload onSuccess={() => { onSuccess?.() }} />

      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-medium text-ink-primary">Webservis Entegrasyonu (Yakında)</h3>
        </div>
        <p className="text-xs text-ink-secondary leading-relaxed mb-3">
          Mevcut mimari IQVIA API, Midas ve TİTCK webservislerine bağlanmaya hazırdır.
          API erişimi sağlandığında aşağıdaki env değişkenleri tanımlanarak otomatik geçiş yapılır:
        </p>
        <div className="space-y-1.5 font-mono text-[11px]">
          {[
            ['NEXT_PUBLIC_IQVIA_API_URL', 'IQVIA REST API endpoint'],
            ['IQVIA_API_KEY', 'IQVIA API anahtarı (server-side)'],
            ['NEXT_PUBLIC_MIDAS_URL', 'Midas sistem URL'],
            ['MIDAS_USERNAME', 'Midas kullanıcı adı'],
            ['MIDAS_PASSWORD', 'Midas şifresi'],
          ].map(([key, desc]) => (
            <div key={key} className="flex items-center gap-3 bg-surface-1 rounded px-3 py-1.5">
              <span className="text-blue-600">{key}</span>
              <span className="text-ink-tertiary text-[10px] ml-auto">{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
