# Fix: Eroare 422 "The input cannot be null" la KIE.AI

## Problema

KIE.AI API returnează eroarea:
```json
{
  "code": 422,
  "msg": "The input cannot be null",
  "data": null
}
```

Aceasta înseamnă că unul dintre parametrii trimiși este `null` sau `undefined`.

## Cauze posibile

1. `prompt` este null sau gol
2. `image_url` este null sau gol
3. Unul din parametrii numerici (`width`, `height`, etc.) este null
4. Format JSON invalid

## Soluție: Verifică și validează datele

### Pas 1: Adaugă nod Code înainte de "Edit Image" pentru validare

**Nume nod**: "Validate KIE.AI Data"

**Code**:
```javascript
const prompt = $('Code').item.json.prompt || '';
const imageUrl = $input.item.json.data.url || '';
const options = $('Code').item.json.options || {};

// Validare
if (!prompt) {
  throw new Error('Prompt is required but is empty or null');
}

if (!imageUrl) {
  throw new Error('Image URL is required but is empty or null');
}

// Construiește JSON-ul cu valori validate
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

### Pas 2: Actualizează nodul "Edit Image"

Dacă folosești nodul Code de validare:
- **Body Content Type**: JSON
- **Specify Body**: Using JSON
- **Body**: `={{ JSON.stringify($json) }}`

SAU folosește "Using Fields Below" și mapează câmpurile.

### Pas 3: Verifică ce date primește KIE.AI

Adaugă un nod Code după "Edit Image" pentru debugging (dacă primești eroare):

```javascript
return [{
  json: {
    response: $input.item.json,
    code: $input.item.json.code,
    message: $input.item.json.msg,
    hasData: !!$input.item.json.data
  }
}];
```

## Verificare rapidă: Ce parametri sunt null?

Adaugă un nod Code înainte de "Edit Image" pentru debugging:

```javascript
const prompt = $('Code').item.json.prompt;
const imageUrl = $input.item.json.data?.url;
const options = $('Code').item.json.options;

return [{
  json: {
    prompt: prompt,
    promptIsNull: prompt === null,
    promptIsEmpty: !prompt,
    imageUrl: imageUrl,
    imageUrlIsNull: imageUrl === null,
    imageUrlIsEmpty: !imageUrl,
    options: options,
    optionsWidth: options?.width,
    optionsHeight: options?.height,
    widthIsNull: options?.width === null,
    heightIsNull: options?.height === null
  }
}];
```

Aceasta îți va arăta exact ce parametri sunt null.

## Soluții comune

### Problema 1: `prompt` este null

**Soluție**: Verifică că nodul Code extrage corect prompt-ul:
```javascript
const prompt = $('Code').item.json.prompt || $('Webhook').item.json.body.prompt || '';
```

### Problema 2: `image_url` este null

**Soluție**: Verifică că nodul "Get URL" returnează corect URL-ul:
```javascript
const imageUrl = $input.item.json.data?.url || '';
if (!imageUrl) {
  throw new Error('Image URL is missing from imgbb response');
}
```

### Problema 3: Parametri numerici sunt null

**Soluție**: Folosește valori default:
```javascript
width: options.width || 1024,  // NU: options.width (poate fi null)
height: options.height || 1024,
```

### Problema 4: JSON invalid

**Soluție**: Folosește nodul Code pentru a construi JSON-ul corect:
```javascript
return [{
  json: {
    model: "nano-banana-pro",
    prompt: String(prompt), // Asigură-te că este string
    image_url: String(imageUrl), // Asigură-te că este string
    negative_prompt: String(options.negative_prompt || 'blurry, low quality, distorted'),
    width: Number(options.width || 1024), // Asigură-te că este număr
    height: Number(options.height || 1024),
    num_inference_steps: Number(options.num_inference_steps || 20),
    guidance_scale: Number(options.guidance_scale || 7.5)
  }
}];
```

## Verificare finală

După ce aplici fix-urile, verifică că:
1. ✅ `prompt` nu este null sau gol
2. ✅ `image_url` nu este null sau gol
3. ✅ Toți parametrii numerici sunt numere valide (nu null)
4. ✅ JSON-ul este valid și bine formatat

