# Referințe Corecte pentru Nodul "Edit Image"

## Input-ul din "Get URL" (imgbb)

Input-ul conține doar:
```json
{
  "data": {
    "url": "https://i.ibb.co/...",
    ...
  },
  "success": true,
  "status": 200
}
```

**NU conține**: `prompt`, `options` - acestea sunt în nodurile anterioare!

## Structura Workflow

```
Webhook → Code (Extract Base64) → Get URL (imgbb) → Edit Image (KIE.AI)
```

## Expresii Corecte pentru "Edit Image"

### Opțiunea 1: Referințe la nodul Code

Dacă nodul Code se numește "Code" (sau "Extract Base64"):

```json
{
  "model": "nano-banana-pro",
  "prompt": "{{ $('Code').item.json.prompt }}",
  "image_url": "{{ $json.data.url }}",
  "negative_prompt": "{{ $('Code').item.json.options.negative_prompt }}",
  "width": {{ $('Code').item.json.options.width }},
  "height": {{ $('Code').item.json.options.height }},
  "num_inference_steps": {{ $('Code').item.json.options.num_inference_steps }},
  "guidance_scale": {{ $('Code').item.json.options.guidance_scale }}
}
```

### Opțiunea 2: Referințe la Webhook

Dacă vrei să accesezi direct din Webhook:

```json
{
  "model": "nano-banana-pro",
  "prompt": "{{ $('Webhook').item.json.body.prompt }}",
  "image_url": "{{ $json.data.url }}",
  "negative_prompt": "{{ $('Webhook').item.json.body.options.negative_prompt }}",
  "width": {{ $('Webhook').item.json.body.options.width }},
  "height": {{ $('Webhook').item.json.body.options.height }},
  "num_inference_steps": {{ $('Webhook').item.json.body.options.num_inference_steps }},
  "guidance_scale": {{ $('Webhook').item.json.body.options.guidance_scale }}
}
```

## Verificare: Ce nume are nodul Code?

1. Click pe nodul Code din workflow
2. Verifică numele exact (ex: "Code", "Extract Base64", "Convert Image", etc.)
3. Folosește numele exact în expresie: `{{ $('Nume Exact').item.json.prompt }}`

## Soluție Recomandată: Nod Code pentru Construire JSON

Cel mai sigur mod - adaugă un nod Code între "Get URL" și "Edit Image":

### Nod Code: "Build KIE.AI Request"

**Code**:
```javascript
// Accesează datele din nodurile anterioare
const codeData = $('Code').item.json;
const getUrlData = $input.item.json;

// Extrage valorile
const prompt = codeData.prompt || '';
const imageUrl = getUrlData.data.url || '';
const options = codeData.options || {};

// Construiește JSON-ul pentru KIE.AI
return [{
  json: {
    model: "nano-banana-pro",
    prompt: prompt,
    image_url: imageUrl,
    negative_prompt: options.negative_prompt || 'blurry, low quality, distorted',
    width: options.width || 1024,
    height: options.height || 1024,
    num_inference_steps: options.num_inference_steps || 20,
    guidance_scale: options.guidance_scale || 7.5
  }
}];
```

### Apoi în nodul "Edit Image":

- **Body Content Type**: JSON
- **Specify Body**: Using JSON
- **Body**: `={{ JSON.stringify($json) }}`

SAU

- **Body Content Type**: JSON
- **Specify Body**: Using Fields Below
- Mapează câmpurile din JSON-ul generat

## Debugging: Verifică ce date ai

Adaugă un nod Code după "Get URL" pentru debugging:

```javascript
return [{
  json: {
    // Date din Get URL (nodul anterior)
    imageUrl: $input.item.json.data.url,
    
    // Date din Code
    codePrompt: $('Code').item.json.prompt,
    codeOptions: $('Code').item.json.options,
    
    // Date din Webhook
    webhookPrompt: $('Webhook').item.json.body?.prompt,
    webhookOptions: $('Webhook').item.json.body?.options,
    
    // Verificare disponibilitate
    hasCode: !!$('Code'),
    hasWebhook: !!$('Webhook'),
    codeNodeName: $('Code') ? 'Code exists' : 'Code not found'
  }
}];
```

Aceasta îți va arăta exact ce date sunt disponibile și de unde.

## Erori Comune

### Eroare: `[Referenced node doesn't exist]`
- Verifică numele exact al nodului
- Asigură-te că nodul este conectat în workflow
- Verifică că nu există erori în nodurile anterioare

### Eroare: `[undefined]`
- Verifică că câmpul există în nodul referit
- Folosește debugging pentru a vedea structura datelor
- Adaugă valori default: `{{ $('Code').item.json.prompt || '' }}`

### Eroare: JSON invalid
- Verifică că numerele nu au ghilimele: `{{ $json.options.width }}` (NU `"{{ $json.options.width }}"`)
- Verifică că string-urile au ghilimele: `"{{ $json.prompt }}"`
- Folosește nodul Code pentru a construi JSON-ul corect

