import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Briefcase, Calendar, FolderOpen, ExternalLink, Tag } from "lucide-react";
import { usePortfolio } from "../context/PortfolioContext";
import { Project } from "../data";
import {
  getButtonRadius,
  getChipStyle,
  getHoverScale,
  getFramerTransition
} from "../lib/styleUtils";

const CATEGORY_MAP: { [key: string]: string } = {
  "branding": "Branding",
  "ui-ux": "UI/UX",
  "logo-design": "Logo Design",
  "social-media": "Social Media",
  "packaging": "Packaging",
  "brochure": "Brochure",
  "other-design": "Other Design",
  "t-shirt-design": "T-shirt Design",
};

export default function CategoryGallery() {
  const { category = "" } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const { projects, profile } = usePortfolio();

  // Validate and read category details
  const isCategoryValid = Object.keys(CATEGORY_MAP).includes(category);
  const categoryLabel = isCategoryValid ? CATEGORY_MAP[category] : "Creative Works";

  // Filter projects by current category slug
  const filteredProjects = projects.filter(
    (p) => p.category.toLowerCase() === category.toLowerCase()
  );

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: getFramerTransition(profile.motionStrength),
    },
  };

  const handleCategorySwitch = (slug: string) => {
    navigate(`/work/${slug}`);
  };

  return (
    <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-zinc-950 transition-colors duration-500">
      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* Header Block with navigation links */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-zinc-200 dark:border-zinc-800 text-left select-none">
          <div className="space-y-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-mono font-bold text-zinc-400 dark:text-zinc-500 hover:text-primary dark:hover:text-primary transition-colors group clickable"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform" />
              RETURN TO LANDING
            </Link>
            <div className="space-y-2">
              <span className="text-[10px] font-mono tracking-widest text-primary uppercase font-semibold">
                CURATED ARCHIVE
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-semibold tracking-tight text-zinc-900 dark:text-white">
                {categoryLabel}
              </h1>
            </div>
          </div>

          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed font-sans font-light">
            Each item in this collection represents custom, high-fidelity asset design matching absolute project parameters.
          </p>
        </div>

        {/* Dynamic Category Pill Switcher (Allows seamless lateral exploration) */}
        <div className="text-left space-y-3">
          <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
            EXPLORE OTHER ARCHIVES
          </p>
          <div className="flex flex-wrap gap-2.5">
            {Object.entries(CATEGORY_MAP).map(([slug, label]) => {
              const isActive = slug.toLowerCase() === category.toLowerCase();
              return (
                <button
                  key={slug}
                  onClick={() => handleCategorySwitch(slug)}
                  className={`px-4 py-2 text-xs font-medium font-mono transition-all duration-300 cursor-pointer clickable ${getButtonRadius(profile.buttonStyle)} ${
                    isActive
                      ? "bg-gradient-to-r from-primary to-primary/75 text-white shadow-md scale-105"
                      : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-primary dark:hover:text-primary hover:border-primary/30"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Curated Projects Layout Grid */}
        {filteredProjects.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12"
          >
            {filteredProjects.map((project) => (
              <motion.article
                key={project.id}
                variants={itemVariants}
                onClick={() => navigate(`/project/${project.id}`)}
                whileHover={profile.motionStrength !== "none" ? { scale: getHoverScale(profile.motionStrength) } : undefined}
                className="group flex flex-col space-y-6 text-left cursor-pointer clickable select-none transition-transform duration-300"
              >
                {/* Visual Thumbnail Card */}
                <div
                  className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-md flex items-end p-6 border border-zinc-200/50 dark:border-zinc-800/50"
                  style={project.image.startsWith("linear-gradient") ? { background: project.image } : undefined}
                >
                  {!project.image.startsWith("linear-gradient") && (
                    <img
                      src={project.image}
                      alt={project.title}
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  {/* Subtle Grid overlay representing blueprint lines */}
                  <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
                  
                  {/* Backlight glow */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative z-10 space-y-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-mono text-white/90">
                      <Tag className="w-3 h-3 text-primary" /> {project.categoryName}
                    </span>
                    <h3 className="text-xl md:text-2xl font-display font-semibold text-white tracking-tight">
                      {project.title}
                    </h3>
                  </div>
                </div>

                {/* Editorial Metadata Block */}
                <div className="space-y-4 px-1">
                  <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-zinc-400 dark:text-zinc-500 font-mono">
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5" /> CLIENT:{" "}
                      <strong className="text-zinc-700 dark:text-zinc-300 font-medium">
                        {project.client}
                      </strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" /> COMPLETED:{" "}
                      <strong className="text-zinc-700 dark:text-zinc-300 font-medium">
                        {project.year}
                      </strong>
                    </span>
                  </div>

                  <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 font-sans font-light leading-relaxed">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1.5">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className={getChipStyle(profile.chipsStyle)}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-20 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-3xl space-y-4">
            <FolderOpen className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto" />
            <h2 className="text-xl font-display font-bold text-zinc-700 dark:text-zinc-300">
              No projects archived yet
            </h2>
            <p className="text-sm text-zinc-400 max-w-xs mx-auto">
              We are currently finalizing project documentation for this sector. Explore other active galleries!
            </p>
          </div>
        )}

        {/* Bottom CTA Block */}
        <div className="pt-12 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-6 text-center select-none">
          <Link
            to="/"
            className={`px-6 py-3 border border-zinc-200 dark:border-zinc-800 ${getButtonRadius(profile.buttonStyle)} text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300 hover:text-primary dark:hover:text-primary hover:border-primary/30 cursor-pointer clickable`}
          >
            ← Return to Home
          </Link>
          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=faizy2k2001@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary/75 text-white text-xs font-mono font-bold tracking-wider ${getButtonRadius(profile.buttonStyle)} hover:opacity-95 shadow-md clickable`}
          >
            INITIATE COLLABORATION <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
