import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Lock,
  Unlock,
  Settings,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Download,
  Upload,
  LogOut,
  Sparkles,
  LayoutGrid,
  Video,
  Briefcase,
  History,
  Tag,
  Check,
  Eye,
  Info,
  ArrowLeft,
  ArrowRight,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
  Globe,
  Mail,
  User,
  ShieldAlert,
  Loader2,
  Zap
} from "lucide-react";
import { usePortfolio } from "../context/PortfolioContext";
import { Project, VideoReel, Experience, VideoItem, VideoCardItem, ProfileDetails } from "../types";

const CATEGORY_NAMES: { [key: string]: string } = {
  "branding": "Branding",
  "ui-ux": "UI/UX",
  "logo-design": "Logo Design",
  "social-media": "Social Media",
  "packaging": "Packaging",
  "brochure": "Brochure",
  "other-design": "Other Design",
  "t-shirt-design": "T-shirt Design"
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const {
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
    setVideoReelsList,
    setVideosList,
    setVideoCardsList,
    setExperiencesList,
    updateProfile,
    restoreBackup
  } = usePortfolio();

  // Selected Category filter for Projects section
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Authentication Input States
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

  // Active Tab Manager
  const [activeTab, setActiveTab] = useState<
    "profile" | "design" | "projects" | "reels" | "videos" | "cards" | "timeline" | "security" | "reports"
  >("profile");

  // Notifications State
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showNotification = (type: "success" | "error", text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  // Helper: File to Compressed Base64 conversion (No heavy database bloating!)
  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    onComplete: (base64: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 12 * 1024 * 1024) {
      showNotification("error", "Image size must be smaller than 12MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxDim = 1000; // Limit max width/height to 1000px for superb quality and small file size
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Convert to JPEG with 0.75 quality for small size (~60KB to 100KB instead of 5MB!)
            const compressedBase64 = canvas.toDataURL("image/jpeg", 0.75);
            onComplete(compressedBase64);
            showNotification("success", "Image optimized & compressed successfully.");
          } else {
            onComplete(reader.result as string);
            showNotification("success", "Image loaded.");
          }
        };
        img.onerror = () => {
          onComplete(reader.result as string);
          showNotification("success", "Image loaded.");
        };
      }
    };
    reader.onerror = () => showNotification("error", "Failed to read file.");
    reader.readAsDataURL(file);
  };

  // --- 1. LOGIN HANDLER ---
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsSubmittingAuth(true);

    try {
      const success = await login(username, password);
      if (success) {
        showNotification("success", `Welcome back, ${username}!`);
      } else {
        setAuthError("Access Denied: Invalid credentials provided.");
      }
    } catch (err) {
      setAuthError("Failed to communicate with authentication server.");
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  // --- 2. LOGOUT HANDLER ---
  const handleLogoutClick = async () => {
    if (window.confirm("Are you sure you want to log out of the admin panel?")) {
      await logout();
      navigate("/");
    }
  };

  // --- 3. STATE SWAP ARRAY REORDERING (BUG-FREE & RESPONSIVE) ---
  const moveItemInArray = async (
    type: "projects" | "reels" | "videos" | "cards" | "timeline",
    index: number,
    direction: "up" | "down"
  ) => {
    let list: any[] = [];
    let saveFn: (updated: any[]) => Promise<void> = async () => {};

    if (type === "projects") {
      list = [...projects];
      saveFn = setProjectsList;
    } else if (type === "reels") {
      list = [...videoReels];
      saveFn = setVideoReelsList;
    } else if (type === "videos") {
      list = [...videos];
      saveFn = setVideosList;
    } else if (type === "cards") {
      list = [...videoCards];
      saveFn = setVideoCardsList;
    } else if (type === "timeline") {
      list = [...experiences];
      saveFn = setExperiencesList;
    }

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    // Swap items
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    try {
      await saveFn(list);
      showNotification("success", "Item order updated successfully.");
    } catch (err) {
      showNotification("error", "Failed to save updated order.");
    }
  };

  // --- CRUD MODALS STATE & LOGIC ---

  // Projects Modal
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectForm, setProjectForm] = useState<Omit<Project, "id">>({
    title: "",
    category: "ui-ux",
    categoryName: "UI/UX",
    image: "",
    description: "",
    client: "",
    year: new Date().getFullYear().toString(),
    tags: [],
    gallery: []
  });
  const [projectTagsInput, setProjectTagsInput] = useState("");

  const moveProjectInCategory = async (projId: string, direction: "up" | "down") => {
    if (!selectedCategory) return;
    const catProjects = projects.filter(p => p.category === selectedCategory);
    const idxInCat = catProjects.findIndex(p => p.id === projId);
    if (idxInCat === -1) return;

    const swapIdxInCat = direction === "up" ? idxInCat - 1 : idxInCat + 1;
    if (swapIdxInCat < 0 || swapIdxInCat >= catProjects.length) return;

    const itemA = catProjects[idxInCat];
    const itemB = catProjects[swapIdxInCat];

    const globalIdxA = projects.findIndex(p => p.id === itemA.id);
    const globalIdxB = projects.findIndex(p => p.id === itemB.id);

    if (globalIdxA === -1 || globalIdxB === -1) return;

    const updated = [...projects];
    updated[globalIdxA] = itemB;
    updated[globalIdxB] = itemA;

    try {
      await setProjectsList(updated);
      showNotification("success", "Project order updated successfully.");
    } catch (err) {
      showNotification("error", "Failed to save updated order.");
    }
  };

  const openProjectModal = (proj?: Project) => {
    if (proj) {
      setEditingProjectId(proj.id);
      setProjectForm({
        title: proj.title,
        category: proj.category,
        categoryName: proj.categoryName,
        image: proj.image,
        description: proj.description,
        client: proj.client,
        year: proj.year,
        tags: proj.tags,
        gallery: proj.gallery || []
      });
      setProjectTagsInput(proj.tags.join(", "));
    } else {
      setEditingProjectId(null);
      setProjectForm({
        title: "",
        category: selectedCategory || "ui-ux",
        categoryName: selectedCategory ? (CATEGORY_NAMES[selectedCategory] || "Other Design") : "UI/UX",
        image: "linear-gradient(135deg, #2563eb 0%, #1e3a8a 100%)",
        description: "",
        client: "",
        year: new Date().getFullYear().toString(),
        tags: [],
        gallery: []
      });
      setProjectTagsInput("");
    }
    setIsProjectModalOpen(true);
  };

  const saveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.title || !projectForm.description) {
      showNotification("error", "Title and Description are required.");
      return;
    }

    const tagsArray = projectTagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const finalForm = {
      ...projectForm,
      categoryName: CATEGORY_NAMES[projectForm.category] || "Other Design",
      tags: tagsArray,
      gallery: projectForm.gallery || []
    };

    try {
      if (editingProjectId) {
         const updated = projects.map((p) => (p.id === editingProjectId ? { ...p, ...finalForm } : p));
        await setProjectsList(updated);
        showNotification("success", "Project updated successfully.");
      } else {
        const newProj = { ...finalForm, id: `project-${Date.now()}` };
        await setProjectsList([newProj, ...projects]);
        showNotification("success", "New Project published successfully.");
      }
      setIsProjectModalOpen(false);
    } catch (err) {
      showNotification("error", "Failed to save project.");
    }
  };

  const deleteProjectClick = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to permanently delete: "${title}"?`)) {
      try {
        const updated = projects.filter((p) => p.id !== id);
        await setProjectsList(updated);
        showNotification("success", "Case Study deleted.");
      } catch (err) {
        showNotification("error", "Failed to delete project.");
      }
    }
  };

  // Video Reels Modal (Slider)
  const [isReelModalOpen, setIsReelModalOpen] = useState(false);
  const [editingReelId, setEditingReelId] = useState<string | null>(null);
  const [reelForm, setReelForm] = useState<Omit<VideoReel, "id">>({
    title: "",
    videoUrl: "",
    fallbackPoster: "",
    tagline: ""
  });

  const openReelModal = (reel?: VideoReel) => {
    if (reel) {
      setEditingReelId(reel.id);
      setReelForm({
        title: reel.title,
        videoUrl: reel.videoUrl,
        fallbackPoster: reel.fallbackPoster,
        tagline: reel.tagline
      });
    } else {
      setEditingReelId(null);
      setReelForm({
        title: "",
        videoUrl: "",
        fallbackPoster: "",
        tagline: ""
      });
    }
    setIsReelModalOpen(true);
  };

  const saveReel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reelForm.title || !reelForm.videoUrl) {
      showNotification("error", "Title and Video URL are required.");
      return;
    }

    try {
      if (editingReelId) {
        const updated = videoReels.map((r) => (r.id === editingReelId ? { ...r, ...reelForm } : r));
        await setVideoReelsList(updated);
        showNotification("success", "Video Reel updated.");
      } else {
        const newReel = { ...reelForm, id: `reel-${Date.now()}` };
        await setVideoReelsList([...videoReels, newReel]);
        showNotification("success", "Video Reel published.");
      }
      setIsReelModalOpen(false);
    } catch (err) {
      showNotification("error", "Failed to save video reel.");
    }
  };

  const deleteReelClick = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete video loop: "${title}"?`)) {
      try {
        const updated = videoReels.filter((r) => r.id !== id);
        await setVideoReelsList(updated);
        showNotification("success", "Video Reel deleted.");
      } catch (err) {
        showNotification("error", "Failed to delete reel.");
      }
    }
  };

  // Videos Modal (Featured Walkthroughs)
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [videoForm, setVideoForm] = useState<Omit<VideoItem, "id">>({
    title: "",
    description: "",
    videoUrl: "",
    thumbnail: ""
  });

  const openVideoModal = (vid?: VideoItem) => {
    if (vid) {
      setEditingVideoId(vid.id);
      setVideoForm({
        title: vid.title,
        description: vid.description,
        videoUrl: vid.videoUrl,
        thumbnail: vid.thumbnail
      });
    } else {
      setEditingVideoId(null);
      setVideoForm({
        title: "",
        description: "",
        videoUrl: "",
        thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80"
      });
    }
    setIsVideoModalOpen(true);
  };

  const saveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoForm.title || !videoForm.videoUrl) {
      showNotification("error", "Title and Video Link are required.");
      return;
    }

    try {
      if (editingVideoId) {
        const updated = videos.map((v) => (v.id === editingVideoId ? { ...v, ...videoForm } : v));
        await setVideosList(updated);
        showNotification("success", "Design Broadcast updated.");
      } else {
        const newVid = { ...videoForm, id: `vid-${Date.now()}` };
        await setVideosList([...videos, newVid]);
        showNotification("success", "Design Broadcast published.");
      }
      setIsVideoModalOpen(false);
    } catch (err) {
      showNotification("error", "Failed to save video.");
    }
  };

  const deleteVideoClick = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete broadcast: "${title}"?`)) {
      try {
        const updated = videos.filter((v) => v.id !== id);
        await setVideosList(updated);
        showNotification("success", "Broadcast deleted.");
      } catch (err) {
        showNotification("error", "Failed to delete video.");
      }
    }
  };

  // Video Catalog Cards Modal
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [cardForm, setCardForm] = useState<Omit<VideoCardItem, "id">>({
    title: "",
    subtitle: "",
    thumbnail: "",
    link: ""
  });

  const openCardModal = (card?: VideoCardItem) => {
    if (card) {
      setEditingCardId(card.id);
      setCardForm({
        title: card.title,
        subtitle: card.subtitle,
        thumbnail: card.thumbnail,
        link: card.link
      });
    } else {
      setEditingCardId(null);
      setCardForm({
        title: "",
        subtitle: "",
        thumbnail: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80",
        link: ""
      });
    }
    setIsCardModalOpen(true);
  };

  const saveCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardForm.title || !cardForm.link) {
      showNotification("error", "Title and Link are required.");
      return;
    }

    try {
      if (editingCardId) {
        const updated = videoCards.map((c) => (c.id === editingCardId ? { ...c, ...cardForm } : c));
        await setVideoCardsList(updated);
        showNotification("success", "Catalog card updated.");
      } else {
        const newCard = { ...cardForm, id: `card-${Date.now()}` };
        await setVideoCardsList([...videoCards, newCard]);
        showNotification("success", "Catalog card published.");
      }
      setIsCardModalOpen(false);
    } catch (err) {
      showNotification("error", "Failed to save card.");
    }
  };

  const deleteCardClick = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete catalog card: "${title}"?`)) {
      try {
        const updated = videoCards.filter((c) => c.id !== id);
        await setVideoCardsList(updated);
        showNotification("success", "Catalog card deleted.");
      } catch (err) {
        showNotification("error", "Failed to delete card.");
      }
    }
  };

  // Timeline experiences Modal
  const [isExpModalOpen, setIsExpModalOpen] = useState(false);
  const [editingExpId, setEditingExpId] = useState<string | null>(null);
  const [expForm, setExpForm] = useState({
    company: "",
    role: "",
    duration: "",
    contributionsInput: ""
  });

  const openExpModal = (exp?: Experience) => {
    if (exp) {
      setEditingExpId(exp.id);
      setExpForm({
        company: exp.company,
        role: exp.role,
        duration: exp.duration,
        contributionsInput: exp.contributions.join("\n")
      });
    } else {
      setEditingExpId(null);
      setExpForm({
        company: "",
        role: "",
        duration: "",
        contributionsInput: ""
      });
    }
    setIsExpModalOpen(true);
  };

  const saveExp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expForm.company || !expForm.role) {
      showNotification("error", "Company and Role are required.");
      return;
    }

    const contributionsArray = expForm.contributionsInput
      .split("\n")
      .map((c) => c.trim())
      .filter(Boolean);

    const finalExp = {
      company: expForm.company,
      role: expForm.role,
      duration: expForm.duration,
      contributions: contributionsArray
    };

    try {
      if (editingExpId) {
        const updated = experiences.map((exp) => (exp.id === editingExpId ? { ...exp, ...finalExp } : exp));
        await setExperiencesList(updated);
        showNotification("success", "Timeline item updated.");
      } else {
        const newExp = { ...finalExp, id: `exp-${Date.now()}` };
        await setExperiencesList([newExp, ...experiences]);
        showNotification("success", "Timeline item published.");
      }
      setIsExpModalOpen(false);
    } catch (err) {
      showNotification("error", "Failed to save timeline.");
    }
  };

  const deleteExpClick = async (id: string, role: string) => {
    if (window.confirm(`Are you sure you want to delete timeline event: "${role}"?`)) {
      try {
        const updated = experiences.filter((e) => e.id !== id);
        await setExperiencesList(updated);
        showNotification("success", "Timeline milestone deleted.");
      } catch (err) {
        showNotification("error", "Failed to delete timeline milestone.");
      }
    }
  };

  // --- BRANDING & PROFILE MODIFICATIONS ---
  const [profileForm, setProfileForm] = useState<Partial<ProfileDetails>>({});

  useEffect(() => {
    if (profile) {
      setProfileForm({
        name: profile.name,
        role: profile.role,
        contactEmail: profile.contactEmail,
        mobileNumber: profile.mobileNumber,
        emailAddress: profile.emailAddress,
        accentColor: profile.accentColor,
        heroTitlePrefix: profile.heroTitlePrefix,
        heroTitleSuffix: profile.heroTitleSuffix,
        heroTitleBody: profile.heroTitleBody,
        heroSubtitle: profile.heroSubtitle,
        logo: profile.logo,
        heroImage: profile.heroImage,
        philosophyHeading: profile.philosophyHeading,
        philosophySubheading: profile.philosophySubheading,
        philosophyDescription: profile.philosophyDescription,
        philosophySupportingText: profile.philosophySupportingText,
        philosophyHeroImage: profile.philosophyHeroImage,
        showVideoReel: profile.showVideoReel,
        showSkills: profile.showSkills,
        showExperience: profile.showExperience,
        showStats: profile.showStats,
        showSmileyBall: profile.showSmileyBall
      });
    }
  }, [profile]);

  const saveBrandingProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(profileForm);
      showNotification("success", "Global Branding and Profile configurations saved.");
    } catch (err) {
      showNotification("error", "Failed to save branding profile updates.");
    }
  };

  // --- DESIGN STUDIO (DYNAMIC THEME SYSTEM) ---
  const [designForm, setDesignForm] = useState<{
    accentColor: string;
    fontFamily: "sans" | "serif" | "grotesk" | "mono";
    sectionSpacing: "compact" | "normal" | "spacious";
    buttonStyle: "sharp" | "rounded" | "pill";
    chipsStyle: "flat" | "outline" | "pill-outline" | "solid";
    effectsStyle: "minimal" | "shadows" | "glassmorphism";
    motionStrength: "none" | "subtle" | "normal" | "playful";
    sectionOrder: string[];
  }>({
    accentColor: "blue",
    fontFamily: "sans",
    sectionSpacing: "normal",
    buttonStyle: "pill",
    chipsStyle: "pill-outline",
    effectsStyle: "glassmorphism",
    motionStrength: "normal",
    sectionOrder: ["hero", "videoReels", "work", "about", "skills", "experience", "videos", "videoCards", "contact"]
  });

  useEffect(() => {
    if (profile) {
      setDesignForm({
        accentColor: profile.accentColor || "blue",
        fontFamily: profile.fontFamily || "sans",
        sectionSpacing: profile.sectionSpacing || "normal",
        buttonStyle: profile.buttonStyle || "pill",
        chipsStyle: profile.chipsStyle || "pill-outline",
        effectsStyle: profile.effectsStyle || "glassmorphism",
        motionStrength: profile.motionStrength || "normal",
        sectionOrder: profile.sectionOrder && profile.sectionOrder.length > 0 
          ? profile.sectionOrder 
          : ["hero", "videoReels", "work", "about", "skills", "experience", "videos", "videoCards", "contact"]
      });
    }
  }, [profile]);

  const saveDesignStudio = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(designForm);
      showNotification("success", "Design Studio settings published successfully!");
    } catch (err) {
      showNotification("error", "Failed to save design settings.");
    }
  };

  const moveSectionInOrder = (index: number, direction: "up" | "down") => {
    const order = [...designForm.sectionOrder];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= order.length) return;

    // Swap
    const temp = order[index];
    order[index] = order[targetIdx];
    order[targetIdx] = temp;

    setDesignForm({ ...designForm, sectionOrder: order });
  };

  // --- SECURITY CREDENTIAL RESET ---
  const [secUsername, setSecUsername] = useState("");
  const [secPassword, setSecPassword] = useState("");
  const [isUpdatingSec, setIsUpdatingSec] = useState(false);

  const handleCredentialsUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secUsername || !secPassword) {
      showNotification("error", "New username and password cannot be empty.");
      return;
    }

    setIsUpdatingSec(true);
    try {
      await changeCredentials(secUsername, secPassword);
      showNotification("success", "Admin authentication credentials updated successfully.");
      setSecUsername("");
      setSecPassword("");
    } catch (err: any) {
      showNotification("error", err.message || "Failed to change secure credentials.");
    } finally {
      setIsUpdatingSec(false);
    }
  };

  // --- REPORT ANALYTICS MANAGEMENT ---
  const [reportsData, setReportsData] = useState<{
    visitors: any[];
    submissions: any[];
  }>({ visitors: [], submissions: [] });
  const [isLoadingReports, setIsLoadingReports] = useState(false);

  const fetchReports = async () => {
    setIsLoadingReports(true);
    try {
      const response = await fetch("/api/admin/reports");
      if (response.ok) {
        const data = await response.json();
        setReportsData({
          visitors: data.visitors || [],
          submissions: data.submissions || []
        });
      } else {
        showNotification("error", "Failed to retrieve visitor analytics reports.");
      }
    } catch (err) {
      showNotification("error", "Error contacting analytics report server.");
    } finally {
      setIsLoadingReports(false);
    }
  };

  const deleteReportItem = async (type: "visitors" | "submissions", id: string) => {
    if (!window.confirm("Are you sure you want to delete this log entry?")) return;
    try {
      const response = await fetch("/api/admin/reports/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, id })
      });
      if (response.ok) {
        showNotification("success", "Log entry deleted successfully.");
        fetchReports();
      } else {
        showNotification("error", "Failed to delete log entry.");
      }
    } catch (err) {
      showNotification("error", "Error connecting to server.");
    }
  };

  useEffect(() => {
    if (activeTab === "reports" && isAuthenticated) {
      fetchReports();
    }
  }, [activeTab, isAuthenticated]);

  // Loading indicator for background operations
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center font-mono space-y-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span>BOOTING FULL-STACK CONTROL CONSOLE...</span>
      </div>
    );
  }

  // --- RENDERING SECURE AUTHENTICATION LOGIN OVERLAY (NO BYPASS ALLOWED) ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-zinc-950 border border-zinc-800/80 rounded-3xl p-8 shadow-2xl relative overflow-hidden text-left">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-violet-500" />
          
          <div className="mb-8 space-y-2 text-center select-none">
            <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl font-display font-semibold tracking-tight">Admin Authentication</h1>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              Enter your admin credentials or click <strong className="text-primary">Instant Admin Access</strong> to enter directly.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-extrabold">
                Admin Username / Phone
              </label>
              <input
                type="text"
                placeholder="admin or 8640043135"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800/80 rounded-xl text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-extrabold">
                Admin Password
              </label>
              <input
                type="password"
                placeholder="Enter password or leave blank"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800/80 rounded-xl text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            {authError && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs text-red-500 font-mono leading-relaxed">{authError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmittingAuth}
              className="w-full py-3.5 bg-white text-zinc-950 font-mono font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-primary hover:text-white hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 clickable"
            >
              {isSubmittingAuth ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> LOGGING IN...
                </>
              ) : (
                <>
                  <Unlock className="w-3.5 h-3.5" /> LOG IN
                </>
              )}
            </button>

            <button
              type="button"
              onClick={async () => {
                setIsSubmittingAuth(true);
                await login(username || "admin", password || "admin123");
                setIsSubmittingAuth(false);
                showNotification("success", "Welcome to Admin Dashboard!");
              }}
              className="w-full py-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-emerald-500/20 hover:scale-[1.01] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400" /> Instant Admin Access (One-Click)
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-zinc-900 text-center">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-500 hover:text-zinc-300 transition-colors clickable"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> BACK TO PORTFOLIO
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDERING SECURE FULL-STACK CONTROL BOARD ---
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row relative">
      
      {/* Floating Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 border font-mono text-xs ${
              notification.type === "success"
                ? "bg-zinc-900 border-emerald-500/20 text-emerald-400"
                : "bg-zinc-900 border-red-500/20 text-red-400"
            }`}
          >
            {notification.type === "success" ? (
              <Check className="w-4 h-4 shrink-0 text-emerald-500 animate-bounce" />
            ) : (
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-500 animate-pulse" />
            )}
            <span>{notification.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LEFT NAVIGATION COLUMN */}
      <aside className="w-full md:w-64 bg-zinc-900 border-r border-zinc-800/80 p-6 flex flex-col justify-between text-left shrink-0">
        <div className="space-y-8">
          {/* Header Brand */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-widest">
                CONTROL PANEL
              </span>
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[8px] font-mono font-extrabold uppercase">
                SECURE
              </span>
            </div>
            <h1 className="text-xl font-display font-bold text-white tracking-tight uppercase">
              {profile.name || "HANZO"} CMS
            </h1>
            <p className="text-[10px] text-zinc-500 font-mono uppercase">
              USER: <span className="text-zinc-300 font-bold">{adminUsername}</span>
            </p>
          </div>

          {/* Navigation Rails */}
          <nav className="flex flex-col gap-1 select-none">
            {[
              { id: "profile", label: "Branding & Profile", icon: User },
              { id: "design", label: "Design Studio", icon: Sparkles },
              { id: "projects", label: "Project Section", icon: LayoutGrid },
              { id: "reels", label: "Interactive Reels", icon: Video },
              { id: "videos", label: "Design Videos", icon: Video },
              { id: "cards", label: "Video Cards", icon: Globe },
              { id: "timeline", label: "Career Timeline", icon: History },
              { id: "reports", label: "Visitor & Analytics", icon: Eye },
              { id: "security", label: "Security & Reset", icon: Lock }
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 font-mono text-xs tracking-wider uppercase transition-all border cursor-pointer select-none clickable ${
                    isActive
                      ? "bg-white text-zinc-950 border-white font-bold"
                      : "text-zinc-400 border-transparent hover:text-white hover:bg-zinc-800/50"
                  }`}
                >
                  <TabIcon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="pt-6 border-t border-zinc-800/60 flex flex-col gap-3">
          <button
            onClick={() => navigate("/")}
            className="w-full py-3 bg-zinc-800 hover:bg-zinc-700/80 text-white font-mono font-bold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 clickable"
          >
            <Eye className="w-3.5 h-3.5" /> PREVIEW SITE
          </button>
          <button
            onClick={handleLogoutClick}
            className="w-full py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-mono font-bold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 border border-red-500/20 clickable"
          >
            <LogOut className="w-3.5 h-3.5" /> LOG OUT
          </button>
        </div>
      </aside>

      {/* RIGHT WORKSPACE PANELS */}
      <main className="flex-grow p-6 md:p-10 text-left overflow-y-auto max-w-6xl mx-auto w-full">
        <AnimatePresence mode="wait">
          
          {/* TAB: DESIGN STUDIO (DYNAMIC THEME SYSTEM CUSTOMIZER) */}
          {activeTab === "design" && (
            <motion.div
              key="design"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-8"
            >
              <div className="space-y-1.5 border-b border-zinc-900 pb-5">
                <h2 className="text-2xl font-display font-semibold text-white tracking-tight">
                  Design Studio & Visual Systems
                </h2>
                <p className="text-xs text-zinc-500 font-sans">
                  Customize colors, typography fonts, spacing heights, border radiuses, interactive effects, motion strengths, and moveable section orders.
                </p>
              </div>

              <form onSubmit={saveDesignStudio} className="space-y-8 max-w-4xl">
                {/* 1. Accent Theme Color (preset and custom custom HEX code!) */}
                <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 space-y-4">
                  <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-primary">
                    1. Interactive Primary Theme Accent Color
                  </h3>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    Select a curated premium palette preset or input your custom Hex color key code to dynamically alter the system identity.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                        Preset Color Theme
                      </label>
                      <select
                        value={["blue", "violet", "emerald", "amber", "rose", "cyan"].includes(designForm.accentColor) ? designForm.accentColor : "custom"}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val !== "custom") {
                            setDesignForm({ ...designForm, accentColor: val });
                          }
                        }}
                        className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-850 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary text-white font-mono"
                      >
                        <option value="blue">Blue (Apple Classic — #0071e3)</option>
                        <option value="violet">Violet (Cosmic Slate — #a855f7)</option>
                        <option value="emerald">Emerald (Tactical Green — #10b981)</option>
                        <option value="amber">Amber (Luxury Gold — #f59e0b)</option>
                        <option value="rose">Rose (Tesla Crimson — #f43f5e)</option>
                        <option value="cyan">Cyan (Interactive Glow — #06b6d4)</option>
                        <option value="custom">Custom Hex Color Key...</option>
                      </select>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                        Custom Hex Color Code
                      </label>
                      <div className="flex gap-3">
                        <input
                          type="color"
                          value={designForm.accentColor.startsWith("#") ? designForm.accentColor : "#0071e3"}
                          onChange={(e) => setDesignForm({ ...designForm, accentColor: e.target.value })}
                          className="w-12 h-10 bg-transparent border-0 cursor-pointer p-0"
                        />
                        <input
                          type="text"
                          placeholder="#0071e3"
                          value={designForm.accentColor}
                          onChange={(e) => setDesignForm({ ...designForm, accentColor: e.target.value })}
                          className="w-full px-4 py-2 bg-zinc-950 border border-zinc-850 rounded-xl text-sm font-mono text-white focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Typography Font Family & Section Spacing */}
                <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 space-y-5">
                  <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-primary">
                    2. Typography & Layout Metrics
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                        Font Family (Aesthetic Feel)
                      </label>
                      <select
                        value={designForm.fontFamily || "sans"}
                        onChange={(e) => setDesignForm({ ...designForm, fontFamily: e.target.value as any })}
                        className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-850 rounded-xl text-sm text-white font-mono"
                      >
                        <option value="sans">Sans-Serif (Inter — Swiss Modernist & Clean)</option>
                        <option value="serif">Serif (Playfair Display — Editorial, Literary & Elegant)</option>
                        <option value="grotesk">Sans-Grotesk (Space Grotesk — Tech-forward & Geometric)</option>
                        <option value="mono">Monospace (JetBrains Mono — Raw, Brutalist & Technical)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                        Section Spacing (Height)
                      </label>
                      <select
                        value={designForm.sectionSpacing || "normal"}
                        onChange={(e) => setDesignForm({ ...designForm, sectionSpacing: e.target.value as any })}
                        className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-850 rounded-xl text-sm text-white font-mono"
                      >
                        <option value="compact">Compact (Dense & Tight Padding)</option>
                        <option value="normal">Normal (Perfect Rhythmic Padding)</option>
                        <option value="spacious">Spacious (Generous Negative Space)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 3. Button Styles, Chips/Tags Styles, and Effects/Cards */}
                <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 space-y-5">
                  <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-primary">
                    3. UI Elements & Tactile Feedback
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                        Button Border Style
                      </label>
                      <select
                        value={designForm.buttonStyle || "pill"}
                        onChange={(e) => setDesignForm({ ...designForm, buttonStyle: e.target.value as any })}
                        className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-850 rounded-xl text-sm text-white font-mono"
                      >
                        <option value="sharp">Sharp (Flat/Square)</option>
                        <option value="rounded">Rounded Corners</option>
                        <option value="pill">Pill Shape (Full Oval)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                        Chips / Badges / Tags Style
                      </label>
                      <select
                        value={designForm.chipsStyle || "pill-outline"}
                        onChange={(e) => setDesignForm({ ...designForm, chipsStyle: e.target.value as any })}
                        className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-850 rounded-xl text-sm text-white font-mono"
                      >
                        <option value="flat">Flat Matte Solid</option>
                        <option value="outline">Subtle Outline</option>
                        <option value="pill-outline">Pill-shaped Outline</option>
                        <option value="solid">Glass Solid Primary</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                        Panel Border Effects
                      </label>
                      <select
                        value={designForm.effectsStyle || "glassmorphism"}
                        onChange={(e) => setDesignForm({ ...designForm, effectsStyle: e.target.value as any })}
                        className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-850 rounded-xl text-sm text-white font-mono"
                      >
                        <option value="minimal">Minimal Flat (Ultra-Thin Borders)</option>
                        <option value="shadows">Deep Shadow Cards</option>
                        <option value="glassmorphism">Premium Frosted Glassmorphism</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 4. Motion Strength & Animations */}
                <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 space-y-4">
                  <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-primary">
                    4. Motion Strength & Transition Physics
                  </h3>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    Control the velocity, scale, and spring physics used during scroll-entrances, tab transitions, and card-hovers.
                  </p>

                  <select
                    value={designForm.motionStrength || "normal"}
                    onChange={(e) => setDesignForm({ ...designForm, motionStrength: e.target.value as any })}
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-850 rounded-xl text-sm text-white font-mono"
                  >
                    <option value="none">None (Zero animations — Instant Snap-in & Static panels)</option>
                    <option value="subtle">Subtle (Smooth linear fades & tiny scale steps)</option>
                    <option value="normal">Normal (Organic spring curves & standard hover zooms)</option>
                    <option value="playful">Playful (Hyper-responsive spring bounces & expressive scale factors)</option>
                  </select>
                </div>

                {/* 5. Moveable Section Order */}
                <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 space-y-4">
                  <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-primary flex items-center justify-between">
                    <span>5. Moveable Section Ordering</span>
                    <span className="px-2.5 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-400 font-normal">MOVEABLE</span>
                  </h3>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    Click the up or down arrows to instantly re-order the visual layout sequence of sections on your landing page.
                  </p>

                  <div className="space-y-2 max-w-xl">
                    {designForm.sectionOrder.map((sectionId, idx) => {
                      const labelMap: Record<string, string> = {
                        hero: "Hero Viewport",
                        videoReels: "Interactive Video Reels (Slider)",
                        work: "Curated Work Bento Grid",
                        about: "Philosophy & Bio (About Me)",
                        skills: "Professional Skill Percentage Grid",
                        experience: "Career Timeline Milestones",
                        videos: "Walkthrough Design Videos (Broadcasts)",
                        videoCards: "Video Catalog Cards (Featured Grids)",
                        contact: "Contact Form Plan Selector"
                      };
                      return (
                        <div
                          key={sectionId}
                          className="bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-3 flex items-center justify-between text-sm select-none"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 bg-zinc-900 text-zinc-400 rounded-full flex items-center justify-center text-[10px] font-mono font-bold">
                              {idx + 1}
                            </span>
                            <span className="font-semibold text-white">
                              {labelMap[sectionId] || sectionId}
                            </span>
                          </div>

                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => moveSectionInOrder(idx, "up")}
                              className="p-1.5 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white disabled:opacity-20 transition-colors clickable"
                              title="Move Section Up"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === designForm.sectionOrder.length - 1}
                              onClick={() => moveSectionInOrder(idx, "down")}
                              className="p-1.5 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white disabled:opacity-20 transition-colors clickable"
                              title="Move Section Down"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 bg-white text-zinc-950 font-mono font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-primary hover:text-white transition-all transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer clickable"
                >
                  PUBLISH ALL DESIGN SYSTEM ADJUSTMENTS
                </button>
              </form>
            </motion.div>
          )}

          {/* TAB 1: BRANDING & PROFILE MANAGEMENT */}
          {activeTab === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-8"
            >
              <div className="space-y-1.5 border-b border-zinc-900 pb-5">
                <h2 className="text-2xl font-display font-semibold text-white tracking-tight">
                  Branding & Profile Control
                </h2>
                <p className="text-xs text-zinc-500 font-sans">
                  Manage website logos, hero background images, bio, and the redesigned Core Philosophy layouts dynamically.
                </p>
              </div>

              <form onSubmit={saveBrandingProfile} className="space-y-8 max-w-3xl">
                
                {/* A. LOGO MANAGEMENT */}
                <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 space-y-4">
                  <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-primary">
                    3. Website Logo Management
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="space-y-2">
                      <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                        Upload your custom logo image. It will replace the standard text logo across the header and update the website automatically.
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleImageUpload(e, (base64) => setProfileForm({ ...profileForm, logo: base64 }))
                        }
                        className="hidden"
                        id="logo-upload-input"
                      />
                      <div className="flex gap-3">
                        <label
                          htmlFor="logo-upload-input"
                          className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-xs uppercase tracking-widest rounded-xl cursor-pointer inline-flex items-center gap-1.5 border border-zinc-700 select-none transition-all hover:scale-[1.02] active:scale-[0.98] clickable"
                        >
                          <Upload className="w-3.5 h-3.5" /> UPLOAD LOGO
                        </label>
                        {profileForm.logo && (
                          <button
                            type="button"
                            onClick={() => {
                              setProfileForm({ ...profileForm, logo: "" });
                              showNotification("success", "Logo removed. Reverted to standard text logo.");
                            }}
                            className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-mono text-xs uppercase tracking-widest rounded-xl transition-all border border-red-500/20 clickable"
                          >
                            REMOVE LOGO
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Live preview */}
                    <div className="h-28 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-center p-4 relative select-none">
                      <span className="absolute top-2 left-2 text-[8px] font-mono text-zinc-500">LOGO PREVIEW</span>
                      {profileForm.logo ? (
                        <img
                          src={profileForm.logo}
                          alt="Logo Preview"
                          referrerPolicy="no-referrer"
                          className="h-10 max-w-[180px] object-contain rounded"
                        />
                      ) : (
                        <span className="text-xs font-display font-bold text-zinc-400 tracking-wider">
                          {profileForm.name ? profileForm.name.toUpperCase() : "H. HANZO (TEXT)"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* B. HERO IMAGE MANAGEMENT */}
                <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 space-y-4">
                  <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-primary">
                    4. Global Hero Background Image
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="space-y-2">
                      <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                        Change your main viewport hero background image directly. Converts to highly optimized responsive Base64.
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleImageUpload(e, (base64) => setProfileForm({ ...profileForm, heroImage: base64 }))
                        }
                        className="hidden"
                        id="hero-upload-input"
                      />
                      <div className="flex gap-3">
                        <label
                          htmlFor="hero-upload-input"
                          className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-xs uppercase tracking-widest rounded-xl cursor-pointer inline-flex items-center gap-1.5 border border-zinc-700 select-none transition-all hover:scale-[1.02] active:scale-[0.98] clickable"
                        >
                          <Upload className="w-3.5 h-3.5" /> UPLOAD IMAGE
                        </label>
                        {profileForm.heroImage && (
                          <button
                            type="button"
                            onClick={() => {
                              setProfileForm({ ...profileForm, heroImage: "" });
                              showNotification("success", "Custom Hero Image removed.");
                            }}
                            className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-mono text-xs uppercase tracking-widest rounded-xl transition-all border border-red-500/20 clickable"
                          >
                            REMOVE IMAGE
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="h-28 bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden relative flex items-center justify-center select-none">
                      <span className="absolute top-2 left-2 text-[8px] font-mono text-zinc-500 z-10">HERO PREVIEW</span>
                      {profileForm.heroImage ? (
                        <img
                          src={profileForm.heroImage}
                          alt="Hero Preview"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover opacity-60"
                        />
                      ) : (
                        <span className="text-xs font-mono text-zinc-500">
                          USING 3D INTERACTIVE CANVAS ONLY
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* C. CORE PHILOSOPHY REDESIGN DETAILS */}
                <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 space-y-5">
                  <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-primary">
                    5. Core Philosophy Redesign Layout
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                        Left Column Subheading
                      </label>
                      <input
                        type="text"
                        value={profileForm.philosophySubheading || ""}
                        onChange={(e) => setProfileForm({ ...profileForm, philosophySubheading: e.target.value })}
                        className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-850 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                        Left Column Heading
                      </label>
                      <input
                        type="text"
                        value={profileForm.philosophyHeading || ""}
                        onChange={(e) => setProfileForm({ ...profileForm, philosophyHeading: e.target.value })}
                        className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-850 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                      Left Column Description
                    </label>
                    <textarea
                      rows={3}
                      value={profileForm.philosophyDescription || ""}
                      onChange={(e) => setProfileForm({ ...profileForm, philosophyDescription: e.target.value })}
                      className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-850 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary font-sans leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                      Left Column Supporting Text (Quote style)
                    </label>
                    <textarea
                      rows={2}
                      value={profileForm.philosophySupportingText || ""}
                      onChange={(e) => setProfileForm({ ...profileForm, philosophySupportingText: e.target.value })}
                      className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-850 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary font-sans leading-relaxed"
                    />
                  </div>

                  {/* Right Column Philosophy Hero Photo */}
                  <div className="border-t border-zinc-800/60 pt-4 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="space-y-2">
                      <h4 className="text-xs font-mono font-bold text-zinc-300">
                        Philosophy Hero Image (Right Column)
                      </h4>
                      <p className="text-[11px] text-zinc-500 leading-relaxed">
                        Upload your high-fidelity, professional portrait. This image will show inside the right column of the redesigned Core Philosophy viewport.
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleImageUpload(e, (base64) =>
                            setProfileForm({ ...profileForm, philosophyHeroImage: base64 })
                          )
                        }
                        className="hidden"
                        id="philosophy-upload-input"
                      />
                      <div className="flex gap-2.5">
                        <label
                          htmlFor="philosophy-upload-input"
                          className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-[10px] uppercase tracking-wider rounded-xl cursor-pointer inline-flex items-center gap-1 border border-zinc-700 clickable"
                        >
                          <Upload className="w-3.5 h-3.5" /> UPLOAD PORTRAIT
                        </label>
                      </div>
                    </div>

                    <div className="h-32 bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden relative flex items-center justify-center select-none">
                      <span className="absolute top-2 left-2 text-[8px] font-mono text-zinc-500 z-10">PORTRAIT PREVIEW</span>
                      <img
                        src={profileForm.philosophyHeroImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"}
                        alt="Portrait Preview"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover grayscale rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                {/* D. GENERAL PERSONAL METADATA */}
                <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 space-y-5">
                  <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-primary">
                    General Personal Metadata
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profileForm.name || ""}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-850 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                        Professional Role
                      </label>
                      <input
                        type="text"
                        value={profileForm.role || ""}
                        onChange={(e) => setProfileForm({ ...profileForm, role: e.target.value })}
                        className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-850 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                        Accent Theme Color
                      </label>
                      <select
                        value={profileForm.accentColor || "blue"}
                        onChange={(e) => setProfileForm({ ...profileForm, accentColor: e.target.value })}
                        className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-850 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary text-white font-mono"
                      >
                        <option value="blue">Blue (Apple Classic)</option>
                        <option value="violet">Violet (Cosmic)</option>
                        <option value="emerald">Emerald (Tactical)</option>
                        <option value="amber">Amber (Luxury Gold)</option>
                        <option value="rose">Rose (Tesla Crimson)</option>
                        <option value="cyan">Cyan (Interactive Glow)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                        Admin Contact Email
                      </label>
                      <input
                        type="email"
                        value={profileForm.contactEmail || ""}
                        onChange={(e) => setProfileForm({ ...profileForm, contactEmail: e.target.value })}
                        className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-850 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border-t border-zinc-900 pt-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                        Footer Mobile Number (Calling Link)
                      </label>
                      <input
                        type="text"
                        placeholder="+91 XXXXX XXXXX"
                        value={profileForm.mobileNumber || ""}
                        onChange={(e) => setProfileForm({ ...profileForm, mobileNumber: e.target.value })}
                        className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-850 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                        Footer Email Address (Mailto Link)
                      </label>
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={profileForm.emailAddress || ""}
                        onChange={(e) => setProfileForm({ ...profileForm, emailAddress: e.target.value })}
                        className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-850 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 bg-white text-zinc-950 font-mono font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-primary hover:text-white transition-all transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer clickable"
                >
                  SAVE PROFILE & BRANDING
                </button>
              </form>
            </motion.div>
          )}

          {/* TAB 2: CASE STUDIES (PROJECTS) */}
          {activeTab === "projects" && (
            <motion.div
              key="projects"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-8"
            >
              {selectedCategory === null ? (
                <>
                  <div className="border-b border-zinc-900 pb-5">
                    <div className="space-y-1.5">
                      <h2 className="text-2xl font-display font-semibold text-white tracking-tight">
                        Project Section ({projects.length})
                      </h2>
                      <p className="text-xs text-zinc-500 font-sans">
                        Select a design category to manage, add, update, and reorder your specialized digital portfolio work cards.
                      </p>
                    </div>
                  </div>

                  {/* CATEGORIES GRID */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl">
                    {[
                      { key: "branding", title: "Branding", badge: "IDENTITY", desc: "Visual systems, organic geometries & brand guidelines.", glow: "from-blue-500/10 hover:border-blue-500/30" },
                      { key: "ui-ux", title: "UI/UX", badge: "PRODUCT", desc: "Tactile dashboards, design tokens & high-end prototypes.", glow: "from-zinc-500/10 hover:border-zinc-500/30" },
                      { key: "logo-design", title: "Logo Design", badge: "EMBLEMS", desc: "Modern vector monograms & corporate hallmarks.", glow: "from-amber-500/10 hover:border-amber-500/30" },
                      { key: "social-media", title: "Social Media", badge: "CAMPAIGNS", desc: "CGI teasers, animated stories & interactive carousels.", glow: "from-rose-500/10 hover:border-rose-500/30" },
                      { key: "packaging", title: "Packaging", badge: "STRUCTURAL", desc: "Tactile cardboard forms, debossed labels & matte finishes.", glow: "from-indigo-500/10 hover:border-indigo-500/30" },
                      { key: "brochure", title: "Brochure", badge: "EDITORIAL", desc: "Modern layout lookbooks, grid systems & catalog sheets.", glow: "from-slate-500/10 hover:border-slate-500/30" },
                      { key: "other-design", title: "Other Design", badge: "KEYARTS", desc: "Sci-fi posters, typography templates & musical grids.", glow: "from-purple-500/10 hover:border-purple-500/30" },
                      { key: "t-shirt-design", title: "T-shirt Design", badge: "APPAREL", desc: "Oversized technical streetwears & heavy silk prints.", glow: "from-red-500/10 hover:border-red-500/30" }
                    ].map((cat) => {
                      const count = projects.filter((p) => p.category === cat.key).length;
                      return (
                        <div
                          key={cat.key}
                          onClick={() => setSelectedCategory(cat.key)}
                          className={`bg-zinc-900/40 border border-zinc-850 rounded-2xl p-6 flex flex-col justify-between gap-4 transition-all hover:scale-[1.02] cursor-pointer bg-gradient-to-br ${cat.glow} group select-none clickable`}
                        >
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="px-2.5 py-0.5 bg-zinc-850 text-zinc-400 text-[9px] font-mono uppercase tracking-wider rounded group-hover:bg-zinc-800 transition-colors">
                                {cat.badge}
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-mono font-bold">
                                {count} {count === 1 ? "Item" : "Items"}
                              </span>
                            </div>
                            <h3 className="text-lg font-display font-bold text-white group-hover:text-primary transition-colors">
                              {cat.title}
                            </h3>
                            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                              {cat.desc}
                            </p>
                          </div>
                          <div className="text-[10px] font-mono uppercase text-primary font-bold tracking-widest flex items-center gap-1.5 mt-2">
                            Manage Assets <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <>
                  {/* CATEGORY FOCUS DETAIL VIEW */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
                    <div className="space-y-2">
                      <button
                        onClick={() => setSelectedCategory(null)}
                        className="inline-flex items-center gap-1 text-xs font-mono text-zinc-500 hover:text-zinc-300 transition-colors clickable"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" /> BACK TO CATEGORIES
                      </button>
                      <h2 className="text-2xl font-display font-semibold text-white tracking-tight">
                        {CATEGORY_NAMES[selectedCategory] || selectedCategory.toUpperCase()} Section ({projects.filter((p) => p.category === selectedCategory).length})
                      </h2>
                      <p className="text-xs text-zinc-500 font-sans">
                        Manage, reorder, edit, and publish projects under the {CATEGORY_NAMES[selectedCategory] || selectedCategory.toUpperCase()} category.
                      </p>
                    </div>
                    <button
                      onClick={() => openProjectModal()}
                      className="px-5 py-3 bg-white text-zinc-950 font-mono font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-primary hover:text-white transition-all cursor-pointer flex items-center gap-1.5 shrink-0 select-none clickable"
                    >
                      <Plus className="w-4 h-4" /> ADD TO {CATEGORY_NAMES[selectedCategory]?.toUpperCase() || selectedCategory.toUpperCase()}
                    </button>
                  </div>

                  {/* PROJECTS LIST FILTERED BY SELECTED CATEGORY */}
                  <div className="space-y-4 max-w-4xl">
                    {(() => {
                      const filteredList = projects.filter((p) => p.category === selectedCategory);
                      return (
                        <>
                          {filteredList.map((proj, idx) => (
                            <div
                              key={proj.id}
                              className="bg-zinc-900/40 border border-zinc-850 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 transition-colors hover:border-zinc-800"
                            >
                              <div className="flex items-center gap-4 text-left">
                                <div className="w-20 h-14 rounded-xl overflow-hidden bg-zinc-950 shrink-0 border border-zinc-800 flex items-center justify-center select-none">
                                  {proj.image.startsWith("linear-gradient") ? (
                                    <div className="w-full h-full" style={{ background: proj.image }} />
                                  ) : (
                                    <img
                                      src={proj.image}
                                      alt={proj.title}
                                      referrerPolicy="no-referrer"
                                      className="w-full h-full object-cover"
                                    />
                                  )}
                                </div>
                                <div>
                                  <span className="px-2 py-0.5 rounded bg-zinc-850 text-zinc-400 text-[9px] font-mono uppercase tracking-wider">
                                    {proj.categoryName}
                                  </span>
                                  <h3 className="text-base font-display font-bold text-white mt-1">
                                    {proj.title}
                                  </h3>
                                  <p className="text-xs text-zinc-500 font-sans mt-0.5 line-clamp-1">
                                    {proj.description}
                                  </p>
                                </div>
                              </div>

                              {/* ACTIONS */}
                              <div className="flex items-center gap-2 select-none shrink-0 self-end sm:self-auto">
                                <button
                                  disabled={idx === 0}
                                  onClick={() => moveProjectInCategory(proj.id, "up")}
                                  className="p-2 bg-zinc-850 hover:bg-zinc-700/80 rounded-lg text-zinc-400 hover:text-white disabled:opacity-20 transition-all clickable"
                                  title="Move Up"
                                >
                                  <ArrowUp className="w-4 h-4" />
                                </button>
                                <button
                                  disabled={idx === filteredList.length - 1}
                                  onClick={() => moveProjectInCategory(proj.id, "down")}
                                  className="p-2 bg-zinc-850 hover:bg-zinc-700/80 rounded-lg text-zinc-400 hover:text-white disabled:opacity-20 transition-all clickable"
                                  title="Move Down"
                                >
                                  <ArrowDown className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => openProjectModal(proj)}
                                  className="p-2 bg-zinc-850 hover:bg-primary rounded-lg text-zinc-300 hover:text-white transition-all clickable"
                                  title="Edit Project"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => deleteProjectClick(proj.id, proj.title)}
                                  className="p-2 bg-red-500/10 hover:bg-red-500 rounded-lg text-red-500 hover:text-white transition-all clickable"
                                  title="Delete Project"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}

                          {filteredList.length === 0 && (
                            <div className="p-12 border border-dashed border-zinc-800 rounded-3xl text-center text-zinc-500 font-mono text-xs">
                              NO PROJECTS PUBLISHED IN {CATEGORY_NAMES[selectedCategory]?.toUpperCase() || selectedCategory.toUpperCase()} YET.
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* TAB 3: INTERACTIVE VIDEO REELS (SLIDER) */}
          {activeTab === "reels" && (
            <motion.div
              key="reels"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-8"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
                <div className="space-y-1.5">
                  <h2 className="text-2xl font-display font-semibold text-white tracking-tight">
                    Interactive Video Reels ({videoReels.length})
                  </h2>
                  <p className="text-xs text-zinc-500 font-sans">
                    Configure loops (.mp4 formats) and fallback posters rendered in the premium Hero slider display.
                  </p>
                </div>
                <button
                  onClick={() => openReelModal()}
                  className="px-5 py-3 bg-white text-zinc-950 font-mono font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-primary hover:text-white transition-all cursor-pointer flex items-center gap-1.5 shrink-0 select-none clickable"
                >
                  <Plus className="w-4 h-4" /> ADD VIDEO LOOP
                </button>
              </div>

              {/* LIST DISPLAY */}
              <div className="space-y-4 max-w-4xl">
                {videoReels.map((reel, idx) => (
                  <div
                    key={reel.id}
                    className="bg-zinc-900/40 border border-zinc-850 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 transition-colors hover:border-zinc-800"
                  >
                    <div className="flex items-center gap-4 text-left">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 shrink-0 relative flex items-center justify-center select-none">
                        <Video className="w-5 h-5 text-zinc-600" />
                        {reel.fallbackPoster && (
                          <img
                            src={reel.fallbackPoster}
                            alt="Poster"
                            referrerPolicy="no-referrer"
                            className="absolute inset-0 w-full h-full object-cover opacity-55"
                          />
                        )}
                      </div>
                      <div>
                        <h3 className="text-base font-display font-bold text-white">
                          {reel.title}
                        </h3>
                        <p className="text-xs text-zinc-500 font-sans mt-0.5">
                          {reel.tagline}
                        </p>
                        <p className="text-[10px] text-primary font-mono mt-1 select-all break-all">
                          URL: {reel.videoUrl}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 select-none shrink-0 self-end sm:self-auto">
                      <button
                        disabled={idx === 0}
                        onClick={() => moveItemInArray("reels", idx, "up")}
                        className="p-2 bg-zinc-850 hover:bg-zinc-700/80 rounded-lg text-zinc-400 hover:text-white disabled:opacity-20 transition-all clickable"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        disabled={idx === videoReels.length - 1}
                        onClick={() => moveItemInArray("reels", idx, "down")}
                        className="p-2 bg-zinc-850 hover:bg-zinc-700/80 rounded-lg text-zinc-400 hover:text-white disabled:opacity-20 transition-all clickable"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openReelModal(reel)}
                        className="p-2 bg-zinc-850 hover:bg-primary rounded-lg text-zinc-300 hover:text-white transition-all clickable"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteReelClick(reel.id, reel.title)}
                        className="p-2 bg-red-500/10 hover:bg-red-500 rounded-lg text-red-500 hover:text-white transition-all clickable"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {videoReels.length === 0 && (
                  <div className="p-12 border border-dashed border-zinc-800 rounded-3xl text-center text-zinc-500 font-mono text-xs">
                    NO ACTIVE HERO VIDEO REELS PUBLISHED.
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 4: DESIGN VIDEOS (PLAYLIST) */}
          {activeTab === "videos" && (
            <motion.div
              key="videos"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-8"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
                <div className="space-y-1.5">
                  <h2 className="text-2xl font-display font-semibold text-white tracking-tight">
                    Design Broadcast Videos ({videos.length})
                  </h2>
                  <p className="text-xs text-zinc-500 font-sans">
                    Configure step-by-step design system walkthroughs and tutorials displayed in the Broadcasts section.
                  </p>
                </div>
                <button
                  onClick={() => openVideoModal()}
                  className="px-5 py-3 bg-white text-zinc-950 font-mono font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-primary hover:text-white transition-all cursor-pointer flex items-center gap-1.5 shrink-0 select-none clickable"
                >
                  <Plus className="w-4 h-4" /> ADD VIDEO BROADCAST
                </button>
              </div>

              {/* LIST DISPLAY */}
              <div className="space-y-4 max-w-4xl">
                {videos.map((vid, idx) => (
                  <div
                    key={vid.id}
                    className="bg-zinc-900/40 border border-zinc-850 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 transition-colors hover:border-zinc-800"
                  >
                    <div className="flex items-center gap-4 text-left">
                      <img
                        src={vid.thumbnail || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80"}
                        alt={vid.title}
                        referrerPolicy="no-referrer"
                        className="w-20 h-14 rounded-xl object-cover border border-zinc-850 shrink-0"
                      />
                      <div>
                        <h3 className="text-base font-display font-bold text-white">
                          {vid.title}
                        </h3>
                        <p className="text-xs text-zinc-500 font-sans mt-0.5 line-clamp-1">
                          {vid.description}
                        </p>
                        <p className="text-[10px] text-primary font-mono mt-1 break-all select-all">
                          Video: {vid.videoUrl}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 select-none shrink-0 self-end sm:self-auto">
                      <button
                        disabled={idx === 0}
                        onClick={() => moveItemInArray("videos", idx, "up")}
                        className="p-2 bg-zinc-850 hover:bg-zinc-700/80 rounded-lg text-zinc-400 hover:text-white disabled:opacity-20 transition-all clickable"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        disabled={idx === videos.length - 1}
                        onClick={() => moveItemInArray("videos", idx, "down")}
                        className="p-2 bg-zinc-850 hover:bg-zinc-700/80 rounded-lg text-zinc-400 hover:text-white disabled:opacity-20 transition-all clickable"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openVideoModal(vid)}
                        className="p-2 bg-zinc-850 hover:bg-primary rounded-lg text-zinc-300 hover:text-white transition-all clickable"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteVideoClick(vid.id, vid.title)}
                        className="p-2 bg-red-500/10 hover:bg-red-500 rounded-lg text-red-500 hover:text-white transition-all clickable"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {videos.length === 0 && (
                  <div className="p-12 border border-dashed border-zinc-800 rounded-3xl text-center text-zinc-500 font-mono text-xs">
                    NO DYNAMIC VIDEOS UPLOADED. BROADCASTS ROW IS CURRENTLY HIDDEN.
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 5: VIDEO CARDS CATALOG */}
          {activeTab === "cards" && (
            <motion.div
              key="cards"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-8"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
                <div className="space-y-1.5">
                  <h2 className="text-2xl font-display font-semibold text-white tracking-tight">
                    Dynamic Video Catalog Cards ({videoCards.length})
                  </h2>
                  <p className="text-xs text-zinc-500 font-sans">
                    Manage card cells displaying external design databases, 3D portfolios, and customized lookbooks.
                  </p>
                </div>
                <button
                  onClick={() => openCardModal()}
                  className="px-5 py-3 bg-white text-zinc-950 font-mono font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-primary hover:text-white transition-all cursor-pointer flex items-center gap-1.5 shrink-0 select-none clickable"
                >
                  <Plus className="w-4 h-4" /> ADD CATALOG CARD
                </button>
              </div>

              {/* LIST DISPLAY */}
              <div className="space-y-4 max-w-4xl">
                {videoCards.map((card, idx) => (
                  <div
                    key={card.id}
                    className="bg-zinc-900/40 border border-zinc-850 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 transition-colors hover:border-zinc-800"
                  >
                    <div className="flex items-center gap-4 text-left">
                      <img
                        src={card.thumbnail || "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80"}
                        alt={card.title}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-xl object-cover border border-zinc-850 shrink-0"
                      />
                      <div>
                        <h3 className="text-base font-display font-bold text-white">
                          {card.title}
                        </h3>
                        <p className="text-xs text-zinc-400 font-sans mt-0.5">
                          {card.subtitle}
                        </p>
                        <p className="text-[10px] text-primary font-mono mt-1 break-all select-all">
                          Link: {card.link}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 select-none shrink-0 self-end sm:self-auto">
                      <button
                        disabled={idx === 0}
                        onClick={() => moveItemInArray("cards", idx, "up")}
                        className="p-2 bg-zinc-850 hover:bg-zinc-700/80 rounded-lg text-zinc-400 hover:text-white disabled:opacity-20 transition-all clickable"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        disabled={idx === videoCards.length - 1}
                        onClick={() => moveItemInArray("cards", idx, "down")}
                        className="p-2 bg-zinc-850 hover:bg-zinc-700/80 rounded-lg text-zinc-400 hover:text-white disabled:opacity-20 transition-all clickable"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openCardModal(card)}
                        className="p-2 bg-zinc-850 hover:bg-primary rounded-lg text-zinc-300 hover:text-white transition-all clickable"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteCardClick(card.id, card.title)}
                        className="p-2 bg-red-500/10 hover:bg-red-500 rounded-lg text-red-500 hover:text-white transition-all clickable"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {videoCards.length === 0 && (
                  <div className="p-12 border border-dashed border-zinc-800 rounded-3xl text-center text-zinc-500 font-mono text-xs">
                    NO DYNAMIC CATALOG CARDS ACTIVE. CATALOG SECTION IS CURRENTLY HIDDEN.
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 6: TIMELINE (CAREER MILESTONES) */}
          {activeTab === "timeline" && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-8"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
                <div className="space-y-1.5">
                  <h2 className="text-2xl font-display font-semibold text-white tracking-tight">
                    Professional Timeline ({experiences.length})
                  </h2>
                  <p className="text-xs text-zinc-500 font-sans">
                    Add, edit, delete, or reorder dynamic career timeline milestones and professional qualifications.
                  </p>
                </div>
                <button
                  onClick={() => openExpModal()}
                  className="px-5 py-3 bg-white text-zinc-950 font-mono font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-primary hover:text-white transition-all cursor-pointer flex items-center gap-1.5 shrink-0 select-none clickable"
                >
                  <Plus className="w-4 h-4" /> ADD EVENT
                </button>
              </div>

              {/* LIST DISPLAY */}
              <div className="space-y-4 max-w-4xl">
                {experiences.map((exp, idx) => (
                  <div
                    key={exp.id}
                    className="bg-zinc-900/40 border border-zinc-850 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 transition-colors hover:border-zinc-800"
                  >
                    <div className="text-left space-y-1.5">
                      <span className="px-2.5 py-0.5 bg-zinc-850 rounded text-zinc-400 font-mono text-[9px] uppercase tracking-wider">
                        {exp.duration}
                      </span>
                      <h3 className="text-base font-display font-bold text-white leading-tight">
                        {exp.role} — <span className="text-primary">{exp.company}</span>
                      </h3>
                      <p className="text-xs text-zinc-500 font-sans line-clamp-1">
                        Contributions: {exp.contributions.join(" | ")}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 select-none shrink-0 self-end sm:self-auto">
                      <button
                        disabled={idx === 0}
                        onClick={() => moveItemInArray("timeline", idx, "up")}
                        className="p-2 bg-zinc-850 hover:bg-zinc-700/80 rounded-lg text-zinc-400 hover:text-white disabled:opacity-20 transition-all clickable"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        disabled={idx === experiences.length - 1}
                        onClick={() => moveItemInArray("timeline", idx, "down")}
                        className="p-2 bg-zinc-850 hover:bg-zinc-700/80 rounded-lg text-zinc-400 hover:text-white disabled:opacity-20 transition-all clickable"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openExpModal(exp)}
                        className="p-2 bg-zinc-850 hover:bg-primary rounded-lg text-zinc-300 hover:text-white transition-all clickable"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteExpClick(exp.id, exp.role)}
                        className="p-2 bg-red-500/10 hover:bg-red-500 rounded-lg text-red-500 hover:text-white transition-all clickable"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {experiences.length === 0 && (
                  <div className="p-12 border border-dashed border-zinc-800 rounded-3xl text-center text-zinc-500 font-mono text-xs">
                    NO EXPERIENCE TIMELINE EVENT ITEMS CREATED YET.
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 7: SECURITY & SYSTEM RESET */}
          {activeTab === "security" && (
            <motion.div
              key="security"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-8"
            >
              <div className="space-y-1.5 border-b border-zinc-900 pb-5">
                <h2 className="text-2xl font-display font-semibold text-white tracking-tight">
                  Security & Server Credentials
                </h2>
                <p className="text-xs text-zinc-500 font-sans">
                  Change credentials, reset dynamic contents, or backup secure JSON data nodes instantly.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start max-w-4xl">
                {/* Credentials Form */}
                <form onSubmit={handleCredentialsUpdate} className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 space-y-5 text-left">
                  <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                    <Lock className="w-4 h-4" /> Change Login Credentials
                  </h3>
                  <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                    Modify the username and password used to access the portfolio dashboard. Ensure you write them down safely.
                  </p>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                      New Username
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. secure_faiz"
                      value={secUsername}
                      onChange={(e) => setSecUsername(e.target.value)}
                      className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary text-white"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                      New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Enter new password"
                      value={secPassword}
                      onChange={(e) => setSecPassword(e.target.value)}
                      className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary text-white"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdatingSec}
                    className="px-4 py-2.5 bg-white text-zinc-950 hover:bg-primary hover:text-white font-mono font-bold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center gap-1.5 clickable"
                  >
                    {isUpdatingSec ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    CHANGE LOGIN DETAILS
                  </button>
                </form>

                {/* System Restore Operations */}
                <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 space-y-5 text-left">
                  <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-red-500 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" /> System Recovery & Backups
                  </h3>
                  <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                    Generate secure backup files containing all dynamic case studies, broadcasts, video cards, timeline entries, and profile settings. Keep a local copy safely.
                  </p>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => {
                        const backupData = {
                          projects,
                          videoReels,
                          experiences,
                          videos,
                          videoCards,
                          profile
                        };
                        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `portfolio_backup_${Date.now()}.json`;
                        a.click();
                        showNotification("success", "Backup generated and downloaded.");
                      }}
                      className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-mono font-bold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 border border-zinc-750 clickable"
                    >
                      <Download className="w-3.5 h-3.5" /> EXPORT SYSTEM DATA (.JSON)
                    </button>

                    <input
                      type="file"
                      accept=".json"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = async () => {
                          try {
                            const parsed = JSON.parse(reader.result as string);
                            if (window.confirm("Verify: Are you sure you want to restore this data? Existing portfolio entries will be overwritten.")) {
                              await restoreBackup(parsed);
                              showNotification("success", "Backup restored successfully. Reloading...");
                            }
                          } catch (err) {
                            showNotification("error", "Failed to parse backup JSON.");
                          }
                        };
                        reader.readAsText(file);
                      }}
                      className="hidden"
                      id="backup-file-input"
                    />
                    <label
                      htmlFor="backup-file-input"
                      className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-mono font-bold text-xs uppercase tracking-widest rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 border border-zinc-750 select-none clickable"
                    >
                      <Upload className="w-3.5 h-3.5" /> IMPORT RESTORE (.JSON)
                    </label>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 8: VISITOR & ANALYTICS REPORTS */}
          {activeTab === "reports" && (
            <motion.div
              key="reports"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-8"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
                <div className="space-y-1.5">
                  <h2 className="text-2xl font-display font-semibold text-white tracking-tight">
                    Visitor Logs & Contact Responses
                  </h2>
                  <p className="text-xs text-zinc-500 font-sans">
                    Monitor live traffic analytics, referral channels, user-agents, and direct contact form submissions securely.
                  </p>
                </div>
                
                <button
                  type="button"
                  onClick={fetchReports}
                  disabled={isLoadingReports}
                  className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-mono text-xs uppercase tracking-wider rounded-xl border border-zinc-800 inline-flex items-center gap-1.5 transition-all clickable select-none"
                >
                  {isLoadingReports ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <History className="w-3.5 h-3.5 animate-pulse" />}
                  REFRESH LOGS
                </button>
              </div>

              {/* STATS OVERVIEW CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-zinc-900/40 border border-zinc-850 rounded-2xl p-5 space-y-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Total Visits</span>
                  <p className="text-3xl font-display font-bold text-white">
                    {reportsData.visitors.length}
                  </p>
                  <p className="text-[10px] font-mono text-primary">Logged sessions</p>
                </div>

                <div className="bg-zinc-900/40 border border-zinc-850 rounded-2xl p-5 space-y-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Contact Submissions</span>
                  <p className="text-3xl font-display font-bold text-emerald-400">
                    {reportsData.submissions.length}
                  </p>
                  <p className="text-[10px] font-mono text-emerald-500">Direct inquiries</p>
                </div>

                <div className="bg-zinc-900/40 border border-zinc-850 rounded-2xl p-5 space-y-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Unique Referrals</span>
                  <p className="text-3xl font-display font-bold text-indigo-400">
                    {new Set(reportsData.visitors.map(v => v.referrer).filter(Boolean)).size}
                  </p>
                  <p className="text-[10px] font-mono text-indigo-500">Inbound social links</p>
                </div>
              </div>

              {/* TWO COLUMN LOGS OR COLLAPSED ACCORDION */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* COLUMN 1: DIRECT CONTACT SUBMISSIONS */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                    <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-emerald-400">
                      Contact Inquiries ({reportsData.submissions.length})
                    </h3>
                  </div>

                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                    {reportsData.submissions.map((sub: any) => (
                      <div
                        key={sub.id}
                        className="bg-zinc-900/60 border border-emerald-500/10 rounded-2xl p-5 space-y-3 hover:border-emerald-500/20 transition-all text-left"
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h4 className="font-display font-bold text-white text-sm">{sub.name}</h4>
                            <p className="text-xs text-zinc-400 font-mono mt-0.5">{sub.email}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => deleteReportItem("submissions", sub.id)}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500 rounded-lg text-red-400 hover:text-white transition-colors clickable"
                            title="Delete submission"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {sub.budget && (
                          <div className="inline-block px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-mono">
                            Budget Range: {sub.budget}
                          </div>
                        )}

                        <p className="text-xs text-zinc-300 font-sans leading-relaxed whitespace-pre-wrap bg-zinc-950 p-3 rounded-xl border border-zinc-850">
                          {sub.message}
                        </p>

                        <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500">
                          <span>Date: {new Date(sub.timestamp).toLocaleString()}</span>
                          {sub.linkedProfile && (
                            <a
                              href={sub.linkedProfile}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary hover:underline"
                            >
                              View Profile
                            </a>
                          )}
                        </div>
                      </div>
                    ))}

                    {reportsData.submissions.length === 0 && (
                      <div className="p-8 border border-dashed border-zinc-800 rounded-2xl text-center text-zinc-500 font-mono text-xs">
                        No contact inquiries submitted yet.
                      </div>
                    )}
                  </div>
                </div>

                {/* COLUMN 2: VISITOR LOGS */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                    <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-primary">
                      Traffic Session Analytics ({reportsData.visitors.length})
                    </h3>
                  </div>

                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                    {reportsData.visitors.map((vis: any) => (
                      <div
                        key={vis.id}
                        className="bg-zinc-900/40 border border-zinc-850 rounded-2xl p-4 space-y-2 hover:border-zinc-800 transition-all text-left text-xs"
                      >
                        <div className="flex justify-between items-center">
                          <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono text-[9px]">
                            {vis.ip === "::1" || vis.ip === "127.0.0.1" ? "Localhost" : vis.ip}
                          </span>
                          <button
                            type="button"
                            onClick={() => deleteReportItem("visitors", vis.id)}
                            className="p-1.5 bg-red-500/5 hover:bg-red-500 rounded-lg text-red-500 hover:text-white transition-colors clickable"
                            title="Delete session log"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-400 font-mono">
                          <div>
                            <span className="text-zinc-600">Route: </span>
                            <span className="text-white font-bold">{vis.path}</span>
                          </div>
                          <div>
                            <span className="text-zinc-600">Screen: </span>
                            <span>{vis.screenSize || "N/A"}</span>
                          </div>
                        </div>

                        {vis.referrer && (
                          <div className="text-[11px] font-mono break-all text-zinc-500">
                            <span className="text-zinc-600">Referrer: </span>
                            <a href={vis.referrer} target="_blank" rel="noreferrer" className="hover:underline text-primary">
                              {vis.referrer}
                            </a>
                          </div>
                        )}

                        {vis.userAgent && (
                          <div className="text-[10px] font-mono text-zinc-600 truncate" title={vis.userAgent}>
                            Browser: {vis.userAgent}
                          </div>
                        )}

                        <div className="text-[9px] font-mono text-zinc-600 pt-1 border-t border-zinc-900">
                          Visited: {new Date(vis.timestamp).toLocaleString()}
                        </div>
                      </div>
                    ))}

                    {reportsData.visitors.length === 0 && (
                      <div className="p-8 border border-dashed border-zinc-800 rounded-2xl text-center text-zinc-500 font-mono text-xs">
                        No visitor sessions recorded.
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* --- CRUD MODALS POPUP OVERLAYS --- */}

      {/* MODAL 1: PROJECTS MODAL */}
      <AnimatePresence>
        {isProjectModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh] text-left relative"
            >
              <button
                onClick={() => setIsProjectModalOpen(false)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors clickable"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-display font-bold text-white mb-6">
                {editingProjectId ? "Edit UI/UX Case Study" : "Publish New Case Study"}
              </h3>

              <form onSubmit={saveProject} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
                      Project Title *
                    </label>
                    <input
                      type="text"
                      value={projectForm.title}
                      onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                      className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm focus:ring-1 focus:ring-primary text-white focus:outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
                      Category *
                    </label>
                    <select
                      value={projectForm.category}
                      onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })}
                      className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm focus:ring-1 focus:ring-primary text-white focus:outline-none font-mono"
                    >
                      <option value="ui-ux">UI/UX Product</option>
                      <option value="branding">Branding Identity</option>
                      <option value="logo-design">Logo Design</option>
                      <option value="social-media">Social Media Campaigns</option>
                      <option value="packaging">Packaging Design</option>
                      <option value="brochure">Brochure Design</option>
                      <option value="other-design">Other Graphic Design</option>
                      <option value="t-shirt-design">T-shirt & Apparel</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
                      Client Name
                    </label>
                    <input
                      type="text"
                      value={projectForm.client}
                      onChange={(e) => setProjectForm({ ...projectForm, client: e.target.value })}
                      className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm focus:ring-1 focus:ring-primary text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
                      Year
                    </label>
                    <input
                      type="text"
                      value={projectForm.year}
                      onChange={(e) => setProjectForm({ ...projectForm, year: e.target.value })}
                      className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm focus:ring-1 focus:ring-primary text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
                    Case Study Description *
                  </label>
                  <textarea
                    rows={3}
                    value={projectForm.description}
                    onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm focus:ring-1 focus:ring-primary text-white focus:outline-none font-sans"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
                    Tags (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={projectTagsInput}
                    onChange={(e) => setProjectTagsInput(e.target.value)}
                    placeholder="e.g. Design Tokens, Brand Guidelines, 3D Render"
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm focus:ring-1 focus:ring-primary text-white focus:outline-none font-sans"
                  />
                </div>

                {/* Case Study Image Upload with Live Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-center">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold block">
                      Cover Thumbnail Upload
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleImageUpload(e, (base64) => setProjectForm({ ...projectForm, image: base64 }))
                      }
                      className="hidden"
                      id="proj-image-input"
                    />
                    <label
                      htmlFor="proj-image-input"
                      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-[10px] uppercase tracking-wider rounded-xl cursor-pointer inline-flex items-center gap-1.5 border border-zinc-700 select-none clickable"
                    >
                      <Upload className="w-3.5 h-3.5" /> CHOOSE COVER IMAGE
                    </label>
                  </div>

                  <div className="h-24 bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden relative flex items-center justify-center select-none">
                    <span className="absolute top-2 left-2 text-[8px] font-mono text-zinc-500">PREVIEW</span>
                    {projectForm.image ? (
                      projectForm.image.startsWith("linear-gradient") ? (
                        <div className="w-full h-full" style={{ background: projectForm.image }} />
                      ) : (
                        <img
                          src={projectForm.image}
                          alt="Cover Preview"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      )
                    ) : (
                      <span className="text-[10px] font-mono text-zinc-600">NO COVER UPLOADED</span>
                    )}
                  </div>
                </div>

                {/* --- MOCKUPS GALLERY MANAGER --- */}
                <div className="space-y-4 border-t border-zinc-800/60 pt-5">
                  <div className="flex justify-between items-center select-none">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-extrabold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-primary" /> Curated Design Mockups ({projectForm.gallery?.length || 0})
                    </label>
                    <span className="text-[10px] font-mono text-zinc-500">Max 15 mockups</span>
                  </div>
                  
                  <p className="text-[11px] text-zinc-500 font-sans leading-relaxed">
                    Upload multiple high-fidelity mockups of your branding assets, packaging brochures, layout grids, or t-shirts. These are showcased beautifully inside the case study details page.
                  </p>

                  {/* Mockup Upload & Add URL Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    <div className="flex flex-col gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          handleImageUpload(e, (base64) => {
                            const currentGallery = projectForm.gallery || [];
                            setProjectForm({
                              ...projectForm,
                              gallery: [...currentGallery, base64]
                            });
                            showNotification("success", "Mockup asset uploaded and added to list.");
                          });
                        }}
                        className="hidden"
                        id="gallery-image-upload"
                      />
                      <label
                        htmlFor="gallery-image-upload"
                        className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 font-mono text-[10px] uppercase tracking-wider rounded-xl cursor-pointer inline-flex items-center justify-center gap-1.5 border border-zinc-750 select-none transition-all clickable"
                      >
                        <Upload className="w-3.5 h-3.5 text-primary" /> UPLOAD MOCKUP FILE
                      </label>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Or enter external image URL"
                        id="external-gallery-url"
                        className="flex-grow px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-zinc-750"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const target = e.currentTarget;
                            const url = target.value.trim();
                            if (url) {
                              const currentGallery = projectForm.gallery || [];
                              setProjectForm({
                                ...projectForm,
                                gallery: [...currentGallery, url]
                              });
                              target.value = "";
                              showNotification("success", "External mockup asset added.");
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const el = document.getElementById("external-gallery-url") as HTMLInputElement;
                          const url = el?.value?.trim();
                          if (url) {
                            const currentGallery = projectForm.gallery || [];
                            setProjectForm({
                              ...projectForm,
                              gallery: [...currentGallery, url]
                            });
                            el.value = "";
                            showNotification("success", "External mockup asset added.");
                          }
                        }}
                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-750 text-white font-mono text-xs rounded-xl clickable"
                      >
                        ADD
                      </button>
                    </div>
                  </div>

                  {/* Grid of uploaded mockups with Delete option */}
                  {projectForm.gallery && projectForm.gallery.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-56 overflow-y-auto p-2 border border-zinc-800 rounded-2xl bg-zinc-950/20">
                      {projectForm.gallery.map((mock, idx) => (
                        <div key={idx} className="relative aspect-video rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 group">
                          <img
                            src={mock}
                            alt={`Gallery ${idx + 1}`}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updatedGallery = (projectForm.gallery || []).filter((_, i) => i !== idx);
                              setProjectForm({
                                ...projectForm,
                                gallery: updatedGallery
                              });
                              showNotification("success", "Mockup removed.");
                            }}
                            className="absolute inset-0 bg-red-600/90 text-white flex items-center justify-center font-mono text-[10px] font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-200 clickable"
                          >
                            Remove
                          </button>
                          <span className="absolute bottom-1 right-1 bg-black/60 px-1 text-[7px] font-mono rounded text-zinc-300">
                            {idx + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 border border-dashed border-zinc-800 rounded-2xl text-center text-zinc-600 font-mono text-[10px]">
                      NO MOCKUPS ADDED YET. UPLOAD ASSETS ABOVE.
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800/60">
                  <button
                    type="button"
                    onClick={() => setIsProjectModalOpen(false)}
                    className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs uppercase tracking-wider rounded-xl clickable"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-white text-zinc-950 hover:bg-primary hover:text-white font-mono font-bold text-xs uppercase tracking-widest rounded-xl transition-all clickable"
                  >
                    {editingProjectId ? "UPDATE CASE STUDY" : "PUBLISH CASE STUDY"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: VIDEO REELS MODAL (SLIDER) */}
      <AnimatePresence>
        {isReelModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-left relative"
            >
              <button
                onClick={() => setIsReelModalOpen(false)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors clickable"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-display font-bold text-white mb-6">
                {editingReelId ? "Edit Video Loop Reel" : "Publish Video Loop Reel"}
              </h3>

              <form onSubmit={saveReel} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
                    Reel Title *
                  </label>
                  <input
                    type="text"
                    value={reelForm.title}
                    onChange={(e) => setReelForm({ ...reelForm, title: e.target.value })}
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
                    Video MP4 Link *
                  </label>
                  <input
                    type="url"
                    value={reelForm.videoUrl}
                    onChange={(e) => setReelForm({ ...reelForm, videoUrl: e.target.value })}
                    placeholder="https://assets.mixkit.co/videos/preview/..."
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
                    Tagline *
                  </label>
                  <input
                    type="text"
                    value={reelForm.tagline}
                    onChange={(e) => setReelForm({ ...reelForm, tagline: e.target.value })}
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>

                {/* Cover Thumbnail Upload */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-center pt-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
                      Fallback Poster Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleImageUpload(e, (base64) => setReelForm({ ...reelForm, fallbackPoster: base64 }))
                      }
                      className="hidden"
                      id="reel-poster-input"
                    />
                    <label
                      htmlFor="reel-poster-input"
                      className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-[10px] uppercase tracking-wider rounded-xl cursor-pointer inline-flex items-center gap-1 border border-zinc-700 select-none clickable"
                    >
                      <Upload className="w-3 h-3" /> CHOOSE POSTER
                    </label>
                  </div>

                  <div className="h-20 bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden relative flex items-center justify-center select-none">
                    {reelForm.fallbackPoster ? (
                      <img
                        src={reelForm.fallbackPoster}
                        alt="Poster Preview"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[9px] font-mono text-zinc-600">NO POSTER CHOSEN</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-850">
                  <button
                    type="button"
                    onClick={() => setIsReelModalOpen(false)}
                    className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs uppercase tracking-wider rounded-xl clickable"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-white text-zinc-950 hover:bg-primary hover:text-white font-mono font-bold text-xs uppercase tracking-widest rounded-xl transition-all clickable"
                  >
                    {editingReelId ? "SAVE REEL" : "PUBLISH REEL"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: DESIGN VIDEOS MODAL (PLAYLIST) */}
      <AnimatePresence>
        {isVideoModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-left relative"
            >
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors clickable"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-display font-bold text-white mb-6">
                {editingVideoId ? "Edit Video Broadcast" : "Publish Video Broadcast"}
              </h3>

              <form onSubmit={saveVideo} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
                    Broadcast Title *
                  </label>
                  <input
                    type="text"
                    value={videoForm.title}
                    onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
                    Video URL / Link *
                  </label>
                  <input
                    type="url"
                    value={videoForm.videoUrl}
                    onChange={(e) => setVideoForm({ ...videoForm, videoUrl: e.target.value })}
                    placeholder="https://assets.mixkit.co/videos/preview/..."
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
                    Description *
                  </label>
                  <textarea
                    rows={2}
                    value={videoForm.description}
                    onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>

                {/* Thumbnail upload */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-center pt-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
                      Thumbnail upload
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleImageUpload(e, (base64) => setVideoForm({ ...videoForm, thumbnail: base64 }))
                      }
                      className="hidden"
                      id="vid-thumb-input"
                    />
                    <label
                      htmlFor="vid-thumb-input"
                      className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-[10px] uppercase tracking-wider rounded-xl cursor-pointer inline-flex items-center gap-1 border border-zinc-700 select-none clickable"
                    >
                      <Upload className="w-3 h-3" /> CHOOSE THUMBNAIL
                    </label>
                  </div>

                  <div className="h-20 bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden relative flex items-center justify-center select-none">
                    {videoForm.thumbnail ? (
                      <img
                        src={videoForm.thumbnail}
                        alt="Thumbnail Preview"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[9px] font-mono text-zinc-600">NO THUMBNAIL CHOSEN</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-850">
                  <button
                    type="button"
                    onClick={() => setIsVideoModalOpen(false)}
                    className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs uppercase tracking-wider rounded-xl clickable"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-white text-zinc-950 hover:bg-primary hover:text-white font-mono font-bold text-xs uppercase tracking-widest rounded-xl transition-all clickable"
                  >
                    {editingVideoId ? "SAVE BROADCAST" : "PUBLISH BROADCAST"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 4: VIDEO CATALOG CARDS MODAL */}
      <AnimatePresence>
        {isCardModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-left relative"
            >
              <button
                onClick={() => setIsCardModalOpen(false)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors clickable"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-display font-bold text-white mb-6">
                {editingCardId ? "Edit Catalog Card" : "Publish Catalog Card"}
              </h3>

              <form onSubmit={saveCard} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
                    Card Title *
                  </label>
                  <input
                    type="text"
                    value={cardForm.title}
                    onChange={(e) => setCardForm({ ...cardForm, title: e.target.value })}
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
                    Card Subtitle
                  </label>
                  <input
                    type="text"
                    value={cardForm.subtitle}
                    onChange={(e) => setCardForm({ ...cardForm, subtitle: e.target.value })}
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
                    External Link *
                  </label>
                  <input
                    type="url"
                    value={cardForm.link}
                    onChange={(e) => setCardForm({ ...cardForm, link: e.target.value })}
                    placeholder="https://figma.com/..."
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>

                {/* Thumbnail upload */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-center pt-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
                      Card Thumbnail upload
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleImageUpload(e, (base64) => setCardForm({ ...cardForm, thumbnail: base64 }))
                      }
                      className="hidden"
                      id="card-thumb-input"
                    />
                    <label
                      htmlFor="card-thumb-input"
                      className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-[10px] uppercase tracking-wider rounded-xl cursor-pointer inline-flex items-center gap-1 border border-zinc-700 select-none clickable"
                    >
                      <Upload className="w-3 h-3" /> CHOOSE THUMBNAIL
                    </label>
                  </div>

                  <div className="h-20 bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden relative flex items-center justify-center select-none">
                    {cardForm.thumbnail ? (
                      <img
                        src={cardForm.thumbnail}
                        alt="Thumbnail Preview"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[9px] font-mono text-zinc-600">NO THUMBNAIL CHOSEN</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-850">
                  <button
                    type="button"
                    onClick={() => setIsCardModalOpen(false)}
                    className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs uppercase tracking-wider rounded-xl clickable"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-white text-zinc-950 hover:bg-primary hover:text-white font-mono font-bold text-xs uppercase tracking-widest rounded-xl transition-all clickable"
                  >
                    {editingCardId ? "SAVE CARD" : "PUBLISH CARD"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 5: EXPERIENCES MODAL (TIMELINE) */}
      <AnimatePresence>
        {isExpModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-left relative"
            >
              <button
                onClick={() => setIsExpModalOpen(false)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors clickable"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-display font-bold text-white mb-6">
                {editingExpId ? "Edit Timeline Milestone" : "Publish Timeline Milestone"}
              </h3>

              <form onSubmit={saveExp} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
                      Company *
                    </label>
                    <input
                      type="text"
                      value={expForm.company}
                      onChange={(e) => setExpForm({ ...expForm, company: e.target.value })}
                      className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
                      Role / Title *
                    </label>
                    <input
                      type="text"
                      value={expForm.role}
                      onChange={(e) => setExpForm({ ...expForm, role: e.target.value })}
                      className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
                    Duration (e.g., 2024 — Present)
                  </label>
                  <input
                    type="text"
                    value={expForm.duration}
                    onChange={(e) => setExpForm({ ...expForm, duration: e.target.value })}
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
                    Contributions (One Bullet per Line)
                  </label>
                  <textarea
                    rows={4}
                    value={expForm.contributionsInput}
                    onChange={(e) => setExpForm({ ...expForm, contributionsInput: e.target.value })}
                    placeholder="Designed luxury assets...&#13;&#10;Led WebGL deployment systems...&#13;&#10;Mentored creative trainees..."
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary font-sans leading-relaxed"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-850">
                  <button
                    type="button"
                    onClick={() => setIsExpModalOpen(false)}
                    className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs uppercase tracking-wider rounded-xl clickable"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-white text-zinc-950 hover:bg-primary hover:text-white font-mono font-bold text-xs uppercase tracking-widest rounded-xl transition-all clickable"
                  >
                    {editingExpId ? "SAVE EVENT" : "PUBLISH EVENT"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
