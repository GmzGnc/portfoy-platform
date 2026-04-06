// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL STORE — Zustand
// ─────────────────────────────────────────────────────────────────────────────

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type {
  AppState,
  CandidateMolecule,
  EvaluationCriteria,
  Alert,
  Task,
  IqviaTrRecord,
  IqviaGlobalRecord,
  TitckProduct,
  TitckActiveIngredient,
  TitckScheduleItem,
  DataSourceType,
} from '@/types'

// ── Default Değerlendirme Kriterleri ──────────────────────────────────────

const defaultCriteria: EvaluationCriteria[] = [
  { id: 'marketPotential',     label: 'Pazar Potansiyeli',      description: 'IQVIA TR ve global hacim, büyüme hızı, segment büyüklüğü',             weight: 25, category: 'market' },
  { id: 'patentRisk',          label: 'Patent Durumu',           description: 'Patent bitiş tarihi, ruhsat engelleri, pazar giriş zamanlaması',        weight: 25, category: 'regulatory' },
  { id: 'financialFit',        label: 'Finansal Fizibilite',     description: 'P&L tahmini, maliyet hesabı (Gamze/Sercan), risk değerlendirmesi',       weight: 20, category: 'financial' },
  { id: 'competitivePosition', label: 'Rekabet Analizi',         description: 'Mevcut rakipler, rakip analizi, ATC bazlı segmentasyon',                 weight: 15, category: 'market' },
  { id: 'clinicalValue',       label: 'Klinik & Medikal Değer',  description: 'Endikasyon, güvenlilik profili, klinik fark, medikal değer',             weight: 10, category: 'clinical' },
  { id: 'regulatoryStatus',    label: 'TR Ruhsat & Takvim',      description: 'TİTCK ruhsat durumu, takvimlendirme listesi, hukuki durum',              weight: 5,  category: 'regulatory' },
]

// ── Default Aday Moleküller (GLP-1 segmenti) ──────────────────────────────

const defaultCandidates: CandidateMolecule[] = [
  {
    id: 'tirzepatide',
    name: 'Tirzepatide',
    aliases: ['LY3298176'],
    brands: ['Mounjaro', 'Zepbound'],
    atcCodes: ['A10BX16'],
    indications: ['Tip 2 Diyabet', 'Obezite'],
    mechanismOfAction: 'GIP + GLP-1 Dual Agonist',
    patent: { status: 'protected', expiryDate: new Date('2036-05-01'), notes: 'Eli Lilly patenti - 2036 tahmini' },
    trLicenseStatus: 'licensed',
    trLicenseDate: new Date('2025-03-26'),
    isInTitckSchedule: false,
    scores: { marketPotential: 95, growthMomentum: 95, patentRisk: 15, competitivePosition: 82, financialFit: 70, clinicalValue: 90, regulatoryStatus: 90 },
    priority: 'high',
    notes: 'Global 2024: 25.2B USD. TR\'de Mart 2025 ruhsat. YTD 34K adet, 287M TL.',
    lastUpdated: new Date(),
  },
  {
    id: 'exenatide',
    name: 'Exenatide',
    aliases: ['AC2993'],
    brands: ['Byetta', 'Bydureon'],
    atcCodes: ['A10BX04'],
    indications: ['Tip 2 Diyabet'],
    mechanismOfAction: 'GLP-1 Reseptör Agonisti',
    patent: { status: 'expired', expiryDate: new Date('2018-01-01'), notes: 'Patent sona erdi - jenerik üretim mümkün' },
    trLicenseStatus: 'licensed',
    trLicenseDate: new Date('2010-01-01'),
    isInTitckSchedule: false,
    scores: { marketPotential: 45, growthMomentum: 20, patentRisk: 90, competitivePosition: 35, financialFit: 75, clinicalValue: 60, regulatoryStatus: 95 },
    priority: 'watch',
    notes: 'TR\'de stabil 117K adet/yıl. Global gerileme: -37% (2022→2024). Jenerik fırsatı.',
    lastUpdated: new Date(),
  },
  {
    id: 'semaglutide',
    name: 'Semaglutide',
    aliases: ['Ozempic', 'Rybelsus', 'Wegovy'],
    brands: ['Ozempic', 'Rybelsus', 'Wegovy'],
    atcCodes: ['A10BJ06', 'A10BX13'],
    indications: ['Tip 2 Diyabet', 'Obezite', 'Kardiyovasküler Risk'],
    mechanismOfAction: 'GLP-1 Reseptör Agonisti',
    patent: { status: 'protected', expiryDate: new Date('2033-01-01'), notes: 'Novo Nordisk - çok güçlü patent portföyü' },
    trLicenseStatus: 'licensed',
    trLicenseDate: new Date('2024-01-01'),
    isInTitckSchedule: false,
    scores: { marketPotential: 100, growthMomentum: 100, patentRisk: 5, competitivePosition: 95, financialFit: 30, clinicalValue: 98, regulatoryStatus: 100 },
    priority: 'watch',
    notes: 'TR YTD 2025: 1.124B TL, 184K adet. Global 45.5B USD. Lisans almak son derece zor.',
    lastUpdated: new Date(),
  },
  {
    id: 'dulaglutide',
    name: 'Dulaglutide',
    aliases: ['LY2189265'],
    brands: ['Trulicity'],
    atcCodes: ['A10BJ05'],
    indications: ['Tip 2 Diyabet'],
    mechanismOfAction: 'GLP-1 Reseptör Agonisti (haftada 1)',
    patent: { status: 'expiring_soon', expiryDate: new Date('2027-06-01'), notes: 'Eli Lilly - 2027 civarı bitiş bekleniyor' },
    trLicenseStatus: 'licensed',
    trLicenseDate: new Date('2015-01-01'),
    isInTitckSchedule: false,
    scores: { marketPotential: 30, growthMomentum: 15, patentRisk: 45, competitivePosition: 25, financialFit: 60, clinicalValue: 70, regulatoryStatus: 90 },
    priority: 'low',
    notes: 'TR\'de gerileme: 22K adet (2024). Global -23.3% (2023→2024). Semaglutide baskısı.',
    lastUpdated: new Date(),
  },
  {
    id: 'liraglutide',
    name: 'Liraglutide',
    aliases: ['NN2211'],
    brands: ['Victoza', 'Saxenda'],
    atcCodes: ['A10BX07'],
    indications: ['Tip 2 Diyabet', 'Obezite'],
    mechanismOfAction: 'GLP-1 Reseptör Agonisti',
    patent: { status: 'expired', expiryDate: new Date('2023-01-01'), notes: 'Patent sona erdi' },
    trLicenseStatus: 'licensed',
    trLicenseDate: new Date('2012-01-01'),
    isInTitckSchedule: false,
    scores: { marketPotential: 15, growthMomentum: 5, patentRisk: 88, competitivePosition: 20, financialFit: 55, clinicalValue: 65, regulatoryStatus: 85 },
    priority: 'low',
    notes: 'TR\'de dramatik düşüş: 35K (2021) → 3.6K adet (2025 YTD). Semaglutide baskısı çok güçlü.',
    lastUpdated: new Date(),
  },
]

// ── Default Tasks ─────────────────────────────────────────────────────────

const defaultTasks: Task[] = [
  { id: 't1', title: 'Ortak veri alanı oluşturulması ve örnek data paylaşımı', assignees: ['Gizem', 'Hakan'], status: 'open', priority: 'high', createdAt: new Date(), tags: ['veri', 'altyapı'] },
  { id: 't2', title: 'Data paketlerinin seçilmesi ve kolon açıklamaları', assignees: ['Gizem', 'Hakan'], status: 'open', priority: 'high', createdAt: new Date(), tags: ['veri'] },
  { id: 't3', title: 'Patent ana verisi dökümanlarının temini', description: 'Ahmet Fatih Ertem\'den patent dokümantasyonu alınacak', assignees: ['Humanis'], status: 'open', priority: 'medium', createdAt: new Date(), tags: ['patent'] },
  { id: 't4', title: 'API/robot ile otomatik veri çekme değerlendirmesi', description: 'IQVIA, Midas, TİTCK için otomasyon imkânı', assignees: ['Humanis'], status: 'in_progress', priority: 'high', createdAt: new Date(), tags: ['teknik', 'otomasyon'] },
  { id: 't5', title: 'Haftalık rutin toplantı planlaması', assignees: ['Hakan', 'Humanis', 'Gizem', 'Gamze'], status: 'open', priority: 'low', createdAt: new Date(), tags: ['yönetim'] },
  { id: 't6', title: 'P&L ve maliyet hesaplama modülü entegrasyonu', description: 'Gamze ve Sercan\'ın çalışmaları platforma eklenecek', assignees: ['Gamze', 'Sercan'], status: 'open', priority: 'medium', createdAt: new Date(), tags: ['finansal'] },
]

// ── Default Alerts ────────────────────────────────────────────────────────

const defaultAlerts: Alert[] = [
  { id: 'a1', type: 'critical', title: 'Semaglutide pazar hızlanması', message: 'YTD 2025 satışı 1.124B TL — 2024 yıllığının 4.8 katı. Lisans fırsatı penceresi kısalıyor.', molecule: 'Semaglutide', source: 'excel_upload', createdAt: new Date(), isRead: false },
  { id: 'a2', type: 'critical', title: 'Tirzepatide TR girişi tamamlandı', message: 'Mounjaro 34K adet, 287M TL — GIP+GLP-1 dual agonist. Mart 2025 ruhsat. Hızlı büyüme bekleniyor.', molecule: 'Tirzepatide', source: 'excel_upload', createdAt: new Date(), isRead: false },
  { id: 'a3', type: 'warning', title: 'Liraglutide dramatik gerileme', message: '2021\'de 35K adet olan Victoza, YTD 2025\'te 3.6K adete düştü (-89.7%). Jenerik değerlendirilebilir.', molecule: 'Liraglutide', source: 'excel_upload', createdAt: new Date(), isRead: false },
  { id: 'a4', type: 'opportunity', title: 'Exenatide: TR stabil, patent sona erdi', message: 'Global gerilemeye rağmen TR\'de 117K adet/yıl stabil. Patent sona erdi — jenerik fırsatı var.', molecule: 'Exenatide', source: 'excel_upload', createdAt: new Date(), isRead: true },
  { id: 'a5', type: 'info', title: 'TİTCK 22 yeni ruhsat (Temmuz 2025)', message: 'Ritlesitinib, Tezepelumab, Mepolizumab dahil 22 yeni ruhsat eklendi. Tirzepatide Kwikpen da listede.', source: 'titck_api', createdAt: new Date(), isRead: true },
  { id: 'a6', type: 'info', title: 'Global GLP-1 pazarı 85.5B USD (2024)', message: 'Semaglutide 45.5B$, Tirzepatide 25.2B$. Toplam pazar 2022\'den %88 büyüdü.', source: 'excel_upload', createdAt: new Date(), isRead: true },
]

// ── Store ─────────────────────────────────────────────────────────────────

interface StoreActions {
  // Veri yükleme
  setIqviaTr(data: IqviaTrRecord[]): void
  setIqviaGlobal(data: IqviaGlobalRecord[]): void
  setTitckProducts(data: TitckProduct[]): void
  setTitckIngredients(data: TitckActiveIngredient[]): void
  setTitckSchedule(data: TitckScheduleItem[]): void
  setDataSourceConnected(source: DataSourceType, connected: boolean): void

  // Portföy
  addCandidate(mol: CandidateMolecule): void
  updateCandidate(id: string, partial: Partial<CandidateMolecule>): void
  removeCandidate(id: string): void
  selectMolecule(id: string | null): void
  updateCriteriaWeight(id: string, weight: number): void
  recalculateScores(): void

  // Görevler
  updateTask(id: string, partial: Partial<Task>): void
  addTask(task: Task): void

  // Alerts
  markAlertRead(id: string): void

  // UI
  setActiveStage(stage: number): void
  setLoading(loading: boolean): void
  addUploadError(error: string): void
  clearUploadErrors(): void
}

type Store = AppState & StoreActions

const initialState: AppState = {
  dataSources: {
    excel_upload: { type: 'excel_upload', label: 'Excel Yükleme', lastUpdated: null, isConnected: false },
    iqvia_api: { type: 'iqvia_api', label: 'IQVIA API', lastUpdated: null, isConnected: false, endpoint: process.env.NEXT_PUBLIC_IQVIA_API_URL },
    midas_api: { type: 'midas_api', label: 'Midas', lastUpdated: null, isConnected: false, endpoint: process.env.NEXT_PUBLIC_MIDAS_URL },
    titck_api: { type: 'titck_api', label: 'TİTCK API', lastUpdated: null, isConnected: false, endpoint: 'https://www.titck.gov.tr/api' },
    manual: { type: 'manual', label: 'Manuel Giriş', lastUpdated: null, isConnected: true },
  },
  iqviaTr: [],
  iqviaGlobal: [],
  titckProducts: [],
  titckIngredients: [],
  titckSchedule: [],
  candidates: defaultCandidates,
  criteria: defaultCriteria,
  alerts: defaultAlerts,
  tasks: defaultTasks,
  activeStage: 0,
  selectedMoleculeId: null,
  isLoading: false,
  uploadErrors: [],
}

// Ağırlıklı skor hesapla
function computeWeightedScore(mol: CandidateMolecule, criteria: EvaluationCriteria[]): number {
  const totalWeight = criteria.reduce((s, c) => s + c.weight, 0)
  if (totalWeight === 0) return 0
  const raw = criteria.reduce((sum, c) => {
    const score = mol.scores[c.id as keyof CandidateMolecule['scores']] ?? 50
    // patentRisk için tersine çevir (düşük risk = yüksek puan)
    const adjusted = c.id === 'patentRisk' ? 100 - score : score
    return sum + adjusted * c.weight
  }, 0)
  return Math.round(raw / totalWeight)
}

export const useStore = create<Store>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        setIqviaTr: (data) => set({ iqviaTr: data }),
        setIqviaGlobal: (data) => set({ iqviaGlobal: data }),
        setTitckProducts: (data) => set({ titckProducts: data }),
        setTitckIngredients: (data) => set({ titckIngredients: data }),
        setTitckSchedule: (data) => set({ titckSchedule: data }),

        setDataSourceConnected: (source, connected) =>
          set(state => ({
            dataSources: {
              ...state.dataSources,
              [source]: { ...state.dataSources[source], isConnected: connected, lastUpdated: connected ? new Date() : null },
            },
          })),

        addCandidate: (mol) =>
          set(state => ({
            candidates: [...state.candidates, { ...mol, weightedScore: computeWeightedScore(mol, state.criteria) }],
          })),

        updateCandidate: (id, partial) =>
          set(state => ({
            candidates: state.candidates.map(c =>
              c.id === id ? { ...c, ...partial, weightedScore: computeWeightedScore({ ...c, ...partial }, state.criteria) } : c
            ),
          })),

        removeCandidate: (id) =>
          set(state => ({ candidates: state.candidates.filter(c => c.id !== id) })),

        selectMolecule: (id) => set({ selectedMoleculeId: id }),

        updateCriteriaWeight: (id, weight) =>
          set(state => ({
            criteria: state.criteria.map(c => c.id === id ? { ...c, weight } : c),
          })),

        recalculateScores: () => {
          const { candidates, criteria } = get()
          set({
            candidates: candidates.map(c => ({
              ...c,
              weightedScore: computeWeightedScore(c, criteria),
            })).sort((a, b) => (b.weightedScore ?? 0) - (a.weightedScore ?? 0)),
          })
        },

        updateTask: (id, partial) =>
          set(state => ({ tasks: state.tasks.map(t => t.id === id ? { ...t, ...partial } : t) })),

        addTask: (task) => set(state => ({ tasks: [...state.tasks, task] })),

        markAlertRead: (id) =>
          set(state => ({ alerts: state.alerts.map(a => a.id === id ? { ...a, isRead: true } : a) })),

        setActiveStage: (stage) => set({ activeStage: stage }),
        setLoading: (loading) => set({ isLoading: loading }),
        addUploadError: (error) => set(state => ({ uploadErrors: [...state.uploadErrors, error] })),
        clearUploadErrors: () => set({ uploadErrors: [] }),
      }),
      {
        name: 'portfoy-store',
        partialize: (state) => ({
          candidates: state.candidates,
          criteria: state.criteria,
          tasks: state.tasks,
          alerts: state.alerts,
        }),
      }
    ),
    { name: 'Portföy Store' }
  )
)
