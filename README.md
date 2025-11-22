# Agentie Reclame - AI-Powered Ad Generation Platform

Platformă SaaS modernă pentru generarea de reclame optimizate (conținut + imagini) pentru produsele clienților.

## Tehnologii

- **Next.js 14** - Framework React cu App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling modern și responsive
- **React** - UI library

## Instalare

```bash
npm install
```

## Dezvoltare

```bash
npm run dev
```

Deschide [http://localhost:3000](http://localhost:3000) în browser.

## Build pentru producție

```bash
npm run build
npm start
```

## Funcționalități

- Landing page modern și minimalist
- Formular de testare cu input pentru prompt
- Upload imagini pentru produse
- Design futurist inspirat din Apify și Vapi
- Responsive design
- **Integrare n8n pentru generare imagini și text cu KIE.AI Nano Banana Pro**
- API endpoint pentru generare reclame
- Workflow automatizat cu polling pentru status job-uri

## Configurare n8n

Pentru a configura sistemul de generare a reclamelor:

1. **Citește ghidul complet**: Vezi [docs/SETUP.md](docs/SETUP.md) pentru instrucțiuni detaliate
2. **Configurare workflow**: Vezi [docs/n8n-workflow-config.md](docs/n8n-workflow-config.md) pentru detalii despre fiecare nod
3. **Import workflow**: Folosește [docs/n8n-workflow-example.json](docs/n8n-workflow-example.json) ca template

### Quick Start

1. Configurează variabilele de mediu:
```bash
cp .env.example .env.local
# Editează .env.local cu URL-ul webhook-ului n8n
```

2. Configurează n8n (vezi [docs/SETUP.md](docs/SETUP.md))
3. Pornește aplicația:
```bash
npm run dev
```

## Structura Proiectului

```
├── app/
│   ├── api/
│   │   └── generate-ad/     # API endpoint pentru generare reclame
│   ├── page.tsx             # Pagina principală cu formular
│   └── ...
├── docs/
│   ├── SETUP.md             # Ghid complet de setup
│   ├── n8n-workflow-config.md  # Configurare detaliată workflow
│   └── n8n-workflow-example.json  # Template workflow n8n
└── ...
```

## API Endpoints

### POST /api/generate-ad

Generează o reclamă folosind n8n workflow.

**Request Body:**
```json
{
  "prompt": "Descriere produs",
  "image": "data:image/jpeg;base64,..." // opțional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "image_url": "https://...",
    "job_id": "job_123",
    "metadata": {...}
  }
}
```

