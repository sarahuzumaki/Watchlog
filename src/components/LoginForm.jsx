import { useState } from 'react'
import { supabase } from '../supabase.js'
import { useEscapeKey } from '../useEscapeKey.js'

// Fenêtre de connexion (réservée à moi : les inscriptions sont fermées).
// - onClose : ferme la fenêtre

function LoginForm({ onClose }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  useEscapeKey(onClose) // Échap ferme la fenêtre

  async function handleSubmit(event) {
    event.preventDefault() // empêche le rechargement de la page
    setError('')
    setIsLoading(true)

    // On demande à Supabase de vérifier l'e-mail et le mot de passe
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    setIsLoading(false)
    if (error) {
      setError('E-mail ou mot de passe incorrect.')
    } else {
      onClose()
    }
  }

  return (
    // Le fond gris : un clic dessus ferme la fenêtre
    <div className="overlay" onClick={onClose}>
      {/* stopPropagation : un clic DANS la fenêtre ne la ferme pas */}
      <form className="modal" onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Connexion</h2>

        <label className="field">
          <span>E-mail</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            autoFocus
          />
        </label>

        <label className="field">
          <span>Mot de passe</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        {error && <p className="form-error">{error}</p>}

        <div className="modal-actions">
          <button type="button" className="btn" onClick={onClose}>
            Annuler
          </button>
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Connexion…' : 'Se connecter'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default LoginForm
