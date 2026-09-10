import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// Validation schemas
const addWatchlistSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required'),
  name: z.string().optional(),
  notes: z.string().optional(),
})

// GET - Get user's watchlist
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const watchlist = await prisma.watchlist.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        addedAt: 'desc',
      },
    })

    return NextResponse.json({ watchlist })
  } catch (error) {
    console.error('Error in GET /api/watchlist:', error)
    return NextResponse.json(
      { error: 'Failed to fetch watchlist' },
      { status: 500 }
    )
  }
}

// POST - Add pair to watchlist
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = addWatchlistSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { symbol, name, notes } = validation.data

    // Check if already in watchlist
    const existing = await prisma.watchlist.findUnique({
      where: {
        userId_symbol: {
          userId: session.user.id,
          symbol: symbol,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Pair already in watchlist' },
        { status: 409 }
      )
    }

    // Add to watchlist
    const watchlistItem = await prisma.watchlist.create({
      data: {
        userId: session.user.id,
        symbol,
        name: name || symbol,
        notes,
      },
    })

    return NextResponse.json(
      {
        message: 'Added to watchlist',
        item: watchlistItem,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error in POST /api/watchlist:', error)
    return NextResponse.json(
      { error: 'Failed to add to watchlist' },
      { status: 500 }
    )
  }
}

// DELETE - Remove pair from watchlist
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol')

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol is required' },
        { status: 400 }
      )
    }

    // Delete from watchlist
    const deleted = await prisma.watchlist.deleteMany({
      where: {
        userId: session.user.id,
        symbol: symbol,
      },
    })

    if (deleted.count === 0) {
      return NextResponse.json(
        { error: 'Item not found in watchlist' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Removed from watchlist',
      symbol,
    })
  } catch (error) {
    console.error('Error in DELETE /api/watchlist:', error)
    return NextResponse.json(
      { error: 'Failed to remove from watchlist' },
      { status: 500 }
    )
  }
}
