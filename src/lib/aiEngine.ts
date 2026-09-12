import type {
  AIAnalysis,
  FeatureVector,
  HandRecord,
} from '../types'

import {
  extractFeatures,
} from './statistics'

import {
  simulateHands,
} from './baccarat'

interface Model {
  weights: number[]
  bias: number
}

const FEATURE_COUNT = 13

function featureArray(
  features: FeatureVector,
): number[] {
  return [
    features.playerPct,
    features.bankerPct,
    features.tiePct,
    features.bankerPlayerImbalance,
    features.transitionSamePct,
    features.longestStreakNormalized,
    features.averageStreakNormalized,
    features.entropyNormalized,
    features.chiSquareNormalized,
    features.bankerAfterBanker,
    features.playerAfterPlayer,
    features.earlyShoeBankerPct,
    features.positionConcentration,
  ]
}

function sigmoid(value: number): number {
  return 1 / (1 + Math.exp(-value))
}

function createSyntheticAnomaly(
  source: HandRecord[],
): HandRecord[] {
  const result = source.map(hand => ({
    ...hand,
  }))

  const mode =
    Math.floor(Math.random() * 3)

  if (mode === 0) {
    // Synthetic streak bias.
    for (let i = 1; i < result.length; i++) {
      if (
        result[i - 1].outcome !== 'T' &&
        Math.random() < 0.18
      ) {
        result[i].outcome =
          result[i - 1].outcome
      }
    }
  } else if (mode === 1) {
    // Synthetic side imbalance.
    for (const hand of result) {
      if (Math.random() < 0.15) {
        hand.outcome = 'B'
      }
    }
  } else {
    // Synthetic position-dependent behavior.
    for (const hand of result) {
      if (
        hand.position >= 55 &&
        Math.random() < 0.15
      ) {
        hand.outcome = 'P'
      }
    }
  }

  return result
}

function trainModel(): Model {
  const samples: number[][] = []
  const labels: number[] = []

  const trainingWindows = 120

  for (let i = 0; i < trainingWindows; i++) {
    const fair = simulateHands(200)

    samples.push(
      featureArray(
        extractFeatures(fair),
      ),
    )

    labels.push(0)

    const anomalous =
      createSyntheticAnomaly(fair)

    samples.push(
      featureArray(
        extractFeatures(anomalous),
      ),
    )

    labels.push(1)
  }

  const weights = new Array(
    FEATURE_COUNT,
  ).fill(0)

  let bias = 0

  const learningRate = 0.15

  for (let epoch = 0; epoch < 300; epoch++) {
    for (let i = 0; i < samples.length; i++) {
      const x = samples[i]
      const y = labels[i]

      let z = bias

      for (let j = 0; j < FEATURE_COUNT; j++) {
        z += weights[j] * x[j]
      }

      const prediction = sigmoid(z)
      const error = prediction - y

      for (let j = 0; j < FEATURE_COUNT; j++) {
        weights[j] -=
          learningRate *
          error *
          x[j]
      }

      bias -=
        learningRate * error
    }
  }

  return {
    weights,
    bias,
  }
}

let cachedModel: Model | null = null

export function getModel(): Model {
  if (!cachedModel) {
    cachedModel = trainModel()
  }

  return cachedModel
}

function buildReasons(
  features: FeatureVector,
): string[] {
  const reasons: string[] = []

  if (
    features.bankerPlayerImbalance >
    0.08
  ) {
    reasons.push(
      'Player/Banker frequency imbalance is relatively large.',
    )
  }

  if (
    features.transitionSamePct >
    0.58
  ) {
    reasons.push(
      'Repeated same-side transitions are elevated.',
    )
  }

  if (
    features.transitionSamePct <
    0.40
  ) {
    reasons.push(
      'Alternating transitions are elevated.',
    )
  }

  if (
    features.longestStreakNormalized >
    0.65
  ) {
    reasons.push(
      'An unusually long streak appears in the sample.',
    )
  }

  if (
    features.positionConcentration >
    0.35
  ) {
    reasons.push(
      'Outcome distribution changes noticeably by shoe position.',
    )
  }

  if (
    features.entropyNormalized <
    0.80
  ) {
    reasons.push(
      'Outcome entropy is lower than typical three-outcome randomness.',
    )
  }

  if (reasons.length === 0) {
    reasons.push(
      'No major synthetic anomaly signature was detected.',
    )
  }

  return reasons
}

export function analyzeWithAI(
  hands: HandRecord[],
): AIAnalysis {
  if (hands.length < 30) {
    return {
      score: 0,
      probability: 0,
      classification: 'Insufficient data',
      confidence: 0,
      reasons: [
        'Enter at least 30 hands before running the AI analysis.',
      ],
      features: extractFeatures(hands),
    }
  }

  const model = getModel()

  const features =
    extractFeatures(hands)

  const values =
    featureArray(features)

  let z = model.bias

  for (let i = 0; i < values.length; i++) {
    z += model.weights[i] * values[i]
  }

  const probability = sigmoid(z)

  const score = Math.round(
    probability * 100,
  )

  let classification = 'Normal-like'

  if (score >= 80) {
    classification = 'Highly unusual'
  } else if (score >= 60) {
    classification = 'Unusual'
  } else if (score >= 40) {
    classification = 'Borderline'
  }

  const confidence = Math.round(
    Math.abs(probability - 0.5) * 200,
  )

  return {
    score,
    probability,
    classification,
    confidence,
    reasons: buildReasons(features),
    features,
  }
}

export function resetAIModel(): void {
  cachedModel = null
}
