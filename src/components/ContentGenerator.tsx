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
          <h2 className="font-display font-bold text-xl md:text-2xl text-foreground">Content Generator</h2>
          <p className="text-sm text-muted-foreground mt-1">AI-powered marketing content creation</p>
        </div>
        <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center shadow-glow">
          <PenTool className="w-5 h-5 text-accent-foreground" />
        </div>
      </div>

      {/* Content Type Selection */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-2 block">Content Type</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {contentTypes.map(ct => (
            <button
              key={ct.id}
              onClick={() => setContentType(ct.id)}
              className={cn(
                "flex flex-col items-center gap-1.5 p-3 rounded-xl border text-sm font-medium transition-all",
                contentType === ct.id
                  ? "border-primary/50 bg-primary/10 text-foreground shadow-glow"
                  : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
              )}
            >
              <span className="text-xl">{ct.icon}</span>
              <span className="text-[11px] text-center leading-tight">{ct.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Topic & Tone */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Topic / Subject</label>
          <input
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="e.g., Product launch for new fitness app"
            className="w-full bg-card border border-border rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/50 focus:shadow-glow transition-all placeholder:text-muted-foreground"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Tone</label>
          <select
            value={tone}
            onChange={e => setTone(e.target.value)}
            className="w-full bg-card border border-border rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/50 focus:shadow-glow transition-all appearance-none cursor-pointer"
          >
            {tones.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* Generate */}
      <button
        onClick={generate}
        disabled={!contentType || !topic.trim() || isGenerating}
        className="gradient-primary text-primary-foreground px-6 py-3 rounded-xl font-display font-semibold text-sm disabled:opacity-40 hover:shadow-glow transition-all flex items-center gap-2"
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

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-semibold text-foreground text-sm">Generated Content</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={generate}
                  disabled={isGenerating}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs hover:bg-secondary/80 transition-colors"
                >
                  <RefreshCw className={cn("w-3 h-3", isGenerating && "animate-spin")} />
                  Regenerate
                </button>
                <button
                  onClick={copy}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs hover:bg-secondary/80 transition-colors"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
            <div className="prose prose-sm prose-invert max-w-none [&_h1]:font-display [&_h1]:text-lg [&_h1]:text-foreground [&_h2]:font-display [&_h2]:text-base [&_h2]:text-foreground [&_p]:text-secondary-foreground [&_p]:text-sm [&_p]:leading-relaxed [&_li]:text-secondary-foreground [&_li]:text-sm [&_strong]:text-foreground [&_code]:text-primary">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
