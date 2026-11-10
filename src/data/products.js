
const CDN = "https://cdn.dummyjson.com/product-images/beauty";



export const staticProducts = [
  {
    id: 1,
    name: "Beige Daily Face Serum",
    category: "Skin care",
    tag: "THE SKIN EDIT",
    image:
      "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=85",
    variants: [
      { id: "30ml", label: "30 ml", price: 899, stock: 20 },
      { id: "50ml", label: "50 ml", price: 1299, stock: 15 },
    ],
  },
  {
    id: 2,
    name: "Beige Everyday Face Cream",
    category: "Skin care",
    image:
      "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=800&q=85",
    variants: [
      { id: "50g", label: "50 g", price: 799, stock: 25 },
      { id: "100g", label: "100 g", price: 1399, stock: 12 },
    ],
  },
  {
    id: 3,
    name: "Beige Gentle Face Cleanser",
    category: "Skin care",
    image:
      "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=800&q=85",
    variants: [
      { id: "100ml", label: "100 ml", price: 599, stock: 30 },
      { id: "200ml", label: "200 ml", price: 999, stock: 18 },
    ],
  },
  {
    id: 4,
    name: "Beige Daily Body Lotion",
    category: "Body care",
    image:
      "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=85",
    variants: [
      { id: "200ml", label: "200 ml", price: 749, stock: 20 },
      { id: "400ml", label: "400 ml", price: 1199, stock: 15 },
    ],
  },
  {
    id: 5,
    name: "Beige Everyday Body Wash",
    category: "Body care",
    image:
      "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=85",
    variants: [
      { id: "250ml", label: "250 ml", price: 649, stock: 20 },
      { id: "500ml", label: "500 ml", price: 999, stock: 15 },
    ],
  },
  {
    id: 6,
    name: "Beige Daily Care Shampoo",
    category: "Hair care",
    image:
      "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=85",
    variants: [
      { id: "250ml", label: "250 ml", price: 799, stock: 20 },
      { id: "500ml", label: "500 ml", price: 1299, stock: 15 },
    ],
  },
  {
    id: 7,
    name: "Beige Everyday Conditioner",
    category: "Hair care",
    image:
      "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=85",
    variants: [
      { id: "250ml", label: "250 ml", price: 849, stock: 20 },
      { id: "500ml", label: "500 ml", price: 1399, stock: 15 },
    ],
  },
  {
    id: 8,
    name: "Beige Signature Satin Lipstick",
    category: "Makeup",
    image: `${CDN}/red-lipstick/1.webp`,
    variants: [
      { id: "red", label: "Classic Red", color: "#a72238", price: 699, stock: 20 },
      { id: "rose", label: "Rose Nude", color: "#b87578", price: 699, stock: 20 },
      { id: "pink", label: "Soft Pink", color: "#df9ba8", price: 699, stock: 15 },
    ],
  },
  {
    id: 9,
    name: "Beige Everyday Eyeshadow Palette",
    category: "Makeup",
    image: `${CDN}/eyeshadow-palette-with-mirror/1.webp`,
    variants: [
      { id: "warm", label: "Warm Neutrals", color: "#ac7a56", price: 1299, stock: 15 },
      { id: "cool", label: "Cool Neutrals", color: "#8b7d85", price: 1299, stock: 12 },
    ],
  },
  {
    id: 10,
    name: "Beige Soft Focus Setting Powder",
    category: "Makeup",
    image: `${CDN}/powder-canister/1.webp`,
    variants: [
      { id: "translucent", label: "Translucent", color: "#e3c0a2", price: 899, stock: 20 },
      { id: "warm", label: "Warm Beige", color: "#c69a76", price: 899, stock: 20 },
    ],
  },
  {
    id: 11,
    name: "Beige Everyday Mascara",
    category: "Makeup",
    image: `${CDN}/essence-mascara-lash-princess/1.webp`,
    variants: [
      { id: "black", label: "Black", color: "#242124", price: 599, stock: 20 },
      { id: "brown", label: "Brown", color: "#6b4536", price: 599, stock: 15 },
    ],
  },
  {
    id: 12,
    name: "Beige Gloss Finish Nail Colour",
    category: "Nails",
    image: `${CDN}/red-nail-polish/1.webp`,
    variants: [
      { id: "cherry", label: "Cherry Red", color: "#b82339", price: 349, stock: 20 },
      { id: "nude", label: "Nude Beige", color: "#c8a58d", price: 349, stock: 20 },
    ],
  },
  {
    id: 13,
    name: "Beige Signature Eau de Parfum",
    category: "Perfume",
    image:
      "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=85",
    variants: [
      { id: "30ml", label: "30 ml", price: 1199, stock: 20 },
      { id: "50ml", label: "50 ml", price: 1899, stock: 15 },
      { id: "100ml", label: "100 ml", price: 2999, stock: 10 },
    ],
  },
];

const toNumber = (value, fallback = 0) => {
  const parsed = Number(String(value ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) ? parsed : fallback;
};

const splitOptions = (value) =>
  String(value || "")
    .split(/[,|/]/)
    .map((option) => option.trim())
    .filter(Boolean);

const getImageUrl = (value) => {
  if (typeof value === "string") return value.trim();
  if (!value || typeof value !== "object") return "";

  for (const key of ["media", "url", "secure_url", "image", "imageUrl", "src"]) {
    const url = getImageUrl(value[key]);
    if (url) return url;
  }

  return "";
};

const normalizeImageUrl = (value) => {
  const url = getImageUrl(value);
  if (!url || /^(https?:|data:|blob:)/i.test(url)) return url;
  if (url.startsWith("//")) return `https:${url}`;
  return `http://localhost:3000/${url.replace(/^\/+/, "")}`;
};

export const normalizeProduct = (item) => {
  const sizes = splitOptions(item.size);
  const shades = splitOptions(item.shade);
  const options = sizes.length ? sizes : shades.length ? shades : ["Default"];
  const price = toNumber(item.final_price || item.discount_price || item.price);

  return {
    id: String(item._id || item.id),
    name: item.productname || item.name || "Unnamed product",
    category: item.subCategory || item.category || "Beauty",
    tag: item.tag || "",
    image: normalizeImageUrl(
      (Array.isArray(item.productimages) ? item.productimages : [item.productimages])
        .map(getImageUrl)
        .find(Boolean) || item.image
    ),
    description: item.description || "",
    variants: options.map((label, index) => ({
      id: String(item._id || item.id) + "-" + index,
      label,
      ...(shades.includes(label) ? { color: item.shadeColor || "#A58B70" } : {}),
      price,
      stock: Number(item.quantity) || 0,
    })),
  };
};

export const getallProduct = async () => {
  try {
    const response = await fetch("http://localhost:3000/products", { method: "GET" });
    if (!response.ok) throw new Error("Failed to fetch products");

    const result = await response.json();
    const productList = Array.isArray(result)
      ? result
      : result.products || result.data || [];

    return Array.isArray(productList) ? productList.map(normalizeProduct) : [];
  } catch (error) {
    console.error("Product API error:", error);
    return [];
  }
};

export const categories = [
  "All products",
  "Skin care",
  "Body care",
  "Hair care",
  "Makeup",
  "Nails",
  "Perfume",
];

export const FREE_SHIPPING_THRESHOLD = 1499;

export const money = (n = 0) =>
  "₹" + Number(n).toLocaleString("en-IN");
