# Ghid de Setup pentru Generare Reclame

Acest ghid te va ajuta să configurezi sistemul complet de generare a reclamelor folosind n8n și KIE.AI Nano Banana Pro.

## Pași de Configurare

### 1. Obținere API Keys

#### a) IMGBB API Key (pentru upload imagini)
1. Accesează https://api.imgbb.com/
2. Creează un cont gratuit
3. Obține cheia API din dashboard
4. Limita gratuită: 32MB per upload

#### b) KIE.AI API Key (pentru generare imagini)
1. Accesează https://api.kie.ai/
2. Creează un cont
3. Obține cheia API pentru Nano Banana Pro
4. Verifică planul și limitele API-ului

### 2. Configurare n8n

#### a) Instalare n8n
```bash
# Opțiunea 1: Docker
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n

# Opțiunea 2: npm
npm install n8n -g
n8n start
```

#### b) Import Workflow
1. Deschide n8n la http://localhost:5678
2. Click pe "Workflows" → "Import from File"
3. Selectează fișierul `docs/n8n-workflow-example.json`
4. Sau creează manual workflow-ul folosind ghidul din `docs/n8n-workflow-config.md`

#### c) Configurare Environment Variables în n8n
1. În n8n, mergi la Settings → Environment Variables
2. Adaugă următoarele variabile:
   - `IMGBB_API_KEY`: cheia ta de la imgbb.com
   - `KIE_AI_API_KEY`: cheia ta de la KIE.AI

#### d) Configurare Webhook
1. Activează workflow-ul
2. Copiază URL-ul webhook-ului (ex: `https://your-n8n-instance.com/webhook/generate-ad`)
3. Salvează acest URL pentru configurarea Next.js

### 3. Configurare Next.js

#### a) Variabile de Mediu
1. Creează fișierul `.env.local` în root-ul proiectului:
```bash
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/generate-ad
```

2. Sau folosește `.env.example` ca template:
```bash
cp .env.example .env.local
# Apoi editează .env.local cu URL-ul tău
```

#### b) Testare
1. Pornește serverul Next.js:
```bash
npm run dev
```

2. Accesează http://localhost:3000
3. Completează formularul și testează generarea

### 4. Testare Workflow-ul

#### Test cu cURL
```bash
curl -X POST http://localhost:3000/api/generate-ad \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Produs premium de ceai organic, ambalaj eco-friendly",
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
  }'
```

#### Test din Browser
1. Deschide http://localhost:3000
2. Completează formularul cu:
   - Prompt: "Produs premium de ceai organic"
   - Imagine: (opțional) încarcă o imagine
3. Click pe "Generează Reclamă"
4. Verifică rezultatul

## Structura Workflow-ului

```
Form Submission → Get URL (imgbb) → Edit Image (KIE.AI) → Wait → 
Get Image Status → Switch (success/generating/fail) → Result
                                      ↓
                                   (loop back to Wait if generating)
```

## Troubleshooting

### Eroare: "N8N webhook URL not configured"
- Verifică că ai setat `N8N_WEBHOOK_URL` în `.env.local`
- Asigură-te că URL-ul este corect și accesibil

### Eroare: "Failed to process request"
- Verifică că workflow-ul este activat în n8n
- Verifică logs-urile din n8n pentru detalii
- Asigură-te că API keys-urile sunt corect configurate

### Imaginea nu se încarcă
- Verifică că imaginea este în format valid (JPEG, PNG)
- Verifică limita de dimensiune (32MB pentru imgbb gratuit)
- Verifică că base64 encoding funcționează corect

### Status "generating" prea mult timp
- Verifică timeout-urile în nodurile HTTP Request
- Mărește numărul maxim de iterații în loop
- Verifică statusul job-ului direct în KIE.AI dashboard

## Optimizări Avansate

### 1. Adăugare Generare Text
Pentru a genera și text pentru reclame, adaugă un nod suplimentar în workflow:

1. După "Edit Image", adaugă nod "Generate Text"
2. Configurează pentru a folosi OpenAI sau KIE.AI text generation
3. Combină rezultatele în "Result1"

### 2. Caching
Implementează caching pentru prompt-uri similare:
- Folosește hash-ul prompt-ului ca key
- Verifică cache înainte de a trimite cererea
- Salvează rezultatele în cache

### 3. Webhook Retry
Configurează retry logic în n8n:
- Settings → Workflow → Retry on Failure
- Setează numărul maxim de retry-uri

### 4. Notificări
Adaugă notificări când generarea este completă:
- Email notification
- Webhook callback
- Database update

## Resurse Suplimentare

- [Documentație n8n](https://docs.n8n.io/)
- [Documentație KIE.AI](https://api.kie.ai/docs)
- [Documentație imgbb](https://api.imgbb.com/)

## Suport

Pentru probleme sau întrebări:
1. Verifică logs-urile din n8n
2. Verifică console-ul browser-ului
3. Verifică network requests în DevTools
4. Consultă documentația API-urilor folosite

