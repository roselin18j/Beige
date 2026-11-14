import { useEffect, useMemo, useState } from "react";
import {
  GripHorizontal,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  X,
} from "lucide-react";

import { money, FREE_SHIPPING_THRESHOLD } from "../../data/products.js";
import { cartList } from "../../redux/slices/commonSlice.jsx"
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectAuthUser, selectIsLogin } from "../../redux/slices/authSlices.jsx";
import { toast } from "sonner";
import { createOrder, verifyPayment } from "../../redux/slices/commonSlice.jsx";



const loadRazorpay = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");

    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
};



export default function CartModal({
  cart,
  products = [],
  onRemove,
  onUpdateQuantity,
  onClose,
  onExplore,
  onBagCountChange,
}) {

  const [cartProducts, setCartProducts] = useState([]);
  const userData = useSelector(selectAuthUser);
  const isLogin = useSelector(selectIsLogin);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handlePay = async () => {
    try {
      if (!isLogin || !userData?.id) {
        toast.error("Please login first");
        navigate("/login");
        return;
      }

      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
        return;
      }

      if (!lines.length) {
        toast.error("Your cart is empty");
        return;
      }

      const isLoaded = await loadRazorpay();

      if (!isLoaded || !window.Razorpay) {
        toast.error("Unable to load Razorpay checkout");
        return;
      }

      const totalAmount = lines.reduce((total, item) => {
        return total + item.variant.price * item.qty;
      }, 0);

      if (totalAmount <= 0) {
        toast.error("Invalid payment amount");
        return;
      }

      const orderResponse = await dispatch(
        createOrder({
          amount: totalAmount,
          userId: userData.id
        })
      ).unwrap();


      const razorpayOrderData = orderResponse?.data || orderResponse;

      if (!razorpayOrderData?.success || !razorpayOrderData?.order?.id) {
        toast.error(
          razorpayOrderData?.message || "Unable to create payment order"
        );
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: razorpayOrderData.order.amount,
        currency: razorpayOrderData.order.currency,
        name: "NEWME",
        description: "Beauty and Skincare Products",
        order_id: razorpayOrderData.order.id,

        handler: async function (response) {
          try {

            const orderData = {
              product: lines.map(item => ({
                productid: item.product.id,
                category: item.category,
                productname: item.product.name,
                productimages: item.product.image,

                productdetails: [{
                  price: item.variant.price,
                  gstPrice: item.variant.gstPrice,
                  size: item.variant.size,
                  shade: item.variant.shade,
                  quantity: item.qty,
                  discount_price: item.variant.discount_price
                }]
              })),


              delivery_Address: {
                name: userData.name,
                mobile: userData.mobile,
                email: userData.email,
                address: userData.address
              },

              productStatus: "Ordered",
              shippingCharge: 0,
              gstPercentage: 0,
              totalDiscount: 0,
              barcode: "",
              couponDiscount: 0,
              couponDiscountAmount: 0,
              promoCode: "",
              deliveryDate: null
            };

            const payload = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              userid: userData.id,
              orderData: orderData
            };


            const verifyResponse = await dispatch(
              verifyPayment(payload)
            ).unwrap();


            const verifyData = verifyResponse?.data || verifyResponse;

            if (verifyData?.success) {
              toast.success("Payment successful!");

              await GetCart();
              onBagCountChange?.();
              onClose?.();

            } else {
              toast.error(
                verifyData?.message || "Payment verification failed"
              );
            }

          } catch (error) {
            console.log("Verification Error:", error);

            toast.error(
              error?.message || "Unable to verify payment"
            );
          }
        },

        modal: {
          ondismiss: function () {
            console.log("Razorpay checkout closed");
          }
        },

        theme: {
          color: "#8B5E3C"
        }
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function (response) {
        console.log("Payment Failed:", response.error);

        toast.error(
          response.error?.description || "Payment failed"
        );
      });

      razorpay.open();

    } catch (error) {
      console.log("Payment Error:", error);

      toast.error(
        error?.message || "Unable to process payment"
      );
    }
  };






  const lines = useMemo(() => {
    return cartProducts.map((item) => {
      const product = item.productid;

      return {
        key: item._id,
        product: {
          id: product._id,
          name: product.productname,
          image: product.productimages?.[0]?.media || "",
        },
        variant: {
          id: product._id,
          price: Number(product.final_price || product.price || 0),
          label: "",
          color: null,
        },
        qty: Number(item.quantity || 1),
      };
    });
  }, [cartProducts]);

  useEffect(() => {
    if (isLogin && userData?.id) {
      GetCart();
    }
  }, [isLogin, userData?.id]);


  const GetCart = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!isLogin || !token || !userData?.id) {
        toast.error("Please login");
        navigate("/login");
        return;
      }

      const payload = {
        userid: userData.id,
        type: "get"
      };

      const res = await dispatch(cartList(payload)).unwrap();


      setCartProducts(res?.data?.product || []);

    } catch (error) {
      console.log("error", error);
      toast.error(error?.message || "Unable to fetch cart");
    }
  };


  const handleDelete = async (item) => {
    try {
      const payload = {
        userid: userData.id,
        productid: item.productid._id,
        type: "delete"
      };

      const res = await dispatch(cartList(payload)).unwrap();

      if (res?.status === true || res?.success === true) {
        setCartProducts((prev) =>
          prev.filter((product) => product._id !== item._id)
        );

        onBagCountChange?.();

        toast.success("Product removed from cart");
      }

    } catch (error) {
      console.log("error", error);
      toast.error(error?.message || "Unable to remove product");
    }
  };



  if (lines.length === 0) {
    return (
      <div className="text-ink">
        <header className="flex items-center justify-between border-b border-line px-6 py-4 sm:px-7">
          <h2 className="font-serif text-2xl tracking-tight max-[550px]:text-[20px] max-[450px]:text-[18px]">
            Your beauty bag
          </h2>

          <div
            data-drag-handle
            className="flex max-[550px]:hidden cursor-grab touch-none justify-center rounded-full p-2 text-mocha/60 transition hover:bg-[#F2EAE0] active:cursor-grabbing"
          >
            <GripHorizontal size={23} strokeWidth={1.3} />
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 transition hover:bg-[#F2EAE0]"
            aria-label="Close cart"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </header>

        <div className="flex flex-col items-center px-6 py-12 text-center sm:px-7">
          <ShoppingBag size={32} strokeWidth={1.5} className="text-ink" />

          <h3 className="mt-4 text-sm text-ink">Your bag is waiting</h3>

          <p className="mt-3 text-sm text-ink/80">
            Find a little something you love.
          </p>

          <button
            type="button"
            onClick={onExplore ?? onClose}
            className="mt-6 bg-mocha px-6 py-3 text-xs font-medium text-white transition hover:bg-[#59412e]"
          >
            Explore products
          </button>
        </div>
      </div>
    );
  }


  const subtotal = lines.reduce(
    (sum, line) => sum + line.variant.price * line.qty,
    0
  );

  const itemCount = lines.reduce(
    (sum, line) => sum + line.qty,
    0
  );

  const remaining = Math.max(
    FREE_SHIPPING_THRESHOLD - subtotal,
    0
  );

  const progress = Math.min(
    (subtotal / FREE_SHIPPING_THRESHOLD) * 100,
    100
  );

  return (
    <div className="flex max-h-[90vh] flex-col text-ink overflow-y-auto">

      <header className="shrink-0 border-b border-line px-6 pb-4 pt-3 max-[768px]:px-3 max-[768px]:pt-4">
        <div className="mb-2 flex items-start justify-end gap-2">

          <div
            data-drag-handle
            className="flex cursor-grab touch-none justify-center rounded-full p-2 text-mocha/60 transition hover:bg-[#F2EAE0] active:cursor-grabbing"
          >
            <GripHorizontal size={23} strokeWidth={1.3} />
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 transition hover:bg-[#F2EAE0]"
            aria-label="Close cart"
          >
            <X size={21} strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl tracking-tight sm:text-[28px]">
              Your beauty bag
            </h2>

            <p className="mt-1 text-[11px] tracking-wide text-muted">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </p>
          </div>

          <span className="flex size-8 items-center justify-center rounded-full bg-cream text-mocha">
            <ShoppingBag size={15} strokeWidth={1.5} />
          </span>
        </div>
      </header>

      <div className="min-h-40 flex-1 overflow-y-auto px-6 max-[768px]:px-3 max-[768px]:pt-4">
        <div className="divide-y divide-line">
          {lines.map(({ key, product: p, variant, qty }) => (
            <article key={key} className="flex gap-3 py-5 sm:gap-4">

              <div className="h-[100px] w-[88px] shrink-0 overflow-hidden rounded-md bg-[#f1e8dc] sm:h-[112px] sm:w-[100px]">
                <img
                  src={p.image}
                  alt={p.name}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-serif text-[14px] leading-snug sm:text-[15px]">
                      {p.name}
                    </h3>

                    <strong className="shrink-0 text-[12px] font-medium">
                      {money(variant.price * qty)}
                    </strong>
                  </div>

                  <div className="mt-1 flex items-center gap-1.5 text-[10px] text-muted">
                    {variant.color && (
                      <span
                        className="size-2.5 rounded-full border border-black/10"
                        style={{ backgroundColor: variant.color }}
                      />
                    )}

                    <span>{variant.label}</span>
                  </div>

                  <p className="mt-1 text-[11px] text-muted">
                    {money(variant.price)} each
                  </p>
                </div>


                <div className="mt-3 flex items-center justify-between">
                  <div className="flex h-8 items-center rounded-md border border-line">
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateQuantity(key, Math.max(qty - 1, 1))
                      }
                      className="flex h-full w-8 items-center justify-center text-muted hover:bg-cream"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={12} />
                    </button>

                    <span className="min-w-6 text-center text-[11px]">
                      {qty}
                    </span>

                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(key, qty + 1)}
                      className="flex h-full w-8 items-center justify-center text-muted hover:bg-cream"
                      aria-label="Increase quantity"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  {/* <button
                    type="button"
                    onClick={() => handleDelete(key)}
                    className="flex size-8 items-center justify-center rounded-full text-muted hover:bg-[#f4e6df] hover:text-rose"
                    aria-label={`Remove ${p.name}`}
                  >
                    <Trash2 size={14} strokeWidth={1.4} />
                  </button> */}


                  <button
                    type="button"
                    onClick={() => handleDelete(
                      cartProducts.find((item) => item._id === key)
                    )}
                    className="flex size-8 items-center justify-center rounded-full text-muted hover:bg-[#f4e6df] hover:text-rose"
                    aria-label={`Remove ${p.name}`}
                  >
                    <Trash2 size={14} strokeWidth={1.4} />
                  </button>



                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="shrink-0 px-6 mb-4 pt-4 max-[768px]:px-3 max-[768px]:pt-4">
        <div className="rounded-lg bg-[#f1e8dc] px-4 py-3">
          <p className="text-[11px] leading-relaxed text-mocha">
            {remaining === 0
              ? "Lovely! Your order qualifies for free shipping."
              : `Add ${money(remaining)} more for complimentary shipping.`}
          </p>

          <div className="mt-2 h-1 overflow-hidden rounded-full bg-[#dfd0bd]">
            <div
              className="h-full rounded-full bg-mocha transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <footer className="shrink-0 border-t border-line bg-[#fcfaf6] px-6 pb-5 pt-4 max-[768px]:px-3 max-[768px]:pt-4">
        <div className="space-y-2 text-[12px]">
          <div className="flex items-center justify-between text-muted">
            <span>Subtotal</span>
            <span className="text-ink">{money(subtotal)}</span>
          </div>

          <div className="flex items-center justify-between text-muted">
            <span>Shipping</span>
            <span>{remaining === 0 ? "Free" : "Calculated at checkout"}</span>
          </div>

          <div className="flex items-center justify-between border-t border-line pt-3">
            <span className="font-medium text-ink">Total</span>

            <strong className="font-serif text-xl font-medium text-ink">
              {money(subtotal)}
            </strong>
          </div>
        </div>

        <button
          type="button"
          onClick={handlePay}
          className="mt-4 flex h-12 w-full items-center justify-center gap-2 bg-mocha text-[11px] font-medium tracking-wide text-white transition hover:bg-[#59412e]"
        >
          PROCEED TO CHECKOUT
          <ArrowRight size={14} />
        </button>

        <button
          type="button"
          onClick={onClose}
          className="mt-3 flex w-full items-center justify-center text-[11px] text-muted underline underline-offset-4 hover:text-mocha"
        >
          Continue shopping
        </button>
      </footer>
    </div>
  );
}
