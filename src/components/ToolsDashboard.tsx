import { useState } from "react";
import { Search, BarChart3, Mail, Megaphone, Palette, ExternalLink, TrendingUp, Wrench } from "lucide-react";
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

const stats = [
  { label: "Tools Tracked", value: "25+", icon: Search, color: "text-primary" },
  { label: "Categories", value: "5", icon: BarChart3, color: "text-accent" },
  { label: "Updated", value: "Live", icon: TrendingUp, color: "text-success" },
];

export default function ToolsDashboard() {
  const [filter, setFilter] = useState<string | null>(null);

  const filtered = filter
    ? marketingTools.filter(c => c.category === filter)
    : marketingTools;

  return (
    <div className="p-4 md:p-6 space-y-6 overflow-y-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-h2 text-foreground">Marketing Tools</h2>
          <p className="text-body text-muted-foreground mt-1">Curated tools to power your marketing stack</p>
        </div>
        <div className="w-11 h-11 rounded-2xl gradient-primary flex items-center justify-center shadow-glow flex-shrink-0">
          <Wrench className="w-6 h-6 text-primary-foreground" />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map(stat => (
          <div key={stat.label} className="glass-card p-4 text-center group hover:shadow-glow transition-all">
            <stat.icon className={cn("w-5 h-5 mx-auto mb-2 group-hover:scale-110 transition-transform", stat.color)} />
            <p className="font-display font-bold text-h3 text-foreground">{stat.value}</p>
            <p className="text-caption text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setFilter(null)}
          className={cn(
            "px-4 py-1.5 rounded-xl text-caption font-medium whitespace-nowrap transition-all",
            !filter ? "gradient-primary text-primary-foreground shadow-glow" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          )}
        >
          All
        </button>
        {marketingTools.map(cat => (
          <button
            key={cat.category}
            onClick={() => setFilter(filter === cat.category ? null : cat.category)}
            className={cn(
              "px-4 py-1.5 rounded-xl text-caption font-medium whitespace-nowrap transition-all",
              filter === cat.category ? "gradient-primary text-primary-foreground shadow-glow" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
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
            <div className="flex items-center gap-2.5 mb-3">
              <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", gradClass)}>
                <Icon className="w-4 h-4 text-primary-foreground" />
              </div>
              <h3 className="font-display font-semibold text-body-lg text-foreground">{category.category}</h3>
              <span className="text-micro text-muted-foreground bg-secondary px-2.5 py-0.5 rounded-full">{category.tools.length} tools</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {category.tools.map((tool, ti) => (
                <motion.div
                  key={tool.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: ci * 0.08 + ti * 0.03 }}
                  className="glass-card p-4 hover:shadow-glow transition-all group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-display font-semibold text-body text-foreground">{tool.name}</h4>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-caption text-muted-foreground mb-3 leading-relaxed">{tool.description}</p>
                  <div className="space-y-1.5">
                    <div className="flex gap-2 text-caption">
                      <span className="text-primary font-medium shrink-0">Use:</span>
                      <span className="text-secondary-foreground">{tool.useCase}</span>
                    </div>
                    <div className="flex gap-2 text-caption">
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
