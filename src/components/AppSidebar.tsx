import { useState } from "react";
import { MessageSquare, GraduationCap, Lightbulb, Wrench, Brain, ChevronRight, LogOut, Menu, X, PenTool, FileText, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";

type Section = "chat" | "academy" | "strategy" | "tools" | "content" | "reports" | "dashboard";

interface AppSidebarProps {
  activeSection: Section;
  onSectionChange: (section: Section) => void;
  conversationHistory: string[];
}

const navItems = [
  { id: "chat" as Section, label: "AI Assistant", icon: MessageSquare, badge: "Live" },
  { id: "academy" as Section, label: "Learning Academy", icon: GraduationCap },
  { id: "strategy" as Section, label: "Strategy Generator", icon: Lightbulb },
  { id: "content" as Section, label: "Content Generator", icon: PenTool },
  { id: "reports" as Section, label: "Marketing Reports", icon: FileText },
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

  if (isMobile && !mobileOpen) {
    return (
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-3 left-3 z-50 p-2.5 rounded-xl glass-card text-foreground"
      >
        <Menu className="w-5 h-5" />
      </button>
    );
  }

  return (
    <>
      {isMobile && mobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={cn(
        "h-screen flex flex-col border-r border-sidebar-border transition-all duration-300",
        "bg-sidebar/80 backdrop-blur-xl",
        isMobile
          ? "fixed left-0 top-0 z-50 w-72 shadow-elevated"
          : collapsed ? "w-[68px]" : "w-72"
      )}>
        {/* Logo */}
        <div className="p-4 border-b border-sidebar-border/50 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 shadow-glow">
            <Brain className="w-5 h-5 text-primary-foreground" />
          </div>
          {(!collapsed || isMobile) && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden">
              <h1 className="font-display font-bold text-foreground text-sm leading-tight tracking-tight">MarketMind</h1>
              <p className="text-micro text-muted-foreground leading-tight">AI Marketing Suite</p>
            </motion.div>
          )}
          {isMobile ? (
            <button onClick={() => setMobileOpen(false)} className="ml-auto p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-all">
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={() => setCollapsed(!collapsed)} className="ml-auto p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-all">
              <ChevronRight className={cn("w-4 h-4 transition-transform duration-300", collapsed ? "" : "rotate-180")} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {(!collapsed || isMobile) && (
            <p className="text-micro uppercase tracking-widest text-muted-foreground px-3 pt-2 pb-1.5 font-medium">Navigation</p>
          )}
          {navItems.map(item => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-body transition-all duration-200 group relative",
                  isActive
                    ? "gradient-primary text-primary-foreground shadow-glow"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className={cn("w-[18px] h-[18px] flex-shrink-0", isActive ? "" : "group-hover:scale-110 transition-transform")} />
                {(!collapsed || isMobile) && (
                  <span className="font-medium text-sm">{item.label}</span>
                )}
                {(!collapsed || isMobile) && item.badge && (
                  <span className={cn(
                    "ml-auto text-micro px-2 py-0.5 rounded-full font-semibold",
                    isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-success/15 text-success"
                  )}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Conversation History */}
        <AnimatePresence>
          {(!collapsed || isMobile) && activeSection === "chat" && conversationHistory.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-sidebar-border/50 overflow-hidden"
            >
              <div className="p-3">
                <p className="text-micro uppercase tracking-widest text-muted-foreground mb-2 font-medium">Recent Chats</p>
                <div className="space-y-0.5 max-h-32 overflow-y-auto">
                  {conversationHistory.slice(-5).map((msg, i) => (
                    <div key={i} className="text-caption text-sidebar-foreground truncate px-2.5 py-1.5 rounded-lg hover:bg-sidebar-accent cursor-pointer transition-all">
                      {msg}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        {(!collapsed || isMobile) && (
          <div className="p-3 border-t border-sidebar-border/50 space-y-2">
            {user && (
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-sidebar-accent transition-all group">
                <div className="w-7 h-7 rounded-full gradient-accent flex items-center justify-center flex-shrink-0">
                  <span className="text-micro font-bold text-accent-foreground">{user.email?.[0]?.toUpperCase()}</span>
                </div>
                <p className="text-caption text-muted-foreground truncate flex-1">{user.email}</p>
                <button onClick={signOut} className="text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100" title="Sign out">
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <div className="flex items-center justify-center gap-1.5 px-2">
              <Sparkles className="w-3 h-3 text-primary" />
              <p className="text-micro text-muted-foreground">MarketMind v2.0</p>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
