import { useState } from "react";
import AppSidebar from "@/components/AppSidebar";
import ChatAssistant from "@/components/ChatAssistant";
import LearningAcademy from "@/components/LearningAcademy";
import StrategyGenerator from "@/components/StrategyGenerator";
import ToolsDashboard from "@/components/ToolsDashboard";
import ContentGenerator from "@/components/ContentGenerator";
import KpiDashboard from "@/components/KpiDashboard";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "@/hooks/useTheme";
import { Sun, Moon, Search, Zap } from "lucide-react";
import VoiceInput from "@/components/VoiceInput";
import PitStopPopup from "@/components/PitStopPopup";

type Section = "chat" | "academy" | "strategy" | "tools" | "content" | "dashboard";

const sectionTitles: Record<Section, string> = {
  chat: "AI Assistant",
  dashboard: "KPI Dashboard",
  academy: "Learning Academy",
  strategy: "Strategy Generator",
  tools: "Marketing Tools",
  content: "Content Generator",
};

const Index = () => {
  const [activeSection, setActiveSection] = useState<Section>("chat");
  const [technicalMode, setTechnicalMode] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<string[]>([]);
  const [pitStop, setPitStop] = useState<{ show: boolean; mode: "technical" | "beginner" }>({
    show: false,
    mode: "beginner",
  });
  const isMobile = useIsMobile();
  const { theme, toggleTheme } = useTheme();

  const handleTechnicalToggle = () => {
    const next = !technicalMode;
    setTechnicalMode(next);
    setPitStop({ show: true, mode: next ? "technical" : "beginner" });
  };

  const handleNewMessage = (msg: string) => {
    setConversationHistory(prev => [...prev, msg]);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        conversationHistory={conversationHistory}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Premium header */}
        <header className={`border-b border-border/50 px-4 md:px-6 py-3 flex items-center justify-between gradient-glass ${isMobile ? 'pl-14' : ''}`}>
          <div className="flex items-center gap-3 min-w-0">
            <div>
              <h1 className="font-display font-bold text-foreground text-body-lg md:text-h3 tracking-tight">
                <span className="gradient-text">MarketMind</span>
              </h1>
              <p className="text-micro text-muted-foreground hidden sm:block">
                {sectionTitles[activeSection]}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Technical mode toggle */}
            <button
              onClick={handleTechnicalToggle}
              title={technicalMode ? "Technical mode is ON — click to switch back to beginner mode" : "Turn on technical mode for deeper, expert-level answers"}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-caption font-medium transition-all ${
                technicalMode
                  ? "bg-technical/15 text-technical border border-technical/30 shadow-glow"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${technicalMode ? "fill-technical" : ""}`} />
              <span className="hidden sm:inline">{technicalMode ? "Technical ON" : "Technical"}</span>
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          {activeSection === "chat" && (
            <ChatAssistant
              technicalMode={technicalMode}
              onTechnicalModeChange={setTechnicalMode}
              onNewMessage={handleNewMessage}
            />
          )}
          {activeSection === "dashboard" && <KpiDashboard />}
          {activeSection === "academy" && <LearningAcademy />}
          {activeSection === "strategy" && <StrategyGenerator />}
          {activeSection === "content" && <ContentGenerator />}
          {activeSection === "tools" && <ToolsDashboard />}
        </div>
      </main>
    </div>
  );
};

export default Index;
