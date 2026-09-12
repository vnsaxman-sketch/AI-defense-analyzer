import { useState } from 'react'
import type { HandRecord } from '../types'
import {
  calculateStatistics,
  getPositionBuckets,
} from '../lib/statistics'
import { simulateHands } from '../lib/baccarat'
import StatCard from './StatCard'
import OutcomeBadge from './OutcomeBadge'

function parseInput(
  input: string,
): HandRecord[] {
  const cleaned = input
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

export default function BiasDetectorTab() {
  const [input, setInput] =
    useState('')

  const [hands, setHands] =
    useState<HandRecord[]>([])

  function analyze() {
    setHands(parseInput(input))
  }

  function simulate() {
    setHands(simulateHands(500))

    setInput(
      simulateHands(500)
        .map(h => h.outcome)
        .join(''),
    )
  }

  const stats =
    calculateStatistics(hands)

  const buckets =
    getPositionBuckets(hands)

  return (
    <div className="tab-content">
      <div className="hero">
        <h2>Statistical Bias Detector</h2>

        <p>
          Look for deviations from expected
          randomness. An anomaly is not proof
          of manipulation.
        </p>
      </div>

      <textarea
        value={input}
        onChange={event =>
          setInput(event.target.value)
        }
        placeholder="Paste P/B/T results here..."
        rows={8}
      />

      <div className="button-row">
        <button
          className="primary"
          onClick={analyze}
        >
          Analyze
        </button>

        <button onClick={simulate}>
          Generate 500
        </button>
      </div>

      {hands.length > 0 && (
        <>
          <div className="stats-grid">
            <StatCard
              label="Hands"
              value={String(stats.total)}
            />

            <StatCard
              label="Chi-Square"
              value={stats.chiSquare.toFixed(2)}
            />

            <StatCard
              label="P-Value"
              value={stats.pValue.toFixed(4)}
            />

            <StatCard
              label="Longest Streak"
              value={String(
                stats.longestStreak,
              )}
            />

            <StatCard
              label="Same Transition"
              value={`${stats.transitionSamePct.toFixed(1)}%`}
            />

            <StatCard
              label="Entropy"
              value={stats.entropy.toFixed(3)}
            />
          </div>

          <h3>Recent Road</h3>

          <div className="road">
            {hands.slice(-80).map(hand => (
              <OutcomeBadge
                key={`${hand.handNumber}`}
                outcome={hand.outcome}
              />
            ))}
          </div>

          <h3>Position Analysis</h3>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Position</th>
                  <th>Hands</th>
                  <th>Banker</th>
                  <th>Player</th>
                  <th>Tie</th>
                </tr>
              </thead>

              <tbody>
                {buckets.map(bucket => (
                  <tr key={bucket.label}>
                    <td>{bucket.label}</td>
                    <td>{bucket.total}</td>
                    <td>
                      {bucket.bankerPct.toFixed(
                        1,
                      )}
                      %
                    </td>
                    <td>
                      {bucket.playerPct.toFixed(
                        1,
                      )}
                      %
                    </td>
                    <td>
                      {bucket.tiePct.toFixed(
                        1,
                      )}
                      %
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
