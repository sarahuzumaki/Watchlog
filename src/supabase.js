// Connexion à Supabase (base de données + comptes).
// Les valeurs viennent du fichier .env (Vite ne lit que les variables "VITE_...").
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_KEY

if (!url || !key) {
  throw new Error('VITE_SUPABASE_URL ou VITE_SUPABASE_KEY manquant dans le fichier .env')
}

// "supabase" est l'objet qu'on utilise partout pour parler à la base
export const supabase = createClient(url, key)
