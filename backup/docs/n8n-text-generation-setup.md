# Configurare Workflow n8n pentru Generare Text (Copywriting)

Acest document descrie configurarea workflow-ului n8n pentru generarea de text publicitar (copywriting) folosind nodul **AI Agent** conectat la **Google Gemini**.

## Structura Workflow-ului

Workflow-ul constă din următoarele noduri:

1. **Webhook** - Trigger pentru primirea cererilor
2. **Build Copywriting Prompt** - Construiește prompt-ul optimizat pentru copywriting
3. **AI Agent** - Nodul n8n pentru AI, conectat la Google Gemini
4. **Parse Response** - Extrage textul generat din răspuns
5. **Respond to Webhook** - Returnează rezultatul final

## Import Workflow

1. Deschide n8n
2. Click pe **Workflows** → **Import from File**
3. Selectează fișierul `docs/n8n-workflow-text-generation.json`
4. Activează workflow-ul

## Configurare Credentiale Google Gemini

### Obține API Key pentru Gemini

1. Accesează [Google AI Studio](https://aistudio.google.com/prompts/new_chat)
2. Click pe **"Get API Key"** (în colțul din stânga sus)
3. Selectează **"Create API Key in new project"** sau **"Create API Key in existing project"**
4. Copiază cheia API generată (va arăta ca: `AIza...`)

**Notă**: Gemini oferă un tier gratuit generos pentru început!

## Configurare Noduri

### 1. Webhook

**Path**: `/webhook/generate-text`

**Setări**:
- **Response Mode**: Respond When Last Node Finishes
- **Response Data**: All Entries

**Date primite**:
```json
{
  "prompt": "Descriere produs pentru care vrei text publicitar",
  "textOptions": {
    "maxTokens": 300,
    "temperature": 0.8,
    "model": "gpt-4o-mini"
  }
}
```

### 2. Build Copywriting Prompt

Acest nod construiește un prompt optimizat pentru copywriting. Poți modifica prompt-ul în cod pentru a ajusta stilul textului generat.

**Opțiuni disponibile în `textOptions`**:
- `maxTokens`: Numărul maxim de tokeni (default: 300)
- `temperature`: Creativitatea (0-1, default: 0.8)
- `model`: Modelul Gemini (default: "gemini-2.0-flash-exp")

**Modele Gemini disponibile**:
- `gemini-1.5-flash` - Rapid și economic (recomandat pentru producție) ⭐
- `gemini-1.5-pro` - Calitate superioară, mai lent
- `gemini-2.0-flash-exp` - Experimental, limite foarte stricte (nu recomandat pentru producție)

**⚠️ IMPORTANT**: `gemini-2.0-flash-exp` are limite foarte stricte în free tier și poate cauza erori 429. Folosește `gemini-1.5-flash` pentru producție!

### 3. AI Agent (Google Gemini)

**Tip nod**: AI Agent

**Configurare**:

1. **Chat Model**:
   - Click pe **"+ Add Chat Model"**
   - Selectează **"Google Gemini"**
   - Click pe **"Create New Credential"** (sau selectează una existentă)
   - **Credential Name**: `Google Gemini API`
   - **API Key**: Inserează cheia ta Gemini (obținută de la Google AI Studio)
   - Click **"Save"**

2. **Model Selection**:
   - **Model**: `gemini-1.5-flash` (recomandat - rapid și cu limite mai mari) ⭐
   - Sau `gemini-1.5-pro` (calitate superioară, mai lent)
   - ⚠️ **NU folosi** `gemini-2.0-flash-exp` în producție (limite foarte stricte)

3. **System Message**:
   ```
   Ești un copywriter profesionist specializat în crearea de texte publicitare atractive și eficiente pentru piața românească. Textele tale sunt concise, impactante și orientate către conversie. Răspunde DOAR în limba română.
   ```

4. **User Message**:
   - Folosește expresia: `{{ $json.prompt }}`
   - Sau: `{{ $('Build Copywriting Prompt').item.json.prompt }}`

5. **Options**:
   - **Temperature**: `0.8` (sau `{{ $json.temperature }}` dacă vine din input)
   - **Max Tokens**: `300` (sau `{{ $json.maxTokens }}` dacă vine din input)
   - **Top P**: `1`
   - **Top K**: `40`

6. **Memory** (opțional):
   - Poți adăuga **"Simple Memory"** dacă vrei să păstreze contextul conversației
   - Pentru copywriting, de obicei nu e necesar

### 4. Parse Response

Extrage textul generat din răspunsul AI Agent. Răspunsul vine de obicei în `$json.output` sau `$json.text`.

**JavaScript Code** (versiune corectată - fără referințe la noduri):

```javascript
const response = $input.item.json;

// AI Agent returnează textul în diferite locații posibile
let generatedText = '';

// Verifică output-ul direct (format AI Agent)
if (response.output) {
  generatedText = String(response.output).trim();
}
// Verifică text
else if (response.text) {
  generatedText = String(response.text).trim();
}
// Verifică message.content
else if (response.message?.content) {
  generatedText = String(response.message.content).trim();
}
// Verifică choices (format similar OpenAI)
else if (response.choices && response.choices.length > 0) {
  const firstChoice = response.choices[0];
  if (firstChoice.message?.content) {
    generatedText = String(firstChoice.message.content).trim();
  }
}
// Verifică în răspunsul complet
else if (response.data?.output) {
  generatedText = String(response.data.output).trim();
}
else if (response.data?.text) {
  generatedText = String(response.data.text).trim();
}
// Fallback - pentru debugging
else {
  generatedText = JSON.stringify(response, null, 2);
}

// Obține originalPrompt din input (fără referință la nod)
let originalPrompt = null;
try {
  if ($input.first()?.json?.originalPrompt) {
    originalPrompt = $input.first().json.originalPrompt;
  }
  else if (response.originalPrompt) {
    originalPrompt = response.originalPrompt;
  }
} catch (e) {
  originalPrompt = null;
}

return [{
  json: {
    success: true,
    text: generatedText,
    model: response.model || 'gemini-1.5-flash',
    originalPrompt: originalPrompt,
    timestamp: new Date().toISOString()
  }
}];
```

**⚠️ IMPORTANT**: Nu folosi `$('Node Name')` pentru a accesa noduri anterioare. Folosește `$input.first()` sau `$input.all()` pentru a accesa datele din input.

### 5. Respond to Webhook

Returnează rezultatul în format JSON.

**⚠️ IMPORTANT**: Folosește expresii n8n corecte pentru a evita textul literal `{{ $json.text }}`!

**Configurare**:

1. **Respond With**: `JSON`
2. **Response Body**: Selectează **"Using JSON"**
3. **JSON Body** (folosește `=` pentru evaluare):
```json
={
  "success": true,
  "text": $json.text,
  "model": $json.model || "gemini-1.5-flash"
}
```

**IMPORTANT**: 
- Folosește `=` la început pentru a activa evaluarea expresiilor
- NU pune ghilimele în jurul expresiilor `$json.text`
- Folosește `||` pentru valori default

**Alternativă simplă**: Returnează direct JSON-ul:
```json
={{ $json }}
```

Aceasta va returna tot JSON-ul din nodul "Parse Response".

**Notă**: Structura răspunsului de la AI Agent poate varia. Verifică output-ul nodului AI Agent pentru a vedea exact cum vine textul generat.

**Vezi**: [docs/n8n-respond-webhook-fix.md](n8n-respond-webhook-fix.md) pentru soluții detaliate.

## Testare Workflow

### Testare manuală cu curl:

```bash
curl -X POST https://your-n8n-instance.com/webhook/generate-text \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Produs premium de ceai organic din munții Carpați",
    "textOptions": {
      "maxTokens": 300,
      "temperature": 0.8
    }
  }'
```

### Testare din aplicație:

Workflow-ul este apelat automat când:
- `generateOnlyText: true` - Doar text
- `generateOnlyText: false` și se dorește varianta full - Text + Imagine

## Personalizare Prompt

Pentru a modifica stilul textului generat, editează nodul **Build Copywriting Prompt**:

```javascript
const copywritingPrompt = `Creează un text publicitar profesional și atractiv pentru următorul produs/serviciu:

${String(prompt).trim()}

Cerințe:
- Text scurt și impactant (maxim 150-200 cuvinte)
- Ton profesional dar accesibil
- Include un call-to-action clar
- Evită clișee excesive
- Focalizat pe beneficii pentru client
- Adaptat pentru piața românească

Generează DOAR textul publicitar, fără explicații suplimentare.`;
```

Poți modifica:
- Lungimea textului
- Tonul (formal, casual, friendly, etc.)
- Stilul (minimalist, descriptiv, emoțional, etc.)
- Call-to-action specific

## Alternative Modele în AI Agent

Nodul AI Agent din n8n suportă multiple modele. Poți schimba modelul în setările nodului:

### Opțiunea 1: Google Gemini (Curent - Recomandat)
- Gratuit pentru început
- Rapid și eficient
- Suport excelent pentru română

### Opțiunea 2: OpenAI (dacă ai cont)
- Selectează "OpenAI" în Chat Model
- Modele: gpt-4o, gpt-4o-mini, gpt-3.5-turbo

### Opțiunea 3: Anthropic Claude
- Selectează "Anthropic" în Chat Model
- Modele: claude-3-5-sonnet, claude-3-opus

## Gestionare Erori

Workflow-ul gestionează automat erorile prin:
- Validare prompt în nodul "Build Copywriting Prompt"
- Timeout de 30 secunde pentru request-uri
- Parsing robust al răspunsului

Pentru debugging, verifică execution logs în n8n.

## Costuri

**Google Gemini** (recomandat):
- **Free Tier**:
  - `gemini-1.5-flash`: 15 requests/minute, 1M tokens/minute
  - `gemini-1.5-pro`: 2 requests/minute, 32K tokens/minute
  - `gemini-2.0-flash-exp`: Limite foarte stricte (nu recomandat)
- **Paid Tier**: Costuri foarte mici după free tier
- `gemini-1.5-pro`: ~$0.00125 per 1K input tokens, ~$0.005 per 1K output tokens

**Comparație**:
- Gemini este mai economic decât OpenAI pentru majoritatea cazurilor
- Calitate excelentă pentru copywriting în română

## Optimizări

1. **Caching**: Cachează textele pentru prompt-uri similare
2. **Batch Processing**: Procesează multiple cereri în paralel
3. **Retry Logic**: Configurează retry automat pentru erori temporare
4. **Rate Limiting**: Respectă limitele OpenAI API

## Troubleshooting

### Eroare: "Invalid API key"
- Verifică că credentialul Google Gemini este configurat corect în nodul AI Agent
- Asigură-te că cheia API începe cu `AIza...`
- Verifică că ai copiat cheia completă din Google AI Studio

### Eroare: "Quota exceeded" sau "429 Too Many Requests"
- **Soluție rapidă**: Schimbă modelul la `gemini-1.5-flash` (are limite mai mari)
- Verifică limitele tale în [Google AI Studio Usage](https://ai.dev/usage?tab=rate-limit)
- `gemini-1.5-flash`: 15 requests/minute în free tier
- `gemini-2.0-flash-exp`: Limite foarte stricte (0-5 requests/minute)
- Adaugă delay de 2-3 secunde între request-uri
- Configurează retry logic în nodul AI Agent
- Vezi [docs/n8n-gemini-rate-limit-fix.md](n8n-gemini-rate-limit-fix.md) pentru soluții detaliate

### Text generat este prea scurt/lung
- Ajustează `maxTokens` în `textOptions`
- Modifică instrucțiunile din prompt

### Text generat nu este în română
- Verifică că prompt-ul specifică "piața românească"
- Adaugă instrucțiune explicită: "Răspunde DOAR în limba română"

