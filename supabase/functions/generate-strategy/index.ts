import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are MarketMind Strategy Generator — an expert marketing strategist. Given a business type, target audience, and marketing goal, generate a comprehensive, actionable marketing strategy.

RESPONSE FORMAT — Return valid JSON with this exact structure:
{
  "strategy": "Strategy name/title",
  "overview": "2-3 sentence overview of the strategy",
  "tactics": ["tactic 1", "tactic 2", ...],
  "channels": ["channel 1", "channel 2", ...],
  "contentIdeas": ["idea 1", "idea 2", ...],
  "timeline": "Suggested implementation timeline",
  "budget": "Budget recommendation",
  "kpis": ["KPI 1", "KPI 2", ...]
}

Be specific, actionable, and data-driven. Tailor everything to the specific business type, audience, and goal. Include 5-7 items per array. Return ONLY valid JSON, no markdown.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { business, audience, goal } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

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
            {
              role: "user",
              content: `Business Type: ${business}\nTarget Audience: ${audience}\nMarketing Goal: ${goal}\n\nGenerate a comprehensive marketing strategy.`,
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse JSON from the response (handle markdown code blocks)
    let parsed;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = {
        strategy: "Generated Strategy",
        overview: content,
        tactics: [],
        channels: [],
        contentIdeas: [],
        timeline: "N/A",
        budget: "N/A",
        kpis: [],
      };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("strategy error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
