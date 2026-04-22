import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Link2, RefreshCw, Sparkles, TrendingUp, MousePointerClick, BarChart3, Target, Lightbulb, Megaphone, Users, Zap, Search, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface SiteEntry { url: string; permission: string }
interface SeriesPoint { date: string; clicks: number; impressions: number; ctr: number; position: number }
interface KeywordRow { keyword: string; clicks: number; impressions: number; ctr: number; position: number }
interface PageRow { page: string; clicks: number; impressions: number; ctr: number; position: number }
interface Summary { site: string; clicks: number; impressions: number; avg_ctr: number; avg_position: number }

interface Recs {
  audience_insights?: string[];
  content_opportunities?: { title: string; why: string }[];
  ad_opportunities?: { keyword: string; reason: string }[];
  conversion_tips?: string[];
  priority_actions?: { action: string; impact: string; effort: string }[];
}

const trafficConfig = {
  clicks: { label: "Clicks", color: "hsl(var(--primary))" },
  impressions: { label: "Impressions", color: "hsl(var(--accent))" },
};

// Try to match a user-typed URL with a verified GSC site (sc-domain: or https://)
function matchSite(input: string, sites: SiteEntry[]): string | null {
  if (!input || !sites.length) return null;
  let host = "";
  try {
    const u = new URL(input.startsWith("http") ? input : `https://${input}`);
    host = u.hostname.replace(/^www\./, "");
  } catch {
    host = input.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
  }
  const exact = sites.find((s) => {
    const sHost = s.url.startsWith("sc-domain:")
      ? s.url.replace("sc-domain:", "")
      : s.url.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
    return sHost === host;
  });
  return exact?.url ?? null;
}

export default function GscConnect() {
  const [urlInput, setUrlInput] = useState("");
  const [phase, setPhase] = useState<"input" | "checking" | "needs_connect" | "no_match" | "loading_data" | "ready">("input");
  const [sites, setSites] = useState<SiteEntry[]>([]);
  const [matchedSite, setMatchedSite] = useState<string>("");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [series, setSeries] = useState<SeriesPoint[]>([]);
  const [keywords, setKeywords] = useState<KeywordRow[]>([]);
  const [pages, setPages] = useState<PageRow[]>([]);
  const [recs, setRecs] = useState<Recs | null>(null);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [pendingUrl, setPendingUrl] = useState<string>("");

  // Handle return from OAuth — auto-resume analysis for the URL the user typed
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gsc = params.get("gsc");
    const saved = sessionStorage.getItem("gsc_pending_url") || "";
    if (gsc === "connected") {
      toast({ title: "Google connected", description: "Loading your site data…" });
      window.history.replaceState({}, "", window.location.pathname);
      if (saved) {
        setUrlInput(saved);
        sessionStorage.removeItem("gsc_pending_url");
        setTimeout(() => analyzeUrl(saved), 100);
      }
    } else if (gsc === "error") {
      toast({ title: "Connection failed", description: "Please try again.", variant: "destructive" });
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const fetchSites = async (): Promise<SiteEntry[] | null> => {
    const { data, error } = await supabase.functions.invoke("gsc-data", { body: { action: "list_sites" } });
    let payload: any = data;
    if (error && (error as any).context) {
      try { payload = await (error as any).context.json(); } catch { /* ignore */ }
    }
    if (payload?.status === "not_connected" || payload?.error === "not_connected") return null;
    return payload?.sites || [];
  };

  const analyzeUrl = async (urlOverride?: string) => {
    const url = (urlOverride ?? urlInput).trim();
    if (!url) {
      toast({ title: "Enter a URL", description: "Paste your website URL to analyze.", variant: "destructive" });
      return;
    }
    setPhase("checking");
    setRecs(null);
    setSummary(null);

    const fetched = await fetchSites();
    if (fetched === null) {
      setPendingUrl(url);
      sessionStorage.setItem("gsc_pending_url", url);
      setPhase("needs_connect");
      return;
    }
    setSites(fetched);
    const match = matchSite(url, fetched);
    if (!match) {
      setPhase("no_match");
      return;
    }
    setMatchedSite(match);
    await supabase.functions.invoke("gsc-data", { body: { action: "select_site", site: match } });
    await loadMetrics(match);
  };

  const loadMetrics = async (_site: string) => {
    setPhase("loading_data");
    const { data, error } = await supabase.functions.invoke("gsc-data", { body: { action: "fetch_metrics" } });
    if (error || (data?.status && data.status !== "ok") || data?.error) {
      const msg = data?.message || data?.error || error?.message || "Unknown error";
      toast({ title: "Could not load data", description: msg, variant: "destructive" });
      setPhase("no_match");
      return;
    }
    setSummary(data.summary);
    setSeries(data.series || []);
    setKeywords(data.keywords || []);
    setPages(data.pages || []);
    setPhase("ready");
  };

  const connect = async () => {
    const { data, error } = await supabase.functions.invoke("gsc-oauth-start", { body: { return_to: window.location.origin + window.location.pathname } });
    if (error || !data?.url) {
      toast({ title: "Could not start connection", description: error?.message || "Try again.", variant: "destructive" });
      return;
    }
    window.location.href = data.url;
  };

  const generateRecs = async () => {
    if (!summary) return;
    setLoadingRecs(true);
    const { data, error } = await supabase.functions.invoke("gsc-recommendations", { body: { summary, keywords, pages } });
    setLoadingRecs(false);
    if (error || data?.error) {
      toast({ title: "Could not generate plan", description: data?.error || error?.message, variant: "destructive" });
      return;
    }
    setRecs(data);
  };

  const reset = () => {
    setPhase("input");
    setSummary(null);
    setRecs(null);
    setMatchedSite("");
  };

  const kpis = summary
    ? [
        { label: "Visitors from Google", value: summary.clicks.toLocaleString(), icon: Globe },
        { label: "Times you appeared", value: summary.impressions.toLocaleString(), icon: BarChart3 },
        { label: "Click rate", value: `${summary.avg_ctr}%`, icon: MousePointerClick },
        { label: "Avg. Google rank", value: `#${summary.avg_position}`, icon: TrendingUp },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* URL Input Bar — always visible at top */}
      <Card className="glass-card border-primary/30">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Search className="w-4 h-4 text-primary" />
            <h3 className="font-display font-semibold text-body-lg text-foreground">Analyze any website</h3>
          </div>
          <p className="text-caption text-muted-foreground mb-3">Paste your website URL to see real visitor data, top keywords and an AI improvement plan.</p>
          <form
            onSubmit={(e) => { e.preventDefault(); analyzeUrl(); }}
            className="flex flex-col sm:flex-row gap-2"
          >
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://yourwebsite.com"
              className="flex-1 bg-background/60 border border-border/50 rounded-xl px-4 py-2.5 text-body text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition"
              maxLength={300}
            />
            <button
              type="submit"
              disabled={phase === "checking" || phase === "loading_data"}
              className="gradient-primary text-primary-foreground px-5 py-2.5 rounded-xl font-display font-semibold text-body shadow-glow hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {phase === "checking" || phase === "loading_data"
                ? <><RefreshCw className="w-4 h-4 animate-spin" /> Analyzing</>
                : <><Sparkles className="w-4 h-4" /> Analyze</>}
            </button>
          </form>
          {matchedSite && phase === "ready" && (
            <p className="text-micro text-muted-foreground mt-2">Showing data for <span className="text-primary">{matchedSite}</span> · last 28 days</p>
          )}
        </CardContent>
      </Card>

      {/* States */}
      {phase === "needs_connect" && (
        <Card className="glass-card border-accent/30">
          <CardContent className="p-5 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center flex-shrink-0">
              <Link2 className="w-5 h-5 text-accent-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-display font-semibold text-body text-foreground">One-time setup</h4>
              <p className="text-caption text-muted-foreground mt-1">To pull real data for <span className="text-foreground">{pendingUrl}</span>, sign in with the Google account that owns this site in Search Console.</p>
              <div className="flex gap-2 mt-3">
                <button onClick={connect} className="gradient-primary text-primary-foreground px-4 py-2 rounded-xl text-body font-medium shadow-glow flex items-center gap-2">
                  <Globe className="w-4 h-4" /> Sign in with Google
                </button>
                <button onClick={reset} className="px-4 py-2 rounded-xl text-body font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80">Cancel</button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {phase === "no_match" && (
        <Card className="glass-card border-orange-500/30">
          <CardContent className="p-5 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-display font-semibold text-body text-foreground">This site isn't verified in your Google Search Console</h4>
              <p className="text-caption text-muted-foreground mt-1">We can only show real data for websites you own and have verified. Sites in your account:</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {sites.length === 0 && <span className="text-caption text-muted-foreground">No verified sites found.</span>}
                {sites.map((s) => (
                  <button
                    key={s.url}
                    onClick={() => { const display = s.url.replace("sc-domain:", "https://"); setUrlInput(display); analyzeUrl(display); }}
                    className="text-micro px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground hover:bg-primary/20 hover:text-primary transition"
                  >
                    {s.url}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {(phase === "checking" || phase === "loading_data") && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1,2,3,4].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      )}

      {/* Connected dashboard */}
      {phase === "ready" && summary && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {kpis.map((kpi, i) => (
              <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="glass-card border-border/30">
                  <CardContent className="p-4">
                    <kpi.icon className="w-4 h-4 text-muted-foreground mb-2" />
                    <p className="text-h3 font-bold text-foreground">{kpi.value}</p>
                    <p className="text-micro text-muted-foreground mt-1">{kpi.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <Card className="glass-card border-border/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-body-lg">Daily clicks</CardTitle>
                <p className="text-caption text-muted-foreground">People who clicked through from Google</p>
              </CardHeader>
              <CardContent>
                <ChartContainer config={trafficConfig} className="h-[240px] w-full">
                  <AreaChart data={series}>
                    <defs>
                      <linearGradient id="fillClicks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
                    <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="clicks" stroke="hsl(var(--primary))" fill="url(#fillClicks)" strokeWidth={2} />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="glass-card border-border/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-body-lg">Click rate over time</CardTitle>
                <p className="text-caption text-muted-foreground">% of viewers who clicked through</p>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{ ctr: { label: "CTR %", color: "hsl(var(--primary))" } }} className="h-[240px] w-full">
                  <LineChart data={series}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
                    <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="ctr" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="glass-card border-border/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-body-lg">Words people search to find you</CardTitle>
              <p className="text-caption text-muted-foreground">Top 25 keywords from real Google search data</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-96 overflow-y-auto pr-1">
                {keywords.map((k) => (
                  <div key={k.keyword} className="flex items-center justify-between p-2.5 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-caption font-mono text-muted-foreground w-10 flex-shrink-0">#{k.position}</span>
                      <span className="text-body text-foreground truncate">{k.keyword}</span>
                    </div>
                    <div className="flex items-center gap-3 text-micro text-muted-foreground flex-shrink-0">
                      <span>{k.clicks} clicks</span>
                      <span className="text-primary">{k.ctr}%</span>
                    </div>
                  </div>
                ))}
                {keywords.length === 0 && <p className="text-caption text-muted-foreground text-center py-4 col-span-2">No keyword data yet</p>}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-accent/30">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-body-lg flex items-center gap-2"><Sparkles className="w-4 h-4 text-accent" /> Your improvement plan</CardTitle>
                <p className="text-caption text-muted-foreground">AI-generated marketing recommendations based on your real data</p>
              </div>
              {!recs && (
                <button onClick={generateRecs} disabled={loadingRecs} className="gradient-accent text-accent-foreground px-4 py-2 rounded-xl text-body font-medium shadow-glow disabled:opacity-50 flex items-center gap-2">
                  {loadingRecs ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {loadingRecs ? "Analyzing…" : "Generate plan"}
                </button>
              )}
            </CardHeader>
            <CardContent>
              <AnimatePresence>
                {recs && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                    <RecsBlock icon={Users} title="Who's finding you" items={recs.audience_insights || []} color="text-blue-400" />
                    <RecsList icon={Lightbulb} title="Content opportunities" items={(recs.content_opportunities || []).map(c => ({ title: c.title, sub: c.why }))} color="text-green-400" />
                    <RecsList icon={Megaphone} title="Ad opportunities" items={(recs.ad_opportunities || []).map(a => ({ title: a.keyword, sub: a.reason }))} color="text-orange-400" />
                    <RecsBlock icon={Target} title="Conversion tips" items={recs.conversion_tips || []} color="text-purple-400" />

                    {recs.priority_actions && recs.priority_actions.length > 0 && (
                      <div>
                        <h4 className="font-display font-semibold text-foreground text-body flex items-center gap-2 mb-2"><Zap className="w-4 h-4 text-primary" /> Top actions to take this week</h4>
                        <div className="space-y-2">
                          {recs.priority_actions.map((a, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-secondary/30">
                              <span className="text-caption font-mono text-muted-foreground w-6 flex-shrink-0">#{i + 1}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-body text-foreground">{a.action}</p>
                                <div className="flex gap-2 mt-1">
                                  <span className={`text-micro px-2 py-0.5 rounded-full ${a.impact === "High" ? "bg-green-500/20 text-green-400" : a.impact === "Medium" ? "bg-yellow-500/20 text-yellow-400" : "bg-muted text-muted-foreground"}`}>{a.impact} impact</span>
                                  <span className="text-micro px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{a.effort} effort</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <button onClick={generateRecs} disabled={loadingRecs} className="text-caption text-primary hover:underline flex items-center gap-1">
                      <RefreshCw className={`w-3 h-3 ${loadingRecs ? "animate-spin" : ""}`} /> Regenerate plan
                    </button>
                  </motion.div>
                )}
                {!recs && !loadingRecs && (
                  <p className="text-caption text-muted-foreground py-4">Click "Generate plan" to get personalized marketing recommendations based on your site's real Google data.</p>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function RecsBlock({ icon: Icon, title, items, color }: { icon: any; title: string; items: string[]; color: string }) {
  if (!items.length) return null;
  return (
    <div>
      <h4 className={`font-display font-semibold text-foreground text-body flex items-center gap-2 mb-2`}><Icon className={`w-4 h-4 ${color}`} /> {title}</h4>
      <ul className="space-y-1.5">
        {items.map((it, i) => (<li key={i} className="text-body text-secondary-foreground flex gap-2"><span className={color}>•</span><span>{it}</span></li>))}
      </ul>
    </div>
  );
}

function RecsList({ icon: Icon, title, items, color }: { icon: any; title: string; items: { title: string; sub: string }[]; color: string }) {
  if (!items.length) return null;
  return (
    <div>
      <h4 className="font-display font-semibold text-foreground text-body flex items-center gap-2 mb-2"><Icon className={`w-4 h-4 ${color}`} /> {title}</h4>
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className="p-3 rounded-xl bg-secondary/30">
            <p className="text-body text-foreground font-medium">{it.title}</p>
            <p className="text-caption text-muted-foreground mt-0.5">{it.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
