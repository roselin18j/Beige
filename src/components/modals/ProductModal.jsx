import { useState, useEffect } from "react";
import { products, money } from "../../data/products.js";
import { ShoppingBag, X, Minus, Plus } from "lucide-react";

export default function ProductModal({ productId, onAdd, onClose }) {
  const product = products.find((p) => p.id === Number(productId));

  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    if (product) {
      setSelectedVariant(product.variants[0]);
      setQuantity(1);
    }
  }, [productId]);

  if (!product || !selectedVariant) return null;

  const handleAddToBag = () => {
    onAdd(product.id, selectedVariant.id, quantity);
  };

  return (

    <div className="relative flex max-h-[90vh] w-full flex-col overflow-hidden">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 flex size-8 items-center justify-center rounded-full bg-white/80"
        aria-label="Close product details"
      >
        <X size={20} />
      </button>


      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="flex flex-col lg:flex-row lg:items-stretch">

          <div className="relative aspect-[4/3] w-full shrink-0 bg-cream lg:aspect-auto lg:min-h-[480px] lg:w-1/2">
            <img
              src={product.image}
              alt={product.name}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center p-6 sm:p-8 lg:w-1/2">
            <p className="mb-3 text-xs tracking-[0.2em] text-muted">
              {product.tag || product.category}
            </p>

            <h2 className="font-serif text-2xl leading-tight text-ink sm:text-3xl">
              {product.name}
            </h2>

 
            <div className="mt-6">
              <p className="mb-3 text-xs text-muted">Select size / shade</p>

              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => setSelectedVariant(variant)}
                    className={`flex items-center gap-2 border px-4 py-2 text-xs transition ${
                      selectedVariant.id === variant.id
                        ? "border-mocha bg-mocha text-white"
                        : "border-line text-ink hover:border-mocha"
                    }`}
                  >
                    {variant.color && (
                      <span
                        className="size-3 rounded-full border border-black/10"
                        style={{ backgroundColor: variant.color }}
                      />
                    )}
                    {variant.label}
                  </button>
                ))}
              </div>
            </div>


            <div className="mt-5">
              <p className="font-serif text-2xl">
                {money(selectedVariant.price)}
              </p>
            </div>

            <div className="my-6 h-px bg-line" />

            <p className="text-sm leading-7 text-muted">
              Discover your everyday beauty essential, thoughtfully selected
              for your daily routine.
            </p>

            <div className="mt-6 flex items-center justify-between">
              <span className="text-sm text-ink">Quantity</span>

              <div className="flex items-center gap-4 rounded-full border border-line px-3 py-2">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >
                  <Minus size={15} />
                </button>

                <span className="min-w-5 text-center text-sm">{quantity}</span>

                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                >
                  <Plus size={15} />
                </button>
              </div>
            </div>


            <button
              type="button"
              onClick={handleAddToBag}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-mocha px-6 py-4 text-sm font-medium text-white transition hover:bg-ink"
            >
              <ShoppingBag size={17} />
              Add {quantity} to bag · {money(selectedVariant.price * quantity)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}