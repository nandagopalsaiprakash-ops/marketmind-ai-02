import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM = `You are a senior digital marketing strategist. Given real Google Search Console data for a website, produce a concise, marketing-focused improvement plan in JSON.

Return STRICT JSON with this shape:
{
  "audience_insights": [string, string, string],   // 3 short bullets about who is finding this site and intent signals
  "content_opportunities": [{"title": string, "why": string}],  // 4 items
  "ad_opportunities": [{"keyword": string, "reason": string}],  // 3 items based on high-impression low-CTR keywords
  "conversion_tips": [string, string, string, string],  // 4 actionable tips
  "priority_actions": [{"action": string, "impact": "High"|"Medium"|"Low", "effort": "Low"|"Medium"|"High"}]  // top 5
}
No prose outside the JSON.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { summary, keywords, pages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const userMsg = `Site: ${summary?.site}
Last 28 days: ${summary?.clicks} clicks, ${summary?.impressions} impressions, avg CTR ${summary?.avg_ctr}%, avg position ${summary?.avg_position}.

Top keywords (clicks / impressions / ctr% / position):
${(keywords || []).slice(0, 15).map((k: any) => `- "${k.keyword}" — ${k.clicks}/${k.impressions}/${k.ctr}%/${k.position}`).join("\n")}

Top pages:
${(pages || []).slice(0, 10).map((p: any) => `- ${p.page} — ${p.clicks} clicks, ${p.impressions} impr, pos ${p.position}`).join("\n")}`;

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: userMsg },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (!r.ok) {
      if (r.status === 429) return new Response(JSON.stringify({ error: "Rate limited." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (r.status === 402) return new Response(JSON.stringify({ error: "Credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI gateway: ${r.status}`);
    }
    const data = await r.json();
    const content = data.choices?.[0]?.message?.content || "{}";
    let parsed: unknown = {};
    try { parsed = JSON.parse(content); } catch { parsed = { raw: content }; }
    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});