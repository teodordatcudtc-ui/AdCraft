-- ============================================
-- MIGRATION SCRIPT: Update Generations Table for New Tools
-- ============================================
-- Acest script actualizează tabelul generations pentru a suporta toate tool-urile noi
-- Este SIGUR pentru baze de date existente - păstrează toate datele
-- ============================================

-- ============================================
-- 1. ACTUALIZARE CONSTRÂNGERE TYPE PENTRU GENERATIONS
-- ============================================

-- Pasul 1: Găsește și șterge constrângerea veche (dacă există)
DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    -- Găsește numele constrângerii CHECK pentru coloana type
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'public.generations'::regclass
    AND contype = 'c'
    AND conname LIKE '%type%check%' OR conname LIKE '%generations_type%';
    
    -- Dacă există, o șterge
    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE public.generations DROP CONSTRAINT IF EXISTS %I', constraint_name);
        RAISE NOTICE 'Constrângerea veche % a fost ștearsă', constraint_name;
    ELSE
        RAISE NOTICE 'Nu s-a găsit constrângere veche pentru type';
    END IF;
END $$;

-- Pasul 2: Adaugă constrângerea nouă cu toate tipurile de tool-uri
ALTER TABLE public.generations
ADD CONSTRAINT generations_type_check 
CHECK (type IN (
    -- Tipuri existente (pentru compatibilitate)
    'image',
    'text',
    -- Tool-uri noi text-based
    'strategie-client',
    'analiza-piata',
    'strategie-video',
    'copywriting',
    'planificare-conținut',
    -- Design Publicitar (folosit pentru imagini generate)
    'design-publicitar'
));

-- ============================================
-- 2. VERIFICARE ȘI COMENTARII
-- ============================================

COMMENT ON COLUMN public.generations.type IS 
'Tipul generării: 
- image: Generare imagine (KIE.AI)
- text: Generare text
- strategie-client: Strategie de Client & Mesaj
- analiza-piata: Analiză de Piață & Concurență
- strategie-video: Strategie Video & Scripturi
- copywriting: Copywriting Publicitar
- planificare-conținut: Planificare de Conținut
- design-publicitar: Design Publicitar (imagini)';

-- ============================================
-- 3. ACTUALIZARE VIEW user_stats (dacă există)
-- ============================================

-- Șterge view-ul vechi dacă există (pentru a evita conflicte cu coloanele existente)
DROP VIEW IF EXISTS public.user_stats CASCADE;

-- Creează view-ul nou cu toate tipurile noi
CREATE VIEW public.user_stats AS
SELECT
    u.id as user_id,
    u.email,
    up.full_name,
    public.get_user_credits(u.id) as current_credits,
    COALESCE(SUM(CASE WHEN ct.type = 'purchase' AND ct.status = 'completed' THEN ct.amount ELSE 0 END), 0) as total_purchased,
    COALESCE(SUM(CASE WHEN ct.type = 'usage' AND ct.status = 'completed' THEN ABS(ct.amount) ELSE 0 END), 0) as total_spent,
    COUNT(DISTINCT g.id) as total_generations,
    -- Generări pe tipuri
    COUNT(DISTINCT CASE WHEN g.type = 'image' THEN g.id END) as image_generations,
    COUNT(DISTINCT CASE WHEN g.type = 'text' THEN g.id END) as text_generations,
    COUNT(DISTINCT CASE WHEN g.type = 'strategie-client' THEN g.id END) as strategie_client_generations,
    COUNT(DISTINCT CASE WHEN g.type = 'analiza-piata' THEN g.id END) as analiza_piata_generations,
    COUNT(DISTINCT CASE WHEN g.type = 'strategie-video' THEN g.id END) as strategie_video_generations,
    COUNT(DISTINCT CASE WHEN g.type = 'copywriting' THEN g.id END) as copywriting_generations,
    COUNT(DISTINCT CASE WHEN g.type = 'planificare-conținut' THEN g.id END) as planificare_conținut_generations,
    COUNT(DISTINCT CASE WHEN g.type = 'design-publicitar' THEN g.id END) as design_publicitar_generations,
    -- Statistici generale
    COUNT(DISTINCT CASE WHEN g.status = 'completed' THEN g.id END) as successful_generations,
    COUNT(DISTINCT CASE WHEN g.status = 'failed' THEN g.id END) as failed_generations
FROM auth.users u
LEFT JOIN public.user_profiles up ON u.id = up.id
LEFT JOIN public.credit_transactions ct ON u.id = ct.user_id
LEFT JOIN public.generations g ON u.id = g.user_id
GROUP BY u.id, u.email, up.full_name;

-- ============================================
-- 4. VERIFICARE FINALĂ
-- ============================================

-- Verifică dacă constrângerea a fost adăugată corect
DO $$
DECLARE
    constraint_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conrelid = 'public.generations'::regclass
        AND conname = 'generations_type_check'
    ) INTO constraint_exists;
    
    IF constraint_exists THEN
        RAISE NOTICE '✅ Constrângerea generations_type_check a fost adăugată cu succes!';
    ELSE
        RAISE WARNING '⚠️ Constrângerea nu a fost găsită. Verifică manual.';
    END IF;
END $$;

-- ============================================
-- 5. TESTARE (OPȚIONAL - COMENTEAZĂ DUPĂ TESTARE)
-- ============================================

-- Testează dacă poți insera fiecare tip (comentează după testare)
/*
INSERT INTO public.generations (user_id, type, prompt, status, cost, result_text)
VALUES 
    (auth.uid(), 'strategie-client', 'Test', 'completed', 5, '{"test": true}'),
    (auth.uid(), 'analiza-piata', 'Test', 'completed', 5, '{"test": true}'),
    (auth.uid(), 'strategie-video', 'Test', 'completed', 4, '{"test": true}'),
    (auth.uid(), 'copywriting', 'Test', 'completed', 3, '{"test": true}'),
    (auth.uid(), 'planificare-conținut', 'Test', 'completed', 4, '{"test": true}'),
    (auth.uid(), 'design-publicitar', 'Test', 'completed', 6, '{"test": true}')
ON CONFLICT DO NOTHING;
*/

-- ============================================
-- SFÂRȘIT MIGRATION
-- ============================================

-- Mesaj final
DO $$
BEGIN
    RAISE NOTICE '✅ Migration completă! Tabelul generations suportă acum toate tool-urile noi.';
    RAISE NOTICE '📊 Tipuri suportate: image, text, strategie-client, analiza-piata, strategie-video, copywriting, planificare-conținut, design-publicitar';
END $$;

