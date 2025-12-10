import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, generateToken } from '@/lib/auth'
import { normalizePhoneNumber } from '@/lib/utils'
import { z } from 'zod'

const loginSchema = z.object({
  phone: z.string().min(10, 'Geçerli bir telefon numarası giriniz'),
  password: z.string().min(1, 'Şifre gereklidir'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = loginSchema.parse(body)

    // Normalize phone number to standard format (05XXXXXXXXX)
    const normalizedPhone = normalizePhoneNumber(validatedData.phone)

    // Find user
    const parent = await prisma.parent.findUnique({
      where: { phone: normalizedPhone }
    })

    if (!parent) {
      return NextResponse.json(
        { error: 'Telefon numarası veya şifre hatalı' },
        { status: 401 }
      )
    }

    // Verify password
    const isValid = await verifyPassword(validatedData.password, parent.password)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Telefon numarası veya şifre hatalı' },
        { status: 401 }
      )
    }

    // Generate token
    const token = generateToken(parent.id)

    return NextResponse.json({
      token,
      parent: {
        id: parent.id,
        email: parent.email,
        name: parent.name,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: error.issues },
        { status: 400 }
      )
    }
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Giriş yapılırken bir hata oluştu' },
      { status: 500 }
    )
  }
}
