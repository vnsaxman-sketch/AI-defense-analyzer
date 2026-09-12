interface Props {
  label: string
  value: string
  description?: string
}

export default function StatCard({
  label,
  value,
  description,
}: Props) {
  return (
    <div className="stat-card">
      <div className="stat-label">
        {label}
      </div>

      <div className="stat-value">
        {value}
      </div>

      {description && (
        <div className="stat-description">
          {description}
        </div>
      )}
    </div>
  )
}
