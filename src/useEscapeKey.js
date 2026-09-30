import { useEffect } from 'react'

// "Hook" réutilisable : appelle onEscape quand on appuie sur la touche Échap.
// Utilisé par les fenêtres pour se fermer au clavier.
export function useEscapeKey(onEscape) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onEscape()
    }

    document.addEventListener('keydown', handleKeyDown)
    // Quand la fenêtre se ferme, on arrête d'écouter le clavier
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onEscape])
}
