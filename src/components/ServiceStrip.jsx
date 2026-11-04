import { Truck, ShieldCheck, ShoppingBag } from "lucide-react";

const items = [
  { icon: Truck, text: "Free shipping on ₹1,499+", dark: true },
  { icon: ShieldCheck, text: "Secure checkout with Razorpay", dark: true },
  { icon: ShoppingBag, text: "Find your everyday favourites", dark: false },
];

function Item({ icon: Icon, text, dark }) {
  return (
    <span
      className={`flex items-center gap-3 whitespace-nowrap ${
        dark ? "text-[#322a23]" : ""
      }`}
    >
      <Icon size={18} strokeWidth={1.8} />
      {text}
    </span>
  );
}

export default function TrustBar() {
  return (
    <div className="border-b border-[#ded4c5] bg-[#f8f4eb] text-[11px] text-mocha">
      {/* Marquee keyframes + hover pause */}
      <style>{`
        @keyframes beige-marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .beige-marquee {
          animation: beige-marquee 18s linear infinite;
        }
        .beige-marquee:hover,
        .beige-marquee:active {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .beige-marquee { animation: none; }
        }
      `}</style>

      {/* Desktop / tablet (768px and up): static row */}
      <div className="flex flex-wrap items-center justify-center gap-x-16 gap-y-4 px-[5%] py-5 max-md:hidden">
        {items.map((item) => (
          <Item key={item.text} {...item} />
        ))}
      </div>

      {/* Mobile (below 768px): marquee, pauses on hover */}
      <div className="overflow-hidden py-4 md:hidden motion-reduce:overflow-x-auto">
        <div className="beige-marquee flex w-max">
          {/* The list is rendered twice so the loop is seamless */}
          {[0, 1].map((copy) => (
            <div
              key={copy}
              className="flex shrink-0 items-center"
              aria-hidden={copy === 1}
            >
              {items.map((item) => (
                <div key={item.text} className="px-8">
                  <Item {...item} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}