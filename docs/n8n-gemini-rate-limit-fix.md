# Fix pentru Rate Limit Gemini API (429 Error)

## Problema

Eroare: `[429 Too Many Requests] You exceeded your current quota`

Această eroare apare când ai depășit limitele free tier pentru Gemini API.

## Soluții

### Soluția 1: Schimbă Modelul (Recomandat)

**`gemini-2.0-flash-exp`** are limite foarte stricte în free tier. Schimbă la **`gemini-1.5-flash`** care are limite mai mari.

#### Pași:

1. Deschide workflow-ul în n8n
2. Click pe nodul **AI Agent**
3. În secțiunea **Model Selection**, schimbă:
   - De la: `gemini-2.0-flash-exp`
   - La: `gemini-1.5-flash`
4. Click **Save**

**Avantaje**:
- Limite mai mari în free tier
- Același nivel de performanță
- Mai stabil pentru producție

### Soluția 2: Adaugă Retry Logic cu Exponential Backoff

#### Pasul 1: Adaugă nod "Wait" înainte de AI Agent

1. Adaugă un nod **Wait** între "Build Copywriting Prompt" și "AI Agent"
2. Setări:
   - **Amount**: `2` (sau `3`)
   - **Unit**: `seconds`
3. Acest delay previne rate limiting pentru request-uri rapide

#### Pasul 2: Configurează Retry în AI Agent

1. Click pe nodul **AI Agent**
2. În secțiunea **Options**:
   - **Retry on Failure**: `Yes`
   - **Max Retries**: `3`
   - **Retry Delay**: `3 seconds` (sau `5 seconds`)
3. Click **Save**

#### Pasul 3: Adaugă Error Handling

Adaugă un nod **IF** după AI Agent pentru a gestiona erorile 429:

1. Adaugă nod **IF** după "AI Agent"
2. **Condition**:
   ```
   {{ $json.error?.message?.includes('429') || $json.error?.message?.includes('quota') || $json.error?.message?.includes('rate limit') }}
   ```
3. **True Output**: Conectează la un nod **Wait** (5-10 secunde) apoi înapoi la AI Agent
4. **False Output**: Continuă la "Parse Response"

### Soluția 3: Upgrade la Plan Plătit

Dacă ai nevoie de mai multe request-uri:

1. Accesează [Google AI Studio](https://aistudio.google.com/)
2. Click pe **Settings** → **Billing**
3. Upgrade la un plan plătit
4. Limitele vor crește semnificativ

### Soluția 4: Adaugă Delay între Request-uri

Pentru a evita rate limiting, adaugă delay între request-uri:

1. În nodul **Webhook**, adaugă un delay minim de 2-3 secunde
2. Sau folosește un nod **Wait** la începutul workflow-ului

## Configurare Recomandată

### Workflow Optimizat:

```
Webhook
    ↓
Build Copywriting Prompt
    ↓
Wait (2 seconds) ← Adaugă delay
    ↓
AI Agent (gemini-1.5-flash) ← Schimbă modelul
    ↓
IF (Check for 429 error)
    ├─ True → Wait (5 seconds) → Retry AI Agent
    └─ False → Parse Response
    ↓
Respond to Webhook
```

## Verificare Rate Limits

1. Accesează [Google AI Studio Usage](https://ai.dev/usage?tab=rate-limit)
2. Verifică:
   - Requests per minute
   - Tokens per minute
   - Limitele rămase

## Limite Free Tier Gemini

### gemini-2.0-flash-exp:
- **Requests/minute**: Foarte limitat (aprox. 0-5)
- **Tokens/minute**: Foarte limitat
- **Recomandare**: Nu folosi în producție

### gemini-1.5-flash:
- **Requests/minute**: 15 requests/minute
- **Tokens/minute**: 1M tokens/minute
- **Recomandare**: ✅ Folosește acest model

### gemini-1.5-pro:
- **Requests/minute**: 2 requests/minute
- **Tokens/minute**: 32K tokens/minute
- **Recomandare**: Pentru calitate superioară, dar mai lent

## Testare

După aplicarea fix-urilor, testează workflow-ul:

```bash
curl -X POST https://agentie-reclame.app.n8n.cloud/webhook/generate-text \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Test prompt pentru verificare rate limit",
    "textOptions": {
      "maxTokens": 200,
      "temperature": 0.8
    }
  }'
```

## Monitoring

Monitorizează rate limits în:
- [Google AI Studio Usage](https://ai.dev/usage?tab=rate-limit)
- n8n Execution Logs (verifică erorile 429)

## Alternative

Dacă problemele persistă, consideră:

1. **OpenAI GPT-4o-mini**: Mai scump dar fără rate limits stricte
2. **Anthropic Claude**: Alternative solidă
3. **Plan plătit Gemini**: Upgrade pentru limite mai mari

