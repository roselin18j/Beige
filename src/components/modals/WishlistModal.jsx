
import { useState } from "react";
import { products, money } from "../../data/products.js";
import {
  Heart,
  X,
  GripHorizontal,
  ShoppingBag,
  Trash2,
  Package,
} from "lucide-react";

export default function WishlistModal({
  initialTab = "wishlistModal",
  user,
  orders = [],
  wishlist,
  onAdd,
  onView,
  onToggleWish,
  onClose,
  onLogout,
  onUpdateProfile,
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [fullName, setFullName] = useState(user?.name || "");
  const [mobile, setMobile] = useState(user?.mobile || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const items = wishlist
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean);

  const email = user?.email || "";

  // Profile form
  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    try {
      setLoading(true);

      await onUpdateProfile?.({
        name: fullName.trim(),
        mobile,
      });

      setSuccess("Your profile has been updated.");
    } catch {
      setError("Unable to update your profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError("");
    setSuccess("");
  };

  const handleRefreshOrders = async () => {
    try {
      // Replace with your actual API endpoint
      const response = await axios.get("/api/orders", {
        withCredentials: true,
      });

      setOrders(response.data);
    } catch (error) {
      console.error("Failed to refresh orders:", error);
    }
  };

  return (
    <div className="flex max-h-[90vh] flex-col bg-[#FFFDF9] text-[#3F352D]">

      {/* Header */}
      <div className="shrink-0 px-6 pt-5 max-[991px]:px-3">

        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl tracking-tight sm:text-3xl">
            My Beige account
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 transition hover:bg-[#F2EAE0] cursor"
            aria-label="Close account"
          >
            <X size={21} strokeWidth={1.5} />
          </button>
        </div>

        {/* Drag handle */}
        <div
          data-drag-handle
          className="mt-1 flex cursor-grab touch-none justify-center text-mocha/60 active:cursor-grabbing"
        >
          <GripHorizontal size={20} strokeWidth={1.3} />
        </div>

        {/* User details */}
        <div className="mt-3 border-t border-[#DFD2C2] pt-5">
          <p className="text-sm font-semibold">
            Hello, {user?.name?.split(" ")[0] || "there"}
          </p>

          <p className="mt-1 break-all text-xs text-[#8B7967]">
            {email}
          </p>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex border-b border-[#DFD2C2]">
          {[
            { id: "accountModal", label: "Profile" },
            { id: "pastOrderModal", label: "Past orders" },
            { id: "wishlistModal", label: "Wishlist" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`relative flex-1 px-3 py-3 text-xs transition sm:px-4 sm:text-sm ${activeTab === tab.id
                  ? "font-medium text-[#72543D]"
                  : "text-[#51463C] hover:text-[#72543D]"
                }`}
            >
              {tab.label}

              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 h-[2px] w-full bg-[#72543D]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-8 pt-5 max-[991px]:px-3">

        {/* PROFILE TAB */}
        {activeTab === "accountModal" && (
          <form onSubmit={handleProfileSubmit} className="space-y-5">

            <div>
              <h3 className="text-[17px] font-medium">
                Complete your registration
              </h3>

              <p className="mt-1 text-xs text-[#8B7967]">
                Add your details to complete your Beige account.
              </p>
            </div>

            {/* Full name */}
            <div>
              <label
                htmlFor="account-fullname"
                className="mb-2 block text-sm"
              >
                Full name
              </label>

              <input
                id="account-fullname"
                type="text"
                autoComplete="name"
                maxLength={100}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Enter your full name"
                className="w-full border border-[#DCCDBB] bg-white px-3 py-3 text-sm outline-none transition focus:border-[#72543D]"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="account-email"
                className="mb-2 block text-sm"
              >
                Email
              </label>

              <input
                id="account-email"
                type="email"
                value={email}
                readOnly
                className="w-full cursor-not-allowed border border-[#DCCDBB] bg-[#EEE6D9] px-3 py-3 text-sm text-[#8B7967] outline-none"
              />

              <p className="mt-1 text-xs text-[#8B7967]">
                Your email is managed by your sign-in account.
              </p>
            </div>

            {/* Mobile */}
            <div>
              <label
                htmlFor="account-mobile"
                className="mb-2 block text-sm"
              >
                Mobile number
              </label>

              <input
                id="account-mobile"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                maxLength={10}
                value={mobile}
                onChange={(e) =>
                  setMobile(
                    e.target.value.replace(/\D/g, "").slice(0, 10)
                  )
                }
                required
                placeholder="Enter your mobile number"
                className="w-full border border-[#DCCDBB] bg-white px-3 py-3 text-sm outline-none transition focus:border-[#72543D]"
              />
            </div>

            {/* Feedback */}
            {error && (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}

            {success && (
              <p role="status" className="text-sm text-green-700">
                {success}
              </p>
            )}

            {/* Save */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#72543D] py-4 text-xs text-white transition hover:bg-[#5D4330] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Saving..." : "Create Beige account"}
            </button>

            {/* Logout */}
            <button
              type="button"
              onClick={onLogout}
              className="text-sm underline underline-offset-4 transition hover:text-[#72543D]"
            >
              Logout
            </button>
          </form>
        )}

        {/* PAST ORDERS TAB */}
        {activeTab === "pastOrderModal" && (
          <>
            <div className="flex items-center justify-between">
              <h3 className="text-[17px]">
                Your past orders
              </h3>

              <button
                type="button"
                onClick={handleRefreshOrders}
                className="text-xs underline underline-offset-4"
              >
                Refresh
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="flex min-h-[280px] flex-col items-center justify-center text-center">

                <ShoppingBag
                  size={34}
                  strokeWidth={1.5}
                  className="mb-3 text-[#3F352D]"
                />

                <p className="text-[17px] font-semibold">
                  No orders yet
                </p>

                <p className="mt-2 max-w-sm text-sm leading-6 text-[#51463C]">
                  Your orders will appear here when you check out while signed in.
                </p>

                <button
                  type="button"
                  onClick={onClose}
                  className="mt-7 bg-[#72543D] px-7 py-4 max-[991px]:px-4 text-xs text-white transition hover:bg-[#5D4330]"
                >
                  Explore products
                </button>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-[#E7DCCF] p-4"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">
                        Order #{order.id}
                      </p>

                      <span className="text-xs text-[#8B7967]">
                        {order.status}
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-[#8B7967]">
                      {order.date}
                    </p>

                    <p className="mt-3 text-sm font-medium">
                      {money(order.total)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* WISHLIST TAB */}
        {activeTab === "wishlistModal" && (
          <>
            <h3 className="text-[17px]">
              Your saved favourites
            </h3>

            {items.length === 0 ? (
              <div className="flex min-h-[280px] flex-col items-center justify-center text-center">

                <Heart
                  size={29}
                  strokeWidth={1.8}
                  className="mb-3 text-[#3F352D]"
                />

                <p className="text-[17px] font-semibold">
                  Your wishlist is waiting
                </p>

                <p className="mt-2 text-sm leading-6 text-[#51463C]">
                  Tap the heart on a product to save it here.
                </p>

                <button
                  type="button"
                  onClick={onClose}
                  className="mt-5 bg-[#72543D] px-7 py-4 text-xs font-semibold text-white transition hover:bg-[#5D4330]"
                >
                  Explore products
                </button>
              </div>
            ) : (
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {items.map((product) => {
                  const startingPrice = Math.min(
                    ...product.variants.map((v) => v.price)
                  );

                  return (
                    <div
                      key={product.id}
                      className="flex gap-3 border border-[#E7DCCF] p-3"
                    >
                      {/* Product image */}
                      <button
                        type="button"
                        onClick={() => onView?.(product.id)}
                        className="h-24 w-20 shrink-0 overflow-hidden bg-[#F3EAE0]"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover transition duration-300 hover:scale-105"
                        />
                      </button>

                      {/* Product details */}
                      <div className="flex min-w-0 flex-1 flex-col">
                        <p className="text-[10px] uppercase tracking-wider text-[#8B7967]">
                          {product.category}
                        </p>

                        <button
                          type="button"
                          onClick={() => onView?.(product.id)}
                          className="mt-1 text-left text-sm font-medium"
                        >
                          {product.name}
                        </button>

                        <p className="mt-1 text-sm">
                          From {money(startingPrice)}
                        </p>

                        <div className="mt-auto flex items-center gap-3 pt-3">
                          <button
                            type="button"
                            onClick={() => onAdd(product.id)}
                            className="flex items-center gap-1 text-xs text-[#72543D] transition hover:text-[#5D4330]"
                          >
                            <ShoppingBag size={14} />
                            Add to bag
                          </button>

                          <button
                            type="button"
                            onClick={() => onToggleWish?.(product.id)}
                            className="text-[#8B7967] transition hover:text-red-500"
                            aria-label={`Remove ${product.name} from wishlist`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {items.length > 0 && (
              <button
                type="button"
                onClick={onClose}
                className="mt-6 w-full bg-[#72543D] py-4 text-xs text-white transition hover:bg-[#5D4330]"
              >
                Continue shopping
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
