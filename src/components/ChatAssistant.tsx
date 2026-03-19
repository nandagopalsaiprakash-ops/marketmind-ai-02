import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Sparkles, Zap, Plus, Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useChatPersistence } from "@/hooks/useChatPersistence";
import { detectToolsInText } from "@/data/toolsDatabase";
import ToolCards from "@/components/ToolCards";
import VoiceInput from "@/components/VoiceInput";

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
  const {
    sessions,
    activeSessionId,
    messages,
    setMessages,
    loadSession,
    createSession,
    saveMessage,
    newChat,
  } = useChatPersistence();

  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  const copyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const streamChat = async (allMessages: { role: string; content: string }[]) => {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: allMessages, technicalMode }),
    });

    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({ error: "Request failed" }));
      if (resp.status === 429) {
        toast({ title: "Rate Limited", description: errorData.error || "Please try again in a moment.", variant: "destructive" });
      } else if (resp.status === 402) {
        toast({ title: "Credits Exhausted", description: errorData.error || "Please add credits.", variant: "destructive" });
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

    const processLine = (line: string) => {
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "" || !line.startsWith("data: ")) return false;
      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") return true;
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
            return [...prev, { id: crypto.randomUUID(), role: "assistant" as const, content: assistantSoFar, timestamp: new Date() }];
          });
        }
      } catch {
        return false;
      }
      return false;
    };

    let streamDone = false;
    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });
      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        const line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);
        if (processLine(line)) { streamDone = true; break; }
      }
    }

    if (textBuffer.trim()) {
      for (const raw of textBuffer.split("\n")) {
        if (raw) processLine(raw);
      }
    }

    return assistantSoFar;
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

    let sessionId = activeSessionId;
    if (!sessionId) {
      sessionId = await createSession(trimmed);
    }
    if (sessionId) await saveMessage(sessionId, "user", trimmed);

    const apiMessages = [...messages, userMsg].map(m => ({
      role: m.role,
      content: m.role === "user" && m.id === userMsg.id ? fullContent : m.content,
    }));

    try {
      const assistantContent = await streamChat(apiMessages);
      if (sessionId && assistantContent) {
        await saveMessage(sessionId, "assistant", assistantContent);
      }
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
      <div className="border-b border-border p-3 md:p-4 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h2 className="font-display font-bold text-base md:text-lg text-foreground">AI Marketing Assistant</h2>
          <p className="text-[10px] md:text-xs text-muted-foreground truncate">Powered by Lovable AI</p>
        </div>
        <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
          <button
            onClick={() => { newChat(); setShowHistory(false); }}
            className="flex items-center gap-1 px-2 md:px-3 py-1.5 rounded-full text-[10px] md:text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all"
          >
            <Plus className="w-3 h-3" /> <span className="hidden sm:inline">New</span>
          </button>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={cn(
              "px-2 md:px-3 py-1.5 rounded-full text-[10px] md:text-xs font-medium transition-all",
              showHistory ? "gradient-accent text-accent-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            History
          </button>
          <button
            onClick={() => onTechnicalModeChange(!technicalMode)}
            className={cn(
              "flex items-center gap-1 px-2 md:px-3 py-1.5 rounded-full text-[10px] md:text-xs font-medium transition-all",
              technicalMode ? "gradient-accent text-accent-foreground shadow-glow" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            <Zap className="w-3 h-3" />
            <span className="hidden sm:inline">Technical</span> {technicalMode ? "ON" : "OFF"}
          </button>
        </div>
      </div>

      {/* History panel */}
      <AnimatePresence>
        {showHistory && sessions.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-border overflow-hidden"
          >
            <div className="px-4 py-2 max-h-40 overflow-y-auto space-y-1">
              {sessions.map(s => (
                <button
                  key={s.id}
                  onClick={() => { loadSession(s.id); setShowHistory(false); }}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg text-xs transition-all truncate",
                    activeSessionId === s.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  {s.title}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Tags */}
      <div className="px-3 md:px-4 py-2 flex gap-1.5 md:gap-2 overflow-x-auto border-b border-border">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
            className={cn(
              "px-2.5 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-medium whitespace-nowrap transition-all",
              activeCategory === cat ? "gradient-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-4">
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
                <div className="max-w-[85%] md:max-w-[75%] gradient-primary text-primary-foreground px-4 py-3 rounded-2xl rounded-br-md text-sm">
                  {msg.content}
                </div>
              ) : (
                <div className="max-w-[95%] md:max-w-[85%] bg-card border border-border rounded-2xl rounded-bl-md p-4 group relative">
                  <button
                    onClick={() => copyMessage(msg.id, msg.content)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-secondary/80 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground transition-all"
                    title="Copy response"
                  >
                    {copiedId === msg.id ? <Check className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3" />}
                  </button>
                  <div className="prose prose-sm prose-invert max-w-none [&_h1]:font-display [&_h1]:text-lg [&_h1]:text-foreground [&_h2]:font-display [&_h2]:text-base [&_h2]:text-foreground [&_h3]:font-display [&_h3]:text-sm [&_h3]:text-foreground [&_p]:text-secondary-foreground [&_p]:text-sm [&_p]:leading-relaxed [&_li]:text-secondary-foreground [&_li]:text-sm [&_strong]:text-foreground [&_code]:text-primary [&_code]:bg-secondary [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_a]:text-primary [&_blockquote]:border-primary/30 [&_hr]:border-border">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                  <ToolCards tools={detectToolsInText(msg.content)} />
                  <p className="text-[9px] text-muted-foreground mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-muted-foreground text-sm">
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
      <div className="border-t border-border p-3 md:p-4">
        <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 md:px-4 py-2 focus-within:border-primary/50 focus-within:shadow-glow transition-all">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Ask about marketing strategies, SEO, ads..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            disabled={isStreaming}
          />
          <VoiceInput onTranscript={(text) => setInput(prev => prev ? `${prev} ${text}` : text)} disabled={isStreaming} />
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
