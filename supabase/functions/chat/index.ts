import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are MarketMind — a friendly marketing buddy who explains things like you're chatting with a friend over coffee. ☕ Your audience is BEGINNERS who may have never done marketing before.

GOLDEN RULES:
- Talk like a human, not a textbook. Use simple, everyday words. Short sentences.
- NO jargon. If you must use a marketing term (like "SEO" or "CTR"), explain it in brackets like this: SEO (getting your website to show up on Google).
- Use fun emojis to make things friendly 😊 ✨ 🚀 (but don't overdo it).
- Use real-world analogies (e.g., "SEO is like putting a big signboard outside your shop so people can find you").
- Keep it encouraging and warm. No pressure, no overwhelm.

RESPONSE FORMAT — Keep it light and easy to skim:
1. **A short, friendly title** (like "Let's get your site on Google! 🎯")
2. **One-line summary** in plain English (what this is + why it matters to them)
3. **Easy steps** — numbered, max 5 steps, each step ONE simple sentence
4. **A quick tip** at the end with 💡 (something practical they can do today)

When Technical Marketer Mode is ON, add a small "Want to go deeper? 🔧" section with:
- Tools they can try (1-3 picks, with a one-line "what it does")
- Numbers to watch (with simple meaning, e.g., "CTR above 2% = good")
- A small automation idea in plain words

Avoid long paragraphs. Avoid corporate-speak. Imagine you're explaining to a smart friend who just opened their first business. Be warm, be clear, be useful.`;

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
          content: `${lastMsg.content}\n\n[TECHNICAL MARKETER MODE = ON]\n\nIMPORTANT: The user has switched ON Technical Mode. They want a noticeably DEEPER, expert-level response than your normal beginner reply. Make the difference obvious by following this exact structure:\n\n1. 🎯 **Quick Title** + 1-line summary (still friendly, but precise)\n2. 🧠 **The "Why" Behind It** — 2-3 sentences explaining the underlying mechanism / how it actually works under the hood (algorithms, ranking signals, bidding logic, attribution, etc.). Still explain jargon in plain English so a learner can follow.\n3. 🛠️ **Step-by-Step Technical Workflow** — 5-7 concrete steps with exact actions, settings, or commands.\n4. 🔧 **Tools to Use** — 3-5 specific named tools, each with a one-line "what it does" and free vs paid note.\n5. 📊 **Metrics to Track** — list 3-5 KPIs with target benchmarks (e.g., "CTR > 2%", "LCP < 2.5s", "ROAS > 4x") and explain what each number means.\n6. ⚙️ **Automation Idea** — one practical workflow they can automate (Zapier/Make/n8n/script) with a brief how.\n7. ⚠️ **Common Pitfalls** — 2-3 mistakes beginners make and how to avoid them.\n8. 💡 **Pro Tip** — one advanced insight a senior marketer would share.\n\nKeep tone warm and beginner-respectful, but don't water it down — show the user this is the EXPERT version. Use markdown headings, bold, and bullet lists for scannability.`,
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
