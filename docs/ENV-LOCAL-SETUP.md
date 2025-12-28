# Configurare Variabile de Mediu Local (.env.local)

Acest ghid te ajută să configurezi variabilele de mediu pentru development local.

## Pasul 1: Creează Fișierul .env.local

În root-ul proiectului (același nivel cu `package.json`), creează un fișier numit `.env.local`

**IMPORTANT**: Fișierul `.env.local` este deja în `.gitignore`, deci nu va fi commitat în Git.

## Pasul 2: Adaugă Variabilele

Deschide `.env.local` și adaugă următoarele variabile:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# N8N Webhook URLs
N8N_WEBHOOK_URL=https://fitnessapp.app.n8n.cloud/webhook/reclama
N8N_TEXT_WEBHOOK_URL=https://fitnessapp.app.n8n.cloud/webhook/generate-text
N8N_TOOLS_WEBHOOK_URL=https://fitnessapp.app.n8n.cloud/webhook/tools

# SMTP Configuration (opțional - pentru email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## Pasul 3: Completează Valorile

### Supabase
- Obține valorile din Supabase Dashboard → Settings → API
- Vezi `docs/SUPABASE-SETUP.md` pentru detalii

### N8N Webhooks
- **N8N_WEBHOOK_URL**: URL-ul webhook-ului pentru generare imagini (Design Publicitar)
- **N8N_TEXT_WEBHOOK_URL**: URL-ul webhook-ului pentru generare text
- **N8N_TOOLS_WEBHOOK_URL**: URL-ul webhook-ului pentru tool-uri text-based
  - **Exemplu**: `https://fitnessapp.app.n8n.cloud/webhook/tools`

## Pasul 4: Restart Serverul

După ce ai adăugat variabilele, **restart serverul Next.js**:

```bash
# Oprește serverul (Ctrl+C)
# Apoi pornește din nou:
npm run dev
```

## Verificare

După restart, verifică în consolă că nu mai apare eroarea:
```
Missing Supabase environment variables
```

## Notă Importantă

- Variabilele cu prefix `NEXT_PUBLIC_` sunt disponibile în browser (client-side)
- Variabilele fără prefix sunt disponibile doar pe server (server-side)
- `.env.local` funcționează doar local - pentru production (Vercel), vezi `docs/VERCEL-ENV-VARIABLES.md`

