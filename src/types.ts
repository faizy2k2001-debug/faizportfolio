export interface Project {
  id: string;
  title: string;
  category: string; // matches: 'branding', 'ui-ux', 'logo-design', 'social-media', 'packaging', 'brochure', 'other-design', 't-shirt-design'
  categoryName: string;
  image: string; // Base64 data-URL or external URL
  description: string;
  client: string;
  year: string;
  tags: string[];
  gallery?: string[]; // Multiple high-fidelity mockup images
}

export interface Skill {
  name: string;
  level: number;
  iconName: string;
}

export interface SkillCategory {
  title: string;
  skills: Skill[];
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  duration: string;
  contributions: string[];
  icon?: string; // Optional timeline icon
}

export interface VideoReel {
  id: string;
  title: string;
  videoUrl: string;
  fallbackPoster: string;
  tagline: string;
}

export interface VideoItem {
  id: string;
  title: string;
  description: string;
  videoUrl: string; // video upload (Base64 data-url) or external link
  thumbnail: string; // thumbnail upload (Base64 data-url)
}

export interface VideoCardItem {
  id: string;
  title: string;
  subtitle: string;
  thumbnail: string; // thumbnail upload (Base64 data-url)
  link: string;
}

export interface ProfileDetails {
  name: string;
  role: string;
  aboutPhilosophy: string;
  aboutBioParagraphs: string[];
  contactEmail: string;
  accentColor: string; // "blue" | "violet" | "emerald" | "amber" | "rose" | "cyan"
  heroTitlePrefix: string;
  heroTitleSuffix: string;
  heroTitleBody: string;
  heroSubtitle: string;
  showVideoReel: boolean;
  showSkills: boolean;
  showExperience: boolean;
  showStats: boolean;
  showSmileyBall: boolean;

  // Custom contact info fields
  mobileNumber?: string;
  emailAddress?: string;
  
  // Dynamic Logo & Hero Images
  logo?: string; // Base64 data-URL or image URL
  heroImage?: string; // Base64 data-URL or image URL for main Hero
  
  // Core Philosophy Redesign Left Column
  philosophyHeading: string;
  philosophySubheading: string;
  philosophyDescription: string;
  philosophySupportingText: string;
  
  // Core Philosophy Redesign Right Column
  philosophyHeroImage: string; // Base64 data-URL or image URL

  // Frontend controllable styling options
  sectionSpacing?: "compact" | "normal" | "spacious";
  fontFamily?: "sans" | "serif" | "grotesk" | "mono";
  buttonStyle?: "sharp" | "rounded" | "pill";
  chipsStyle?: "flat" | "outline" | "pill-outline" | "solid";
  effectsStyle?: "minimal" | "shadows" | "glassmorphism";
  motionStrength?: "none" | "subtle" | "normal" | "playful";
  sectionOrder?: string[];
}

export interface VisitorLog {
  id: string;
  timestamp: string;
  ip: string;
  userAgent: string;
  path: string;
  referrer: string;
}

export interface ContactSubmission {
  id: string;
  timestamp: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  ip?: string;
  userAgent?: string;
}

