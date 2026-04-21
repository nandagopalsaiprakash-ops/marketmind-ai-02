import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const REDIRECT_URI = `${Deno.env.get("SUPABASE_URL")}/functions/v1/gsc-oauth-callback`;

function htmlRedirect(target: string, msg: string) {
  return new Response(
    `<!doctype html><html><body style="font-family:system-ui;padding:24px;background:#0a0a0a;color:#eee"><h2>${msg}</h2><p>Redirecting…</p><script>setTimeout(()=>{window.location.href=${JSON.stringify(target)}},800)</script></body></html>`,
    { headers: { "Content-Type": "text/html" } },
  );
}

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const stateRaw = url.searchParams.get("state");
    const errParam = url.searchParams.get("error");

    let returnTo = "/";
    let userId = "";
    try {
      if (stateRaw) {
        const parsed = JSON.parse(atob(stateRaw));
        userId = parsed.uid;
        returnTo = parsed.rt || "/";
      }
    } catch (_) { /* ignore */ }

    if (errParam || !code || !userId) {
      return htmlRedirect(`${returnTo}?gsc=error`, "Connection cancelled");
    }

    const clientId = Deno.env.get("GOOGLE_OAUTH_CLIENT_ID");
    const clientSecret = Deno.env.get("GOOGLE_OAUTH_CLIENT_SECRET");
    if (!clientId || !clientSecret) throw new Error("Google OAuth secrets missing");

    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });
    const tokens = await tokenRes.json();
    if (!tokenRes.ok) {
      console.error("Token exchange failed", tokens);
      return htmlRedirect(`${returnTo}?gsc=error`, "Token exchange failed");
    }

    const expiresAt = new Date(Date.now() + (tokens.expires_in ?? 3600) * 1000).toISOString();

    // Use service role to upsert into RLS-protected table for the resolved user id
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { error: upsertErr } = await admin.from("gsc_connections").upsert({
      user_id: userId,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });
    if (upsertErr) {
      console.error("Upsert failed", upsertErr);
      return htmlRedirect(`${returnTo}?gsc=error`, "Could not save connection");
    }

    return htmlRedirect(`${returnTo}?gsc=connected`, "Google connected ✓");
  } catch (e) {
    console.error("callback err", e);
    return new Response("Error", { status: 500 });
  }
});