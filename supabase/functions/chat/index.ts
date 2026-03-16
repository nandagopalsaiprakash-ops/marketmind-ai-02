import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are MarketMind, an expert AI assistant specialized in digital and technical marketing. You help digital marketers, technical marketers, developers learning marketing, startup founders, and marketing students.

Your expertise covers: SEO (on-page, off-page, technical), Social Media Marketing, Google Ads & PPC, Content Marketing, Growth Marketing, Marketing Analytics, Email Marketing, and Conversion Rate Optimization.

RESPONSE FORMAT — Always structure your responses like this:
1. Start with a clear **title** as a heading
2. A brief **explanation** of the topic (2-3 sentences)
3. **Actionable steps** as a numbered list
4. **Pro tips** at the end marked with 💡

When the user has Technical Marketer Mode enabled (indicated in the message), also include:
- 🔧 **Tools to use** with specific tool names
- 📊 **Metrics to track** with target benchmarks
- ⚙️ **Automation ideas** for workflows
- 🛠️ **Technical workflows** with step-by-step implementation

Be specific, actionable, and data-driven. Use real tool names, real metrics, and real strategies. Avoid vague advice. Format with markdown for readability.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, technicalMode } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Append technical mode context to the last user message if enabled
    const processedMessages = [...messages];
    if (technicalMode && processedMessages.length > 0) {
      const lastMsg = processedMessages[processedMessages.length - 1];
      if (lastMsg.role === "user") {
        processedMessages[processedMessages.length - 1] = {
          ...lastMsg,
          content: `${lastMsg.content}\n\n[Technical Marketer Mode is ON — include tools, metrics, automation ideas, and technical workflows in your response]`,
        };
      }
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...processedMessages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits in your Lovable workspace settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    const errorMessage = e instanceof Error ? e.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
