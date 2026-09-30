// Recherche de séries sur TMDB.
// La clé TMDB est rangée dans Supabase (table "private_settings"),
// lisible seulement quand je suis connectée : elle n'est jamais dans le code du site.
import { supabase } from '../supabase.js'

const TMDB_URL = 'https://api.themoviedb.org/3'
const IMAGE_URL = 'https://image.tmdb.org/t/p/w342' // w342 = largeur de l'image

// On garde la clé en mémoire après la première lecture
let cachedKey = null

async function getTmdbKey() {
  if (cachedKey) return cachedKey

  const { data, error } = await supabase
    .from('private_settings')
    .select('value')
    .eq('name', 'tmdb_api_key')
    .maybeSingle() // une seule ligne, ou rien

  // Messages précis selon la cause, pour savoir quoi corriger
  if (error) {
    console.error('Lecture de la clé TMDB :', error)
    if (error.code === 'PGRST205' || error.code === '42P01') {
      throw new Error('Clé TMDB : la table private_settings n’existe pas dans Supabase.')
    }
    if (error.code === '42501') {
      throw new Error('Clé TMDB : accès refusé à private_settings (GRANT manquant).')
    }
    throw new Error('Clé TMDB : erreur Supabase (' + error.message + ').')
  }
  if (!data) {
    throw new Error('Clé TMDB : aucune ligne "tmdb_api_key" visible pour ton compte.')
  }
  cachedKey = data.value
  return cachedKey
}

// Petite fonction pour appeler TMDB en français
async function callTmdb(path, params = {}) {
  const key = await getTmdbKey()
  const query = new URLSearchParams({ api_key: key, language: 'fr-FR', ...params })

  const response = await fetch(`${TMDB_URL}${path}?${query}`)
  if (!response.ok) throw new Error('TMDB ne répond pas')
  return response.json()
}

// Renvoie une liste de résultats au format commun de Watchlog.
export async function searchSeries(text) {
  const json = await callTmdb('/search/tv', { query: text })

  return json.results.slice(0, 10).map((serie) => ({
    source: 'tmdb',
    sourceId: String(serie.id),
    title: serie.name,
    poster: serie.poster_path ? IMAGE_URL + serie.poster_path : null,
    year: serie.first_air_date ? serie.first_air_date.slice(0, 4) : null,
  }))
}

// La recherche ne donne pas le nombre d'épisodes :
// on le demande à part, seulement pour la série choisie.
export async function getSeriesDetails(id) {
  const serie = await callTmdb(`/tv/${id}`)
  return {
    totalEpisodes: serie.number_of_episodes,
    totalSeasons: serie.number_of_seasons,
  }
}
