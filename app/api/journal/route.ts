import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// Validation schemas
const createEntrySchema = z.object({
  symbol: z.string().min(1, 'Symbol is required'),
  entryType: z.enum(['BUY', 'SELL'], { required_error: 'Entry type is required' }),
  entryPrice: z.number().positive('Entry price must be positive'),
  quantity: z.number().positive('Quantity must be positive'),
  entryDate: z.string().datetime('Invalid entry date'),
  notes: z.string().optional(),
  strategy: z.string().optional(),
})

const updateEntrySchema = z.object({
  id: z.string().min(1, 'ID is required'),
  exitPrice: z.number().positive('Exit price must be positive').optional(),
  exitDate: z.string().datetime('Invalid exit date').optional(),
  notes: z.string().optional(),
  strategy: z.string().optional(),
  status: z.enum(['OPEN', 'CLOSED']).optional(),
})

// Helper function to calculate profit
function calculateProfit(
  entryType: string,
  entryPrice: number,
  exitPrice: number,
  quantity: number
): { profit: number; profitPct: number } {
  let profit = 0

  if (entryType === 'BUY') {
    profit = (exitPrice - entryPrice) * quantity
  } else {
    profit = (entryPrice - exitPrice) * quantity
  }

  const profitPct = (profit / (entryPrice * quantity)) * 100

  return { profit, profitPct }
}

// GET - Get user's journal entries
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'OPEN' | 'CLOSED' | null (all)
    const symbol = searchParams.get('symbol')

    const where: any = {
      userId: session.user.id,
    }

    if (status) {
      where.status = status
    }

    if (symbol) {
      where.symbol = symbol
    }

    const entries = await prisma.journalEntry.findMany({
      where,
      orderBy: {
        entryDate: 'desc',
      },
    })

    // Calculate statistics
    const closedEntries = entries.filter((e) => e.status === 'CLOSED')
    const totalTrades = closedEntries.length
    const winningTrades = closedEntries.filter((e) => (e.profit ?? 0) > 0).length
    const losingTrades = closedEntries.filter((e) => (e.profit ?? 0) < 0).length
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0

    const totalProfit = closedEntries.reduce((sum, e) => sum + (e.profit ?? 0), 0)
    const totalLoss = Math.abs(
      closedEntries.filter((e) => (e.profit ?? 0) < 0).reduce((sum, e) => sum + (e.profit ?? 0), 0)
    )
    const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : 0

    const bestTrade = closedEntries.reduce(
      (best, e) => ((e.profit ?? 0) > (best?.profit ?? 0) ? e : best),
      closedEntries[0]
    )
    const worstTrade = closedEntries.reduce(
      (worst, e) => ((e.profit ?? 0) < (worst?.profit ?? 0) ? e : worst),
      closedEntries[0]
    )

    const avgProfit = totalTrades > 0 ? totalProfit / totalTrades : 0

    return NextResponse.json({
      entries,
      statistics: {
        totalTrades,
        winningTrades,
        losingTrades,
        winRate: parseFloat(winRate.toFixed(2)),
        totalProfit: parseFloat(totalProfit.toFixed(2)),
        profitFactor: parseFloat(profitFactor.toFixed(2)),
        avgProfit: parseFloat(avgProfit.toFixed(2)),
        bestTrade: bestTrade ? parseFloat((bestTrade.profit ?? 0).toFixed(2)) : 0,
        worstTrade: worstTrade ? parseFloat((worstTrade.profit ?? 0).toFixed(2)) : 0,
      },
    })
  } catch (error) {
    console.error('Error in GET /api/journal:', error)
    return NextResponse.json(
      { error: 'Failed to fetch journal entries' },
      { status: 500 }
    )
  }
}

// POST - Create new journal entry
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = createEntrySchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { symbol, entryType, entryPrice, quantity, entryDate, notes, strategy } = validation.data

    const entry = await prisma.journalEntry.create({
      data: {
        userId: session.user.id,
        symbol,
        entryType,
        entryPrice,
        quantity,
        entryDate: new Date(entryDate),
        notes,
        strategy,
        status: 'OPEN',
      },
    })

    return NextResponse.json(
      {
        message: 'Journal entry created',
        entry,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error in POST /api/journal:', error)
    return NextResponse.json(
      { error: 'Failed to create journal entry' },
      { status: 500 }
    )
  }
}

// PUT - Update journal entry (close trade)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = updateEntrySchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { id, exitPrice, exitDate, notes, strategy, status } = validation.data

    // Get existing entry
    const existing = await prisma.journalEntry.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    if (existing.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Prepare update data
    const updateData: any = {}

    if (notes !== undefined) updateData.notes = notes
    if (strategy !== undefined) updateData.strategy = strategy
    if (status !== undefined) updateData.status = status

    // If closing trade, calculate profit
    if (exitPrice !== undefined) {
      updateData.exitPrice = exitPrice
      updateData.exitDate = exitDate ? new Date(exitDate) : new Date()
      updateData.status = 'CLOSED'

      const { profit, profitPct } = calculateProfit(
        existing.entryType,
        existing.entryPrice,
        exitPrice,
        existing.quantity
      )

      updateData.profit = profit
      updateData.profitPct = profitPct
    }

    const entry = await prisma.journalEntry.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      message: 'Journal entry updated',
      entry,
    })
  } catch (error) {
    console.error('Error in PUT /api/journal:', error)
    return NextResponse.json(
      { error: 'Failed to update journal entry' },
      { status: 500 }
    )
  }
}

// DELETE - Delete journal entry
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    // Verify ownership
    const existing = await prisma.journalEntry.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    if (existing.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await prisma.journalEntry.delete({
      where: { id },
    })

    return NextResponse.json({
      message: 'Journal entry deleted',
      id,
    })
  } catch (error) {
    console.error('Error in DELETE /api/journal:', error)
    return NextResponse.json(
      { error: 'Failed to delete journal entry' },
      { status: 500 }
    )
  }
}
