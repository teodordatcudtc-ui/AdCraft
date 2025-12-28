# Ghid de Deploy pe Vercel

Acest ghid te va ajuta să configurezi variabilele de mediu în Vercel pentru deploy-ul aplicației.

## Pași de Configurare

### 1. Adaugă Variabilele de Mediu în Vercel

1. **Accesează Vercel Dashboard**
   - Mergi la [https://vercel.com/dashboard](https://vercel.com/dashboard)
   - Selectează proiectul tău (sau creează unul nou)

2. **Navighează la Settings**
   - Click pe proiectul tău
   - Mergi la **Settings** (din meniul de sus)
   - Click pe **Environment Variables** (din sidebar-ul din stânga)

3. **Adaugă Variabilele Supabase**

   Adaugă următoarele variabile (una câte una):

   #### a) NEXT_PUBLIC_SUPABASE_URL
   - **Key**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Value**: URL-ul proiectului tău Supabase (ex: `https://xxxxxxxxxxxxx.supabase.co`)
   - **Environment**: Selectează toate (Production, Preview, Development)
   - Click **Save**

   #### b) NEXT_PUBLIC_SUPABASE_ANON_KEY
   - **Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Value**: Cheia ta `anon` public de la Supabase (ex: `sb_publishable_...`)
   - **Environment**: Selectează toate (Production, Preview, Development)
   - Click **Save**

   #### c) SUPABASE_SERVICE_ROLE_KEY (opțional, pentru operații admin)
   - **Key**: `SUPABASE_SERVICE_ROLE_KEY`
   - **Value**: Cheia ta `service_role` secretă de la Supabase (ex: `sb_secret_...`)
   - **Environment**: Selectează toate (Production, Preview, Development)
   - Click **Save**

   #### d) N8N_WEBHOOK_URL (dacă folosești n8n)
   - **Key**: `N8N_WEBHOOK_URL`
   - **Value**: URL-ul webhook-ului tău n8n (ex: `https://agentie-reclame.app.n8n.cloud/webhook/reclama`)
   - **Environment**: Selectează toate (Production, Preview, Development)
   - Click **Save**

### 2. Verifică Variabilele Adăugate

După ce ai adăugat toate variabilele, ar trebui să vezi o listă similară cu:

```
NEXT_PUBLIC_SUPABASE_URL          [Production, Preview, Development]
NEXT_PUBLIC_SUPABASE_ANON_KEY     [Production, Preview, Development]
SUPABASE_SERVICE_ROLE_KEY         [Production, Preview, Development]
N8N_WEBHOOK_URL                   [Production, Preview, Development]
```

### 3. Redeployază Aplicația

După ce ai adăugat variabilele:

1. **Opțiunea 1: Redeploy automat**
   - Vercel va detecta automat schimbările
   - Sau mergi la **Deployments** și click pe **Redeploy** pe ultimul deployment

2. **Opțiunea 2: Push nou commit**
   - Fă un commit nou (chiar și un mic change)
   - Push la GitHub/GitLab
   - Vercel va face deploy automat

### 4. Verifică Deploy-ul

1. Mergi la **Deployments** în Vercel Dashboard
2. Click pe ultimul deployment
3. Verifică **Build Logs** - ar trebui să nu mai vezi eroarea "Missing Supabase environment variables"
4. Dacă totul e OK, click pe **Visit** pentru a vedea aplicația live

## Cum Obții Valorile

### Supabase URL și Keys

1. Accesează [https://app.supabase.com](https://app.supabase.com)
2. Selectează proiectul tău
3. Mergi la **Settings** → **API**
4. Copiază:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

### N8N Webhook URL

1. Accesează instanța ta n8n
2. Mergi la workflow-ul tău
3. Click pe nodul **Webhook**
4. Copiază URL-ul webhook-ului → `N8N_WEBHOOK_URL`

## Troubleshooting

### Eroare: "Missing Supabase environment variables"

**Cauze posibile:**
1. Variabilele nu au fost adăugate în Vercel
2. Variabilele au fost adăugate dar nu s-a făcut redeploy
3. Numele variabilelor sunt greșite (verifică spelling-ul)

**Soluție:**
1. Verifică în Vercel Dashboard → Settings → Environment Variables că toate variabilele sunt acolo
2. Asigură-te că numele sunt EXACT ca în `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL` (nu `SUPABASE_URL`)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (nu `SUPABASE_ANON_KEY`)
3. Fă un redeploy după adăugarea variabilelor

### Variabilele nu se încarcă în Production

**Cauză:** Variabilele au fost adăugate doar pentru Development/Preview

**Soluție:**
1. Mergi la Settings → Environment Variables
2. Click pe fiecare variabilă
3. Asigură-te că **Production** este bifat în Environment
4. Save și redeploy

### Build reușește dar aplicația nu funcționează

**Cauză:** Variabilele sunt setate dar valorile sunt greșite

**Soluție:**
1. Verifică că ai copiat corect valorile din Supabase Dashboard
2. Verifică că nu ai spații în plus la început/sfârșit
3. Verifică că folosești cheia corectă (`anon` pentru client-side, nu `service_role`)

## Best Practices

1. **Nu commită `.env.local`** - este deja în `.gitignore`
2. **Folosește Environment Variables în Vercel** - nu hardcode valori în cod
3. **Verifică Environment-ul** - asigură-te că variabilele sunt disponibile pentru Production
4. **Folosește Preview pentru testare** - testează variabilele în Preview înainte de Production

## Verificare Rapidă

După deploy, verifică că:
- ✅ Build-ul reușește fără erori
- ✅ Aplicația se încarcă corect
- ✅ Autentificarea funcționează (sign up/login)
- ✅ Dashboard-ul se încarcă cu date reale (sau 0 dacă ești utilizator nou)

## Notă Importantă

Variabilele cu prefix `NEXT_PUBLIC_` sunt expuse în browser. Nu pune date sensibile acolo!

Pentru date sensibile (ex: `SUPABASE_SERVICE_ROLE_KEY`), folosește-le doar în API routes server-side.

