import { useEffect, useState } from 'react'
import TitleCard from './components/TitleCard.jsx'
import TypeSwitch from './components/TypeSwitch.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'
import Logo from './components/Logo.jsx'
import StatusTabs from './components/StatusTabs.jsx'
import LoginForm from './components/LoginForm.jsx'
import SearchBar from './components/SearchBar.jsx'
import EditTitleModal from './components/EditTitleModal.jsx'
import { STATUSES } from './constants.js'
import { supabase } from './supabase.js'
import { fetchTitles, insertTitle, updateTitle, deleteTitle } from './db.js'
import { getSeriesDetails } from './api/tmdb.js'
import './App.css'

// Message quand un onglet est vide, ex. "Aucune série en cours."
function getEmptyText(type, status) {
  const what = type === 'serie' ? 'Aucune série' : 'Aucun anime'
  if (status === 'En cours') return `${what} en cours.`
  if (status === 'Terminé') return type === 'serie' ? 'Aucune série terminée.' : 'Aucun anime terminé.'
  return type === 'serie' ? 'Aucune série à commencer.' : 'Aucun anime à commencer.'
}

function App() {
  // Tous mes titres (chargés depuis Supabase)
  const [titles, setTitles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  // Ce que je regarde en ce moment : "serie" ou "anime"
  const [type, setType] = useState('serie')
  // L'onglet actif : "En cours", "Pas commencé" ou "Terminé"
  const [status, setStatus] = useState('En cours')
  // La session = ma connexion (null si personne n'est connecté)
  const [session, setSession] = useState(null)
  // La fenêtre de connexion est-elle ouverte ?
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  // Le titre ouvert dans la fenêtre de modification (null = fermée)
  const [editingItem, setEditingItem] = useState(null)

  // Au démarrage : on charge la liste depuis Supabase
  useEffect(() => {
    fetchTitles()
      .then((data) => setTitles(data))
      .catch(() => setLoadError('Impossible de charger la liste. Réessaie plus tard.'))
      .finally(() => setIsLoading(false))
  }, [])

  // Au démarrage : on regarde si je suis déjà connectée,
  // puis on écoute les connexions / déconnexions
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))

    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })
    // Quand le composant disparaît, on arrête d'écouter
    return () => data.subscription.unsubscribe()
  }, [])

  // Vrai si je suis connectée (donc autorisée à modifier)
  const isOwner = session !== null

  // Les titres déjà ajoutés, sous la forme "source:id" (pour repérer les doublons)
  const existingKeys = new Set(titles.map((item) => `${item.source}:${item.sourceId}`))

  // Quand je clique sur un résultat de recherche
  async function addFromSearch(result) {
    let details = {}
    // Pour une série, on demande à TMDB le nombre de saisons et d'épisodes
    if (result.source === 'tmdb') {
      details = await getSeriesDetails(result.sourceId)
    }

    // On enregistre dans Supabase, dans l'onglet où je me trouve
    const saved = await insertTitle({ ...result, ...details, type, status })
    // (prev) = la liste la plus à jour, même si elle a changé pendant l'attente
    setTitles((prev) => [...prev, saved])
  }

  // Enregistre les modifications, puis remplace l'ancien titre dans la liste
  async function saveEdit(changes) {
    // Série ajoutée avant l'étape 7 : on récupère au passage
    // le nombre d'épisodes de chaque saison (pour la barre de progression)
    if (editingItem.source === 'tmdb' && !editingItem.seasonEpisodes) {
      try {
        const details = await getSeriesDetails(editingItem.sourceId)
        changes = { ...changes, seasonEpisodes: details.seasonEpisodes }
      } catch {
        // Pas grave si ça échoue : on enregistre quand même le reste
      }
    }

    const updated = await updateTitle(editingItem.id, changes)
    setTitles((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
    setEditingItem(null)
  }

  // Supprime le titre, puis le retire de la liste
  async function removeEditing() {
    await deleteTitle(editingItem.id)
    setTitles((prev) => prev.filter((item) => item.id !== editingItem.id))
    setEditingItem(null)
  }

  // 1) On garde seulement les titres de la bonne liste (séries OU anime)
  const titlesOfType = titles.filter((item) => item.type === type)

  // 2) On compte combien il y en a dans chaque onglet
  const counts = {}
  for (const s of STATUSES) {
    counts[s] = titlesOfType.filter((item) => item.status === s).length
  }

  // 3) On garde seulement ceux de l'onglet actif
  const visibleTitles = titlesOfType.filter((item) => item.status === status)

  // Ce qui s'affiche dans la zone principale
  let content
  if (isLoading) {
    content = <p className="empty">Chargement…</p>
  } else if (loadError) {
    content = <p className="empty">{loadError}</p>
  } else if (visibleTitles.length === 0) {
    content = <p className="empty">{getEmptyText(type, status)}</p>
  } else {
    content = (
      <div className="grid">
        {visibleTitles.map((item) => (
          <TitleCard
            key={item.id}
            item={item}
            // Cliquable seulement si je suis connectée
            onClick={isOwner ? () => setEditingItem(item) : undefined}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="app">
      <header className="header">
        <h1 className="logo">
          <Logo />
          Watchlog
        </h1>
        {/* À droite : le choix Séries | Anime et le bouton de thème */}
        <div className="header-actions">
          <TypeSwitch value={type} onChange={setType} />
          <ThemeToggle />
        </div>
      </header>

      {/* La recherche n'existe que si je suis connectée.
          key={type} : la barre repart de zéro quand je change de liste */}
      {isOwner && (
        <SearchBar key={type} type={type} existingKeys={existingKeys} onPick={addFromSearch} />
      )}

      <div className="toolbar">
        <StatusTabs value={status} onChange={setStatus} counts={counts} />
      </div>

      <main>{content}</main>

      {/* Bas de page : lien discret de connexion / déconnexion */}
      <footer className="footer">
        {isOwner ? (
          <>
            <span>Connectée</span>
            <button type="button" className="link-btn" onClick={() => supabase.auth.signOut()}>
              Déconnexion
            </button>
          </>
        ) : (
          <button type="button" className="link-btn" onClick={() => setIsLoginOpen(true)}>
            Connexion
          </button>
        )}
      </footer>

      {isLoginOpen && <LoginForm onClose={() => setIsLoginOpen(false)} />}

      {editingItem && (
        <EditTitleModal
          item={editingItem}
          onSave={saveEdit}
          onDelete={removeEditing}
          onClose={() => setEditingItem(null)}
        />
      )}
    </div>
  )
}

export default App
