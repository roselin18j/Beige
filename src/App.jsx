
import { useMemo, useState } from "react";
import { products } from "./data/products.js";
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

export default function App() {


  const user = {
    id: "user_123",
    name: "Test",
    email: "static@clariscosolutions.com",
    mobile: "",
  };



  const orders = [];

  const [category, setCategory] = useState("All products");
  const [search, setSearch] = useState("");

  const [cart, setCart] = useState({});
  const [wishlist, setWishlist] = useState([]);
  const [modal, setModal] = useState(null);


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
      current.includes(id)
        ? current.filter((itemId) => itemId !== id)
        : [...current, id]
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

  const bagCount = Object.values(cart).reduce(
    (total, quantity) => total + Number(quantity || 0),
    0
  );




  const visibleProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    return products.filter(
      (product) =>
        (category === "All products" ||
          product.category === category) &&
        product.name.toLowerCase().includes(term)
    );
  }, [category, search]);


  const renderModal = () => {
    switch (modal?.type) {

      case "cart":
        return (
          <CartModal
            cart={cart}
            onRemove={removeFromCart}
            onUpdateQuantity={updateCartQuantity}
            onClose={close}
          />
        );

      case "account":
        return (
          <WishlistModal
            initialTab={modal.activeTab}
            user={user}
            orders={orders}
            wishlist={wishlist}
            onAdd={addDefaultVariant}
            onView={(id) => open("product", id)}
            onToggleWish={toggleWishlist}
            onClose={close}
            onLogout={handleLogout}
            onUpdateProfile={handleUpdateProfile}
          />
        );


      case "product":
        return (
          <ProductModal
            productId={modal.productId}
            onClose={close}
            onAdd={(productId, variantId, quantity) => {
              const success = addToCart(
                productId,
                variantId,
                quantity
              );

              if (success) {
                open("cart");
              }
            }}
          />
        );


      case "skinTest":
        return (
          <SkinTestModal
            onClose={close}
            onAdd={(productName) => {
              const product = products.find(
                (item) =>
                  item.name.toLowerCase() ===
                  productName.toLowerCase()
              );

              if (!product) {
                toast.error("Product is unavailable");
                return false;
              }

              const success = addDefaultVariant(
                product.id,
                false
              );

              if (success) {
                toast.success("Added to cart successfully!", {
                  description: product.name,
                });
              }

              return success;
            }}
          />
        );


      case "tryOn":
        return <TryOnModal onClose={close} />;


      default:
        return null;
    }
  };


  return (
    <>
      <Header
        bagCount={bagCount}
        wishCount={wishlist.length}
        onCategory={setCategory}
        onOpen={open}
      />

      <main>
        <Hero />

        <ServiceStrip />

        <Shop
          category={category}
          onCategory={setCategory}
          search={search}
          onSearch={setSearch}
          products={visibleProducts}
          wishlist={wishlist}
          onAdd={(id) => open("product", id)}
          onToggleWish={toggleWishlist}
          onView={(id) => open("product", id)}
        />

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
    </>
  );
}
