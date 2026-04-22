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
    const { data: userData, error: cErr } = await userClient.auth.getUser(authHeader.replace("Bearer ", ""));
    if (cErr || !userData?.user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const userId = userData.user.id;

    const body = await req.json().catch(() => ({}));
    const action = body.action as "list_sites" | "select_site" | "fetch_metrics";

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: conn, error: connErr } = await admin.from("gsc_connections").select("*").eq("user_id", userId).maybeSingle();
    if (connErr) {
      console.error(JSON.stringify({ level: "error", scope: "gsc-data", code: "db_error", user_id: userId, message: connErr.message }));
      return new Response(JSON.stringify({ status: "error", code: "db_error", message: "Could not load connection." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!conn) {
      console.log(JSON.stringify({ level: "info", scope: "gsc-data", code: "not_connected", user_id: userId }));
      return new Response(JSON.stringify({ status: "not_connected", code: "not_connected", message: "Google Search Console is not connected." }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let accessToken: string;
    try {
      accessToken = await refreshIfNeeded(admin, conn);
    } catch (e) {
      console.error(JSON.stringify({ level: "error", scope: "gsc-data", code: "token_refresh_failed", user_id: userId, message: e instanceof Error ? e.message : String(e) }));
      return new Response(JSON.stringify({ status: "error", code: "token_refresh_failed", message: "Google session expired. Please reconnect." }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "list_sites") {
      const r = await fetch("https://searchconsole.googleapis.com/webmasters/v3/sites", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const j = await r.json();
      if (!r.ok) {
        console.error(JSON.stringify({ level: "error", scope: "gsc-data", code: "gsc_api_error", action: "list_sites", user_id: userId, http_status: r.status, body: j }));
        return new Response(JSON.stringify({ status: "error", code: "gsc_api_error", message: j?.error?.message || "Search Console API error." }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const sites = (j.siteEntry || []).map((s: any) => ({ url: s.siteUrl, permission: s.permissionLevel }));
      return new Response(JSON.stringify({ status: "ok", sites, selected: conn.selected_site }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "select_site") {
      const site = String(body.site || "");
      await admin.from("gsc_connections").update({ selected_site: site, updated_at: new Date().toISOString() }).eq("user_id", userId);
      return new Response(JSON.stringify({ status: "ok" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "fetch_metrics") {
      const site = conn.selected_site;
      if (!site) {
        console.log(JSON.stringify({ level: "info", scope: "gsc-data", code: "no_site_selected", user_id: userId }));
        return new Response(JSON.stringify({ status: "no_site_selected", code: "no_site_selected", message: "No site selected." }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const end = new Date();
      const start = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000);
      const fmt = (d: Date) => d.toISOString().split("T")[0];

      const queryUrl = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`;
      const headers = { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };

      const [byDateR, byQueryR, byPageR] = await Promise.all([
        fetch(queryUrl, { method: "POST", headers, body: JSON.stringify({ startDate: fmt(start), endDate: fmt(end), dimensions: ["date"], rowLimit: 1000 }) }),
        fetch(queryUrl, { method: "POST", headers, body: JSON.stringify({ startDate: fmt(start), endDate: fmt(end), dimensions: ["query"], rowLimit: 25 }) }),
        fetch(queryUrl, { method: "POST", headers, body: JSON.stringify({ startDate: fmt(start), endDate: fmt(end), dimensions: ["page"], rowLimit: 10 }) }),
      ]);
      const [byDate, byQuery, byPage] = await Promise.all([byDateR.json(), byQueryR.json(), byPageR.json()]);

      const failed = [byDateR, byQueryR, byPageR].find((r) => !r.ok);
      if (failed) {
        console.error(JSON.stringify({ level: "error", scope: "gsc-data", code: "gsc_api_error", action: "fetch_metrics", user_id: userId, site, http_status: failed.status, body: { byDate, byQuery, byPage } }));
        const msg = (byDate?.error || byQuery?.error || byPage?.error)?.message || "Search Console API error.";
        return new Response(JSON.stringify({ status: "error", code: "gsc_api_error", message: msg }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

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

      console.log(JSON.stringify({ level: "info", scope: "gsc-data", code: "ok", action: "fetch_metrics", user_id: userId, site, rows: series.length }));
      return new Response(JSON.stringify({ status: "ok", summary, series, keywords, pages }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ status: "error", code: "unknown_action", message: "Unknown action." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error(JSON.stringify({ level: "error", scope: "gsc-data", code: "unhandled", message: e instanceof Error ? e.message : String(e), stack: e instanceof Error ? e.stack : undefined }));
    return new Response(JSON.stringify({ status: "error", code: "unhandled", message: e instanceof Error ? e.message : "Unknown error." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});