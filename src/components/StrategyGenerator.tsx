import { useState } from "react";
import { Lightbulb, Rocket, Target, Megaphone, PenTool, Clock, DollarSign, BarChart3, Copy, Check, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

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
    } catch (e) {
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
          <h2 className="font-display font-bold text-xl md:text-2xl text-foreground">Strategy Generator</h2>
          <p className="text-sm text-muted-foreground mt-1">AI-powered custom marketing strategies</p>
        </div>
        <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center shadow-glow">
          <Sparkles className="w-5 h-5 text-accent-foreground" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SelectField label="Business Type" value={business} options={businessTypes} onChange={setBusiness} />
        <SelectField label="Target Audience" value={audience} options={audiences} onChange={setAudience} />
        <SelectField label="Marketing Goal" value={goal} options={goals} onChange={setGoal} />
      </div>

      <button
        onClick={handleGenerate}
        disabled={!business || !audience || !goal || isGenerating}
        className="gradient-primary text-primary-foreground px-6 py-3 rounded-xl font-display font-semibold text-sm disabled:opacity-40 hover:shadow-glow transition-all flex items-center gap-2"
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

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Strategy Header */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  <h3 className="font-display font-bold text-foreground">{result.strategy}</h3>
                </div>
                <button
                  onClick={copyStrategy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs hover:bg-secondary/80 transition-colors"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              {result.overview && (
                <p className="text-sm text-secondary-foreground leading-relaxed mb-4">{result.overview}</p>
              )}

              <Section icon={Target} title="Growth Tactics" items={result.tactics} />
              <Section icon={Megaphone} title="Recommended Channels" items={result.channels} chip />
              <Section icon={PenTool} title="Content Ideas" items={result.contentIdeas} />
              
              {/* New sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                {result.timeline && (
                  <div className="bg-secondary/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <h4 className="text-sm font-semibold text-foreground">Timeline</h4>
                    </div>
                    <p className="text-xs text-secondary-foreground leading-relaxed">{result.timeline}</p>
                  </div>
                )}
                {result.budget && (
                  <div className="bg-secondary/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-primary" />
                      <h4 className="text-sm font-semibold text-foreground">Budget</h4>
                    </div>
                    <p className="text-xs text-secondary-foreground leading-relaxed">{result.budget}</p>
                  </div>
                )}
              </div>

              {result.kpis?.length > 0 && (
                <Section icon={BarChart3} title="Key Performance Indicators" items={result.kpis} chip />
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
      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-card border border-border rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/50 focus:shadow-glow transition-all appearance-none cursor-pointer"
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Section({ icon: Icon, title, items, chip }: { icon: React.ElementType; title: string; items: string[]; chip?: boolean }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-primary" />
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      </div>
      {chip ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item, i) => (
            <span key={i} className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
              {item}
            </span>
          ))}
        </div>
      ) : (
        <ul className="space-y-1.5">
          {items.map((item, i) => (
            <li key={i} className="text-sm text-secondary-foreground flex gap-2">
              <span className="text-primary mt-0.5">•</span>
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
