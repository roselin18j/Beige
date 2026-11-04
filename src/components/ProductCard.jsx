
import { money } from "../data/products.js";
import { Heart, ShoppingBag, Plus } from "lucide-react";

export function ProductArt({ product }) {
  return (
    <img
      src={product.image}
      alt={product.name}
      loading="lazy"
      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
    />
  );
}

export default function ProductCard({
  product: p,
  saved,
  onAdd,
  onToggleWish,
  onView,
}) {
  const startingPrice = Math.min(
    ...p.variants.map((variant) => variant.price)
  );

  const hasColors = p.variants.some((variant) => variant.color);

  return (
    <article className="group min-w-0">
      {/* Image */}
      <div className="relative overflow-hidden">
        <button
          type="button"
          onClick={() => onView(p.id)}
          aria-label={`View ${p.name}`}
          className="relative flex aspect-square w-full items-center justify-center overflow-hidden bg-[#f1e8dc]"
        >
          {p.tag && (
            <span className="absolute top-2 left-2 z-10 bg-white/90 px-2 py-1 text-[9px] tracking-wide text-mocha">
              {p.tag}
            </span>
          )}

          <ProductArt product={p} />

          <span className="absolute inset-x-0 bottom-0 translate-y-full bg-mocha/90 py-3 text-center text-[10px] tracking-wide text-white transition-transform duration-300 group-hover:translate-y-0">
            Discover product
            <Plus size={12} className="ml-1 inline" />
          </span>
        </button>

        {/* Wishlist */}
        <button
          type="button"
          onClick={() => onToggleWish(p.id)}
          aria-label={`Save ${p.name}`}
          aria-pressed={saved}
          className={`absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-white/90 transition-colors ${
            saved ? "text-rose" : "text-mocha hover:text-rose"
          }`}
        >
          <Heart
            size={15}
            strokeWidth={1.5}
            fill={saved ? "currentColor" : "none"}
          />
        </button>
      </div>

      {/* Category and options */}
      <div className="mt-2 flex items-center justify-between gap-2 text-[10px] text-muted">
        <span className="truncate">{p.category}</span>
        <span className="shrink-0">{p.variants.length} options</span>
      </div>

      {/* Name */}
      <button
        type="button"
        onClick={() => onView(p.id)}
        className="mt-1 block w-full text-left font-serif text-[13px] leading-snug text-ink transition-colors hover:text-mocha"
      >
        {p.name}
      </button>

      {/* Variant colors or sizes */}
      <div className="mt-2 flex min-h-4 items-center gap-2 text-[10px] text-muted">
        {hasColors ? (
          <>
            <div className="flex items-center gap-1">
              {p.variants
                .filter((variant) => variant.color)
                .map((variant) => (
                  <span
                    key={variant.id}
                    title={variant.label}
                    className="size-3 rounded-full border border-black/10"
                    style={{ backgroundColor: variant.color }}
                  />
                ))}
            </div>
            <span>{p.variants.length} shades</span>
          </>
        ) : (
          <span>
            {p.variants.map((variant) => variant.label).join(" / ")}
          </span>
        )}
      </div>

      {/* Price and add */}
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-2">
        <div className="flex items-center gap-1">
          <span className="text-[9px] text-muted">From</span>
          <strong className="text-[11px] font-medium text-ink">
            {money(startingPrice)}
          </strong>
        </div>

        <button
          type="button"
          onClick={() => onAdd(p.id)}
          className="flex items-center gap-1 whitespace-nowrap text-[10px] text-muted transition-colors hover:text-mocha"
        >
          <ShoppingBag size={12} strokeWidth={1.5} />
          Select option
        </button>
      </div>
    </article>
  );
}
