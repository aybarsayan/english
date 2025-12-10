'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Phone, Lock, Loader2 } from 'lucide-react'
import Mascot from '@/components/Mascot'
import { normalizePhoneNumber, isValidPhoneNumber } from '@/lib/utils'

export default function LoginPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [mascotMood, setMascotMood] = useState<'happy' | 'celebrating'>('happy')

  // Load remembered phone on mount
  useEffect(() => {
    const rememberedPhone = localStorage.getItem('rememberedPhone')
    if (rememberedPhone) {
      setPhone(rememberedPhone)
      setRememberMe(true)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!phone.trim()) {
      setError('Telefon numarası gereklidir')
      return
    }

    if (!isValidPhoneNumber(phone)) {
      setError('Geçerli bir telefon numarası girin')
      return
    }

    if (!password.trim()) {
      setError('Şifre gereklidir')
      return
    }

    setIsLoading(true)

    try {
      const normalizedPhone = normalizePhoneNumber(phone)
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalizedPhone, password }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('parent', JSON.stringify(data.parent))

        if (rememberMe) {
          localStorage.setItem('rememberedPhone', phone)
        } else {
          localStorage.removeItem('rememberedPhone')
        }

        setMascotMood('celebrating')
        setTimeout(() => router.push('/'), 800)
      } else {
        setError(data.error || 'Giriş yapılırken bir hata oluştu')
      }
    } catch {
      setError('Bağlantı hatası. Lütfen tekrar deneyin.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 relative z-10">
        {/* Mascot */}
        <div className="flex justify-center">
          <Mascot mood={mascotMood} size="medium" />
        </div>

        {/* Title */}
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
            Kai&apos;ya Hoş Geldiniz!
          </h1>
          <p className="text-gray-600 mt-2">
            İngilizce öğrenme macerasına başlamak için giriş yapın
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/50 p-6 space-y-4">
            {/* Phone Input */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Phone className="h-4 w-4 text-purple-500" />
                Telefon Numarası
              </label>
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all bg-gray-50/50"
                placeholder="0555 123 45 67"
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Lock className="h-4 w-4 text-purple-500" />
                Şifre
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all bg-gray-50/50"
                placeholder="••••••••"
              />
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-2 text-sm text-gray-600 cursor-pointer">
                Beni hatırla
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Giriş yapılıyor...
              </>
            ) : (
              <>
                Giriş Yap
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500">
          Kariyer Koleji Veli Portalı
        </p>
      </div>
    </div>
  )
}
