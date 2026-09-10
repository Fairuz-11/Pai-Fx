# 🚀 PAI-FX Setup Guide - Complete Installation

Panduan lengkap untuk setup PAI-FX dari awal sampai berjalan.

## 📋 Prerequisites

Sebelum mulai, pastikan sudah install:

- **Node.js 18+** - [Download](https://nodejs.org/)
- **npm** atau **yarn** - Included dengan Node.js
- **PostgreSQL Database** - [Neon.tech](https://neon.tech) (recommended, gratis) atau local PostgreSQL
- **Git** - [Download](https://git-scm.com/)

## 🔧 Installation Steps

### 1. Clone Repository

```bash
git clone https://github.com/your-username/pai-fx.git
cd pai-fx
```

### 2. Install Dependencies

```bash
npm install
```

**Dependencies yang akan ter-install:**
- Next.js 16.3.4
- React 19
- NextAuth.js 4.24.15
- Prisma 8.0
- TypeScript 5
- Tailwind CSS 4
- Zod, bcryptjs, dan lainnya

**Note untuk Windows:** Jika ada error "execution policy", run PowerShell as Administrator:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 3. Setup Environment Variables

Copy file `.env.example` menjadi `.env`:

```bash
# Windows PowerShell
Copy-Item .env.example .env

# Linux/Mac
cp .env.example .env
```

Edit `.env` dan isi dengan credentials:

```env
# Database (REQUIRED)
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# NextAuth (REQUIRED)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-this-secret"

# Market Data (OPTIONAL - gunakan mock jika tidak punya)
TWELVE_DATA_API_KEY=""
ALPHA_VANTAGE_API_KEY=""
MARKET_DATA_PROVIDER="mock"

# AI Analysis (OPTIONAL)
OPENAI_API_KEY=""
ANTHROPIC_API_KEY=""
AI_PROVIDER="openai"
```

#### Generate NEXTAUTH_SECRET

Pilih salah satu cara:

**Cara 1 - Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Cara 2 - OpenSSL (Linux/Mac):**
```bash
openssl rand -base64 32
```

**Cara 3 - Online:**
- Visit: https://generate-secret.vercel.app/32

Copy hasil dan paste ke `.env`:
```env
NEXTAUTH_SECRET="vJk8x2Tc9Qp7FhXw5Ls1Rn4Km6Ng3Yz0"
```

### 4. Setup Database

#### Option A: Neon.tech (Recommended - Free)

1. Buat account di [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string
4. Paste ke `DATABASE_URL` di `.env`

Example:
```env
DATABASE_URL="postgresql://user:password@ep-cool-name.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

#### Option B: Local PostgreSQL

1. Install PostgreSQL
2. Create database:
```sql
CREATE DATABASE paifx;
```

3. Update `.env`:
```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/paifx"
```

### 5. Initialize Database

Run Prisma migrations:

```bash
# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma migrate dev --name init
```

**Output yang benar:**
```
✔ Generated Prisma Client
✔ Applied 1 migration
```

**Verify database:**
```bash
npx prisma studio
```

Ini akan open Prisma Studio di browser untuk lihat database tables.

### 6. Setup Market Data API (Optional)

Jika ingin real market data:

#### TwelveData (Recommended)

1. Sign up: [twelvedata.com](https://twelvedata.com)
2. Get API key (800 requests/day free)
3. Update `.env`:
```env
TWELVE_DATA_API_KEY="your-api-key-here"
MARKET_DATA_PROVIDER="twelvedata"
```

#### Alpha Vantage

1. Sign up: [alphavantage.co](https://www.alphavantage.co)
2. Get API key (25 requests/day free)
3. Update `.env`:
```env
ALPHA_VANTAGE_API_KEY="your-api-key-here"
MARKET_DATA_PROVIDER="alphavantage"
```

#### Mock Provider (No API Key Needed)

Untuk testing, gunakan mock data:
```env
MARKET_DATA_PROVIDER="mock"
```

### 7. Setup AI Analysis (Optional)

#### OpenAI

1. Sign up: [platform.openai.com](https://platform.openai.com)
2. Create API key
3. Update `.env`:
```env
OPENAI_API_KEY="sk-..."
AI_PROVIDER="openai"
```

#### Anthropic

1. Sign up: [console.anthropic.com](https://console.anthropic.com)
2. Create API key
3. Update `.env`:
```env
ANTHROPIC_API_KEY="sk-ant-..."
AI_PROVIDER="anthropic"
```

**Note:** Jika tidak setup, AI features akan disabled (app tetap berjalan normal).

### 8. Run Development Server

```bash
npm run dev
```

**Output:**
```
▲ Next.js 16.3.4
- Local:        http://localhost:3000
- Network:      http://192.168.1.x:3000

✓ Ready in 2.3s
```

Open browser: [http://localhost:3000](http://localhost:3000)

---

## ✅ Verification Checklist

Setelah setup, verify semua berjalan:

### Basic Functionality

- [ ] Homepage loads successfully
- [ ] Can navigate to Market page
- [ ] Can view Chart page
- [ ] Can view Analysis page

### Authentication

- [ ] Can access Register page (`/register`)
- [ ] Can create new account
- [ ] Can login with credentials
- [ ] Redirected to dashboard after login
- [ ] Header shows user avatar
- [ ] Can logout successfully

### Protected Features

- [ ] Watchlist page requires login
- [ ] Journal page requires login
- [ ] Can add pairs to watchlist
- [ ] Can create journal entries
- [ ] Statistics display correctly

### Market Data

- [ ] Market page shows pairs
- [ ] Prices are displayed (or mock data)
- [ ] Charts render correctly
- [ ] Analysis shows indicators

### AI Features (if configured)

- [ ] AI Analysis button visible
- [ ] Can generate AI insights
- [ ] Analysis displays correctly

---

## 🐛 Troubleshooting

### Error: "Cannot find module '@next-auth/prisma-adapter'"

**Solution:**
```bash
npm install @next-auth/prisma-adapter
```

### Error: "Invalid prisma.user.findUnique() invocation"

**Cause:** Database not initialized

**Solution:**
```bash
npx prisma generate
npx prisma migrate dev --name init
```

### Error: "NEXTAUTH_SECRET is not set"

**Solution:** Generate and add to `.env`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Error: "npm.ps1 cannot be loaded"

**Cause:** PowerShell execution policy

**Solution (Windows):**
```powershell
# Run PowerShell as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Login not working

**Check:**
1. Database is running
2. Prisma migrations applied
3. User exists in database (check with `npx prisma studio`)
4. Password is correct
5. `NEXTAUTH_SECRET` is set

### Market data not loading

**Solutions:**

**If using real API:**
1. Check API key is valid
2. Check rate limits (TwelveData: 800/day, AlphaVantage: 25/day)
3. Verify `MARKET_DATA_PROVIDER` is set correctly

**Switch to mock data:**
```env
MARKET_DATA_PROVIDER="mock"
```

### AI analysis not working

**Solutions:**

**If using OpenAI:**
1. Check API key is valid
2. Verify account has credits
3. Check `AI_PROVIDER="openai"`

**If using Anthropic:**
1. Check API key is valid
2. Verify account has credits
3. Check `AI_PROVIDER="anthropic"`

**Disable AI features:**
Remove or comment out AI keys in `.env` - app will work without AI.

---

## 📦 Build for Production

### 1. Build Project

```bash
npm run build
```

**Output:**
```
✓ Compiled successfully
✓ Collecting page data
✓ Generating static pages (7/7)
✓ Finalizing page optimization

Route (app)                              Size     First Load JS
┌ ○ /                                    5 kB       100 kB
├ ○ /login                               2 kB        95 kB
├ ○ /register                            2 kB        95 kB
└ ○ /market                              10 kB       105 kB
```

### 2. Test Production Build

```bash
npm start
```

### 3. Deploy to Vercel

**Automatic deployment:**

1. Push code to GitHub
2. Import project di [vercel.com](https://vercel.com)
3. Add environment variables
4. Click "Deploy"

**Environment variables untuk Vercel:**

Add semua dari `.env`, kecuali update:

```env
NEXTAUTH_URL="https://your-domain.vercel.app"
```

**Database migrations:**

After deploy, run from local:

```bash
npx prisma migrate deploy
```

---

## 🎯 Quick Start Commands

### Development
```bash
npm run dev         # Start dev server
npm run build       # Build for production
npm start           # Start production server
npm run lint        # Run ESLint
```

### Database
```bash
npx prisma generate              # Generate Prisma Client
npx prisma migrate dev           # Create and apply migration
npx prisma migrate deploy        # Apply migrations (production)
npx prisma studio                # Open Prisma Studio
npx prisma migrate reset         # Reset database (dev only)
npx prisma db push               # Push schema without migration
```

### Testing
```bash
# Test registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Test watchlist (requires auth)
curl http://localhost:3000/api/watchlist \
  -H "Cookie: next-auth.session-token=your-token"
```

---

## 📚 Next Steps

After successful setup:

1. **Create an account** - Register via `/register`
2. **Explore market data** - Browse `/market` page
3. **Add to watchlist** - Save favorite pairs
4. **Start journaling** - Track your trades in `/journal`
5. **Configure AI** - Add OpenAI/Anthropic key for insights
6. **Setup real market data** - Get TwelveData API key

---

## 🔗 Useful Links

- **Next.js Docs:** https://nextjs.org/docs
- **NextAuth.js:** https://next-auth.js.org
- **Prisma Docs:** https://www.prisma.io/docs
- **Neon Database:** https://neon.tech/docs
- **TwelveData API:** https://twelvedata.com/docs
- **OpenAI API:** https://platform.openai.com/docs

---

## 🆘 Need Help?

1. Check [AUTHENTICATION.md](./AUTHENTICATION.md) for auth issues
2. Check [README.md](./README.md) for feature documentation
3. Open issue on GitHub
4. Check console logs: `npm run dev`
5. Check database: `npx prisma studio`

---

**Happy trading analysis! 🚀📊**
