// Tout ce qui lit ou écrit la table "titles" dans Supabase.
import { supabase } from './supabase.js'

// Transforme une ligne de la base (noms_avec_tirets)
// en objet pour React (nomsEnCamelCase).
function fromRow(row) {
  return {
    id: row.id,
    type: row.type,
    status: row.status,
    title: row.title,
    poster: row.poster,
    totalEpisodes: row.total_episodes,
    totalSeasons: row.total_seasons,
    season: row.season,
    episode: row.episode,
    source: row.source,
    sourceId: row.source_id,
  }
}

// Récupère tous les titres, du plus ancien au plus récent.
export async function fetchTitles() {
  const { data, error } = await supabase
    .from('titles')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) throw error
  return data.map(fromRow)
}
