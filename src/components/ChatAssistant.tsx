import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Plus, Copy, Check, Bot, User } from "lucide-react";
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
      <div className="border-b border-border/50 p-3 md:p-4 flex items-center justify-between gap-2 gradient-glass">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center shadow-glow flex-shrink-0">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <h2 className="font-display font-bold text-body text-foreground">AI Marketing Assistant</h2>
            <p className="text-micro text-muted-foreground">Powered by Lovable AI</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => { newChat(); setShowHistory(false); }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-caption font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all"
          >
            <Plus className="w-3 h-3" /> <span className="hidden sm:inline">New</span>
          </button>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={cn(
              "px-2.5 py-1.5 rounded-xl text-caption font-medium transition-all",
              showHistory ? "bg-accent/15 text-accent border border-accent/30" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            History
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
            className="border-b border-border/50 overflow-hidden"
          >
            <div className="px-4 py-2 max-h-40 overflow-y-auto space-y-0.5">
              {sessions.map(s => (
                <button
                  key={s.id}
                  onClick={() => { loadSession(s.id); setShowHistory(false); }}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-xl text-caption transition-all truncate",
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
      <div className="px-3 md:px-4 py-2 flex gap-1.5 overflow-x-auto border-b border-border/50">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
            className={cn(
              "px-3 py-1 rounded-xl text-caption font-medium whitespace-nowrap transition-all",
              activeCategory === cat ? "gradient-primary text-primary-foreground shadow-glow" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 md:p-5 space-y-5">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full text-center space-y-6"
          >
            <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
              <Sparkles className="w-10 h-10 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-display font-bold text-h2 text-foreground mb-2">Welcome to MarketMind</h3>
              <p className="text-body text-muted-foreground max-w-md">
                Your AI-powered marketing assistant. Ask questions, get strategies, and learn marketing.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-lg">
              {quickQuestions.map(q => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="text-left px-4 py-3.5 rounded-2xl glass-card text-body text-foreground hover:border-primary/50 hover:shadow-glow transition-all group"
                >
                  <span className="group-hover:text-primary transition-colors">{q}</span>
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
              className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 mt-1 shadow-glow">
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
              {msg.role === "user" ? (
                <div className="max-w-[85%] md:max-w-[75%]">
                  <div className="gradient-primary text-primary-foreground px-4 py-3 rounded-2xl rounded-br-md text-body shadow-glow">
                    {msg.content}
                  </div>
                  <p className="text-micro text-muted-foreground mt-1 text-right opacity-60">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ) : (
                <div className="max-w-[90%] md:max-w-[82%] glass-card p-4 group relative">
                  <button
                    onClick={() => copyMessage(msg.id, msg.content)}
                    className="absolute top-3 right-3 p-1.5 rounded-lg bg-secondary/80 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground transition-all"
                    title="Copy response"
                  >
                    {copiedId === msg.id ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
                  </button>
                  <div className="prose prose-sm prose-invert max-w-none [&_h1]:font-display [&_h1]:text-h3 [&_h1]:text-foreground [&_h1]:mt-4 [&_h1]:mb-2 [&_h2]:font-display [&_h2]:text-body-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:mt-3 [&_h2]:mb-1.5 [&_h3]:font-display [&_h3]:text-body [&_h3]:font-medium [&_h3]:text-foreground [&_h3]:mt-2 [&_h3]:mb-1 [&_p]:text-secondary-foreground [&_p]:text-body [&_p]:leading-relaxed [&_li]:text-secondary-foreground [&_li]:text-body [&_strong]:text-foreground [&_code]:text-primary [&_code]:bg-secondary [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:text-caption [&_a]:text-primary [&_blockquote]:border-primary/30 [&_blockquote]:bg-primary/5 [&_blockquote]:rounded-r-lg [&_blockquote]:py-1 [&_hr]:border-border">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                  <ToolCards tools={detectToolsInText(msg.content)} />
                  <p className="text-micro text-muted-foreground mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              )}
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-xl gradient-accent flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-4 h-4 text-accent-foreground" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 text-muted-foreground">
            <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <Bot className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="glass-panel px-4 py-3 flex items-center gap-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="text-caption">MarketMind is thinking...</span>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border/50 p-3 md:p-4 gradient-glass">
        <div className="flex items-center gap-2 bg-card/80 border border-border/50 rounded-2xl px-4 py-2.5 focus-within:border-primary/50 focus-within:shadow-glow transition-all backdrop-blur-sm">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Ask about marketing strategies, SEO, ads..."
            className="flex-1 bg-transparent text-body text-foreground placeholder:text-muted-foreground outline-none"
            disabled={isStreaming}
          />
          <VoiceInput onTranscript={(text) => setInput(prev => prev ? `${prev} ${text}` : text)} disabled={isStreaming} />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="p-2.5 rounded-xl gradient-primary text-primary-foreground disabled:opacity-40 transition-all hover:shadow-glow"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
