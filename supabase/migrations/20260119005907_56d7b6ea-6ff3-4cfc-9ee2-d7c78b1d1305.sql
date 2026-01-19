-- =====================================================
-- MPCN TRADING SYSTEM DATABASE SCHEMA
-- =====================================================

-- 1. TRADER CLASSIFICATION ENUM
CREATE TYPE public.trader_classification AS ENUM (
  'trainee',
  'junior',
  'senior',
  'lead'
);

-- 2. TRADE STATUS ENUM
CREATE TYPE public.trade_status AS ENUM (
  'open',
  'closed',
  'cancelled'
);

-- 3. MARKET TYPE ENUM
CREATE TYPE public.market_type AS ENUM (
  'forex',
  'crypto',
  'stocks',
  'commodities',
  'indices',
  'options'
);

-- 4. TRADER PROFILES TABLE
-- Stores trader-specific information separate from general profiles
CREATE TABLE public.trader_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  classification trader_classification NOT NULL DEFAULT 'trainee',
  markets_approved market_type[] DEFAULT ARRAY[]::market_type[],
  risk_tier INTEGER NOT NULL DEFAULT 1 CHECK (risk_tier BETWEEN 1 AND 5),
  trading_school_id UUID,
  certification_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  demo_phase_completed BOOLEAN NOT NULL DEFAULT false,
  live_trading_enabled BOOLEAN NOT NULL DEFAULT false,
  capital_tier INTEGER NOT NULL DEFAULT 1 CHECK (capital_tier BETWEEN 1 AND 10),
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  ethics_acknowledged_at TIMESTAMPTZ,
  capital_protection_acknowledged_at TIMESTAMPTZ,
  loss_policy_acknowledged_at TIMESTAMPTZ,
  suspended_at TIMESTAMPTZ,
  suspension_reason TEXT,
  last_review_date DATE,
  next_review_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- 5. TRADER RISK LIMITS TABLE
-- Read-only limits set by MPCN for each trader
CREATE TABLE public.trader_risk_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trader_id UUID NOT NULL REFERENCES public.trader_profiles(id) ON DELETE CASCADE,
  max_risk_per_trade DECIMAL(5,2) NOT NULL DEFAULT 1.00 CHECK (max_risk_per_trade > 0 AND max_risk_per_trade <= 10),
  daily_loss_limit DECIMAL(5,2) NOT NULL DEFAULT 3.00 CHECK (daily_loss_limit > 0 AND daily_loss_limit <= 20),
  weekly_loss_limit DECIMAL(5,2) NOT NULL DEFAULT 6.00 CHECK (weekly_loss_limit > 0 AND weekly_loss_limit <= 30),
  max_open_trades INTEGER NOT NULL DEFAULT 3 CHECK (max_open_trades > 0 AND max_open_trades <= 20),
  max_position_size DECIMAL(10,2),
  max_leverage INTEGER DEFAULT 10 CHECK (max_leverage >= 1 AND max_leverage <= 100),
  set_by UUID NOT NULL,
  set_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(trader_id)
);

-- 6. TRADING STRATEGIES TABLE
-- Approved strategies that traders can use
CREATE TABLE public.trading_strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0',
  description TEXT,
  markets market_type[] NOT NULL DEFAULT ARRAY[]::market_type[],
  min_classification trader_classification NOT NULL DEFAULT 'trainee',
  is_approved BOOLEAN NOT NULL DEFAULT false,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(name, version)
);

-- 7. TRADES TABLE
-- Logged trades (auto + manual)
CREATE TABLE public.trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trader_id UUID NOT NULL REFERENCES public.trader_profiles(id) ON DELETE CASCADE,
  strategy_id UUID REFERENCES public.trading_strategies(id),
  instrument TEXT NOT NULL,
  market market_type NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('long', 'short')),
  entry_price DECIMAL(20,8) NOT NULL,
  exit_price DECIMAL(20,8),
  position_size DECIMAL(20,8) NOT NULL,
  risk_percentage DECIMAL(5,2) NOT NULL,
  stop_loss DECIMAL(20,8) NOT NULL,
  take_profit DECIMAL(20,8),
  status trade_status NOT NULL DEFAULT 'open',
  pnl_amount DECIMAL(20,2),
  pnl_percentage DECIMAL(8,4),
  r_multiple DECIMAL(8,4),
  -- Manual fields (required for completion)
  trade_rationale TEXT,
  emotional_state TEXT,
  execution_notes TEXT,
  pre_trade_checklist_completed BOOLEAN NOT NULL DEFAULT false,
  -- Metadata
  entry_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  exit_time TIMESTAMPTZ,
  external_trade_id TEXT,
  platform TEXT,
  screenshots_url TEXT[],
  is_demo BOOLEAN NOT NULL DEFAULT false,
  -- Rule compliance
  rules_followed BOOLEAN,
  rule_violations TEXT[],
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. TRADER KPI SCORES TABLE
-- Monthly KPI scoring for traders
CREATE TABLE public.trader_kpi_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trader_id UUID NOT NULL REFERENCES public.trader_profiles(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  -- Scores (0-100)
  risk_discipline_score INTEGER NOT NULL DEFAULT 0 CHECK (risk_discipline_score BETWEEN 0 AND 100),
  consistency_score INTEGER NOT NULL DEFAULT 0 CHECK (consistency_score BETWEEN 0 AND 100),
  strategy_execution_score INTEGER NOT NULL DEFAULT 0 CHECK (strategy_execution_score BETWEEN 0 AND 100),
  profitability_score INTEGER NOT NULL DEFAULT 0 CHECK (profitability_score BETWEEN 0 AND 100),
  -- Weighted total (risk 40%, consistency 25%, strategy 20%, profit 15%)
  total_score INTEGER GENERATED ALWAYS AS (
    (risk_discipline_score * 40 + consistency_score * 25 + strategy_execution_score * 20 + profitability_score * 15) / 100
  ) STORED,
  -- Metrics
  total_trades INTEGER NOT NULL DEFAULT 0,
  winning_trades INTEGER NOT NULL DEFAULT 0,
  win_rate DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE WHEN total_trades > 0 THEN (winning_trades::DECIMAL / total_trades * 100) ELSE 0 END
  ) STORED,
  average_r_multiple DECIMAL(8,4),
  max_drawdown DECIMAL(5,2),
  expectancy DECIMAL(10,4),
  -- Actions
  recommended_action TEXT CHECK (recommended_action IN ('promote', 'maintain', 'retrain', 'suspend')),
  action_taken TEXT,
  action_taken_by UUID,
  action_taken_at TIMESTAMPTZ,
  notes TEXT,
  calculated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(trader_id, period_start, period_end)
);

-- 9. TRADING SCHOOLS TABLE
-- Partner trading schools
CREATE TABLE public.trading_schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_email TEXT,
  website_url TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. TRADER CERTIFICATIONS TABLE
-- Certifications from trading schools
CREATE TABLE public.trader_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trader_id UUID NOT NULL REFERENCES public.trader_profiles(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES public.trading_schools(id) ON DELETE CASCADE,
  certification_name TEXT NOT NULL,
  certification_date DATE NOT NULL,
  expiry_date DATE,
  certificate_url TEXT,
  verified BOOLEAN NOT NULL DEFAULT false,
  verified_by UUID,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. TRADER ALERTS TABLE
-- System-generated alerts for rule violations
CREATE TABLE public.trader_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trader_id UUID NOT NULL REFERENCES public.trader_profiles(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN (
    'risk_violation', 
    'emotional_trading', 
    'overtrading', 
    'drawdown_breach',
    'rule_violation',
    'self_approval_attempt'
  )),
  severity TEXT NOT NULL CHECK (severity IN ('warning', 'critical', 'suspension')),
  message TEXT NOT NULL,
  related_trade_id UUID REFERENCES public.trades(id),
  triggered_action TEXT CHECK (triggered_action IN ('none', 'lock', 'review', 'suspend')),
  acknowledged BOOLEAN NOT NULL DEFAULT false,
  acknowledged_by UUID,
  acknowledged_at TIMESTAMPTZ,
  resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_by UUID,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. TRADER DAILY REPORTS TABLE
-- Auto-generated daily reports
CREATE TABLE public.trader_daily_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trader_id UUID NOT NULL REFERENCES public.trader_profiles(id) ON DELETE CASCADE,
  report_date DATE NOT NULL,
  trades_taken INTEGER NOT NULL DEFAULT 0,
  rules_followed_count INTEGER NOT NULL DEFAULT 0,
  rules_breached_count INTEGER NOT NULL DEFAULT 0,
  net_pnl DECIMAL(20,2) NOT NULL DEFAULT 0,
  net_pnl_percentage DECIMAL(8,4) NOT NULL DEFAULT 0,
  max_drawdown DECIMAL(5,2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(trader_id, report_date)
);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.trader_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trader_risk_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trader_kpi_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trader_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trader_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trader_daily_reports ENABLE ROW LEVEL SECURITY;

-- Trader Profiles: Users can view own, admins can manage all
CREATE POLICY "Users can view own trader profile"
ON public.trader_profiles FOR SELECT
USING (auth.uid() = user_id OR has_role(auth.uid(), 'general_overseer') OR has_role(auth.uid(), 'user_admin'));

CREATE POLICY "Admins can manage trader profiles"
ON public.trader_profiles FOR ALL
USING (has_role(auth.uid(), 'general_overseer') OR has_role(auth.uid(), 'user_admin'));

CREATE POLICY "Users can create own trader profile"
ON public.trader_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update limited fields on own profile"
ON public.trader_profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Risk Limits: Read-only for traders, editable by admins only
CREATE POLICY "Traders can view own risk limits"
ON public.trader_risk_limits FOR SELECT
USING (
  trader_id IN (SELECT id FROM public.trader_profiles WHERE user_id = auth.uid())
  OR has_role(auth.uid(), 'general_overseer')
  OR has_role(auth.uid(), 'user_admin')
);

CREATE POLICY "Admins can manage risk limits"
ON public.trader_risk_limits FOR ALL
USING (has_role(auth.uid(), 'general_overseer') OR has_role(auth.uid(), 'user_admin'));

-- Trading Strategies: All traders can view approved, admins can manage
CREATE POLICY "All can view approved strategies"
ON public.trading_strategies FOR SELECT
USING (is_approved = true OR has_role(auth.uid(), 'general_overseer') OR has_role(auth.uid(), 'user_admin'));

CREATE POLICY "Admins can manage strategies"
ON public.trading_strategies FOR ALL
USING (has_role(auth.uid(), 'general_overseer') OR has_role(auth.uid(), 'user_admin'));

-- Trades: Traders can manage own, admins can view all
CREATE POLICY "Traders can manage own trades"
ON public.trades FOR ALL
USING (
  trader_id IN (SELECT id FROM public.trader_profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Admins can view all trades"
ON public.trades FOR SELECT
USING (has_role(auth.uid(), 'general_overseer') OR has_role(auth.uid(), 'user_admin'));

-- KPI Scores: Traders can view own, admins can manage all
CREATE POLICY "Traders can view own KPI scores"
ON public.trader_kpi_scores FOR SELECT
USING (
  trader_id IN (SELECT id FROM public.trader_profiles WHERE user_id = auth.uid())
  OR has_role(auth.uid(), 'general_overseer')
  OR has_role(auth.uid(), 'user_admin')
);

CREATE POLICY "Admins can manage KPI scores"
ON public.trader_kpi_scores FOR ALL
USING (has_role(auth.uid(), 'general_overseer') OR has_role(auth.uid(), 'user_admin'));

-- Trading Schools: All can view approved, admins can manage
CREATE POLICY "All can view approved schools"
ON public.trading_schools FOR SELECT
USING (is_approved = true OR has_role(auth.uid(), 'general_overseer') OR has_role(auth.uid(), 'user_admin'));

CREATE POLICY "Admins can manage trading schools"
ON public.trading_schools FOR ALL
USING (has_role(auth.uid(), 'general_overseer') OR has_role(auth.uid(), 'user_admin'));

-- Certifications: Traders can view own, admins can manage
CREATE POLICY "Traders can view own certifications"
ON public.trader_certifications FOR SELECT
USING (
  trader_id IN (SELECT id FROM public.trader_profiles WHERE user_id = auth.uid())
  OR has_role(auth.uid(), 'general_overseer')
  OR has_role(auth.uid(), 'user_admin')
);

CREATE POLICY "Traders can add own certifications"
ON public.trader_certifications FOR INSERT
WITH CHECK (trader_id IN (SELECT id FROM public.trader_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage certifications"
ON public.trader_certifications FOR ALL
USING (has_role(auth.uid(), 'general_overseer') OR has_role(auth.uid(), 'user_admin'));

-- Alerts: Traders can view own, admins can manage
CREATE POLICY "Traders can view own alerts"
ON public.trader_alerts FOR SELECT
USING (
  trader_id IN (SELECT id FROM public.trader_profiles WHERE user_id = auth.uid())
  OR has_role(auth.uid(), 'general_overseer')
  OR has_role(auth.uid(), 'user_admin')
);

CREATE POLICY "Admins can manage alerts"
ON public.trader_alerts FOR ALL
USING (has_role(auth.uid(), 'general_overseer') OR has_role(auth.uid(), 'user_admin'));

-- Daily Reports: Traders can view own, admins can view all
CREATE POLICY "Traders can view own daily reports"
ON public.trader_daily_reports FOR SELECT
USING (
  trader_id IN (SELECT id FROM public.trader_profiles WHERE user_id = auth.uid())
  OR has_role(auth.uid(), 'general_overseer')
  OR has_role(auth.uid(), 'user_admin')
);

CREATE POLICY "System can create daily reports"
ON public.trader_daily_reports FOR INSERT
WITH CHECK (true);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

CREATE TRIGGER update_trader_profiles_updated_at
  BEFORE UPDATE ON public.trader_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trader_risk_limits_updated_at
  BEFORE UPDATE ON public.trader_risk_limits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trading_strategies_updated_at
  BEFORE UPDATE ON public.trading_strategies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trades_updated_at
  BEFORE UPDATE ON public.trades
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trader_kpi_scores_updated_at
  BEFORE UPDATE ON public.trader_kpi_scores
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trading_schools_updated_at
  BEFORE UPDATE ON public.trading_schools
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- INSERT DEFAULT TRADING STRATEGIES
-- =====================================================

INSERT INTO public.trading_strategies (name, version, description, markets, min_classification, is_approved, created_by)
VALUES
  ('Trend Following', '1.0', 'Follow established market trends with proper risk management', ARRAY['forex', 'crypto', 'stocks']::market_type[], 'trainee', true, '00000000-0000-0000-0000-000000000000'),
  ('Breakout Trading', '1.0', 'Trade breakouts from consolidation with momentum confirmation', ARRAY['forex', 'crypto']::market_type[], 'junior', true, '00000000-0000-0000-0000-000000000000'),
  ('Scalping', '1.0', 'Quick in-and-out trades for small profits', ARRAY['forex', 'crypto']::market_type[], 'senior', true, '00000000-0000-0000-0000-000000000000'),
  ('Swing Trading', '1.0', 'Hold positions for days to weeks capturing larger moves', ARRAY['forex', 'stocks', 'commodities']::market_type[], 'junior', true, '00000000-0000-0000-0000-000000000000'),
  ('Mean Reversion', '1.0', 'Trade reversals when price deviates from average', ARRAY['forex', 'stocks', 'indices']::market_type[], 'senior', true, '00000000-0000-0000-0000-000000000000');