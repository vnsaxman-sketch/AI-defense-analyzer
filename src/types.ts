export type Outcome = 'P' | 'B' | 'T'

export type Tab =
  | 'simulator'
  | 'habit'
  | 'detector'
  | 'ai'

export type BetType =
  | 'flat-banker'
  | 'follow-streak'
  | 'against-streak'
  | 'monkey-chaser'
  | 'raise-loss'

export interface Card {
  rank: number
  suit: number
  value: number
}

export interface HandRecord {
  handNumber: number
  outcome: Outcome
  shoeNumber: number
  position: number
}

export interface ShoeResult {
  hands: HandRecord[]
  cardsRemaining: number
}

export interface Statistics {
  total: number
  player: number
  banker: number
  tie: number

  playerPct: number
  bankerPct: number
  tiePct: number

  dragon7: number
  dragon7Pct: number

  averageStreak: number
  longestStreak: number

  chiSquare: number
  pValue: number

  transitionSamePct: number
  entropy: number

  conditionalBankerAfterBanker: number
  conditionalPlayerAfterPlayer: number

  positionConcentration: number
}

export interface FeatureVector {
  playerPct: number
  bankerPct: number
  tiePct: number

  bankerPlayerImbalance: number
  transitionSamePct: number
  longestStreakNormalized: number
  averageStreakNormalized: number

  entropyNormalized: number
  chiSquareNormalized: number

  bankerAfterBanker: number
  playerAfterPlayer: number

  earlyShoeBankerPct: number
  lateShoeBankerPct: number

  positionConcentration: number
}

export interface AIAnalysis {
  score: number
  probability: number
  classification: string
  confidence: number
  reasons: string[]
  features: FeatureVector
}

export interface HabitResult {
  habit: BetType
  startingBankroll: number
  endingBankroll: number
  profit: number
  maxDrawdown: number
  ruin: boolean
  handsPlayed: number
  wins: number
  losses: number
  pushes: number
}

export interface PositionBucket {
  label: string
  total: number
  bankerPct: number
  playerPct: number
  tiePct: number
}
