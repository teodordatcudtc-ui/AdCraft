# Corecții Workflow n8n

## Probleme Identificate și Corectate

### 1. ✅ **Wait Node - Lipsea timpul de așteptare**

**Problema**: Nodul "Wait" nu avea setat timpul de așteptare.

**Corecție**:
```json
{
  "parameters": {
    "amount": 5,
    "unit": "seconds"
  }
}
```

**IMPORTANT**: Așteaptă 5 secunde între verificări pentru a nu suprasolicita API-ul KIE.AI.

---

### 2. ✅ **Switch Node - Verifica greșit structura datelor**

**Problema**: Switch-ul verifica `$json.data.state` dar după "Parse Result" structura este `$json.state`.

**Corecție**:
- Schimbat toate condițiile din `{{ $json.data.state }}` în `{{ $json.state }}`
- Adăugat reguli pentru toate state-urile: `success`, `waiting`, `generating`, `queuing`, `fail`

**Reguli Switch**:
1. **success** → `{{ $json.state }}` equals `success` → Merge la "Respond to Webhook"
2. **waiting** → `{{ $json.state }}` equals `waiting` → Loop înapoi la "Wait"
3. **generating** → `{{ $json.state }}` equals `generating` → Loop înapoi la "Wait"
4. **queuing** → `{{ $json.state }}` equals `queuing` → Loop înapoi la "Wait"
5. **fail** → `{{ $json.state }}` equals `fail` → Merge la "Respond to Webhook" (cu eroare)

---

### 3. ✅ **Build KIE.AI Request - Lipsea sanitizarea promptului**

**Problema**: Nu avea codul pentru sanitizarea promptului și validarea opțiunilor.

**Corecție**: Adăugat:
- Sanitizare prompt (traducere cuvinte românești)
- Validare `aspect_ratio` (doar: '1:1', '16:9', '9:16', '4:3')
- Validare `resolution` (doar: '1K', '2K')
- Context pozitiv pentru a evita filtrarea KIE.AI

**Cod complet**:
```javascript
// Reformulează promptul pentru a evita filtrarea KIE.AI
let sanitizedPrompt = String(prompt).trim()
  .replace(/reclama/gi, 'advertisement')
  .replace(/adidasi/gi, 'sneakers')
  .replace(/adidica/gi, 'sneakers')
  .replace(/posta/gi, 'post')
  .replace(/poster/gi, 'poster')
  .replace(/moderna/gi, 'modern')
  .replace(/minimalista/gi, 'minimalist')
  .replace(/banner/gi, 'banner')
  .replace(/reducere/gi, 'discount')
  .replace(/euro/gi, 'euros')
  .replace(/uero/gi, 'euros');

// Adaugă context pozitiv pentru a evita filtrarea
if (!sanitizedPrompt.toLowerCase().includes('professional') &&
    !sanitizedPrompt.toLowerCase().includes('commercial')) {
  sanitizedPrompt = `Professional product photography: ${sanitizedPrompt}. Clean design, commercial photography style, brand-safe content, family-friendly imagery.`;
}

// Validează resolution
const validResolutions = ['1K', '2K'];
const resolution = validResolutions.includes(options.resolution)
  ? options.resolution
  : '1K';

// Validează aspect_ratio
const validAspectRatios = ['1:1', '16:9', '9:16', '4:3'];
const aspectRatio = validAspectRatios.includes(options.aspect_ratio)
  ? options.aspect_ratio
  : '1:1';
```

---

### 4. ✅ **API Keys Hardcodate - Trebuie să folosească variabile de mediu**

**Problema**: API keys-urile erau hardcodate în workflow.

**Corecție**:
- **imgbb API Key**: `{{ $env.IMGBB_API_KEY }}`
- **KIE.AI API Key**: `Bearer {{ $env.KIE_AI_API_KEY }}`

**IMPORTANT**: 
- Adaugă variabilele de mediu în n8n:
  - `IMGBB_API_KEY` = cheia ta de la imgbb.com
  - `KIE_AI_API_KEY` = cheia ta de la KIE.AI

---

### 5. ✅ **Parse Result - Îmbunătățit parsing-ul**

**Problema**: Nu verifica toate cazurile posibile pentru URL-uri.

**Corecție**: Adăugat verificări suplimentare:
```javascript
// Dacă nu există resultUrls, verifică alte câmpuri posibile
if (imageUrls.length === 0) {
  if (resultJson.image_url) {
    imageUrls = [resultJson.image_url];
    firstImageUrl = resultJson.image_url;
  } else if (resultJson.imageUrls && Array.isArray(resultJson.imageUrls)) {
    imageUrls = resultJson.imageUrls;
    firstImageUrl = imageUrls.length > 0 ? imageUrls[0] : null;
  }
}
```

---

### 6. ✅ **Code Node - Adăugat resolution în opțiuni**

**Problema**: Lipsea `resolution` din opțiunile procesate.

**Corecție**: Adăugat în `processedOptions`:
```javascript
resolution: options.resolution || '1K'
```

---

### 7. ✅ **Switch Connections - Corectat loop-ul**

**Problema**: Switch-ul avea doar 2 output-uri configurate, dar trebuie 5.

**Corecție**: 
- Output 0 (success) → "Respond to Webhook"
- Output 1 (waiting) → "Wait" (loop)
- Output 2 (generating) → "Wait" (loop)
- Output 3 (queuing) → "Wait" (loop)
- Output 4 (fail) → "Respond to Webhook" (cu eroare)

**IMPORTANT**: Toate state-urile de procesare (`waiting`, `generating`, `queuing`) trebuie să facă loop înapoi la "Wait" pentru polling.

---

### 8. ✅ **Respond to Webhook - Adăugat state în răspuns**

**Problema**: Răspunsul nu includea `state`.

**Corecție**:
```json
{
  "success": true,
  "image_url": "{{ $('Parse Result').item.json.firstImageUrl }}",
  "taskId": "{{ $('Parse Result').item.json.taskId }}",
  "state": "{{ $('Parse Result').item.json.state }}"
}
```

---

## Flow Corect

1. **Webhook** → Primește request de la Next.js
2. **Code** → Extrage prompt, imagine (base64), opțiuni
3. **HTTP Request** (imgbb) → Upload imagine → Returnează URL
4. **Build KIE.AI Request** → Construiește JSON cu prompt sanitizat și `image_input: ["url"]`
5. **HTTP Request1** (KIE.AI createTask) → Creează task-ul
6. **Wait** → Așteaptă 5 secunde
7. **Get Image1** → Verifică statusul task-ului
8. **Parse Result** → Parsează `resultJson` și extrage `resultUrls`
9. **Switch** → Verifică `state`:
   - `success` → Merge la "Respond to Webhook"
   - `waiting`/`generating`/`queuing` → Loop înapoi la "Wait"
   - `fail` → Merge la "Respond to Webhook" (cu eroare)
10. **Respond to Webhook** → Returnează `firstImageUrl` către Next.js

---

## Variabile de Mediu Necesare

Adaugă în n8n (Settings → Environment Variables):

1. **IMGBB_API_KEY**
   - Valoare: Cheia ta de la https://api.imgbb.com/
   - Folosit în: "HTTP Request" (imgbb upload)

2. **KIE_AI_API_KEY**
   - Valoare: Cheia ta de la https://api.kie.ai/
   - Folosit în: "HTTP Request1" (createTask) și "Get Image1" (recordInfo)

---

## Import Workflow Corectat

1. Deschide n8n
2. Click pe "Workflows" → "Import from File"
3. Selectează `docs/n8n-workflow-fixed.json`
4. Verifică că toate nodurile sunt conectate corect
5. Adaugă variabilele de mediu (`IMGBB_API_KEY`, `KIE_AI_API_KEY`)
6. Activează workflow-ul
7. Testează cu un request de la Next.js

---

## Verificări Post-Import

1. ✅ **Wait Node**: Are `amount: 5` și `unit: "seconds"`?
2. ✅ **Switch Node**: Verifică `{{ $json.state }}` (nu `{{ $json.data.state }}`)?
3. ✅ **Switch Node**: Are 5 reguli (success, waiting, generating, queuing, fail)?
4. ✅ **Build KIE.AI Request**: Are codul de sanitizare prompt?
5. ✅ **API Keys**: Folosesc `{{ $env.IMGBB_API_KEY }}` și `{{ $env.KIE_AI_API_KEY }}`?
6. ✅ **Parse Result**: Are verificări suplimentare pentru `image_url` și `imageUrls`?
7. ✅ **Connections**: Switch-ul are 5 output-uri conectate corect?

---

## Testare

După import, testează workflow-ul:

1. Trimite un request POST la webhook-ul tău:
```bash
curl -X POST https://agentie-reclame.app.n8n.cloud/webhook/reclama \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "fa o posta tip poster pentru a promova acesti adidasi Jordan 3",
    "image": "data:image/jpeg;base64,...",
    "options": {
      "aspect_ratio": "9:16",
      "resolution": "1K"
    }
  }'
```

2. Verifică în n8n:
   - Workflow-ul pornește
   - Imaginea se upload-ează pe imgbb
   - Task-ul se creează pe KIE.AI
   - Polling-ul funcționează (loop Wait → Get Image1 → Parse Result → Switch)
   - Când `state === "success"`, răspunsul conține `image_url`

---

## Probleme Comune

### Workflow-ul nu pornește
- Verifică că webhook-ul este activat
- Verifică că URL-ul webhook-ului este corect în Next.js

### "Image URL is required but is empty or null"
- Verifică că imaginea se upload-ează corect pe imgbb
- Verifică output-ul nodului "HTTP Request" (imgbb) → ar trebui să aibă `data.url`

### "Prompt is required but is empty or null"
- Verifică că prompt-ul este trimis în body-ul request-ului
- Verifică output-ul nodului "Code" → ar trebui să aibă `prompt`

### Switch-ul nu funcționează
- Verifică că "Parse Result" este conectat înainte de "Switch"
- Verifică că expresia este `{{ $json.state }}` (nu `{{ $json.data.state }}`)

### Loop infinit
- Verifică că "Wait" are timpul setat (5 secunde)
- Verifică că Switch-ul are reguli pentru toate state-urile
- Verifică că KIE.AI task-ul se finalizează (nu rămâne în `waiting` pentru totdeauna)

