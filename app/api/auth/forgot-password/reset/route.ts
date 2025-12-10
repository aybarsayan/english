import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

interface ResetTokenPayload {
  parentId: string
  phone: string
  timestamp: number
}

export async function POST(request: NextRequest) {
  try {
    const { resetToken, newPassword } = await request.json()

    if (!resetToken || !newPassword) {
      return NextResponse.json(
        { error: 'Reset token ve yeni şifre gereklidir' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Şifre en az 6 karakter olmalıdır' },
        { status: 400 }
      )
    }

    let decoded: ResetTokenPayload
    try {
      decoded = jwt.verify(resetToken, JWT_SECRET) as ResetTokenPayload
    } catch {
      return NextResponse.json(
        { error: 'Geçersiz veya süresi dolmuş token' },
        { status: 401 }
      )
    }

    const parent = await prisma.parent.findUnique({
      where: { id: decoded.parentId }
    })

    if (!parent) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.parent.update({
      where: { id: parent.id },
      data: {
        password: hashedPassword,
        plainPassword: newPassword,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Şifreniz başarıyla güncellendi'
    })

  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    )
  }
}
