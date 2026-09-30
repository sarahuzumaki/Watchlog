// Une carte = une affiche + le nom + une ligne d'info selon le statut.

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

function TitleCard({ item }) {
  return (
    <article className="card">
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
    </article>
  )
}

export default TitleCard
