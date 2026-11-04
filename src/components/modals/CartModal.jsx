import { useMemo } from "react";
import {
  GripHorizontal,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  X,
} from "lucide-react";

import {
  products,
  money,
  FREE_SHIPPING_THRESHOLD,
} from "../../data/products.js";

export default function CartModal({
  cart,
  onRemove,
  onUpdateQuantity,
  onClose,
  onExplore, 
}) {
  const lines = useMemo(() => {
    return Object.entries(cart ?? {})
      .map(([key, qty]) => {
        const [productId, variantId] = key.split(":");

        const product = products.find(
          (p) => String(p.id) === productId
        );

        const variant = product?.variants?.find(
          (v) => String(v.id) === variantId
        );

        if (!product || !variant) return null;

        return {
          key,
          product,
          variant,
          qty: Number(qty),
        };
      })
      .filter(Boolean);
  }, [cart]);



  if (lines.length === 0) {
    return (
      <div className="text-ink">
        <header className="flex items-center justify-between border-b border-line px-6 py-4 sm:px-7">
          <h2 className="font-serif text-2xl tracking-tight max-[550px]:text-[20px] max-[450px]:text-[18px]">
            Your beauty bag
          </h2>

          <div
            data-drag-handle
            className="flex max-[550px]:hidden cursor-grab touch-none justify-center rounded-full p-2 text-mocha/60 transition hover:bg-[#F2EAE0] active:cursor-grabbing"
          >
            <GripHorizontal size={23} strokeWidth={1.3} />
          </div>
          
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 transition hover:bg-[#F2EAE0]"
            aria-label="Close cart"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </header>

        <div className="flex flex-col items-center px-6 py-12 text-center sm:px-7">
          <ShoppingBag size={32} strokeWidth={1.5} className="text-ink" />

          <h3 className="mt-4 text-sm text-ink">Your bag is waiting</h3>

          <p className="mt-3 text-sm text-ink/80">
            Find a little something you love.
          </p>

          <button
            type="button"
            onClick={onExplore ?? onClose}
            className="mt-6 bg-mocha px-6 py-3 text-xs font-medium text-white transition hover:bg-[#59412e]"
          >
            Explore products
          </button>
        </div>
      </div>
    );
  }


  const subtotal = lines.reduce(
    (sum, line) => sum + line.variant.price * line.qty,
    0
  );

  const itemCount = lines.reduce(
    (sum, line) => sum + line.qty,
    0
  );

  const remaining = Math.max(
    FREE_SHIPPING_THRESHOLD - subtotal,
    0
  );

  const progress = Math.min(
    (subtotal / FREE_SHIPPING_THRESHOLD) * 100,
    100
  );

  return (
    <div className="flex max-h-[90vh] flex-col text-ink overflow-y-auto">

      <header className="shrink-0 border-b border-line px-6 pb-4 pt-3 max-[768px]:px-3 max-[768px]:pt-4">
        <div className="mb-2 flex items-start justify-end gap-2">
  
          <div
            data-drag-handle
            className="flex cursor-grab touch-none justify-center rounded-full p-2 text-mocha/60 transition hover:bg-[#F2EAE0] active:cursor-grabbing"
          >
            <GripHorizontal size={23} strokeWidth={1.3} />
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 transition hover:bg-[#F2EAE0]"
            aria-label="Close cart"
          >
            <X size={21} strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl tracking-tight sm:text-[28px]">
              Your beauty bag
            </h2>

            <p className="mt-1 text-[11px] tracking-wide text-muted">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </p>
          </div>

          <span className="flex size-8 items-center justify-center rounded-full bg-cream text-mocha">
            <ShoppingBag size={15} strokeWidth={1.5} />
          </span>
        </div>
      </header>

      <div className="min-h-40 flex-1 overflow-y-auto px-6 max-[768px]:px-3 max-[768px]:pt-4">
        <div className="divide-y divide-line">
          {lines.map(({ key, product: p, variant, qty }) => (
            <article key={key} className="flex gap-3 py-5 sm:gap-4">
      
              <div className="h-[100px] w-[88px] shrink-0 overflow-hidden rounded-md bg-[#f1e8dc] sm:h-[112px] sm:w-[100px]">
                <img
                  src={p.image}
                  alt={p.name}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-serif text-[14px] leading-snug sm:text-[15px]">
                      {p.name}
                    </h3>

                    <strong className="shrink-0 text-[12px] font-medium">
                      {money(variant.price * qty)}
                    </strong>
                  </div>

                  <div className="mt-1 flex items-center gap-1.5 text-[10px] text-muted">
                    {variant.color && (
                      <span
                        className="size-2.5 rounded-full border border-black/10"
                        style={{ backgroundColor: variant.color }}
                      />
                    )}

                    <span>{variant.label}</span>
                  </div>

                  <p className="mt-1 text-[11px] text-muted">
                    {money(variant.price)} each
                  </p>
                </div>

     
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex h-8 items-center rounded-md border border-line">
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateQuantity(key, Math.max(qty - 1, 1))
                      }
                      className="flex h-full w-8 items-center justify-center text-muted hover:bg-cream"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={12} />
                    </button>

                    <span className="min-w-6 text-center text-[11px]">
                      {qty}
                    </span>

                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(key, qty + 1)}
                      className="flex h-full w-8 items-center justify-center text-muted hover:bg-cream"
                      aria-label="Increase quantity"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemove(key)}
                    className="flex size-8 items-center justify-center rounded-full text-muted hover:bg-[#f4e6df] hover:text-rose"
                    aria-label={`Remove ${p.name}`}
                  >
                    <Trash2 size={14} strokeWidth={1.4} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="shrink-0 px-6 mb-4 pt-4 max-[768px]:px-3 max-[768px]:pt-4">
        <div className="rounded-lg bg-[#f1e8dc] px-4 py-3">
          <p className="text-[11px] leading-relaxed text-mocha">
            {remaining === 0
              ? "Lovely! Your order qualifies for free shipping."
              : `Add ${money(remaining)} more for complimentary shipping.`}
          </p>

          <div className="mt-2 h-1 overflow-hidden rounded-full bg-[#dfd0bd]">
            <div
              className="h-full rounded-full bg-mocha transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <footer className="shrink-0 border-t border-line bg-[#fcfaf6] px-6 pb-5 pt-4 max-[768px]:px-3 max-[768px]:pt-4">
        <div className="space-y-2 text-[12px]">
          <div className="flex items-center justify-between text-muted">
            <span>Subtotal</span>
            <span className="text-ink">{money(subtotal)}</span>
          </div>

          <div className="flex items-center justify-between text-muted">
            <span>Shipping</span>
            <span>{remaining === 0 ? "Free" : "Calculated at checkout"}</span>
          </div>

          <div className="flex items-center justify-between border-t border-line pt-3">
            <span className="font-medium text-ink">Total</span>

            <strong className="font-serif text-xl font-medium text-ink">
              {money(subtotal)}
            </strong>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            alert("Store preview: connect a checkout and payment backend.")
          }
          className="mt-4 flex h-12 w-full items-center justify-center gap-2 bg-mocha text-[11px] font-medium tracking-wide text-white transition hover:bg-[#59412e]"
        >
          PROCEED TO CHECKOUT
          <ArrowRight size={14} />
        </button>

        <button
          type="button"
          onClick={onClose}
          className="mt-3 flex w-full items-center justify-center text-[11px] text-muted underline underline-offset-4 hover:text-mocha"
        >
          Continue shopping
        </button>
      </footer>
    </div>
  );
}