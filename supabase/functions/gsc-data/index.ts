import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function refreshIfNeeded(admin: any, conn: any) {
  const expiresAt = new Date(conn.token_expires_at).getTime();
  if (expiresAt - Date.now() > 60_000) return conn.access_token;

  const clientId = Deno.env.get("GOOGLE_OAUTH_CLIENT_ID")!;
  const clientSecret = Deno.env.get("GOOGLE_OAUTH_CLIENT_SECRET")!;
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: conn.refresh_token,
      grant_type: "refresh_token",
    }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(`Refresh failed: ${JSON.stringify(j)}`);
  const newExpires = new Date(Date.now() + (j.expires_in ?? 3600) * 1000).toISOString();
  await admin.from("gsc_connections").update({
    access_token: j.access_token,
    token_expires_at: newExpires,
    updated_at: new Date().toISOString(),
  }).eq("user_id", conn.user_id);
  return j.access_token as string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const userClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authHeader } } });
    const { data: claims, error: cErr } = await userClient.auth.getClaims(authHeader.replace("Bearer ", ""));
    if (cErr || !claims?.claims) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const userId = claims.claims.sub as string;

    const body = await req.json().catch(() => ({}));
    const action = body.action as "list_sites" | "select_site" | "fetch_metrics";

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: conn } = await admin.from("gsc_connections").select("*").eq("user_id", userId).maybeSingle();
    if (!conn) return new Response(JSON.stringify({ error: "not_connected" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const accessToken = await refreshIfNeeded(admin, conn);

    if (action === "list_sites") {
      const r = await fetch("https://searchconsole.googleapis.com/webmasters/v3/sites", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const j = await r.json();
      const sites = (j.siteEntry || []).map((s: any) => ({ url: s.siteUrl, permission: s.permissionLevel }));
      return new Response(JSON.stringify({ sites, selected: conn.selected_site }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "select_site") {
      const site = String(body.site || "");
      await admin.from("gsc_connections").update({ selected_site: site, updated_at: new Date().toISOString() }).eq("user_id", userId);
      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "fetch_metrics") {
      const site = conn.selected_site;
      if (!site) return new Response(JSON.stringify({ error: "no_site_selected" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const end = new Date();
      const start = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000);
      const fmt = (d: Date) => d.toISOString().split("T")[0];

      const queryUrl = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`;
      const headers = { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };

      // Run three queries in parallel: by date, by query, totals
      const [byDateR, byQueryR, byPageR] = await Promise.all([
        fetch(queryUrl, { method: "POST", headers, body: JSON.stringify({ startDate: fmt(start), endDate: fmt(end), dimensions: ["date"], rowLimit: 1000 }) }),
        fetch(queryUrl, { method: "POST", headers, body: JSON.stringify({ startDate: fmt(start), endDate: fmt(end), dimensions: ["query"], rowLimit: 25 }) }),
        fetch(queryUrl, { method: "POST", headers, body: JSON.stringify({ startDate: fmt(start), endDate: fmt(end), dimensions: ["page"], rowLimit: 10 }) }),
      ]);
      const [byDate, byQuery, byPage] = await Promise.all([byDateR.json(), byQueryR.json(), byPageR.json()]);

      const series = (byDate.rows || []).map((r: any) => ({
        date: r.keys[0],
        clicks: r.clicks,
        impressions: r.impressions,
        ctr: +(r.ctr * 100).toFixed(2),
        position: +r.position.toFixed(1),
      }));
      const keywords = (byQuery.rows || []).map((r: any) => ({
        keyword: r.keys[0],
        clicks: r.clicks,
        impressions: r.impressions,
        ctr: +(r.ctr * 100).toFixed(2),
        position: +r.position.toFixed(1),
      }));
      const pages = (byPage.rows || []).map((r: any) => ({
        page: r.keys[0],
        clicks: r.clicks,
        impressions: r.impressions,
        ctr: +(r.ctr * 100).toFixed(2),
        position: +r.position.toFixed(1),
      }));

      const totals = series.reduce(
        (acc: any, r: any) => ({ clicks: acc.clicks + r.clicks, impressions: acc.impressions + r.impressions, position: acc.position + r.position, ctr: acc.ctr + r.ctr, n: acc.n + 1 }),
        { clicks: 0, impressions: 0, position: 0, ctr: 0, n: 0 },
      );
      const summary = {
        clicks: totals.clicks,
        impressions: totals.impressions,
        avg_ctr: totals.n ? +(totals.ctr / totals.n).toFixed(2) : 0,
        avg_position: totals.n ? +(totals.position / totals.n).toFixed(1) : 0,
        site,
      };

      return new Response(JSON.stringify({ summary, series, keywords, pages }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "unknown_action" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("gsc-data err", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});