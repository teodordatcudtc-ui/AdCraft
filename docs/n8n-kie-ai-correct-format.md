# Format Corect KIE.AI API - Conform Documentației

## Format Oficial KIE.AI API

Conform documentației KIE.AI, formatul corect este:

```json
{
  "model": "nano-banana-pro",
  "callBackUrl": "https://your-domain.com/api/callback",
  "input": {
    "prompt": "Your prompt here",
    "aspect_ratio": "1:1",
    "resolution": "1K",
    "output_format": "png"
  }
}
```

### Dacă editezi o imagine existentă:
```json
{
  "model": "nano-banana-pro",
  "callBackUrl": "",
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

## Configurare n8n

### Nod Code: "Build KIE.AI Request"

**Code**:
```javascript
const prompt = $('Code').item.json.prompt || '';
const imageUrl = $input.item.json.data.url || '';
const options = $('Code').item.json.options || {};

// Validare
if (!prompt || prompt.trim() === '') {
  throw new Error('Prompt is required but is empty or null');
}

// Construiește JSON-ul în formatul KIE.AI
// IMPORTANT: Conform documentației KIE.AI, image_input este array de URL-uri!
return [{
  json: {
    model: "nano-banana-pro",
    callBackUrl: "", // Opțional - poate fi gol sau URL-ul tău
    input: {
      prompt: String(prompt).trim(),
      image_input: imageUrl ? [String(imageUrl).trim()] : [], // Array de URL-uri (până la 8)
      aspect_ratio: options.aspect_ratio || '1:1',
      resolution: '1K', // Opțiuni: "1K", "2K", etc.
      output_format: 'png' // Opțiuni: "png", "jpg", etc.
    }
  }
}];
```

### Nod "Edit Image" (HTTP Request1)

- **URL**: `https://api.kie.ai/api/v1/jobs/createTask`
- **Method**: POST
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer {{ $env.KIE_AI_API_KEY }}`
- **Body Content Type**: JSON
- **Specify Body**: Using JSON
- **Body**: `={{ JSON.stringify($json) }}`

## Aspect Ratio Mapping

Maparea aspect ratio-urilor din Next.js la KIE.AI:

- `1:1` → `"1:1"` (Square)
- `16:9` → `"16:9"` (Landscape)
- `9:16` → `"9:16"` (Portrait)
- `4:3` → `"4:3"` (Classic Landscape)
- `3:4` → `"3:4"` (Classic Portrait)

## Resolution Options

KIE.AI folosește `resolution` în loc de width/height:
- `"1K"` - Rezoluție standard
- `"2K"` - Rezoluție înaltă
- Verifică documentația pentru alte opțiuni

## Output Format

- `"png"` - PNG format
- `"jpg"` sau `"jpeg"` - JPEG format
- Verifică documentația pentru alte formate

## Răspuns Așteptat

După request, KIE.AI ar trebui să returneze:
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "job_id": "job_123456",
    "status": "processing"
  }
}
```

## Verificare

După ce aplici formatul corect:
1. ✅ `model` este la nivel superior
2. ✅ `input` object conține toate datele
3. ✅ `aspect_ratio` este folosit (NU width/height)
4. ✅ `resolution` este setat
5. ✅ `output_format` este setat
6. ✅ `image_input` este un **array** de URL-uri (NU string, NU `image_url`)
7. ✅ `image_input` poate fi array gol `[]` dacă nu ai imagini de input

