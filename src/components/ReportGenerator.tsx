import { useState } from "react";
import { FileText, Download, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import ReactMarkdown from "react-markdown";

const REPORT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-report`;

const businessTypes = ["SaaS", "E-commerce", "Agency", "Local Business", "Startup", "FinTech", "EdTech"];
const audiences = ["Developers", "Small businesses", "Consumers", "Enterprise", "Students", "Creators"];
const goals = ["Increase signups", "Brand awareness", "Increase sales", "Lead generation", "User retention", "Product launch"];

export default function ReportGenerator() {
  const [business, setBusiness] = useState("");
  const [audience, setAudience] = useState("");
  const [goal, setGoal] = useState("");
  const [report, setReport] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generate = async () => {
    if (!business || !audience || !goal) return;
    setIsGenerating(true);
    setReport("");
    try {
      const resp = await fetch(REPORT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ business, audience, goal }),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Failed" }));
        toast({ title: "Error", description: err.error, variant: "destructive" });
        return;
      }
      const data = await resp.json();
      setReport(data.report || "No report generated.");
    } catch {
      toast({ title: "Error", description: "Failed to generate report", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPdf = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const maxWidth = pageWidth - margin * 2;
      let y = 20;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(0, 150, 136);
      doc.text("MarketMind Marketing Report", margin, y);
      y += 12;

      doc.setDrawColor(0, 150, 136);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);
      y += 10;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Business: ${business}  |  Audience: ${audience}  |  Goal: ${goal}`, margin, y);
      y += 8;
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, y);
      y += 12;

      const lines = report.split("\n");
      doc.setTextColor(30, 30, 30);

      for (const line of lines) {
        if (y > 270) { doc.addPage(); y = 20; }
        if (line.startsWith("## ")) {
          y += 4;
          doc.setFont("helvetica", "bold"); doc.setFontSize(14); doc.setTextColor(0, 150, 136);
          doc.text(line.replace("## ", ""), margin, y); y += 8; doc.setTextColor(30, 30, 30);
        } else if (line.startsWith("### ")) {
          y += 2;
          doc.setFont("helvetica", "bold"); doc.setFontSize(11);
          doc.text(line.replace("### ", ""), margin, y); y += 7;
        } else if (line.startsWith("# ")) {
          doc.setFont("helvetica", "bold"); doc.setFontSize(16); doc.setTextColor(0, 150, 136);
          doc.text(line.replace("# ", ""), margin, y); y += 10; doc.setTextColor(30, 30, 30);
        } else if (line.startsWith("- ") || line.startsWith("* ")) {
          doc.setFont("helvetica", "normal"); doc.setFontSize(10);
          const wrapped = doc.splitTextToSize(`• ${line.replace(/^[-*] /, "")}`, maxWidth - 5);
          doc.text(wrapped, margin + 5, y); y += wrapped.length * 5;
        } else if (line.match(/^\d+\. /)) {
          doc.setFont("helvetica", "normal"); doc.setFontSize(10);
          const wrapped = doc.splitTextToSize(line, maxWidth - 5);
          doc.text(wrapped, margin + 5, y); y += wrapped.length * 5;
        } else if (line.trim()) {
          doc.setFont("helvetica", "normal"); doc.setFontSize(10);
          const wrapped = doc.splitTextToSize(line.replace(/\*\*/g, "").replace(/\*/g, ""), maxWidth);
          doc.text(wrapped, margin, y); y += wrapped.length * 5;
        } else { y += 3; }
      }

      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i); doc.setFontSize(8); doc.setTextColor(150, 150, 150);
        doc.text(`MarketMind Report  •  Page ${i} of ${pageCount}`, margin, 290);
      }

      // Save directly to the user's system using jsPDF's native save (uses
      // FileSaver under the hood and respects the browser's download dialog)
      const filename = `MarketMind_Report_${new Date().toISOString().split("T")[0]}.pdf`;
      doc.save(filename);
      toast({ title: "PDF Saved", description: `${filename} downloaded to your device.` });
    } catch (err) {
      console.error("PDF download error:", err);
      toast({ title: "Download failed", description: "Could not generate PDF. Please try again.", variant: "destructive" });
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 overflow-y-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-h2 text-foreground">Marketing Report</h2>
          <p className="text-body text-muted-foreground mt-1">Generate comprehensive marketing reports with PDF export</p>
        </div>
        <div className="w-11 h-11 rounded-2xl gradient-warm flex items-center justify-center shadow-glow flex-shrink-0">
          <FileText className="w-6 h-6 text-accent-foreground" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SelectField label="Business Type" value={business} options={businessTypes} onChange={setBusiness} />
        <SelectField label="Target Audience" value={audience} options={audiences} onChange={setAudience} />
        <SelectField label="Marketing Goal" value={goal} options={goals} onChange={setGoal} />
      </div>

      <button
        onClick={generate}
        disabled={!business || !audience || !goal || isGenerating}
        className="gradient-primary text-primary-foreground px-6 py-3 rounded-2xl font-display font-semibold text-body disabled:opacity-40 hover:shadow-glow transition-all flex items-center gap-2 shadow-glow"
      >
        {isGenerating ? (
          <>
            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            Generating Report...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Generate Report
          </>
        )}
      </button>

      {/* Loading skeleton */}
      {isGenerating && (
        <div className="glass-card p-5 space-y-3">
          <div className="skeleton-shimmer h-6 w-1/2 rounded-lg" />
          <div className="skeleton-shimmer h-4 w-full rounded-lg" />
          <div className="skeleton-shimmer h-4 w-5/6 rounded-lg" />
          <div className="skeleton-shimmer h-4 w-4/5 rounded-lg" />
          <div className="skeleton-shimmer h-4 w-2/3 rounded-lg" />
        </div>
      )}

      <AnimatePresence>
        {report && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-foreground text-body-lg">Your Report</h3>
              <button
                onClick={downloadPdf}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl gradient-accent text-accent-foreground text-body font-medium hover:shadow-glow transition-all shadow-glow"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
            <div className="glass-card p-5 prose prose-sm prose-invert max-w-none [&_h1]:font-display [&_h1]:text-h3 [&_h1]:text-foreground [&_h2]:font-display [&_h2]:text-body-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:font-display [&_h3]:text-body [&_h3]:font-medium [&_h3]:text-foreground [&_p]:text-secondary-foreground [&_p]:text-body [&_p]:leading-relaxed [&_li]:text-secondary-foreground [&_li]:text-body [&_strong]:text-foreground">
              <ReactMarkdown>{report}</ReactMarkdown>
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
      <label className="text-caption font-medium text-muted-foreground mb-1.5 block">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl px-3 py-3 text-body text-foreground outline-none focus:border-primary/50 focus:shadow-glow transition-all appearance-none cursor-pointer"
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
