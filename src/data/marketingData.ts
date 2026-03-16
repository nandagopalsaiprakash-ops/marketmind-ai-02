export interface MarketingResponse {
  title: string;
  explanation: string;
  steps: string[];
  proTips: string[];
  category: string;
}

export const preciseAnswers: Record<string, MarketingResponse> = {
  "how to improve google ranking": {
    title: "How to Improve Google Ranking",
    explanation: "Improving your Google ranking requires a combination of on-page SEO, technical optimization, and quality content creation.",
    steps: [
      "Conduct keyword research using tools like Ahrefs or SEMrush",
      "Optimize title tags, meta descriptions, and H1 headers",
      "Improve page load speed (aim for < 2.5s LCP)",
      "Build high-quality backlinks from authoritative domains",
      "Create comprehensive, E-E-A-T compliant content",
      "Ensure mobile-first responsive design",
      "Implement structured data markup (Schema.org)",
      "Monitor and fix crawl errors in Google Search Console"
    ],
    proTips: [
      "Focus on search intent — match content format to what ranks on page 1",
      "Update existing content regularly to maintain freshness signals",
      "Use internal linking to distribute page authority"
    ],
    category: "SEO"
  },
  "best time to post on instagram": {
    title: "Best Time to Post on Instagram",
    explanation: "Posting at optimal times maximizes reach and engagement by catching your audience when they're most active.",
    steps: [
      "Weekdays: 6 PM – 8 PM (post-work peak)",
      "Weekends: 9 AM – 11 AM (morning scroll)",
      "Tuesday & Thursday tend to have highest engagement",
      "Avoid posting between 1 AM – 5 AM",
      "Use Instagram Insights to find YOUR audience's peak times",
      "Schedule posts using Later or Buffer for consistency"
    ],
    proTips: [
      "Use Instagram Insights to determine your specific audience's peak activity time",
      "Test different posting times for 2 weeks and track engagement rates",
      "Reels perform best when posted during peak hours"
    ],
    category: "SMM"
  },
  "how to run google ads campaigns": {
    title: "How to Run Google Ads Campaigns",
    explanation: "Google Ads lets you reach potential customers through search, display, video, and shopping ads with precise targeting.",
    steps: [
      "Define your campaign objective (leads, sales, traffic)",
      "Research keywords using Google Keyword Planner",
      "Create compelling ad copy with strong CTAs",
      "Set up conversion tracking with Google Tag Manager",
      "Start with a modest daily budget ($20-50/day)",
      "Use negative keywords to filter irrelevant traffic",
      "A/B test ad variations (minimum 3 per ad group)",
      "Optimize bids based on conversion data after 2 weeks"
    ],
    proTips: [
      "Use Single Keyword Ad Groups (SKAGs) for better Quality Scores",
      "Enable Enhanced CPC once you have 30+ conversions",
      "Review Search Terms report weekly to find new negatives"
    ],
    category: "Advertising"
  },
  "how to increase website traffic": {
    title: "How to Increase Website Traffic",
    explanation: "Growing website traffic requires a multi-channel approach combining organic, paid, and referral strategies.",
    steps: [
      "Publish SEO-optimized blog content consistently (2-4 posts/week)",
      "Build an email list and send weekly newsletters",
      "Repurpose content for social media platforms",
      "Guest post on high-authority sites in your niche",
      "Run targeted PPC campaigns for high-intent keywords",
      "Optimize for featured snippets and People Also Ask",
      "Create shareable infographics and data studies",
      "Leverage Reddit, Quora, and community forums"
    ],
    proTips: [
      "Focus on long-tail keywords with lower competition initially",
      "Use Ubersuggest to find content gaps your competitors missed",
      "Track traffic sources in GA4 to double down on what works"
    ],
    category: "Growth"
  },
  "how to perform technical seo audit": {
    title: "Technical SEO Audit Checklist",
    explanation: "A technical SEO audit identifies crawling, indexing, and performance issues that prevent your site from ranking.",
    steps: [
      "Crawl website using Screaming Frog or Sitebulb",
      "Check indexing status in Google Search Console",
      "Audit Core Web Vitals (LCP, FID, CLS) via PageSpeed Insights",
      "Fix broken links (4xx errors) and redirect chains",
      "Verify robots.txt and XML sitemap configuration",
      "Check for duplicate content and canonical tag issues",
      "Ensure proper hreflang implementation for multi-language sites",
      "Test mobile usability with Google's Mobile-Friendly Test",
      "Validate structured data with Rich Results Test",
      "Monitor server response codes and uptime"
    ],
    proTips: [
      "Run audits monthly and after every major site change",
      "Prioritize fixes by impact: indexing > speed > UX",
      "Use Log File Analysis to understand Googlebot behavior"
    ],
    category: "SEO"
  },
  "how to optimize conversion rates": {
    title: "How to Optimize Conversion Rates (CRO)",
    explanation: "Conversion Rate Optimization uses data-driven testing to increase the percentage of visitors who take desired actions.",
    steps: [
      "Set up funnel tracking in Google Analytics 4",
      "Identify drop-off points using heatmaps (Hotjar/Microsoft Clarity)",
      "A/B test headlines, CTAs, and page layouts",
      "Simplify forms — reduce fields to essentials only",
      "Add social proof: testimonials, reviews, trust badges",
      "Optimize page load speed (every 1s delay = 7% fewer conversions)",
      "Use urgency and scarcity ethically (limited offers, countdown timers)",
      "Implement exit-intent popups with compelling offers"
    ],
    proTips: [
      "Test one variable at a time for statistically significant results",
      "Aim for 95% confidence level before declaring a winner",
      "Focus on high-traffic pages first for maximum impact"
    ],
    category: "Growth"
  }
};

export const categoryResponses: Record<string, MarketingResponse> = {
  SEO: {
    title: "SEO Best Practices",
    explanation: "Search Engine Optimization is the practice of increasing the quantity and quality of traffic to your website through organic search results.",
    steps: [
      "Conduct comprehensive keyword research",
      "Optimize on-page elements (titles, metas, headers, content)",
      "Build quality backlinks through outreach and content marketing",
      "Improve site speed and Core Web Vitals",
      "Create valuable, user-intent-matched content",
      "Monitor performance with Google Search Console and Analytics"
    ],
    proTips: [
      "SEO is a marathon, not a sprint — expect 3-6 months for results",
      "Focus on topical authority by creating content clusters"
    ],
    category: "SEO"
  },
  SMM: {
    title: "Social Media Marketing Strategy",
    explanation: "Social media marketing uses platforms like Instagram, LinkedIn, Twitter, and TikTok to build brand awareness and drive engagement.",
    steps: [
      "Define your target audience personas",
      "Choose 2-3 platforms where your audience is most active",
      "Create a content calendar with diverse post types",
      "Engage with your community daily (comments, DMs, shares)",
      "Use analytics to track engagement and optimize posting times",
      "Experiment with paid social ads for reach amplification"
    ],
    proTips: [
      "Video content gets 2x more engagement than static posts",
      "Consistency beats virality — post regularly"
    ],
    category: "SMM"
  },
  Advertising: {
    title: "Digital Advertising Fundamentals",
    explanation: "Digital advertising encompasses paid channels like Google Ads, Facebook Ads, LinkedIn Ads, and programmatic display.",
    steps: [
      "Set clear campaign objectives and KPIs",
      "Define audience targeting parameters",
      "Create compelling ad creatives and copy",
      "Set up proper conversion tracking",
      "Start with a test budget and scale winners",
      "Continuously optimize based on performance data"
    ],
    proTips: [
      "ROAS > 3x is generally considered profitable",
      "Retargeting campaigns often have the highest ROI"
    ],
    category: "Advertising"
  },
  Content: {
    title: "Content Marketing Strategy",
    explanation: "Content marketing focuses on creating and distributing valuable, relevant content to attract and retain a clearly defined audience.",
    steps: [
      "Develop buyer personas and content pillars",
      "Conduct content gap analysis vs competitors",
      "Create a mix of blog posts, videos, infographics, and podcasts",
      "Optimize all content for search (SEO + readability)",
      "Distribute through owned, earned, and paid channels",
      "Measure content ROI through attribution models"
    ],
    proTips: [
      "Repurpose one piece of content into 5+ formats",
      "Long-form content (2000+ words) ranks better on average"
    ],
    category: "Content"
  },
  Analytics: {
    title: "Marketing Analytics Guide",
    explanation: "Marketing analytics involves measuring, managing, and analyzing data from marketing campaigns to maximize effectiveness and ROI.",
    steps: [
      "Set up Google Analytics 4 with proper event tracking",
      "Define key metrics for each marketing channel",
      "Create dashboards for real-time monitoring",
      "Implement UTM parameters for campaign tracking",
      "Use attribution modeling to understand conversion paths",
      "Generate weekly/monthly reports with actionable insights"
    ],
    proTips: [
      "Focus on leading indicators, not just lagging metrics",
      "Data-driven decisions outperform gut feelings by 5-6x"
    ],
    category: "Analytics"
  },
  Growth: {
    title: "Growth Marketing Playbook",
    explanation: "Growth marketing combines creative marketing strategies with data analysis and engineering to rapidly grow user acquisition and revenue.",
    steps: [
      "Map your full customer journey (AARRR framework)",
      "Identify your North Star Metric",
      "Run rapid experiments (aim for 2-3 per week)",
      "Optimize activation and onboarding flows",
      "Build referral and viral loops",
      "Focus on retention before acquisition"
    ],
    proTips: [
      "A 5% increase in retention can boost profits by 25-95%",
      "The best growth hack is a great product"
    ],
    category: "Growth"
  }
};

export const queryDataset = [
  { query: "how to improve google ranking", category: "SEO" },
  { query: "how to perform technical seo audit", category: "SEO" },
  { query: "on page seo optimization", category: "SEO" },
  { query: "backlink building strategies", category: "SEO" },
  { query: "keyword research tips", category: "SEO" },
  { query: "best hashtags for instagram", category: "SMM" },
  { query: "how to grow instagram followers", category: "SMM" },
  { query: "linkedin content strategy", category: "SMM" },
  { query: "twitter engagement tactics", category: "SMM" },
  { query: "tiktok marketing strategy", category: "SMM" },
  { query: "facebook ads targeting strategy", category: "Advertising" },
  { query: "google ads keyword targeting", category: "Advertising" },
  { query: "retargeting campaign setup", category: "Advertising" },
  { query: "ppc budget optimization", category: "Advertising" },
  { query: "content calendar ideas", category: "Content" },
  { query: "blog writing tips", category: "Content" },
  { query: "content marketing strategy", category: "Content" },
  { query: "video content creation", category: "Content" },
  { query: "marketing analytics tools", category: "Analytics" },
  { query: "google analytics setup", category: "Analytics" },
  { query: "conversion tracking", category: "Analytics" },
  { query: "growth hacking techniques", category: "Growth" },
  { query: "user acquisition strategies", category: "Growth" },
  { query: "referral program ideas", category: "Growth" },
];

export const learningModules = [
  {
    id: "seo-fundamentals",
    title: "SEO Fundamentals",
    icon: "Search",
    color: "primary",
    description: "Master search engine optimization from the ground up",
    lessons: [
      { title: "Understanding Search Engines", content: "Learn how Google crawls, indexes, and ranks web pages. Understand the role of algorithms like PageRank and BERT in determining search results." },
      { title: "Keyword Research Mastery", content: "Use tools like Ahrefs, SEMrush, and Google Keyword Planner to find high-value keywords. Understand search volume, keyword difficulty, and search intent." },
      { title: "On-Page SEO", content: "Optimize title tags, meta descriptions, headers, content, images, and internal links. Learn about keyword density, semantic SEO, and content structure." },
      { title: "Link Building Strategies", content: "Build high-quality backlinks through guest posting, broken link building, HARO, and digital PR. Understand domain authority and link equity." },
    ]
  },
  {
    id: "technical-seo",
    title: "Technical SEO",
    icon: "Code",
    color: "accent",
    description: "Deep dive into the technical side of search optimization",
    lessons: [
      { title: "Site Architecture & Crawling", content: "Design crawl-friendly site structures. Configure robots.txt, XML sitemaps, and canonical tags properly." },
      { title: "Core Web Vitals", content: "Optimize LCP, FID/INP, and CLS. Use Lighthouse, PageSpeed Insights, and Chrome DevTools for performance profiling." },
      { title: "Structured Data & Schema", content: "Implement JSON-LD structured data for rich snippets. Cover Product, Article, FAQ, HowTo, and Organization schemas." },
      { title: "Technical SEO Checklist", content: "1. Crawl site with Screaming Frog\n2. Check indexing issues\n3. Optimize page speed\n4. Fix broken links\n5. Monitor with Google Search Console" },
    ]
  },
  {
    id: "google-ads",
    title: "Google Ads Strategy",
    icon: "Target",
    color: "warm",
    description: "Create and optimize profitable Google Ads campaigns",
    lessons: [
      { title: "Campaign Structure", content: "Learn account hierarchy: Campaigns → Ad Groups → Ads → Keywords. Understand match types and quality score factors." },
      { title: "Keyword Strategy", content: "Master broad, phrase, exact match types. Use negative keywords effectively. Understand bidding strategies and budget allocation." },
      { title: "Ad Copy Optimization", content: "Write compelling headlines and descriptions. Use ad extensions, responsive search ads, and A/B testing methodologies." },
      { title: "Conversion Tracking", content: "Set up Google Tag Manager, configure conversion actions, implement enhanced conversions, and build attribution models." },
    ]
  },
  {
    id: "social-media",
    title: "Social Media Growth",
    icon: "Share2",
    color: "primary",
    description: "Build and grow your social media presence strategically",
    lessons: [
      { title: "Platform Selection", content: "Choose the right platforms based on your audience demographics, content type, and business goals." },
      { title: "Content Strategy", content: "Develop content pillars, create editorial calendars, and balance educational, entertaining, and promotional content." },
      { title: "Community Building", content: "Engage authentically, respond to comments, collaborate with creators, and build brand advocates." },
      { title: "Paid Social", content: "Run effective ad campaigns on Meta, LinkedIn, and TikTok. Master audience targeting, lookalikes, and retargeting." },
    ]
  },
  {
    id: "content-marketing",
    title: "Content Marketing",
    icon: "FileText",
    color: "accent",
    description: "Create content that attracts, engages, and converts",
    lessons: [
      { title: "Content Strategy Framework", content: "Define your content mission, audience personas, content pillars, and distribution channels." },
      { title: "Blog & Article Writing", content: "Write SEO-optimized long-form content. Master headline formulas, storytelling, and CTA placement." },
      { title: "Video & Visual Content", content: "Create engaging video content for YouTube, Reels, and TikTok. Design infographics and visual assets." },
      { title: "Content Distribution", content: "Distribute through owned, earned, and paid channels. Repurpose content across multiple formats and platforms." },
    ]
  },
  {
    id: "growth-marketing",
    title: "Growth Marketing",
    icon: "TrendingUp",
    color: "warm",
    description: "Rapid experimentation for scalable growth",
    lessons: [
      { title: "Growth Frameworks", content: "Master AARRR (Pirate Metrics), ICE scoring, and the Growth Loop methodology for systematic experimentation." },
      { title: "Experimentation", content: "Design and run A/B tests, multivariate tests, and growth experiments. Calculate statistical significance and impact." },
      { title: "Viral & Referral Loops", content: "Build viral coefficients > 1. Design referral programs, shareable moments, and network effects." },
      { title: "Retention & Engagement", content: "Optimize onboarding, build habit loops, reduce churn, and increase lifetime value through engagement strategies." },
    ]
  },
  {
    id: "marketing-analytics",
    title: "Marketing Analytics",
    icon: "BarChart3",
    color: "primary",
    description: "Measure, analyze, and optimize marketing performance",
    lessons: [
      { title: "Analytics Setup", content: "Configure GA4, set up event tracking, create custom dimensions, and build conversion funnels." },
      { title: "Attribution Modeling", content: "Understand first-touch, last-touch, linear, and data-driven attribution models for accurate ROI measurement." },
      { title: "Dashboard Design", content: "Build actionable dashboards in Looker Studio or Tableau. Focus on leading indicators and business KPIs." },
      { title: "Data-Driven Decisions", content: "Use cohort analysis, customer segmentation, and predictive analytics to inform marketing strategy." },
    ]
  }
];

export const marketingTools = [
  {
    category: "SEO Tools",
    tools: [
      { name: "Ahrefs", description: "Comprehensive SEO toolset for backlink analysis, keyword research, and competitive intelligence.", useCase: "Backlink auditing, keyword research, content gap analysis", when: "When you need deep competitive SEO insights" },
      { name: "Screaming Frog", description: "Website crawler that helps identify technical SEO issues like broken links, redirects, and metadata.", useCase: "Technical SEO audits, site migrations", when: "Before and after any major site changes" },
      { name: "Google Search Console", description: "Free Google tool for monitoring search performance, indexing status, and fixing issues.", useCase: "Search performance monitoring, index management", when: "Daily monitoring and issue resolution" },
      { name: "Surfer SEO", description: "AI-powered content optimization tool that analyzes SERP data to help create ranking content.", useCase: "Content optimization, on-page SEO scoring", when: "When writing or optimizing blog content" },
    ]
  },
  {
    category: "Analytics Platforms",
    tools: [
      { name: "Google Analytics 4", description: "Event-based analytics platform for tracking user behavior, conversions, and marketing attribution.", useCase: "Website analytics, conversion tracking, audience insights", when: "Essential for every website — set up on day one" },
      { name: "Mixpanel", description: "Product analytics platform focused on user behavior tracking and funnel analysis.", useCase: "Product analytics, user journey mapping, retention analysis", when: "When you need deep product usage insights" },
      { name: "Hotjar", description: "Behavior analytics tool with heatmaps, session recordings, and user feedback widgets.", useCase: "UX analysis, conversion optimization research", when: "When optimizing landing pages or user flows" },
    ]
  },
  {
    category: "Email Marketing",
    tools: [
      { name: "Mailchimp", description: "All-in-one email marketing platform with automation, templates, and audience management.", useCase: "Email campaigns, newsletters, drip sequences", when: "Starting out with email marketing" },
      { name: "ConvertKit", description: "Creator-focused email marketing with powerful automation and landing pages.", useCase: "Content creator emails, course launches, subscriber management", when: "For creators and content-focused businesses" },
      { name: "ActiveCampaign", description: "Advanced email marketing and CRM with sophisticated automation capabilities.", useCase: "Complex automation workflows, CRM integration", when: "When you need advanced marketing automation" },
    ]
  },
  {
    category: "Advertising Platforms",
    tools: [
      { name: "Google Ads", description: "Search, display, video, and shopping advertising across Google's network.", useCase: "Search ads, display campaigns, YouTube ads", when: "When targeting high-intent search queries" },
      { name: "Meta Ads Manager", description: "Advertising platform for Facebook, Instagram, Messenger, and Audience Network.", useCase: "Social media ads, brand awareness, retargeting", when: "When targeting specific demographics and interests" },
      { name: "LinkedIn Ads", description: "B2B advertising platform with professional audience targeting.", useCase: "B2B lead generation, thought leadership, recruiting", when: "When targeting business professionals" },
    ]
  },
  {
    category: "Content & Social",
    tools: [
      { name: "Buffer", description: "Social media management tool for scheduling, publishing, and analyzing posts.", useCase: "Social media scheduling, multi-platform publishing", when: "When managing multiple social accounts" },
      { name: "Canva", description: "Design platform for creating social media graphics, presentations, and marketing materials.", useCase: "Visual content creation, social media graphics", when: "When you need professional designs without a designer" },
      { name: "Notion", description: "All-in-one workspace for content planning, editorial calendars, and marketing documentation.", useCase: "Content calendars, project management, documentation", when: "When organizing marketing workflows" },
    ]
  }
];

export function classifyQuery(query: string): string {
  const q = query.toLowerCase();
  const keywords: Record<string, string[]> = {
    SEO: ["seo", "google ranking", "backlink", "keyword", "crawl", "index", "search engine", "serp", "page speed", "meta tag", "schema", "sitemap", "canonical"],
    SMM: ["instagram", "facebook", "twitter", "linkedin", "social media", "tiktok", "followers", "hashtag", "engagement", "post", "stories", "reels"],
    Advertising: ["ads", "advertising", "ppc", "google ads", "facebook ads", "campaign", "cpc", "cpm", "retarget", "bid", "display ad"],
    Content: ["content", "blog", "article", "video", "infographic", "copywriting", "editorial", "content calendar", "storytelling"],
    Analytics: ["analytics", "tracking", "conversion", "metrics", "dashboard", "attribution", "roi", "kpi", "data", "report"],
    Growth: ["growth", "acquisition", "retention", "referral", "viral", "onboarding", "churn", "lifetime value", "experiment", "a/b test"],
  };

  for (const [category, terms] of Object.entries(keywords)) {
    if (terms.some(term => q.includes(term))) return category;
  }
  return "Growth";
}

export function getResponse(query: string, technicalMode: boolean): MarketingResponse {
  const q = query.toLowerCase().trim();
  
  // Check precise answers
  if (preciseAnswers[q]) {
    const response = { ...preciseAnswers[q] };
    if (technicalMode) {
      response.steps = [...response.steps, "📊 Track metrics in Google Analytics 4", "⚙️ Automate reporting with Looker Studio"];
      response.proTips = [...response.proTips, "🔧 Use API integrations for automated workflows", "📈 Set up custom alerts for KPI changes"];
    }
    return response;
  }

  // Classify and get category response
  const category = classifyQuery(q);
  const response = { ...categoryResponses[category] };
  response.title = `${response.title} — Based on your query`;
  
  if (technicalMode) {
    response.steps = [...response.steps, "📊 Set up automated KPI tracking", "⚙️ Build CI/CD pipeline for marketing assets"];
    response.proTips = [...response.proTips, "🔧 Leverage marketing APIs for automation", "📈 Use Python/R for advanced analytics"];
  }
  
  return response;
}
