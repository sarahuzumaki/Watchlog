// Le choix principal : Séries | Anime.
// "value" = le type actif, "onChange" = fonction appelée quand on clique.

const TYPES = [
  { value: 'serie', label: 'Séries' },
  { value: 'anime', label: 'Anime' },
]

function TypeSwitch({ value, onChange }) {
  return (
    <div className="type-switch">
      {TYPES.map((type) => (
        <button
          key={type.value}
          type="button"
          className={type.value === value ? 'type-switch-btn is-active' : 'type-switch-btn'}
          aria-pressed={type.value === value}
          onClick={() => onChange(type.value)}
        >
          {type.label}
        </button>
      ))}
    </div>
  )
}

export default TypeSwitch
