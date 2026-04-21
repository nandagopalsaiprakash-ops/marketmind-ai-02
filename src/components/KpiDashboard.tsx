import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { TrendingUp, TrendingDown, MousePointerClick, BarChart3, Globe, ArrowUpRight, RefreshCw, Database } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";

interface KpiMetric {
  metric_date: string;
  organic_traffic: number;
  paid_traffic: number;
  direct_traffic: number;
  ctr: number;
  impressions: number;
  bounce_rate: number;
}

interface KeywordRanking {
  keyword: string;
  position: number;
  previous_position: number | null;
}

const trafficConfig = {
  organic_traffic: { label: "From Search (Free)", color: "hsl(var(--primary))" },
  paid_traffic: { label: "From Ads (Paid)", color: "hsl(var(--accent))" },
  direct_traffic: { label: "Direct Visits", color: "hsl(var(--muted-foreground))" },
};

const ctrConfig = {
  ctr: { label: "Click Rate %", color: "hsl(var(--primary))" },
};

const rankingsConfig = {
  top3: { label: "Page 1 (Top 3)", color: "hsl(142 71% 45%)" },
  top10: { label: "Page 1 (Top 10)", color: "hsl(var(--primary))" },
  top20: { label: "Page 2 (Top 20)", color: "hsl(var(--muted-foreground))" },
};

function generateSeedData() {
  const months = ["2025-01", "2025-02", "2025-03", "2025-04", "2025-05", "2025-06", "2025-07"];
  return months.map((m, i) => ({
    metric_date: `${m}-15`,
    organic_traffic: 4200 + i * 600 + Math.floor(Math.random() * 400),
    paid_traffic: 2400 + Math.floor(Math.random() * 800),
    direct_traffic: 1800 + i * 150 + Math.floor(Math.random() * 300),
    ctr: +(3.2 + i * 0.22 + Math.random() * 0.3).toFixed(2),
    impressions: 12000 + i * 800 + Math.floor(Math.random() * 1000),
    bounce_rate: +(42 - i * 0.6 - Math.random() * 2).toFixed(2),
  }));
}

const seedKeywords = [
  { keyword: "digital marketing", position: 5, previous_position: 7 },
  { keyword: "SEO tools", position: 3, previous_position: 7 },
  { keyword: "content strategy", position: 8, previous_position: 7 },
  { keyword: "marketing automation", position: 12, previous_position: 15 },
  { keyword: "growth hacking", position: 6, previous_position: 11 },
  { keyword: "PPC management", position: 15, previous_position: 13 },
];

const monthLabel = (d: string) => {
  const date = new Date(d);
  return date.toLocaleString("default", { month: "short" });
};

const KpiDashboard = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<KpiMetric[]>([]);
  const [keywords, setKeywords] = useState<KeywordRanking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    const [metricsRes, keywordsRes] = await Promise.all([
      supabase
        .from("kpi_metrics")
        .select("metric_date, organic_traffic, paid_traffic, direct_traffic, ctr, impressions, bounce_rate")
        .eq("user_id", user.id)
        .order("metric_date", { ascending: true }),
      supabase
        .from("keyword_rankings")
        .select("keyword, position, previous_position")
        .eq("user_id", user.id)
        .order("position", { ascending: true }),
    ]);

    if (metricsRes.data && metricsRes.data.length > 0) {
      setMetrics(metricsRes.data);
    }
    if (keywordsRes.data && keywordsRes.data.length > 0) {
      setKeywords(keywordsRes.data);
    }

    // If no data exists, seed it
    if ((!metricsRes.data || metricsRes.data.length === 0) && (!keywordsRes.data || keywordsRes.data.length === 0)) {
      await seedDatabase();
    }

    setLoading(false);
  };

  const seedDatabase = async () => {
    if (!user) return;
    const metricsData = generateSeedData().map((m) => ({ ...m, user_id: user.id }));
    const keywordsData = seedKeywords.map((k) => ({
      ...k,
      user_id: user.id,
      recorded_at: new Date().toISOString().split("T")[0],
    }));

    const [mRes, kRes] = await Promise.all([
      supabase.from("kpi_metrics").insert(metricsData),
      supabase.from("keyword_rankings").insert(keywordsData),
    ]);

    if (mRes.error || kRes.error) {
      toast({ title: "Error seeding data", description: mRes.error?.message || kRes.error?.message, variant: "destructive" });
      return;
    }

    toast({ title: "Dashboard initialized", description: "Sample analytics data has been loaded." });
    await fetchData();
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const latest = metrics[metrics.length - 1];
  const prev = metrics[metrics.length - 2];

  const totalTraffic = latest ? latest.organic_traffic + latest.paid_traffic + latest.direct_traffic : 0;
  const prevTotal = prev ? prev.organic_traffic + prev.paid_traffic + prev.direct_traffic : 0;
  const trafficChange = prevTotal ? (((totalTraffic - prevTotal) / prevTotal) * 100).toFixed(1) : "0";

  const top10Count = keywords.filter((k) => k.position <= 10).length;
  const ctrChange = latest && prev ? (latest.ctr - prev.ctr).toFixed(1) : "0";
  const bounceChange = latest && prev ? (latest.bounce_rate - prev.bounce_rate).toFixed(1) : "0";

  const kpis = [
    { label: "Total Visitors", value: totalTraffic.toLocaleString(), change: `${+trafficChange >= 0 ? "+" : ""}${trafficChange}%`, up: +trafficChange >= 0, icon: Globe },
    { label: "Click Rate", value: latest ? `${latest.ctr}%` : "—", change: `${+ctrChange >= 0 ? "+" : ""}${ctrChange}%`, up: +ctrChange >= 0, icon: MousePointerClick },
    { label: "Keywords on Page 1", value: String(top10Count), change: `${top10Count} ranking`, up: true, icon: BarChart3 },
    { label: "Quick Exits", value: latest ? `${latest.bounce_rate}%` : "—", change: `${+bounceChange <= 0 ? "" : "+"}${bounceChange}%`, up: +bounceChange <= 0, icon: ArrowUpRight },
  ];

  const trafficChartData = metrics.map((m) => ({
    month: monthLabel(m.metric_date),
    organic_traffic: m.organic_traffic,
    paid_traffic: m.paid_traffic,
    direct_traffic: m.direct_traffic,
  }));

  const ctrChartData = metrics.map((m, i) => ({
    week: monthLabel(m.metric_date),
    ctr: m.ctr,
  }));

  // Derive rankings bracket data from keyword counts per month (simplified)
  const rankingsChartData = metrics.map((m) => {
    const t3 = keywords.filter((k) => k.position <= 3).length;
    const t10 = keywords.filter((k) => k.position <= 10).length;
    const t20 = keywords.filter((k) => k.position <= 20).length;
    return { month: monthLabel(m.metric_date), top3: t3, top10: t10, top20: t20 };
  });

  if (loading) {
    return (
      <div className="h-full overflow-y-auto p-4 md:p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6 space-y-6">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-h2 font-bold text-foreground">Marketing Overview</h2>
          <p className="text-caption text-muted-foreground">Easy-to-read snapshot of how your website is performing</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-caption font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {kpis.map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="glass-card border-border/30 hover:border-primary/30 transition-all">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <kpi.icon className="w-4 h-4 text-muted-foreground" />
                  <span className={`text-caption font-medium flex items-center gap-1 ${kpi.up ? "text-green-400" : "text-red-400"}`}>
                    {kpi.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {kpi.change}
                  </span>
                </div>
                <p className="text-h3 font-bold text-foreground">{kpi.value}</p>
                <p className="text-micro text-muted-foreground mt-1">{kpi.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Traffic Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="glass-card border-border/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-body-lg font-semibold text-foreground">Website Visitors</CardTitle>
              <p className="text-caption text-muted-foreground">How many people came to your site each month, and from where</p>
            </CardHeader>
            <CardContent>
              <ChartContainer config={trafficConfig} className="h-[240px] w-full">
                <AreaChart data={trafficChartData}>
                  <defs>
                    <linearGradient id="fillOrganic" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
                  <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="organic_traffic" stroke="hsl(var(--primary))" fill="url(#fillOrganic)" strokeWidth={2} />
                  <Area type="monotone" dataKey="paid_traffic" stroke="hsl(var(--accent))" fill="transparent" strokeWidth={2} strokeDasharray="4 4" />
                  <Area type="monotone" dataKey="direct_traffic" stroke="hsl(var(--muted-foreground))" fill="transparent" strokeWidth={1.5} />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTR Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="glass-card border-border/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-body-lg font-semibold text-foreground">Click Rate</CardTitle>
              <p className="text-caption text-muted-foreground">Out of everyone who saw your site, how many clicked</p>
            </CardHeader>
            <CardContent>
              <ChartContainer config={ctrConfig} className="h-[240px] w-full">
                <LineChart data={ctrChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
                  <XAxis dataKey="week" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="ctr" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ fill: "hsl(var(--primary))", r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Rankings Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="glass-card border-border/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-body-lg font-semibold text-foreground">Search Position</CardTitle>
              <p className="text-caption text-muted-foreground">Where your keywords appear on Google search results</p>
            </CardHeader>
            <CardContent>
              <ChartContainer config={rankingsConfig} className="h-[240px] w-full">
                <BarChart data={rankingsChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
                  <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="top3" fill="hsl(142 71% 45%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="top10" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="top20" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} opacity={0.5} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Rankings Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Card className="glass-card border-border/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-body-lg font-semibold text-foreground">Your Keywords</CardTitle>
              <p className="text-caption text-muted-foreground">Words people search to find you (lower number = higher on Google)</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {keywords.map((item) => {
                  const change = item.previous_position ? item.previous_position - item.position : 0;
                  return (
                    <div key={item.keyword} className="flex items-center justify-between p-2.5 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-caption font-mono text-muted-foreground w-5">#{item.position}</span>
                        <span className="text-body text-foreground">{item.keyword}</span>
                      </div>
                      <span className={`text-caption font-medium flex items-center gap-1 ${change >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {change >= 0 ? "+" : ""}{change}
                      </span>
                    </div>
                  );
                })}
                {keywords.length === 0 && (
                  <p className="text-caption text-muted-foreground text-center py-4">No keyword data yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default KpiDashboard;
