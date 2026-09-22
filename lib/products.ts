export type ProductCategory =
  | "Tops"
  | "Sets"
  | "Dresses"
  | "Rompers";

export type Product = {
  slug: string;
  name: string;
  price: string;
  label: string;
  category: ProductCategory;
  image: string;
  alt: string;
  description: string;
  details: string[];
  sizes: string[];
  position: string;
};

export const products: Product[] = [
  {
    slug: "ivory-top",
    name: "The Ivory Top",
    price: "$42.00",
    label: "New Arrival",
    category: "Tops",
    image: "/images/rosy/product-01.png",
    alt: "Ivory off-the-shoulder top styled with white pants",
    description:
      "An effortless ivory top made for dressing up, dressing down, and everything in between.",
    details: [
      "Soft ivory finish",
      "Off-the-shoulder neckline",
      "Easy fitted silhouette",
      "Styled by Rosy Boutique",
    ],
    sizes: ["XS", "S", "M", "L"],
    position: "50% 35%",
  },
  {
    slug: "blush-set",
    name: "The Blush Set",
    price: "$58.00",
    label: "New Arrival",
    category: "Sets",
    image: "/images/rosy/product-02.png",
    alt: "Pink cardigan and matching pants set",
    description:
      "A soft blush matching set that makes an easy outfit feel instantly put together.",
    details: [
      "Two-piece look",
      "Soft blush pink",
      "Comfort-forward fit",
      "Wear together or style separately",
    ],
    sizes: ["XS", "S", "M", "L"],
    position: "50% 30%",
  },
  {
    slug: "cocoa-tank",
    name: "The Cocoa Tank",
    price: "$44.00",
    label: "Rosy Favorite",
    category: "Tops",
    image: "/images/rosy/product-03.png",
    alt: "Brown fitted square-neck tank",
    description:
      "A flattering chocolate-toned staple designed to work with denim, skirts, and everything else in your closet.",
    details: [
      "Chocolate brown",
      "Square neckline",
      "Fitted silhouette",
      "Easy day-to-night styling",
    ],
    sizes: ["XS", "S", "M", "L"],
    position: "50% 25%",
  },
  {
    slug: "butter-romper",
    name: "The Butter Romper",
    price: "$64.00",
    label: "New Arrival",
    category: "Rompers",
    image: "/images/rosy/product-04.png",
    alt: "Butter yellow long-sleeve romper",
    description:
      "A warm-weather statement piece in the soft butter yellow shade we're loving right now.",
    details: [
      "Butter yellow",
      "Long sleeves",
      "Defined waist",
      "Lightweight warm-weather styling",
    ],
    sizes: ["XS", "S", "M", "L"],
    position: "50% 35%",
  },
  {
    slug: "blush-midi",
    name: "The Blush Midi",
    price: "$68.00",
    label: "New Arrival",
    category: "Dresses",
    image: "/images/rosy/category-dresses.png",
    alt: "Blush pink midi dress",
    description:
      "A soft blush midi made for brunch plans, celebrations, and dressed-up afternoons.",
    details: [
      "Blush pink",
      "Midi silhouette",
      "Feminine everyday styling",
      "Easy event-ready look",
    ],
    sizes: ["XS", "S", "M", "L"],
    position: "50% 40%",
  },
  {
    slug: "rosy-dot-dress",
    name: "The Rosy Dot Dress",
    price: "$72.00",
    label: "Rosy Favorite",
    category: "Dresses",
    image: "/images/rosy/hero-secondary.png",
    alt: "Chocolate polka-dot dress styled with a Rosy shopping bag",
    description:
      "A playful chocolate polka-dot dress with the feminine, styled-up feel that fits right into the Rosy wardrobe.",
    details: [
      "Chocolate polka-dot print",
      "Feminine silhouette",
      "Statement styling",
      "A Rosy favorite",
    ],
    sizes: ["XS", "S", "M", "L"],
    position: "50% 35%",
  },
];

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}
