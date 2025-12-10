import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request: NextRequest) {
  try {
    const { phone, studentId } = await request.json()

    if (!phone || !studentId) {
      return NextResponse.json(
        { error: 'Telefon numarası ve öğrenci seçimi gereklidir' },
        { status: 400 }
      )
    }

    const parent = await prisma.parent.findUnique({
      where: { phone }
    })

    if (!parent) {
      return NextResponse.json(
        { error: 'Geçersiz istek' },
        { status: 404 }
      )
    }

    const isCorrect = parent.studentIds.includes(studentId)

    if (!isCorrect) {
      return NextResponse.json(
        { error: 'Yanlış seçim. Lütfen tekrar deneyin.' },
        { status: 400 }
      )
    }

    const resetToken = jwt.sign(
      { parentId: parent.id, phone: parent.phone, timestamp: Date.now() },
      JWT_SECRET,
      { expiresIn: '15m' }
    )

    return NextResponse.json({
      success: true,
      resetToken
    })

  } catch (error) {
    console.error('Verify student error:', error)
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    )
  }
}
