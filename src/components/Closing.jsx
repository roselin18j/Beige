
export default function Closing() {

  return (
    <section className="flex flex-col items-center justify-center bg-[#f0e5d3] px-5 py-20 text-center sm:py-10 md:py-15 max-[991px]:py-10">

      <span className="text-[10px] font-medium tracking-[0.2em] text-[#a17c6d]">
        A MOMENT FOR YOURSELF
      </span>

      <h2 className="mt-3 font-serif text-[clamp(32px,5vw,46px)] font-normal leading-tight tracking-[-1px] text-ink">
        The everyday ritual.
      </h2>

      <p className="mt-3 font-serif text-sm leading-relaxed text-[#746960] sm:text-base">
        Skin care, body care and hair care. A little care, every day.
      </p>

      <button
        onClick={() =>
          document.getElementById("shop")?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          })
        }
        className="mt-2 border-b border-[#a17c6d] pb-2 text-xs text-ink transition-colors hover:text-[#a17c6d]"
      >
        Discover the care collection →
      </button>

    </section>
  );

}
