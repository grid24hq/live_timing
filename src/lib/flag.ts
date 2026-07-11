// Zet een ISO 3166-1 alpha-2 landcode (bv "nl") om in een vlagemoji (🇳🇱).
// Zo hebben we geen losse vlag-afbeeldingen nodig in public/.
export function flagEmoji(countryCode?: string): string {
  if (!countryCode || countryCode.length !== 2) return ''
  const code = countryCode.toUpperCase()
  const A = 0x1f1e6 // regional indicator "A"
  const chars = [...code].map((c) => A + (c.charCodeAt(0) - 65))
  if (chars.some((c) => c < A || c > A + 25)) return ''
  return String.fromCodePoint(...chars)
}
