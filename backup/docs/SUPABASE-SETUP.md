# Ghid de Configurare Supabase

Acest ghid te va ajuta să configurezi Supabase pentru proiectul Agentie Reclame.

## Pași de Configurare

### 1. Creează un Proiect Supabase

1. Accesează [https://app.supabase.com](https://app.supabase.com)
2. Creează un cont sau loghează-te
3. Click pe "New Project"
4. Completează:
   - **Name**: `agentie-reclame` (sau alt nume)
   - **Database Password**: alege o parolă puternică (salveaz-o!)
   - **Region**: alege cea mai apropiată regiune (ex: `West Europe`)
5. Click "Create new project"
6. Așteaptă ~2 minute până se creează proiectul

### 2. Rulează Schema SQL

1. În Supabase Dashboard, mergi la **SQL Editor** (iconița SQL din sidebar)
2. Click pe **New Query**
3. Deschide fișierul `supabase-schema.sql` din proiectul tău
4. Copiază tot conținutul și lipește-l în SQL Editor
5. Click pe **Run** (sau apasă `Ctrl+Enter`)
6. Ar trebui să vezi mesajul "Success. No rows returned"

### 3. Obține Credențialele API

1. În Supabase Dashboard, mergi la **Settings** (iconița cu roată dințată)
2. Click pe **API** din meniul din stânga
3. Găsește următoarele valori:

#### a) Project URL
- **Unde**: Secțiunea "Project URL"
- **Exemplu**: `https://xxxxxxxxxxxxx.supabase.co`
- **Folosire**: `NEXT_PUBLIC_SUPABASE_URL`

#### b) Anon/Public Key
- **Unde**: Secțiunea "Project API keys" → "anon" `public`
- **Exemplu**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Folosire**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Notă**: Acest key este sigur să fie expus în client-side code

#### c) Service Role Key (opțional, pentru operații admin)
- **Unde**: Secțiunea "Project API keys" → "service_role" `secret`
- **Exemplu**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Folosire**: `SUPABASE_SERVICE_ROLE_KEY`
- **ATENȚIE**: Acest key are acces complet la baza de date! NU-l expune în client-side code!

### 4. Configurează Variabilele de Mediu

1. În root-ul proiectului, creează fișierul `.env.local` (dacă nu există deja)
2. Copiază conținutul din `.env.example`
3. Completează valorile cu credențialele tale:

```bash
# Exemplu .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
N8N_WEBHOOK_URL=https://agentie-reclame.app.n8n.cloud/webhook/reclama
```

### 5. Verifică Configurarea

1. Restart serverul Next.js:
   ```bash
   npm run dev
   ```

2. Verifică că variabilele sunt încărcate corect:
   - Variabilele cu prefix `NEXT_PUBLIC_` sunt disponibile în browser
   - Variabilele fără prefix sunt disponibile doar server-side

### 6. Configurare Autentificare în Supabase

1. În Supabase Dashboard, mergi la **Authentication** → **Providers**
2. Activează providerii pe care vrei să-i folosești:
   - **Email**: Activ (implicit)
   - **Google**: Opțional
   - **GitHub**: Opțional
   - etc.

3. Configurează Email Templates (opțional):
   - Mergi la **Authentication** → **Email Templates**
   - Personalizează emailurile de confirmare/resetare parolă

### 7. Configurare RLS (Row Level Security)

RLS este deja configurat în schema SQL, dar poți verifica:

1. Mergi la **Table Editor** în Supabase Dashboard
2. Selectează orice tabel (ex: `user_profiles`)
3. Click pe **Policies** tab
4. Ar trebui să vezi policy-urile create automat

## Structura Variabilelor de Mediu

### Variabile Publice (Client-Side)
- `NEXT_PUBLIC_SUPABASE_URL` - URL-ul proiectului Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Cheia publică (anon) pentru client

### Variabile Private (Server-Side)
- `SUPABASE_SERVICE_ROLE_KEY` - Cheia secretă pentru operații admin (NU expune în client!)

### Variabile Externe
- `N8N_WEBHOOK_URL` - URL-ul webhook-ului n8n pentru generare

## Securitate

⚠️ **IMPORTANT**:
- `.env.local` este deja în `.gitignore` - NU commită acest fișier!
- `SUPABASE_SERVICE_ROLE_KEY` are acces complet - folosește-l doar în API routes server-side
- `NEXT_PUBLIC_*` variabilele sunt expuse în browser - nu pune date sensibile acolo

## Testare

După configurare, poți testa conexiunea:

```typescript
// În orice componentă Next.js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Test query
const { data, error } = await supabase
  .from('credit_packages')
  .select('*')
```

## Troubleshooting

### Eroare: "Invalid API key"
- Verifică că ai copiat corect cheia din Supabase Dashboard
- Asigură-te că folosești `anon` key pentru client-side, nu `service_role`

### Eroare: "Row Level Security policy violation"
- Verifică că utilizatorul este autentificat
- Verifică policy-urile RLS în Supabase Dashboard

### Variabilele nu se încarcă
- Restart serverul Next.js (`npm run dev`)
- Verifică că fișierul se numește `.env.local` (nu `.env`)
- Verifică că variabilele au prefixul corect (`NEXT_PUBLIC_` pentru client-side)

## Următorii Pași

După configurarea Supabase:
1. Instalează `@supabase/supabase-js` și `@supabase/auth-helpers-nextjs`
2. Creează utilitare pentru conexiunea la Supabase
3. Implementează autentificarea (sign up, login)
4. Creează API routes pentru operații cu credite și generări

