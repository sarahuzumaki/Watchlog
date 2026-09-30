// Calcule la part vue d'un titre, entre 0 et 1 (ex. 0.4 = 40 %).
// Renvoie null si on n'a pas assez d'infos pour la calculer.

// Additionne une liste de nombres
function sum(numbers) {
  return numbers.reduce((total, n) => total + n, 0)
}

export function getProgress(item) {
  let watched
  let total

  if (item.seasonEpisodes && item.seasonEpisodes.length > 0) {
    // On connaît les épisodes de chaque saison :
    // épisodes vus = toutes les saisons précédentes + l'épisode actuel
    const previousSeasons = item.seasonEpisodes.slice(0, item.season - 1)
    watched = sum(previousSeasons) + item.episode
    total = sum(item.seasonEpisodes)
  } else if (item.season === 1 && item.totalEpisodes) {
    // Sinon, on ne peut calculer que pour la saison 1
    watched = item.episode
    total = item.totalEpisodes
  } else {
    return null
  }

  if (!total) return null
  return Math.min(1, watched / total) // jamais plus de 100 %
}
