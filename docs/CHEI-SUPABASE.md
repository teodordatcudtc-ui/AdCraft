# Ghid Complet - Chei Supabase

## Ce Chei Ai în Supabase Dashboard?

În Supabase Dashboard → Settings → API, vei găsi:

### 1. **Publishable key** (Cheia Publică)
- **Format**: `sb_publishable_...`
- **Exemplu**: `sb_publishable_jbE4Ph1mXGTbDjjtRFX8dQ_lgn-jJPP`
- **Descriere**: "This key is safe to use in a browser if you have enabled Row Level Security (RLS)"

### 2. **Secret keys** (Cheile Secrete)
- **Format**: `sb_secret_...`
- **Exemplu**: `sb_secret_1AIsTqNOt08QRu2PQzcABA_q69j_b-P`
- **Descriere**: "These API keys allow privileged access to your project's APIs. Use in servers, functions, workers or other backend components."

## Care Cheie Unde?

### În `.env.local`:

```bash
# 1. URL-ul proiectului (găsești în Settings → API → Project URL)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co

# 2. Publishable key (din secțiunea "Publishable key")
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_jbE4Ph1mXGTbDjjtRFX8dQ_lgn-jJPP

# 3. Secret key (din secțiunea "Secret keys" → tabelul cu cheile)
SUPABASE_SERVICE_ROLE_KEY=sb_secret_1AIsTqNOt08QRu2PQzcABA_q69j_b-P
```

## Pași Detaliați

### Pasul 1: Obține Publishable Key
1. Mergi la **Settings** → **API**
2. Găsește secțiunea **"Publishable key"**
3. Copiază cheia (începe cu `sb_publishable_...`)
4. Adaugă în `.env.local` ca `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Pasul 2: Obține Secret Key
1. Mergi la **Settings** → **API**
2. Găsește secțiunea **"Secret keys"**
3. În tabel, găsește cheia cu numele "default" (sau orice alt nume)
4. Click pe iconița **👁️ (eye)** pentru a vedea cheia completă
5. Click pe iconița **📋 (copy)** pentru a copia
6. Adaugă în `.env.local` ca `SUPABASE_SERVICE_ROLE_KEY`

### Pasul 3: Verifică Formatul

✅ **Corect:**
```bash
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_jbE4Ph1mXGTbDjjtRFX8dQ_lgn-jJPP
SUPABASE_SERVICE_ROLE_KEY=sb_secret_1AIsTqNOt08QRu2PQzcABA_q69j_b-P
```

❌ **Greșit:**
```bash
# NU amesteca cheile!
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_secret_...  # ❌ GREȘIT!
SUPABASE_SERVICE_ROLE_KEY=sb_publishable_...  # ❌ GREȘIT!
```

## Tabel Comparativ

| Caracteristică | Publishable Key | Secret Key |
|----------------|----------------|------------|
| **Prefix** | `sb_publishable_...` | `sb_secret_...` |
| **Unde o găsești** | Secțiunea "Publishable key" | Secțiunea "Secret keys" |
| **Variabilă în `.env.local`** | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `SUPABASE_SERVICE_ROLE_KEY` |
| **Poate fi expusă în frontend?** | ✅ DA | ❌ NU |
| **Bypass RLS?** | ❌ NU | ✅ DA |
| **Poate face operații admin?** | ❌ NU | ✅ DA |
| **Folosită în** | Frontend + Backend | **DOAR Backend (API routes)** |

## Verificare Rapidă

După ce ai adăugat cheile în `.env.local`, verifică:

1. ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` începe cu `sb_publishable_...`
2. ✅ `SUPABASE_SERVICE_ROLE_KEY` începe cu `sb_secret_...`
3. ✅ Nu ai spații în plus la început/sfârșit
4. ✅ Ai făcut restart serverului (`npm run dev`)

## Troubleshooting

### Eroare: "Invalid API key"

**Cauze:**
- Ai folosit `sb_publishable_...` în loc de `sb_secret_...` pentru `SUPABASE_SERVICE_ROLE_KEY`
- Sau invers: ai folosit `sb_secret_...` în loc de `sb_publishable_...` pentru `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Soluție:**
- Verifică că `NEXT_PUBLIC_SUPABASE_ANON_KEY` = cheia din **"Publishable key"** (`sb_publishable_...`)
- Verifică că `SUPABASE_SERVICE_ROLE_KEY` = cheia din **"Secret keys"** (`sb_secret_...`)

### Eroare: "Missing Supabase environment variables"

**Cauză:** Variabilele nu sunt setate sau au nume greșite

**Soluție:**
- Verifică că variabilele se numesc EXACT:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- Verifică că fișierul se numește `.env.local` (nu `.env`)

## Exemplu Complet `.env.local`

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_jbE4Ph1mXGTbDjjtRFX8dQ_lgn-jJPP
SUPABASE_SERVICE_ROLE_KEY=sb_secret_1AIsTqNOt08QRu2PQzcABA_q69j_b-P

# n8n Webhook (dacă folosești)
N8N_WEBHOOK_URL=https://agentie-reclame.app.n8n.cloud/webhook/reclama
```

## Securitate

⚠️ **IMPORTANT:**
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (publishable) → ✅ Poate fi în frontend
- `SUPABASE_SERVICE_ROLE_KEY` (secret) → ❌ NU în frontend, DOAR în API routes!

