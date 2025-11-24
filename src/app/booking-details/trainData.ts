// بيانات القطارات لكل مسار وتاريخ

import { STATION_CODES } from './constants'

export interface TrainTrip {
  id: number
  trainNumber: string
  departure: string
  arrival: string
  departureStation: string
  arrivalStation: string
  stops: string
  duration: string
  economyPrice: number
  businessPrice: number
  economySaver: number
}

export interface RouteTrains {
  [dateKey: string]: TrainTrip[]
}

export interface TrainData {
  [routeKey: string]: RouteTrains
}

type RouteProfile = {
  durationMinutes: number
  economyBase: number
  businessBase: number
}

const DATE_KEYS = [
  '١٣ نوفمبر ٢٠٢٥',
  '١٤ نوفمبر ٢٠٢٥',
  '١٥ نوفمبر ٢٠٢٥',
  '١٦ نوفمبر ٢٠٢٥',
  '١٧ نوفمبر ٢٠٢٥',
  '١٨ نوفمبر ٢٠٢٥'
]

const TIME_SLOTS = [
  '05:15',
  '06:45',
  '08:30',
  '10:15',
  '12:45',
  '14:30',
  '16:15',
  '18:45',
  '21:15'
]

// نفس تعريف المسارات المتاحة المستخدم في شاشة البحث
const AVAILABLE_ROUTES: Record<string, string[]> = {
  'الرياض': ['الدمام', 'القصيم', 'حائل', 'الجوف', 'القريات', 'المجمعة'],
  'الهفوف': ['الرياض', 'الدمام', 'بقيق'],
  'بقيق': ['الرياض', 'الدمام', 'الهفوف'],
  'الدمام': ['الرياض', 'الهفوف', 'بقيق', 'القصيم'],
  'المجمعة': ['الرياض', 'القصيم'],
  'القصيم': ['الرياض', 'الدمام', 'حائل', 'المجمعة'],
  'حائل': ['الرياض', 'القصيم', 'الجوف'],
  'الجوف': ['الرياض', 'حائل', 'القريات'],
  'القريات': ['الرياض', 'الجوف']
}

const DEFAULT_PROFILE: RouteProfile = {
  durationMinutes: 120,
  economyBase: 95,
  businessBase: 150
}

const ROUTE_PROFILES: Record<string, RouteProfile> = {
  'ABQ-DMM': { durationMinutes: 60, economyBase: 120, businessBase: 185 },
  'ABQ-HAF': { durationMinutes: 40, economyBase: 95, businessBase: 145 },
  'ABQ-RYD': { durationMinutes: 150, economyBase: 135, businessBase: 205 },
  'DMM-HAF': { durationMinutes: 75, economyBase: 125, businessBase: 190 },
  'DMM-QSM': { durationMinutes: 240, economyBase: 150, businessBase: 235 },
  'HAF-RYD': { durationMinutes: 150, economyBase: 120, businessBase: 185 },
  'MAJ-QSM': { durationMinutes: 60, economyBase: 85, businessBase: 130 },
  'QSM-HAI': { durationMinutes: 120, economyBase: 90, businessBase: 145 },
  'RYD-DMM': { durationMinutes: 210, economyBase: 130, businessBase: 205 },
  'RYD-QSM': { durationMinutes: 135, economyBase: 110, businessBase: 170 },
  'RYD-HAI': { durationMinutes: 210, economyBase: 140, businessBase: 210 },
  'RYD-JAU': { durationMinutes: 300, economyBase: 165, businessBase: 240 },
  'RYD-QUR': { durationMinutes: 360, economyBase: 185, businessBase: 270 },
  'RYD-MAJ': { durationMinutes: 90, economyBase: 90, businessBase: 140 },
  'HAI-JAU': { durationMinutes: 180, economyBase: 125, businessBase: 190 },
  'JAU-QUR': { durationMinutes: 120, economyBase: 105, businessBase: 160 }
}

const MAX_TRIPS_PER_DAY = 4

export const trainData: TrainData = buildTrainData()

function buildTrainData(): TrainData {
  const data: TrainData = {}
  let globalId = 1

  Object.entries(AVAILABLE_ROUTES).forEach(([fromName, destinations]) => {
    const fromCode = getStationCode(fromName)
    destinations.forEach((toName) => {
      const toCode = getStationCode(toName)
      const routeKey = `${fromCode}-${toCode}`
      const profile = getRouteProfile(fromCode, toCode)
      const routeDates: RouteTrains = {}

      DATE_KEYS.forEach((dateKey) => {
        const trips = generateTripsForDate({
          fromCode,
          toCode,
          dateKey,
          profile,
          seedKey: `${routeKey}-${dateKey}`,
          getNextId: () => globalId++
        })
        routeDates[dateKey] = trips
      })

      const totalTrips = Object.values(routeDates).reduce((sum, trips) => sum + trips.length, 0)
      if (totalTrips === 0) {
        routeDates[DATE_KEYS[0]] = [
          createTrip({
            fromCode,
            toCode,
            departure: TIME_SLOTS[0],
            profile,
            seedKey: `${routeKey}-fallback`,
            getNextId: () => globalId++
          })
        ]
      }

      data[routeKey] = routeDates
    })
  })

  return data
}

type GenerateTripsParams = {
  fromCode: string
  toCode: string
  dateKey: string
  profile: RouteProfile
  seedKey: string
  getNextId: () => number
}

function generateTripsForDate(params: GenerateTripsParams): TrainTrip[] {
  const { fromCode, toCode, profile, seedKey, getNextId } = params
  const count = Math.floor(seededRandom(`${seedKey}-count`) * (MAX_TRIPS_PER_DAY + 1))
  if (count === 0) {
    return []
  }

  const slots = getSlotsForSeed(`${seedKey}-slots`)
  const trips: TrainTrip[] = []
  for (let i = 0; i < count; i++) {
    trips.push(
      createTrip({
        fromCode,
        toCode,
        departure: slots[i],
        profile,
        seedKey: `${seedKey}-${i}`,
        getNextId
      })
    )
  }
  return trips
}

type CreateTripParams = {
  fromCode: string
  toCode: string
  departure: string
  profile: RouteProfile
  seedKey: string
  getNextId: () => number
}

function createTrip(params: CreateTripParams): TrainTrip {
  const { fromCode, toCode, departure, profile, seedKey, getNextId } = params
  const arrival = addMinutesToTime(departure, profile.durationMinutes)
  const variation = Math.round(seededRandom(`${seedKey}-price`) * 12)
  const economyPrice = Number((profile.economyBase + variation).toFixed(2))
  const businessPrice = Number((profile.businessBase + variation * 1.5).toFixed(2))
  const saverPrice = Math.max(30, Number((economyPrice - 15).toFixed(2)))

  return {
    id: getNextId(),
    trainNumber: generateTrainNumber(seedKey),
    departure,
    arrival,
    departureStation: fromCode,
    arrivalStation: toCode,
    stops: seededRandom(`${seedKey}-stops`) > 0.2 ? 'مباشر' : 'محطة واحدة',
    duration: minutesToDuration(profile.durationMinutes),
    economyPrice,
    businessPrice,
    economySaver: saverPrice
  }
}

function getSlotsForSeed(seed: string): string[] {
  return [...TIME_SLOTS]
    .map((slot, index) => ({
      slot,
      weight: seededRandom(`${seed}-${index}`)
    }))
    .sort((a, b) => a.weight - b.weight)
    .map((entry) => entry.slot)
}

function generateTrainNumber(seed: string): string {
  const numeric = 1000 + Math.floor(seededRandom(`${seed}-number`) * 9000)
  return numeric.toString()
}

function addMinutesToTime(time: string, minutesToAdd: number): string {
  const [hours, minutes] = time.split(':').map((part) => parseInt(part, 10))
  const totalMinutes = hours * 60 + minutes + minutesToAdd
  const newHours = Math.floor((totalMinutes % (24 * 60)) / 60)
  const newMinutes = totalMinutes % 60
  return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`
}

function minutesToDuration(durationMinutes: number): string {
  const hours = Math.floor(durationMinutes / 60)
  const minutes = durationMinutes % 60
  return `${hours}:${minutes.toString().padStart(2, '0')}`
}

function getRouteProfile(fromCode: string, toCode: string): RouteProfile {
  const canonicalKey = [fromCode, toCode].sort().join('-')
  return ROUTE_PROFILES[canonicalKey] || DEFAULT_PROFILE
}

function seededRandom(seed: string): number {
  let hash = 2166136261
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0) / 4294967295
}

// دالة للحصول على القطارات حسب المسار والتاريخ
export function getTrainsForRoute(
  fromStation: string,
  toStation: string,
  date: string
): TrainTrip[] {
  const fromCode = getStationCode(fromStation)
  const toCode = getStationCode(toStation)
  const routeKey = `${fromCode}-${toCode}`

  const routeData = trainData[routeKey]
  if (!routeData) {
    return []
  }

  return routeData[date] || []
}

// دالة مساعدة للحصول على كود المحطة
function getStationCode(stationName: string): string {
  return STATION_CODES[stationName] || stationName
}

