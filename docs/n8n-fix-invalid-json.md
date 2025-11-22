# Fix: "JSON parameter needs to be valid JSON" în n8n

## Problema

Eroarea apare când body-ul JSON nu este valid. Cauze posibile:
1. Expresiile nu sunt evaluate corect
2. Câmpuri goale sau null
3. Format JSON invalid (virgule, ghilimele)

## Soluție: Verifică și corectează Body JSON

### Pas 1: Verifică formatul Body în nodul "Edit Image"

În nodul HTTP Request (Edit Image), asigură-te că:
- **Body Content Type**: JSON
- **Specify Body**: Using JSON (nu "Using Fields Below")

### Pas 2: Body JSON corect

**Body JSON complet**:
```json
{
  "model": "nano-banana-pro",
  "prompt": "{{ $('Webhook').item.json.body.prompt }}",
  "image_url": "{{ $json.data.url }}",
  "negative_prompt": "blurry, low quality, distorted",
  "width": 1024,
  "height": 1024,
  "num_inference_steps": 20,
  "guidance_scale": 7.5
}
```

### Pas 3: Verifică dacă expresiile sunt evaluate

Adaugă un nod Code înainte de "Edit Image" pentru a verifica datele:

```javascript
return [{
  json: {
    prompt: $('Webhook').item.json.body.prompt,
    imageUrl: $input.item.json.data?.url,
    hasPrompt: !!$('Webhook').item.json.body.prompt,
    hasImageUrl: !!$input.item.json.data?.url,
    promptType: typeof $('Webhook').item.json.body.prompt,
    imageUrlType: typeof $input.item.json.data?.url
  }
}];
```

Aceasta îți va arăta dacă expresiile returnează valori valide.

## Soluții comune

### Problema 1: Expresii care returnează undefined

Dacă `prompt` sau `image_url` sunt undefined, JSON-ul devine invalid.

**Soluție**: Adaugă valori default:

```json
{
  "model": "nano-banana-pro",
  "prompt": "{{ $('Webhook').item.json.body.prompt || 'default prompt' }}",
  "image_url": "{{ $json.data.url || '' }}",
  "negative_prompt": "blurry, low quality, distorted",
  "width": 1024,
  "height": 1024,
  "num_inference_steps": 20,
  "guidance_scale": 7.5
}
```

### Problema 2: Ghilimele în prompt

Dacă prompt-ul conține ghilimele, JSON-ul devine invalid.

**Soluție**: Folosește nodul Code pentru a escapa JSON-ul:

```javascript
const prompt = $('Webhook').item.json.body.prompt || '';
const imageUrl = $input.item.json.data?.url || '';

return [{
  json: {
    model: "nano-banana-pro",
    prompt: prompt,
    image_url: imageUrl,
    negative_prompt: "blurry, low quality, distorted",
    width: 1024,
    height: 1024,
    num_inference_steps: 20,
    guidance_scale: 7.5
  }
}];
```

Apoi în nodul "Edit Image", folosește "Using Fields Below" și mapează câmpurile.

### Problema 3: Format JSON invalid

**Verificare**: Copiază body-ul JSON într-un validator JSON online pentru a verifica dacă este valid.

## Soluție recomandată: Folosește nodul Code

Cel mai sigur mod este să construiești JSON-ul în nodul Code:

### Nod Code înainte de "Edit Image"

```javascript
const prompt = $('Webhook').item.json.body.prompt || '';
const imageUrl = $input.item.json.data?.url || '';

if (!prompt || !imageUrl) {
  throw new Error(`Missing required fields: prompt=${!!prompt}, imageUrl=${!!imageUrl}`);
}

return [{
  json: {
    model: "nano-banana-pro",
    prompt: prompt,
    image_url: imageUrl,
    negative_prompt: "blurry, low quality, distorted",
    width: 1024,
    height: 1024,
    num_inference_steps: 20,
    guidance_scale: 7.5
  }
}];
```

### Apoi în nodul "Edit Image"

- **Body Content Type**: JSON
- **Specify Body**: Using Fields Below
- Mapează câmpurile din JSON-ul generat

SAU

- **Body Content Type**: JSON
- **Specify Body**: Using JSON
- **Body**: `={{ JSON.stringify($json) }}`

## Debugging

Adaugă un nod Code după "Get URL" pentru a verifica datele:

```javascript
return [{
  json: {
    hasData: !!$input.item.json.data,
    hasUrl: !!$input.item.json.data?.url,
    url: $input.item.json.data?.url,
    fullResponse: $input.item.json
  }
}];
```

Aceasta îți va arăta exact ce date primești de la imgbb.

