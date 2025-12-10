'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Phone, Lock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import Mascot from '@/components/Mascot'
import { normalizePhoneNumber } from '@/lib/utils'

interface StudentOption {
  id: string
  displayName: string
}

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<'phone' | 'student' | 'password'>('phone')
  const [phone, setPhone] = useState('')
  const [students, setStudents] = useState<StudentOption[]>([])
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [resetToken, setResetToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const normalizedPhone = normalizePhoneNumber(phone)
      const response = await fetch('/api/auth/forgot-password/verify-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalizedPhone })
      })

      const data = await response.json()

      if (response.ok) {
        if (data.hasStudents) {
          setStudents(data.students)
          setStep('student')
        } else {
          setResetToken(data.resetToken)
          setStep('password')
        }
      } else {
        setError(data.error || 'Telefon numarası bulunamadı')
      }
    } catch {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStudentSelect = async (studentId: string) => {
    setError(null)
    setIsLoading(true)

    try {
      const normalizedPhone = normalizePhoneNumber(phone)
      const response = await fetch('/api/auth/forgot-password/verify-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalizedPhone, studentId })
      })

      const data = await response.json()

      if (response.ok) {
        setResetToken(data.resetToken)
        setStep('password')
      } else {
        setError(data.error || 'Yanlış seçim. Lütfen tekrar deneyin.')
      }
    } catch {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (newPassword.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Şifreler eşleşmiyor')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToken, newPassword })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        setError(data.error || 'Şifre sıfırlama başarısız')
      }
    } catch {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div>
          <Link
            href="/login"
            className="inline-flex items-center text-purple-600 hover:text-purple-700 transition mb-6 font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span>Giriş Sayfasına Dön</span>
          </Link>

          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Mascot mood="sit" size="small" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
              Şifremi Unuttum
            </h1>
            <p className="mt-2 text-gray-600">
              {step === 'phone' && 'Telefon numaranızı girin'}
              {step === 'student' && 'Öğrencinizi seçin'}
              {step === 'password' && 'Yeni şifrenizi belirleyin'}
            </p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/50 p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-green-800">
                Şifreniz başarıyla değiştirildi! Giriş sayfasına yönlendiriliyorsunuz...
              </p>
            </div>
          )}

          {/* Step 1: Phone Number */}
          {step === 'phone' && (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-purple-500" />
                  Telefon Numarası
                </label>
                <input
                  type="tel"
                  id="phone"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all bg-gray-50/50"
                  placeholder="0555 123 45 67"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Kontrol ediliyor...
                  </>
                ) : (
                  'Devam Et'
                )}
              </button>
            </form>
          )}

          {/* Step 2: Student Selection */}
          {step === 'student' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Güvenlik doğrulaması için aşağıdaki öğrencilerden hangisi size ait?
              </p>

              <div className="space-y-3">
                {students.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => handleStudentSelect(student.id)}
                    disabled={isLoading}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <p className="font-medium text-gray-900">{student.displayName}</p>
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  setStep('phone')
                  setError(null)
                }}
                className="w-full text-purple-600 hover:text-purple-800 text-sm font-medium"
              >
                ← Telefon numarasını değiştir
              </button>
            </div>
          )}

          {/* Step 3: New Password */}
          {step === 'password' && !success && (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-purple-500" />
                  Yeni Şifre
                </label>
                <input
                  type="password"
                  id="newPassword"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all bg-gray-50/50"
                  placeholder="En az 6 karakter"
                  minLength={6}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-purple-500" />
                  Yeni Şifre (Tekrar)
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all bg-gray-50/50"
                  placeholder="Şifreyi tekrar girin"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Şifre değiştiriliyor...
                  </>
                ) : (
                  'Şifremi Değiştir'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
