import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, MousePointerClick, BarChart3, Globe, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

const trafficData = [
  { month: "Jan", organic: 4200, paid: 2400, direct: 1800 },
  { month: "Feb", organic: 4800, paid: 2100, direct: 2000 },
  { month: "Mar", organic: 5100, paid: 2800, direct: 1900 },
  { month: "Apr", organic: 5600, paid: 3200, direct: 2200 },
  { month: "May", organic: 6200, paid: 2900, direct: 2400 },
  { month: "Jun", organic: 7100, paid: 3400, direct: 2600 },
  { month: "Jul", organic: 7800, paid: 3100, direct: 2800 },
];

const ctrData = [
  { week: "W1", ctr: 3.2, impressions: 12400 },
  { week: "W2", ctr: 3.5, impressions: 13200 },
  { week: "W3", ctr: 3.1, impressions: 11800 },
  { week: "W4", ctr: 3.8, impressions: 14500 },
  { week: "W5", ctr: 4.1, impressions: 15200 },
  { week: "W6", ctr: 4.4, impressions: 16800 },
  { week: "W7", ctr: 4.2, impressions: 15900 },
  { week: "W8", ctr: 4.7, impressions: 17400 },
];

const rankingsData = [
  { keyword: "digital marketing", position: 5, change: 2 },
  { keyword: "SEO tools", position: 3, change: 4 },
  { keyword: "content strategy", position: 8, change: -1 },
  { keyword: "marketing automation", position: 12, change: 3 },
  { keyword: "growth hacking", position: 6, change: 5 },
  { keyword: "PPC management", position: 15, change: -2 },
];

const rankingsChartData = [
  { month: "Jan", top3: 4, top10: 12, top20: 28 },
  { month: "Feb", top3: 5, top10: 14, top20: 30 },
  { month: "Mar", top3: 6, top10: 15, top20: 32 },
  { month: "Apr", top3: 7, top10: 18, top20: 35 },
  { month: "May", top3: 8, top10: 20, top20: 38 },
  { month: "Jun", top3: 10, top10: 22, top20: 40 },
  { month: "Jul", top3: 12, top10: 25, top20: 44 },
];

const kpis = [
  { label: "Total Traffic", value: "24,300", change: "+12.5%", up: true, icon: Globe },
  { label: "Avg. CTR", value: "4.7%", change: "+0.8%", up: true, icon: MousePointerClick },
  { label: "Top 10 Keywords", value: "25", change: "+3", up: true, icon: BarChart3 },
  { label: "Bounce Rate", value: "38.2%", change: "-4.1%", up: true, icon: ArrowUpRight },
];

const trafficConfig = {
  organic: { label: "Organic", color: "hsl(var(--primary))" },
  paid: { label: "Paid", color: "hsl(var(--accent))" },
  direct: { label: "Direct", color: "hsl(var(--muted-foreground))" },
};

const ctrConfig = {
  ctr: { label: "CTR %", color: "hsl(var(--primary))" },
  impressions: { label: "Impressions", color: "hsl(var(--accent))" },
};

const rankingsConfig = {
  top3: { label: "Top 3", color: "hsl(142 71% 45%)" },
  top10: { label: "Top 10", color: "hsl(var(--primary))" },
  top20: { label: "Top 20", color: "hsl(var(--muted-foreground))" },
};

const KpiDashboard = () => {
  return (
    <div className="h-full overflow-y-auto p-4 md:p-6 space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
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
              <CardTitle className="text-body-lg font-semibold text-foreground">Website Traffic</CardTitle>
              <p className="text-caption text-muted-foreground">Monthly visitors by source</p>
            </CardHeader>
            <CardContent>
              <ChartContainer config={trafficConfig} className="h-[240px] w-full">
                <AreaChart data={trafficData}>
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
                  <Area type="monotone" dataKey="organic" stroke="hsl(var(--primary))" fill="url(#fillOrganic)" strokeWidth={2} />
                  <Area type="monotone" dataKey="paid" stroke="hsl(var(--accent))" fill="transparent" strokeWidth={2} strokeDasharray="4 4" />
                  <Area type="monotone" dataKey="direct" stroke="hsl(var(--muted-foreground))" fill="transparent" strokeWidth={1.5} />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTR Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="glass-card border-border/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-body-lg font-semibold text-foreground">Click-Through Rate</CardTitle>
              <p className="text-caption text-muted-foreground">Weekly CTR performance</p>
            </CardHeader>
            <CardContent>
              <ChartContainer config={ctrConfig} className="h-[240px] w-full">
                <LineChart data={ctrData}>
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
              <CardTitle className="text-body-lg font-semibold text-foreground">Keyword Rankings</CardTitle>
              <p className="text-caption text-muted-foreground">Keywords by position bracket</p>
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
              <CardTitle className="text-body-lg font-semibold text-foreground">Top Keywords</CardTitle>
              <p className="text-caption text-muted-foreground">Current positions & changes</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {rankingsData.map((item, i) => (
                  <div key={item.keyword} className="flex items-center justify-between p-2.5 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-caption font-mono text-muted-foreground w-5">#{item.position}</span>
                      <span className="text-body text-foreground">{item.keyword}</span>
                    </div>
                    <span className={`text-caption font-medium flex items-center gap-1 ${item.change > 0 ? "text-green-400" : "text-red-400"}`}>
                      {item.change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {item.change > 0 ? "+" : ""}{item.change}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default KpiDashboard;
