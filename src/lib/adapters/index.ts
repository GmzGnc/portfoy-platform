// ─────────────────────────────────────────────────────────────────────────────
// ADAPTER LAYER — Veri Kaynak Soyutlama
//
// Her veri kaynağı (Excel, IQVIA API, Midas API, TİTCK API) aynı interface'i
// implement eder. Şimdilik Excel/mock; gelecekte webservis geçişi sadece
// adapter değişimi ile olur — consuming code değişmez.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  IqviaTrRecord,
  IqviaGlobalRecord,
  TitckProduct,
  TitckActiveIngredient,
  TitckScheduleItem,
  DataSourceMeta,
  DataSourceType,
  ApiResponse,
} from '@/types'

// ── Base Adapter Interface ─────────────────────────────────────────────────

export interface IDataAdapter {
  readonly sourceType: DataSourceType
  readonly meta: DataSourceMeta
  testConnection(): Promise<boolean>
}

export interface IIqviaAdapter extends IDataAdapter {
  getTurkeyData(options?: { year?: number; molecule?: string }): Promise<IqviaTrRecord[]>
  getGlobalData(options?: { year?: number; molecule?: string; region?: string }): Promise<IqviaGlobalRecord[]>
}

export interface ITitckAdapter extends IDataAdapter {
  getProducts(options?: { atcCode?: string; activeIngredient?: string }): Promise<TitckProduct[]>
  getActiveIngredients(): Promise<TitckActiveIngredient[]>
  getScheduleList(): Promise<TitckScheduleItem[]>
}

// ── Excel Upload Adapter (Şu anki implementasyon) ─────────────────────────

export class ExcelIqviaAdapter implements IIqviaAdapter {
  readonly sourceType: DataSourceType = 'excel_upload'
  readonly meta: DataSourceMeta = {
    type: 'excel_upload',
    label: 'Excel Yükleme',
    lastUpdated: null,
    isConnected: false,
    endpoint: undefined,
  }

  private trData: IqviaTrRecord[] = []
  private globalData: IqviaGlobalRecord[] = []

  async testConnection(): Promise<boolean> {
    return true // Excel için her zaman true
  }

  loadFromParsed(tr: IqviaTrRecord[], global: IqviaGlobalRecord[]) {
    this.trData = tr
    this.globalData = global
    this.meta.lastUpdated = new Date()
    this.meta.isConnected = true
  }

  async getTurkeyData(options?: { year?: number; molecule?: string }): Promise<IqviaTrRecord[]> {
    let data = [...this.trData]
    if (options?.year) data = data.filter(r => r.year === options.year)
    if (options?.molecule) data = data.filter(r => r.molecule.toLowerCase().includes(options.molecule!.toLowerCase()))
    return data
  }

  async getGlobalData(options?: { year?: number; molecule?: string; region?: string }): Promise<IqviaGlobalRecord[]> {
    let data = [...this.globalData]
    if (options?.year) data = data.filter(r => r.year === options.year)
    if (options?.molecule) data = data.filter(r => r.molecule.toLowerCase().includes(options.molecule!.toLowerCase()))
    if (options?.region) data = data.filter(r => r.region.toLowerCase().includes(options.region!.toLowerCase()))
    return data
  }
}

// ── IQVIA REST API Adapter (Gelecek — stub) ───────────────────────────────

export class IqviaApiAdapter implements IIqviaAdapter {
  readonly sourceType: DataSourceType = 'iqvia_api'
  readonly meta: DataSourceMeta
  private baseUrl: string
  private apiKey: string

  constructor(config: { baseUrl: string; apiKey: string; label?: string }) {
    this.baseUrl = config.baseUrl
    this.apiKey = config.apiKey
    this.meta = {
      type: 'iqvia_api',
      label: config.label ?? 'IQVIA API',
      lastUpdated: null,
      isConnected: false,
      endpoint: config.baseUrl,
      configKey: 'IQVIA_API_KEY',
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/ping`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      })
      this.meta.isConnected = res.ok
      return res.ok
    } catch {
      this.meta.isConnected = false
      return false
    }
  }

  async getTurkeyData(options?: { year?: number; molecule?: string }): Promise<IqviaTrRecord[]> {
    const params = new URLSearchParams()
    if (options?.year) params.set('year', String(options.year))
    if (options?.molecule) params.set('molecule', options.molecule)

    const res = await fetch(`${this.baseUrl}/turkey/sales?${params}`, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    })
    if (!res.ok) throw new Error(`IQVIA API hata: ${res.status}`)
    const json: ApiResponse<IqviaTrRecord[]> = await res.json()
    this.meta.lastUpdated = new Date(json.meta.lastUpdated)
    return json.data
  }

  async getGlobalData(options?: { year?: number; molecule?: string; region?: string }): Promise<IqviaGlobalRecord[]> {
    const params = new URLSearchParams()
    if (options?.year) params.set('year', String(options.year))
    if (options?.molecule) params.set('molecule', options.molecule)
    if (options?.region) params.set('region', options.region)

    const res = await fetch(`${this.baseUrl}/global/sales?${params}`, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    })
    if (!res.ok) throw new Error(`IQVIA API hata: ${res.status}`)
    const json: ApiResponse<IqviaGlobalRecord[]> = await res.json()
    return json.data
  }
}

// ── Midas API Adapter (Gelecek — stub) ────────────────────────────────────

export class MidasApiAdapter {
  readonly sourceType: DataSourceType = 'midas_api'
  readonly meta: DataSourceMeta
  private baseUrl: string
  private username: string
  private password: string
  private sessionToken: string | null = null

  constructor(config: { baseUrl: string; username: string; password: string }) {
    this.baseUrl = config.baseUrl
    this.username = config.username
    this.password = config.password
    this.meta = {
      type: 'midas_api',
      label: 'Midas',
      lastUpdated: null,
      isConnected: false,
      endpoint: config.baseUrl,
      configKey: 'MIDAS_CREDENTIALS',
    }
  }

  /** Midas kullanıcı adı/şifre ile oturum açar (robot/bot yaklaşımı) */
  async login(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: this.username, password: this.password }),
      })
      if (!res.ok) return false
      const data = await res.json()
      this.sessionToken = data.token
      this.meta.isConnected = true
      return true
    } catch {
      return false
    }
  }

  async testConnection(): Promise<boolean> {
    return this.login()
  }

  async getSalesForecast(params: { molecule: string; months: number }) {
    if (!this.sessionToken) await this.login()
    const res = await fetch(
      `${this.baseUrl}/forecast?molecule=${params.molecule}&months=${params.months}`,
      { headers: { Authorization: `Bearer ${this.sessionToken}` } }
    )
    if (!res.ok) throw new Error(`Midas API hata: ${res.status}`)
    return res.json()
  }
}

// ── TİTCK API Adapter (Gelecek — resmi API açıldığında) ───────────────────

export class TitckApiAdapter implements ITitckAdapter {
  readonly sourceType: DataSourceType = 'titck_api'
  readonly meta: DataSourceMeta = {
    type: 'titck_api',
    label: 'TİTCK API',
    lastUpdated: null,
    isConnected: false,
    endpoint: 'https://www.titck.gov.tr/api',
    configKey: 'TITCK_API_KEY',
  }

  async testConnection(): Promise<boolean> {
    // TİTCK henüz kamuya açık API sunmuyor; DB bağlantısı gerektirir
    return false
  }

  async getProducts(): Promise<TitckProduct[]> {
    throw new Error('TİTCK API henüz aktif değil — Excel yükleme kullanın')
  }

  async getActiveIngredients(): Promise<TitckActiveIngredient[]> {
    throw new Error('TİTCK API henüz aktif değil')
  }

  async getScheduleList(): Promise<TitckScheduleItem[]> {
    throw new Error('TİTCK API henüz aktif değil')
  }
}

// ── Excel TİTCK Adapter ───────────────────────────────────────────────────

export class ExcelTitckAdapter implements ITitckAdapter {
  readonly sourceType: DataSourceType = 'excel_upload'
  readonly meta: DataSourceMeta = {
    type: 'excel_upload',
    label: 'TİTCK Excel',
    lastUpdated: null,
    isConnected: false,
  }

  private products: TitckProduct[] = []
  private ingredients: TitckActiveIngredient[] = []
  private schedule: TitckScheduleItem[] = []

  async testConnection(): Promise<boolean> { return true }

  loadFromParsed(
    products: TitckProduct[],
    ingredients: TitckActiveIngredient[],
    schedule: TitckScheduleItem[]
  ) {
    this.products = products
    this.ingredients = ingredients
    this.schedule = schedule
    this.meta.lastUpdated = new Date()
    this.meta.isConnected = true
  }

  async getProducts(options?: { atcCode?: string; activeIngredient?: string }): Promise<TitckProduct[]> {
    let data = [...this.products]
    if (options?.atcCode) data = data.filter(p => p.atcCode?.startsWith(options.atcCode!))
    if (options?.activeIngredient) {
      const q = options.activeIngredient.toLowerCase()
      data = data.filter(p => p.activeIngredient.toLowerCase().includes(q))
    }
    return data
  }

  async getActiveIngredients(): Promise<TitckActiveIngredient[]> {
    return [...this.ingredients]
  }

  async getScheduleList(): Promise<TitckScheduleItem[]> {
    return [...this.schedule]
  }
}

// ── Adapter Registry (singleton) ──────────────────────────────────────────

class AdapterRegistry {
  private static instance: AdapterRegistry
  public iqviaExcel = new ExcelIqviaAdapter()
  public titckExcel = new ExcelTitckAdapter()

  // Gelecek: API adapterleri env'den okur
  public iqviaApi: IqviaApiAdapter | null = process.env.NEXT_PUBLIC_IQVIA_API_URL
    ? new IqviaApiAdapter({
        baseUrl: process.env.NEXT_PUBLIC_IQVIA_API_URL,
        apiKey: process.env.IQVIA_API_KEY ?? '',
      })
    : null

  public midasApi: MidasApiAdapter | null = process.env.NEXT_PUBLIC_MIDAS_URL
    ? new MidasApiAdapter({
        baseUrl: process.env.NEXT_PUBLIC_MIDAS_URL,
        username: process.env.MIDAS_USERNAME ?? '',
        password: process.env.MIDAS_PASSWORD ?? '',
      })
    : null

  static getInstance(): AdapterRegistry {
    if (!AdapterRegistry.instance) AdapterRegistry.instance = new AdapterRegistry()
    return AdapterRegistry.instance
  }

  /** Aktif IQVIA adapter: API varsa API, yoksa Excel */
  getActiveIqvia(): IIqviaAdapter {
    return this.iqviaApi ?? this.iqviaExcel
  }

  /** Aktif TİTCK adapter */
  getActiveTitck(): ITitckAdapter {
    return this.titckExcel
  }
}

export const adapters = AdapterRegistry.getInstance()
