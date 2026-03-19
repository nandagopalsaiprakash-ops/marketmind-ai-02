export interface MarketingTool {
  name: string;
  url: string;
  description: string;
  category: "seo" | "analytics" | "content" | "ads" | "social" | "email" | "general";
  aliases: string[];
}

export const marketingTools: MarketingTool[] = [
  { name: "Screaming Frog", url: "https://www.screamingfrog.co.uk/seo-spider/", description: "Website crawler for technical SEO audits", category: "seo", aliases: ["screaming frog seo spider", "screamingfrog"] },
  { name: "Ahrefs", url: "https://ahrefs.com", description: "Keyword research and backlink analysis", category: "seo", aliases: ["ahrefs.com"] },
  { name: "Semrush", url: "https://www.semrush.com", description: "All-in-one digital marketing toolkit", category: "seo", aliases: ["semrush.com", "sem rush"] },
  { name: "Google Search Console", url: "https://search.google.com/search-console", description: "Monitor website performance and indexing", category: "seo", aliases: ["gsc", "search console"] },
  { name: "PageSpeed Insights", url: "https://pagespeed.web.dev", description: "Analyze page load performance", category: "seo", aliases: ["pagespeed", "page speed insights"] },
  { name: "Google Analytics", url: "https://analytics.google.com", description: "Website traffic and user behavior analytics", category: "analytics", aliases: ["ga4", "ga", "google analytics 4"] },
  { name: "SurferSEO", url: "https://surferseo.com", description: "Content optimization and SERP analysis", category: "content", aliases: ["surfer seo", "surfer"] },
  { name: "Clearscope", url: "https://www.clearscope.io", description: "Content optimization for search rankings", category: "content", aliases: [] },
  { name: "Majestic", url: "https://majestic.com", description: "Backlink checker and link intelligence", category: "seo", aliases: ["majestic seo"] },
  { name: "Hunter.io", url: "https://hunter.io", description: "Find and verify professional email addresses", category: "email", aliases: ["hunter", "email hunter"] },
  { name: "Google Ads", url: "https://ads.google.com", description: "Pay-per-click advertising platform", category: "ads", aliases: ["google adwords", "adwords", "google ppc"] },
  { name: "Meta Ads", url: "https://www.facebook.com/business/ads", description: "Advertising on Facebook and Instagram", category: "ads", aliases: ["facebook ads", "instagram ads", "meta ads manager"] },
  { name: "Moz", url: "https://moz.com", description: "SEO tools and domain authority tracking", category: "seo", aliases: ["moz pro", "moz.com"] },
  { name: "Yoast SEO", url: "https://yoast.com", description: "WordPress SEO plugin", category: "seo", aliases: ["yoast"] },
  { name: "Hotjar", url: "https://www.hotjar.com", description: "Heatmaps and user session recordings", category: "analytics", aliases: [] },
  { name: "Mailchimp", url: "https://mailchimp.com", description: "Email marketing and automation", category: "email", aliases: ["mail chimp"] },
  { name: "HubSpot", url: "https://www.hubspot.com", description: "CRM, marketing, and sales platform", category: "general", aliases: ["hubspot crm"] },
  { name: "Buffer", url: "https://buffer.com", description: "Social media scheduling and analytics", category: "social", aliases: [] },
  { name: "Hootsuite", url: "https://www.hootsuite.com", description: "Social media management platform", category: "social", aliases: [] },
  { name: "Canva", url: "https://www.canva.com", description: "Graphic design and content creation", category: "content", aliases: [] },
  { name: "Google Tag Manager", url: "https://tagmanager.google.com", description: "Tag management for tracking codes", category: "analytics", aliases: ["gtm", "tag manager"] },
  { name: "Google Trends", url: "https://trends.google.com", description: "Explore trending search topics", category: "seo", aliases: [] },
  { name: "Ubersuggest", url: "https://neilpatel.com/ubersuggest/", description: "Keyword ideas and content suggestions", category: "seo", aliases: [] },
  { name: "BuzzSumo", url: "https://buzzsumo.com", description: "Content research and influencer discovery", category: "content", aliases: ["buzz sumo"] },
  { name: "Zapier", url: "https://zapier.com", description: "Workflow automation between apps", category: "general", aliases: [] },
  { name: "ConvertKit", url: "https://convertkit.com", description: "Email marketing for creators", category: "email", aliases: ["convert kit"] },
  { name: "Mixpanel", url: "https://mixpanel.com", description: "Product analytics and user tracking", category: "analytics", aliases: [] },
  { name: "Amplitude", url: "https://amplitude.com", description: "Digital analytics platform", category: "analytics", aliases: [] },
  { name: "SEMrush", url: "https://www.semrush.com", description: "All-in-one digital marketing toolkit", category: "seo", aliases: [] },
  { name: "Sprout Social", url: "https://sproutsocial.com", description: "Social media management and analytics", category: "social", aliases: [] },
  { name: "Later", url: "https://later.com", description: "Visual social media scheduler", category: "social", aliases: [] },
  { name: "Grammarly", url: "https://www.grammarly.com", description: "Writing assistant and grammar checker", category: "content", aliases: [] },
  { name: "Schema Markup Validator", url: "https://validator.schema.org/", description: "Test structured data markup", category: "seo", aliases: ["schema validator", "structured data testing tool"] },
  { name: "Google Keyword Planner", url: "https://ads.google.com/home/tools/keyword-planner/", description: "Keyword research for Google Ads", category: "seo", aliases: ["keyword planner", "gkp"] },
];

const categoryIcons: Record<MarketingTool["category"], string> = {
  seo: "🔍",
  analytics: "📊",
  content: "✍️",
  ads: "📢",
  social: "📱",
  email: "📧",
  general: "🔧",
};

export function getCategoryIcon(category: MarketingTool["category"]): string {
  return categoryIcons[category] || "🔧";
}

export function detectToolsInText(text: string): MarketingTool[] {
  const found: MarketingTool[] = [];
  const lowerText = text.toLowerCase();
  const seen = new Set<string>();

  for (const tool of marketingTools) {
    if (seen.has(tool.url)) continue;
    const namesToCheck = [tool.name.toLowerCase(), ...tool.aliases.map(a => a.toLowerCase())];
    for (const name of namesToCheck) {
      if (name.length < 3) continue;
      if (lowerText.includes(name)) {
        found.push(tool);
        seen.add(tool.url);
        break;
      }
    }
  }

  return found;
}
