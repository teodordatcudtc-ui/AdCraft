-- ============================================
-- MIGRATION: Add content_calendar column to user_profiles
-- ============================================
-- Această migrație adaugă coloana content_calendar (JSONB) 
-- pentru a stoca calendarul de conținut generat de tool-ul Planificare de Conținut

-- Adaugă coloana content_calendar dacă nu există
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles' 
        AND column_name = 'content_calendar'
    ) THEN
        ALTER TABLE public.user_profiles 
        ADD COLUMN content_calendar JSONB;
        
        RAISE NOTICE 'Column content_calendar added to user_profiles';
    ELSE
        RAISE NOTICE 'Column content_calendar already exists in user_profiles';
    END IF;
END $$;

