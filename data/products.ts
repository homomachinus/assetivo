export type Product = {
  id: string;
  line: string;
  name: string;
  price: number;
  was: number;
  category: string;
  variantType: string;
  variantColor: string;
  image: string;
  description: string;
  details: string[];
  colors: { name: string; hex: string }[];
  sizes: string[];
  favourite: boolean;
};

export const products: Product[] = [
  {
    id: "shirt-oxford",
    line: "Apparel",
    name: "Oxford Shirt",
    price: 390,
    was: 490,
    category: "Shirts",
    variantType: "Oxford",
    variantColor: "Sand",
    image:
      "/assets/cover/image3.png",
    description:
      "Classic oxford shirt with crisp lines and a soft, breathable weave.",
    details: [
      "100 percent cotton",
      "Structured collar",
      "Easy care finish"
    ],
    colors: [
      { name: "Sand", hex: "#e6d5b8" },
      { name: "Ink", hex: "#1f2937" },
      { name: "Rose", hex: "#e7b3a8" }
    ],
    sizes: ["S", "M", "L", "XL"],
    favourite: false
  },
  {
    id: "bag-weekender",
    line: "Accessories",
    name: "Weekender Bag",
    price: 299,
    was: 480,
    category: "Bags",
    variantType: "Weekender",
    variantColor: "Black",
    image:
      "/assets/cover/image1.png",
    description:
      "Structured travel bag built for quick getaways and daily carry.",
    details: [
      "Water resistant canvas",
      "Padded shoulder strap",
      "Exterior zip pocket"
    ],
    colors: [
      { name: "Black", hex: "#111827" },
      { name: "Clay", hex: "#b08968" }
    ],
    sizes: ["One size"],
    favourite: false
  },
  {
    id: "jacket-utility",
    line: "Apparel",
    name: "Utility Jacket",
    price: 450,
    was: 690,
    category: "Jackets",
    variantType: "Utility",
    variantColor: "Olive",
    image:
      "/assets/cover/image4.png",
    description:
      "Lightweight layering jacket with modern utility pockets.",
    details: [
      "Wind resistant shell",
      "Hidden interior pocket",
      "Soft brushed lining"
    ],
    colors: [
      { name: "Olive", hex: "#6b705c" },
      { name: "Stone", hex: "#d0c7c0" }
    ],
    sizes: ["S", "M", "L"],
    favourite: false
  },
  {
    id: "blazer-slim",
    line: "Apparel",
    name: "Slim Fit Blazer",
    price: 390,
    was: 490,
    category: "Jackets",
    variantType: "Slim Fit",
    variantColor: "Camel",
    image:
      "/assets/cover/image1.png",
    description:
      "Tailored blazer with a sharp profile and clean lapels.",
    details: [
      "Slim silhouette",
      "Breathable fabric blend",
      "Internal media pocket"
    ],
    colors: [
      { name: "Camel", hex: "#b08968" },
      { name: "Midnight", hex: "#1f2937" }
    ],
    sizes: ["M", "L", "XL"],
    favourite: false
  },
  {
    id: "watch-atelier",
    line: "Accessories",
    name: "Atelier Watch",
    price: 490,
    was: 690,
    category: "Watches",
    variantType: "Atelier",
    variantColor: "Tan",
    image:
      "/assets/cover/image1.png",
    description:
      "Minimal watch face with a brushed steel case and leather strap.",
    details: [
      "Japanese quartz movement",
      "Sapphire coated glass",
      "Genuine leather strap"
    ],
    colors: [
      { name: "Tan", hex: "#c2a878" },
      { name: "Black", hex: "#111827" }
    ],
    sizes: ["One size"],
    favourite: false
  },
  {
    id: "tee-heritage",
    line: "Apparel",
    name: "Heritage Tee",
    price: 250,
    was: 490,
    category: "Shirts",
    variantType: "Heritage",
    variantColor: "Bone",
    image:
      "/assets/cover/image1.png",
    description:
      "Soft jersey tee with a vintage wash and relaxed fit.",
    details: ["Relaxed fit", "Pre-shrunk cotton", "Reinforced seams"],
    colors: [
      { name: "Bone", hex: "#f4f1ea" },
      { name: "Charcoal", hex: "#4b5563" }
    ],
    sizes: ["S", "M", "L", "XL"],
    favourite: false
  },
  {
    id: "jacket-denim",
    line: "Apparel",
    name: "Denim Jacket",
    price: 520,
    was: 750,
    category: "Jackets",
    variantType: "Denim",
    variantColor: "Indigo",
    image:
      "/assets/cover/image1.png",
    description:
      "Vintage inspired denim jacket with contrast stitching.",
    details: ["Stone wash denim", "Metal buttons", "Two chest pockets"],
    colors: [
      { name: "Indigo", hex: "#1e3a8a" },
      { name: "Washed", hex: "#93c5fd" }
    ],
    sizes: ["M", "L", "XL"],
    favourite: false
  },
  {
    id: "sneaker-canvas",
    line: "Accessories",
    name: "Canvas Sneakers",
    price: 180,
    was: 250,
    category: "Shoes",
    variantType: "Canvas",
    variantColor: "White",
    image:
      "/assets/cover/image1.png",
    description:
      "Everyday sneakers with cushioned soles and canvas uppers.",
    details: ["Rubber outsole", "Breathable canvas", "Comfort insole"],
    colors: [
      { name: "White", hex: "#f9fafb" },
      { name: "Navy", hex: "#1e293b" }
    ],
    sizes: ["39", "40", "41", "42", "43"],
    favourite: false
  }
];
