// Recherche d'anime sur AniList (gratuit, sans clé).
// AniList utilise GraphQL : on envoie une "question" qui décrit
// exactement les informations qu'on veut recevoir.

const ANILIST_URL = 'https://graphql.anilist.co'

const SEARCH_QUERY = `
  query ($search: String) {
    Page(perPage: 10) {
      media(search: $search, type: ANIME, isAdult: false, sort: SEARCH_MATCH) {
        id
        title { english romaji }
        episodes
        seasonYear
        coverImage { large }
      }
    }
  }
`

// Renvoie une liste de résultats au format commun de Watchlog.
export async function searchAnime(text) {
  const response = await fetch(ANILIST_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: SEARCH_QUERY, variables: { search: text } }),
  })

  if (!response.ok) throw new Error('AniList ne répond pas')
  const json = await response.json()

  return json.data.Page.media.map((anime) => ({
    source: 'anilist',
    sourceId: String(anime.id),
    // Titre anglais, sinon titre japonais en lettres latines
    title: anime.title.english || anime.title.romaji,
    poster: anime.coverImage.large,
    year: anime.seasonYear,
    totalEpisodes: anime.episodes, // peut être vide si l'anime est en cours de diffusion
    totalSeasons: 1, // sur AniList, chaque saison est un titre séparé
    seasonEpisodes: anime.episodes ? [anime.episodes] : null,
  }))
}
