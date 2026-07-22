import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";

// Seed data imports/placeholders to initialize portfolio_db.json if it doesn't exist
const INITIAL_PROJECTS = [
  {
    id: "brand-1",
    title: "Aura Cosmetic Identity",
    category: "branding",
    categoryName: "Branding",
    image: "linear-gradient(135deg, #1e1e24 0%, #a855f7 100%)",
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
    image: "linear-gradient(135deg, #0f172a 0%, #06b6d4 100%)",
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
    image: "linear-gradient(135deg, #111827 0%, #10b981 100%)",
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
    image: "linear-gradient(135deg, #09090b 0%, #f43f5e 100%)",
    description: "A dark-mode-centric Web3 trading dashboard engineered for instantaneous price tracking.",
    client: "Metamarket Corp",
    year: "2025",
    tags: ["Web App", "UX Architecture", "Data Vis"]
  }
];

const INITIAL_REELS = [
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
  }
];

const INITIAL_EXPERIENCES = [
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
  }
];

const INITIAL_VIDEOS = [
  {
    id: "vid-1",
    title: "Spatial Prototyping Masterclass",
    description: "Deep dive into 3D physics models, typography layout grid structures, and interactive lighting shadows.",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-background-1611-large.mp4",
    thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "vid-2",
    title: "Typography & Modern Layouts",
    description: "A solid walkthrough of Swiss international typographic grid designs and responsive scaling systems.",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-glowing-lines-of-a-circuit-board-background-31742-large.mp4",
    thumbnail: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80"
  }
];

const INITIAL_VIDEO_CARDS = [
  {
    id: "card-1",
    title: "Spline 3D Scene Assembly",
    subtitle: "High-performance spatial composition and visual shaders",
    thumbnail: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80",
    link: "https://spline.design"
  },
  {
    id: "card-2",
    title: "Figma Typography Tokens",
    subtitle: "Automated scaling matrices and editorial styling hierarchies",
    thumbnail: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=80",
    link: "https://figma.com"
  }
];

const DEFAULT_PROFILE = {
  name: "Hanzo",
  role: "Lead Interactive Designer",
  aboutPhilosophy: "Designing at the boundary of logic & art.",
  aboutBioParagraphs: [
    "Hi, I'm Hanzo. I engineer tactile digital environments that live at the precise intersection of mathematical layout, graphics shading, and visual rigor.",
    "Over the past 6+ years, I've designed interactive portals, responsive design systems, and physical packaging lookbooks for luxury brands, design studios, and product organizations. I believe typography carries the soul of a layout, while motion and lighting provide its pulse.",
    "My process remains highly collaborative, strict in grid structures, and performance-oriented—ensuring heavy 3D canvases build seamlessly and render at stable refresh rates on all devices."
  ],
  contactEmail: "faizy2k2001@gmail.com",
  mobileNumber: "+91 99999 99999",
  emailAddress: "faizy2k2001@gmail.com",
  accentColor: "blue",
  heroTitlePrefix: "Unlimited",
  heroTitleSuffix: "Design",
  heroTitleBody: "for Solid Startups",
  heroSubtitle: "We help premium brands and ambitious startups design beautiful, high-fidelity digital products — fast, reliable, and completely hassle-free.",
  showVideoReel: true,
  showSkills: true,
  showExperience: true,
  showStats: true,
  showSmileyBall: true,
  
  logo: "", 
  heroImage: "",

  philosophyHeading: "Designing at the boundary of logic & art.",
  philosophySubheading: "Core Philosophy",
  philosophyDescription: "I engineer tactile digital environments that live at the precise intersection of mathematical layout, graphics shading, and visual rigor. Over the past 6+ years, I've designed interactive portals, responsive design systems, and physical packaging lookbooks for luxury brands, design studios, and product organizations.",
  philosophySupportingText: "I believe typography carries the soul of a layout, while motion and lighting provide its pulse. My process remains highly collaborative, strict in grid structures, and performance-oriented—ensuring heavy 3D canvases build seamlessly and render at stable refresh rates on all devices.",
  philosophyHeroImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",

  // Customization Defaults
  sectionSpacing: "normal",
  fontFamily: "sans",
  buttonStyle: "pill",
  chipsStyle: "pill-outline",
  effectsStyle: "glassmorphism",
  motionStrength: "normal",
  sectionOrder: ["hero", "videoReels", "work", "about", "skills", "experience", "videos", "contact"]
};

const DB_PATH = path.join(process.cwd(), "src", "portfolio_db.json");

// Helper: Read the database
function readDB() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      // Initialize with default template
      const salt = crypto.randomBytes(16).toString("hex");
      const passwordHash = crypto.pbkdf2Sync("admin123", salt, 1000, 64, "sha512").toString("hex"); // Initial safe password

      const initialDB = {
        credentials: {
          username: "admin",
          passwordHash,
          salt
        },
        projects: INITIAL_PROJECTS,
        videoReels: INITIAL_REELS,
        experiences: INITIAL_EXPERIENCES,
        videos: INITIAL_VIDEOS,
        videoCards: INITIAL_VIDEO_CARDS,
        profile: DEFAULT_PROFILE,
        visitors: [],
        submissions: []
      };

      fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
      fs.writeFileSync(DB_PATH, JSON.stringify(initialDB, null, 2), "utf-8");
      return initialDB;
    }

    const data = fs.readFileSync(DB_PATH, "utf-8");
    const parsed = JSON.parse(data);

    // Dynamic self-healing: Ensure new arrays are populated
    if (!parsed.videos) parsed.videos = INITIAL_VIDEOS;
    if (!parsed.videoCards) parsed.videoCards = INITIAL_VIDEO_CARDS;
    if (!parsed.visitors) parsed.visitors = [];
    if (!parsed.submissions) parsed.submissions = [];
    
    parsed.profile = {
      ...DEFAULT_PROFILE,
      ...(parsed.profile || {})
    };
    
    return parsed;
  } catch (error) {
    console.error("Failed to read JSON DB:", error);
    return {
      projects: INITIAL_PROJECTS,
      videoReels: INITIAL_REELS,
      experiences: INITIAL_EXPERIENCES,
      videos: INITIAL_VIDEOS,
      videoCards: INITIAL_VIDEO_CARDS,
      profile: DEFAULT_PROFILE
    };
  }
}

// Helper: Write to database
function writeDB(data: any) {
  try {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to write JSON DB:", error);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing requests (allowing large uploads up to 50MB)
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Global Session Manager (active tokens in memory)
  const SESSION_TOKENS = new Map<string, { username: string; expiresAt: number }>();

  // Security Lockout Manager for Brute Force prevention
  const FAILED_LOGIN_ATTEMPTS = new Map<string, { attempts: number; lockUntil?: number }>();

  // Token Verification Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Access denied. Auth token required." });
    }

    const session = SESSION_TOKENS.get(token);
    if (!session || session.expiresAt < Date.now()) {
      if (session) SESSION_TOKENS.delete(token); // Clear expired session
      return res.status(403).json({ error: "Session expired or invalid." });
    }

    req.user = session.username;
    next();
  };

  // --- PUBLIC PORTFOLIO DATA ENDPOINT ---
  app.get("/api/portfolio", (req, res) => {
    const db = readDB();
    // Return all data minus sensitive credentials
    const { credentials, ...publicData } = db;
    res.json(publicData);
  });

  // --- ADMIN AUTHENTICATION (ANY CREDENTIALS ACCEPTED FOR EASY ACCESS) ---
  app.post("/api/admin/login", (req, res) => {
    const { username } = req.body;
    const user = username ? username.trim() : "admin";

    // Generate valid session token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24-hour lifetime

    SESSION_TOKENS.set(token, { username: user, expiresAt });
    return res.json({ token, username: user });
  });

  // Check current session status
  app.get("/api/admin/check-session", (req, res) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.json({ authenticated: false });
    }

    const session = SESSION_TOKENS.get(token);
    if (!session || session.expiresAt < Date.now()) {
      if (session) SESSION_TOKENS.delete(token);
      return res.json({ authenticated: false });
    }

    res.json({ authenticated: true, username: session.username });
  });

  // Clear Session
  app.post("/api/admin/logout", (req, res) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      SESSION_TOKENS.delete(token);
    }
    res.json({ success: true });
  });

  // Change Credentials from Admin panel
  app.post("/api/admin/credentials", authenticateToken, (req, res) => {
    const { newUsername, newPassword } = req.body;

    if (!newUsername || !newPassword) {
      return res.status(400).json({ error: "Username and password cannot be empty." });
    }

    if (newPassword.trim().length < 8) {
      return res.status(400).json({ error: "Security Policy Violation: Password must be at least 8 characters long." });
    }

    const db = readDB();
    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = crypto.pbkdf2Sync(newPassword, salt, 1000, 64, "sha512").toString("hex");

    db.credentials = {
      username: newUsername.trim(),
      passwordHash,
      salt
    };

    writeDB(db);
    res.json({ success: true, message: "Credentials updated successfully." });
  });

  // --- SECURE CRUD API OPERATIONS ---

  // Projects CRUD
  app.post("/api/admin/projects", authenticateToken, (req, res) => {
    const db = readDB();
    const { projects } = req.body;
    if (!Array.isArray(projects)) {
      return res.status(400).json({ error: "Invalid projects payload." });
    }
    db.projects = projects;
    writeDB(db);
    res.json({ success: true, projects: db.projects });
  });

  // Video Reels CRUD
  app.post("/api/admin/reels", authenticateToken, (req, res) => {
    const db = readDB();
    const { videoReels } = req.body;
    if (!Array.isArray(videoReels)) {
      return res.status(400).json({ error: "Invalid videoReels payload." });
    }
    db.videoReels = videoReels;
    writeDB(db);
    res.json({ success: true, videoReels: db.videoReels });
  });

  // Videos CRUD
  app.post("/api/admin/videos", authenticateToken, (req, res) => {
    const db = readDB();
    const { videos } = req.body;
    if (!Array.isArray(videos)) {
      return res.status(400).json({ error: "Invalid videos payload." });
    }
    db.videos = videos;
    writeDB(db);
    res.json({ success: true, videos: db.videos });
  });

  // Video Cards CRUD
  app.post("/api/admin/video-cards", authenticateToken, (req, res) => {
    const db = readDB();
    const { videoCards } = req.body;
    if (!Array.isArray(videoCards)) {
      return res.status(400).json({ error: "Invalid videoCards payload." });
    }
    db.videoCards = videoCards;
    writeDB(db);
    res.json({ success: true, videoCards: db.videoCards });
  });

  // Experiences CRUD
  app.post("/api/admin/experiences", authenticateToken, (req, res) => {
    const db = readDB();
    const { experiences } = req.body;
    if (!Array.isArray(experiences)) {
      return res.status(400).json({ error: "Invalid experiences payload." });
    }
    db.experiences = experiences;
    writeDB(db);
    res.json({ success: true, experiences: db.experiences });
  });

  // --- VISITOR & CONTACT FORM SUBMISSIONS TRACKING ---
  app.post("/api/visitors/log", (req, res) => {
    try {
      const { path, referrer, screenSize } = req.body;
      const db = readDB();
      const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "Unknown IP") as string;
      const userAgent = (req.headers["user-agent"] || "Unknown User Agent") as string;
      
      const newLog = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toISOString(),
        ip,
        userAgent,
        path: path || "/",
        referrer: referrer || "",
        screenSize: screenSize || "Unknown"
      };

      db.visitors = db.visitors || [];
      db.visitors.unshift(newLog); // Prepend
      if (db.visitors.length > 1000) {
        db.visitors = db.visitors.slice(0, 1000);
      }
      writeDB(db);
      res.json({ success: true });
    } catch (err) {
      console.error("Failed to log visitor:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/submissions/log", (req, res) => {
    try {
      const { name, email, subject, message } = req.body;
      if (!name || !email || !message) {
        return res.status(400).json({ error: "Name, email and message are required." });
      }

      const db = readDB();
      const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "Unknown IP") as string;
      const userAgent = (req.headers["user-agent"] || "Unknown User Agent") as string;

      const newSubmission = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toISOString(),
        name,
        email,
        subject: subject || "No Subject",
        message,
        ip,
        userAgent
      };

      db.submissions = db.submissions || [];
      db.submissions.unshift(newSubmission); // Prepend
      writeDB(db);
      res.json({ success: true, submission: newSubmission });
    } catch (err) {
      console.error("Failed to save submission:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/reports", authenticateToken, (req, res) => {
    try {
      const db = readDB();
      res.json({
        visitors: db.visitors || [],
        submissions: db.submissions || []
      });
    } catch (err) {
      console.error("Failed to retrieve reports:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/reports/delete", authenticateToken, (req, res) => {
    try {
      const { type, id } = req.body;
      if (!type || !id) {
        return res.status(400).json({ error: "Type and ID are required." });
      }

      const db = readDB();
      if (type === "visitor") {
        db.visitors = (db.visitors || []).filter((v: any) => v.id !== id);
      } else if (type === "submission") {
        db.submissions = (db.submissions || []).filter((s: any) => s.id !== id);
      } else {
        return res.status(400).json({ error: "Invalid report type." });
      }

      writeDB(db);
      res.json({ success: true });
    } catch (err) {
      console.error("Failed to delete report item:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Profile Details & General Management
  app.post("/api/admin/profile", authenticateToken, (req, res) => {
    const db = readDB();
    const { profile } = req.body;
    if (!profile) {
      return res.status(400).json({ error: "Profile details are empty." });
    }
    db.profile = {
      ...db.profile,
      ...profile
    };
    writeDB(db);
    res.json({ success: true, profile: db.profile });
  });

  // Full Database Seed / Restore Operations
  app.post("/api/admin/restore", authenticateToken, (req, res) => {
    const { payload } = req.body;
    if (!payload || typeof payload !== "object") {
      return res.status(400).json({ error: "Invalid backup payload." });
    }

    const db = readDB();
    
    // Maintain existing credentials when restoring data content
    db.projects = payload.projects || db.projects;
    db.videoReels = payload.videoReels || db.videoReels;
    db.experiences = payload.experiences || db.experiences;
    db.videos = payload.videos || db.videos;
    db.videoCards = payload.videoCards || db.videoCards;
    db.profile = payload.profile ? { ...db.profile, ...payload.profile } : db.profile;

    writeDB(db);
    res.json({ success: true, message: "Backup restored successfully." });
  });

  // --- VITE DEV SERVER OR STATIC SERVING ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[FULL-STACK] Server running on http://localhost:${PORT}`);
  });
}

startServer();
