# 🔐 Authentication Setup Guide

PAI-FX menggunakan **NextAuth.js v4** untuk sistem authentication dengan credential-based login (email + password).

## 📋 Table of Contents

1. [Overview](#overview)
2. [Setup Instructions](#setup-instructions)
3. [Environment Variables](#environment-variables)
4. [Database Schema](#database-schema)
5. [Authentication Flow](#authentication-flow)
6. [Protected Routes](#protected-routes)
7. [API Reference](#api-reference)
8. [Usage Examples](#usage-examples)
9. [Troubleshooting](#troubleshooting)

---

## Overview

### Features

✅ **Email & Password Authentication**  
✅ **JWT Session Strategy** (stateless, faster)  
✅ **Password Hashing** with bcrypt  
✅ **User Registration** with validation  
✅ **Protected Routes** with middleware  
✅ **Session Management** with NextAuth  
✅ **User Preferences** (auto-created on registration)  

### Tech Stack

- **NextAuth.js v4** - Authentication framework
- **Prisma** - Database ORM
- **bcryptjs** - Password hashing
- **Zod** - Input validation
- **JWT** - Session tokens

---

## Setup Instructions

### 1. Install Dependencies

Dependencies sudah ada di `package.json`:

```json
{
  "dependencies": {
    "next-auth": "^4.24.15",
    "@next-auth/prisma-adapter": "^1.0.7",
    "bcryptjs": "^3.0.3",
    "@prisma/client": "^7.10.0",
    "zod": "^4.6.1"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6"
  }
}
```

Install:

```bash
npm install
```

### 2. Setup Environment Variables

Buat file `.env` di root project:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/paifx?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

**Generate NEXTAUTH_SECRET:**

Gunakan salah satu cara berikut:

```bash
# Cara 1: OpenSSL (Linux/Mac)
openssl rand -base64 32

# Cara 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Cara 3: Online Generator
# https://generate-secret.vercel.app/32
```

Contoh output:
```
NEXTAUTH_SECRET="vJk8x2Tc9Qp7FhXw5Ls1Rn4Km6Ng3Yz0"
```

### 3. Setup Database

Run Prisma migrations:

```bash
# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma migrate dev --name init

# (Optional) View database
npx prisma studio
```

### 4. Verify Installation

File structure yang dibuat:

```
pai-fx/
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── [...nextauth]/
│   │       │   └── route.ts          # NextAuth handler
│   │       └── register/
│   │           └── route.ts          # Registration endpoint
│   ├── login/
│   │   └── page.tsx                  # Login page
│   └── register/
│       └── page.tsx                  # Registration page
├── lib/
│   ├── auth/
│   │   └── auth-options.ts           # NextAuth config
│   └── db.ts                         # Prisma client
├── components/
│   ├── providers.tsx                 # Session provider
│   └── layout/
│       └── header.tsx                # Header with auth state
├── middleware.ts                     # Route protection
├── types/
│   └── next-auth.d.ts                # TypeScript definitions
└── prisma/
    └── schema.prisma                 # Database schema
```

---

## Environment Variables

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/paifx` |
| `NEXTAUTH_URL` | App URL (change for production) | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Secret key for JWT signing | `vJk8x2Tc9Qp7FhXw5Ls1Rn4Km6Ng3Yz0` |

### Production Setup (Vercel)

Untuk production, update `NEXTAUTH_URL`:

```env
NEXTAUTH_URL="https://your-domain.vercel.app"
```

Tambahkan semua env variables di Vercel Dashboard → Settings → Environment Variables.

---

## Database Schema

### User Model

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  password  String?
  image     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  watchlists      Watchlist[]
  journalEntries  JournalEntry[]
  savedAnalyses   SavedAnalysis[]
  preferences     UserPreference?

  // NextAuth
  accounts Account[]
  sessions Session[]
}
```

### Related Models

- **Account** - OAuth providers (future support)
- **Session** - Database sessions (not used with JWT strategy)
- **UserPreference** - User settings
- **Watchlist** - Saved currency pairs
- **JournalEntry** - Trading journal entries
- **SavedAnalysis** - Saved market analyses

---

## Authentication Flow

### Registration Flow

```
User fills form → Validation → Hash password → Create user → Create preferences → Redirect to login
```

**Steps:**

1. User mengisi form register (`/register`)
2. Frontend validate input (min length, email format)
3. POST request ke `/api/auth/register`
4. Backend validate dengan Zod schema
5. Check if email already exists
6. Hash password dengan bcrypt (10 rounds)
7. Create user di database
8. Auto-create default user preferences
9. Return success → redirect ke `/login`

### Login Flow

```
User enters credentials → NextAuth validates → Generate JWT → Store session → Redirect to dashboard
```

**Steps:**

1. User mengisi form login (`/login`)
2. Frontend call `signIn()` dari next-auth/react
3. NextAuth calls CredentialsProvider
4. Verify email exists in database
5. Compare password dengan bcrypt
6. Generate JWT token dengan user data
7. Store session di cookie
8. Redirect ke protected page (dashboard)

### Session Management

```
Request → Middleware checks JWT → Extract user data → Allow/Deny access
```

**NextAuth automatically handles:**

- JWT generation & signing
- Session storage in cookie
- Token refresh
- Session expiration
- CSRF protection

---

## Protected Routes

### Middleware Configuration

File: `middleware.ts`

```typescript
import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Public pages (no auth required)
        const publicPaths = ['/', '/login', '/register', '/market', '/chart', '/analysis']
        
        // Protected pages (auth required)
        // /watchlist, /journal, /settings
        
        return isPublicPath || !!token
      },
    },
    pages: {
      signIn: '/login',
    },
  }
)
```

### Route Access

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Landing page |
| `/login` | Public | Login page |
| `/register` | Public | Registration page |
| `/market` | Public | Market overview |
| `/chart/:symbol` | Public | Price charts |
| `/analysis` | Public | Market analysis |
| `/watchlist` | Protected | User watchlist (requires auth) |
| `/journal` | Protected | Trading journal (requires auth) |
| `/settings` | Protected | User settings (requires auth) |

**Why market pages are public?**
- Allow demo/preview access
- SEO benefits
- Lower barrier to entry
- Users can explore before signing up

---

## API Reference

### POST `/api/auth/register`

Register new user.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Validation Rules:**

- `name`: minimum 2 characters
- `email`: valid email format
- `password`: minimum 6 characters

**Response (Success):**

```json
{
  "message": "User registered successfully",
  "user": {
    "id": "clx...",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Response (Error):**

```json
{
  "error": "User with this email already exists"
}
```

### POST `/api/auth/signin`

Login user (handled by NextAuth).

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**

NextAuth automatically handles response and redirects.

### GET `/api/auth/session`

Get current session (handled by NextAuth).

**Response:**

```json
{
  "user": {
    "id": "clx...",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "expires": "2024-02-01T00:00:00.000Z"
}
```

### POST `/api/auth/signout`

Logout user (handled by NextAuth).

---

## Usage Examples

### 1. Client Component - Check Auth State

```tsx
'use client'

import { useSession } from 'next-auth/react'

export function MyComponent() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (status === 'unauthenticated') {
    return <div>Please login</div>
  }

  return (
    <div>
      Welcome, {session?.user?.name}!
    </div>
  )
}
```

### 2. Server Component - Get Session

```tsx
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/auth-options'

export default async function Page() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  return <div>Protected content for {session.user.name}</div>
}
```

### 3. API Route - Protect Endpoint

```typescript
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/auth-options'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Protected logic here
  return NextResponse.json({ data: 'Protected data' })
}
```

### 4. Sign Out

```tsx
'use client'

import { signOut } from 'next-auth/react'

export function SignOutButton() {
  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  return (
    <button onClick={handleSignOut}>
      Sign Out
    </button>
  )
}
```

### 5. Redirect After Login

```tsx
'use client'

import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export function LoginForm() {
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const result = await signIn('credentials', {
      email: formData.email,
      password: formData.password,
      redirect: false, // Don't auto-redirect
    })

    if (result?.ok) {
      router.push('/dashboard') // Manual redirect
    } else {
      setError('Invalid credentials')
    }
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

---

## Troubleshooting

### 1. "Cannot find module '@next-auth/prisma-adapter'"

**Solution:**

```bash
npm install @next-auth/prisma-adapter
```

### 2. "Invalid `prisma.user.findUnique()` invocation"

**Causes:**
- Database not initialized
- Prisma client not generated
- Wrong DATABASE_URL

**Solution:**

```bash
# Regenerate Prisma client
npx prisma generate

# Reset database
npx prisma migrate reset

# Create fresh migration
npx prisma migrate dev --name init
```

### 3. "NEXTAUTH_SECRET is not set"

**Solution:**

Generate and add to `.env`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy output ke `.env`:

```env
NEXTAUTH_SECRET="<paste-output-here>"
```

### 4. Login redirects to error page

**Possible causes:**
- Wrong password
- User doesn't exist
- Database connection failed

**Debug:**

Check console logs and database:

```bash
# View users
npx prisma studio

# Check logs
npm run dev
```

### 5. Session not persisting

**Causes:**
- Cookie blocked by browser
- NEXTAUTH_URL mismatch
- JWT secret changed

**Solution:**

1. Check browser console for cookie errors
2. Verify `NEXTAUTH_URL` matches current URL
3. Clear cookies and re-login
4. Don't change `NEXTAUTH_SECRET` in production

### 6. TypeScript errors with session

**Solution:**

Make sure `types/next-auth.d.ts` exists:

```typescript
import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
    } & DefaultSession['user']
  }
}
```

### 7. Middleware blocking public routes

**Solution:**

Update `middleware.ts` config matcher:

```typescript
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
}
```

### 8. "Execution policy" error di Windows PowerShell

**Solution:**

```powershell
# Bypass execution policy
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process

# Or use cmd instead of PowerShell
npm install
```

---

## Security Best Practices

### ✅ DO

- Use strong `NEXTAUTH_SECRET` (min 32 characters)
- Hash passwords with bcrypt (10+ rounds)
- Validate all user input with Zod
- Use environment variables for secrets
- Enable HTTPS in production
- Set proper CORS policies
- Rate limit authentication endpoints
- Monitor failed login attempts
- Implement password strength requirements
- Add email verification (future enhancement)

### ❌ DON'T

- Don't store passwords in plain text
- Don't expose API keys to client
- Don't use weak secrets
- Don't skip input validation
- Don't log sensitive data
- Don't allow SQL injection
- Don't trust client-side validation only
- Don't reuse sessions across devices (without proper security)

---

## Next Steps

### Planned Enhancements

- [ ] Email verification
- [ ] Forgot password / Reset password
- [ ] OAuth providers (Google, GitHub)
- [ ] Two-factor authentication (2FA)
- [ ] Session management (view active sessions)
- [ ] Account deletion
- [ ] Email notifications
- [ ] Rate limiting for auth endpoints
- [ ] CAPTCHA for registration
- [ ] Password strength meter

---

## Additional Resources

- **NextAuth.js Docs:** https://next-auth.js.org/
- **Prisma Docs:** https://www.prisma.io/docs
- **bcryptjs Docs:** https://github.com/dcodeIO/bcrypt.js
- **Zod Docs:** https://zod.dev/

---

**Happy coding! 🚀**
