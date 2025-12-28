# Setup Final KIE.AI - Format Corect

## Format Oficial KIE.AI API

Conform documentației KIE.AI:

```json
{
  "model": "nano-banana-pro",
  "callBackUrl": "https://your-domain.com/api/callback",
  "input": {
    "prompt": "Your prompt here",
    "image_input": ["https://i.ibb.co/..."],  // Array de URL-uri (până la 8 imagini)
    "aspect_ratio": "1:1",
    "resolution": "1K",
    "output_format": "png"
  }
}
```

**IMPORTANT**: Conform documentației KIE.AI:
- Parametrul se numește `image_input` (NU `image_url`)
- Este un **array** de URL-uri, nu string
- Poate conține până la 8 imagini
- Este opțional (poate fi array gol `[]`)

## Configurare Completă n8n

### 1. Nod Code: "Build KIE.AI Request"

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

// Construiește JSON-ul în formatul KIE.AI
// IMPORTANT: Conform documentației KIE.AI, image_input este array de URL-uri!
return [{
  json: {
    model: "nano-banana-pro",
    callBackUrl: "", // Opțional - lasă gol sau adaugă URL-ul tău
    input: {
      prompt: String(prompt).trim(),
      image_input: imageUrl ? [String(imageUrl).trim()] : [], // Array de URL-uri (până la 8)
      aspect_ratio: options.aspect_ratio || '1:1',
      resolution: '1K', // Opțiuni: "1K", "2K"
      output_format: 'png' // Opțiuni: "png", "jpg"
    }
  }
}];
```

### 2. Nod "Edit Image" (HTTP Request1)

- **URL**: `https://api.kie.ai/api/v1/jobs/createTask`
- **Method**: POST
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer {{ $env.KIE_AI_API_KEY }}`
- **Body Content Type**: JSON
- **Specify Body**: Using JSON
- **Body**: `={{ JSON.stringify($json) }}`

### 3. Nod "Get Image1" (HTTP Request2)

- **URL**: `https://api.kie.ai/api/v1/jobs/{{ $json.data.taskId }}`
- **Method**: GET
- **Headers**:
  - `Authorization: Bearer {{ $env.KIE_AI_API_KEY }}`

**IMPORTANT**: 
- KIE.AI returnează `taskId` și `recordId`, NU `job_id`!
- Folosește `{{ $json.data.taskId }}` sau `{{ $json.data.recordId }}`
- Răspunsul KIE.AI are structura: `{ "code": 200, "data": { "taskId": "...", "recordId": "..." } }`
- Verifică documentația KIE.AI pentru endpoint-ul exact (poate fi `/api/v1/jobs/{taskId}` sau `/api/v1/tasks/{taskId}`)

## Răspuns KIE.AI

### După "Edit Image" (createTask):
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
- Ambele par să fie identice, deci poți folosi oricare

### După "Get Image1" (getJobStatus):
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "2f6131d977805e8de00fd18edbb318b9",
    "status": "completed",
    "result": {
      "image_url": "https://...",
      "metadata": {...}
    }
  }
}
```

**NOTĂ**: Verifică documentația KIE.AI pentru structura exactă a răspunsului

## Aspect Ratio Mapping

Maparea din Next.js la KIE.AI:
- `1:1` → `"1:1"` ✅
- `16:9` → `"16:9"` ✅
- `9:16` → `"9:16"` ✅
- `4:3` → `"4:3"` ✅

## Resolution Options

- `"1K"` - Rezoluție standard (recomandat)
- `"2K"` - Rezoluție înaltă (dacă este disponibil)
- Verifică documentația KIE.AI pentru alte opțiuni

## Output Format

- `"png"` - PNG format (recomandat)
- `"jpg"` sau `"jpeg"` - JPEG format
- Verifică documentația pentru alte formate

## Verificare Finală

După configurare:
1. ✅ Format JSON este corect (cu `input` object)
2. ✅ `aspect_ratio` este folosit (NU width/height)
3. ✅ `resolution` este setat
4. ✅ `output_format` este setat
5. ✅ `image_input` este un **array** de URL-uri (NU string, NU `image_url`)
6. ✅ `image_input` poate fi array gol `[]` dacă nu ai imagini de input
7. ✅ Headers sunt setate corect

