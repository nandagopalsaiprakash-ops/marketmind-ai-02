import { ExternalLink, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { MarketingTool, getCategoryIcon } from "@/data/toolsDatabase";

interface ToolCardsProps {
  tools: MarketingTool[];
}

export default function ToolCards({ tools }: ToolCardsProps) {
  if (tools.length === 0) return null;

  return (
    <div className="mt-4 pt-4 border-t border-border/50">
      <p className="text-caption font-semibold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
        <span className="w-5 h-5 rounded-md gradient-primary flex items-center justify-center">
          <ExternalLink className="w-3 h-3 text-primary-foreground" />
        </span>
        Tools Mentioned
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {tools.map((tool, i) => (
          <motion.a
            key={tool.url}
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group flex items-start gap-3 p-3.5 rounded-2xl glass-panel hover:border-primary/40 hover:shadow-glow transition-all cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <span className="text-lg">{getCategoryIcon(tool.category)}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-body font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                  {tool.name}
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all flex-shrink-0" />
              </div>
              <p className="text-caption text-muted-foreground leading-snug mt-0.5">{tool.description}</p>
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  );
}
