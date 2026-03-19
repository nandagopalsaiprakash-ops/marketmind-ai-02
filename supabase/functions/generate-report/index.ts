import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are MarketMind Report Generator — a senior marketing strategist. Generate a comprehensive, professional marketing report in markdown format.

Structure the report with these sections:
# Marketing Report: [Title]

## Executive Summary
Brief overview of the recommended strategy.

## Market Analysis
Industry landscape, trends, and opportunities.

## Marketing Strategy
Overall approach and positioning.

## SEO Plan
- Target keywords
- Content strategy
- Technical SEO recommendations

## Advertising Plan
- Recommended platforms
- Budget allocation
- Targeting strategy

## Content Strategy
- Content calendar ideas
- Content types and formats
- Distribution channels

## Growth Strategy
- Experiments to run
- Funnel optimization
- Conversion rate optimization

## Tools & Resources
List recommended tools with brief descriptions.

## KPIs & Metrics
Specific metrics to track with target benchmarks.

## Timeline
Month-by-month implementation plan.

Be specific, data-driven, and actionable. Use real numbers and benchmarks.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { business, audience, goal } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Generate a comprehensive marketing report for:\n\nBusiness Type: ${business}\nTarget Audience: ${audience}\nMarketing Goal: ${goal}` },
        ],
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limited." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "Credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI gateway error: ${status}`);
    }

    const data = await response.json();
    const report = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ report }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("report error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
