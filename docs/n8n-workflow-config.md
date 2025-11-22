# Configurare Workflow n8n pentru Generare Reclame

Acest document descrie configurarea workflow-ului n8n pentru generarea de imagini și text pentru reclame folosind KIE.AI Nano Banana Pro API.

## Structura Workflow-ului

Workflow-ul constă din următoarele noduri:

1. **On form submission** - Trigger pentru primirea datelor de la formular
2. **Get URL** - Upload imagine la imgbb.com pentru a obține URL-ul
3. **Edit Image** - Trimite cerere de editare/generare imagine la KIE.AI API
4. **Wait1** - Așteaptă înainte de a verifica statusul
5. **Get Image1** - Verifică statusul job-ului de generare
6. **Switch1** - Logică condițională bazată pe status (success, generating, fail)
7. **Result1** - Returnează rezultatul final

## Configurare Noduri

### 1. On Form Submission (Form Trigger SAU Webhook Trigger)

#### Opțiunea A: Form Trigger (Form n8n)

**Tip**: Form Trigger
**Setări**:
- Câmpuri formular:
  - `Prompt` (Text) - pentru descrierea produsului
  - `Imagine` (File Upload) - pentru imaginea produsului

**Date primite**:
- `$json.Prompt` - text din câmpul Prompt
- `$json.Imagine` - obiect file cu metadata (filename, mimetype, size)
- `$binary.Imagine` - binary data pentru imagine (cu `data` property care conține base64)

#### Opțiunea B: Webhook Trigger

**Tip**: Webhook
**Metodă**: POST
**Path**: `/webhook/generate-ad`

**Setări**:
- Authentication: None (sau Basic Auth dacă doriți securitate)
- Response Mode: Respond When Last Node Finishes
- Response Data: All Entries

**Date primite**:
```json
{
  "prompt": "Descriere produs",
  "image": "data:image/jpeg;base64,..." sau "base64_encoded_image",
  "timestamp": "2025-11-21T..."
}
```

**IMPORTANT**: n8n webhook poate procesa datele diferit:
- Datele pot fi în `$json.body.prompt` și `$json.body.image`
- SAU direct în `$json.Prompt` și `$json.Imagine` (ca obiect file)
- Verifică structura datelor cu un nod Code de debugging

### 2. Convert Image to Base64 (Code Node) - OBLIGATORIU dacă primești obiect file

**IMPORTANT**: Dacă primești un obiect file (ex: `[Object: {"filename": "_IMG8933.JPG", "mimetype": "image/jpeg"}]`), trebuie să-l convertești în base64 înainte de a-l trimite la imgbb.

**Tip**: Code
**Mode**: Run Once for All Items

**Code**:
```javascript
// Dacă Imagine este un obiect file cu binary data
const items = $input.all();

return items.map(item => {
  const imageObj = item.json.Imagine || item.json.body?.Imagine || item.json.image || item.json.body?.image;
  const prompt = item.json.body?.prompt || item.json.prompt || '';
  const options = item.json.body?.options || item.json.options || {};
  
  // Funcție helper pentru a extrage doar base64 (fără prefix)
  const extractBase64 = (str) => {
    if (!str) return '';
    if (typeof str !== 'string') return '';
    if (str.startsWith('data:')) {
      // Extrage doar partea de base64 după virgulă
      const parts = str.split(',');
      return parts.length > 1 ? parts[1] : str;
    }
    return str;
  };
  
  let base64Only = '';
  
  // Verifică dacă este deja base64 string
  if (typeof imageObj === 'string') {
    // imgbb.com vrea DOAR base64, fără prefix "data:image/..."
    base64Only = extractBase64(imageObj);
  }
  // Dacă este obiect file, încearcă să accesezi binary data
  else if (imageObj && typeof imageObj === 'object') {
    // Verifică dacă există binary data în item
    const binaryKey = Object.keys(item.binary || {}).find(key => 
      key.toLowerCase().includes('image') || key.toLowerCase().includes('imagine')
    );
    
    if (binaryKey && item.binary[binaryKey]) {
      // Binary data este deja în format base64 în n8n
      const binaryData = item.binary[binaryKey];
      base64Only = binaryData.data; // Deja base64 string
    }
    // Dacă obiectul are proprietatea 'data' cu base64
    else if (imageObj.data) {
      base64Only = extractBase64(imageObj.data);
    }
  }
  
  // Procesează opțiunile cu valori default (format KIE.AI)
  const processedOptions = {
    aspect_ratio: options.aspect_ratio || '1:1',
    resolution: '1K', // KIE.AI folosește resolution, nu width/height
    output_format: 'png',
    // width și height sunt calculate automat de KIE.AI din aspect_ratio și resolution
    style: options.style || 'professional', // Poate fi folosit în prompt
    negative_prompt: options.negative_prompt || 'blurry, low quality, distorted' // Poate fi adăugat în prompt
  };
  
  return {
    json: {
      prompt: prompt,
      imageBase64: base64Only,
      options: processedOptions,
      // Păstrează width și height pentru referință (dar nu sunt folosite de KIE.AI)
      width: options.width || 1024,
      height: options.height || 1024,
      timestamp: item.json.body?.timestamp || item.json.timestamp
    }
  };
});
```

**Alternativă simplă** (dacă ai deja base64 în obiect):
```javascript
return $input.all().map(item => ({
  json: {
    ...item.json,
    imageBase64: item.json.Imagine?.data || item.json.body?.image || item.json.Imagine
  }
}));
```

### 3. Get URL (HTTP Request - imgbb.com)

**Tip**: HTTP Request
**Metodă**: POST
**URL**: `https://api.imgbb.com/1/upload`

**IMPORTANT - Configurare corectă pentru form-data:**

1. **Send Body**: ✅ Bifează "Send Body"
2. **Content Type**: Selectează **"Form-Data"** (NU "Form Urlencoded" și NU "JSON")
3. **Headers**: 
   - ❌ **NU adăuga manual header-ul Content-Type** - n8n o face automat pentru form-data
   - ❌ **Dacă vezi "Content-Type: application/x-www-form-urlencoded" în Headers, ȘTERGE-L!**
   - n8n va seta automat `multipart/form-data` când folosești Form-Data

**Body Parameters** (în secțiunea "Specify Body"):
- Click pe "Add Parameter"
- **Parameter Type**: Selectează "Form Data" pentru ambele parametri
- **Parameter 1**:
  - Name: `key`
  - Value: `={{ $env.IMGBB_API_KEY }}` (sau hardcodează cheia dacă preferi)
- **Parameter 2**:
  - Name: `image`
  - Value: `={{ $json.imageBase64 }}` (după nodul Code care convertește în base64)
  - **IMPORTANT**: Folosește `imageBase64` din nodul Code, NU direct obiectul file!

**Dacă NU folosești nodul Code (imaginea vine deja ca base64 string):**
- Value: `={{ $json.body.image }}` sau `={{ $json.Imagine }}` (doar dacă este deja string base64)

**Alternativă - dacă imaginea vine ca URL:**
Dacă primești un URL în loc de base64 sau file object, folosește:
- Value: `={{ $json.body.image }}` (direct URL-ul)

**Setări**:
- Response Format: JSON
- Authentication: None
- Options: 
  - Timeout: 30000ms
  - Redirect: Follow
  - **NU seta manual Content-Type în Headers**

**Notă**: Dacă imaginea este base64, trebuie să fie în format complet: `data:image/jpeg;base64,/9j/4AAQ...` sau doar partea de base64 fără prefix.

**Răspuns așteptat**:
```json
{
  "data": {
    "url": "https://i.ibb.co/...",
    "display_url": "https://ibb.co/...",
    "delete_url": "https://ibb.co/delete/..."
  }
}
```

**Expresie pentru URL-ul imaginii**:
```javascript
{{ $json.data.url }}
```

### 4. Edit Image (HTTP Request - KIE.AI API)

**Tip**: HTTP Request
**Metodă**: POST
**URL**: `https://api.kie.ai/api/v1/jobs/createTask`

**IMPORTANT**: 
- Verifică documentația KIE.AI pentru endpoint-ul corect
- Poate fi: `/api/v1/jobs/createTask`, `/api/v1/image/edit`, `/api/v1/image/generate`, etc.
- Verifică formatul exact al request-ului în documentația API-ului

**NOTĂ**: Dacă primești 422 "The input cannot be null", API-ul poate aștepta:
- Un câmp `input` sau `task` care să conțină datele
- Un format diferit de JSON
- Câmpuri obligatorii suplimentare

**Headers**:
```
Content-Type: application/json
Authorization: Bearer {{ $env.KIE_AI_API_KEY }}
```

**Body (JSON)** - FORMAT CORECT conform documentației KIE.AI:

**OPȚIUNEA 1: Folosește nodul Code pentru a construi JSON-ul (RECOMANDAT)**

Adaugă un nod Code înainte de "Edit Image" numit "Build KIE.AI Request":

**Code**:
```javascript
const prompt = $('Code').item.json.prompt || '';
const imageUrl = $input.item.json.data.url || '';
const options = $('Code').item.json.options || {};

// Validare
if (!prompt || prompt.trim() === '') {
  throw new Error('Prompt is required but is empty or null');
}

if (!imageUrl || imageUrl.trim() === '') {
  throw new Error('Image URL is required but is empty or null');
}

// Reformulează promptul pentru a evita filtrarea KIE.AI
// Traduce și adaugă context pozitiv
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

// Construiește JSON-ul în formatul KIE.AI
// IMPORTANT: Conform documentației KIE.AI, image_input este array de URL-uri (până la 8 imagini)!
return [{
  json: {
    model: "nano-banana-pro",
    callBackUrl: "", // Opțional - lasă gol sau adaugă URL-ul tău
    input: {
      prompt: sanitizedPrompt,
      image_input: imageUrl ? [String(imageUrl).trim()] : [], // ✅ Array de URL-uri: ["https://..."]
      aspect_ratio: aspectRatio,
      resolution: resolution,
      output_format: 'png'
    }
  }
}];
```

Apoi în "Edit Image":
- **Body Content Type**: JSON
- **Specify Body**: Using JSON
- **Body**: `={{ JSON.stringify($json) }}`

**OPȚIUNEA 2: Folosește expresii directe (mai complex)**

```json
{
  "model": "nano-banana-pro",
  "callBackUrl": "",
  "input": {
    "prompt": "{{ $('Code').item.json.prompt }}",
    "image_url": "{{ $json.data.url }}",
    "aspect_ratio": "{{ $('Code').item.json.options.aspect_ratio || '1:1' }}",
    "resolution": "1K",
    "output_format": "png"
  }
}
```

**IMPORTANT**: 
- **Body Content Type**: JSON
- **Specify Body**: Using JSON (nu "Using Fields Below")
- **Format**: KIE.AI așteaptă un `input` object, NU parametri directi!
- `model`: La nivel superior (nu în `input`)
- `input.prompt`: Prompt-ul pentru generare
- `input.image_url`: URL-ul imaginii (dacă editezi o imagine existentă)
- `input.aspect_ratio`: Format "1:1", "16:9", "9:16", "4:3" (NU width/height separat!)
- `input.resolution`: "1K", "2K", etc. (NU width/height în pixeli!)
- `input.output_format`: "png", "jpg", etc.

**NOTĂ**: 
- `callBackUrl` este opțional - poate fi gol sau URL-ul tău de callback
- `image_url` este opțional - doar dacă editezi o imagine existentă
- `negative_prompt`, `num_inference_steps`, `guidance_scale` NU sunt în formatul oficial KIE.AI

**Dacă primești erori roșii**:
1. Verifică numele exact al nodului Code (ex: "Code", "Extract Base64")
2. Folosește numele exact: `{{ $('Nume Exact').item.json.prompt }}`
3. Folosește OPȚIUNEA 1 (nodul Code) pentru a construi JSON-ul - este mai sigur!

**Dacă primești eroare "JSON parameter needs to be valid JSON"**:
1. Verifică că expresiile returnează valori valide
2. Adaugă valori default: `{{ $('Webhook').item.json.body.prompt || '' }}`
3. SAU folosește nodul Code pentru a construi JSON-ul (vezi `docs/n8n-fix-invalid-json.md`)

**Setări**:
- Response Format: JSON
- Options:
  - Timeout: 60000ms

**Răspuns așteptat** (format KIE.AI):
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "2f6131d977805e8de00fd18edbb318b9",
    "recordId": "2f6131d977805e8de00fd18edbb318b9"
  }
}
```

**IMPORTANT**: 
- KIE.AI returnează `taskId` și `recordId`, NU `job_id`!
- Folosește `{{ $json.data.taskId }}` sau `{{ $json.data.recordId }}` pentru a accesa ID-ul task-ului
- Ambele (`taskId` și `recordId`) par să fie identice, deci poți folosi oricare

### 5. Wait1 (Wait Node)

**Tip**: Wait
**Wait Type**: Time
**Amount**: 5
**Unit**: seconds

**Notă**: Așteaptă 5 secunde înainte de a verifica statusul job-ului.

### 6. Get Image1 (HTTP Request - KIE.AI API)

**Tip**: HTTP Request
**Metodă**: GET
**URL**: `https://api.kie.ai/api/v1/jobs/recordInfo?taskId={{ $json.data.taskId }}`

**IMPORTANT**: 
- Endpoint-ul corect este `/api/v1/jobs/recordInfo?taskId={taskId}`, NU `/api/v1/jobs/{taskId}`!
- Folosește query parameter `taskId`, NU path parameter!
- Răspunsul de la "Edit Image" este: `{ "code": 200, "data": { "taskId": "...", "recordId": "..." } }`

**Headers**:
```
Authorization: Bearer {{ $env.KIE_AI_API_KEY }}
```

**Setări**:
- Response Format: JSON
- Options:
  - Timeout: 30000ms

**Răspuns așteptat** (format KIE.AI oficial):
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "taskId": "task_12345678",
    "model": "nano-banana-pro",
    "state": "success",
    "resultJson": "{\"resultUrls\":[\"https://example.com/generated-image.jpg\"]}",
    "failCode": "",
    "failMsg": "",
    "completeTime": 1698765432000,
    "createTime": 1698765400000,
    "updateTime": 1698765432000
  }
}
```

**IMPORTANT**: 
- `data.state` poate fi: `waiting`, `queuing`, `generating`, `success`, `fail`
- `data.resultJson` este un JSON string care conține `resultUrls` cu URL-urile imaginilor
- Trebuie să parsezi `resultJson` pentru a obține URL-urile
- Când `state` este `waiting` sau `generating`, `resultJson` este gol (task-ul nu s-a terminat)
- Când `state` este `success`, `resultJson` conține URL-urile generate

### 7.5. Parse Result (Code Node)

**Tip**: Code
**Nume**: "Parse Result"

**IMPORTANT**: 
- Acest nod trebuie să fie după "Get Image1" și înainte de "Switch1"
- Parsează `resultJson` pentru a extrage URL-urile generate
- URL-urile sunt în `resultJson.resultUrls`, NU în `param`!

**Code**:
```javascript
const response = $input.item.json;

// Parse resultJson pentru a obține URL-urile generate
let imageUrls = [];
let firstImageUrl = null;

// Verifică dacă task-ul este completat (state === "success")
if (response.data?.state === "success" && response.data?.resultJson) {
  try {
    // resultJson este un JSON string, trebuie parsat
    const resultJson = JSON.parse(response.data.resultJson);
    
    // URL-urile generate sunt în resultUrls
    if (resultJson.resultUrls && Array.isArray(resultJson.resultUrls)) {
      imageUrls = resultJson.resultUrls;
      firstImageUrl = imageUrls.length > 0 ? imageUrls[0] : null;
    }
    
    // Dacă nu există resultUrls, verifică alte câmpuri posibile
    if (imageUrls.length === 0) {
      // Verifică dacă există direct image_url sau imageUrls
      if (resultJson.image_url) {
        imageUrls = [resultJson.image_url];
        firstImageUrl = resultJson.image_url;
      } else if (resultJson.imageUrls && Array.isArray(resultJson.imageUrls)) {
        imageUrls = resultJson.imageUrls;
        firstImageUrl = imageUrls.length > 0 ? imageUrls[0] : null;
      }
    }
  } catch (e) {
    console.error('Error parsing resultJson:', e);
    console.error('resultJson value:', response.data.resultJson);
  }
}

// Dacă task-ul este încă în procesare, resultJson va fi gol
// În acest caz, imageUrls va rămâne array gol și firstImageUrl va fi null

return [{
  json: {
    code: response.code,
    message: response.message,
    taskId: response.data?.taskId,
    state: response.data?.state,
    imageUrls: imageUrls,
    firstImageUrl: firstImageUrl,
    failCode: response.data?.failCode,
    failMsg: response.data?.failMsg,
    // Debug info
    hasResultJson: !!response.data?.resultJson,
    resultJsonLength: response.data?.resultJson?.length || 0
  }
}];
```

**IMPORTANT**: 
- URL-urile generate sunt în `resultJson.resultUrls` (când `state === "success"`)
- `param` conține doar parametrii originali trimisi (nu URL-urile generate)
- Când `state` este `waiting` sau `generating`, `resultJson` este gol → `firstImageUrl` va fi `null`
- Când `state` este `success`, `resultJson` conține URL-urile → `firstImageUrl` va fi setat

### 8. Switch1 (Switch Node)

**Tip**: Switch
**Mode**: Rules

**IMPORTANT**: 
- Folosește `state` din nodul "Parse Result", NU `status`!
- State values: `waiting`, `queuing`, `generating`, `success`, `fail`

**Rules**:

1. **Rule: success**
   - Condition: `{{ $json.state }}` equals `success`
   - Output: success

2. **Rule: generating**
   - Condition: `{{ $json.state }}` equals `generating` sau `queuing` sau `waiting`
   - Output: generating

3. **Rule: fail**
   - Condition: `{{ $json.state }}` equals `fail`
   - Output: fail

**Fallback Output**: generating (pentru cazuri neprevăzute, continuă polling)

### 9. Loop Back to Wait1 (pentru status "generating")

**Când statusul este "generating"**:
- Conectează output-ul "generating" de la Switch1 înapoi la nodul Wait1
- Limitează numărul de iterații (ex: max 20 de încercări = 100 secunde total)

**Setare Loop**:
- Max Iterations: 20
- Timeout: 300000ms (5 minute total)

### 10. Result1 (HTTP Response)

**Tip**: Respond to Webhook

**Pentru success** (format KIE.AI oficial):
```json
{
  "success": true,
  "image_url": "{{ $('Parse Result').item.json.firstImageUrl }}",
  "image_urls": "{{ $('Parse Result').item.json.imageUrls }}",
  "taskId": "{{ $('Parse Result').item.json.taskId }}",
  "state": "{{ $('Parse Result').item.json.state }}"
}
```

**IMPORTANT**: 
- Folosește nodul "Parse Result" pentru a accesa datele parse!
- `firstImageUrl` este primul URL din array-ul `resultUrls`
- `imageUrls` este array-ul complet cu toate URL-urile (dacă sunt multiple)

**Pentru fail**:
```json
{
  "success": false,
  "error": "{{ $('Parse Result').item.json.failMsg || $('Parse Result').item.json.message }}",
  "failCode": "{{ $('Parse Result').item.json.failCode }}",
  "taskId": "{{ $('Parse Result').item.json.taskId }}"
}
```

**NOTĂ**: 
- `failMsg` conține mesajul de eroare de la KIE.AI
- `failCode` conține codul de eroare (dacă există)

## Variabile de Mediu (Environment Variables)

Adaugă următoarele variabile în n8n:

1. `IMGBB_API_KEY` - Cheia API de la imgbb.com
   - Obține de la: https://api.imgbb.com/
   - Gratuit pentru 32MB/upload

2. `KIE_AI_API_KEY` - Cheia API de la KIE.AI
   - Obține de la: https://api.kie.ai/
   - Necesară pentru Nano Banana Pro

## Generare Text pentru Reclame

Pentru generarea de text, adaugă un nod suplimentar după "Edit Image":

**Nod: Generate Text (HTTP Request - OpenAI sau KIE.AI)**

**URL**: `https://api.kie.ai/api/v1/text/generate` (sau OpenAI API)

**Body**:
```json
{
  "model": "gpt-4" sau "nano-banana-text",
  "prompt": "Creează un text publicitar pentru: {{ $('On form submission').item.json.body.prompt }}",
  "max_tokens": 200,
  "temperature": 0.7
}
```

## Testare Workflow

1. Activează workflow-ul în n8n
2. Copiază URL-ul webhook-ului
3. Testează cu Postman sau curl:
```bash
curl -X POST https://your-n8n-instance.com/webhook/generate-ad \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Produs premium de ceai organic",
    "image": "data:image/jpeg;base64,..."
  }'
```

## Gestionare Erori

- **Timeout**: Mărește timeout-ul pentru nodurile HTTP Request
- **Rate Limiting**: Adaugă delay între request-uri dacă API-ul are limitări
- **Retry Logic**: Configurează retry automat pentru nodurile HTTP Request
- **Error Handling**: Adaugă noduri IF pentru a gestiona diferite tipuri de erori

## Optimizări

1. **Caching**: Cachează rezultatele pentru prompt-uri similare
2. **Batch Processing**: Procesează multiple imagini în paralel
3. **Webhook Retry**: Configurează retry pentru webhook-ul de răspuns
4. **Logging**: Adaugă logging pentru debugging

