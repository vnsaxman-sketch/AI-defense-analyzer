export function randomInt(max: number): number {
  return Math.floor(Math.random() * max)
}

export function shuffle<T>(items: T[]): T[] {
  const result = [...items]

  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(i + 1)

    const temp = result[i]
    result[i] = result[j]
    result[j] = temp
  }

  return result
}
