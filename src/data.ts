export interface Project {
  id: string;
  title: string;
  category: string; // matches: 'branding', 'ui-ux', 'logo-design', 'social-media', 'packaging', 'brochure', 'other-design', 't-shirt-design'
  categoryName: string;
  image: string;
  description: string;
  client: string;
  year: string;
  tags: string[];
  gallery?: string[]; // Multiple high-fidelity mockup images
}

export interface SkillCategory {
  title: string;
  skills: { name: string; level: number; iconName: string }[];
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  duration: string;
  contributions: string[];
}

export interface VideoReel {
  id: string;
  title: string;
  videoUrl: string;
  fallbackPoster: string;
  tagline: string;
}

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    title: "Design & Systems",
    skills: [
      { name: "Figma (Tokens & Auto-Layout)", level: 98, iconName: "figma" },
      { name: "Adobe Creative Cloud", level: 92, iconName: "adobe" },
      { name: "Spline 3D & Cinema 4D", level: 90, iconName: "spline" },
      { name: "Design Systems & Architecture", level: 95, iconName: "cinema4d" }
    ]
  },
  {
    title: "Motion & Interactive Prototyping",
    skills: [
      { name: "Motion.page & GSAP Timelines", level: 98, iconName: "motion" },
      { name: "Framer Motion Physics", level: 96, iconName: "react" },
      { name: "WebGL Shaders & Spatial Canvases", level: 90, iconName: "webgl" },
      { name: "Responsive Layout Tokens (Tailwind)", level: 95, iconName: "tailwind" }
    ]
  },
  {
    title: "Core Design Craft",
    skills: [
      { name: "UI/UX & Interactive Prototyping", level: 98, iconName: "uiux" },
      { name: "Micro-Interactions & Keyframes", level: 95, iconName: "motion" },
      { name: "Brand Identity & Art Direction", level: 92, iconName: "systems" },
      { name: "Swiss Typography & Grid Math", level: 96, iconName: "type" }
    ]
  }
];

export const PROJECTS: Project[] = [
  // ROW 1: Branding | UI/UX
  {
    id: "brand-1",
    title: "Aura Cosmetic Identity",
    category: "branding",
    categoryName: "Branding",
    image: "linear-gradient(135deg, #a855f7 0%, #4c1d95 100%)",
    description: "A luxury minimal skincare identity designed with organic geometries and elegant typography.",
    client: "Aura Labs Co.",
    year: "2026",
    tags: ["Brand Guidelines", "Logotype", "Art Direction"]
  },
  {
    id: "brand-2",
    title: "Vesper Financial Redesign",
    category: "branding",
    categoryName: "Branding",
    image: "linear-gradient(135deg, #06b6d4 0%, #083344 100%)",
    description: "Rebranding a leading neo-bank with a high-fidelity visual system emphasizing security and fluid motion.",
    client: "Vesper Group",
    year: "2025",
    tags: ["Visual System", "Identity", "Design Tokenry"]
  },
  {
    id: "ui-ux-1",
    title: "Holo Smart Home Console",
    category: "ui-ux",
    categoryName: "UI/UX",
    image: "linear-gradient(135deg, #10b981 0%, #064e3b 100%)",
    description: "An immersive, gesture-controlled tablet interface for high-end home automation.",
    client: "Holo Systems",
    year: "2026",
    tags: ["Mobile App", "Design System", "Interactive Prototype"]
  },
  {
    id: "ui-ux-2",
    title: "Metamarket NFT Terminal",
    category: "ui-ux",
    categoryName: "UI/UX",
    image: "linear-gradient(135deg, #f43f5e 0%, #4c0519 100%)",
    description: "A dark-mode-centric Web3 trading dashboard engineered for instantaneous price tracking.",
    client: "Metamarket Corp",
    year: "2025",
    tags: ["Web App", "UX Architecture", "Data Vis"]
  },

  // ROW 2: Logo Design | Social Media
  {
    id: "logo-1",
    title: "Apex Aerodynamics Emblem",
    category: "logo-design",
    categoryName: "Logo Design",
    image: "linear-gradient(135deg, #fbbf24 0%, #78350f 100%)",
    description: "A dynamic geometric mark representing speed, precision, and structural engineering integrity.",
    client: "Apex Aero",
    year: "2025",
    tags: ["Monogram", "Vector Math", "Corporate Mark"]
  },
  {
    id: "logo-2",
    title: "Krypton Web3 Identity",
    category: "logo-design",
    categoryName: "Logo Design",
    image: "linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%)",
    description: "A sleek, three-dimensional overlapping wireframe mark representing decentralization.",
    client: "Krypton Ltd",
    year: "2026",
    tags: ["Symbol", "3D Modeling", "Branding"]
  },
  {
    id: "sm-1",
    title: "Zenith Launch Campaign",
    category: "social-media",
    categoryName: "Social Media",
    image: "linear-gradient(135deg, #ec4899 0%, #701a75 100%)",
    description: "A curated series of motion-heavy social content that expanded user acquisition by 180%.",
    client: "Zenith Apparel",
    year: "2025",
    tags: ["Motion Design", "Instagram Feed", "Social Kits"]
  },
  {
    id: "sm-2",
    title: "Elysium Launch Carousel",
    category: "social-media",
    categoryName: "Social Media",
    image: "linear-gradient(135deg, #14b8a6 0%, #115e59 100%)",
    description: "A set of high-contrast, informative slide grids for technical storytelling on professional networks.",
    client: "Elysium AI",
    year: "2026",
    tags: ["Social Design", "Content Strategy", "Carousels"]
  },

  // ROW 3: Packaging | Brochure
  {
    id: "pack-1",
    title: "Nocturnal Gin Box & Bottle",
    category: "packaging",
    categoryName: "Packaging",
    image: "linear-gradient(135deg, #6366f1 0%, #312e81 100%)",
    description: "Ultra-premium structural packaging using dark matte cardstocks and blind debossing highlights.",
    client: "Nocturnal Distillery",
    year: "2026",
    tags: ["Structural Packaging", "Glassware Engraving", "3D Mockup"]
  },
  {
    id: "pack-2",
    title: "Satori Coffee Eco-Bag",
    category: "packaging",
    categoryName: "Packaging",
    image: "linear-gradient(135deg, #ea580c 0%, #7c2d12 100%)",
    description: "Biodegradable craft packaging featuring minimalist Japanese typography and sustainable soy ink.",
    client: "Satori Roasters",
    year: "2025",
    tags: ["Eco-Design", "Material Sourcing", "Label Typography"]
  },
  {
    id: "brochure-1",
    title: "Vanguard Biennial Catalog",
    category: "brochure",
    categoryName: "Brochure",
    image: "linear-gradient(135deg, #94a3b8 0%, #334155 100%)",
    description: "A grid-strict editorial brochure showcasing state-of-the-art modernist sculpture.",
    client: "Vanguard Museum",
    year: "2025",
    tags: ["Grid System", "Print Production", "Typography"]
  },
  {
    id: "brochure-2",
    title: "Chronos Watch Lookbook",
    category: "brochure",
    categoryName: "Brochure",
    image: "linear-gradient(135deg, #a8a29e 0%, #44403c 100%)",
    description: "A luxurious physical catalog leveraging high-contrast horizontal grids and metallic foil trim.",
    client: "Chronos Geneva",
    year: "2026",
    tags: ["Editorial", "Foil Finish", "Luxury Branding"]
  },

  // ROW 4: Other Design | T-shirt Design
  {
    id: "other-1",
    title: "Exodus Cinematic Keyart",
    category: "other-design",
    categoryName: "Other Design",
    image: "linear-gradient(135deg, #8b5cf6 0%, #4c1d95 100%)",
    description: "A dark sci-fi theatrical poster combining photographic collages with sharp, custom letterforms.",
    client: "Exodus Filmworks",
    year: "2025",
    tags: ["Keyart", "Digital Painting", "Cinematic Layout"]
  },
  {
    id: "other-2",
    title: "Synaptic Sound Poster Series",
    category: "other-design",
    categoryName: "Other Design",
    image: "linear-gradient(135deg, #22c55e 0%, #14532d 100%)",
    description: "Generative typography posters responding dynamically to sub-bass frequencies.",
    client: "Synaptic Waves",
    year: "2026",
    tags: ["Generative Design", "Poster Art", "Music Festival"]
  },
  {
    id: "tshirt-1",
    title: "Cyberpunk Tokyo Streetwear",
    category: "t-shirt-design",
    categoryName: "T-shirt Design",
    image: "linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%)",
    description: "A high-density screenprint design utilizing distressed Kanji characters and technical blueprints.",
    client: "Vapor Apparel",
    year: "2025",
    tags: ["Apparel Design", "Vector Illustration", "Screenprint Tech"]
  },
  {
    id: "tshirt-2",
    title: "Deconstructive Glitch Tee",
    category: "t-shirt-design",
    categoryName: "T-shirt Design",
    image: "linear-gradient(135deg, #c084fc 0%, #581c87 100%)",
    description: "An avant-garde oversized t-shirt design exploring corrupted data grids and embroidered text blocks.",
    client: "Atelier Zero",
    year: "2026",
    tags: ["Streetwear", "Embroidery Tech", "Creative Direction"]
  }
];

export const VIDEO_REELS: VideoReel[] = [
  {
    id: "reel-1",
    title: "Cinematic Visuals Reel",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-liquid-motion-with-pink-blue-and-purple-colors-42861-large.mp4",
    fallbackPoster: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    tagline: "Exploring organic liquid simulations and high-fidelity CGI shaders."
  },
  {
    id: "reel-2",
    title: "Interactive Web & UI Showcase",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-abstract-glowing-digital-particles-background-41613-large.mp4",
    fallbackPoster: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80",
    tagline: "High-performance WebGL animations and responsive interface physics."
  },
  {
    id: "reel-3",
    title: "Motion Identity Highlights",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-rotating-technological-glowing-neon-circles-39933-large.mp4",
    fallbackPoster: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    tagline: "Dynamic typographic rhythms and branding systems in continuous motion."
  }
];

export const EXPERIENCES: Experience[] = [
  {
    id: "exp-1",
    company: "Phantoms Studio",
    role: "Senior Lead Designer",
    duration: "2024 — Present",
    contributions: [
      "Directed the interactive visual identity and 3D experiences for fortune-500 luxury brands.",
      "Engineered in-house creative templates reducing team prototyping cycles by over 40%.",
      "Collaborated closely with creative developers to deploy WebGL landing pages with zero performance lag."
    ]
  },
  {
    id: "exp-2",
    company: "Nova Interactive",
    role: "UI/UX & Interactive Designer",
    duration: "2022 — 2024",
    contributions: [
      "Designed and documented comprehensive design systems, used across 4 separate international product lines.",
      "Created highly tailored, smooth-scrolling client catalogs, expanding client digital conversion by 34%.",
      "Mentored junior design associates in motion design principles, spacing rigor, and typographic systems."
    ]
  },
  {
    id: "exp-3",
    company: "Atelier Vanguard",
    role: "Brand & Graphic Designer",
    duration: "2020 — 2022",
    contributions: [
      "Crafted full visual identities from seed concepts, including custom typography and tactile physical lookbooks.",
      "Produced physical structural packagings, brochures, and screenprinted streetwear lines for indie brands.",
      "Established brand-strict grid layouts for digital and print collateral with high production values."
    ]
  }
];
