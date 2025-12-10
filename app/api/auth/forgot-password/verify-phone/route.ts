import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

function maskLastName(fullName: string): string {
  const parts = fullName.trim().split(' ')
  if (parts.length === 1) {
    const name = parts[0]
    if (name.length <= 2) return name
    return name.substring(0, 2) + '*'.repeat(name.length - 2)
  }

  const firstName = parts.slice(0, -1).join(' ')
  const lastName = parts[parts.length - 1]

  if (lastName.length <= 2) {
    return `${firstName} ${lastName}`
  }

  return `${firstName} ${lastName.substring(0, 2)}${'*'.repeat(lastName.length - 2)}`
}

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()

    if (!phone) {
      return NextResponse.json(
        { error: 'Telefon numarası gereklidir' },
        { status: 400 }
      )
    }

    const parent = await prisma.parent.findUnique({
      where: { phone }
    })

    if (!parent) {
      return NextResponse.json(
        { error: 'Bu telefon numarasına kayıtlı hesap bulunamadı' },
        { status: 404 }
      )
    }

    const parentStudents = await prisma.student.findMany({
      where: {
        id: { in: parent.studentIds }
      },
      select: {
        id: true,
        name: true
      }
    })

    if (parentStudents.length === 0) {
      const resetToken = jwt.sign(
        { parentId: parent.id, phone: parent.phone, timestamp: Date.now() },
        JWT_SECRET,
        { expiresIn: '15m' }
      )

      return NextResponse.json({
        hasStudents: false,
        resetToken
      })
    }

    const correctStudent = parentStudents[Math.floor(Math.random() * parentStudents.length)]

    const decoyStudents = await prisma.student.findMany({
      where: {
        id: { notIn: parent.studentIds }
      },
      select: {
        id: true,
        name: true
      },
      take: 10
    })

    const decoys = decoyStudents.length >= 2
      ? decoyStudents.sort(() => 0.5 - Math.random()).slice(0, 2)
      : [
          { id: 'decoy-1', name: 'Ahmet Yilmaz' },
          { id: 'decoy-2', name: 'Ayse Demir' }
        ]

    const studentOptions = [
      {
        id: correctStudent.id,
        displayName: maskLastName(correctStudent.name),
        isCorrect: true
      },
      {
        id: decoys[0].id,
        displayName: maskLastName(decoys[0].name),
        isCorrect: false
      },
      {
        id: decoys[1].id,
        displayName: maskLastName(decoys[1].name),
        isCorrect: false
      }
    ].sort(() => 0.5 - Math.random())

    return NextResponse.json({
      hasStudents: true,
      students: studentOptions.map(s => ({ id: s.id, displayName: s.displayName }))
    })

  } catch (error) {
    console.error('Verify phone error:', error)
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    )
  }
}
