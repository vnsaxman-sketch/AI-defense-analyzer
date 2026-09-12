import { useState } from 'react'
import type { HandRecord } from '../types'
import { simulateHands } from '../lib/baccarat'
import OutcomeBadge from './OutcomeBadge'
import StatCard from './StatCard'
import { calculateStatistics } from '../lib/statistics'

export default function SimulatorTab() {
  const [hands, setHands] =
    useState<HandRecord[]>([])

  const stats =
    calculateStatistics(hands)

  function runSimulation() {
    setHands(simulateHands(200))
  }

  function addHand(
    outcome: 'P' | 'B' | 'T',
  ) {
    const position =
      hands.length % 80 + 1

    setHands([
      ...hands,
      {
        handNumber: hands.length + 1,
        outcome,
        shoeNumber:
          Math.floor(hands.length / 80) + 1,
        position,
      },
    ])
  }

  return (
    <div className="tab-content">
      <div className="hero">
        <h2>Fair Random Simulator</h2>

        <p>
          Generates baccarat outcomes using an
          8-deck shuffled shoe and official
          drawing rules.
        </p>
      </div>

      <div className="button-row">
        <button
          className="primary"
          onClick={runSimulation}
        >
          Simulate 200 Hands
        </button>

        <button
          onClick={() => setHands([])}
        >
          Clear
        </button>
      </div>

      <div className="manual-entry">
        <h3>Manual Observation</h3>

        <p>
          Record actual table outcomes manually.
        </p>

        <div className="button-row">
          <button onClick={() => addHand('P')}>
            Player
          </button>

          <button onClick={() => addHand('B')}>
            Banker
          </button>

          <button onClick={() => addHand('T')}>
            Tie
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          label="Hands"
          value={String(stats.total)}
        />

        <StatCard
          label="Banker"
          value={`${stats.bankerPct.toFixed(1)}%`}
        />

        <StatCard
          label="Player"
          value={`${stats.playerPct.toFixed(1)}%`}
        />

        <StatCard
          label="Tie"
          value={`${stats.tiePct.toFixed(1)}%`}
        />
      </div>

      <div className="road">
        {hands.slice(-80).map(hand => (
          <OutcomeBadge
            key={`${hand.shoeNumber}-${hand.position}`}
            outcome={hand.outcome}
          />
        ))}
      </div>
    </div>
  )
}
