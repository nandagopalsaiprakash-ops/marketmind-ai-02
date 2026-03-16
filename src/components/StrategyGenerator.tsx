import { useState } from "react";
import { Lightbulb, Rocket, Target, Megaphone, PenTool } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Strategy {
  strategy: string;
  tactics: string[];
  channels: string[];
  contentIdeas: string[];
}

const strategies: Record<string, Record<string, Record<string, Strategy>>> = {
  SaaS: {
    Developers: {
      "Increase signups": {
        strategy: "Developer-First Content & Community Growth Strategy",
        tactics: [
          "Create comprehensive API documentation with interactive examples",
          "Launch a developer blog with technical tutorials and use cases",
          "Build an open-source SDK or tool that showcases your product",
          "Run developer-focused webinars and live coding sessions",
          "Implement a generous free tier with self-serve onboarding",
          "Create a developer community on Discord or Slack"
        ],
        channels: ["Dev.to & Hashnode", "GitHub Sponsorships", "Stack Overflow Ads", "Technical YouTube", "Twitter/X Dev Community", "Hacker News"],
        contentIdeas: [
          "\"How We Built X\" engineering blog posts",
          "Open-source starter templates",
          "Video tutorials on common integration patterns",
          "Technical comparison guides (You vs Competitors)",
          "Developer changelog and product updates",
          "Case studies from technical users"
        ]
      },
      "Brand awareness": {
        strategy: "Technical Thought Leadership & Developer Relations",
        tactics: [
          "Sponsor developer conferences and meetups",
          "Publish technical deep-dives and architecture posts",
          "Build and maintain popular open-source projects",
          "Launch a developer podcast or YouTube series",
          "Partner with developer influencers for reviews"
        ],
        channels: ["GitHub", "Dev.to", "YouTube", "Twitter/X", "Tech Conferences", "Podcasts"],
        contentIdeas: [
          "Architecture decision records (ADRs)",
          "\"Behind the scenes\" engineering posts",
          "Conference talk recordings",
          "Developer tool reviews and comparisons"
        ]
      }
    },
    "Small businesses": {
      "Increase signups": {
        strategy: "Value-Driven SMB Acquisition Strategy",
        tactics: [
          "Create ROI calculators and free assessment tools",
          "Offer extended free trials (14-30 days)",
          "Build case studies from similar-sized businesses",
          "Run targeted Google Ads for solution-aware keywords",
          "Implement referral programs with mutual benefits"
        ],
        channels: ["Google Ads", "Facebook Ads", "LinkedIn", "Email Marketing", "Partner Networks"],
        contentIdeas: [
          "\"How [Business Type] saved X hours with our tool\"",
          "Industry-specific use case guides",
          "ROI comparison calculators",
          "Onboarding video walkthroughs"
        ]
      }
    }
  },
  "E-commerce": {
    Consumers: {
      "Increase sales": {
        strategy: "Full-Funnel E-commerce Growth Strategy",
        tactics: [
          "Implement abandoned cart email sequences",
          "Run retargeting campaigns on Meta and Google",
          "Optimize product pages for conversion (reviews, UGC, urgency)",
          "Launch influencer partnerships for social proof",
          "Create seasonal promotion calendars",
          "A/B test pricing and offer strategies"
        ],
        channels: ["Instagram Shopping", "Google Shopping", "TikTok Shop", "Email Marketing", "Pinterest", "Meta Ads"],
        contentIdeas: [
          "User-generated content campaigns",
          "Product styling and usage videos",
          "Behind-the-scenes brand story content",
          "Seasonal gift guides and collections",
          "Customer spotlight and review features"
        ]
      }
    }
  }
};

const businessTypes = ["SaaS", "E-commerce", "Agency", "Local Business", "Startup"];
const audiences = ["Developers", "Small businesses", "Consumers", "Enterprise", "Students"];
const goals = ["Increase signups", "Brand awareness", "Increase sales", "Lead generation", "User retention"];

export default function StrategyGenerator() {
  const [business, setBusiness] = useState("");
  const [audience, setAudience] = useState("");
  const [goal, setGoal] = useState("");
  const [result, setResult] = useState<Strategy | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    if (!business || !audience || !goal) return;
    setIsGenerating(true);
    setResult(null);

    setTimeout(() => {
      const found = strategies[business]?.[audience]?.[goal];
      const fallback: Strategy = {
        strategy: `${goal} Strategy for ${business} targeting ${audience}`,
        tactics: [
          `Develop ${audience.toLowerCase()}-focused content marketing`,
          `Run targeted campaigns on relevant channels`,
          `Build community around your ${business.toLowerCase()} brand`,
          `Implement data-driven optimization and A/B testing`,
          `Create referral and loyalty programs`,
          `Optimize conversion funnel through user research`
        ],
        channels: ["Google Ads", "LinkedIn", "Content Marketing", "Email", "Social Media", "Partnerships"],
        contentIdeas: [
          `${audience} success stories and case studies`,
          `Industry benchmark reports and data studies`,
          `How-to guides for ${audience.toLowerCase()}`,
          `Video testimonials and product demos`,
          `Interactive tools (calculators, assessments)`
        ]
      };
      setResult(found || fallback);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      <div>
        <h2 className="font-display font-bold text-2xl text-foreground">Strategy Generator</h2>
        <p className="text-sm text-muted-foreground mt-1">Generate a custom marketing strategy in seconds</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SelectField label="Business Type" value={business} options={businessTypes} onChange={setBusiness} />
        <SelectField label="Target Audience" value={audience} options={audiences} onChange={setAudience} />
        <SelectField label="Marketing Goal" value={goal} options={goals} onChange={setGoal} />
      </div>

      <button
        onClick={handleGenerate}
        disabled={!business || !audience || !goal || isGenerating}
        className="gradient-primary text-primary-foreground px-6 py-3 rounded-xl font-display font-semibold text-sm disabled:opacity-40 hover:shadow-glow transition-all flex items-center gap-2"
      >
        <Rocket className="w-4 h-4" />
        {isGenerating ? "Generating Strategy..." : "Generate Strategy"}
      </button>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-primary" />
                <h3 className="font-display font-bold text-foreground">{result.strategy}</h3>
              </div>
              
              <Section icon={Target} title="Growth Tactics" items={result.tactics} />
              <Section icon={Megaphone} title="Recommended Channels" items={result.channels} chip />
              <Section icon={PenTool} title="Content Ideas" items={result.contentIdeas} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-card border border-border rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/50 focus:shadow-glow transition-all appearance-none cursor-pointer"
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Section({ icon: Icon, title, items, chip }: { icon: React.ElementType; title: string; items: string[]; chip?: boolean }) {
  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-primary" />
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      </div>
      {chip ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item, i) => (
            <span key={i} className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
              {item}
            </span>
          ))}
        </div>
      ) : (
        <ul className="space-y-1.5">
          {items.map((item, i) => (
            <li key={i} className="text-sm text-secondary-foreground flex gap-2">
              <span className="text-primary mt-0.5">•</span>
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
