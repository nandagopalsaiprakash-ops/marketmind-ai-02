import { useState } from "react";
import { Search, BarChart3, Mail, Megaphone, Palette, ExternalLink, Star, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { marketingTools } from "@/data/marketingData";
import { cn } from "@/lib/utils";

const categoryIcons: Record<string, React.ElementType> = {
  "SEO Tools": Search,
  "Analytics Platforms": BarChart3,
  "Email Marketing": Mail,
  "Advertising Platforms": Megaphone,
  "Content & Social": Palette,
};

const categoryColors: Record<string, string> = {
  "SEO Tools": "gradient-primary",
  "Analytics Platforms": "gradient-accent",
  "Email Marketing": "gradient-warm",
  "Advertising Platforms": "gradient-primary",
  "Content & Social": "gradient-accent",
};

// Quick stats for the dashboard header
const stats = [
  { label: "Tools Tracked", value: "25+", icon: Search, color: "text-primary" },
  { label: "Categories", value: "5", icon: BarChart3, color: "text-accent" },
  { label: "Updated", value: "Live", icon: TrendingUp, color: "text-primary" },
];

export default function ToolsDashboard() {
  const [filter, setFilter] = useState<string | null>(null);

  const filtered = filter
    ? marketingTools.filter(c => c.category === filter)
    : marketingTools;

  return (
    <div className="p-4 md:p-6 space-y-6 overflow-y-auto h-full">
      <div>
        <h2 className="font-display font-bold text-xl md:text-2xl text-foreground">Marketing Tools Dashboard</h2>
        <p className="text-sm text-muted-foreground mt-1">Curated tools to power your marketing stack</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map(stat => (
          <div key={stat.label} className="bg-card border border-border rounded-xl p-3 md:p-4 text-center">
            <stat.icon className={cn("w-5 h-5 mx-auto mb-1.5", stat.color)} />
            <p className="font-display font-bold text-lg text-foreground">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setFilter(null)}
          className={cn(
            "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all",
            !filter ? "gradient-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          )}
        >
          All
        </button>
        {marketingTools.map(cat => (
          <button
            key={cat.category}
            onClick={() => setFilter(filter === cat.category ? null : cat.category)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all",
              filter === cat.category ? "gradient-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            {cat.category}
          </button>
        ))}
      </div>

      {filtered.map((category, ci) => {
        const Icon = categoryIcons[category.category] || Search;
        const gradClass = categoryColors[category.category] || "gradient-primary";
        return (
          <motion.div
            key={category.category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: ci * 0.08 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", gradClass)}>
                <Icon className="w-4 h-4 text-primary-foreground" />
              </div>
              <h3 className="font-display font-semibold text-base text-foreground">{category.category}</h3>
              <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{category.tools.length} tools</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {category.tools.map((tool, ti) => (
                <motion.div
                  key={tool.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: ci * 0.08 + ti * 0.03 }}
                  className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 hover:shadow-glow transition-all group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-display font-semibold text-sm text-foreground">{tool.name}</h4>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{tool.description}</p>
                  <div className="space-y-1.5">
                    <div className="flex gap-2 text-xs">
                      <span className="text-primary font-medium shrink-0">Use:</span>
                      <span className="text-secondary-foreground">{tool.useCase}</span>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <span className="text-accent font-medium shrink-0">When:</span>
                      <span className="text-secondary-foreground">{tool.when}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
