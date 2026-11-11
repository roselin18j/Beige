
import { env } from "../utils/env";
import { store } from "../redux/store";
import { productList } from "../redux/slices/commonSlice";

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

  return `${env.api_base_url}/${url.replace(/^\/+/, "")}`;
};

export const normalizeProduct = (item) => {
  const sizes = splitOptions(item.size);
  const shades = splitOptions(item.shade);

  const options = sizes.length
    ? sizes
    : shades.length
      ? shades
      : ["Default"];

  const price = toNumber(
    item.final_price || item.discount_price || item.price
  );

  return {
    id: String(item._id || item.id),
    name: item.productname || item.name || "Unnamed product",
    category: item.subCategory || item.category || "Beauty",
    tag: item.tag || "",

    image: normalizeImageUrl(
      (Array.isArray(item.productimages)
        ? item.productimages
        : [item.productimages]
      )
        .map(getImageUrl)
        .find(Boolean) || item.image
    ),

    description: item.description || "",

    variants: options.map((label, index) => ({
      id: String(item._id || item.id) + "-" + index,
      label,
      ...(shades.includes(label)
        ? { color: item.shadeColor || "#A58B70" }
        : {}),
      price,
      stock: Number(item.quantity) || 0,
    })),
  };
};


export const getallProduct = async () => {
  try {
    const response = await store.dispatch(productList()).unwrap();

    const products = response.products || [];

    return products.map(normalizeProduct);

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
