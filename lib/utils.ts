// Telefon numarasını normalize et: 05XXXXXXXXX formatına çevir
export function normalizePhoneNumber(phone: string): string {
  // Tüm boşlukları ve özel karakterleri kaldır
  let cleaned = phone.replace(/[\s\-\(\)\.]/g, '')

  // +90 ile başlıyorsa kaldır ve 0 ekle
  if (cleaned.startsWith('+90')) {
    cleaned = '0' + cleaned.slice(3)
  }
  // 90 ile başlıyorsa (+ olmadan) kaldır ve 0 ekle
  else if (cleaned.startsWith('90') && cleaned.length === 12) {
    cleaned = '0' + cleaned.slice(2)
  }
  // 5 ile başlıyorsa başına 0 ekle
  else if (cleaned.startsWith('5') && cleaned.length === 10) {
    cleaned = '0' + cleaned
  }

  return cleaned
}

// Telefon numarası geçerli mi kontrol et
export function isValidPhoneNumber(phone: string): boolean {
  const normalized = normalizePhoneNumber(phone)
  // Türk cep telefonu formatı: 05XX XXX XX XX (11 hane)
  return /^05\d{9}$/.test(normalized)
}
