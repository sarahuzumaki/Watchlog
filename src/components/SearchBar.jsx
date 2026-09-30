import { useEffect, useState } from 'react'
import { searchAnime } from '../api/anilist.js'
import { searchSeries } from '../api/tmdb.js'

// Barre de recherche avec résultats en direct.
// - type : "serie" (TMDB) ou "anime" (AniList)
// - existingKeys : titres déjà dans ma liste, sous la forme "source:id"
// - onPick : fonction appelée avec le résultat cliqué (renvoie une promesse)

const DELAY = 500 // pause en millisecondes après la dernière lettre

function SearchBar({ type, existingKeys, onPick }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState('')
  const [addingId, setAddingId] = useState(null) // résultat en cours d'ajout

  const text = query.trim()

  // Se relance à chaque lettre tapée
  useEffect(() => {
    if (text === '') return // rien à chercher

    let isCancelled = false

    // On attend une demi-seconde avant de chercher
    const timer = setTimeout(async () => {
      setIsSearching(true)
      setError('')
      try {
        const found = type === 'serie' ? await searchSeries(text) : await searchAnime(text)
        // Si une nouvelle lettre a été tapée entre-temps, on ignore ce résultat
        if (!isCancelled) setResults(found)
      } catch (err) {
        if (!isCancelled) {
          setResults([])
          setError(err.message)
        }
      } finally {
        if (!isCancelled) setIsSearching(false)
      }
    }, DELAY)

    // "Nettoyage" : si une lettre est tapée avant la fin de la pause,
    // on annule le minuteur précédent
    return () => {
      isCancelled = true
      clearTimeout(timer)
    }
  }, [text, type])

  // Change le texte ; si la barre est vidée, on efface aussi les résultats
  function changeQuery(value) {
    setQuery(value)
    if (value.trim() === '') setResults([])
  }

  async function handlePick(result) {
    setAddingId(result.sourceId)
    setError('')
    try {
      await onPick(result)
      changeQuery('') // on vide la barre après l'ajout
    } catch (err) {
      setError(err.message)
    } finally {
      setAddingId(null)
    }
  }

  // Le petit message sous la barre
  let message = ''
  if (text === '') {
    message = type === 'serie' ? "Tape le nom d'une série" : "Tape le nom d'un anime"
  } else if (error) {
    message = error
  } else if (isSearching && results.length === 0) {
    message = 'Recherche…'
  } else if (!isSearching && results.length === 0) {
    message = 'Aucun résultat'
  }

  return (
    <div className="search">
      <input
        className="search-input"
        type="search"
        placeholder={type === 'serie' ? 'Rechercher une série…' : 'Rechercher un anime…'}
        value={query}
        onChange={(e) => changeQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && changeQuery('')}
      />

      {message && <p className="search-message">{message}</p>}

      {text !== '' && results.length > 0 && (
        <ul className="search-results">
          {results.map((result) => {
            const isAlreadyAdded = existingKeys.has(`${result.source}:${result.sourceId}`)
            const isAdding = addingId === result.sourceId

            return (
              <li key={result.sourceId}>
                <button
                  type="button"
                  className="search-result"
                  disabled={isAlreadyAdded || addingId !== null}
                  onClick={() => handlePick(result)}
                >
                  {result.poster ? (
                    <img className="search-poster" src={result.poster} alt="" loading="lazy" />
                  ) : (
                    <span className="search-poster" />
                  )}
                  <span className="search-name">
                    {result.title}
                    {result.year && <span className="search-year"> ({result.year})</span>}
                  </span>
                  {isAlreadyAdded && <span className="search-tag">Déjà ajouté</span>}
                  {isAdding && <span className="search-tag">Ajout…</span>}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default SearchBar
