import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getResponse, type MarketingResponse } from "@/data/marketingData";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  response?: MarketingResponse;
  timestamp: Date;
}

const categories = ["SEO", "Social Media", "Content", "Advertising", "Analytics", "Growth"];

interface ChatAssistantProps {
  technicalMode: boolean;
  onTechnicalModeChange: (v: boolean) => void;
  onNewMessage: (msg: string) => void;
}

export default function ChatAssistant({ technicalMode, onTechnicalModeChange, onNewMessage }: ChatAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    onNewMessage(trimmed);

    setTimeout(() => {
      const response = getResponse(trimmed, technicalMode);
      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response.title,
        response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 1200 + Math.random() * 800);
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
          <p className="text-xs text-muted-foreground">Ask anything about digital & technical marketing</p>
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
                  onClick={() => { setInput(q); }}
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
                <div className="max-w-[85%] bg-card border border-border rounded-2xl rounded-bl-md p-4 space-y-3">
                  {msg.response && (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium gradient-primary text-primary-foreground">
                          {msg.response.category}
                        </span>
                        <h4 className="font-display font-bold text-foreground text-sm">{msg.response.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">{msg.response.explanation}</p>
                      <div>
                        <p className="text-xs font-semibold text-foreground mb-1.5">📋 Steps:</p>
                        <ul className="space-y-1">
                          {msg.response.steps.map((step, i) => (
                            <li key={i} className="text-sm text-secondary-foreground flex gap-2">
                              <span className="text-primary font-mono text-xs mt-0.5">{i + 1}.</span>
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="border-t border-border pt-2">
                        <p className="text-xs font-semibold text-foreground mb-1">💡 Pro Tips:</p>
                        {msg.response.proTips.map((tip, i) => (
                          <p key={i} className="text-sm text-accent italic">{tip}</p>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
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
            onKeyDown={e => e.key === "Enter" && handleSend()}
            placeholder="Ask about marketing strategies, SEO, ads..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-2 rounded-lg gradient-primary text-primary-foreground disabled:opacity-40 transition-opacity hover:shadow-glow"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
