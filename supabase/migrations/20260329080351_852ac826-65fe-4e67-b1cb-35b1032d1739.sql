
-- Table for storing KPI metrics over time
CREATE TABLE public.kpi_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  metric_date date NOT NULL DEFAULT CURRENT_DATE,
  organic_traffic integer NOT NULL DEFAULT 0,
  paid_traffic integer NOT NULL DEFAULT 0,
  direct_traffic integer NOT NULL DEFAULT 0,
  ctr numeric(5,2) NOT NULL DEFAULT 0,
  impressions integer NOT NULL DEFAULT 0,
  bounce_rate numeric(5,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Table for keyword rankings
CREATE TABLE public.keyword_rankings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  keyword text NOT NULL,
  position integer NOT NULL,
  previous_position integer,
  recorded_at date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.kpi_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.keyword_rankings ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can manage own metrics"
  ON public.kpi_metrics FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own rankings"
  ON public.keyword_rankings FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
