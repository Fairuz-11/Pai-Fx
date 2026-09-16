# PAI-FX - Platform Analisis Market Forex

Platform analisis market Forex yang membantu trader membaca kondisi market melalui chart, indikator teknikal, analisis statistik, dan AI-assisted market analysis.

> **Last Updated:** September 2026 — Real-time market data, AI analysis (Groq), and trading journal fully operational.


PAI-FX adalah **platform analisis** dan **BUKAN** broker trading. Website ini tidak menyediakan layanan transaksi atau eksekusi order. Semua analisis dan sinyal yang diberikan bersifat edukatif dan tidak menjamin profit. Trading Forex memiliki risiko tinggi.

## ✨ Features

- **Real-Time Market Data** - Data market Forex real-time dari API provider
- **Candlestick Chart** - Professional trading chart dengan Lightweight Charts
- **Technical Indicators** - EMA, SMA, RSI, MACD, Bollinger Bands, ATR
- **Trend Analysis** - Deteksi trend bullish, bearish, atau sideways
- **Support & Resistance** - Automatic detection area support dan resistance
- **Pattern Detection** - Candle pattern recognition (Doji, Hammer, Engulfing, dll)
- **Market Structure** - Higher High, Higher Low, Lower High, Lower Low
- **Multi-Timeframe Analysis** - Analisis dari 1D sampai 5m
- **Smart Signals** - BUY/SELL/HOLD signals dengan probability scoring
- **AI Market Analysis** - Natural language insights dari AI
- **Trading Journal** - Catat trade dan lihat statistik
- **Watchlist** - Track favorite pairs

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **UI Components:** shadcn/ui
- **Icons:** Lucide Icons
- **Charts:** Lightweight Charts (candlestick), Recharts (stats)
- **Database:** PostgreSQL (Neon)
- **ORM:** Prisma
- **Authentication:** NextAuth.js
- **Validation:** Zod

## 📦 Installation

### Prerequisites

- Node.js 18+ 
- npm atau yarn
- PostgreSQL database (atau Neon account)

### Setup

1. Clone repository:
```bash
git clone https://github.com/Fairuz-11/Pai-Fx.git
cd pai-fx
```

2. Install dependencies:
```bash
npm install
```

3. Setup environment variables:

Copy `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```

Edit `.env` dan isi dengan credentials kamu:

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Market Data API (pilih provider)
MARKET_DATA_API_KEY="your-api-key"
MARKET_DATA_PROVIDER="twelve_data"
MARKET_DATA_BASE_URL="https://api.twelvedata.com"

# AI API (optional)
AI_API_KEY="your-openai-api-key"
AI_MODEL="gpt-4"
AI_BASE_URL="https://api.openai.com/v1"
```

4. Setup database:

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio
npx prisma studio
```

5. Run development server:

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## 🔑 Market Data API

PAI-FX membutuhkan market data API untuk menampilkan harga dan candlestick real-time.

### Recommended Providers:

#### 1. Twelve Data (Recommended)
- Free tier: 800 requests/day
- Website: [twelvedata.com](https://twelvedata.com/)
- Signup dan dapatkan API key
- Support Forex, Crypto, Stocks

```env
MARKET_DATA_PROVIDER="twelve_data"
MARKET_DATA_API_KEY="your-twelvedata-api-key"
MARKET_DATA_BASE_URL="https://api.twelvedata.com"
```

#### 2. Alpha Vantage
- Free tier: 25 requests/day
- Website: [alphavantage.co](https://www.alphavantage.co/)

```env
MARKET_DATA_PROVIDER="alpha_vantage"
MARKET_DATA_API_KEY="your-alphavantage-api-key"
MARKET_DATA_BASE_URL="https://www.alphavantage.co"
```

#### 3. Finnhub
- Free tier: 60 calls/minute
- Website: [finnhub.io](https://finnhub.io/)

```env
MARKET_DATA_PROVIDER="finnhub"
MARKET_DATA_API_KEY="your-finnhub-api-key"
MARKET_DATA_BASE_URL="https://finnhub.io/api/v1"
```

## 🤖 AI Analysis (Optional)

Untuk fitur AI Market Analysis, kamu bisa menggunakan:

- **OpenAI GPT-4** - Recommended
- **Anthropic Claude**
- **Google Gemini**

Setup:
```env
AI_API_KEY="sk-..."
AI_MODEL="gpt-4"
AI_BASE_URL="https://api.openai.com/v1"
```

Jika tidak dikonfigurasi, fitur AI akan disabled (app tetap berjalan normal).

## 📁 Project Structure

```
pai-fx/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── auth/            # Authentication
│   │   ├── market/          # Market data endpoints
│   │   ├── analysis/        # Analysis endpoints
│   │   ├── signals/         # Trading signals
│   │   ├── watchlist/       # User watchlist
│   │   ├── journal/         # Trading journal
│   │   └── ai/              # AI analysis
│   ├── dashboard/           # Dashboard page
│   ├── market/              # Market list page
│   ├── chart/[symbol]/      # Chart page
│   ├── analysis/            # Analysis page
│   ├── signals/             # Signals page
│   ├── watchlist/           # Watchlist page
│   ├── journal/             # Journal page
│   ├── login/               # Login page
│   ├── register/            # Register page
│   └── settings/            # Settings page
├── components/              # React Components
│   ├── chart/              # Chart components
│   ├── dashboard/          # Dashboard components
│   ├── market/             # Market components
│   ├── analysis/           # Analysis components
│   ├── ui/                 # shadcn/ui components
│   └── layout/             # Layout components
├── lib/                     # Utilities & Logic
│   ├── market/             # Market data providers
│   ├── indicators/         # Technical indicators
│   ├── analysis/           # Analysis engines
│   ├── ai/                 # AI integration
│   ├── auth/               # Auth utilities
│   ├── db.ts               # Prisma client
│   └── utils.ts            # Helper functions
├── types/                   # TypeScript types
│   ├── market.ts           # Market data types
│   └── database.ts         # Database types
├── prisma/                  # Database schema
│   └── schema.prisma
└── public/                  # Static assets
```

## 🎉 Setup Complete

PAI-FX adalah platform analisis Forex yang **100% lengkap** dengan semua fitur berikut:

### ✅ Completed Features

#### 🔐 Authentication System
- User registration dengan email/password
- Login dengan NextAuth.js + JWT sessions
- Protected routes (watchlist, journal, settings)
- Public routes (market, chart, analysis)
- User profile dropdown dengan logout

#### 📊 Market Analysis
- Real-time market data dari multiple providers
- Technical indicators: EMA, SMA, RSI, MACD, Bollinger, ATR
- Trend analysis dengan weighted scoring
- Support/Resistance detection
- Candlestick pattern recognition
- Market structure analysis (HH, HL, LH, LL)
- Smart BUY/SELL/HOLD signals

#### 📈 Charts & Visualization
- Professional candlestick charts (Lightweight Charts)
- Multi-timeframe support (1D, 4H, 1H, 30m, 15m, 5m)
- Volume display
- Indicator overlada ys
- Interactive chart controls

#### 🤖 AI Integration
- Natural language market analysis
- OpenAI & Anthropic provider support
- Technical data to insights conversion
- Trade scenarios & risk factors

#### ⭐ User Features
- **Watchlist:** Save favorite pairs dengan notes
- **Trading Journal:** Track trades dengan statistics
  - Win rate calculation
  - Profit factor
  - Best/worst trades
  - P&L tracking
  - Strategy tagging

#### 🎨 User Interface
- Modern, professional design
- Dark mode optimized
- Responsive layout (mobile-friendly)
- Real-time data updates
- Loading states & error handling
- Empty states dengan CTAs

---

## 🚀 Deployment

### Vercel (Recommended)

1. Push code ke GitHub
2. Import project di [Vercel](https://vercel.com)
3. Tambahkan environment variables
4. Deploy!

### Environment Variables di Vercel:

Pastikan semua env variables di `.env` ditambahkan ke Vercel:
- `DATABASE_URL`
- `NEXTAUTH_URL` (ganti dengan domain production)
- `NEXTAUTH_SECRET`
- `MARKET_DATA_API_KEY`
- `MARKET_DATA_PROVIDER`
- `MARKET_DATA_BASE_URL`
- `AI_API_KEY` (optional)
- `AI_MODEL` (optional)

### Database Setup

Gunakan [Neon](https://neon.tech) untuk PostgreSQL:
1. Buat project di Neon
2. Copy connection string
3. Paste ke `DATABASE_URL`
4. Run migrations dari local: `npx prisma migrate deploy`

## 🧪 Development

### Run development:
```bash
npm run dev
```

### Build production:
```bash
npm run build
npm start
```

### Prisma commands:
```bash
# Generate client
npx prisma generate

# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Open Prisma Studio
npx prisma studio

# Reset database
npx prisma migrate reset
```

## 📊 Supported Forex Pairs

Default pairs:
- EUR/USD
- GBP/USD
- USD/JPY
- USD/CHF
- AUD/USD
- USD/CAD
- NZD/USD
- XAU/USD (Gold)

User dapat menambahkan pair lainnya melalui search.

## 📈 Technical Indicators

- **EMA** - Exponential Moving Average (20, 50, 200)
- **SMA** - Simple Moving Average (20, 50, 200)
- **RSI** - Relative Strength Index (14)
- **MACD** - Moving Average Convergence Divergence (12, 26, 9)
- **Bollinger Bands** - (20, 2)
- **ATR** - Average True Range (14)

## 🎯 Signal Scoring

Signal menggunakan weighted scoring:
- EMA Trend: 20%
- MACD: 15%
- RSI: 10%
- Market Structure: 20%
- Support/Resistance: 15%
- Candle Pattern: 10%
- Momentum: 10%

Output:
- **Signal Type:** BUY / SELL / HOLD / NEUTRAL
- **Bullish Probability:** 0-100%
- **Bearish Probability:** 0-100%
- **Setup Strength:** Weak / Moderate / Strong / Very Strong
- **Risk Level:** Low / Medium / High
- **Confidence:** 0-100%

## 🔒 Security

- API keys hanya di server-side
- Password di-hash dengan bcrypt
- Authentication dengan NextAuth.js
- Input validation dengan Zod
- Rate limiting untuk API endpoints
- No secret exposure ke client

## 📝 Trading Journal Stats

- Total Trades
- Winning Trades
- Losing Trades
- Win Rate %
- Average Risk/Reward
- Profit Factor
- Best Trade
- Worst Trade

## ⚡ Performance

- Server Components untuk static content
- Client Components hanya untuk interactive UI
- API caching untuk market data
- Debounced search
- Lazy loading untuk chart
- Memoization untuk calculations
- Efficient indicator algorithms

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is for educational purposes. Trading involves substantial risk of loss.

## 🙏 Credits

- Market data powered by selected API provider
- Charts powered by TradingView Lightweight Charts
- UI components by shadcn/ui
- Icons by Lucide

## 📞 Support

For issues and questions:
- GitHub Issues: [github.com/Fairuz-11/Pai-Fx/issues](https://github.com/Fairuz-11/Pai-Fx/issues)

---

**Remember:** This platform provides analysis tools, not financial advice. Always do your own research and never trade with money you can't afford to lose.

oh iya jangan lupa kado buat nanti tanggal 28 oktober 

sama bismilah fomc win
