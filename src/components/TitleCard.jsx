// Une carte = une affiche + le nom + une ligne d'info selon le statut.
import { getProgress } from '../progress.js'

// Renvoie le petit texte affiché sous le nom.
function getInfoText(item) {
  if (item.status === 'En cours') {
    return `Saison ${item.season}, épisode ${item.episode}`
  }
  if (item.status === 'Terminé') {
    return 'Terminé'
  }
  // "Pas commencé" : on affiche le nombre d'épisodes (s'il est connu)
  if (!item.totalEpisodes) {
    return 'Épisodes inconnus'
  }
  const plural = item.totalEpisodes > 1 ? 's' : ''
  return `${item.totalEpisodes} épisode${plural}`
}

// onClick est optionnel : s'il est fourni (quand je suis connectée),
// la carte devient cliquable, à la souris comme au clavier.
function TitleCard({ item, onClick }) {
  // Barre de progression : seulement pour les titres "En cours"
  const progress = item.status === 'En cours' ? getProgress(item) : null

  const clickProps = onClick
    ? {
        role: 'button',
        tabIndex: 0, // la carte peut recevoir le focus avec Tab
        onClick,
        onKeyDown: (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onClick()
          }
        },
      }
    : {}

  return (
    <article className={onClick ? 'card card--clickable' : 'card'} {...clickProps}>
      {item.poster ? (
        <img
          className="card-poster"
          src={item.poster}
          alt={`Affiche de ${item.title}`}
          loading="lazy"
        />
      ) : (
        // Pas d'affiche : un rectangle gris avec le nom à la place
        <div className="card-poster card-poster--empty">{item.title}</div>
      )}

      <h3 className="card-title">{item.title}</h3>

      <p className={item.status === 'Terminé' ? 'card-info card-info--done' : 'card-info'}>
        {getInfoText(item)}
      </p>

      {progress !== null && (
        <div className="progress" title={`${Math.round(progress * 100)} % vu`}>
          {/* La largeur de la partie jaune = le pourcentage vu */}
          <div className="progress-bar" style={{ width: `${progress * 100}%` }} />
        </div>
      )}
    </article>
  )
}

export default TitleCard
