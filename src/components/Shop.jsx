import { useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { categories } from "../data/products.js";
import ProductCard from "./ProductCard.jsx";

export default function Shop({
  category,
  onCategory,
  search,
  onSearch,
  products,
  wishlist,
  onAdd,
  onToggleWish,
  onView,
}) {
  const tabsRef = useRef(null);

  // keep the selected pill in view when it changes
  useEffect(() => {
    tabsRef.current
      ?.querySelector('[data-active="true"]')
      ?.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
  }, [category]);

  return (
    <section
      id="shop"
      className="bg-[#fffdfa] px-[7%] py-12 max-sm:px-4 max-sm:py-8 max-[1025px]:px-[20px]"
    >
      <div className="mb-7 flex items-end justify-between gap-4 max-sm:flex-col max-sm:items-start">
        <div>
          <p className="mb-2 text-[10px] font-bold tracking-[0.2em] text-mocha">
            EVERYDAY CARE, CURATED
          </p>

          <h2 className="font-serif text-[clamp(24px,3vw,36px)] font-normal leading-tight text-[#4e3b29]">
            Your daily essentials
          </h2>
        </div>

        <p className="font-serif text-sm italic text-muted">
          Skin first. Care always.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        {/* Category tabs: wrap on desktop, swipe row at 880px and below */}
        <div
          ref={tabsRef}
          className="flex flex-wrap items-center gap-2 max-[880px]:w-full max-[880px]:min-w-0 max-[880px]:snap-x max-[880px]:flex-nowrap max-[880px]:overflow-x-auto max-[880px]:overscroll-x-contain max-[880px]:pb-1 max-[880px]:[scrollbar-width:none] max-[880px]:[&::-webkit-scrollbar]:hidden"
        >
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              data-active={category === c}
              onClick={() => onCategory(c)}
              className={`rounded-full border px-5 py-1.5 text-[14px] transition-colors max-[880px]:shrink-0 max-[880px]:snap-start max-[880px]:whitespace-nowrap ${
                category === c
                  ? "border-mocha bg-mocha text-white"
                  : "border-line bg-white text-ink hover:border-mocha"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <label className="flex w-full max-w-[220px] items-center gap-2 border-b border-line pb-2 text-muted max-[1102px]:mt-[20px] max-sm:max-w-full">
          <Search size={20} strokeWidth={2} />

          <input
            placeholder="Find your favourite"
            aria-label="Search products"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full bg-transparent text-[13px] text-ink outline-none placeholder:text-muted"
          />
        </label>
      </div>

      <div className="grid grid-cols-4 gap-x-5 gap-y-7 max-lg:grid-cols-3 max-md:grid-cols-2 max-sm:gap-x-3 max-sm:gap-y-5">
        {products.length > 0 ? (
          products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              saved={wishlist.includes(p.id)}
              onAdd={onAdd}
              onToggleWish={onToggleWish}
              onView={onView}
            />
          ))
        ) : (
          <p className="col-span-full py-12 text-center text-sm text-muted">
            No products found. Try another search or category.
          </p>
        )}
      </div>

      <p className="mt-8 text-center text-[10px] text-muted">
        Preview collection · Sample products and prices. Product images are
        illustrative.
      </p>
    </section>
  );
}