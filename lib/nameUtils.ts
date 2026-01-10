/**
 * Normalize a name: trim, lowercase, capitalize first letter of each word
 * "ALI" -> "Ali"
 * "  mehmet  " -> "Mehmet"
 * "ahmet yilmaz" -> "Ahmet Yilmaz"
 */
export function normalizeName(name: string): string {
  const trimmed = name.trim().toLowerCase();
  if (!trimmed) return "";

  return trimmed
    .split(" ")
    .filter((word) => word.length > 0)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Create a normalized student key for grouping
 * "Ali", "YILMAZ" -> "ali yilmaz"
 * Used to identify the same student regardless of capitalization
 */
export function createStudentKey(firstName: string, lastName: string): string {
  const normalizedFirst = firstName.trim().toLowerCase();
  const normalizedLast = lastName.trim().toLowerCase();
  return `${normalizedFirst} ${normalizedLast}`;
}

/**
 * Format duration in seconds to "X dk Y sn" format
 * 125 -> "2 dk 5 sn"
 * 45 -> "45 sn"
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes === 0) {
    return `${remainingSeconds} sn`;
  }

  if (remainingSeconds === 0) {
    return `${minutes} dk`;
  }

  return `${minutes} dk ${remainingSeconds} sn`;
}
