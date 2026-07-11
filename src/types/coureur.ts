export type CoureurSeries = 'f1' | 'motogp' | 'sbk'

interface BaseCoureur {
  id: string // slug, gebruikt in bestandsnamen, bv "verstappen"
  name: string // weergavenaam, bv "Max Verstappen"
  team: string // teamnaam, bv "Red Bull Racing" (leeg "" = nog invullen)
  number?: number
  countryCode?: string // ISO 3166-1 alpha-2, lowercase (bv "nl") — voor vlagemoji
  birthDate?: string // bv "30 sep. 1997"
  age?: number
  birthPlace?: string
  height?: string // bv "1.81 m"
  debut?: string // bv "2015, Australië"
  worldTitles?: number
}

export interface F1Coureur extends BaseCoureur {
  series: 'f1'
  photo: string // public/f1/coureurs/<id>.webp
  carImage: string // public/f1/cars/<teamSlug>.webp
  carModel?: string
  engine?: string
  chassis?: string
  tires?: string
  carDescription?: string
}

export interface MotoGPCoureur extends BaseCoureur {
  series: 'motogp'
  photo: string // public/moto_gp/coureurs/<id>.webp (liggend, gebruikt in de kaartjes)
  photoStanding?: string // public/moto_gp/coureurs_staand/<id>.webp (staand, gebruikt in de popup)
  bikeFront: string // public/moto_gp/bikes/<...>_front.webp
  bikeSide: string // public/moto_gp/bikes/<team>_side.webp (gedeeld per team)
  bikeModel?: string
  engine?: string
  bikeDescription?: string
}

export interface SbkCoureur extends BaseCoureur {
  series: 'sbk'
  photo: string // public/sbk/coureurs/<id>.webp
  helmet: string // public/sbk/helmet/<id>_helmet.webp
  bikeFront: string
  bikeSide: string
  bike45: string
  bikeModel?: string
  engine?: string
  bikeDescription?: string
}

export type Coureur = F1Coureur | MotoGPCoureur | SbkCoureur
