import { useState } from "react";
import { MessageSquare, GraduationCap, Lightbulb, Wrench, Brain, ChevronRight, LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();

  const handleNav = (section: Section) => {
    onSectionChange(section);
    if (isMobile) setMobileOpen(false);
  };

  // Mobile hamburger trigger
  if (isMobile && !mobileOpen) {
    return (
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-3 left-3 z-50 p-2 rounded-lg bg-card border border-border text-foreground shadow-card"
      >
        <Menu className="w-5 h-5" />
      </button>
    );
  }

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && mobileOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={cn(
        "h-screen flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
        isMobile
          ? "fixed left-0 top-0 z-50 w-64 shadow-card"
          : collapsed ? "w-16" : "w-64"
      )}>
        {/* Logo */}
        <div className="p-4 border-b border-sidebar-border flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
            <Brain className="w-5 h-5 text-primary-foreground" />
          </div>
          {(!collapsed || isMobile) && (
            <div className="overflow-hidden">
              <h1 className="font-display font-bold text-foreground text-sm leading-tight">MarketMind</h1>
              <p className="text-[10px] text-muted-foreground leading-tight">AI Marketing Assistant</p>
            </div>
          )}
          {isMobile ? (
            <button onClick={() => setMobileOpen(false)} className="ml-auto text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={() => setCollapsed(!collapsed)} className="ml-auto text-muted-foreground hover:text-foreground transition-colors">
              <ChevronRight className={cn("w-4 h-4 transition-transform", collapsed ? "" : "rotate-180")} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
                activeSection === item.id
                  ? "gradient-primary text-primary-foreground shadow-glow"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {(!collapsed || isMobile) && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Conversation History */}
        {(!collapsed || isMobile) && activeSection === "chat" && conversationHistory.length > 0 && (
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
        {(!collapsed || isMobile) && (
          <div className="p-3 border-t border-sidebar-border space-y-2">
            {user && (
              <div className="flex items-center gap-2">
                <p className="text-[10px] text-muted-foreground truncate flex-1">{user.email}</p>
                <button onClick={signOut} className="text-muted-foreground hover:text-foreground transition-colors" title="Sign out">
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <p className="text-[10px] text-muted-foreground text-center">MarketMind v1.0</p>
          </div>
        )}
      </aside>
    </>
  );
}
