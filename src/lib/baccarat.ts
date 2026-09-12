import type { Card, HandRecord, Outcome } from '../types'
import { shuffle } from './random'

function createShoe(): Card[] {
  const shoe: Card[] = []

  for (let deck = 0; deck < 8; deck++) {
    for (let suit = 0; suit < 4; suit++) {
      for (let rank = 1; rank <= 13; rank++) {
        const value = rank >= 10 ? 0 : rank

        shoe.push({
          rank,
          suit,
          value,
        })
      }
    }
  }

  return shuffle(shoe)
}

function draw(shoe: Card[]): Card {
  const card = shoe.pop()

  if (!card) {
    throw new Error('Shoe exhausted')
  }

  return card
}

function total(cards: Card[]): number {
  return cards.reduce((sum, card) => sum + card.value, 0) % 10
}

function shouldPlayerDraw(playerTotal: number): boolean {
  return playerTotal <= 5
}

function shouldBankerDraw(
  bankerTotal: number,
  playerThirdCard: Card | undefined,
): boolean {
  if (!playerThirdCard) {
    return bankerTotal <= 5
  }

  const thirdValue = playerThirdCard.value

  if (bankerTotal <= 2) return true
  if (bankerTotal === 3) return thirdValue !== 8
  if (bankerTotal === 4) return thirdValue >= 2 && thirdValue <= 7
  if (bankerTotal === 5) return thirdValue >= 4 && thirdValue <= 7
  if (bankerTotal === 6) return thirdValue === 6 || thirdValue === 7

  return false
}

export function dealBaccaratHand(
  shoe: Card[],
): { outcome: Outcome; cards: Card[] } {
  const player: Card[] = [draw(shoe), draw(shoe)]
  const banker: Card[] = [draw(shoe), draw(shoe)]

  const initialPlayerTotal = total(player)
  const initialBankerTotal = total(banker)

  const natural =
    initialPlayerTotal >= 8 ||
    initialBankerTotal >= 8

  let playerThirdCard: Card | undefined

  if (!natural && shouldPlayerDraw(initialPlayerTotal)) {
    playerThirdCard = draw(shoe)
    player.push(playerThirdCard)
  }

  if (!natural) {
    const bankerTotal = total(banker)

    if (
      shouldBankerDraw(
        bankerTotal,
        playerThirdCard,
      )
    ) {
      banker.push(draw(shoe))
    }
  }

  const playerTotal = total(player)
  const bankerTotal = total(banker)

  let outcome: Outcome

  if (playerTotal > bankerTotal) {
    outcome = 'P'
  } else if (bankerTotal > playerTotal) {
    outcome = 'B'
  } else {
    outcome = 'T'
  }

  return {
    outcome,
    cards: [...player, ...banker],
  }
}

export function simulateShoe(
  shoeNumber = 1,
  maxHands = 80,
): HandRecord[] {
  const shoe = createShoe()
  const records: HandRecord[] = []

  for (let position = 1; position <= maxHands; position++) {
    if (shoe.length < 12) {
      break
    }

    const result = dealBaccaratHand(shoe)

    records.push({
      handNumber: position,
      outcome: result.outcome,
      shoeNumber,
      position,
    })
  }

  return records
}

export function simulateHands(
  count: number,
): HandRecord[] {
  const records: HandRecord[] = []

  let shoeNumber = 1
  let currentShoe = simulateShoe(shoeNumber)

  while (records.length < count) {
    records.push(...currentShoe)

    shoeNumber += 1
    currentShoe = simulateShoe(shoeNumber)
  }

  return records.slice(0, count)
}
