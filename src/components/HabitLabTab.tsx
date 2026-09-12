import { useState } from 'react'
import type {
  BetType,
  HabitResult,
  HandRecord,
} from '../types'

import { simulateHands } from '../lib/baccarat'
import {
  runHabitSimulation,
} from '../lib/habits'

const habits: {
  value: BetType
  label: string
}[] = [
  {
    value: 'flat-banker',
    label: 'Flat Banker',
  },
  {
    value: 'follow-streak',
    label: 'Follow Streak',
  },
  {
    value: 'against-streak',
    label: 'Against Streak',
  },
  {
    value: 'monkey-chaser',
    label: 'Monkey Chaser',
  },
  {
    value: 'raise-loss',
    label: 'Raise on Loss',
  },
]

export default function HabitLabTab() {
  const [habit, setHabit] =
    useState<BetType>('flat-banker')

  const [bankroll, setBankroll] =
    useState(5000)

  const [baseBet, setBaseBet] =
    useState(25)

  const [maxBet, setMaxBet] =
    useState(500)

  const [handCount, setHandCount] =
    useState(5000)

  const [result, setResult] =
    useState<HabitResult | null>(null)

  function run() {
    const hands: HandRecord[] =
      simulateHands(handCount)

    const simulation =
      runHabitSimulation(
        hands,
        habit,
        bankroll,
        baseBet,
        maxBet,
      )

    setResult(simulation)
  }

  return (
    <div className="tab-content">
      <div className="hero">
        <h2>My Habit Lab</h2>

        <p>
          Educational simulation showing how
          different betting behaviors affect
          bankroll volatility.
        </p>
	 <p>
	  * Flat Banker: Bet on Banker every hand with the same bet size.
	  <br />
	  * Follow Streak: Only bet the streak side when established streak 2+ consecutive Banker/Player
	  <br />
          * Against Streak: Bet the opposite side when a 2+ streak appears.
	  <br />
          * Monkey Chaser: Bet the same side as the immediately previous non-Tie hand. 
	  <br />
	  * Raise on Loss: Martingale bet but cap out at limit amount(your limit)	  
        </p>
      </div>

      <div className="control-grid">
        <label>
          Starting Bankroll

          <input
            type="number"
            min="1"
            value={bankroll}
            onChange={event =>
              setBankroll(
                Number(event.target.value),
              )
            }
          />
        </label>

        <label>
          Base Bet

          <input
            type="number"
            min="1"
            value={baseBet}
            onChange={event =>
              setBaseBet(
                Number(event.target.value),
              )
            }
          />
        </label>

        <label>
          Maximum Bet

          <input
            type="number"
            min="1"
            value={maxBet}
            onChange={event =>
              setMaxBet(
                Number(event.target.value),
              )
            }
          />
        </label>

        <label>
          Simulation Hands

          <select
            value={handCount}
            onChange={event =>
              setHandCount(
                Number(event.target.value),
              )
            }
          >
            <option value={1000}>
              1,000
            </option>

            <option value={5000}>
              5,000
            </option>

            <option value={10000}>
              10,000
            </option>

            <option value={50000}>
              50,000
            </option>
          </select>
        </label>
      </div>

      <div className="habit-selector">
        {habits.map(item => (
          <button
            key={item.value}
            className={
              habit === item.value
                ? 'selected'
                : ''
            }
            onClick={() =>
              setHabit(item.value)
            }
          >
            {item.label}
          </button>
        ))}
      </div>

      <button
        className="primary large-button"
        onClick={run}
      >
        Run Simulation
      </button>

      {result && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">
              Ending Bankroll
            </div>

            <div className="stat-value">
              $
              {result.endingBankroll.toFixed(
                2,
              )}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">
              Profit / Loss
            </div>

            <div className="stat-value">
              $
              {result.profit.toFixed(2)}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">
              Max Drawdown
            </div>

            <div className="stat-value">
              $
              {result.maxDrawdown.toFixed(2)}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">
              Ruin
            </div>

            <div className="stat-value">
              {result.ruin
                ? 'YES'
                : 'NO'}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
