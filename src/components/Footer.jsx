export default function Footer() {
  return (
    <footer className="flex flex-wrap items-center gap-x-8 gap-y-4 max-md:gap-y-2 bg-[#fffdfa] px-[5.5%] py-8 max-md:flex-col max-md:text-center max-[1025px]:px-[20px]">
      {/* Logo */}
      <div className="max-md:text-center">
        <div className="font-serif text-[30px] font-light leading-none tracking-[-1px] text-mocha">
          Beige
        </div>
        <span className="mt-2 block text-[9px] tracking-[2px] text-mocha">
          YOUR DAILY RITUALS
        </span>
      </div>

      {/* Tagline */}
      <p className="text-[11px] text-muted">
        Skin. Body. Hair. Your everyday care.
      </p>

      {/* Copyright */}
      <span className="text-[11px] text-muted">
        © {new Date().getFullYear()} Beige · Store preview
      </span>

      {/* Payments - pushed to the far right on desktop */}
      <span className="text-[11px] text-muted md:ml-auto">
        Payments powered by{" "}
        <b className="text-[14px] font-bold italic tracking-tight text-ink">
          Razorpay
        </b>
      </span>
    </footer>
  );
}