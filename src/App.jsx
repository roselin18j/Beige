
import { useEffect, useMemo, useState } from "react";
import { getallProduct } from "./data/products.js";
import { Toaster, toast } from "sonner";
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import ServiceStrip from "./components/ServiceStrip.jsx";
import Shop from "./components/Shop.jsx";
import Closing from "./components/Closing.jsx";
import Footer from "./components/Footer.jsx";
import Modal from "./components/Modal.jsx";
import CartModal from "./components/modals/CartModal.jsx";
import WishlistModal from "./components/modals/WishlistModal.jsx";
import ProductModal from "./components/modals/ProductModal.jsx";
import SkinTestModal from "./components/modals/SkinTestModal.jsx";
import TryOnModal from "./components/modals/TryOnModal";
import { useDispatch, useSelector } from "react-redux";
import { AppProvider } from "./context/AppContext.jsx";
import { Wishlist, cartList } from "./redux/slices/commonSlice.jsx";
import {
  selectAuthUser,
  selectIsLogin,
} from "./redux/slices/authSlices.jsx";

export default function App() {

  const dispatch = useDispatch();

  const userData = useSelector(selectAuthUser);
  const isLogin = useSelector(selectIsLogin);
  const [bagCount, setBagCount] = useState(0);
  const userId = userData?.id || userData?._id;
  const orders = [];
  const [category, setCategory] = useState("All products");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState({});
  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [modal, setModal] = useState(null);


  const GetBagCount = async () => {
    try {
      const payload = {
        userid: userId,
        type: "get",
      };

      const res = await dispatch(cartList(payload)).unwrap();

      const cartRecords = res?.data?.product || [];

      setBagCount(cartRecords.length);


    } catch (error) {
      console.log("Bag Count Error:", error);
    }
  };



  useEffect(() => {
    const GetWishList = async () => {
      try {
        const payload = {
          type: "get",
          userId,
          email: userData?.email,
        };

        const res = await dispatch(Wishlist(payload)).unwrap();

        const wishlistRecords = res?.data || [];

        setWishlist(
          wishlistRecords.map((item) => String(item.productId))
        );


      } catch (error) {
        console.log("Wishlist error:", error);
      }
    };

    if (!isLogin || !userId) {
      setWishlist([]);
      return;
    }

    GetWishList();
  }, [dispatch, userId, isLogin]);


  useEffect(() => {
    if (isLogin && userId) {
      GetBagCount();
    } else {
      setBagCount(0);
    }
  }, [dispatch, userId, isLogin]);


  const user = {
    id: "user_123",
    name: "Test",
    email: "static@clariscosolutions.com",
    mobile: "",
  };


  useEffect(() => {
    let active = true;

    getallProduct().then((loadedProducts) => {

      if (active) {
        setProducts(loadedProducts);
      }
    });

    return () => {
      active = false;
    };
  }, []);


  const accountModalIds = [
    "accountModal",
    "pastOrderModal",
    "wishlistModal",
  ];

  const open = (type, productId) => {
    if (accountModalIds.includes(type)) {
      setModal({
        type: "account",
        activeTab: type,
      });

      return;
    }

    setModal({
      type,
      productId,
    });
  };

  const close = () => {
    setModal(null);
  };


  const addToCart = (productId, variantId, quantity = 1) => {

    if (
      typeof productId === "object" ||
      typeof variantId === "object"
    ) {

      return false;
    }

    const normalizedProductId = String(productId);
    const normalizedVariantId = String(variantId);

    // Validate product and variant
    const product = products.find(
      (item) => String(item.id) === normalizedProductId
    );

    const variant = product?.variants?.find(
      (item) => String(item.id) === normalizedVariantId
    );

    if (!product || !variant || quantity < 1) {
      console.error("Invalid product or variant:", {
        productId,
        variantId,
        quantity,
      });

      return false;
    }

    const key = `${normalizedProductId}:${normalizedVariantId}`;

    setCart((current) => ({
      ...current,
      [key]: (Number(current[key]) || 0) + Number(quantity),
    }));

    return true;
  };


  const addDefaultVariant = (productId, openCart = true) => {
    const product = products.find(
      (item) => String(item.id) === String(productId)
    );

    if (!product) {
      console.error("Product not found:", productId);
      return false;
    }

    const variant = product.variants?.[0];

    if (!variant) {
      console.error("Product has no variants:", product.name);
      return false;
    }

    const success = addToCart(
      product.id,
      variant.id,
      1
    );

    if (!success) return false;

    if (openCart) {
      open("cart");
    }

    return true;
  };


  const addWishlistDefaultVariant = (productId) => {
    const success = addDefaultVariant(productId, false);

    if (success) {
      open("cart");
    }

    return success;
  };

  const removeFromCart = (key) => {
    setCart((current) => {
      const next = { ...current };

      delete next[key];

      return next;
    });
  };

  const updateCartQuantity = (key, quantity) => {
    const nextQuantity = Number(quantity);

    if (!Number.isFinite(nextQuantity) || nextQuantity < 1) {
      return;
    }

    setCart((current) => ({
      ...current,
      [key]: nextQuantity,
    }));
  };


  const toggleWishlist = (id) => {
    setWishlist((current) =>
      current.includes(String(id))
        ? current.filter((itemId) => itemId !== String(id))
        : [...current, String(id)]
    );
  };

  const handleLogout = () => {
    alert("Authentication logout API will be connected later.");
  };

  const handleUpdateProfile = async (profileData) => {
    console.log("Profile data:", profileData);

    // TODO: Connect backend profile update API
    alert("Profile update API will be connected later.");
  };






  const visibleProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    return products.filter(
      (product) =>
        (category === "All products" ||
          product.category === category) &&
        product.name.toLowerCase().includes(term)
    );
  }, [category, search, products]);

  const categories = useMemo(
    () => ["All products", ...new Set(products.map((product) => product.category).filter(Boolean))],
    [products]
  );

  const addSkinRecommendation = (recommendedProduct) => {
    const productName = recommendedProduct?.productname;
    if (typeof productName !== "string" || !productName.trim()) {
      toast.error("This recommendation is missing its product name");
      return false;
    }
    const product = products.find((item) => item.name.trim().toLowerCase() === productName.trim().toLowerCase());
    if (!product) {
      toast.error("Product is unavailable");
      return false;
    }
    const success = addDefaultVariant(product.id, false);
    if (success) toast.success("Added to cart successfully!", { description: product.name });
    return success;
  };

  const contextValue = {
    bagCount, wishlist, category, setCategory, search, setSearch,
    products, visibleProducts, categories, cart, user,
    modal, open, close, addToCart, addDefaultVariant, addWishlistDefaultVariant,
    removeFromCart, updateCartQuantity, toggleWishlist, GetBagCount,
    onSkinRecommendation: addSkinRecommendation, handleLogout, handleUpdateProfile,
  };



  const renderModal = () => {
    switch (modal?.type) {

      case "cart":
        return (
          <CartModal />
        );

      case "account":
        return (
          <WishlistModal initialTab={modal.activeTab} />
        );


      case "product":
        return (
          <ProductModal productId={modal.productId} />
        );


      case "skinTest":
        return (
          <SkinTestModal />
        );


      case "tryOn":
        return <TryOnModal />;


      default:
        return null;
    }
  };


  return (
    <AppProvider value={contextValue}>
      <Header />

      <main>
        <Hero />

        <ServiceStrip />

        <Shop />

        <Closing />
      </main>

      <Footer />



      <Modal
        isOpen={!!modal}
        onClose={close}
        size={
          modal?.type === "product"
            ? "lg"
            : modal?.type === "tryOn"
              ? "md"
              : "md"
        }
      >
        {renderModal()}
      </Modal>


      <Toaster position="top-right" richColors />
    </AppProvider>
  );
}
