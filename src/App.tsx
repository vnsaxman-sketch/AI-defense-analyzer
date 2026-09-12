import { useState } from 'react'
import type { Tab } from './types'

import SimulatorTab from './components/SimulatorTab'
import HabitLabTab from './components/HabitLabTab'
import BiasDetectorTab from './components/BiasDetectorTab'
import AIAnalysisTab from './components/AIAnalysisTab'

function App() {
  const [tab, setTab] =
    useState<Tab>('ai')

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <div className="eyebrow">
            PLAYER-SIDE STATISTICAL TOOL
          </div>

          <h1>
            AI Defense Analyzer
          </h1>

          <p style={{ color: '#38bdf8', fontWeight: 600 }}>
  	    Baccarat randomness, behavior and normalcy analysis
	  </p>

	  <p style={{ color: '#FFD700', fontWeight: 600 }}>
	  <br/>
  	    Developed by: Long Nguyen
	  </p>

        </div>

        <div className="header-status">
          LOCAL ONLY
        </div>
      </header>

      <nav className="tabs">
        <button
          className={
            tab === 'ai'
              ? 'active'
              : ''
          }
          onClick={() =>
            setTab('ai')
          }
        >
          AI Analysis
        </button>

        <button
          className={
            tab === 'simulator'
              ? 'active'
              : ''
          }
          onClick={() =>
            setTab('simulator')
          }
        >
          Simulator
        </button>

        <button
          className={
            tab === 'habit'
              ? 'active'
              : ''
          }
          onClick={() =>
            setTab('habit')
          }
        >
          My Habit Lab
        </button>

        <button
          className={
            tab === 'detector'
              ? 'active'
              : ''
          }
          onClick={() =>
            setTab('detector')
          }
        >
          Bias Detector
        </button>
      </nav>

      <main>
        {tab === 'ai' && (
          <AIAnalysisTab />
        )}

        {tab === 'simulator' && (
          <SimulatorTab />
        )}

        {tab === 'habit' && (
          <HabitLabTab />
        )}

        {tab === 'detector' && (
          <BiasDetectorTab />
        )}
      </main>

      <footer>
        <strong>
          Educational statistical analysis only.
        </strong>

        <span>
          Anomaly detection cannot establish
          intent, AI involvement, or
          manipulation.
        </span>
      </footer>
    </div>
  )
}

export default App
