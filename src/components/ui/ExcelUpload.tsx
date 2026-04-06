'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { parsePortfoyExcel } from '@/lib/parsers/excelParser'
import { useStore } from '@/store'
import type { ExcelUploadResult } from '@/types'

export default function ExcelUpload({ onSuccess }: { onSuccess?: () => void }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [results, setResults] = useState<ExcelUploadResult[]>([])
  const [errorMsg, setErrorMsg] = useState('')

  const {
    setIqviaTr, setIqviaGlobal,
    setTitckProducts, setTitckIngredients, setTitckSchedule,
    setDataSourceConnected, clearUploadErrors, setLoading,
  } = useStore()

  const processFile = useCallback(async (file: File) => {
    setStatus('loading')
    setLoading(true)
    clearUploadErrors()
    setResults([])

    try {
      const parsed = await parsePortfoyExcel(file)

      // Store'a yaz
      if (parsed.iqviaTr.length > 0) setIqviaTr(parsed.iqviaTr)
      if (parsed.iqviaGlobal.length > 0) setIqviaGlobal(parsed.iqviaGlobal)
      if (parsed.titckProducts.length > 0) setTitckProducts(parsed.titckProducts)
      if (parsed.titckIngredients.length > 0) setTitckIngredients(parsed.titckIngredients)
      if (parsed.titckSchedule.length > 0) setTitckSchedule(parsed.titckSchedule)

      setDataSourceConnected('excel_upload', true)
      setResults(parsed.results)

      const hasErrors = parsed.results.some(r => r.errors.length > 0)
      setStatus(hasErrors ? 'error' : 'success')
      if (!hasErrors) onSuccess?.()
    } catch (e) {
      setStatus('error')
      setErrorMsg(e instanceof Error ? e.message : 'Bilinmeyen hata')
    } finally {
      setLoading(false)
    }
  }, [setIqviaTr, setIqviaGlobal, setTitckProducts, setTitckIngredients, setTitckSchedule, setDataSourceConnected, clearUploadErrors, setLoading, onSuccess])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) processFile(file)
  }, [processFile])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'], 'application/vnd.ms-excel': ['.xls'] },
    multiple: false,
    maxSize: 50 * 1024 * 1024,
  })

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200',
          isDragActive
            ? 'border-brand-400 bg-brand-50'
            : status === 'success'
            ? 'border-brand-200 bg-brand-50/40'
            : status === 'error'
            ? 'border-red-200 bg-red-50/40'
            : 'border-border hover:border-brand-200 hover:bg-surface-1'
        )}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center gap-3">
          {status === 'loading' ? (
            <Loader2 className="w-10 h-10 text-brand-400 animate-spin" />
          ) : status === 'success' ? (
            <CheckCircle className="w-10 h-10 text-brand-400" />
          ) : status === 'error' ? (
            <XCircle className="w-10 h-10 text-red-500" />
          ) : (
            <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-brand-400" />
            </div>
          )}

          <div>
            <p className="font-medium text-ink-primary text-sm">
              {status === 'loading' ? 'Dosya işleniyor...' :
               status === 'success' ? 'Yükleme başarılı!' :
               status === 'error' ? 'Hata oluştu' :
               isDragActive ? 'Dosyayı bırakın' :
               'Excel dosyasını sürükleyin veya tıklayın'}
            </p>
            <p className="text-ink-tertiary text-xs mt-1">
              portföy_doc.xlsx · Maks. 50MB
            </p>
          </div>

          {status === 'idle' && (
            <button className="btn-secondary text-xs">
              <Upload className="w-3 h-3" />
              Dosya Seç
            </button>
          )}
        </div>
      </div>

      {/* Sheet results */}
      {results.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-ink-secondary uppercase tracking-wider">Sheet Sonuçları</p>
          {results.map((r, i) => (
            <div key={i} className={cn(
              'flex items-start gap-3 p-3 rounded-lg border text-sm',
              r.success ? 'bg-brand-50/50 border-brand-100' : 'bg-red-50 border-red-100'
            )}>
              {r.success
                ? <CheckCircle className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                : <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              }
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-ink-primary">{r.sheetName}</span>
                  <span className="text-xs text-ink-tertiary">{r.recordCount.toLocaleString('tr-TR')} kayıt</span>
                </div>
                {r.warnings.map((w, j) => (
                  <p key={j} className="text-[11px] text-amber-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {w}
                  </p>
                ))}
                {r.errors.map((e, j) => (
                  <p key={j} className="text-[11px] text-red-600 mt-1">{e}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          <strong>Hata:</strong> {errorMsg}
        </div>
      )}

      {/* Expected sheets info */}
      <div className="bg-surface-1 rounded-lg p-4 space-y-2">
        <p className="text-xs font-medium text-ink-secondary">Beklenen Sheet'ler</p>
        <div className="grid grid-cols-2 gap-1.5 text-[11px] text-ink-tertiary">
          {[
            ['IMS_Tr', 'IQVIA Türkiye (adet + TL)'],
            ['IMS_global', 'IQVIA Global (USD)'],
            ['titck_ruhsat', 'Ruhsatlı ürünler (~22K)'],
            ['titck_etken', 'Etkin maddeler (852)'],
            ['titck_takvimlendirme', 'Takvim listesi (36)'],
          ].map(([name, desc]) => (
            <div key={name} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-200 flex-shrink-0" />
              <span><strong className="text-ink-secondary">{name}</strong> — {desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
