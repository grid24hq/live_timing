import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useTimingStore, type Series } from '../store/useTimingStore'
import { Trophy, Users, Shield, ArrowUpRight } from 'lucide-react'

interface DriverStanding {
  positie: number
  nummer: number
  naam: string
  team: string
  punten: number
  vlag: string
}

const SERIES_LABEL: Record<Series, string> = {
  f1: 'FORMULA 1',
  motogp: 'MOTOGP',
  moto2: 'MOTO2',
  moto3: 'MOTO3',
  sbk: 'WORLDSBK',
}

// ---------------------------------------------------------------------------
// Asset mapping helpers
// Los van de component gehouden zodat de JSX leesbaar blijft en er geen
// nieuwe lookup-tables per render worden aangemaakt.
// ---------------------------------------------------------------------------

const MOTOGP_DRIVER_PHOTOS: Record<string, string> = {
  'jorge martin': 'martin.webp', 'marco bezzecchi': 'bezzecchi.webp',
  'fabio di giannantonio': 'digiannantonio.webp', 'ai ogura': 'ogura.webp',
  'marc marquez': 'mmarquez.webp', 'raul fernandez': 'rfernanez.webp',
  'pedro acosta': 'acosta.webp', 'francesco bagnaia': 'bagnaia.webp',
  'alex marquez': 'amarquez.webp', 'fermin aldeguer': 'aldeguer.webp',
  'luca marini': 'marini.webp', 'enea bastianini': 'bastianini.webp',
  'brad binder': 'binder.webp', 'fabio quartararo': 'quartararo.webp',
  'jack miller': 'miller.webp', 'joan mir': 'mir.webp',
  'franco morbidelli': 'morbidelli.webp', 'diogo moreira': 'moreira.webp',
  'toprak razgatlioglu': 'razgatlioglu.webp', 'maverick vinales': 'vinales.webp',
  'johann zarco': 'zarco.webp', 'alex rins': 'rins.webp',
}

/** Coureur -> motor, rechtstreeks 1-op-1 gekoppeld (betrouwbaarder dan matchen op teamnaam-schrijfwijze). */
const MOTOGP_RIDER_BIKES: Record<string, string> = {
  'pedro acosta': 'ktm_factory_side.webp',
  'fermin aldeguer': 'gresini_side.webp',
  'alex marquez': 'gresini_side.webp',
  'francesco bagnaia': 'ducati_lenovo_side.webp',
  'enea bastianini': 'ktm_tech3_side.webp',
  'marco bezzecchi': 'aprilia_racing_side.webp',
  'brad binder': 'ktm_factory_side.webp',
  'fabio di giannantonio': 'vr46_side.webp',
  'luca marini': 'lcr_honda_side.webp',
  'jorge martin': 'aprilia_racing_side.webp',
  'jack miller': 'pramac_yamaha_side.webp',
  'joan mir': 'lcr_honda_side.webp',
  'marc marquez': 'ducati_lenovo_side.webp',
  'franco morbidelli': 'vr46_side.webp',
  'diogo moreira': 'honda_hrc_side.webp',
  'ai ogura': 'trackhouse_side.webp',
  'fabio quartararo': 'yamaha_monster_side.webp',
  'toprak razgatlioglu': 'pramac_yamaha_side.webp',
  'raul fernandez': 'trackhouse_side.webp',
  'alex rins': 'yamaha_monster_side.webp',
  'maverick vinales': 'ktm_tech3_side.webp',
  'johann zarco': 'honda_hrc_side.webp',
}

const F1_TEAM_CARS: Record<string, string> = {
  'mercedes': 'mercedes.webp', 'ferrari': 'ferrari.webp', 'red bull': 'redbull.webp', 'red bull racing': 'redbull.webp',
  'mclaren': 'mclaren.webp', 'alpine': 'alpine.webp', 'alpine f1 team': 'alpine.webp', 'aston martin': 'aston.webp',
  'aston': 'aston.webp', 'williams': 'williams.webp', 'haas': 'haas.webp', 'haas f1 team': 'haas.webp',
  'rb': 'rb.webp', 'rb f1 team': 'rb.webp', 'racing bulls': 'rb.webp', 'audi': 'audi.webp', 'cadillac': 'cadillac.webp',
}

// ── Moto2 ────────────────────────────────────────────────────────────────
// Coureur -> bestandsnaam-slug. De sleutel is de 'natuurlijke' naam (spaties),
// de waarde de exacte bestandsnaam-basis (koppeltekens) zoals die in public/ staat.
// 'mario aji' EN 'mario suryo aji' wijzen bewust allebei naar hetzelfde bestand —
// de teamlijst en de bestandsnaam gebruiken net een andere schrijfwijze.
const MOTO2_NAME_TO_SLUG: Record<string, string> = {
  'izan guevara': 'izan-guevara', 'alberto ferrandez': 'alberto-ferrandez',
  'david alonso': 'david-alonso', 'daniel holgado': 'daniel-holgado',
  'aron canet': 'aron-canet', 'deniz oncu': 'deniz-oncu',
  'celestino vietti': 'celestino-vietti', 'luca lunetta': 'luca-lunetta',
  'jorge navarro': 'jorge-navarro', 'alex escrig': 'alex-escrig',
  'taiyo furusato': 'taiyo-furusato', 'mario aji': 'mario-suryo-aji', 'mario suryo aji': 'mario-suryo-aji',
  'sergio garcia': 'sergio-garcia', 'alonso lopez': 'alonso-lopez',
  'adrian huertas': 'adrian-huertas', 'daniel munoz': 'daniel-munoz',
  'manuel gonzalez': 'manuel-gonzalez', 'senna agius': 'senna-agius',
  'joe roberts': 'joe-roberts', 'filip salac': 'filip-salac',
  'ivan ortola': 'ivan-ortola', 'angel piqueras': 'angel-piqueras',
  'collin veijer': 'collin-veijer', 'jose antonio rueda': 'jose-antonio-rueda',
  'tony arbolino': 'tony-arbolino', 'barry baltus': 'barry-baltus',
  'zonta van den goorbergh': 'zonta-van-den-goorbergh', 'ayumu sasaki': 'ayumu-sasaki',
  'zonta vd goorbergh': 'zonta-van-den-goorbergh',
  'xabi zurutuza': 'xabi-zurutuza',
}
// Slugs met een staande (200x300) foto — favoriet, want consistent met MotoGP/SBK
const MOTO2_STANDING_AVAILABLE = new Set([
  'alberto-ferrandez', 'alonso-lopez', 'angel-piqueras', 'aron-canet', 'ayumu-sasaki',
  'barry-baltus', 'celestino-vietti', 'collin-veijer', 'daniel-holgado', 'david-alonso',
  'deniz-oncu', 'filip-salac', 'ivan-ortola', 'izan-guevara', 'joe-roberts', 'jorge-navarro',
  'jose-antonio-rueda', 'luca-lunetta', 'manuel-gonzalez', 'mario-suryo-aji', 'senna-agius',
  'sergio-garcia', 'taiyo-furusato', 'tony-arbolino', 'zonta-van-den-goorbergh',
  'xabi-zurutuza', 'daniel-munoz', 'alex-escrig', 'adrian-huertas',
])
// Slugs met een halve (900x700) foto — fallback voor de 3 coureurs zonder staande foto
const MOTO2_HALFBODY_AVAILABLE = new Set([
  'adrian-huertas', 'alberto-ferrandez', 'alex-escrig', 'alonso-lopez', 'angel-piqueras',
  'aron-canet', 'ayumu-sasaki', 'barry-baltus', 'celestino-vietti', 'collin-veijer',
  'daniel-holgado', 'daniel-munoz', 'david-alonso', 'deniz-oncu', 'filip-salac', 'ivan-ortola',
  'izan-guevara', 'joe-roberts', 'jose-antonio-rueda', 'luca-lunetta', 'manuel-gonzalez',
  'mario-suryo-aji', 'senna-agius', 'sergio-garcia', 'taiyo-furusato', 'tony-arbolino',
  'zonta-van-den-goorbergh',
])
// Team -> motorfoto. Slechts 14 foto's voor 28 coureurs (1 per team, voorkant met
// rugnummer) — exact zoals MotoGP.com dit zelf ook doet voor teamgenoten.
const MOTO2_TEAM_BIKES: Record<string, string> = {
  'blu cru pramac yamaha moto2': '28-M2-Izan-Guevara-Bike.webp', 'blu cru pramac yamaha': '28-M2-Izan-Guevara-Bike.webp',
  'cfmoto aspar team': '80-M2-David-Alonso-Bike.webp', 'aspar team': '80-M2-David-Alonso-Bike.webp',
  'cfmoto azul marino aspar team': '80-M2-David-Alonso-Bike.webp',
  'elf marc vds racing team': '44-M2-Aron-Canet-Bike.webp', 'marc vds': '44-M2-Aron-Canet-Bike.webp',
  'speedrs team': '13-M2-Celestino-Vietti-Bike.webp', 'hdr speedrs team': '13-M2-Celestino-Vietti-Bike.webp',
  'klint racing team': '09-M2-Jorge-Navarro-Bike.webp',
  'idemitsu honda team asia': '72-M2-Taiyo-Furusato-Bike.webp', 'honda team asia': '72-M2-Taiyo-Furusato-Bike.webp',
  'italjet gresini moto2': '21-M2-Alonso-Lopez-Bike.webp', 'gresini racing moto2': '21-M2-Alonso-Lopez-Bike.webp',
  'italtrans racing team': '99-M2-Adrian-Huertas-Bike.webp',
  'liqui moly dynavolt intact gp': '18-M2-Manuel-Gonzalez-Bike.webp', 'intact gp': '18-M2-Manuel-Gonzalez-Bike.webp',
  'onlyfans american racing team': '12-M2-Filip-Salac-Bike.webp', 'american racing team': '12-M2-Filip-Salac-Bike.webp',
  'qjmotor - msi': '04-M2-Ivan-Ortola-Bike.webp', 'qjmotor msi': '04-M2-Ivan-Ortola-Bike.webp',
  'qj motor - galfer - msi': '04-M2-Ivan-Ortola-Bike.webp', 'qj motor galfer msi': '04-M2-Ivan-Ortola-Bike.webp',
  'qjmotor - xeramic - msi': '04-M2-Ivan-Ortola-Bike.webp', 'qjmotor xeramic msi': '04-M2-Ivan-Ortola-Bike.webp',
  'red bull ktm ajo': '95-M2-Collin-Veijer-Bike.webp', 'ktm ajo': '95-M2-Collin-Veijer-Bike.webp',
  'reds fantic racing': '07-M2-Barry-Baltus-Bike.webp', 'fantic racing': '07-M2-Barry-Baltus-Bike.webp',
  'momoven idrofoglia rw racing team': '71-M2-Ayumu-Sasaki-Bike.webp', 'rw racing team': '71-M2-Ayumu-Sasaki-Bike.webp',
}

// ── Moto3 ────────────────────────────────────────────────────────────────
// Coureur -> bestandsnaam-slug. Alle 26 coureurs staan in coureurs_staand
// (geen aparte halve-foto-map zoals bij Moto2), dus geen terugval nodig.
// Namen met een apostrof (O'Shea, O'Gorman) krijgen bewust een paar extra
// schrijfwijzen mee, want Firebase/Dorna is daar wisselvallig in.
const MOTO3_NAME_TO_SLUG: Record<string, string> = {
  'ryusei yamanaka': 'ryusei-yamanaka', 'hakim danish': 'hakim-danish',
  'maximo quiles': 'maximo-quiles', 'marco morelli': 'marco-morelli',
  'adrian cruces': 'adrian-cruces', 'scott ogden': 'scott-ogden',
  'cormac buchanan': 'cormac-buchanan', 'ruche moodley': 'ruche-moodley',
  'eddie o shea': 'eddie-o-shea', "eddie o'shea": 'eddie-o-shea', 'eddie oshea': 'eddie-o-shea',
  'joel kelso': 'joel-kelso',
  'veda pratama': 'veda-pratama', 'zen mitani': 'zen-mitani',
  'adrian fernandez': 'adrian-fernandez', 'guido pini': 'guido-pini',
  'matteo bertelle': 'matteo-bertelle', 'joel esteban': 'joel-esteban',
  'david almansa': 'david-almansa', 'david munoz': 'david-munoz',
  'brian uriarte': 'brian-uriarte', 'alvaro carpe': 'alvaro-carpe',
  'rico salmela': 'rico-salmela', 'valentin perrone': 'valentin-perrone',
  'nicola carraro': 'nicola-carraro', 'jesus rios': 'jesus-rios',
  'leo rammerstorfer': 'leo-rammerstorfer',
  'casey o gorman': 'casey-o-gorman', "casey o'gorman": 'casey-o-gorman', 'casey ogorman': 'casey-o-gorman',
}
// Bikes zijn hier per team benoemd (niet per rijder zoals bij Moto2) — simpeler koppelen.
const MOTO3_TEAM_BIKES: Record<string, string> = {
  'aeon credit - mt helmets - msi': 'aeon-credit-mt-helmets-msi.webp', 'aeon credit mt helmets msi': 'aeon-credit-mt-helmets-msi.webp',
  'cfmoto gaviota aspar team': 'cfmoto-gaviota-aspar-team.webp', 'gaviota aspar team': 'cfmoto-gaviota-aspar-team.webp',
  'cip green power': 'cip-green-power.webp',
  'code motorsports': 'code-motorsports.webp',
  'gryd racing': 'gryd-racing.webp',
  'honda team asia': 'honda-team-asia.webp',
  'leopard racing': 'leopard-racing.webp',
  'level up - mta': 'level-up-mta.webp', 'level up mta': 'level-up-mta.webp',
  'liqui moly dynavolt intact gp': 'liqui-moly-dynavolt-intact-gp.webp', 'intact gp': 'liqui-moly-dynavolt-intact-gp.webp',
  'red bull ktm ajo': 'red-bull-ktm-ajo.webp', 'ktm ajo': 'red-bull-ktm-ajo.webp',
  'red bull ktm tech3': 'red-bull-ktm-tech3.webp', 'ktm tech3': 'red-bull-ktm-tech3.webp',
  'rivacold snipers team': 'rivacold-snipers-team.webp', 'snipers team': 'rivacold-snipers-team.webp',
  'sic58 squadra corse': 'sic58-squadra-corse.webp',
}

const FALLBACK_IMG = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg"/>'

/** Haalt accenten weg (Viñales -> Vinales) zodat naam-matching niet struikelt over diakritische tekens. */
function stripAccents(naam: string): string {
  return naam.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

/** SBK-bestanden zijn benoemd als 'voornaam_achternaam.webp' (spaties -> underscores). */
function toSbkFileName(naam: string): string {
  return naam.toLowerCase().trim().replace(/\s+/g, '_')
}
const SBK_FALLBACK_DRIVER = 'alvaro_bautista'

/** Bepaalt het pad naar de staande full-body coureursfoto. */
function getDriverPhotoUrl(driver: DriverStanding | null, series: Series): string {
  if (!driver?.naam) return FALLBACK_IMG
  const cleanName = stripAccents(driver.naam.toLowerCase().trim())

  if (series === 'motogp') {
    const file = MOTOGP_DRIVER_PHOTOS[cleanName] ?? 'martin.webp'
    return `/moto_gp/coureurs_staand/${file}`
  }

  if (series === 'moto2') {
    const slug = MOTO2_NAME_TO_SLUG[cleanName]
    if (slug && MOTO2_STANDING_AVAILABLE.has(slug)) return `/moto_2/coureurs_staand/${slug}.webp`
    if (slug && MOTO2_HALFBODY_AVAILABLE.has(slug)) return `/moto_2/coureurs/${slug}.webp`
    return FALLBACK_IMG
  }

  if (series === 'moto3') {
    const slug = MOTO3_NAME_TO_SLUG[cleanName]
    return slug ? `/moto_3/coureurs_staand/${slug}.webp` : FALLBACK_IMG
  }

  if (series === 'sbk') {
    return `/sbk/coureurs/${toSbkFileName(cleanName) || SBK_FALLBACK_DRIVER}.webp`
  }

  const lastName = cleanName.split(' ').filter(Boolean).pop() ?? ''
  if (!lastName) return FALLBACK_IMG
  return `/${series}/coureurs/${lastName}.webp`
}

/** Bepaalt het pad naar de wagen/motor-foto (zijaanzicht). Voor SBK is dit per coureur, niet per team. */
function getTeamMachineUrl(driver: DriverStanding | null, series: Series): string {
  if (series === 'sbk') {
    if (!driver?.naam) return FALLBACK_IMG
    return `/sbk/bikes/${toSbkFileName(driver.naam) || SBK_FALLBACK_DRIVER}_bike_side.webp`
  }

  if (series === 'motogp') {
    if (!driver?.naam) return FALLBACK_IMG
    const cleanName = stripAccents(driver.naam.toLowerCase().trim())
    const file = MOTOGP_RIDER_BIKES[cleanName] ?? 'ducati_lenovo_side.webp'
    return `/moto_gp/bikes/${file}`
  }

  if (series === 'moto2') {
    if (!driver?.team) return FALLBACK_IMG
    const teamKey = driver.team.toLowerCase().trim()
    const file = MOTO2_TEAM_BIKES[teamKey]
    return file ? `/moto_2/bikes/${file}` : FALLBACK_IMG
  }

  if (series === 'moto3') {
    if (!driver?.team) return FALLBACK_IMG
    const teamKey = driver.team.toLowerCase().trim()
    const file = MOTO3_TEAM_BIKES[teamKey]
    return file ? `/moto_3/bikes/${file}` : FALLBACK_IMG
  }

  if (!driver?.team) return FALLBACK_IMG
  const teamKey = driver.team.toLowerCase().trim()

  const file = F1_TEAM_CARS[teamKey] ?? 'mercedes.webp'
  return `/${series}/cars/${file}`
}

/** Bepaalt het pad naar de vlag van de coureur, of null als er geen vlag-data is. */
function getFlagUrl(vlag: string | undefined | null): string | null {
  if (!vlag || !vlag.trim()) return null
  return `/vlaggen/${vlag.trim().toLowerCase()}.webp`
}

export default function Standen() {
  const { t } = useTranslation()
  const { selectedSeries, setSelectedSeries } = useTimingStore()

  const [standings, setStandings] = useState<DriverStanding[]>([])
  const [selectedDriver, setSelectedDriver] = useState<DriverStanding | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    const baseUrl = 'https://grid24hq-live-timing-default-rtdb.europe-west1.firebasedatabase.app'
    let url = ''

    if (selectedSeries === 'motogp' || selectedSeries === 'moto2' || selectedSeries === 'moto3') {
      const klasseNaam = selectedSeries === 'motogp' ? 'MotoGP' : selectedSeries === 'moto2' ? 'Moto2' : 'Moto3'
      url = `${baseUrl}/MotoGP/2026/championship_standings/${klasseNaam}/riders.json`
    } else if (selectedSeries === 'sbk') {
      url = `${baseUrl}/WorldSBK/2026/championship_standings/SBK/riders.json`
    } else {
      url = `${baseUrl}/F1/2026/championship_standings/Drivers/riders.json`
    }

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`Firebase HTTP error! status: ${res.status}`)
        return res.json()
      })
      .then((data) => {
        if (cancelled) return

        if (!data) {
          setStandings([])
          setSelectedDriver(null)
          return
        }

        const parsedData = Array.isArray(data) ? data : Object.values(data)

        // Kogelvrij: filter niet alleen null/undefined, maar ook records
        // zonder een geldige naam — die kunnen verderop niet gerenderd worden.
        let cleanData = parsedData.filter(
          (item): item is DriverStanding =>
            !!item && typeof item === 'object' && typeof (item as DriverStanding).naam === 'string'
        )

        // De bron-API (Dorna/PulseLive) mengt soms losse wildcard-/testrijders
        // door de seizoensstand heen. Die staan altijd onderaan (laagste
        // punten), dus we knippen op het echte aantal vaste grid-coureurs.
        // MotoGP: wildcard-rijders staan doorgaans onderaan, dus afkappen op
        // positie werkt daar prima. Moto2 bleek dat niet waterdicht (een
        // wildcard kan een vaste rijder met weinig punten voorbijstreven),
        // dus daar filteren we expliciet op de bekende 28 namen i.p.v. te
        // vertrouwen op de positie in de stand.
        if (selectedSeries === 'moto2') {
          cleanData = cleanData.filter((r) => {
            const naam = stripAccents(r.naam.toLowerCase().trim())
            return naam in MOTO2_NAME_TO_SLUG
          })
        } else if (selectedSeries === 'moto3') {
          cleanData = cleanData.filter((r) => {
            const naam = stripAccents(r.naam.toLowerCase().trim())
            return naam in MOTO3_NAME_TO_SLUG
          })
        } else {
          const GRID_GROOTTE: Partial<Record<Series, number>> = { motogp: 22 }
          const maxRiders = GRID_GROOTTE[selectedSeries]
          if (maxRiders) {
            cleanData = [...cleanData].sort((a, b) => (a.positie ?? 999) - (b.positie ?? 999)).slice(0, maxRiders)
          }
        }

        setStandings(cleanData)
        setSelectedDriver(cleanData.length > 0 ? cleanData[0] : null)
      })
      .catch((err) => {
        if (cancelled) return
        console.error('GRID24HQ Sync Fout:', err)
        setStandings([])
        setSelectedDriver(null)
        setError('Kon de standen niet ophalen. Probeer het later opnieuw.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [selectedSeries])

  return (
    <div className="min-h-screen bg-[#060709] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900/10 via-[#060709] to-[#040507] text-gray-250 select-none">

      {/* TABS MENU */}
      <div className="flex border-b border-gray-900 bg-black/20 overflow-x-auto max-w-7xl mx-auto mt-4 rounded-t-xl">
        {(Object.keys(SERIES_LABEL) as Series[]).map((series) => (
          <button
            key={series}
            onClick={() => setSelectedSeries(series)}
            className={`px-6 py-4 font-mono text-xs font-bold tracking-widest transition-all relative uppercase whitespace-nowrap
              ${selectedSeries === series ? 'text-white border-b-2 border-red-500' : 'text-gray-500 hover:text-gray-300'}
            `}
          >
            {SERIES_LABEL[series]}
          </button>
        ))}
      </div>

      {/* DRIBBBLE SPLIT-SCREEN LAYOUT */}
      <main className="mx-auto max-w-7xl px-4 md:px-0 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LINKERKANT: Tabel */}
        <section className="lg:col-span-2 bg-[#0b0d13]/50 backdrop-blur-md border border-gray-950 rounded-2xl overflow-hidden shadow-2xl min-h-[600px]">
          <div className="px-6 py-4 border-b border-gray-900 flex justify-between items-center">
            <h2 className="text-lg font-bold text-white tracking-wide uppercase flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              {t('standings.title', 'Wereldkampioenschap Stand')}
            </h2>
            <span className="text-[10px] font-mono font-bold text-gray-500">SEASON_2026_MATRIX</span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-3">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-800 border-t-red-500" />
              <span className="font-mono text-xs text-gray-500 uppercase tracking-wider">Syncing Firebase Pipeline...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-40 gap-2 text-center px-6">
              <span className="font-mono text-xs text-red-500 uppercase tracking-wider">{error}</span>
            </div>
          ) : standings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-40 gap-2 text-center px-6">
              <Users className="w-6 h-6 text-gray-700" />
              <span className="font-mono text-xs text-gray-500 uppercase tracking-wider">
                Geen standen beschikbaar voor {SERIES_LABEL[selectedSeries]}
              </span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black/10 border-b border-gray-900">
                    <th className="px-6 py-3 font-mono text-[10px] font-bold text-gray-500 uppercase tracking-widest w-16">POS</th>
                    <th className="px-4 py-3 font-mono text-[10px] font-bold text-gray-500 uppercase tracking-widest">COUREUR</th>
                    <th className="px-4 py-3 font-mono text-[10px] font-bold text-gray-500 uppercase tracking-widest">TEAM</th>
                    <th className="px-6 py-3 font-mono text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right w-24">PUNTEN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-900/30 text-sm font-medium">
                  {standings.map((driver, idx) => {
                    const flagUrl = getFlagUrl(driver.vlag)
                    return (
                      <tr
                        key={driver.nummer ?? `${driver.naam}-${idx}`}
                        onClick={() => setSelectedDriver(driver)}
                        className={`group cursor-pointer transition-all duration-150 hover:bg-white/[0.015]
                          ${selectedDriver?.naam === driver.naam ? 'bg-white/[0.025] border-l-2 border-red-500' : ''}
                        `}
                      >
                        <td className="px-6 py-4 font-mono font-black text-base tabular-nums text-gray-400 group-hover:text-white">
                          {driver.positie ?? '—'}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            {flagUrl && (
                              <img
                                src={flagUrl}
                                alt={driver.vlag}
                                className="w-6 h-4 object-cover rounded-sm border border-gray-950/60 shadow-sm opacity-90 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                              />
                            )}
                            <span className="font-mono text-sm font-bold uppercase tracking-wide text-gray-200 group-hover:text-white">
                              {driver.naam}
                            </span>
                            <span className="text-[10px] font-mono text-gray-600">#{driver.nummer ?? '—'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 font-mono text-xs text-gray-400 group-hover:text-gray-300">
                          {driver.team ?? '—'}
                        </td>
                        <td className="px-6 py-4 font-mono text-sm font-black text-right text-white tabular-nums">
                          {driver.punten ?? 0}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* RECHTERKANT: Paspoort */}
        <section className="bg-[#0b0d13]/60 backdrop-blur-md border border-gray-950 rounded-2xl p-6 shadow-2xl flex flex-col justify-between sticky top-24 min-h-[600px]">
          {selectedDriver ? (
            <div className="flex flex-col h-full">

              {/* TOP PASPOORT INFO MET RECHTOPSTAANDE FOTO */}
              <div className="relative border-b border-gray-900 pb-6 mb-6 flex flex-col items-center overflow-hidden rounded-xl bg-gradient-to-b from-gray-950/40 to-transparent p-4">
                <div className="w-full h-72 flex items-center justify-center overflow-hidden relative rounded-xl bg-gradient-to-b from-gray-800/40 via-gray-900/20 to-black/10 border border-gray-900/30 p-2">
                  {/* Zachte lichtgloed ACHTER de foto — geen donkere overlay er meer overheen */}
                  <div className="absolute w-40 h-40 bg-red-500/10 rounded-full blur-3xl top-6 pointer-events-none z-0" />
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/25 to-transparent pointer-events-none z-0" />

                  <img
                    key={getDriverPhotoUrl(selectedDriver, selectedSeries)}
                    src={getDriverPhotoUrl(selectedDriver, selectedSeries)}
                    alt={selectedDriver.naam}
                    className="relative z-10 h-full w-auto object-contain transform hover:scale-105 transition-transform duration-500 ease-out brightness-125 contrast-105"
                    onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.05' }}
                  />
                </div>

                <div className="text-center mt-4 z-20">
                  <span className="inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-gray-900 text-gray-400 border border-gray-800 mb-2 tracking-widest">
                    TELEMETRY_ID_{selectedDriver.nummer ?? '—'}
                  </span>
                  <h3 className="text-xl font-black font-mono tracking-wide text-white uppercase">
                    {selectedDriver.naam}
                  </h3>
                  <p className="text-xs text-red-500 font-mono mt-1 font-bold tracking-wide uppercase">
                    {selectedDriver.team ?? '—'}
                  </p>
                </div>
              </div>

              {/* DYNAMISCHE MACHINE INTEGRATIE */}
              <div className="w-full mt-4 px-2 relative group overflow-hidden border-t border-b border-gray-900/40 py-4 bg-black/10 rounded-xl">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/[0.02] to-transparent pointer-events-none" />
                <img
                  key={getTeamMachineUrl(selectedDriver, selectedSeries)}
                  src={getTeamMachineUrl(selectedDriver, selectedSeries)}
                  alt="Machine"
                  className="relative z-10 w-full h-auto max-h-24 object-contain transform group-hover:translate-x-1 transition-transform duration-500 ease-out"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              </div>

              {/* STATISTIEKEN GRID */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-black/20 border border-gray-900 rounded-xl p-4 hover:border-gray-800 transition-colors">
                  <span className="block text-[9px] font-bold font-mono tracking-widest text-gray-500 uppercase mb-1">CHAMPIONSHIP RANK</span>
                  <span className="text-3xl font-black font-mono text-yellow-500 tabular-nums">P{selectedDriver.positie ?? '—'}</span>
                </div>
                <div className="bg-black/20 border border-gray-900 rounded-xl p-4 hover:border-gray-800 transition-colors">
                  <span className="block text-[9px] font-bold font-mono tracking-widest text-gray-500 uppercase mb-1">TOTAL POINTS</span>
                  <span className="text-3xl font-black font-mono text-white tabular-nums">{selectedDriver.punten ?? 0}</span>
                </div>
                <div className="bg-black/20 border border-gray-900 rounded-xl p-4 hover:border-gray-800 transition-colors">
                  <span className="block text-[9px] font-bold font-mono tracking-widest text-gray-500 uppercase mb-1">RACE NUMBER</span>
                  <span className="text-3xl font-black font-mono text-red-500 tabular-nums">#{selectedDriver.nummer ?? '—'}</span>
                </div>
                <div className="bg-black/20 border border-gray-900 rounded-xl p-4 hover:border-gray-800 transition-colors flex flex-col justify-between">
                  <div>
                    <span className="block text-[9px] font-bold font-mono tracking-widest text-gray-500 uppercase mb-1">SERIES / STATUS</span>
                    <span className="text-sm font-black font-mono text-gray-300 block uppercase tracking-wider">{selectedSeries} CONTENDER</span>
                  </div>
                  <span className="text-[9px] font-mono text-gray-600 uppercase tracking-tight mt-2 block">TELEMETRY_OK // 2026</span>
                </div>
              </div>

              {/* PREVIEW CARD */}
              <div className="mt-8 p-5 bg-gradient-to-br from-gray-950 to-[#0b0d13] border border-gray-900 rounded-xl relative overflow-hidden group">
                <div className="absolute right-0 bottom-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl" />
                <div className="flex items-center justify-between mb-2">
                  <Shield className="w-5 h-5 text-gray-600" />
                  <ArrowUpRight className="w-4 h-4 text-gray-700 group-hover:text-white transition-colors" />
                </div>
                <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wide">Machine Telemetry Spec</h4>
                <p className="text-[11px] text-gray-500 mt-1">Klik op de coureur om de volledige technische specificaties en motorconfiguraties in te laden.</p>
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-600 font-mono text-xs">
              Selecteer een coureur uit de tabel om het analytics paspoort te activeren.
            </div>
          )}
        </section>

      </main>
    </div>
  )
}
