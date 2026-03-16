import { useState } from "react";
import { Search, Code, Target, Share2, FileText, TrendingUp, BarChart3, ChevronDown, BookOpen } from "lucide-react";
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
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      <div>
        <h2 className="font-display font-bold text-2xl text-foreground">Marketing Learning Academy</h2>
        <p className="text-sm text-muted-foreground mt-1">Master digital marketing from fundamentals to advanced strategies</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {learningModules.map(mod => {
          const Icon = iconMap[mod.icon] || BookOpen;
          const isExpanded = expandedModule === mod.id;

          return (
            <motion.div
              key={mod.id}
              layout
              className={cn(
                "bg-card border border-border rounded-xl overflow-hidden transition-all hover:border-primary/30",
                isExpanded && "md:col-span-2 xl:col-span-3"
              )}
            >
              <button
                onClick={() => {
                  setExpandedModule(isExpanded ? null : mod.id);
                  setExpandedLesson(null);
                }}
                className="w-full p-4 flex items-center gap-3 text-left"
              >
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", colorMap[mod.color])}>
                  <Icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold text-sm text-foreground">{mod.title}</h3>
                  <p className="text-xs text-muted-foreground truncate">{mod.description}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[10px] text-muted-foreground">{mod.lessons.length} lessons</span>
                  <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", isExpanded && "rotate-180")} />
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
                        <div key={i} className="border border-border rounded-lg overflow-hidden">
                          <button
                            onClick={() => setExpandedLesson(expandedLesson === `${mod.id}-${i}` ? null : `${mod.id}-${i}`)}
                            className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-secondary/50 transition-colors"
                          >
                            <span className="w-6 h-6 rounded-full gradient-primary text-primary-foreground text-xs flex items-center justify-center font-mono flex-shrink-0">
                              {i + 1}
                            </span>
                            <span className="text-sm text-foreground font-medium">{lesson.title}</span>
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
                                  <p className="text-sm text-secondary-foreground whitespace-pre-line leading-relaxed">
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
