
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=800&q=85";

export default function Hero() {
  return (
    <section className="flex gap-[7%] bg-[#f0e5d3] px-[7%] max-[1025px]:px-[0px] max-md:flex-col-reverse max-md:gap-0">
      {/* Hero Copy */}
      <div className="max-[1025px]:pl-[20px] flex min-w-0 flex-[0.85] max-md:px-4 max-md:py-10 flex-col items-start justify-center max-md:w-full max-md:flex-none">
        <p className="text-[10px] font-bold tracking-[0.2em] text-[#a17c6d]">
          SKIN. BODY. HAIR.
        </p>

        <h1 className="my-4 font-serif text-[clamp(48px,6vw,76px)] leading-[0.98] tracking-[-2.8px] text-ink max-[991px]:my-4 max-[991px]:text-[38px] max-[768px]:text-[32px] max-[500px]:text-[28px] max-[991px]:leading-[1.08] max-[991px]:tracking-[-1px]">
          Care for you.
          <br />
          <em className="font-normal text-mocha">Every day.</em>
        </h1>

        <p className="font-sans text-[17px] leading-[1.5] text-[#746960] max-[991px]:text-[15px] max-[991px]:leading-[1.6]">
          Thoughtful essentials for skin, body and hair.
          <br className="max-[991px]:hidden" />{" "}
          Find your everyday ritual with Beige.
        </p>

        <button
          onClick={() =>
            document.getElementById("shop")?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            })
          }
          className="mt-[18px] max-md:px-[15px] max-md:py-[13px] bg-mocha px-6 py-4 text-[11px] tracking-[0.08em] text-white transition-colors hover:bg-[#987567]"
        >
          Explore the collection
        </button>

        <div className="mt-[35px] max-md:mt-[20px] flex items-center gap-[10px] font-serif text-xs italic text-[#87796f]">
          <span className="h-px w-8 bg-[#b68c7d]" />
          Your care, beautifully simple.
        </div>
      </div>

      {/* Hero Image */}
      <div className="relative min-h-[480px] min-w-0 flex-[1.15] overflow-hidden bg-gradient-to-br from-[#e7d8c7] via-[#c8b09b] to-[#eee5db] max-md:min-h-[350px] max-md:w-full max-md:flex-none max-sm:min-h-[260px]">
        <img
          src={HERO_IMAGE}
          alt="Skincare products in a warm beige studio still life"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <span className="absolute right-5 bottom-[18px] text-[9px] tracking-[0.18em] text-white [text-shadow:0_1px_5px_#665]">
          THE BEIGE CARE COLLECTION
        </span>
      </div>
    </section>
  );
}
