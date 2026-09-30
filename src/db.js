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
    seasonEpisodes: row.season_episodes, // épisodes par saison, ex. [10, 10, 8]
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

// Ajoute un titre et renvoie la ligne créée.
export async function insertTitle(item) {
  const { data, error } = await supabase
    .from('titles')
    .insert({
      type: item.type,
      status: item.status,
      title: item.title,
      poster: item.poster,
      total_episodes: item.totalEpisodes,
      total_seasons: item.totalSeasons,
      season_episodes: item.seasonEpisodes,
      source: item.source,
      source_id: item.sourceId,
    })
    .select()
    .single()

  if (error) {
    // Code 23505 = ce titre existe déjà (règle "unique" de la table)
    if (error.code === '23505') throw new Error('Ce titre est déjà dans ta liste.')
    throw new Error("Impossible d'ajouter ce titre.")
  }
  return fromRow(data)
}

// Modifie le statut et la progression d'un titre, et renvoie la ligne à jour.
export async function updateTitle(id, changes) {
  const row = {
    status: changes.status,
    season: changes.season,
    episode: changes.episode,
  }
  // Épisodes par saison : seulement s'ils sont fournis
  if (changes.seasonEpisodes) row.season_episodes = changes.seasonEpisodes

  const { data, error } = await supabase
    .from('titles')
    .update(row)
    .eq('id', id) // seulement la ligne qui a cet identifiant
    .select()
    .single()

  if (error) throw new Error("Impossible d'enregistrer les modifications.")
  return fromRow(data)
}

// Supprime un titre.
export async function deleteTitle(id) {
  const { error } = await supabase.from('titles').delete().eq('id', id)
  if (error) throw new Error('Impossible de supprimer ce titre.')
}
