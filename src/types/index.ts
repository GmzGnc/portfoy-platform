// ─────────────────────────────────────────────────────────────────────────────
// PORTFÖY PLATFORM — Merkezi Tip Tanımları
// Tüm veri kaynakları (Excel, Webservis, IQVIA API, Midas, TİTCK) bu tipler
// üzerinden normalize edilir. Adapter pattern kullanılır.
// ─────────────────────────────────────────────────────────────────────────────

// ── Kaynak Bilgisi ─────────────────────────────────────────────────────────
export type DataSourceType = 'excel_upload' | 'iqvia_api' | 'midas_api' | 'titck_api' | 'manual'

export interface DataSourceMeta {
  type: DataSourceType
  label: string
  lastUpdated: Date | null
  isConnected: boolean
  /** Gelecek: webservis endpoint */
  endpoint?: string
  /** Gelecek: API key / token config anahtarı */
  configKey?: string
}

// ── IQVIA Türkiye (IMS_Tr sheet) ──────────────────────────────────────────
export interface IqviaTrRecord {
  molecule: string         // Etkin madde (DULAGLUTIDE, SEMAGLUTIDE ...)
  brand?: string           // Marka adı (TRULICITY, OZEMPIC ...)
  year: number             // 2021, 2022, 2023, 2024
  period: 'annual' | 'ytd'
  ytdMonth?: number        // YTD ise kaçıncı ay (6 = Haziran)
  units: number            // Adet
  valueTL: number          // TL cinsinden satış
  atcCode?: string
  source: DataSourceMeta
}

// ── IQVIA Global (IMS_global sheet) ───────────────────────────────────────
export interface IqviaGlobalRecord {
  molecule: string
  region: string           // NORTH AMERICA, EUROPE - KEY 5, ASIA MAJOR ...
  year: number
  standardUnits: number
  valueUsdMnf: number      // Manufacturer price USD
  source: DataSourceMeta
}

// ── TİTCK Ruhsatlı Ürün ───────────────────────────────────────────────────
export interface TitckProduct {
  siraNo: number
  barcode: string
  productName: string
  activeIngredient: string
  atcCode: string
  licenseHolder: string
  licenseDate: Date | null
  licenseNumber: string
  changeDescription?: string
  changeDate?: Date | null
  /** 0=aktif, 1=madde-23, 2=farmakovij, 3=madde-22 */
  suspendStatus: 0 | 1 | 2 | 3
  suspendDate?: Date | null
  source: DataSourceMeta
}

// ── TİTCK Etkin Madde ─────────────────────────────────────────────────────
export interface TitckActiveIngredient {
  no: number
  name: string
  productCount: number
  source: DataSourceMeta
}

// ── TİTCK Takvimlendirme ──────────────────────────────────────────────────
export interface TitckScheduleItem {
  no: number
  activeIngredient: string
  expectedProductCount: number
  source: DataSourceMeta
}

// ── Normalize Edilmiş Pazar Verisi ────────────────────────────────────────
export interface MarketDataPoint {
  id: string
  molecule: string
  brand?: string
  year: number
  period: 'annual' | 'ytd'
  ytdMonth?: number
  market: 'TR' | 'GLOBAL'
  region?: string
  units?: number
  valueTL?: number
  valueUSD?: number
  atcCode?: string
  source: DataSourceType
}

// ── Molekül / Aday Ürün ───────────────────────────────────────────────────
export interface CandidateMolecule {
  id: string
  name: string                    // Uluslararası INN adı
  aliases: string[]               // Alternatif isimler
  brands: string[]                // Piyasadaki marka isimleri
  atcCodes: string[]
  indications: string[]           // Endikasyonlar
  mechanismOfAction?: string

  // Patent bilgisi
  patent: {
    status: 'protected' | 'expired' | 'expiring_soon' | 'unknown'
    expiryDate?: Date | null
    exclusivityEnd?: Date | null
    notes?: string
  }

  // TR Ruhsat
  trLicenseStatus: 'licensed' | 'pending' | 'not_licensed' | 'suspended'
  trLicenseDate?: Date | null
  isInTitckSchedule: boolean

  // Skor Kartı (0–100 arası)
  scores: {
    marketPotential: number      // Pazar potansiyeli
    growthMomentum: number       // Büyüme ivmesi
    patentRisk: number           // Patent riski (düşük = iyi, yüksek = engel)
    competitivePosition: number  // Rekabet durumu
    financialFit: number         // Finansal uyum (P&L)
    clinicalValue: number        // Klinik değer
    regulatoryStatus: number     // Ruhsat durumu
  }

  // Ağırlıklı toplam skor (dinamik hesaplanır)
  weightedScore?: number
  priority: 'high' | 'medium' | 'low' | 'watch'
  notes?: string
  lastUpdated: Date
}

// ── Değerlendirme Kriterleri & Ağırlıklar ────────────────────────────────
export interface EvaluationCriteria {
  id: keyof CandidateMolecule['scores']
  label: string
  description: string
  weight: number           // 0–100 (toplam 100 olmalı)
  category: 'market' | 'regulatory' | 'financial' | 'clinical'
}

// ── Uyarı Sistemi ─────────────────────────────────────────────────────────
export interface Alert {
  id: string
  type: 'critical' | 'warning' | 'info' | 'opportunity'
  title: string
  message: string
  molecule?: string
  source: DataSourceType
  createdAt: Date
  isRead: boolean
  action?: { label: string; href: string }
}

// ── Görev Takibi (Toplantı Kararları) ─────────────────────────────────────
export interface Task {
  id: string
  title: string
  description?: string
  assignees: string[]
  status: 'open' | 'in_progress' | 'done' | 'blocked'
  priority: 'high' | 'medium' | 'low'
  dueDate?: Date | null
  createdAt: Date
  tags: string[]
}

// ── Uygulama Genel State ──────────────────────────────────────────────────
export interface AppState {
  // Veri kaynakları
  dataSources: Record<DataSourceType, DataSourceMeta>

  // Yüklü veri
  iqviaTr: IqviaTrRecord[]
  iqviaGlobal: IqviaGlobalRecord[]
  titckProducts: TitckProduct[]
  titckIngredients: TitckActiveIngredient[]
  titckSchedule: TitckScheduleItem[]

  // Portföy
  candidates: CandidateMolecule[]
  criteria: EvaluationCriteria[]

  // UI
  alerts: Alert[]
  tasks: Task[]
  activeStage: number
  selectedMoleculeId: string | null
  isLoading: boolean
  uploadErrors: string[]
}

// ── Upload (Excel) ─────────────────────────────────────────────────────────
export interface ExcelUploadResult {
  success: boolean
  sheetName: string
  recordCount: number
  errors: string[]
  warnings: string[]
}

// ── API Response (Gelecek webservis için) ─────────────────────────────────
export interface ApiResponse<T> {
  data: T
  meta: {
    total: number
    page?: number
    pageSize?: number
    lastUpdated: string
    source: DataSourceType
  }
  errors?: string[]
}

// ── Filtreler ─────────────────────────────────────────────────────────────
export interface MarketFilter {
  molecules: string[]
  years: number[]
  markets: ('TR' | 'GLOBAL')[]
  regions: string[]
  atcCodes: string[]
}

export interface CandidateFilter {
  priority: CandidateMolecule['priority'][]
  patentStatus: CandidateMolecule['patent']['status'][]
  trLicenseStatus: CandidateMolecule['trLicenseStatus'][]
  minScore: number
}
