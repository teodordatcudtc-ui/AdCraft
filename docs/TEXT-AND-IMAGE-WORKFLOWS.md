# Workflow-uri pentru Generare Text și Imagine

Acest document explică cum funcționează sistemul de generare de reclame cu două workflow-uri separate: unul pentru text (copywriting) și unul pentru imagini.

## Arhitectură

Sistemul folosește două workflow-uri n8n separate:

1. **Workflow pentru Text** (`generate-text`) - Generează text publicitar folosind OpenAI API
2. **Workflow pentru Imagine** (`reclama`) - Generează imagini folosind KIE.AI Nano Banana Pro

## Fluxul de Date

### Opțiunea 1: Doar Text (`generateOnlyText: true`)

```
Client → API Route → n8n Text Workflow → OpenAI API → Text generat → Client
```

**Când se folosește**: Când utilizatorul selectează opțiunea "Doar Text"

**Rezultat**: Returnează doar textul publicitar generat

### Opțiunea 2: Full (Imagine + Text) (`generateOnlyText: false`)

```
Client → API Route → [n8n Image Workflow + n8n Text Workflow] (paralel) → Client
                    ↓                                    ↓
              KIE.AI API                            OpenAI API
                    ↓                                    ↓
              Imagine generată                    Text generat
```

**Când se folosește**: Când utilizatorul selectează opțiunea "Full" (imagine + text)

**Rezultat**: Returnează atât imaginea cât și textul generat

## Configurare

### 1. Variabile de Mediu

Adaugă în Vercel (sau `.env.local` pentru local):

```env
# Workflow pentru imagini
N8N_WEBHOOK_URL=https://agentie-reclame.app.n8n.cloud/webhook/reclama

# Workflow pentru text
N8N_TEXT_WEBHOOK_URL=https://agentie-reclame.app.n8n.cloud/webhook/generate-text
```

### 2. Variabile n8n

În n8n, adaugă următoarele variabile de mediu:

**Pentru workflow-ul de imagini**:
- `IMGBB_API_KEY` - Cheia API de la imgbb.com
- `KIE_AI_API_KEY` - Cheia API de la KIE.AI

**Pentru workflow-ul de text**:
- `OPENAI_API_KEY` - Cheia API de la OpenAI (începe cu `sk-...`)

## Import Workflow-uri

### Workflow pentru Imagini

1. Deschide n8n
2. Import `docs/n8n-workflow-fixed.json`
3. Activează workflow-ul
4. Copiază URL-ul webhook-ului (ex: `/webhook/reclama`)

### Workflow pentru Text

1. Deschide n8n
2. Import `docs/n8n-workflow-text-generation.json`
3. Configurează `OPENAI_API_KEY` în n8n
4. Activează workflow-ul
5. Copiază URL-ul webhook-ului (ex: `/webhook/generate-text`)

## Utilizare din Cod

### Doar Text

```typescript
const response = await fetch('/api/generate-ad', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'Descriere produs',
    generateOnlyText: true,
  }),
})

const { data } = await response.json()
console.log(data.text) // Textul generat
```

### Full (Imagine + Text)

```typescript
const response = await fetch('/api/generate-ad', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'Descriere produs',
    image: 'data:image/jpeg;base64,...', // Base64 image
    options: {
      aspect_ratio: '1:1',
      width: 1024,
      height: 1024,
    },
    generateOnlyText: false,
  }),
})

const { data } = await response.json()
console.log(data.image_url) // URL-ul imaginii
console.log(data.text)      // Textul generat
```

## Răspuns API

### Doar Text

```json
{
  "success": true,
  "data": {
    "text": "Textul publicitar generat...",
    "model": "gpt-4o-mini",
    "usage": {
      "prompt_tokens": 150,
      "completion_tokens": 200,
      "total_tokens": 350
    }
  }
}
```

### Full (Imagine + Text)

```json
{
  "success": true,
  "data": {
    "image_url": "https://i.ibb.co/...",
    "taskId": "task-id-123",
    "text": "Textul publicitar generat...",
    "errors": {
      "image": null,
      "text": null
    }
  }
}
```

**Notă**: Dacă unul dintre workflow-uri eșuează, câmpul `errors` va conține mesajul de eroare, dar celălalt rezultat va fi returnat dacă a reușit.

## Avantaje ale Arhitecturii

1. **Separare responsabilități**: Fiecare workflow face un singur lucru bine
2. **Scalabilitate**: Poți scala workflow-urile independent
3. **Flexibilitate**: Poți folosi doar text sau doar imagine dacă e necesar
4. **Performanță**: Workflow-urile rulează în paralel pentru varianta full
5. **Mentenanță**: Mai ușor de debugat și modificat

## Troubleshooting

### Text nu se generează

1. Verifică că `N8N_TEXT_WEBHOOK_URL` este setat corect
2. Verifică că workflow-ul de text este activat în n8n
3. Verifică că `OPENAI_API_KEY` este setat în n8n
4. Verifică creditul disponibil în contul OpenAI

### Imagine nu se generează

1. Verifică că `N8N_WEBHOOK_URL` este setat corect
2. Verifică că workflow-ul de imagini este activat în n8n
3. Verifică că `KIE_AI_API_KEY` și `IMGBB_API_KEY` sunt setate în n8n

### Ambele eșuează

1. Verifică conectivitatea la n8n
2. Verifică logs-urile în n8n pentru detalii
3. Verifică că toate variabilele de mediu sunt setate corect

## Costuri

### OpenAI (Text)

- **GPT-4o-mini**: ~$0.001-0.002 per generare (200 cuvinte)
- **GPT-4o**: ~$0.01-0.02 per generare (calitate superioară)

### KIE.AI (Imagini)

- Verifică planul tău KIE.AI pentru costuri
- Depinde de rezoluție și numărul de imagini generate

## Optimizări Viitoare

1. **Caching**: Cachează textele și imaginile pentru prompt-uri similare
2. **Retry Logic**: Adaugă retry automat pentru erori temporare
3. **Rate Limiting**: Implementează rate limiting pentru a evita costuri excesive
4. **Batch Processing**: Procesează multiple cereri în batch pentru eficiență

