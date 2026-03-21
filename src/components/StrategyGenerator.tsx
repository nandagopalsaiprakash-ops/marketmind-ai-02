import { useState } from "react";
import { Lightbulb, Rocket, Target, Megaphone, PenTool, Clock, DollarSign, BarChart3, Copy, Check, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Strategy {
  strategy: string;
  overview: string;
  tactics: string[];
  channels: string[];
  contentIdeas: string[];
  timeline: string;
  budget: string;
  kpis: string[];
}

const STRATEGY_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-strategy`;

const businessTypes = ["SaaS", "E-commerce", "Agency", "Local Business", "Startup", "Media/Publishing", "FinTech", "EdTech"];
const audiences = ["Developers", "Small businesses", "Consumers", "Enterprise", "Students", "Creators", "Healthcare pros"];
const goals = ["Increase signups", "Brand awareness", "Increase sales", "Lead generation", "User retention", "Product launch", "Market expansion"];

export default function StrategyGenerator() {
  const [business, setBusiness] = useState("");
  const [audience, setAudience] = useState("");
  const [goal, setGoal] = useState("");
  const [result, setResult] = useState<Strategy | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!business || !audience || !goal) return;
    setIsGenerating(true);
    setResult(null);

    try {
      const resp = await fetch(STRATEGY_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ business, audience, goal }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Failed" }));
        toast({ title: "Error", description: err.error, variant: "destructive" });
        return;
      }

      const data = await resp.json();
      setResult(data);
    } catch {
      toast({ title: "Error", description: "Failed to generate strategy", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyStrategy = () => {
    if (!result) return;
    const text = `# ${result.strategy}\n\n${result.overview}\n\n## Tactics\n${result.tactics.map(t => `- ${t}`).join("\n")}\n\n## Channels\n${result.channels.join(", ")}\n\n## Content Ideas\n${result.contentIdeas.map(c => `- ${c}`).join("\n")}\n\n## Timeline\n${result.timeline}\n\n## Budget\n${result.budget}\n\n## KPIs\n${result.kpis.map(k => `- ${k}`).join("\n")}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 overflow-y-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-h2 text-foreground">Strategy Generator</h2>
          <p className="text-body text-muted-foreground mt-1">AI-powered custom marketing strategies</p>
        </div>
        <div className="w-11 h-11 rounded-2xl gradient-accent flex items-center justify-center shadow-glow flex-shrink-0">
          <Sparkles className="w-6 h-6 text-accent-foreground" />
        </div>
      </div>

      {/* Input cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SelectField label="Business Type" value={business} options={businessTypes} onChange={setBusiness} />
        <SelectField label="Target Audience" value={audience} options={audiences} onChange={setAudience} />
        <SelectField label="Marketing Goal" value={goal} options={goals} onChange={setGoal} />
      </div>

      <button
        onClick={handleGenerate}
        disabled={!business || !audience || !goal || isGenerating}
        className="gradient-primary text-primary-foreground px-6 py-3 rounded-2xl font-display font-semibold text-body disabled:opacity-40 hover:shadow-glow transition-all flex items-center gap-2 shadow-glow"
      >
        {isGenerating ? (
          <>
            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            Generating with AI...
          </>
        ) : (
          <>
            <Rocket className="w-4 h-4" />
            Generate Strategy
          </>
        )}
      </button>

      {/* Loading skeleton */}
      {isGenerating && (
        <div className="space-y-3">
          <div className="glass-card p-5 space-y-3">
            <div className="skeleton-shimmer h-6 w-2/3 rounded-lg" />
            <div className="skeleton-shimmer h-4 w-full rounded-lg" />
            <div className="skeleton-shimmer h-4 w-5/6 rounded-lg" />
            <div className="skeleton-shimmer h-4 w-3/4 rounded-lg" />
          </div>
        </div>
      )}

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="glass-card p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <h3 className="font-display font-bold text-h3 text-foreground">{result.strategy}</h3>
                </div>
                <button
                  onClick={copyStrategy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary text-secondary-foreground text-caption hover:bg-secondary/80 transition-colors"
                >
                  {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              {result.overview && (
                <p className="text-body text-secondary-foreground leading-relaxed mb-5 bg-secondary/30 rounded-xl p-3 border-l-2 border-primary/50">{result.overview}</p>
              )}

              <Section icon={Target} title="Growth Tactics" items={result.tactics} color="primary" />
              <Section icon={Megaphone} title="Recommended Channels" items={result.channels} chip color="accent" />
              <Section icon={PenTool} title="Content Ideas" items={result.contentIdeas} color="info" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                {result.timeline && (
                  <div className="glass-panel p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-warning" />
                      <h4 className="text-body font-semibold text-foreground">Timeline</h4>
                    </div>
                    <p className="text-caption text-secondary-foreground leading-relaxed">{result.timeline}</p>
                  </div>
                )}
                {result.budget && (
                  <div className="glass-panel p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-success" />
                      <h4 className="text-body font-semibold text-foreground">Budget</h4>
                    </div>
                    <p className="text-caption text-secondary-foreground leading-relaxed">{result.budget}</p>
                  </div>
                )}
              </div>

              {result.kpis?.length > 0 && (
                <Section icon={BarChart3} title="Key Performance Indicators" items={result.kpis} chip color="technical" />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-caption font-medium text-muted-foreground mb-1.5 block">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl px-3 py-2.5 text-body text-foreground outline-none focus:border-primary/50 focus:shadow-glow transition-all appearance-none cursor-pointer"
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Section({ icon: Icon, title, items, chip, color = "primary" }: { icon: React.ElementType; title: string; items: string[]; chip?: boolean; color?: string }) {
  if (!items || items.length === 0) return null;
  const colorClasses: Record<string, string> = {
    primary: "text-primary",
    accent: "text-accent",
    info: "text-info",
    success: "text-success",
    warning: "text-warning",
    technical: "text-technical",
  };
  return (
    <div className="mt-5">
      <div className="flex items-center gap-2 mb-2.5">
        <Icon className={cn("w-4 h-4", colorClasses[color])} />
        <h4 className="text-body font-semibold text-foreground">{title}</h4>
      </div>
      {chip ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item, i) => (
            <span key={i} className="px-3 py-1.5 rounded-xl bg-secondary/80 text-secondary-foreground text-caption font-medium border border-border/50">
              {item}
            </span>
          ))}
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={i} className="text-body text-secondary-foreground flex gap-2.5">
              <span className={cn("mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0", `bg-${color === "primary" ? "primary" : color}`)} style={{ backgroundColor: `hsl(var(--${color}))` }} />
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
