import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const categories = ["SEO", "Social Media", "Content", "Advertising", "Analytics", "Growth"];

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

interface ChatAssistantProps {
  technicalMode: boolean;
  onTechnicalModeChange: (v: boolean) => void;
  onNewMessage: (msg: string) => void;
}

export default function ChatAssistant({ technicalMode, onTechnicalModeChange, onNewMessage }: ChatAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  const streamChat = async (allMessages: { role: string; content: string }[]) => {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        messages: allMessages,
        technicalMode,
      }),
    });

    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({ error: "Request failed" }));
      if (resp.status === 429) {
        toast({ title: "Rate Limited", description: errorData.error || "Please try again in a moment.", variant: "destructive" });
      } else if (resp.status === 402) {
        toast({ title: "Credits Exhausted", description: errorData.error || "Please add credits to your workspace.", variant: "destructive" });
      } else {
        toast({ title: "Error", description: errorData.error || "Something went wrong.", variant: "destructive" });
      }
      throw new Error(errorData.error);
    }

    if (!resp.body) throw new Error("No response body");

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let assistantSoFar = "";
    let streamDone = false;

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") {
          streamDone = true;
          break;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            assistantSoFar += content;
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant") {
                return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
              }
              return [...prev, { id: crypto.randomUUID(), role: "assistant", content: assistantSoFar, timestamp: new Date() }];
            });
          }
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    // Final flush
    if (textBuffer.trim()) {
      for (let raw of textBuffer.split("\n")) {
        if (!raw) continue;
        if (raw.endsWith("\r")) raw = raw.slice(0, -1);
        if (raw.startsWith(":") || raw.trim() === "") continue;
        if (!raw.startsWith("data: ")) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            assistantSoFar += content;
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant") {
                return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
              }
              return [...prev, { id: crypto.randomUUID(), role: "assistant", content: assistantSoFar, timestamp: new Date() }];
            });
          }
        } catch { /* ignore */ }
      }
    }
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    const categoryPrefix = activeCategory ? `[Category: ${activeCategory}] ` : "";
    const fullContent = categoryPrefix + trimmed;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsStreaming(true);
    onNewMessage(trimmed);

    const apiMessages = [...messages, userMsg].map(m => ({
      role: m.role,
      content: m.role === "user" && m.id === userMsg.id ? fullContent : m.content,
    }));

    try {
      await streamChat(apiMessages);
    } catch (e) {
      console.error("Stream error:", e);
    } finally {
      setIsStreaming(false);
    }
  };

  const quickQuestions = [
    "How to improve Google ranking",
    "Best time to post on Instagram",
    "How to run Google Ads campaigns",
    "How to perform technical SEO audit",
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border p-4 flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-lg text-foreground">AI Marketing Assistant</h2>
          <p className="text-xs text-muted-foreground">Powered by Lovable AI — ask anything about digital & technical marketing</p>
        </div>
        <button
          onClick={() => onTechnicalModeChange(!technicalMode)}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
            technicalMode
              ? "gradient-accent text-accent-foreground shadow-glow"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          )}
        >
          <Zap className="w-3 h-3" />
          Technical Mode {technicalMode ? "ON" : "OFF"}
        </button>
      </div>

      {/* Category Tags */}
      <div className="px-4 py-2 flex gap-2 overflow-x-auto border-b border-border">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all",
              activeCategory === cat
                ? "gradient-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full text-center space-y-6"
          >
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
              <Sparkles className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-display font-bold text-xl text-foreground mb-1">Welcome to MarketMind</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Your AI-powered marketing assistant. Ask questions, get strategies, and learn marketing.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {quickQuestions.map(q => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="text-left px-4 py-3 rounded-xl bg-card border border-border text-sm text-foreground hover:border-primary/50 hover:shadow-glow transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
            >
              {msg.role === "user" ? (
                <div className="max-w-[75%] gradient-primary text-primary-foreground px-4 py-3 rounded-2xl rounded-br-md text-sm">
                  {msg.content}
                </div>
              ) : (
                <div className="max-w-[85%] bg-card border border-border rounded-2xl rounded-bl-md p-4">
                  <div className="prose prose-sm prose-invert max-w-none [&_h1]:font-display [&_h1]:text-lg [&_h1]:text-foreground [&_h2]:font-display [&_h2]:text-base [&_h2]:text-foreground [&_h3]:font-display [&_h3]:text-sm [&_h3]:text-foreground [&_p]:text-secondary-foreground [&_p]:text-sm [&_p]:leading-relaxed [&_li]:text-secondary-foreground [&_li]:text-sm [&_strong]:text-foreground [&_code]:text-primary [&_code]:bg-secondary [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_a]:text-primary [&_blockquote]:border-primary/30 [&_hr]:border-border">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-muted-foreground text-sm"
          >
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <span className="text-xs">MarketMind is thinking...</span>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2 focus-within:border-primary/50 focus-within:shadow-glow transition-all">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Ask about marketing strategies, SEO, ads..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            disabled={isStreaming}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="p-2 rounded-lg gradient-primary text-primary-foreground disabled:opacity-40 transition-opacity hover:shadow-glow"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
