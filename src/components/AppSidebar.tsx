import { useState } from "react";
import { MessageSquare, GraduationCap, Lightbulb, Wrench, Brain, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Section = "chat" | "academy" | "strategy" | "tools";

interface AppSidebarProps {
  activeSection: Section;
  onSectionChange: (section: Section) => void;
  conversationHistory: string[];
}

const navItems = [
  { id: "chat" as Section, label: "AI Assistant", icon: MessageSquare },
  { id: "academy" as Section, label: "Learning Academy", icon: GraduationCap },
  { id: "strategy" as Section, label: "Strategy Generator", icon: Lightbulb },
  { id: "tools" as Section, label: "Marketing Tools", icon: Wrench },
];

export default function AppSidebar({ activeSection, onSectionChange, conversationHistory }: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={cn(
      "h-screen flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
          <Brain className="w-5 h-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="font-display font-bold text-foreground text-sm leading-tight">MarketMind</h1>
            <p className="text-[10px] text-muted-foreground leading-tight">AI Marketing Assistant</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronRight className={cn("w-4 h-4 transition-transform", collapsed ? "" : "rotate-180")} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
              activeSection === item.id
                ? "gradient-primary text-primary-foreground shadow-glow"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span className="font-medium">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Conversation History */}
      {!collapsed && activeSection === "chat" && conversationHistory.length > 0 && (
        <div className="p-3 border-t border-sidebar-border">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 font-medium">Recent Chats</p>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {conversationHistory.slice(-5).map((msg, i) => (
              <div key={i} className="text-xs text-sidebar-foreground truncate px-2 py-1.5 rounded hover:bg-sidebar-accent cursor-pointer transition-colors">
                {msg}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      {!collapsed && (
        <div className="p-3 border-t border-sidebar-border">
          <p className="text-[10px] text-muted-foreground text-center">MarketMind v1.0</p>
        </div>
      )}
    </aside>
  );
}
