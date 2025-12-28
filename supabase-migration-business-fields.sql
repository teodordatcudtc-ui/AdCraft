-- ============================================
-- MIGRATION SCRIPT: Add Business Fields to user_profiles
-- ============================================
-- Acest script adaugă coloanele business_type și business_description
-- în tabelul user_profiles pentru a stoca informații despre business-ul utilizatorului
-- Este SIGUR pentru baze de date existente - păstrează toate datele
-- ============================================

-- ============================================
-- 1. ADĂUGARE COLOANE BUSINESS
-- ============================================

-- Adaugă coloana business_type dacă nu există
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles' 
        AND column_name = 'business_type'
    ) THEN
        ALTER TABLE public.user_profiles
        ADD COLUMN business_type TEXT;
        
        RAISE NOTICE '✅ Coloana business_type a fost adăugată cu succes!';
    ELSE
        RAISE NOTICE 'ℹ️ Coloana business_type există deja.';
    END IF;
END $$;

-- Adaugă coloana business_description dacă nu există
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles' 
        AND column_name = 'business_description'
    ) THEN
        ALTER TABLE public.user_profiles
        ADD COLUMN business_description TEXT;
        
        RAISE NOTICE '✅ Coloana business_description a fost adăugată cu succes!';
    ELSE
        RAISE NOTICE 'ℹ️ Coloana business_description există deja.';
    END IF;
END $$;

-- ============================================
-- 2. ADĂUGARE COMENTARII
-- ============================================

COMMENT ON COLUMN public.user_profiles.business_type IS 
'Tipul de business al utilizatorului (ex: "Service auto", "Restaurant", "E-commerce", etc.). 
Folosit pentru a oferi context AI-ului în generările de conținut.';

COMMENT ON COLUMN public.user_profiles.business_description IS 
'Descrierea detaliată a business-ului utilizatorului. 
Folosită pentru a oferi context AI-ului în generările de conținut, 
permițând generarea de conținut mai relevant și personalizat.';

-- ============================================
-- 3. VERIFICARE FINALĂ
-- ============================================

-- Verifică dacă coloanele au fost adăugate corect
DO $$
DECLARE
    business_type_exists BOOLEAN;
    business_description_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'user_profiles'
        AND column_name = 'business_type'
    ) INTO business_type_exists;
    
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'user_profiles'
        AND column_name = 'business_description'
    ) INTO business_description_exists;
    
    IF business_type_exists AND business_description_exists THEN
        RAISE NOTICE '✅ Ambele coloane (business_type și business_description) există în tabelul user_profiles!';
    ELSIF business_type_exists THEN
        RAISE WARNING '⚠️ Doar business_type există. Verifică business_description.';
    ELSIF business_description_exists THEN
        RAISE WARNING '⚠️ Doar business_description există. Verifică business_type.';
    ELSE
        RAISE WARNING '⚠️ Niciuna dintre coloane nu a fost găsită. Verifică manual.';
    END IF;
END $$;

-- ============================================
-- 4. VERIFICARE DATE EXISTENTE
-- ============================================

-- Verifică dacă există date în tabel
DO $$
DECLARE
    total_users INTEGER;
    users_with_business INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_users FROM public.user_profiles;
    SELECT COUNT(*) INTO users_with_business 
    FROM public.user_profiles 
    WHERE business_type IS NOT NULL OR business_description IS NOT NULL;
    
    RAISE NOTICE '📊 Total utilizatori în user_profiles: %', total_users;
    RAISE NOTICE '📊 Utilizatori cu informații business: %', users_with_business;
END $$;

-- ============================================
-- SFÂRȘIT MIGRATION
-- ============================================

-- Mesaj final
DO $$
BEGIN
    RAISE NOTICE '✅ Migration completă! Coloanele business_type și business_description au fost adăugate în user_profiles.';
    RAISE NOTICE '📝 Aceste coloane sunt folosite pentru a oferi context AI-ului în generările de conținut.';
END $$;

