import { useState } from 'react'
import type { HandRecord } from '../types'
import { analyzeWithAI } from '../lib/aiEngine'
import { simulateHands } from '../lib/baccarat'

export default function AIAnalysisTab() {
  const [input, setInput] =
    useState('')

  const [hands, setHands] =
    useState<HandRecord[]>([])

  const [loading, setLoading] =
    useState(false)

  const [analysis, setAnalysis] =
    useState<
      ReturnType<typeof analyzeWithAI> | null
    >(null)

  function parseInput(
    value: string,
  ): HandRecord[] {
    const cleaned = value
      .toUpperCase()
      .replace(/[^PBT]/g, '')

    return [...cleaned].map(
      (outcome, index) => ({
        handNumber: index + 1,
        outcome:
          outcome as 'P' | 'B' | 'T',
        shoeNumber:
          Math.floor(index / 80) + 1,
        position:
          (index % 80) + 1,
      }),
    )
  }

  async function analyze() {
    setLoading(true)

    const parsed = parseInput(input)

    setHands(parsed)

    await new Promise(
      resolve => setTimeout(resolve, 20),
    )

    const result =
      analyzeWithAI(parsed)

    setAnalysis(result)
    setLoading(false)
  }

  function generateFairSample() {
    const generated =
      simulateHands(500)

    setHands(generated)

    setInput(
      generated
        .map(hand => hand.outcome)
        .join(''),
    )

    setAnalysis(null)
  }

  return (
    <div className="tab-content">
      <div className="hero ai-hero">
        <div className="ai-label">
          AI ANALYSIS ENGINE
        </div>

        <h2>
          AI Defense Analyzer
        </h2>

        <p>
          A local machine-learning model
          compares the observed sequence with
          fair-random and synthetic anomalous
          patterns.
        </p>
      </div>

      <div className="warning-box">
        <strong>Important:</strong>{' '}
        An AI anomaly score does not prove
        casino manipulation, cheating, or the
        use of AI. It identifies statistical
        similarity to patterns the model has
        learned.
      </div>

      <textarea
        value={input}
        onChange={event =>
          setInput(event.target.value)
        }
        placeholder="Enter at least 30 P/B/T results..."
        rows={10}
      />

      <div className="button-row">
        <button
          className="primary"
          onClick={analyze}
          disabled={loading}
        >
          {loading
            ? 'Analyzing...'
            : 'Run AI Analysis'}
        </button>

        <button
          onClick={generateFairSample}
        >
          Generate Fair 500
        </button>
      </div>

      {analysis && (
        <div className="ai-result">
          <div className="ai-score">
            <div className="score-number">
              {analysis.score}
            </div>

            <div className="score-label">
              AI ANOMALY SCORE
            </div>
          </div>

          <div className="classification">
            <div className="stat-label">
              Classification
            </div>

            <div className="classification-value">
              {analysis.classification}
            </div>

            <div className="stat-description">
              Model confidence:{' '}
              {analysis.confidence}%
            </div>
          </div>

          <div className="ai-reasons">
            <h3>Evidence Signals</h3>

            {analysis.reasons.map(
              (reason, index) => (
                <div
                  className="reason"
                  key={index}
                >
                  <span>•</span>
                  {reason}
                </div>
              ),
            )}
          </div>

          <div className="feature-grid">
            <div>
              <span>
                Banker %
              </span>

              <strong>
                {(
                  analysis.features
                    .bankerPct * 100
                ).toFixed(1)}
                %
              </strong>
            </div>

            <div>
              <span>
                Player %
              </span>

              <strong>
                {(
                  analysis.features
                    .playerPct * 100
                ).toFixed(1)}
                %
              </strong>
            </div>

            <div>
              <span>
                Same Transition
              </span>

              <strong>
                {(
                  analysis.features
                    .transitionSamePct *
                  100
                ).toFixed(1)}
                %
              </strong>
            </div>

            <div>
              <span>
                Longest Streak
              </span>

              <strong>
                {Math.round(
                  analysis.features
                    .longestStreakNormalized *
                    15,
                )}
              </strong>
            </div>

            <div>
              <span>
                Entropy
              </span>

              <strong>
                {analysis.features.entropyNormalized.toFixed(
                  2,
                )}
              </strong>
            </div>

            <div>
              <span>
                Position Signal
              </span>

              <strong>
                {(
                  analysis.features
                    .positionConcentration *
                  100
                ).toFixed(1)}
                %
              </strong>
            </div>
          </div>
        </div>
      )}

      {hands.length > 0 && (
        <div className="data-note">
          Analyzed {hands.length} observed
          outcomes.
        </div>
      )}
    </div>
  )
}
