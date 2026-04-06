# Portföy Seçim Platformu

Ürün portföy değerlendirme ve aday analiz platformu. IQVIA TR/Global, TİTCK ve Midas verilerini bir araya getirir.

## Özellikler

- **IQVIA Türkiye** — GLP-1 segmenti, 2021–2025 YTD adet ve TL bazlı analiz
- **IQVIA Global** — Molekül karşılaştırması, bölge dağılımı, USD bazlı trend
- **Aday Değerlendirme** — Ağırlıklı skor, radar grafiği, patent analizi
- **Kriter Ağırlıklandırma** — Dinamik skor hesaplama, slider ile ağırlık ayarı
- **TİTCK Ruhsat** — 22.292 ürün, 852 etkin madde, takvimlendirme listesi
- **Görev Takibi** — Toplantı kararlarını kayıt altına al, takip et
- **Veri Kaynakları** — Excel upload şimdi, IQVIA/Midas/TİTCK API gelecekte

## Kurulum

```bash
# 1. Bağımlılıkları yükle
npm install

# 2. Ortam değişkenlerini hazırla
cp .env.example .env.local

# 3. Geliştirme sunucusunu başlat
npm run dev
```

Tarayıcıda `http://localhost:3000` adresini açın.

## Proje Yapısı

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Ana sayfa (routing)
│   └── globals.css         # Design system CSS
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx      # Üst bar (veri kaynak durumları)
│   │   └── Sidebar.tsx     # Sol menü
│   ├── ui/
│   │   └── ExcelUpload.tsx # Drag & drop Excel yükleyici
│   └── modules/
│       ├── IqviaTrPage.tsx      # IQVIA Türkiye analizi
│       ├── IqviaGlobalPage.tsx  # IQVIA Global analizi
│       ├── CandidatesPage.tsx   # Aday molekül değerlendirme
│       ├── CriteriaPage.tsx     # Kriter ağırlıklandırma
│       ├── TasksPage.tsx        # Görev takibi
│       ├── TitckPage.tsx        # TİTCK ruhsat takibi
│       ├── AlertsPage.tsx       # Uyarılar
│       ├── SourcesPage.tsx      # Veri kaynakları
│       └── UploadPage.tsx       # Excel yükleme
│
├── lib/
│   ├── adapters/index.ts   # Veri kaynak soyutlama (adapter pattern)
│   ├── parsers/
│   │   └── excelParser.ts  # Excel → TypeScript veri parse
│   └── utils/index.ts      # Yardımcı fonksiyonlar
│
├── store/index.ts           # Zustand global state
└── types/index.ts           # TypeScript tip tanımları
```

## Veri Akışı

```
Excel Upload (.xlsx)
    │
    ▼
excelParser.ts (sheet bazlı parse)
    │
    ├── IMS_Tr  → IqviaTrRecord[]
    ├── IMS_global → IqviaGlobalRecord[]
    ├── titck_ruhsat → TitckProduct[]
    ├── titck_etken → TitckActiveIngredient[]
    └── titck_takvimlendirme → TitckScheduleItem[]
                │
                ▼
        Zustand Store (global state)
                │
                ▼
        React Components (UI)
```

## API Entegrasyonu (Gelecek)

`src/lib/adapters/index.ts` dosyasındaki `AdapterRegistry` sınıfı, aktif adapter'ı otomatik seçer:

```typescript
// Şu an: Excel adapter
const iqvia = adapters.getActiveIqvia() // → ExcelIqviaAdapter

// NEXT_PUBLIC_IQVIA_API_URL set edilince:
const iqvia = adapters.getActiveIqvia() // → IqviaApiAdapter (otomatik geçiş)
```

## Cursor ile Kullanım

1. Bu klasörü Cursor'da açın
2. `npm install` çalıştırın
3. `npm run dev` ile başlatın
4. Sol sidebar'dan "Veri Yükle" → portföy_doc.xlsx dosyasını sürükleyin

## UP / CLM / RegTrack Entegrasyonu

Bu platform ileride UP, CLM ve RegTrack modülleriyle birleştirilecek şekilde tasarlanmıştır. Her modül bağımsız olarak geliştirilerek bu platforma adapter/plugin olarak eklenebilir.
