// Zet een landcode (bv "nl", of een regio-variant zoals "es-ct" voor Catalonië,
// "gb-sct" voor Schotland) om in het pad naar de bijbehorende vlag-afbeelding
// in public/vlaggen. De afbeeldingen zijn ronde vlag-iconen van 512x512px (webp).
export function flagSrc(countryCode?: string): string | undefined {
  if (!countryCode) return undefined
  const code = countryCode.toLowerCase()
  return `/vlaggen/${code}.webp`
}
