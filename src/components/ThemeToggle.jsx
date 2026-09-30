import { useState } from 'react'

// Bouton soleil / lune pour passer du thème sombre au thème clair.
// Le thème est posé sur <html data-theme="light"> (sombre = pas d'attribut)
// et retenu dans le navigateur du visiteur (localStorage).

const STORAGE_KEY = 'watchlog-theme'

function ThemeToggle() {
  // Au départ : le thème déjà appliqué par le petit script de index.html
  const [theme, setTheme] = useState(
    document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
  )

  function toggleTheme() {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)

    // On change l'attribut sur <html> : le CSS change les couleurs
    if (newTheme === 'light') {
      document.documentElement.dataset.theme = 'light'
    } else {
      delete document.documentElement.dataset.theme
    }

    // Couleur de la barre du navigateur sur téléphone
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.content = newTheme === 'light' ? '#faf9f6' : '#151412'

    try {
      localStorage.setItem(STORAGE_KEY, newTheme)
    } catch {
      // Stockage bloqué : le choix ne sera juste pas retenu
    }
  }

  const label = theme === 'dark' ? 'Passer en thème clair' : 'Passer en thème sombre'

  return (
    <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label={label} title={label}>
      {theme === 'dark' ? (
        // Soleil (on est en sombre : on propose le clair)
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
          <path
            d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        // Lune (on est en clair : on propose le sombre)
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path
            d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  )
}

export default ThemeToggle
