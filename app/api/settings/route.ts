import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
})

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
})

const updatePreferencesSchema = z.object({
  defaultTimeframe: z.enum(['1m', '5m', '15m', '30m', '1h', '4h', '1D', '1W']).optional(),
  defaultProvider: z.string().optional(),
  theme: z.string().optional(),
})

// GET - fetch user profile + preferences
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        preferences: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('[settings GET]', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

// PUT - update profile, password, or preferences
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type } = body

    // ── Update profile name ──
    if (type === 'profile') {
      const validation = updateProfileSchema.safeParse(body)
      if (!validation.success) {
        return NextResponse.json(
          { error: 'Validation failed', details: validation.error.errors },
          { status: 400 }
        )
      }

      const user = await prisma.user.update({
        where: { id: session.user.id },
        data: { name: validation.data.name },
        select: { id: true, name: true, email: true },
      })

      return NextResponse.json({ message: 'Profile updated', user })
    }

    // ── Update password ──
    if (type === 'password') {
      const validation = updatePasswordSchema.safeParse(body)
      if (!validation.success) {
        return NextResponse.json(
          { error: 'Validation failed', details: validation.error.errors },
          { status: 400 }
        )
      }

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { password: true },
      })

      if (!user?.password) {
        return NextResponse.json({ error: 'Cannot change password for this account' }, { status: 400 })
      }

      const isValid = await bcrypt.compare(validation.data.currentPassword, user.password)
      if (!isValid) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
      }

      const hashed = await bcrypt.hash(validation.data.newPassword, 10)
      await prisma.user.update({
        where: { id: session.user.id },
        data: { password: hashed },
      })

      return NextResponse.json({ message: 'Password updated successfully' })
    }

    // ── Update preferences ──
    if (type === 'preferences') {
      const validation = updatePreferencesSchema.safeParse(body)
      if (!validation.success) {
        return NextResponse.json(
          { error: 'Validation failed', details: validation.error.errors },
          { status: 400 }
        )
      }

      const prefs = await prisma.userPreference.upsert({
        where: { userId: session.user.id },
        create: { userId: session.user.id, ...validation.data },
        update: validation.data,
      })

      return NextResponse.json({ message: 'Preferences updated', preferences: prefs })
    }

    return NextResponse.json({ error: 'Invalid update type' }, { status: 400 })
  } catch (error) {
    console.error('[settings PUT]', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}

// DELETE - delete account
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.user.delete({ where: { id: session.user.id } })

    return NextResponse.json({ message: 'Account deleted successfully' })
  } catch (error) {
    console.error('[settings DELETE]', error)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }
}
