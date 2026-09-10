# PAI-FX - Development Guide

## 🎯 Project Status: 70% Complete (7/10 Tasks)

PAI-FX adalah platform analisis market Forex profesional yang membantu trader membaca kondisi market melalui chart, indikator teknikal, analisis statistik, dan AI-assisted analysis.

---

## ✅ Completed Features (7/10)

### 1. ✓ Market Data API Infrastructure
**Status:** Production Ready

- **Provider Abstraction Layer** - Easily switch between providers
- **3 Market Data Providers:**
  - `TwelveDataProvider` - Real production data (800 req/day free)
  - `AlphaVantageProvider` - Alternative provider (25 req/day free)
  - `MockProvider` - Development/testing with realistic data
- **API Endpoints:**
  - `GET /api/market` - List all major pairs with quotes
  - `GET /api/market/quote?symbol={symbol}` - Real-time quote
  - `GET /api/market/candles?symbol={symbol}&timeframe={tf}&limit={n}` - Historical candles
  - `GET /api/market/search?q={query}` - Search symbols
- **Features:**
  - In-memory caching with TTL
  - Exponential backoff retry logic
  - Rate limit handling
  - Error handling & graceful degradation

**Files:**
- `lib/market/` - All provider implementations
- `app/api/market/` - API endpoints

---

### 2. ✓ Technical Indicators Engine
**Status:** Production Ready

All indicators calculated with accurate algorithms:

**Moving Averages:**
- EMA (20, 50, 200) with crossover detection
- SMA (20, 50, 200)

**Oscillators:**
- RSI (14) - Overbought/Oversold + Divergence detection
- MACD (12, 26, 9) - Histogram + Crossover signals

**Volatility:**
- Bollinger Bands (20, 2) - Squeeze detection
- ATR (14) - Volatility levels for stop loss calculation

**Files:**
- `lib/indicators/` - All indicator implementations
- Each indicator has: calculation, latest value getter, and helper functions

---

### 3. ✓ Professional Chart Component
**Status:** Production Ready

Built with **TradingView Lightweight Charts**

**Features:**
- Candlestick chart with volume histogram
- Multi-timeframe: 1m, 5m, 15m, 30m, 1h, 4h, 1D, 1W
- Indicator overlay panel (toggle on/off)
- Refresh & fullscreen controls
- Crosshair with tooltip
- Auto-fit content
- Responsive design
- Dark trading terminal theme

**Components:**
- `CandlestickChart` - Main chart component
- `ChartToolbar` - Timeframe selector & controls
- `IndicatorPanel` - Indicator toggles
- `ChartContainer` - Wrapper with state management

**Files:**
- `components/chart/` - Chart components
- `app/chart/[symbol]/page.tsx` - Chart page

---

### 4. ✓ Trend Analysis & Signal Scoring
**Status:** Production Ready

**Trend Analysis:**
- EMA alignment detection (20 > 50 > 200)
- Market structure analysis (HH, HL, LH, LL)
- Price structure evaluation
- Momentum scoring
- Trend strength: Weak / Moderate / Strong / Very Strong

**Signal Scoring System (Weighted):**
```
EMA Trend             20%
MACD                  15%
RSI                   10%
Market Structure      20%
Support/Resistance    15%
Candle Patterns       10%
Momentum              10%
────────────────────────
Total                100%
```

**Output:**
- Signal Type: **BUY** / **SELL** / **HOLD** / **NEUTRAL**
- Bullish Probability: 0-100%
- Bearish Probability: 0-100%
- Setup Strength: Weak / Moderate / Strong / Very Strong
- Risk Level: Low / Medium / High
- Confidence Score: 0-100%

**Files:**
- `lib/analysis/trend-analysis.ts`
- `lib/analysis/signal-scoring.ts`

---

### 5. ✓ Support/Resistance & Pattern Recognition
**Status:** Production Ready

**Support & Resistance Detection:**
- Swing high/low identification
- Level clustering algorithm (groups nearby levels)
- Touch counting & strength assessment
- Zone-based levels (not single price)
- Nearest support/resistance finder

**Market Structure Analysis:**
- **HH** (Higher High) - Bullish
- **HL** (Higher Low) - Bullish
- **LH** (Lower High) - Bearish
- **LL** (Lower Low) - Bearish
- Break of Structure (BOS) detection

**Candlestick Pattern Recognition:**
- Doji
- Hammer / Inverted Hammer
- Shooting Star
- Bullish / Bearish Engulfing
- Morning Star / Evening Star
- Pin Bar

**Files:**
- `lib/analysis/support-resistance.ts`
- `lib/analysis/market-structure.ts`
- `lib/analysis/pattern-recognition.ts`

---

### 6. ✓ Market Page with Data Table
**Status:** Production Ready

Professional market overview page with:

**Features:**
- Real-time price table for all major pairs
- Search functionality
- Sortable columns: Symbol, Price, Change, Confidence
- Filters: All / Bullish / Bearish
- Trend indicators with icons
- Quick chart access
- Auto-refresh option
- Market statistics

**Files:**
- `components/market/market-table.tsx`
- `app/market/page.tsx`

---

### 7. ✓ Comprehensive Analysis Page
**Status:** Production Ready

Full-featured analysis dashboard:

**Components:**
1. **Analysis Header** - Symbol picker, timeframe selector, refresh
2. **Price Overview** - Current price, change, timeframe info
3. **Signal Card** - BUY/SELL signal with probabilities, confidence, risk
4. **Trend Card** - Direction, strength, momentum, EMA alignment
5. **Indicators Card** - All technical indicators (EMA, RSI, MACD, Bollinger, ATR)
6. **Support/Resistance Card** - Zones, strength, nearest levels
7. **Market Structure** - HH/HL/LH/LL patterns
8. **Candlestick Patterns** - Detected patterns with type and strength

**Files:**
- `components/analysis/` - All analysis components
- `app/analysis/page.tsx` - Analysis page
- `app/api/analysis/route.ts` - Analysis API

---

## 🚧 Remaining Tasks (3/10)

### 8. ⏳ AI Market Analysis Integration
**Status:** Not Started

**Goal:** Add natural language insights powered by AI

**Requirements:**
- OpenAI / Anthropic / Google Gemini integration
- Structured data input to AI:
  ```json
  {
    "symbol": "EUR/USD",
    "timeframe": "1H",
    "trend": { ... },
    "indicators": { ... },
    "signal": { ... },
    "supportResistance": [ ... ],
    "patterns": [ ... ]
  }
  ```
- AI provides:
  - Market Overview
  - Trend Analysis (natural language)
  - Momentum Assessment
  - Support/Resistance Context
  - Bullish Scenario
  - Bearish Scenario
  - Risk Factors
  - Trading Considerations

**Implementation Steps:**
1. Add AI API configuration to `.env`
2. Create `lib/ai/openai-provider.ts` or similar
3. Create `/api/ai/analyze` endpoint
4. Add AI section to analysis page
5. Rate limiting & error handling

**Estimated Time:** 2-3 hours

---

### 9. ⏳ NextAuth Authentication
**Status:** Not Started

**Goal:** User authentication and authorization

**Requirements:**
- Email/Password authentication
- Protected routes (dashboard, watchlist, journal)
- Session management
- User preferences storage
- Login/Register pages (UI already exists)

**Implementation Steps:**
1. Install NextAuth: `npm install next-auth`
2. Create `app/api/auth/[...nextauth]/route.ts`
3. Configure providers (Credentials)
4. Add middleware for protected routes
5. Update layout with user session
6. Connect login/register forms to API

**Estimated Time:** 2-3 hours

---

### 10. ⏳ Watchlist & Trading Journal
**Status:** Not Started (Prisma schema ready)

**Goal:** User features with database persistence

**Requirements:**

**Watchlist:**
- Add/remove pairs
- Reorder pairs (drag & drop optional)
- View current price & change
- Quick chart/analysis access
- Stored per user

**Trading Journal:**
- Log trades with:
  - Symbol, Date, Timeframe
  - Direction (BUY/SELL)
  - Entry, Stop Loss, Take Profit
  - Result (WIN/LOSS/BREAKEVEN/OPEN)
  - Profit/Loss
  - Notes & Screenshot
- Statistics:
  - Total Trades
  - Win Rate %
  - Average R:R
  - Profit Factor
  - Best/Worst Trade

**Implementation Steps:**
1. Run Prisma migrations: `npx prisma migrate dev`
2. Create `/api/watchlist` CRUD endpoints
3. Create `/api/journal` CRUD endpoints
4. Build watchlist page UI
5. Build journal page with form + stats
6. Add charts for performance tracking

**Estimated Time:** 4-5 hours

---

## 🚀 Quick Start Guide

### 1. Install Dependencies

```bash
npm install
```

**Note:** Jika ada error dengan PowerShell execution policy:
```bash
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env`:
```env
# Database (optional untuk fitur 8-10)
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# NextAuth (untuk fitur 9)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Market Data API (pilih salah satu)
MARKET_DATA_API_KEY="your-api-key"
MARKET_DATA_PROVIDER="mock"  # gunakan "mock" untuk development
MARKET_DATA_BASE_URL="https://api.twelvedata.com"

# AI API (untuk fitur 8)
AI_API_KEY="your-openai-api-key"
AI_MODEL="gpt-4"
AI_BASE_URL="https://api.openai.com/v1"
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
pai-fx/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── market/              # ✅ Market data endpoints
│   │   └── analysis/            # ✅ Analysis endpoint
│   ├── (auth)/                  # ⏳ Auth pages
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/               # ✅ Dashboard (demo data)
│   ├── market/                  # ✅ Market list page
│   ├── chart/[symbol]/          # ✅ Chart page
│   ├── analysis/                # ✅ Analysis page
│   ├── signals/                 # ⏳ Signals page (placeholder)
│   ├── watchlist/               # ⏳ Watchlist page
│   └── journal/                 # ⏳ Journal page
│
├── components/
│   ├── chart/                   # ✅ Chart components
│   ├── market/                  # ✅ Market components
│   ├── analysis/                # ✅ Analysis components
│   └── layout/                  # ✅ Layout components
│
├── lib/
│   ├── market/                  # ✅ Market data providers
│   ├── indicators/              # ✅ Technical indicators
│   ├── analysis/                # ✅ Analysis engines
│   ├── ai/                      # ⏳ AI integration
│   ├── auth/                    # ⏳ Auth utilities
│   ├── db.ts                    # ✅ Prisma client
│   └── utils.ts                 # ✅ Helper functions
│
├── types/
│   ├── market.ts                # ✅ Market data types
│   └── database.ts              # ✅ Database types
│
├── prisma/
│   └── schema.prisma            # ✅ Database schema (ready)
│
├── .env.example                 # ✅ Environment template
├── README.md                    # ✅ User documentation
├── DEVELOPMENT.md               # ✅ This file
└── package.json                 # ✅ Dependencies
```

---

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm start            # Start production server

# Linting
npm run lint         # Run ESLint

# Database (when ready)
npx prisma generate  # Generate Prisma Client
npx prisma migrate dev --name init  # Run migrations
npx prisma studio    # Open Prisma Studio
```

---

## 🎨 Design System

**Theme:** Dark Trading Terminal

**Colors:**
- Background: `#0f1419` (dark navy)
- Card: `#1c2128` (slightly lighter)
- Border: `#30363d` (subtle)
- Primary: `#3b82f6` (blue)
- Success/Bullish: `#22c55e` (green)
- Danger/Bearish: `#ef4444` (red)
- Warning/Neutral: `#eab308` (yellow)

**Typography:**
- Font: Inter / System Default
- Headings: Bold, proper hierarchy
- Body: Regular, readable

**Components:**
- Cards with subtle borders
- Rounded corners (8px)
- Hover states with transitions
- Loading states with spinners
- Error states with retry buttons

---

## 📊 API Documentation

### Market Endpoints

**GET /api/market**
```json
{
  "pairs": [
    {
      "symbol": "EUR/USD",
      "price": 1.17342,
      "change": 0.00493,
      "changePercent": 0.42,
      "timestamp": 1234567890
    }
  ],
  "provider": "mock",
  "timestamp": 1234567890
}
```

**GET /api/market/quote?symbol=EUR/USD**
```json
{
  "symbol": "EUR/USD",
  "price": 1.17342,
  "change": 0.00493,
  "changePercent": 0.42,
  "timestamp": 1234567890,
  "cached": false
}
```

**GET /api/market/candles?symbol=EUR/USD&timeframe=1h&limit=100**
```json
{
  "symbol": "EUR/USD",
  "timeframe": "1h",
  "candles": [
    {
      "timestamp": 1234567890,
      "open": 1.17000,
      "high": 1.17500,
      "low": 1.16800,
      "close": 1.17342,
      "volume": 12345
    }
  ],
  "cached": false
}
```

### Analysis Endpoint

**GET /api/analysis?symbol=EUR/USD&timeframe=1h**
```json
{
  "symbol": "EUR/USD",
  "timeframe": "1h",
  "timestamp": 1234567890,
  "currentPrice": 1.17342,
  "change": 0.00493,
  "changePercent": 0.42,
  "indicators": { ... },
  "trend": { ... },
  "signal": { ... },
  "supportResistance": { ... },
  "marketStructure": { ... },
  "patterns": { ... }
}
```

---

## 🔐 Security Considerations

✅ **Implemented:**
- API keys server-side only
- Environment variables
- Input validation with Zod
- Error handling without exposing internals
- No data fabrication (mock provider clearly labeled)

⏳ **To Implement:**
- Authentication & authorization
- Rate limiting for AI endpoints
- User data encryption
- CSRF protection
- Secure session management

---

## 🚀 Deployment Guide

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `DATABASE_URL`
   - `NEXTAUTH_URL` (your domain)
   - `NEXTAUTH_SECRET`
   - `MARKET_DATA_API_KEY`
   - `MARKET_DATA_PROVIDER`
   - `AI_API_KEY` (optional)

4. Deploy!

### Database: Neon PostgreSQL

1. Create account at [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string
4. Add to `DATABASE_URL` in environment
5. Run migrations from local:
   ```bash
   npx prisma migrate deploy
   ```

---

## 📈 Performance Optimization

**Implemented:**
- Server Components for static content
- Client Components only for interactive UI
- API caching with TTL
- Debounced search
- Lazy loading for charts
- Memoization for calculations

**Future Optimizations:**
- Redis for distributed caching
- Database indexes
- Image optimization
- Code splitting
- CDN for static assets

---

## 🧪 Testing Strategy

**Current:** Manual testing

**Recommended:**
```bash
# Install testing libraries
npm install -D jest @testing-library/react @testing-library/jest-dom

# Test indicators
test('EMA calculation', () => { ... })
test('RSI overbought detection', () => { ... })

# Test analysis
test('Trend detection', () => { ... })
test('Signal scoring', () => { ... })

# Test API
test('Market data endpoint', () => { ... })
```

---

## 📝 Next Development Steps

### Priority Order:

1. **Complete remaining features (Tasks 8-10)**
   - AI Integration (2-3 hours)
   - Authentication (2-3 hours)
   - Watchlist & Journal (4-5 hours)

2. **Testing**
   - Unit tests for indicators
   - Integration tests for API
   - E2E tests for critical flows

3. **Polish**
   - Loading states
   - Error messages
   - Empty states
   - Mobile optimization

4. **Documentation**
   - API docs
   - User guide
   - Trading strategy examples

5. **Deploy**
   - Production deployment
   - Monitoring setup
   - Analytics integration

---

## 🆘 Troubleshooting

### PowerShell Execution Policy Error
```bash
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

### Prisma Generate Error
```bash
npx prisma generate
```

### Chart Not Loading
- Check browser console for errors
- Verify API endpoint is responding
- Check CORS if using external API

### Mock Data vs Real Data
- Development: Use `MARKET_DATA_PROVIDER=mock`
- Production: Use `MARKET_DATA_PROVIDER=twelve_data` with API key

---

## 📞 Support & Resources

**Documentation:**
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [TradingView Lightweight Charts](https://tradingview.github.io/lightweight-charts/)
- [Twelve Data API](https://twelvedata.com/docs)

**Community:**
- GitHub Issues: [github.com/Fairuz-11/Pai-Fx/issues](https://github.com/Fairuz-11/Pai-Fx/issues)

---

**Last Updated:** September 9, 2026  
**Version:** 0.7.0 (7/10 features complete)  
**Status:** Ready for AI Integration & Authentication
