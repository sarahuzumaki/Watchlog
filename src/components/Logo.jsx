// Logo Watchlog : carré jaune, bouton "lecture" et petite barre de progression.
// Couleurs fixes (jaune + noir) : lisible en thème sombre comme en clair.

function Logo({ size = 32 }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
      {/* Fond : carré jaune aux coins arrondis */}
      <rect width="32" height="32" rx="8" fill="#FFB000" />
      {/* Bouton "lecture" */}
      <path d="M12.5 8.5 L21.5 14 L12.5 19.5 Z" fill="#000" strokeLinejoin="round" />
      {/* Barre de progression : le fond, puis la partie déjà vue */}
      <line x1="8" y1="24.5" x2="24" y2="24.5" stroke="#000" strokeOpacity="0.25" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="8" y1="24.5" x2="17" y2="24.5" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

export default Logo
