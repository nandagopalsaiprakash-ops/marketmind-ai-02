import { ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { MarketingTool, getCategoryIcon } from "@/data/toolsDatabase";

interface ToolCardsProps {
  tools: MarketingTool[];
}

export default function ToolCards({ tools }: ToolCardsProps) {
  if (tools.length === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-border">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">🔧 Tools Mentioned</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {tools.map((tool, i) => (
          <motion.a
            key={tool.url}
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group flex items-start gap-3 p-3 rounded-lg bg-secondary/50 border border-border hover:border-primary/40 hover:shadow-glow transition-all cursor-pointer"
          >
            <span className="text-lg flex-shrink-0 mt-0.5">{getCategoryIcon(tool.category)}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                  {tool.name}
                </span>
                <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{tool.description}</p>
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  );
}
