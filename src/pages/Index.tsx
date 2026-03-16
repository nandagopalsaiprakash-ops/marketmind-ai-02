import { useState } from "react";
import AppSidebar from "@/components/AppSidebar";
import ChatAssistant from "@/components/ChatAssistant";
import LearningAcademy from "@/components/LearningAcademy";
import StrategyGenerator from "@/components/StrategyGenerator";
import ToolsDashboard from "@/components/ToolsDashboard";

type Section = "chat" | "academy" | "strategy" | "tools";

const Index = () => {
  const [activeSection, setActiveSection] = useState<Section>("chat");
  const [technicalMode, setTechnicalMode] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<string[]>([]);

  const handleNewMessage = (msg: string) => {
    setConversationHistory(prev => [...prev, msg]);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        conversationHistory={conversationHistory}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="border-b border-border px-6 py-3 flex items-center justify-between bg-card/50 backdrop-blur-sm">
          <div>
            <h1 className="font-display font-bold text-foreground">
              <span className="gradient-text">MarketMind</span>
              <span className="text-muted-foreground font-normal text-sm ml-2">AI Assistant for Digital & Technical Marketing</span>
            </h1>
          </div>
          <p className="text-xs text-muted-foreground hidden md:block">Learn marketing · Build strategies · Optimize campaigns</p>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeSection === "chat" && (
            <ChatAssistant
              technicalMode={technicalMode}
              onTechnicalModeChange={setTechnicalMode}
              onNewMessage={handleNewMessage}
            />
          )}
          {activeSection === "academy" && <LearningAcademy />}
          {activeSection === "strategy" && <StrategyGenerator />}
          {activeSection === "tools" && <ToolsDashboard />}
        </div>
      </main>
    </div>
  );
};

export default Index;
