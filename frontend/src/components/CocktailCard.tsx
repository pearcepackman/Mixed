import { useState } from 'react'
import { Check, X, FlaskConical } from 'lucide-react'

export interface CocktailCardIngredient {
  name: string
  measure: string | null
  owned?: boolean
}

export interface CocktailCardProps {
  cocktailId: number
  name: string
  imageUrl: string | null
  category?: string | null
  glass?: string | null
  alcoholic?: boolean
  instructions?: string
  ingredients?: CocktailCardIngredient[]
  ownedIngredients?: number
  totalIngredients?: number
}

export default function CocktailCard({
  name,
  imageUrl,
  category,
  glass,
  alcoholic,
  instructions,
  ingredients = [],
  ownedIngredients,
  totalIngredients,
}: CocktailCardProps) {
  const [flipped, setFlipped] = useState(false)

  const meta = [category, glass, alcoholic === false ? 'Non-alcoholic' : null].filter(Boolean).join(' · ')

  const canMakeBadge = (() => {
    if (ownedIngredients === undefined || totalIngredients === undefined) return null
    const missing = totalIngredients - ownedIngredients
    if (missing === 0) return { icon: Check, bg: 'bg-green-500', label: 'Can make' }
    if (missing <= 2) return { icon: FlaskConical, bg: 'bg-amber-500', label: `Missing ${missing}` }
    return { icon: X, bg: 'bg-red-500', label: `Missing ${missing}` }
  })()

  return (
    <div
      className="relative h-64 w-full cursor-pointer [perspective:1000px]"
      onClick={() => setFlipped((f) => !f)}
    >
      <div
        className={`relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d] ${
          flipped ? '[transform:rotateY(180deg)]' : ''
        }`}
      >
        {/* Front */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl [backface-visibility:hidden]">
          {imageUrl ? (
            <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-muted" />
          )}
          <div
            className="absolute inset-x-0 bottom-0 h-24"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.88), rgba(0,0,0,0.5) 50%, transparent)' }}
          />
          <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between gap-2">
            <div>
              <p className="text-base font-semibold text-white drop-shadow-sm">{name}</p>
              {ownedIngredients !== undefined && totalIngredients !== undefined && (
                <p className="text-xs text-white/70 mt-0.5">
                  {ownedIngredients}/{totalIngredients} ingredients
                </p>
              )}
            </div>
            {canMakeBadge && (
              <div className={`flex-shrink-0 rounded-full p-1.5 ${canMakeBadge.bg}`} aria-label={canMakeBadge.label}>
                <canMakeBadge.icon size={14} className="text-white" strokeWidth={2.5} />
              </div>
            )}
          </div>
        </div>

        {/* Back */}
        <div className="absolute inset-0 overflow-y-auto rounded-2xl border border-border bg-card p-4 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <p className="text-base font-semibold mb-0.5">{name}</p>
          {meta && <p className="text-xs text-muted-foreground mb-3">{meta}</p>}

          {ingredients.length > 0 && (
            <ul className="mb-3 flex flex-col gap-1">
              {ingredients.map((ing) => (
                <li key={ing.name} className="flex justify-between text-xs">
                  <span className={`capitalize ${ing.owned === false ? 'text-muted-foreground' : ''}`}>
                    {ing.name}
                  </span>
                  {ing.measure && (
                    <span className="text-muted-foreground ml-2 text-right">{ing.measure}</span>
                  )}
                </li>
              ))}
            </ul>
          )}

          {instructions && (
            <p className="text-xs text-muted-foreground leading-relaxed">{instructions}</p>
          )}
        </div>
      </div>
    </div>
  )
}
