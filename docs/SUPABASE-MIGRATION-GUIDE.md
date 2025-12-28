# Ghid de Migrare Baza de Date - Tool-uri Noi

Acest ghid te ajută să actualizezi baza de date Supabase pentru a suporta toate tool-urile noi.

## 📋 Ce face acest script?

Scriptul actualizează tabelul `generations` pentru a permite următoarele tipuri de tool-uri:
- ✅ `image` (există deja)
- ✅ `text` (există deja)
- ✅ `strategie-client` (NOU)
- ✅ `analiza-piata` (NOU)
- ✅ `strategie-video` (NOU)
- ✅ `copywriting` (NOU)
- ✅ `planificare-conținut` (NOU)
- ✅ `design-publicitar` (NOU)

## ⚠️ IMPORTANT - Siguranță

- ✅ **NU șterge date existente**
- ✅ **NU modifică structura tabelelor**
- ✅ **Doar actualizează constrângerea CHECK**
- ✅ **Păstrează toate generările existente**

## 🚀 Cum să execuți scriptul

### Opțiunea 1: Supabase Dashboard (Recomandat)

1. **Deschide Supabase Dashboard**
   - Mergi la [https://app.supabase.com](https://app.supabase.com)
   - Selectează proiectul tău

2. **Accesează SQL Editor**
   - Click pe **SQL Editor** în meniul din stânga
   - Sau mergi direct la: `https://app.supabase.com/project/YOUR_PROJECT_ID/sql`

3. **Copiază și execută scriptul**
   - Deschide fișierul `supabase-migration-tools.sql`
   - Copiază tot conținutul
   - Lipește în SQL Editor
   - Click pe **Run** sau apasă `Ctrl+Enter`

4. **Verifică rezultatul**
   - Ar trebui să vezi mesaje de succes:
     ```
     ✅ Constrângerea generations_type_check a fost adăugată cu succes!
     ✅ Migration completă!
     ```

### Opțiunea 2: Supabase CLI

Dacă folosești Supabase CLI:

```bash
# Asigură-te că ești conectat
supabase link --project-ref YOUR_PROJECT_REF

# Execută scriptul
supabase db execute -f supabase-migration-tools.sql
```

### Opțiunea 3: psql (PostgreSQL Client)

```bash
psql -h YOUR_SUPABASE_HOST -U postgres -d postgres -f supabase-migration-tools.sql
```

## ✅ Verificare după migrare

### 1. Verifică constrângerea

Rulează în SQL Editor:

```sql
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.generations'::regclass
AND conname = 'generations_type_check';
```

Ar trebui să vezi toate tipurile în `constraint_definition`.

### 2. Testează inserarea (opțional)

```sql
-- Testează fiecare tip (înlocuiește USER_ID cu un ID real)
INSERT INTO public.generations (user_id, type, prompt, status, cost, result_text)
VALUES 
    ('USER_ID', 'strategie-client', 'Test', 'completed', 5, '{"test": true}')
ON CONFLICT DO NOTHING;
```

Dacă nu primești eroare, înseamnă că totul funcționează!

### 3. Verifică datele existente

```sql
-- Verifică că datele existente sunt încă acolo
SELECT type, COUNT(*) as count
FROM public.generations
GROUP BY type
ORDER BY count DESC;
```

## 🔧 Troubleshooting

### Eroare: "constraint already exists"

Dacă primești eroarea că constrângerea există deja:

1. **Verifică numele constrângerii**:
   ```sql
   SELECT conname 
   FROM pg_constraint 
   WHERE conrelid = 'public.generations'::regclass 
   AND contype = 'c';
   ```

2. **Șterge manual constrângerea veche**:
   ```sql
   ALTER TABLE public.generations DROP CONSTRAINT IF EXISTS nume_constrangere;
   ```

3. **Rulează din nou scriptul**

### Eroare: "permission denied"

Asigură-te că:
- Folosești contul de admin (postgres)
- Ai permisiuni de modificare pe tabelul `generations`

### Datele existente nu se văd

Scriptul **NU șterge date**. Dacă nu vezi datele:
- Verifică filtrele din query
- Verifică că folosești user_id corect
- Verifică că datele există efectiv în tabel

## 📊 Structura după migrare

După migrare, tabelul `generations` va accepta:

| Type | Descriere | Cost (credite) |
|------|-----------|----------------|
| `image` | Generare imagine (KIE.AI) | 6 |
| `text` | Generare text | 3 |
| `strategie-client` | Strategie de Client & Mesaj | 5 |
| `analiza-piata` | Analiză de Piață & Concurență | 5 |
| `strategie-video` | Strategie Video & Scripturi | 4 |
| `copywriting` | Copywriting Publicitar | 3 |
| `planificare-conținut` | Planificare de Conținut | 4 |
| `design-publicitar` | Design Publicitar (imagini) | 6 |

## 🎯 Următorii pași

După ce ai executat migrarea:

1. ✅ Testează aplicația - generează un rezultat cu un tool nou
2. ✅ Verifică că rezultatul este salvat în baza de date
3. ✅ Verifică că poți vedea rezultatele salvate în dashboard

## 📝 Notă

Dacă ai probleme sau întrebări:
- Verifică logs-urile din Supabase Dashboard
- Verifică că toate variabilele de mediu sunt setate corect
- Verifică că API route-urile folosesc tipurile corecte

---

**Gata!** Baza de date este acum pregătită pentru toate tool-urile noi! 🎉

