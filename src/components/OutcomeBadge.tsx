import type { Outcome } from '../types'

interface Props {
  outcome: Outcome
}

export default function OutcomeBadge({
  outcome,
}: Props) {
  const label =
    outcome === 'B'
      ? 'BANKER'
      : outcome === 'P'
        ? 'PLAYER'
        : 'TIE'

  return (
    <span
      className={`outcome outcome-${outcome}`}
    >
      {label}
    </span>
  )
}
