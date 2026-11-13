import { useEffect, useState } from "react";
import { UserRound, Heart, ShoppingBag, Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { selectAuthUser, selectIsLogin } from "../redux/slices/authSlices.jsx";
import { Wishlist } from "../redux/slices/commonSlice.jsx";
import { useDispatch, useSelector } from "react-redux";

const headerNav = {
  SkinCare: "Skin care",
  BodyCare: "Body care",
  HairCare: "Hair care",
  Makeup: "Makeup",
  Nails: "Nails",
  Perfume: "Perfume",
};

function Logo({ className = "" }) {
  return (
    <Link
      to="/"
      className={`whitespace-nowrap font-serif font-light leading-none tracking-[1px] text-mocha ${className}`}
    >
      Beige
      <span className="mt-[9px] ml-1 block text-center font-sans text-[10px] max-[991px]:text-[8px] tracking-[2px]">
        YOUR DAILY RITUALS
      </span>
    </Link>
  );
}

export default function Header({ bagCount,wishCount, onCategory, onOpen }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const closeMenu = () => setMenuOpen(false);
  const dispatch = useDispatch();


  const userData = useSelector(selectAuthUser);
  const isLogin = useSelector(selectIsLogin);


  useEffect(() => {
   GetWishList()
  }, [])


   const GetWishList = async () => {
      try {
        const payload = {
          type: "get",
          userId: userData.id,
          email: userData?.email,
        };

        const res = await dispatch(Wishlist(payload)).unwrap();

      console.log('res', res.data.length)

      } catch (error) {
        console.log("error", error);
      }
    }
  const goToShop = () => {
    closeMenu();
    // wait for the drawer to start closing so the scroll feels smooth
    setTimeout(() => {
      document.getElementById("shop")?.scrollIntoView({
        behavior: "smooth", 
        block: "start",
      });
    }, 150);
  };

  const openModal = (name) => {
    closeMenu();
    onOpen(name);
  };

  // lock page scroll while the drawer is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // close with Escape, and when the screen grows to desktop size
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    const onResize = () => window.innerWidth >= 1024 && setMenuOpen(false);

    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <>
      {/* Announcement bar */}
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 bg-mocha px-3 py-3 text-center text-[12px] tracking-[0.08em] text-white sm:text-[13px]">
        A little beauty, delivered.
        <span className="text-[#e7d9ca]">
          Complimentary shipping on orders ₹1,499+
        </span>
      </div>

      {/* Main header */}
      <header className="flex items-center justify-between gap-4 border-b border-line bg-white px-4 py-4 max-md:px-[4] max-sm:px-[5px] max-md:gap-2 sm:py-5">
        <Logo className="text-[25px] max-lg:mr-auto sm:text-[34px]" />

        {/* Desktop nav */}
        <nav className="hidden items-center gap-[20px] lg:flex">
          {Object.entries(headerNav).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={goToShop}
              className="text-[13px] font-thin text-[#322a23] transition-colors hover:text-rose"
            >
              {label}
            </button>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3 sm:gap-[18px]">
          <button
            type="button"
            onClick={() => onOpen("accountModal")}
            aria-label="Login / Register"
            className="flex items-center gap-2 text-sm text-ink"
          >
            <UserRound size={20} strokeWidth={1.5} />
          </button>


          <span className="hidden sm:inline max-md:hidden" onClick={() => navigate("/login")} >Login / Register</span>


          <button
            type="button"
            aria-label="Wishlist"
            onClick={() => onOpen("wishlistModal")}
            className="flex items-center gap-[7px] text-xs text-ink"
          >
            <Heart size={21} strokeWidth={1.5} />
            {wishCount > 0 && <span>{wishCount}</span>}
          </button>

          <button
            type="button"
            aria-label="Open bag"
            onClick={() => onOpen("cart")}
            className="flex items-center gap-[7px] text-xs text-ink"
          >
            <ShoppingBag size={19} strokeWidth={1.5} />
            <span>
              <span className="hidden sm:inline">Bag </span>(<b>{bagCount}</b>)
            </span>
          </button>
        </div>

        {/* Burger (mobile / tablet) - right side */}
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          aria-expanded={menuOpen}
          className="-mr-2 rounded-full p-2 text-ink transition hover:bg-cream lg:hidden"
        >
          <Menu size={24} strokeWidth={1.5} />
        </button>
      </header>

      {/* Info strip */}
      <div className="flex flex-wrap items-center justify-center gap-x-[30px] gap-y-2 border-b border-[#ded4c5] bg-[#f0e5d3] px-[5%] py-[13px] text-[13px] max-[991px]:gap-3 max-[500px]:gap-4">
        <span className="text-[#7d6d58] max-[500px]:hidden">Get to know your everyday care</span>

        <button
          type="button"
          onClick={() => onOpen("skinTest")}
          className="text-sm font-medium text-ink underline underline-offset-[5px]"
        >
          Skin &amp; hair test
        </button>

        <button
          type="button"
          onClick={() => onOpen("tryOn")}
          className="text-sm font-medium text-ink underline underline-offset-[5px]"
        >
          AI makeup try-on
        </button>
      </div>

      {/* =============================
          SIDE DRAWER (below lg)
      ============================= */}
      <div
        className={`fixed inset-0 z-[60] lg:hidden ${menuOpen ? "visible" : "invisible delay-300"
          }`}
        aria-hidden={!menuOpen}
      >
        {/* Overlay */}
        <div
          onClick={closeMenu}
          className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ease-out ${menuOpen ? "opacity-100" : "opacity-0"
            }`}
        />

        {/* Panel */}
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className={`absolute inset-y-0 right-0 flex w-[85%] max-w-[320px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${menuOpen ? "translate-x-0" : "translate-x-full"
            }`}
        >
          {/* Drawer header */}
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <Logo className="text-[26px]" />

            <button
              type="button"
              onClick={closeMenu}
              aria-label="Close menu"
              className="rounded-full p-2 text-ink transition hover:bg-cream"
            >
              <X size={22} strokeWidth={1.5} />
            </button>
          </div>

          {/* Drawer links */}
          <nav className="flex-1 overflow-y-auto px-5 py-2">
            {Object.entries(headerNav).map(([key, label], i) => (
              <button
                key={key}
                type="button"
                onClick={goToShop}
                style={{ transitionDelay: menuOpen ? `${80 + i * 40}ms` : "0ms" }}
                className={`block w-full border-b border-line py-4 text-left text-[15px] text-ink transition-all duration-300 hover:text-rose ${menuOpen
                  ? "translate-x-0 opacity-100"
                  : "translate-x-3 opacity-0"
                  }`}
              >
                {label}
              </button>
            ))}

            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={() => openModal("skinTest")}
                className="block w-full rounded-md bg-[#f0e5d3] px-4 py-3 text-left text-sm font-medium text-ink"
              >
                Skin &amp; hair test
              </button>

              <button
                type="button"
                onClick={() => openModal("tryOn")}
                className="block w-full rounded-md bg-[#f0e5d3] px-4 py-3 text-left text-sm font-medium text-ink"
              >
                AI makeup try-on
              </button>
            </div>
          </nav>

          {/* Drawer footer */}
          <div className="border-t border-line px-5 py-4">
            <button
              type="button"
              onClick={() => openModal("accountModal")}
              className="flex w-full items-center justify-center gap-2 bg-mocha py-3 text-xs font-medium tracking-wide text-white"
            >
              <UserRound size={16} strokeWidth={1.5} />
              Login / Register
            </button>
          </div>
        </aside>
      </div>
    </>
  );
}