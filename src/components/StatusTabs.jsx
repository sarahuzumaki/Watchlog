// Les trois onglets de statut, avec le nombre de titres dans chacun.
// "counts" ressemble à : { 'En cours': 2, 'Pas commencé': 1, 'Terminé': 0 }

import { STATUSES } from '../constants.js'

function StatusTabs({ value, onChange, counts }) {
  return (
    <nav className="status-tabs">
      {STATUSES.map((status) => (
        <button
          key={status}
          type="button"
          className={status === value ? 'status-tab is-active' : 'status-tab'}
          aria-pressed={status === value}
          onClick={() => onChange(status)}
        >
          {status}
          <span className="status-count">{counts[status]}</span>
        </button>
      ))}
    </nav>
  )
}

export default StatusTabs
