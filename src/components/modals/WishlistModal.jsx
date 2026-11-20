import { useEffect, useState } from "react";
import { money } from "../../data/products.js";
import {
  Heart,
  X,
  GripHorizontal,
  ShoppingBag,
  Trash2,
  Package,
  Truck, // added
  ArrowLeft, // added
} from "lucide-react";
import { Wishlist, pastOrders, getDeliveryByOrderId } from "../../redux/slices/commonSlice.jsx"; // getDeliveryByOrderId added
import { useDispatch, useSelector } from "react-redux";
import { selectAuthUser, selectIsLogin } from "../../redux/slices/authSlices.jsx";
import { resetAuth } from "../../redux/slices/authSlices.jsx";
import { useAppContext } from "../../context/AppContext.jsx";

// ===== added: helpers for shipping details =====
const deliveryStatusStyle = {
  Ordered: "bg-gray-100 text-gray-700",
  Confirmed: "bg-blue-100 text-blue-700",
  Processing: "bg-indigo-100 text-indigo-700",
  Shipped: "bg-amber-100 text-amber-700",
  "Out for Delivery": "bg-orange-100 text-orange-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleString("en-IN");
};
// ===============================================


export default function WishlistModal({ initialTab = "wishlistModal" }) {
  const { user, wishlist, products, addDefaultVariant: onAdd, open, toggleWishlist: onToggleWish, close: onClose, handleLogout: onLogout, handleUpdateProfile: onUpdateProfile } = useAppContext();
  const onView = (id) => open("product", id);
  //orders = [],
  const [activeTab, setActiveTab] = useState(initialTab);
  const [fullName, setFullName] = useState(user?.name || "");
  const [mobile, setMobile] = useState(user?.mobile || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const dispatch = useDispatch();
  const [items, setitems] = useState([]);
  const [orders, setorders] = useState([])

  // ===== added: shipping details state =====
  const [showDelivery, setShowDelivery] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [deliveryError, setDeliveryError] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState("");
  // =========================================

  const userData = useSelector(selectAuthUser);
  const isLogin = useSelector(selectIsLogin);

  const userId = userData?._id || userData?.id;


  useEffect(() => {

    if (!userId || !isLogin) {
      setorders([]);
      return;
    }
    PastOrders();

  }, [userId, isLogin, dispatch,]);

  const PastOrders = async () => {
    try {
      const payload = {
        userid: userId,
      };

      const res = await dispatch(pastOrders(payload)).unwrap();

      const OrdersDetails = res?.orderList || res?.data?.orderList || [];

      setorders(OrdersDetails);

    } catch (error) {
      console.log("Past Orders Error:", error);
      setorders([]); // fixed: was setOrders (undefined)
    }
  };

  // ===== added: open shipping details for one order =====
  const handleViewDetails = async (orderId) => {
    try {
      setSelectedOrderId(orderId);
      setDeliveryInfo(null);
      setDeliveryError("");
      setDeliveryLoading(true);
      setShowDelivery(true);

      const res = await dispatch(getDeliveryByOrderId(orderId)).unwrap();

      setDeliveryInfo(res?.data || null);
    } catch (err) {
      setDeliveryError(err?.message || "Shipping details are not available yet.");
    } finally {
      setDeliveryLoading(false);
    }
  };
  // ======================================================

  const handleDelete = async (product) => {
    try {

      const payload = {
        type: "delete",
        userId: userId,
        email: userData?.email,
        productId: product.id
      };

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
    setShowDelivery(false); // added: leave shipping details when switching tabs
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
            Hello, {userData?.name
              ? userData.name.split(" ")[0]
              : "Not Found"}
          </p>

          <p className="mt-1 break-all text-xs text-[#8B7967]">
            {userData?.email || "Not Found"}
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

            {userData?.username || userData?.email ? (

              <div className="border border-[#E7DCCF] bg-white p-5">

                {/* Profile Icon */}
                <div className="mb-5 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F2EAE0] text-xl font-medium uppercase text-[#72543D]">
                    {(userData?.name || "U").charAt(0)}
                  </div>

                  <div>
                    <h4 className="text-base font-medium text-[#3F352D]">
                      {`${userData?.name || ""} ${userData?.lastname || ""}`.trim()}
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
                      {`${userData?.name || ""} ${userData?.lastname || ""}`.trim() || "Not available"}
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

            ) : (

              <div className="border border-[#E7DCCF] bg-white px-5 py-10 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F2EAE0] text-xl text-[#72543D]">
                  <span>U</span>
                </div>

                <h4 className="mt-4 text-base font-medium text-[#3F352D]">
                  Profile Not Available
                </h4>

                <p className="mt-2 text-sm text-[#8B7967]">
                  Your profile details are not available. Please complete your profile.
                </p>

              </div>

            )}

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



        {/* ===== added: SHIPPING DETAILS VIEW ===== */}
        {activeTab === "pastOrderModal" && showDelivery && (
          <div>
            <button
              type="button"
              onClick={() => setShowDelivery(false)}
              className="mb-5 flex items-center gap-2 text-xs text-[#72543D] hover:underline"
            >
              <ArrowLeft size={15} />
              Back to orders
            </button>

            <h3 className="mb-1 text-[17px] font-medium">Shipping details</h3>
            <p className="mb-5 break-all text-xs text-[#8B7967]">
              Order ID: {selectedOrderId}
            </p>

            {deliveryLoading ? (
              <div className="py-12 text-center text-sm text-[#8B7967]">
                Loading shipping details...
              </div>
            ) : deliveryError || !deliveryInfo ? (
              <div className="border border-[#E7DCCF] bg-white px-5 py-10 text-center">
                <Truck size={30} strokeWidth={1.4} className="mx-auto mb-3 text-[#72543D]" />
                <p className="text-sm text-[#51463C]">
                  {deliveryError || "Shipping details are not available yet."}
                </p>
              </div>
            ) : (
              <div className="border border-[#E7DCCF] bg-white p-5">
                <div className="grid grid-cols-1 gap-5 border-b border-[#E7DCCF] pb-5 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-[#9A8775]">Delivery Status</p>
                    <span
                      className={`mt-2 inline-block px-3 py-1 text-xs ${deliveryStatusStyle[deliveryInfo.deliveryStatus] || "bg-gray-100 text-gray-700"
                        }`}
                    >
                      {deliveryInfo.deliveryStatus}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs text-[#9A8775]">Tracking Number</p>
                    <p className="mt-1 break-all text-sm">{deliveryInfo.trackingNumber || "-"}</p>
                  </div>

                  <div>
                    <p className="text-xs text-[#9A8775]">Courier</p>
                    <p className="mt-1 text-sm">{deliveryInfo.courierName || "-"}</p>
                  </div>

                  <div>
                    <p className="text-xs text-[#9A8775]">Shipped Date</p>
                    <p className="mt-1 text-sm">{formatDateTime(deliveryInfo.shippedDate)}</p>
                  </div>

                  <div>
                    <p className="text-xs text-[#9A8775]">Expected Delivery</p>
                    <p className="mt-1 text-sm">{formatDate(deliveryInfo.estimatedDeliveryDate)}</p>
                  </div>

                  {deliveryInfo.deliveryRemarks && (
                    <div>
                      <p className="text-xs text-[#9A8775]">Remarks</p>
                      <p className="mt-1 text-sm">{deliveryInfo.deliveryRemarks}</p>
                    </div>
                  )}
                </div>

                <h4 className="mb-5 mt-6 text-sm font-semibold">Delivery History</h4>

                <div className="ml-2 border-l border-[#E7DCCF] pl-6">
                  {[...(deliveryInfo.statusHistory || [])].reverse().map((history, index) => (
                    <div key={history._id || index} className="relative mb-6">
                      <div className="absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 border-[#72543D] bg-white" />

                      <h5 className="text-sm font-semibold">{history.deliveryStatus}</h5>
                      <p className="mt-1 text-sm text-[#8B7967]">{history.message}</p>
                      <p className="mt-1 text-xs text-[#9A8775]">{formatDateTime(history.updatedAt)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {/* ===== end shipping details view ===== */}





        {/* PAST ORDERS TAB */}
        {activeTab === "pastOrderModal" && !showDelivery && (
          <>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-[17px] max-[550px]:text-[15px]">
                  Your past orders
                </h3>
                <p className="mt-1 text-xs text-[#8B7967]">
                  {orders.length} orders placed
                </p>
              </div>
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
                  className="mt-7 bg-[#72543D] px-7 py-4 text-xs text-white"
                >
                  Explore products
                </button>
              </div>
            ) : (
              <div className="mt-5 space-y-5">
                {orders.map((order) => (
                  <div
                    key={order._id || order.orderId}
                    className="overflow-hidden border border-[#E7DCCF] bg-white"
                  >
                    {/* Order Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E7DCCF] bg-[#F8F3ED] p-4">
                      <div>
                        <p className="text-xs text-[#8B7967]">
                          Order ID
                        </p>
                        <p className="mt-1 text-sm font-semibold">
                          {order.orderId}
                        </p>
                      </div>

                      {/* changed: status badge + View details button */}
                      <div className="flex items-center gap-2">
                        <span className="bg-[#E9DFD3] px-3 py-1.5 text-xs text-[#72543D]">
                          {order.deliveryStatus || order.productStatus}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleViewDetails(order.orderId)}
                          className="flex items-center gap-1.5 border border-[#72543D] px-3 py-1.5 text-xs text-[#72543D] transition hover:bg-[#72543D] hover:text-white"
                        >
                          <Truck size={14} strokeWidth={1.6} />
                          View details
                        </button>
                      </div>
                    </div>

                    {/* Order Information */}
                    <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3">
                      <div>
                        <p className="text-xs text-[#9A8775]">
                          Order Date
                        </p>
                        <p className="mt-1 text-sm">
                          {order.orderdate
                            ? new Date(order.orderdate).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric"
                            })
                            : "N/A"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-[#9A8775]">
                          Invoice ID
                        </p>
                        <p className="mt-1 break-all text-sm">
                          {order.invoiceId || "N/A"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-[#9A8775]">
                          Total Amount
                        </p>
                        <p className="mt-1 text-sm font-semibold text-[#72543D]">
                          {money(order.amount || 0)}
                        </p>
                      </div>
                    </div>

                    {/* Products */}
                    <div className="border-t border-[#E7DCCF] p-4">
                      <h4 className="mb-4 text-sm font-semibold">
                        Ordered Products
                      </h4>

                      <div className="space-y-4">
                        {(order.product || []).map((product, index) => {
                          const image = product.productimages?.[0];

                          const imageUrl =
                            typeof image === "string"
                              ? image
                              : image?.media || "";

                          return (
                            <div
                              key={product._id || index}
                              className="flex gap-4 border-b border-[#EEE6DC] pb-4 last:border-0 last:pb-0"
                            >
                              <img
                                src={imageUrl || "https://placehold.co/100x100"}
                                alt={product.productname}
                                className="h-20 w-20 rounded-sm bg-[#F8F3ED] object-cover"
                              />

                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-[#3F352D]">
                                  {product.productname}
                                </p>

                                {(product.productdetails || []).map(
                                  (detail, detailIndex) => (
                                    <div key={detail._id || detailIndex}>
                                      <p className="mt-1 text-xs text-[#8B7967]">
                                        Quantity: {detail.quantity}
                                      </p>

                                      {detail.size && (
                                        <p className="mt-1 text-xs text-[#8B7967]">
                                          Size: {detail.size}
                                        </p>
                                      )}

                                      {detail.shade && (
                                        <p className="mt-1 text-xs text-[#8B7967]">
                                          Shade: {detail.shade}
                                        </p>
                                      )}

                                      <p className="mt-2 text-sm font-semibold text-[#72543D]">
                                        {money(detail.price || 0)}
                                      </p>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="border-t border-[#E7DCCF] bg-[#FDFBF8] p-4">
                      <h4 className="mb-2 text-sm font-semibold">
                        Delivery Address
                      </h4>

                      <p className="text-sm text-[#51463C]">
                        {order.delivery_Address?.name || "N/A"}
                      </p>

                      <p className="mt-1 break-all text-xs text-[#8B7967]">
                        {order.delivery_Address?.email || ""}
                      </p>

                      <p className="mt-1 text-xs text-[#8B7967]">
                        {order.delivery_Address?.mobile || ""}
                      </p>

                      <p className="mt-1 text-xs text-[#8B7967]">
                        {order.delivery_Address?.address || ""}
                      </p>
                    </div>
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