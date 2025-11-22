# Fix: Expresii [undefined] în nodul "Edit Image"

## Problema

În nodul "Edit Image", expresiile returnează `[undefined]` sau `[Referenced node doesn't exist]`:
- `$json.prompt` → `[undefined]`
- `$json.options.*` → `[undefined]`
- `$('Get URL').item.json.data.url` → `[Referenced node doesn't exist]`

## Cauză

Nodul "Edit Image" primește date din nodul "Get URL" (imgbb), care returnează doar:
```json
{
  "data": {
    "url": "https://i.ibb.co/...",
    ...
  }
}
```

Nu conține `prompt` sau `options` - acestea sunt în nodurile anterioare (Webhook sau Code).

## Soluție: Folosește referințe corecte la noduri

### Structura workflow-ului:
```
Webhook → Code (Extract Base64) → Get URL (imgbb) → Edit Image (KIE.AI)
```

### Expresii corecte pentru nodul "Edit Image":

**Body JSON corectat**:
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

**Sau dacă vrei să folosești direct Webhook**:
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

## Soluție recomandată: Nod Code pentru construire JSON

Cel mai sigur mod este să construiești JSON-ul într-un nod Code înainte de "Edit Image":

### Adaugă nod Code între "Get URL" și "Edit Image"

**Nume nod**: "Build KIE.AI Request"

**Code**:
```javascript
const prompt = $('Code').item.json.prompt || $('Webhook').item.json.body.prompt || '';
const imageUrl = $input.item.json.data.url || '';
const options = $('Code').item.json.options || $('Webhook').item.json.body.options || {};

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
- **Specify Body**: Using Fields Below
- Mapează câmpurile din JSON-ul generat

SAU

- **Body Content Type**: JSON
- **Specify Body**: Using JSON
- **Body**: `={{ JSON.stringify($json) }}`

## Verificare: Debug ce date ai

Adaugă un nod Code după "Get URL" pentru debugging:

```javascript
return [{
  json: {
    // Date din Get URL
    imageUrl: $input.item.json.data?.url,
    
    // Date din Code
    codePrompt: $('Code').item.json.prompt,
    codeOptions: $('Code').item.json.options,
    
    // Date din Webhook
    webhookPrompt: $('Webhook').item.json.body?.prompt,
    webhookOptions: $('Webhook').item.json.body?.options,
    
    // Verificare noduri
    hasCode: !!$('Code'),
    hasWebhook: !!$('Webhook'),
    hasGetUrl: !!$input.item.json.data
  }
}];
```

Aceasta îți va arăta exact ce date sunt disponibile și de unde.

## Verificare nume noduri

Asigură-te că numele nodurilor sunt exacte:
- Dacă nodul Code se numește "Extract Base64", folosește: `{{ $('Extract Base64').item.json.prompt }}`
- Dacă nodul Webhook se numește "On form submission", folosește: `{{ $('On form submission').item.json.body.prompt }}`

Verifică numele exacte în workflow și folosește-le în expresii.

