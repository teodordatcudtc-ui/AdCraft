-- ============================================
-- SUPABASE DATABASE SCHEMA
-- Agentie Reclame - Sistem Complet
-- ============================================

-- ============================================
-- 1. EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 2. TABELE PRINCIPALE
-- ============================================

-- Tabel pentru profiluri utilizatori (extinde auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT,
    bio TEXT,
    avatar_url TEXT,
    api_key TEXT UNIQUE, -- API key pentru acces programatic
    language TEXT DEFAULT 'ro',
    theme TEXT DEFAULT 'dark',
    email_notifications BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel pentru pachete de credite disponibile
CREATE TABLE IF NOT EXISTS public.credit_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    credits INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    features JSONB, -- Array de features
    popular BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel pentru tranzacții de credite
CREATE TABLE IF NOT EXISTS public.credit_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('purchase', 'usage', 'refund', 'bonus', 'admin_adjustment')),
    amount INTEGER NOT NULL, -- Poate fi pozitiv (adăugare) sau negativ (scădere)
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    package_id UUID REFERENCES public.credit_packages(id), -- Dacă este cumpărare
    payment_id TEXT, -- ID-ul plății din sistemul de plată
    metadata JSONB, -- Date suplimentare (ex: detalii plată)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel pentru generări (imagini și text)
CREATE TABLE IF NOT EXISTS public.generations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('image', 'text')),
    prompt TEXT NOT NULL,
    result_url TEXT, -- URL-ul imaginii generate sau textul generat
    result_text TEXT, -- Textul generat (dacă type = 'text')
    task_id TEXT, -- ID-ul task-ului de la KIE.AI (dacă există)
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    cost INTEGER NOT NULL, -- Credite folosite
    options JSONB, -- Opțiuni de generare (aspect_ratio, style, etc.)
    image_url TEXT, -- URL-ul imaginii uploadate (dacă există)
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Tabel pentru logs de activitate
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('success', 'error', 'info', 'warning')),
    message TEXT NOT NULL,
    action TEXT NOT NULL, -- Ex: 'generate_ad', 'purchase_credits', etc.
    metadata JSONB, -- Date suplimentare
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. INDEXURI PENTRU PERFORMANȚĂ
-- ============================================

CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON public.credit_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_status ON public.credit_transactions(status);

CREATE INDEX IF NOT EXISTS idx_generations_user_id ON public.generations(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_created_at ON public.generations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generations_status ON public.generations(status);
CREATE INDEX IF NOT EXISTS idx_generations_type ON public.generations(type);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_type ON public.activity_logs(type);

-- ============================================
-- 4. FUNCȚII UTILITARE
-- ============================================

-- Funcție pentru calcularea creditelor disponibile ale unui utilizator
CREATE OR REPLACE FUNCTION public.get_user_credits(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    total_credits INTEGER;
BEGIN
    SELECT COALESCE(SUM(amount), 0)
    INTO total_credits
    FROM public.credit_transactions
    WHERE user_id = user_uuid
    AND status = 'completed';
    
    RETURN total_credits;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funcție pentru verificarea dacă utilizatorul are suficiente credite
CREATE OR REPLACE FUNCTION public.has_sufficient_credits(user_uuid UUID, required_credits INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    current_credits INTEGER;
BEGIN
    current_credits := public.get_user_credits(user_uuid);
    RETURN current_credits >= required_credits;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funcție pentru adăugarea de credite
CREATE OR REPLACE FUNCTION public.add_credits(
    user_uuid UUID,
    credits_amount INTEGER,
    transaction_description TEXT,
    package_uuid UUID DEFAULT NULL,
    payment_id_param TEXT DEFAULT NULL,
    metadata_param JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    transaction_id UUID;
BEGIN
    INSERT INTO public.credit_transactions (
        user_id,
        type,
        amount,
        description,
        status,
        package_id,
        payment_id,
        metadata
    ) VALUES (
        user_uuid,
        'purchase',
        credits_amount,
        transaction_description,
        'completed',
        package_uuid,
        payment_id_param,
        metadata_param
    )
    RETURNING id INTO transaction_id;
    
    -- Log activitate
    INSERT INTO public.activity_logs (user_id, type, message, action)
    VALUES (user_uuid, 'success', transaction_description, 'purchase_credits');
    
    RETURN transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funcție pentru scăderea de credite (folosită la generări)
CREATE OR REPLACE FUNCTION public.deduct_credits(
    user_uuid UUID,
    credits_amount INTEGER,
    transaction_description TEXT,
    generation_uuid UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    transaction_id UUID;
    current_credits INTEGER;
    metadata_param JSONB;
BEGIN
    -- Verifică dacă are suficiente credite
    current_credits := public.get_user_credits(user_uuid);
    
    IF current_credits < credits_amount THEN
        RAISE EXCEPTION 'Insufficient credits. Current: %, Required: %', current_credits, credits_amount;
    END IF;
    
    -- Creează metadata
    metadata_param := jsonb_build_object('generation_id', generation_uuid);
    
    -- Creează tranzacția
    INSERT INTO public.credit_transactions (
        user_id,
        type,
        amount,
        description,
        status,
        metadata
    ) VALUES (
        user_uuid,
        'usage',
        -credits_amount, -- Negativ pentru scădere
        transaction_description,
        'completed',
        metadata_param
    )
    RETURNING id INTO transaction_id;
    
    -- Log activitate
    INSERT INTO public.activity_logs (user_id, type, message, action)
    VALUES (user_uuid, 'info', transaction_description, 'deduct_credits');
    
    RETURN transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funcție pentru actualizarea timestamp-ului updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. TRIGGERE
-- ============================================

-- Trigger pentru actualizarea updated_at
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_credit_packages_updated_at
    BEFORE UPDATE ON public.credit_packages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_credit_transactions_updated_at
    BEFORE UPDATE ON public.credit_transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_generations_updated_at
    BEFORE UPDATE ON public.generations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger pentru crearea automată a profilului când se creează un utilizator nou
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, full_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
    
    -- Adaugă credite bonus pentru utilizatorii noi
    PERFORM public.add_credits(NEW.id, 10, 'Credite bonus pentru înregistrare');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Activează RLS pentru toate tabelele
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_packages ENABLE ROW LEVEL SECURITY;

-- USER_PROFILES Policies
CREATE POLICY "Users can view own profile"
    ON public.user_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.user_profiles FOR UPDATE
    USING (auth.uid() = id);

-- CREDIT_TRANSACTIONS Policies
CREATE POLICY "Users can view own transactions"
    ON public.credit_transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
    ON public.credit_transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- GENERATIONS Policies
CREATE POLICY "Users can view own generations"
    ON public.generations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own generations"
    ON public.generations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own generations"
    ON public.generations FOR UPDATE
    USING (auth.uid() = user_id);

-- ACTIVITY_LOGS Policies
CREATE POLICY "Users can view own logs"
    ON public.activity_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own logs"
    ON public.activity_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- CREDIT_PACKAGES Policies (toți utilizatorii pot vedea pachetele active)
CREATE POLICY "Anyone can view active packages"
    ON public.credit_packages FOR SELECT
    USING (active = true);

-- ============================================
-- 7. DATE INIȚIALE (SEED DATA)
-- ============================================

-- Inserează pachete de credite default
INSERT INTO public.credit_packages (name, credits, price, description, features, popular, active)
VALUES
    (
        'Pachet 1',
        50,
        10.00,
        'Pachet de bază cu 50 credite',
        '["50 credite", "~16 generări de text (3 credite)", "~8 generări de imagini (6 credite)", "Sau combinații personalizate", "Suport email"]'::jsonb,
        false,
        true
    ),
    (
        'Pachet 2',
        120,
        20.00,
        'Pachet popular cu 120 credite',
        '["120 credite", "~40 generări de text (3 credite)", "~20 generări de imagini (6 credite)", "Sau combinații personalizate", "Suport priorititar"]'::jsonb,
        true,
        true
    ),
    (
        'Pachet 3',
        350,
        50.00,
        'Pachet premium cu 350 credite',
        '["350 credite", "~116 generări de text (3 credite)", "~58 generări de imagini (6 credite)", "Sau combinații personalizate", "Suport dedicat"]'::jsonb,
        false,
        true
    )
ON CONFLICT DO NOTHING;

-- ============================================
-- 8. VIEWS PENTRU RAPOARTE
-- ============================================

-- View pentru statistici utilizator
CREATE OR REPLACE VIEW public.user_stats AS
SELECT
    u.id as user_id,
    u.email,
    up.full_name,
    public.get_user_credits(u.id) as current_credits,
    COALESCE(SUM(CASE WHEN ct.type = 'purchase' AND ct.status = 'completed' THEN ct.amount ELSE 0 END), 0) as total_purchased,
    COALESCE(SUM(CASE WHEN ct.type = 'usage' AND ct.status = 'completed' THEN ABS(ct.amount) ELSE 0 END), 0) as total_spent,
    COUNT(DISTINCT g.id) as total_generations,
    COUNT(DISTINCT CASE WHEN g.type = 'image' THEN g.id END) as image_generations,
    COUNT(DISTINCT CASE WHEN g.type = 'text' THEN g.id END) as text_generations,
    COUNT(DISTINCT CASE WHEN g.status = 'completed' THEN g.id END) as successful_generations,
    COUNT(DISTINCT CASE WHEN g.status = 'failed' THEN g.id END) as failed_generations
FROM auth.users u
LEFT JOIN public.user_profiles up ON u.id = up.id
LEFT JOIN public.credit_transactions ct ON u.id = ct.user_id
LEFT JOIN public.generations g ON u.id = g.user_id
GROUP BY u.id, u.email, up.full_name;

-- ============================================
-- 9. COMENTARII PENTRU DOCUMENTAȚIE
-- ============================================

COMMENT ON TABLE public.user_profiles IS 'Profiluri extinse pentru utilizatori';
COMMENT ON TABLE public.credit_packages IS 'Pachete de credite disponibile pentru cumpărare';
COMMENT ON TABLE public.credit_transactions IS 'Istoric tranzacții de credite (cumpărări, utilizări, refunds)';
COMMENT ON TABLE public.generations IS 'Istoric generări de imagini și text';
COMMENT ON TABLE public.activity_logs IS 'Logs de activitate pentru utilizatori';

COMMENT ON FUNCTION public.get_user_credits IS 'Calculează creditele disponibile ale unui utilizator';
COMMENT ON FUNCTION public.has_sufficient_credits IS 'Verifică dacă utilizatorul are suficiente credite';
COMMENT ON FUNCTION public.add_credits IS 'Adaugă credite unui utilizator';
COMMENT ON FUNCTION public.deduct_credits IS 'Scade credite de la un utilizator (pentru generări)';

-- ============================================
-- SFÂRȘIT SCHEMA
-- ============================================

