import type {
  BetType,
  HandRecord,
  HabitResult,
} from '../types'

export function runHabitSimulation(
  hands: HandRecord[],
  habit: BetType,
  startingBankroll: number,
  baseBet: number,
  maxBet: number,
): HabitResult {
  let bankroll = startingBankroll

  let currentBet = baseBet

  let previousOutcome:
    | 'P'
    | 'B'
    | 'T'
    | null = null

  let wins = 0
  let losses = 0
  let pushes = 0

  let peakBankroll = bankroll
  let maxDrawdown = 0

  for (const hand of hands) {
    if (bankroll <= 0) {
      break
    }

    let betSide: 'P' | 'B' = 'B'

    if (
      habit === 'follow-streak' &&
      previousOutcome &&
      previousOutcome !== 'T'
    ) {
      betSide = previousOutcome
    }

    if (
      habit === 'against-streak' &&
      previousOutcome &&
      previousOutcome !== 'T'
    ) {
      betSide =
        previousOutcome === 'B'
          ? 'P'
          : 'B'
    }

    if (
      habit === 'monkey-chaser' &&
      previousOutcome &&
      previousOutcome !== 'T'
    ) {
      betSide = previousOutcome
    }

    const actualBet = Math.min(
      currentBet,
      bankroll,
    )

    if (hand.outcome === 'T') {
      pushes++
    } else if (
      hand.outcome === betSide
    ) {
      wins++

      if (betSide === 'B') {
        bankroll +=
          actualBet * 0.95
      } else {
        bankroll += actualBet
      }

      if (habit === 'raise-loss') {
        currentBet = baseBet
      }
    } else {
      losses++
      bankroll -= actualBet

      if (habit === 'raise-loss') {
        currentBet = Math.min(
          currentBet * 2,
          maxBet,
        )
      } else {
        currentBet = baseBet
      }
    }

    if (bankroll > peakBankroll) {
      peakBankroll = bankroll
    }

    const drawdown =
      peakBankroll - bankroll

    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown
    }

    previousOutcome = hand.outcome
  }

  return {
    habit,
    startingBankroll,
    endingBankroll: bankroll,
    profit: bankroll - startingBankroll,
    maxDrawdown,
    ruin: bankroll <= 0,
    handsPlayed: hands.length,
    wins,
    losses,
    pushes,
  }
}
