-- =============================================================================
-- Finanzas 2026 — Esquema inicial
-- Ejecutar en Supabase SQL Editor o via CLI: supabase db push
-- =============================================================================

-- Extensiones
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- Tipos enumerados
-- -----------------------------------------------------------------------------
CREATE TYPE public.transaction_type AS ENUM ('income', 'expense');
CREATE TYPE public.category_kind AS ENUM ('income', 'expense', 'both');

-- -----------------------------------------------------------------------------
-- profiles
-- -----------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email         TEXT,
  full_name     TEXT,
  avatar_url    TEXT,
  default_currency TEXT NOT NULL DEFAULT 'EUR'
    CHECK (default_currency IN ('EUR', 'USD', 'ARS')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.profiles IS 'Perfil extendido del usuario autenticado';

-- -----------------------------------------------------------------------------
-- categories (personalizables por usuario)
-- -----------------------------------------------------------------------------
CREATE TABLE public.categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL,
  kind        public.category_kind NOT NULL DEFAULT 'expense',
  color       TEXT,
  icon        TEXT,
  is_default  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, slug)
);

CREATE INDEX idx_categories_user_id ON public.categories (user_id);

-- -----------------------------------------------------------------------------
-- transactions — fuente de verdad (inmutables: solo INSERT + SELECT)
-- -----------------------------------------------------------------------------
CREATE TABLE public.transactions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  type                public.transaction_type NOT NULL,
  amount              NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  currency            TEXT NOT NULL DEFAULT 'EUR'
    CHECK (currency IN ('EUR', 'USD', 'ARS')),
  category_id         UUID REFERENCES public.categories (id) ON DELETE SET NULL,
  category_name       TEXT NOT NULL,
  date                DATE NOT NULL,
  description         TEXT NOT NULL DEFAULT '',
  account             TEXT,
  investment_related  BOOLEAN NOT NULL DEFAULT FALSE,
  reversal_of_id      UUID REFERENCES public.transactions (id) ON DELETE RESTRICT,
  metadata            JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT transactions_reversal_different
    CHECK (reversal_of_id IS NULL OR reversal_of_id <> id)
);

CREATE INDEX idx_transactions_user_id ON public.transactions (user_id);
CREATE INDEX idx_transactions_user_date ON public.transactions (user_id, date DESC);
CREATE INDEX idx_transactions_user_type ON public.transactions (user_id, type);
CREATE INDEX idx_transactions_category ON public.transactions (category_id);
CREATE INDEX idx_transactions_reversal ON public.transactions (reversal_of_id)
  WHERE reversal_of_id IS NOT NULL;

COMMENT ON TABLE public.transactions IS 'Libro mayor inmutable. Correcciones vía reversal_of_id, sin UPDATE/DELETE.';
COMMENT ON COLUMN public.transactions.category_name IS 'Snapshot del nombre de categoría al momento del registro';
COMMENT ON COLUMN public.transactions.reversal_of_id IS 'Si no es NULL, esta transacción anula la referenciada';

-- -----------------------------------------------------------------------------
-- investments (portafolio — actualizable)
-- -----------------------------------------------------------------------------
CREATE TABLE public.investments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  asset           TEXT NOT NULL,
  platform        TEXT NOT NULL DEFAULT 'IBKR',
  quantity        NUMERIC(18, 6) NOT NULL CHECK (quantity >= 0),
  buy_price       NUMERIC(15, 4) NOT NULL CHECK (buy_price >= 0),
  current_price   NUMERIC(15, 4) NOT NULL CHECK (current_price >= 0),
  currency        TEXT NOT NULL DEFAULT 'USD'
    CHECK (currency IN ('EUR', 'USD', 'ARS')),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_investments_user_id ON public.investments (user_id);
CREATE UNIQUE INDEX idx_investments_user_asset_platform
  ON public.investments (user_id, asset, platform);

-- -----------------------------------------------------------------------------
-- balances — caché derivado (recalculable desde transactions)
-- -----------------------------------------------------------------------------
CREATE TABLE public.balances (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  period_year     INTEGER NOT NULL CHECK (period_year >= 2000 AND period_year <= 2100),
  period_month    INTEGER NOT NULL CHECK (period_month >= 1 AND period_month <= 12),
  currency        TEXT NOT NULL DEFAULT 'EUR'
    CHECK (currency IN ('EUR', 'USD', 'ARS')),
  income_total    NUMERIC(15, 2) NOT NULL DEFAULT 0,
  expense_total   NUMERIC(15, 2) NOT NULL DEFAULT 0,
  net_balance     NUMERIC(15, 2) NOT NULL DEFAULT 0,
  computed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, period_year, period_month, currency)
);

CREATE INDEX idx_balances_user_period ON public.balances (user_id, period_year, period_month);

COMMENT ON TABLE public.balances IS 'Caché mensual derivado. Fuente de verdad: transactions.';

-- -----------------------------------------------------------------------------
-- Funciones auxiliares
-- -----------------------------------------------------------------------------

-- Actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER investments_set_updated_at
  BEFORE UPDATE ON public.investments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Crear perfil al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  PERFORM public.seed_default_categories(NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Categorías por defecto para nuevos usuarios
CREATE OR REPLACE FUNCTION public.seed_default_categories(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cats TEXT[][] := ARRAY[
    ARRAY['Super', 'super', 'expense'],
    ARRAY['Transporte', 'transporte', 'expense'],
    ARRAY['Alquiler', 'alquiler', 'expense'],
    ARRAY['OCIO', 'ocio', 'expense'],
    ARRAY['Comida', 'comida', 'expense'],
    ARRAY['Suscripciones', 'suscripciones', 'expense'],
    ARRAY['Viaje', 'viaje', 'expense'],
    ARRAY['Devolucion', 'devolucion', 'expense'],
    ARRAY['Otro', 'otro', 'expense'],
    ARRAY['Trabajo', 'trabajo', 'income'],
    ARRAY['Inversiones', 'inversiones', 'income']
  ];
  c TEXT[];
BEGIN
  FOREACH c SLICE 1 IN ARRAY cats LOOP
    INSERT INTO public.categories (user_id, name, slug, kind, is_default)
    VALUES (
      p_user_id,
      c[1],
      c[2],
      c[3]::public.category_kind,
      TRUE
    )
    ON CONFLICT (user_id, slug) DO NOTHING;
  END LOOP;
END;
$$;

-- Recalcular balances mensuales desde transactions (excluye anuladas)
CREATE OR REPLACE FUNCTION public.refresh_user_balances(p_user_id UUID, p_currency TEXT DEFAULT 'EUR')
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.balances (
    user_id, period_year, period_month, currency,
    income_total, expense_total, net_balance, computed_at
  )
  SELECT
    p_user_id,
    EXTRACT(YEAR FROM t.date)::INTEGER,
    EXTRACT(MONTH FROM t.date)::INTEGER,
    p_currency,
    COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0),
    COALESCE(SUM(
      CASE
        WHEN t.type = 'income' THEN t.amount
        WHEN t.type = 'expense' THEN -t.amount
        ELSE 0
      END
    ), 0),
    NOW()
  FROM public.transactions t
  WHERE t.user_id = p_user_id
    AND t.currency = p_currency
    AND t.reversal_of_id IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM public.transactions rev
      WHERE rev.reversal_of_id = t.id
    )
  GROUP BY EXTRACT(YEAR FROM t.date), EXTRACT(MONTH FROM t.date)
  ON CONFLICT (user_id, period_year, period_month, currency)
  DO UPDATE SET
    income_total  = EXCLUDED.income_total,
    expense_total = EXCLUDED.expense_total,
    net_balance   = EXCLUDED.net_balance,
    computed_at   = EXCLUDED.computed_at;
END;
$$;

-- Trigger: refrescar balances tras nueva transacción
CREATE OR REPLACE FUNCTION public.on_transaction_insert_refresh_balances()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.refresh_user_balances(NEW.user_id, NEW.currency);
  RETURN NEW;
END;
$$;

CREATE TRIGGER transactions_after_insert_refresh
  AFTER INSERT ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.on_transaction_insert_refresh_balances();

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.balances ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- categories
CREATE POLICY "categories_select_own" ON public.categories
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "categories_insert_own" ON public.categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "categories_update_own" ON public.categories
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "categories_delete_own" ON public.categories
  FOR DELETE USING (auth.uid() = user_id AND is_default = FALSE);

-- transactions — inmutables: SELECT + INSERT únicamente
CREATE POLICY "transactions_select_own" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "transactions_insert_own" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- investments
CREATE POLICY "investments_select_own" ON public.investments
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "investments_insert_own" ON public.investments
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "investments_update_own" ON public.investments
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "investments_delete_own" ON public.investments
  FOR DELETE USING (auth.uid() = user_id);

-- balances — solo lectura para el cliente (escritura vía funciones SECURITY DEFINER)
CREATE POLICY "balances_select_own" ON public.balances
  FOR SELECT USING (auth.uid() = user_id);