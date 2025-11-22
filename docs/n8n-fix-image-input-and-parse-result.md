# Fix: image_input ca Array și Parse Result pentru resultUrls

## Probleme Identificate

1. **image_input trebuie să fie array** - KIE.AI așteaptă `image_input: ["url"]`, nu `image_url: "url"`
2. **Parse Result caută în locul greșit** - URL-urile generate sunt în `resultJson.resultUrls`, nu în `param`

## Soluție

### 1. Actualizează Nodul "Build KIE.AI Request"

**Code**:
```javascript
const prompt = $('Code').item.json.prompt || '';
const imageUrl = $input.item.json.data.url || '';
const options = $('Code').item.json.options || {};

// Validare
if (!prompt || prompt.trim() === '') {
  throw new Error('Prompt is required but is empty or null');
}

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

// Construiește JSON-ul în formatul KIE.AI
// IMPORTANT: image_input este array de URL-uri (până la 8 imagini)!
return [{
  json: {
    model: "nano-banana-pro",
    callBackUrl: "",
    input: {
      prompt: sanitizedPrompt,
      image_input: imageUrl ? [String(imageUrl).trim()] : [], // ✅ Array de URL-uri!
      aspect_ratio: aspectRatio,
      resolution: resolution,
      output_format: 'png'
    }
  }
}];
```

**IMPORTANT**: 
- `image_input` este un **array** de URL-uri: `["https://..."]`
- Poate conține până la 8 imagini
- Dacă nu ai imagine, folosește array gol: `[]`

### 2. Actualizează Nodul "Parse Result"

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
- Când `state` este `waiting` sau `generating`, `resultJson` este gol
- `firstImageUrl` va fi `null` până când task-ul este completat

## Structura Răspunsului KIE.AI

### Când task-ul este în procesare (`state: "waiting"` sau `"generating"`):
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "dd79fdae46128acdb707516f252195c5",
    "state": "waiting",
    "param": "{\"input\":{\"image_url\":\"https://...\",\"prompt\":\"...\"}}",
    "resultJson": "",  // Gol - task-ul nu s-a terminat
    "failCode": null,
    "failMsg": null
  }
}
```

### Când task-ul este completat (`state: "success"`):
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "dd79fdae46128acdb707516f252195c5",
    "state": "success",
    "param": "{\"input\":{\"image_input\":[\"https://...\"],\"prompt\":\"...\"}}",
    "resultJson": "{\"resultUrls\":[\"https://generated-image-url.jpg\"]}",  // ✅ Aici sunt URL-urile!
    "failCode": null,
    "failMsg": null
  }
}
```

## Flow Complet

1. **Build KIE.AI Request** → Trimite `image_input: ["url"]` (array)
2. **Edit Image (HTTP Request)** → Creează task-ul KIE.AI
3. **Wait1** → Așteaptă 5 secunde
4. **Get Image1** → Verifică statusul task-ului
5. **Parse Result** → Parsează `resultJson` și extrage `resultUrls`
6. **Switch1** → Verifică `state`:
   - `success` → Continuă la Result1
   - `waiting`/`generating` → Loop înapoi la Wait1
   - `fail` → Returnează eroare
7. **Result1** → Returnează `firstImageUrl` către Next.js

## Verificare

După ce actualizezi ambele noduri:

1. ✅ Verifică că "Build KIE.AI Request" trimite `image_input: ["url"]` (array)
2. ✅ Verifică că "Parse Result" parsează `resultJson` când `state === "success"`
3. ✅ Verifică că `firstImageUrl` este setat corect când task-ul este completat
4. ✅ Verifică că workflow-ul așteaptă până când `state === "success"` înainte de a returna rezultatul

## Debugging

Dacă `firstImageUrl` este încă `null`:

1. **Verifică output-ul "Get Image1"**:
   - `state` trebuie să fie `"success"`
   - `resultJson` trebuie să conțină un JSON string cu `resultUrls`

2. **Verifică output-ul "Parse Result"**:
   - `hasResultJson` trebuie să fie `true`
   - `resultJsonLength` trebuie să fie > 0
   - `imageUrls` trebuie să fie un array cu cel puțin un URL
   - `firstImageUrl` trebuie să fie un URL valid

3. **Dacă `resultJson` este gol**:
   - Task-ul nu s-a terminat încă → Așteaptă mai mult sau verifică că loop-ul funcționează
   - Task-ul a eșuat → Verifică `failCode` și `failMsg`

