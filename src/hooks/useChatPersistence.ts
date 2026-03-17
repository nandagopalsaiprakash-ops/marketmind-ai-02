import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export function useChatPersistence() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Load sessions
  const loadSessions = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("chat_sessions")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(20);
    if (data) setSessions(data);
  }, [user]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Load messages for a session
  const loadSession = useCallback(async (sessionId: string) => {
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });
    if (data) {
      setMessages(data.map(m => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: m.content,
        timestamp: new Date(m.created_at),
      })));
      setActiveSessionId(sessionId);
    }
  }, []);

  // Create new session
  const createSession = useCallback(async (title: string): Promise<string | null> => {
    if (!user) return null;
    const { data, error } = await supabase
      .from("chat_sessions")
      .insert({ user_id: user.id, title: title.slice(0, 80) || "New Chat" })
      .select("id")
      .single();
    if (error || !data) return null;
    setActiveSessionId(data.id);
    await loadSessions();
    return data.id;
  }, [user, loadSessions]);

  // Save a message
  const saveMessage = useCallback(async (sessionId: string, role: "user" | "assistant", content: string) => {
    if (!user) return;
    await supabase.from("chat_messages").insert({
      session_id: sessionId,
      user_id: user.id,
      role,
      content,
    });
  }, [user]);

  // Start new chat
  const newChat = useCallback(() => {
    setActiveSessionId(null);
    setMessages([]);
  }, []);

  return {
    sessions,
    activeSessionId,
    messages,
    setMessages,
    loadSession,
    createSession,
    saveMessage,
    newChat,
    loadSessions,
  };
}
