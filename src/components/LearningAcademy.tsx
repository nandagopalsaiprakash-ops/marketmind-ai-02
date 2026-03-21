import { useState } from "react";
import { Search, Code, Target, Share2, FileText, TrendingUp, BarChart3, ChevronDown, BookOpen, GraduationCap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { learningModules } from "@/data/marketingData";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ElementType> = {
  Search, Code, Target, Share2, FileText, TrendingUp, BarChart3,
};

const colorMap: Record<string, string> = {
  primary: "gradient-primary",
  accent: "gradient-accent",
  warm: "gradient-warm",
};

export default function LearningAcademy() {
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);

  return (
    <div className="p-4 md:p-6 space-y-6 overflow-y-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-h2 text-foreground">Learning Academy</h2>
          <p className="text-body text-muted-foreground mt-1">Master digital marketing from fundamentals to advanced strategies</p>
        </div>
        <div className="w-11 h-11 rounded-2xl gradient-accent flex items-center justify-center shadow-glow flex-shrink-0">
          <GraduationCap className="w-6 h-6 text-accent-foreground" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card p-4 text-center">
          <p className="font-display font-bold text-h3 text-foreground">{learningModules.length}</p>
          <p className="text-caption text-muted-foreground">Modules</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="font-display font-bold text-h3 text-foreground">{learningModules.reduce((a, m) => a + m.lessons.length, 0)}</p>
          <p className="text-caption text-muted-foreground">Lessons</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="font-display font-bold text-h3 text-primary">Free</p>
          <p className="text-caption text-muted-foreground">Access</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {learningModules.map((mod, mi) => {
          const Icon = iconMap[mod.icon] || BookOpen;
          const isExpanded = expandedModule === mod.id;

          return (
            <motion.div
              key={mod.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: mi * 0.06 }}
              className={cn(
                "glass-card overflow-hidden transition-all hover:shadow-glow",
                isExpanded && "md:col-span-2 xl:col-span-3"
              )}
            >
              <button
                onClick={() => {
                  setExpandedModule(isExpanded ? null : mod.id);
                  setExpandedLesson(null);
                }}
                className="w-full p-4 flex items-center gap-3 text-left group"
              >
                <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform", colorMap[mod.color])}>
                  <Icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold text-body text-foreground">{mod.title}</h3>
                  <p className="text-caption text-muted-foreground truncate">{mod.description}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-micro text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{mod.lessons.length} lessons</span>
                  <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform duration-300", isExpanded && "rotate-180")} />
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-2">
                      {mod.lessons.map((lesson, i) => (
                        <div key={i} className="border border-border/50 rounded-xl overflow-hidden">
                          <button
                            onClick={() => setExpandedLesson(expandedLesson === `${mod.id}-${i}` ? null : `${mod.id}-${i}`)}
                            className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-secondary/30 transition-colors"
                          >
                            <span className="w-7 h-7 rounded-lg gradient-primary text-primary-foreground text-caption flex items-center justify-center font-mono flex-shrink-0 font-bold">
                              {i + 1}
                            </span>
                            <span className="text-body text-foreground font-medium">{lesson.title}</span>
                          </button>
                          <AnimatePresence>
                            {expandedLesson === `${mod.id}-${i}` && (
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: "auto" }}
                                exit={{ height: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="px-4 pb-4 pt-0">
                                  <p className="text-body text-secondary-foreground whitespace-pre-line leading-relaxed">
                                    {lesson.content}
                                  </p>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
