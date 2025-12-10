// Günlük sesli konuşma kullanım limiti (saniye)
export const DAILY_LIMIT_SECONDS = 10 * 60; // 10 dakika
export const MAX_SESSION_SECONDS = 5 * 60; // 5 dakika (tek konuşma)

interface UsageData {
  date: string; // YYYY-MM-DD
  usedSeconds: number;
}

const COOKIE_NAME = "kai_voice_usage";

// Bugünün tarihini YYYY-MM-DD formatında al
function getTodayDate(): string {
  const now = new Date();
  return now.toISOString().split("T")[0];
}

// Cookie'den kullanım verisini oku
export function getUsageData(): UsageData {
  if (typeof document === "undefined") {
    return { date: getTodayDate(), usedSeconds: 0 };
  }

  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === COOKIE_NAME && value) {
      try {
        const data = JSON.parse(decodeURIComponent(value)) as UsageData;
        // Tarih bugün mü kontrol et
        if (data.date === getTodayDate()) {
          return data;
        }
        // Farklı gün - sıfırla
        return { date: getTodayDate(), usedSeconds: 0 };
      } catch {
        return { date: getTodayDate(), usedSeconds: 0 };
      }
    }
  }

  return { date: getTodayDate(), usedSeconds: 0 };
}

// Cookie'ye kullanım verisini yaz
export function setUsageData(data: UsageData): void {
  if (typeof document === "undefined") return;

  const value = encodeURIComponent(JSON.stringify(data));
  // Cookie 1 gün sonra expire olsun
  const expires = new Date();
  expires.setHours(23, 59, 59, 999);
  document.cookie = `${COOKIE_NAME}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;
}

// Kullanım süresini ekle
export function addUsage(seconds: number): UsageData {
  const data = getUsageData();
  data.usedSeconds += seconds;
  setUsageData(data);
  return data;
}

// Kalan süreyi hesapla (saniye)
export function getRemainingSeconds(): number {
  const data = getUsageData();
  return Math.max(0, DAILY_LIMIT_SECONDS - data.usedSeconds);
}

// Günlük limit doldu mu?
export function isDailyLimitReached(): boolean {
  return getRemainingSeconds() <= 0;
}

// Kullanılan süreyi al (saniye)
export function getUsedSeconds(): number {
  return getUsageData().usedSeconds;
}

// Süreyi formatla (mm:ss)
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// Süreyi formatla (dakika olarak, örn: "5 dk")
export function formatDurationMinutes(seconds: number): string {
  const mins = Math.ceil(seconds / 60);
  return `${mins} dk`;
}
