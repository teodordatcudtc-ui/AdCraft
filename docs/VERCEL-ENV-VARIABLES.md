# Configurare Variabile de Mediu în Vercel

## Problema: Eroare 500 pe Vercel

Dacă funcționează local (`npm run dev`) dar nu funcționează pe Vercel, problema este că variabilele de mediu nu sunt setate în Vercel.

## Soluție: Adaugă Variabilele în Vercel

### Pasul 1: Accesează Vercel Dashboard

1. Mergi la [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Selectează proiectul tău

### Pasul 2: Adaugă Variabilele de Mediu

1. Click pe proiectul tău
2. Mergi la **Settings** (meniul de sus)
3. Click pe **Environment Variables** (din sidebar-ul din stânga)

### Pasul 3: Adaugă Fiecare Variabilă

#### Variabila 1: `NEXT_PUBLIC_SUPABASE_URL`
- **Key**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: URL-ul proiectului tău Supabase (ex: `https://xxxxx.supabase.co`)
- **Environment**: ✅ Production, ✅ Preview, ✅ Development
- Click **Save**

#### Variabila 2: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: Cheia ta **Publishable key** (`sb_publishable_...`)
- **Environment**: ✅ Production, ✅ Preview, ✅ Development
- Click **Save**

#### Variabila 3: `SUPABASE_SERVICE_ROLE_KEY` ⚠️ IMPORTANT
- **Key**: `SUPABASE_SERVICE_ROLE_KEY`
- **Value**: Cheia ta **Secret key** (`sb_secret_...`)
- **Environment**: ✅ Production, ✅ Preview, ✅ Development
- Click **Save**

⚠️ **CRITIC**: Această variabilă este cea care lipsește cel mai des și cauzează eroarea 500!

#### Variabila 4: `N8N_WEBHOOK_URL` (dacă folosești n8n)
- **Key**: `N8N_WEBHOOK_URL`
- **Value**: URL-ul webhook-ului tău n8n
- **Environment**: ✅ Production, ✅ Preview, ✅ Development
- Click **Save**

### Pasul 4: Verifică Variabilele Adăugate

După ce ai adăugat toate variabilele, ar trebui să vezi o listă similară cu:

```
NEXT_PUBLIC_SUPABASE_URL          [Production, Preview, Development]
NEXT_PUBLIC_SUPABASE_ANON_KEY     [Production, Preview, Development]
SUPABASE_SERVICE_ROLE_KEY         [Production, Preview, Development]  ← IMPORTANT!
N8N_WEBHOOK_URL                   [Production, Preview, Development]
```

### Pasul 5: Redeployază

**IMPORTANT**: După adăugarea variabilelor, trebuie să faci **Redeploy**:

1. Mergi la **Deployments**
2. Click pe ultimul deployment
3. Click pe butonul **"Redeploy"** (sau fă un push nou la GitHub)

⚠️ **Variabilele noi nu se aplică automat la deployment-urile existente!**

## Verificare Rapidă

### Verifică în Vercel Logs

1. Mergi la **Deployments**
2. Click pe ultimul deployment
3. Click pe **"View Function Logs"** sau **"Runtime Logs"**
4. Caută erori legate de:
   - "Missing Supabase environment variables"
   - "Invalid API key"
   - "SUPABASE_SERVICE_ROLE_KEY is not set"

### Verifică în Browser Console

Dacă vezi eroarea:
```
Failed to add credits
Server configuration error
Service role key is not configured
```

Înseamnă că `SUPABASE_SERVICE_ROLE_KEY` nu este setat în Vercel.

## Troubleshooting

### Eroare: "Service role key is not configured"

**Cauză**: `SUPABASE_SERVICE_ROLE_KEY` nu este setat în Vercel

**Soluție**:
1. Verifică în Vercel Dashboard → Settings → Environment Variables
2. Asigură-te că `SUPABASE_SERVICE_ROLE_KEY` este adăugată
3. Asigură-te că este bifată pentru **Production** (nu doar Development)
4. Fă **Redeploy** după adăugare

### Eroare: "Invalid API key format"

**Cauză**: Ai folosit cheia greșită (probabil `sb_publishable_...` în loc de `sb_secret_...`)

**Soluție**:
1. Verifică că `SUPABASE_SERVICE_ROLE_KEY` începe cu `sb_secret_...`
2. Verifică că ai copiat cheia din **Secret keys**, nu din **Publishable key**

### Variabilele sunt setate dar tot nu funcționează

**Cauză**: Nu ai făcut redeploy după adăugarea variabilelor

**Soluție**:
1. Fă un **Redeploy** manual sau
2. Fă un push nou la GitHub pentru a declanșa un deployment nou

## Checklist Final

Înainte de a testa pe Vercel, verifică:

- [ ] `NEXT_PUBLIC_SUPABASE_URL` este setat în Vercel
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` este setat în Vercel
- [ ] `SUPABASE_SERVICE_ROLE_KEY` este setat în Vercel ⚠️
- [ ] Toate variabilele sunt bifate pentru **Production**
- [ ] Ai făcut **Redeploy** după adăugarea variabilelor
- [ ] Cheia `SUPABASE_SERVICE_ROLE_KEY` începe cu `sb_secret_...`

## Notă Importantă

Variabilele de mediu din `.env.local` funcționează doar local. Pe Vercel, trebuie să le adaugi manual în Vercel Dashboard!

