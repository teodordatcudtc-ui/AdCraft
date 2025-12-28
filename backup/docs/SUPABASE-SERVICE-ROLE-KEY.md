# Configurare SUPABASE_SERVICE_ROLE_KEY

## Problema

Dacă primești eroarea `Invalid API key` când încerci să adaugi credite de test, înseamnă că `SUPABASE_SERVICE_ROLE_KEY` nu este setat corect sau nu este valid.

## Soluție

### 1. Obține Service Role Key din Supabase

1. Accesează [Supabase Dashboard](https://app.supabase.com)
2. Selectează proiectul tău
3. Mergi la **Settings** → **API**
4. Găsește secțiunea **Secret keys** (NU "Publishable key"!)
5. În tabelul "Secret keys", găsește cheia cu numele "default" (sau orice alt nume)
6. Click pe iconița de **eye** (👁️) pentru a vedea cheia completă
7. Click pe iconița de **copy** (📋) pentru a copia cheia

⚠️ **IMPORTANT**: 
- Cheia secretă începe cu `sb_secret_...` (NU `sb_publishable_...`)
- Cheia secretă este SECRETĂ și nu trebuie expusă în frontend!

### 2. Adaugă în `.env.local`

Deschide fișierul `.env.local` din root-ul proiectului și adaugă:

```bash
SUPABASE_SERVICE_ROLE_KEY=sb_secret_1AIsTqNOt08QRu2PQzcABA_q69j_b-P
```

**Înlocuiește** valoarea cu cheia ta reală de la Supabase (cea care începe cu `sb_secret_...`).

### 3. Verifică Formatul

Cheia secretă (service role) ar trebui să:
- Înceapă cu `sb_secret_...` (NU `sb_publishable_...`)
- Să aibă aproximativ 50-60 caractere
- Să fie din secțiunea **Secret keys**, nu **Publishable key**

### 4. Restart Serverul

După adăugarea cheii, restart serverul Next.js:

```bash
# Oprește serverul (Ctrl+C)
# Apoi pornește din nou
npm run dev
```

### 5. Verifică în Vercel (dacă folosești Vercel)

Dacă deploy-ezi pe Vercel, asigură-te că ai adăugat variabila în Vercel Dashboard:

1. Mergi la **Settings** → **Environment Variables**
2. Adaugă:
   - **Key**: `SUPABASE_SERVICE_ROLE_KEY`
   - **Value**: Cheia ta `service_role`
   - **Environment**: Production, Preview, Development
3. Fă **Redeploy**

## Diferența între Chei

### `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Publishable key)
- **Format**: `sb_publishable_...`
- **Unde o găsești**: Secțiunea **"Publishable key"** în Supabase Dashboard
- ✅ Poate fi expusă în frontend
- ✅ Funcționează cu RLS (Row Level Security)
- ❌ Nu poate face operații admin
- ✅ Folosită pentru operații normale (citire, scriere cu RLS)
- **Exemplu**: `sb_publishable_jbE4Ph1mXGTbDjjtRFX8dQ_lgn-jJPP`

### `SUPABASE_SERVICE_ROLE_KEY` (Secret key)
- **Format**: `sb_secret_...`
- **Unde o găsești**: Secțiunea **"Secret keys"** → tabelul cu cheile secrete
- ❌ NU poate fi expusă în frontend
- ❌ Bypass RLS (poate face orice)
- ✅ Poate face operații admin
- ✅ Folosită doar în API routes server-side
- **Exemplu**: `sb_secret_1AIsTqNOt08QRu2PQzcABA_q69j_b-P`

## Rezumat - Care Cheie Unde?

| Variabilă | Valoare din Supabase | Unde se folosește |
|-----------|---------------------|-------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | **Project URL** (ex: `https://xxxxx.supabase.co`) | Frontend + Backend |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Publishable key** (`sb_publishable_...`) | Frontend + Backend |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret key** (`sb_secret_...`) | **DOAR Backend (API routes)** |

## Troubleshooting

### Eroare: "Invalid API key"

**Cauze posibile:**
1. Cheia nu este setată în `.env.local`
2. Cheia este greșită (ai copiat `anon` în loc de `service_role`)
3. Cheia aparține altui proiect Supabase
4. Nu ai făcut restart serverului după adăugarea cheii

**Soluție:**
1. Verifică că ai copiat cheia corectă (`service_role`, nu `anon`)
2. Verifică că nu ai spații în plus la început/sfârșit
3. Verifică că cheia este pentru proiectul corect
4. Restart serverul

### Eroare: "Missing Supabase environment variables"

**Cauză:** Variabila nu este setată

**Soluție:**
1. Verifică că fișierul se numește `.env.local` (nu `.env`)
2. Verifică că variabila este scrisă corect: `SUPABASE_SERVICE_ROLE_KEY` (nu `SUPABASE_SERVICE_KEY`)
3. Restart serverul

## Securitate

⚠️ **CRITIC**: 
- NU commită `.env.local` în Git (este deja în `.gitignore`)
- NU expune `SUPABASE_SERVICE_ROLE_KEY` în frontend
- NU o pune în variabile cu prefix `NEXT_PUBLIC_`
- Folosește-o DOAR în API routes server-side

## Testare

După configurare, testează:

1. Verifică că serverul pornește fără erori
2. Apasă butonul "+10 Credite (Test)" în dashboard
3. Verifică în consolă că nu mai apare eroarea "Invalid API key"
4. Verifică că creditele au fost adăugate în Supabase Dashboard → Table Editor → `credit_transactions`

