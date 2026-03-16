import { Search, BarChart3, Mail, Megaphone, Palette, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { marketingTools } from "@/data/marketingData";

const categoryIcons: Record<string, React.ElementType> = {
  "SEO Tools": Search,
  "Analytics Platforms": BarChart3,
  "Email Marketing": Mail,
  "Advertising Platforms": Megaphone,
  "Content & Social": Palette,
};

export default function ToolsDashboard() {
  return (
    <div className="p-6 space-y-8 overflow-y-auto h-full">
      <div>
        <h2 className="font-display font-bold text-2xl text-foreground">Marketing Tools Dashboard</h2>
        <p className="text-sm text-muted-foreground mt-1">Curated tools to power your marketing stack</p>
      </div>

      {marketingTools.map((category, ci) => {
        const Icon = categoryIcons[category.category] || Search;
        return (
          <motion.div
            key={category.category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: ci * 0.1 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Icon className="w-5 h-5 text-primary" />
              <h3 className="font-display font-semibold text-lg text-foreground">{category.category}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {category.tools.map(tool => (
                <div
                  key={tool.name}
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
                </div>
              ))}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
