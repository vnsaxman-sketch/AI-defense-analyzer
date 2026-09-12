import type {
  FeatureVector,
  HandRecord,
  PositionBucket,
  Statistics,
} from '../types'

function normalPValue(chiSquare: number): number {
  if (chiSquare <= 0) return 1

  // Approximation for a chi-square distribution with 2 degrees of freedom.
  return Math.exp(-chiSquare / 2)
}

function calculateStreaks(
  hands: HandRecord[],
): number[] {
  const filtered = hands.filter(
    hand => hand.outcome !== 'T',
  )

  if (filtered.length === 0) {
    return []
  }

  const streaks: number[] = []
  let current = 1

  for (let i = 1; i < filtered.length; i++) {
    if (
      filtered[i].outcome ===
      filtered[i - 1].outcome
    ) {
      current++
    } else {
      streaks.push(current)
      current = 1
    }
  }

  streaks.push(current)

  return streaks
}

function calculateEntropy(
  hands: HandRecord[],
): number {
  if (hands.length === 0) return 0

  const counts = {
    P: 0,
    B: 0,
    T: 0,
  }

  for (const hand of hands) {
    counts[hand.outcome]++
  }

  let entropy = 0

  for (const value of Object.values(counts)) {
    if (value === 0) continue

    const p = value / hands.length
    entropy -= p * Math.log2(p)
  }

  return entropy
}

export function calculateStatistics(
  hands: HandRecord[],
): Statistics {
  const total = hands.length

  if (total === 0) {
    return {
      total: 0,
      player: 0,
      banker: 0,
      tie: 0,
      playerPct: 0,
      bankerPct: 0,
      tiePct: 0,
      dragon7: 0,
      dragon7Pct: 0,
      averageStreak: 0,
      longestStreak: 0,
      chiSquare: 0,
      pValue: 1,
      transitionSamePct: 0,
      entropy: 0,
      conditionalBankerAfterBanker: 0,
      conditionalPlayerAfterPlayer: 0,
      positionConcentration: 0,
    }
  }

  const player = hands.filter(
    hand => hand.outcome === 'P',
  ).length

  const banker = hands.filter(
    hand => hand.outcome === 'B',
  ).length

  const tie = hands.filter(
    hand => hand.outcome === 'T',
  ).length

  const dragon7 = hands.filter(
    hand =>
      hand.outcome === 'B' &&
      hand.position % 7 === 0,
  ).length

  const streaks = calculateStreaks(hands)

  const averageStreak =
    streaks.length === 0
      ? 0
      : streaks.reduce((a, b) => a + b, 0) /
        streaks.length

  const longestStreak =
    streaks.length === 0
      ? 0
      : Math.max(...streaks)

  let transitions = 0
  let sameTransitions = 0

  let bankerAfterBanker = 0
  let bankerAfterBankerTotal = 0

  let playerAfterPlayer = 0
  let playerAfterPlayerTotal = 0

  for (let i = 1; i < hands.length; i++) {
    const previous = hands[i - 1].outcome
    const current = hands[i].outcome

    if (previous === 'T' || current === 'T') {
      continue
    }

    transitions++

    if (previous === current) {
      sameTransitions++
    }

    if (previous === 'B') {
      bankerAfterBankerTotal++

      if (current === 'B') {
        bankerAfterBanker++
      }
    }

    if (previous === 'P') {
      playerAfterPlayerTotal++

      if (current === 'P') {
        playerAfterPlayer++
      }
    }
  }

  const expectedP = total / 3
  const expectedB = total / 3
  const expectedT = total / 3

  const chiSquare =
    ((player - expectedP) ** 2) / expectedP +
    ((banker - expectedB) ** 2) / expectedB +
    ((tie - expectedT) ** 2) / expectedT

  const half = Math.floor(total / 2)

  const firstHalf = hands.slice(0, half)
  const secondHalf = hands.slice(half)

  const firstBanker =
    firstHalf.filter(
      hand => hand.outcome === 'B',
    ).length / Math.max(firstHalf.length, 1)

  const secondBanker =
    secondHalf.filter(
      hand => hand.outcome === 'B',
    ).length / Math.max(secondHalf.length, 1)

  const positionConcentration =
    Math.abs(secondBanker - firstBanker)

  return {
    total,
    player,
    banker,
    tie,

    playerPct: player / total * 100,
    bankerPct: banker / total * 100,
    tiePct: tie / total * 100,

    dragon7,
    dragon7Pct: dragon7 / total * 100,

    averageStreak,
    longestStreak,

    chiSquare,
    pValue: normalPValue(chiSquare),

    transitionSamePct:
      transitions === 0
        ? 0
        : sameTransitions / transitions * 100,

    entropy: calculateEntropy(hands),

    conditionalBankerAfterBanker:
      bankerAfterBankerTotal === 0
        ? 0
        : bankerAfterBanker /
          bankerAfterBankerTotal *
          100,

    conditionalPlayerAfterPlayer:
      playerAfterPlayerTotal === 0
        ? 0
        : playerAfterPlayer /
          playerAfterPlayerTotal *
          100,

    positionConcentration:
      positionConcentration * 100,
  }
}

export function extractFeatures(
  hands: HandRecord[],
): FeatureVector {
  const stats = calculateStatistics(hands)

  const bankerPlayerImbalance =
    Math.abs(
      stats.bankerPct -
      stats.playerPct,
    )

  return {
    playerPct: stats.playerPct / 100,
    bankerPct: stats.bankerPct / 100,
    tiePct: stats.tiePct / 100,

    bankerPlayerImbalance:
      bankerPlayerImbalance / 100,

    transitionSamePct:
      stats.transitionSamePct / 100,

    longestStreakNormalized:
      Math.min(stats.longestStreak / 15, 1),

    averageStreakNormalized:
      Math.min(stats.averageStreak / 5, 1),

    entropyNormalized:
      stats.entropy / Math.log2(3),

    chiSquareNormalized:
      Math.min(stats.chiSquare / 20, 1),

    bankerAfterBanker:
      stats.conditionalBankerAfterBanker / 100,

    playerAfterPlayer:
      stats.conditionalPlayerAfterPlayer / 100,

    earlyShoeBankerPct:
      Math.max(
        0,
        Math.min(
          1,
          0.5 +
            stats.positionConcentration / 200,
        ),
      ),

    lateShoeBankerPct:
      Math.max(
        0,
        Math.min(
          1,
          0.5 -
            stats.positionConcentration / 200,
        ),
      ),

    positionConcentration:
      Math.min(
        stats.positionConcentration / 30,
        1,
      ),
  }
}

export function getPositionBuckets(
  hands: HandRecord[],
): PositionBucket[] {
  const ranges = [
    [1, 20],
    [21, 40],
    [41, 60],
    [61, 80],
  ]

  return ranges.map(([start, end]) => {
    const bucket = hands.filter(
      hand =>
        hand.position >= start &&
        hand.position <= end,
    )

    const total = bucket.length

    if (total === 0) {
      return {
        label: `${start}-${end}`,
        total: 0,
        bankerPct: 0,
        playerPct: 0,
        tiePct: 0,
      }
    }

    return {
      label: `${start}-${end}`,
      total,
      bankerPct:
        bucket.filter(h => h.outcome === 'B')
          .length /
        total *
        100,
      playerPct:
        bucket.filter(h => h.outcome === 'P')
          .length /
        total *
        100,
      tiePct:
        bucket.filter(h => h.outcome === 'T')
          .length /
        total *
        100,
    }
  })
}
