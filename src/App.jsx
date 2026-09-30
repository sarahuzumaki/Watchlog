import { useEffect, useState } from 'react'
import TitleCard from './components/TitleCard.jsx'
import TypeSwitch from './components/TypeSwitch.jsx'
import StatusTabs from './components/StatusTabs.jsx'
import LoginForm from './components/LoginForm.jsx'
import SearchBar from './components/SearchBar.jsx'
import { STATUSES } from './constants.js'
import { supabase } from './supabase.js'
import { fetchTitles, insertTitle } from './db.js'
import { getSeriesDetails } from './api/tmdb.js'
import './App.css'

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
    content = <p className="empty">Rien ici pour l'instant.</p>
  } else {
    content = (
      <div className="grid">
        {visibleTitles.map((item) => (
          <TitleCard key={item.id} item={item} />
        ))}
      </div>
    )
  }

  return (
    <div className="app">
      <header className="header">
        <h1 className="logo">Watchlog</h1>
        <TypeSwitch value={type} onChange={setType} />
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
    </div>
  )
}

export default App
