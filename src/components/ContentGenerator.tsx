import { useState } from "react";
import { PenTool, Copy, Check, RefreshCw, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

const CONTENT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-content`;

const contentTypes = [
  { id: "instagram", label: "Instagram Post", icon: "📸" },
  { id: "linkedin", label: "LinkedIn Post", icon: "💼" },
  { id: "blog", label: "Blog Idea", icon: "📝" },
  { id: "adcopy", label: "Ad Copy", icon: "📢" },
  { id: "email", label: "Email Campaign", icon: "📧" },
];

const tones = ["Professional", "Casual", "Witty", "Inspirational", "Urgent"];

export default function ContentGenerator() {
  const [contentType, setContentType] = useState("");
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("Professional");
  const [result, setResult] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generate = async () => {
    if (!contentType || !topic.trim()) return;
    setIsGenerating(true);
    setResult("");
    try {
      const resp = await fetch(CONTENT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ contentType, topic: topic.trim(), tone }),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Failed" }));
        toast({ title: "Error", description: err.error, variant: "destructive" });
        return;
      }
      const data = await resp.json();
      setResult(data.content || "No content generated.");
    } catch {
      toast({ title: "Error", description: "Failed to generate content", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 overflow-y-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-h2 text-foreground">Content Generator</h2>
          <p className="text-body text-muted-foreground mt-1">AI-powered marketing content creation</p>
        </div>
        <div className="w-11 h-11 rounded-2xl gradient-warm flex items-center justify-center shadow-glow flex-shrink-0">
          <PenTool className="w-6 h-6 text-accent-foreground" />
        </div>
      </div>

      {/* Content Type Selection */}
      <div>
        <label className="text-caption font-medium text-muted-foreground mb-2.5 block">Content Type</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {contentTypes.map(ct => (
            <button
              key={ct.id}
              onClick={() => setContentType(ct.id)}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-2xl border text-body font-medium transition-all group",
                contentType === ct.id
                  ? "border-primary/50 bg-primary/10 text-foreground shadow-glow"
                  : "border-border/50 glass-panel text-muted-foreground hover:border-primary/30 hover:text-foreground"
              )}
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">{ct.icon}</span>
              <span className="text-caption text-center leading-tight">{ct.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Topic & Tone */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label className="text-caption font-medium text-muted-foreground mb-1.5 block">Topic / Subject</label>
          <input
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="e.g., Product launch for new fitness app"
            className="w-full bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl px-4 py-3 text-body text-foreground outline-none focus:border-primary/50 focus:shadow-glow transition-all placeholder:text-muted-foreground"
          />
        </div>
        <div>
          <label className="text-caption font-medium text-muted-foreground mb-1.5 block">Tone</label>
          <select
            value={tone}
            onChange={e => setTone(e.target.value)}
            className="w-full bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl px-3 py-3 text-body text-foreground outline-none focus:border-primary/50 focus:shadow-glow transition-all appearance-none cursor-pointer"
          >
            {tones.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* Generate */}
      <button
        onClick={generate}
        disabled={!contentType || !topic.trim() || isGenerating}
        className="gradient-primary text-primary-foreground px-6 py-3 rounded-2xl font-display font-semibold text-body disabled:opacity-40 hover:shadow-glow transition-all flex items-center gap-2 shadow-glow"
      >
        {isGenerating ? (
          <>
            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Generate Content
          </>
        )}
      </button>

      {/* Loading skeleton */}
      {isGenerating && (
        <div className="glass-card p-5 space-y-3">
          <div className="skeleton-shimmer h-5 w-1/3 rounded-lg" />
          <div className="skeleton-shimmer h-4 w-full rounded-lg" />
          <div className="skeleton-shimmer h-4 w-5/6 rounded-lg" />
          <div className="skeleton-shimmer h-4 w-2/3 rounded-lg" />
        </div>
      )}

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-foreground text-body-lg">Generated Content</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={generate}
                  disabled={isGenerating}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary text-secondary-foreground text-caption hover:bg-secondary/80 transition-colors"
                >
                  <RefreshCw className={cn("w-3 h-3", isGenerating && "animate-spin")} />
                  Regenerate
                </button>
                <button
                  onClick={copy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary text-secondary-foreground text-caption hover:bg-secondary/80 transition-colors"
                >
                  {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
            <div className="prose prose-sm prose-invert max-w-none [&_h1]:font-display [&_h1]:text-h3 [&_h1]:text-foreground [&_h2]:font-display [&_h2]:text-body-lg [&_h2]:text-foreground [&_p]:text-secondary-foreground [&_p]:text-body [&_p]:leading-relaxed [&_li]:text-secondary-foreground [&_li]:text-body [&_strong]:text-foreground [&_code]:text-primary">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
