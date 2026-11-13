
import { useEffect, useState } from "react";
import { money } from "../../data/products.js";
import {
  Heart,
  X,
  GripHorizontal,
  ShoppingBag,
  Trash2,
  Package,
} from "lucide-react";
import { Wishlist } from "../../redux/slices/commonSlice.jsx";
import { useDispatch, useSelector } from "react-redux";
import { selectAuthUser, selectIsLogin } from "../../redux/slices/authSlices.jsx";
import { resetAuth } from "../../redux/slices/authSlices.jsx";


export default function WishlistModal({
  initialTab = "wishlistModal",
  user,
  orders = [],
  wishlist,
  products = [],
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
  const dispatch = useDispatch();
  const [items, setitems] = useState([]);

  const userData = useSelector(selectAuthUser);
  const isLogin = useSelector(selectIsLogin);

  const userId = userData?._id || userData?.id;



  const handleDelete = async (product) => {
    try {
      console.log("product-------------", product);

      const payload = {
        type: "delete",
        userId: userId,
        email: userData?.email,
        productId: product.id
      };

      console.log("payload---------", payload);

      const res = await dispatch(Wishlist(payload)).unwrap();

      if (res?.status === true || res?.success === true) {
        setitems((items) =>
          items.filter((item) => String(item.id) !== String(product.id))
        );

        onToggleWish?.(product.id);
      }

    } catch (error) {
      console.log("error", error);
    }
  };


  const handleLogout = () => {
    dispatch(resetAuth());
    navigate("/login");
  };

  useEffect(() => {
    const GetWishList = async () => {
      try {
        const payload = {
          type: "get",
          userId: userId,
          email: userData?.email,
        };

        const res = await dispatch(Wishlist(payload)).unwrap();

        const wishlistRecords = res?.data || [];

        const wishlistProducts = products.filter((product) =>
          wishlistRecords.some(
            (item) => String(item.productId) === String(product.id)
          )
        );

        console.log("Wishlist Products:", wishlistProducts);

        setitems(wishlistProducts);
      } catch (error) {
        console.log("error", error);
      }
    };

    if (!userId || !isLogin) {
      setitems([]);
      return;
    }

    GetWishList();
  }, [userId, isLogin, dispatch, products]);

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
          <h2 className="font-serif text-2xl tracking-tight max-[550px]:text-[20px] max-[450px]:text-[18px]">
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
          className="max-[550px]:hidden mt-1 flex cursor-grab touch-none justify-center text-mocha/60 active:cursor-grabbing"
        >
          <GripHorizontal size={20} strokeWidth={1.3} />
        </div>

        {/* User details */}
        <div className="mt-3 max-[550px]:mt-2 border-t border-[#DFD2C2] pt-5 max-[550px]:pt-3">
          <p className="text-sm font-semibold">
            Hello, {user?.name?.split(" ")[0] || "there"}
          </p>

          <p className="mt-1 break-all text-xs text-[#8B7967]">
            {email}
          </p>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex border-b border-[#DFD2C2] max-[550px]:mt-5 max-[450px]:mt-4">
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
          <div className="py-4">

            <div className="mb-6">
              <h3 className="font-serif text-xl text-[#3F352D]">
                My Profile
              </h3>
              <p className="mt-1 text-sm text-[#8B7967]">
                Your Beige account details
              </p>
            </div>

            <div className="border border-[#E7DCCF] bg-white p-5">

              {/* Profile Icon */}
              <div className="mb-5 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F2EAE0] text-xl font-medium uppercase text-[#72543D]">
                  {(userData?.name || "U").charAt(0)}
                </div>

                <div>
                  <h4 className="text-base font-medium text-[#3F352D]">
                    {userData?.name || "User"}
                  </h4>
                  <p className="mt-1 text-xs text-[#8B7967]">
                    Beige Member
                  </p>
                </div>
              </div>

              <div className="space-y-4 border-t border-[#E7DCCF] pt-5">

                <div>
                  <p className="text-xs uppercase tracking-wider text-[#9A8775]">
                    Full Name
                  </p>
                  <p className="mt-1 text-sm text-[#3F352D]">
                    {userData?.name || "Not available"}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-[#9A8775]">
                    Email Address
                  </p>
                  <p className="mt-1 break-all text-sm text-[#3F352D]">
                    {userData?.email || "Not available"}
                  </p>
                </div>

              </div>
            </div>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="mt-6 flex w-full items-center justify-center gap-2 border border-[#72543D] py-4 text-xs tracking-widest text-[#72543D] transition hover:bg-[#72543D] hover:text-white"
            >
              LOGOUT
            </button>

          </div>
        )}










        {/* PAST ORDERS TAB */}
        {activeTab === "pastOrderModal" && (
          <>
            <div className="flex items-center justify-between">
              <h3 className="text-[17px] max-[550px]:text-[15px] max-[450px]:text-[14px]">
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

                <p className="text-[17px] font-semibold max-[550px]:text-[15px] max-[450px]:text-[14px]">
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
          <div className="pb-4">

            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium tracking-wide">
                  Your saved favourites
                </h3>
                <p className="mt-1 text-xs text-[#9A8775]">
                  {items.length} {items.length === 1 ? "item" : "items"} saved for later
                </p>
              </div>

              <Heart size={22} strokeWidth={1.4} className="text-[#72543D]" />
            </div>

            {items.length === 0 ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center bg-[#F8F3ED] px-5 text-center">

                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white">
                  <Heart size={27} strokeWidth={1.4} className="text-[#72543D]" />
                </div>

                <h3 className="text-lg font-medium">
                  Your wishlist is waiting
                </h3>

                <p className="mt-2 max-w-xs text-sm leading-6 text-[#8B7967]">
                  Save your favourite beauty products and keep everything you love in one place.
                </p>

                <button
                  type="button"
                  onClick={onClose}
                  className="mt-7 bg-[#72543D] px-9 py-3.5 text-xs tracking-widest text-white transition hover:bg-[#5D4330]"
                >
                  EXPLORE PRODUCTS
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                {items.map((product) => {
                  const prices = (product.variants || [])
                    .map((v) => Number(v.price))
                    .filter((price) => Number.isFinite(price) && price > 0);

                  const startingPrice = prices.length
                    ? Math.min(...prices)
                    : Number(product.price || 0);

                  return (
                    <div
                      key={product.id}
                      className="group overflow-hidden border border-[#E8DED2] bg-white transition duration-300 hover:border-[#C7B29D] hover:shadow-md"
                    >

                      {/* Product Image */}
                      <div className="relative h-[230px] overflow-hidden bg-[#F5EFE8] sm:h-[250px]">

                        <button
                          type="button"
                          onClick={() => onView?.(product.id)}
                          className="h-full w-full"
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        </button>

                        {/* Remove Wishlist */}
                        <button
                          type="button"
                          //  onClick={() => onToggleWish?.(product.id)}
                          onClick={() => handleDelete(product)}
                          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-[#72543D] shadow-sm transition hover:bg-[#72543D] hover:text-white"
                          aria-label={`Remove ${product.name} from wishlist`}
                        >
                          <Trash2 size={16} strokeWidth={1.6} />
                        </button>

                      </div>

                      {/* Product Details */}
                      <div className="p-5">

                        <p className="text-[10px] uppercase tracking-[2px] text-[#9A8775]">
                          {product.category}
                        </p>

                        <button
                          type="button"
                          onClick={() => onView?.(product.id)}
                          className="mt-2 block w-full text-left font-serif text-base leading-6 text-[#3F352D] transition hover:text-[#9A7655]"
                        >
                          {product.name}
                        </button>

                        <div className="mt-3 flex items-center justify-between border-t border-[#EEE6DC] pt-3">
                          <span className="text-xs text-[#8B7967]">
                            Starting from
                          </span>

                          <span className="text-base font-medium text-[#72543D]">
                            {money(startingPrice)}
                          </span>
                        </div>

                        {/* Add to Bag */}
                        <button
                          type="button"
                          onClick={() => onAdd?.(product.id)}
                          className="mt-5 flex w-full items-center justify-center gap-2 bg-[#72543D] py-3.5 text-xs tracking-widest text-white transition hover:bg-[#5D4330]"
                        >
                          <ShoppingBag size={15} strokeWidth={1.5} />
                          ADD TO BAG
                        </button>

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
                className="mt-7 w-full border border-[#72543D] py-4 text-xs tracking-widest text-[#72543D] transition hover:bg-[#72543D] hover:text-white"
              >
                CONTINUE SHOPPING
              </button>
            )}

          </div>
        )}






      </div>
    </div>
  );
}
