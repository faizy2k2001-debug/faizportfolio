import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  Project, 
  VideoReel, 
  Experience, 
  VideoItem, 
  VideoCardItem, 
  ProfileDetails 
} from "../types";
import { PROJECTS, VIDEO_REELS, EXPERIENCES } from "../data";
import portfolioDb from "../portfolio_db.json";

export const DEFAULT_PROFILE: ProfileDetails = {
  name: "Faiz khan",
  role: "Lead UI/UX & Motion Designer",
  aboutPhilosophy: "Crafting tactile digital products & spatial motion experiences.",
  aboutBioParagraphs: [
    "Hi, I'm Faiz Khan. I design high-fidelity digital products, interactive design systems, and spatial motion experiences that live at the precise intersection of mathematical layout, typography rigor, and visual craft.",
    "Over the past 6+ years, I've led UI/UX design, motion direction, and visual brand identities for ambitious startups, luxury brands, and digital agencies. I believe typography carries the soul of a layout, while motion, lighting, and 3D depth provide its pulse.",
    "My process combines Figma design token systems, Motion.page keyframe choreography, Spline 3D spatial scenes, and interactive prototypes—delivering memorable visual craft that scales seamlessly across all devices."
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

interface PortfolioContextType {
  projects: Project[];
  videoReels: VideoReel[];
  experiences: Experience[];
  videos: VideoItem[];
  videoCards: VideoCardItem[];
  profile: ProfileDetails;
  isAuthenticated: boolean;
  adminUsername: string | null;
  isLoading: boolean;
  
  // Auth actions
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  changeCredentials: (newUsername: string, newPassword: string) => Promise<void>;
  
  // CRUD actions (All synchronized to Express backend)
  setProjectsList: (projs: Project[]) => Promise<void>;
  addProject: (project: Omit<Project, "id">) => Promise<void>;
  updateProject: (id: string, project: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  
  setVideoReelsList: (reels: VideoReel[]) => Promise<void>;
  addVideoReel: (reel: Omit<VideoReel, "id">) => Promise<void>;
  updateVideoReel: (id: string, reel: Partial<VideoReel>) => Promise<void>;
  deleteVideoReel: (id: string) => Promise<void>;
  
  setVideosList: (vids: VideoItem[]) => Promise<void>;
  addVideo: (video: Omit<VideoItem, "id">) => Promise<void>;
  updateVideo: (id: string, video: Partial<VideoItem>) => Promise<void>;
  deleteVideo: (id: string) => Promise<void>;

  setVideoCardsList: (cards: VideoCardItem[]) => Promise<void>;
  addVideoCard: (card: Omit<VideoCardItem, "id">) => Promise<void>;
  updateVideoCard: (id: string, card: Partial<VideoCardItem>) => Promise<void>;
  deleteVideoCard: (id: string) => Promise<void>;

  setExperiencesList: (exps: Experience[]) => Promise<void>;
  addExperience: (experience: Omit<Experience, "id">) => Promise<void>;
  updateExperience: (id: string, exp: Partial<Experience>) => Promise<void>;
  deleteExperience: (id: string) => Promise<void>;
  
  updateProfile: (newProfile: Partial<ProfileDetails>) => Promise<void>;
  restoreBackup: (payload: any) => Promise<void>;
  resetAllData: () => Promise<void>;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [videoReels, setVideoReels] = useState<VideoReel[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [videoCards, setVideoCards] = useState<VideoCardItem[]>([]);
  const [profile, setProfile] = useState<ProfileDetails>(DEFAULT_PROFILE);
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUsername, setAdminUsername] = useState<string | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to retrieve auth header
  const getAuthHeaders = () => {
    const token = adminToken || localStorage.getItem("portfolio_admin_token");
    return token ? { "Authorization": `Bearer ${token}` } : {};
  };

  // 1. Initial Load of Portfolio data from Express backend API
  useEffect(() => {
    async function loadPortfolioData() {
      try {
        const response = await fetch("/api/portfolio");
        if (response.ok) {
          const data = await response.json();
          setProjects(data.projects || []);
          setVideoReels(data.videoReels || []);
          setExperiences(data.experiences || []);
          setVideos(data.videos || []);
          setVideoCards(data.videoCards || []);
          setProfile({
            ...DEFAULT_PROFILE,
            ...(data.profile || {})
          });
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn("API load failed (likely static host like Vercel). Using static default fallback data.");
      }

      // Fallback for Vercel / static deployments where Express backend is absent
      const fallback = (portfolioDb as any) || {};
      setProjects(fallback.projects && fallback.projects.length > 0 ? fallback.projects : PROJECTS);
      setVideoReels(fallback.videoReels && fallback.videoReels.length > 0 ? fallback.videoReels : VIDEO_REELS);
      setExperiences(fallback.experiences && fallback.experiences.length > 0 ? fallback.experiences : EXPERIENCES);
      setVideos(fallback.videos || []);
      setVideoCards(fallback.videoCards || []);
      setProfile({
        ...DEFAULT_PROFILE,
        ...(fallback.profile || {})
      });
      setIsLoading(false);
    }
    loadPortfolioData();
  }, []);

  // 2. Validate current session on startup
  useEffect(() => {
    async function checkSession() {
      const savedToken = localStorage.getItem("portfolio_admin_token");
      if (!savedToken) return;

      try {
        const res = await fetch("/api/admin/check-session", {
          headers: { "Authorization": `Bearer ${savedToken}` }
        });
        const data = await res.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
          setAdminUsername(data.username);
          setAdminToken(savedToken);
        } else {
          // Token expired or invalid
          localStorage.removeItem("portfolio_admin_token");
        }
      } catch (err) {
        console.error("Session verification failed:", err);
      }
    }
    checkSession();
  }, []);

  // Sync primary accent color and font family to CSS Variables
  useEffect(() => {
    const ACCENT_COLORS = {
      blue: "#0071e3",
      violet: "#a855f7",
      emerald: "#10b981",
      amber: "#f59e0b",
      rose: "#f43f5e",
      cyan: "#06b6d4"
    };
    // Direct HEX code or standard palette fallback
    const colorHex = ACCENT_COLORS[profile.accentColor as keyof typeof ACCENT_COLORS] || profile.accentColor || "#0071e3";
    document.documentElement.style.setProperty('--color-primary', colorHex);
  }, [profile.accentColor]);

  useEffect(() => {
    const fonts = {
      sans: '"Inter", sans-serif',
      serif: '"Playfair Display", serif',
      grotesk: '"Space Grotesk", sans-serif',
      mono: '"JetBrains Mono", monospace'
    };
    const fontVal = fonts[profile.fontFamily as keyof typeof fonts] || fonts.sans;
    document.documentElement.style.setProperty('--font-sans', fontVal);
    document.documentElement.style.setProperty('--font-display', fontVal);
  }, [profile.fontFamily]);

  // Helper: Synchronize state updates to server
  const syncData = async (endpoint: string, updatedList: any) => {
    try {
      const headers = {
        "Content-Type": "application/json",
        ...getAuthHeaders()
      };
      
      const res = await fetch(`/api/admin/${endpoint}`, {
        method: "POST",
        headers,
        body: JSON.stringify({ [endpoint]: updatedList })
      });

      if (!res.ok) {
        throw new Error(`Sync failed for endpoint: ${endpoint}`);
      }
    } catch (err) {
      console.error("Sync error:", err);
    }
  };

  // --- AUTHENTICATION ACTIONS ---
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      if (res.ok) {
        const data = await res.json();
        setIsAuthenticated(true);
        setAdminUsername(data.username);
        setAdminToken(data.token);
        localStorage.setItem("portfolio_admin_token", data.token);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Login request failed:", err);
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        headers: getAuthHeaders()
      });
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      setIsAuthenticated(false);
      setAdminUsername(null);
      setAdminToken(null);
      localStorage.removeItem("portfolio_admin_token");
    }
  };

  const changeCredentials = async (newUsername: string, newPassword: string) => {
    const res = await fetch("/api/admin/credentials", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders()
      },
      body: JSON.stringify({ newUsername, newPassword })
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to update credentials.");
    }
  };

  // --- CRUD CASE STUDIES (PROJECTS) ---
  const setProjectsList = async (projs: Project[]) => {
    setProjects(projs);
    await syncData("projects", projs);
  };

  const addProject = async (project: Omit<Project, "id">) => {
    const newProj: Project = { ...project, id: `project-${Date.now()}` };
    const updated = [newProj, ...projects];
    setProjects(updated);
    await syncData("projects", updated);
  };

  const updateProject = async (id: string, updatedFields: Partial<Project>) => {
    const updated = projects.map((p) => (p.id === id ? { ...p, ...updatedFields } : p));
    setProjects(updated);
    await syncData("projects", updated);
  };

  const deleteProject = async (id: string) => {
    const updated = projects.filter((p) => p.id !== id);
    setProjects(updated);
    await syncData("projects", updated);
  };

  // --- CRUD REELS ---
  const setVideoReelsList = async (reels: VideoReel[]) => {
    setVideoReels(reels);
    await syncData("reels", reels);
  };

  const addVideoReel = async (reel: Omit<VideoReel, "id">) => {
    const newReel: VideoReel = { ...reel, id: `reel-${Date.now()}` };
    const updated = [...videoReels, newReel];
    setVideoReels(updated);
    await syncData("reels", updated);
  };

  const updateVideoReel = async (id: string, updatedFields: Partial<VideoReel>) => {
    const updated = videoReels.map((r) => (r.id === id ? { ...r, ...updatedFields } : r));
    setVideoReels(updated);
    await syncData("reels", updated);
  };

  const deleteVideoReel = async (id: string) => {
    const updated = videoReels.filter((r) => r.id !== id);
    setVideoReels(updated);
    await syncData("reels", updated);
  };

  // --- CRUD VIDEOS ---
  const setVideosList = async (vids: VideoItem[]) => {
    setVideos(vids);
    await syncData("videos", vids);
  };

  const addVideo = async (video: Omit<VideoItem, "id">) => {
    const newVid: VideoItem = { ...video, id: `vid-${Date.now()}` };
    const updated = [...videos, newVid];
    setVideos(updated);
    await syncData("videos", updated);
  };

  const updateVideo = async (id: string, updatedFields: Partial<VideoItem>) => {
    const updated = videos.map((v) => (v.id === id ? { ...v, ...updatedFields } : v));
    setVideos(updated);
    await syncData("videos", updated);
  };

  const deleteVideo = async (id: string) => {
    const updated = videos.filter((v) => v.id !== id);
    setVideos(updated);
    await syncData("videos", updated);
  };

  // --- CRUD VIDEO CARDS ---
  const setVideoCardsList = async (cards: VideoCardItem[]) => {
    setVideoCards(cards);
    await syncData("video-cards", cards);
  };

  const addVideoCard = async (card: Omit<VideoCardItem, "id">) => {
    const newCard: VideoCardItem = { ...card, id: `card-${Date.now()}` };
    const updated = [...videoCards, newCard];
    setVideoCards(updated);
    await syncData("video-cards", updated);
  };

  const updateVideoCard = async (id: string, updatedFields: Partial<VideoCardItem>) => {
    const updated = videoCards.map((c) => (c.id === id ? { ...c, ...updatedFields } : c));
    setVideoCards(updated);
    await syncData("video-cards", updated);
  };

  const deleteVideoCard = async (id: string) => {
    const updated = videoCards.filter((c) => c.id !== id);
    setVideoCards(updated);
    await syncData("video-cards", updated);
  };

  // --- CRUD TIMELINE (EXPERIENCES) ---
  const setExperiencesList = async (exps: Experience[]) => {
    setExperiences(exps);
    await syncData("experiences", exps);
  };

  const addExperience = async (exp: Omit<Experience, "id">) => {
    const newExp: Experience = { ...exp, id: `exp-${Date.now()}` };
    const updated = [newExp, ...experiences];
    setExperiences(updated);
    await syncData("experiences", updated);
  };

  const updateExperience = async (id: string, updatedFields: Partial<Experience>) => {
    const updated = experiences.map((e) => (e.id === id ? { ...e, ...updatedFields } : e));
    setExperiences(updated);
    await syncData("experiences", updated);
  };

  const deleteExperience = async (id: string) => {
    const updated = experiences.filter((e) => e.id !== id);
    setExperiences(updated);
    await syncData("experiences", updated);
  };

  // --- PROFILE UPDATE ---
  const updateProfile = async (newProfileFields: Partial<ProfileDetails>) => {
    const updated = { ...profile, ...newProfileFields };
    setProfile(updated);

    try {
      const res = await fetch("/api/admin/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders()
        },
        body: JSON.stringify({ profile: updated })
      });
      if (!res.ok) {
        throw new Error("Failed to save profile to Express server.");
      }
    } catch (err) {
      console.error("Profile sync failure:", err);
    }
  };

  // --- DATA RESTORE / BACKUPS ---
  const restoreBackup = async (payload: any) => {
    try {
      const res = await fetch("/api/admin/restore", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders()
        },
        body: JSON.stringify({ payload })
      });

      if (res.ok) {
        // Reload page to re-fetch from seed
        window.location.reload();
      } else {
        const error = await res.json();
        throw new Error(error.error || "Restore process failed.");
      }
    } catch (err) {
      console.error("Restore request failed:", err);
      throw err;
    }
  };

  // --- RESET ALL DATA ---
  const resetAllData = async () => {
    if (window.confirm("Are you sure you want to restore the default seeded portfolio records?")) {
      const mockBackup = {
        projects: [],
        videoReels: [],
        experiences: [],
        videos: [],
        videoCards: [],
        profile: DEFAULT_PROFILE
      };
      await restoreBackup(mockBackup);
    }
  };

  return (
    <PortfolioContext.Provider
      value={{
        projects,
        videoReels,
        experiences,
        videos,
        videoCards,
        profile,
        isAuthenticated,
        adminUsername,
        isLoading,
        
        login,
        logout,
        changeCredentials,
        
        setProjectsList,
        addProject,
        updateProject,
        deleteProject,
        
        setVideoReelsList,
        addVideoReel,
        updateVideoReel,
        deleteVideoReel,
        
        setVideosList,
        addVideo,
        updateVideo,
        deleteVideo,

        setVideoCardsList,
        addVideoCard,
        updateVideoCard,
        deleteVideoCard,

        setExperiencesList,
        addExperience,
        updateExperience,
        deleteExperience,
        
        updateProfile,
        restoreBackup,
        resetAllData
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error("usePortfolio must be used within a PortfolioProvider");
  }
  return context;
}
