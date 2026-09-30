import { useState } from 'react'
import { STATUSES } from '../constants.js'
import { useEscapeKey } from '../useEscapeKey.js'

// Fenêtre pour modifier un titre : statut, saison, épisode, suppression.
// - item : le titre à modifier
// - onSave : reçoit { status, season, episode } (renvoie une promesse)
// - onDelete : supprime le titre (renvoie une promesse)
// - onClose : ferme la fenêtre

function EditTitleModal({ item, onSave, onDelete, onClose }) {
  // On part des valeurs actuelles du titre
  const [status, setStatus] = useState(item.status)
  const [season, setSeason] = useState(item.season)
  const [episode, setEpisode] = useState(item.episode)
  const [error, setError] = useState('')
  const [isBusy, setIsBusy] = useState(false) // requête en cours
  useEscapeKey(onClose) // Échap ferme la fenêtre

  // Changer de statut, avec un petit automatisme
  function changeStatus(newStatus) {
    setStatus(newStatus)
    // Je commence à regarder : on passe à l'épisode 1 si j'étais à 0
    if (newStatus === 'En cours' && episode === 0) {
      setEpisode(1)
    }
  }

  // Saison suivante : on repart à l'épisode 1
  function nextSeason() {
    setSeason(season + 1)
    setEpisode(1)
  }

  async function handleSave(event) {
    event.preventDefault() // empêche le rechargement de la page
    setIsBusy(true)
    setError('')
    try {
      await onSave({ status, season, episode })
    } catch (err) {
      setError(err.message)
      setIsBusy(false)
    }
  }

  async function handleDelete() {
    // Petite fenêtre de confirmation du navigateur
    if (!window.confirm(`Supprimer « ${item.title} » de ta liste ?`)) return

    setIsBusy(true)
    setError('')
    try {
      await onDelete()
    } catch (err) {
      setError(err.message)
      setIsBusy(false)
    }
  }

  // Petit résumé sous le titre, ex. "3 saisons · 38 épisodes"
  const details = []
  if (item.totalSeasons > 1) details.push(`${item.totalSeasons} saisons`)
  if (item.totalEpisodes) details.push(`${item.totalEpisodes} épisodes`)

  return (
    // Le fond gris : un clic dessus ferme la fenêtre
    <div className="overlay" onClick={onClose}>
      {/* stopPropagation : un clic DANS la fenêtre ne la ferme pas */}
      <form className="modal" onSubmit={handleSave} onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">{item.title}</h2>
        {details.length > 0 && <p className="modal-subtitle">{details.join(' · ')}</p>}

        <label className="field">
          <span>Statut</span>
          <select value={status} onChange={(e) => changeStatus(e.target.value)}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        {/* Progression : boutons − et + */}
        <div className="field-row">
          <div className="field">
            <span>Saison</span>
            <div className="stepper">
              <button
                type="button"
                onClick={() => setSeason(season - 1)}
                disabled={season <= 1}
                aria-label="Saison précédente"
              >
                −
              </button>
              <span className="stepper-value">{season}</span>
              <button type="button" onClick={nextSeason} aria-label="Saison suivante">
                +
              </button>
            </div>
          </div>

          <div className="field">
            <span>Épisode</span>
            <div className="stepper">
              <button
                type="button"
                onClick={() => setEpisode(episode - 1)}
                disabled={episode <= 0}
                aria-label="Épisode précédent"
              >
                −
              </button>
              <span className="stepper-value">{episode}</span>
              <button
                type="button"
                onClick={() => setEpisode(episode + 1)}
                aria-label="Épisode suivant"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="modal-actions">
          {/* Supprimer à gauche, loin du bouton Enregistrer */}
          <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={isBusy}>
            Supprimer
          </button>
          <button type="button" className="btn" onClick={onClose}>
            Annuler
          </button>
          <button type="submit" className="btn btn-primary" disabled={isBusy}>
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditTitleModal
