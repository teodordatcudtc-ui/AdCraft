# Format Corect pentru KIE.AI API

## Problema: Eroare 422 "The input cannot be null"

KIE.AI API returnează eroarea 422 când unul dintre câmpurile obligatorii este null sau formatul este greșit.

## Verificare: Ce endpoint folosește KIE.AI?

Verifică documentația KIE.AI pentru endpoint-ul corect. Poate fi:
- `/api/v1/jobs/createTask`
- `/api/v1/image/edit`
- `/api/v1/image/generate`
- Alt endpoint specific

## Format posibil pentru KIE.AI API

### Opțiunea 1: Format cu `task` object

```json
{
  "task": {
    "type": "image_edit",
    "model": "nano-banana-pro",
    "prompt": "fa un banner de reclama pentru produsul atasat",
    "image_url": "https://i.ibb.co/...",
    "negative_prompt": "blurry, low quality, distorted",
    "width": 1080,
    "height": 1920,
    "num_inference_steps": 20,
    "guidance_scale": 7.5
  }
}
```

### Opțiunea 2: Format direct (fără `task`)

```json
{
  "model": "nano-banana-pro",
  "prompt": "fa un banner de reclama pentru produsul atasat",
  "image_url": "https://i.ibb.co/...",
  "negative_prompt": "blurry, low quality, distorted",
  "width": 1080,
  "height": 1920,
  "num_inference_steps": 20,
  "guidance_scale": 7.5
}
```

### Opțiunea 3: Format cu `input` object

```json
{
  "input": {
    "model": "nano-banana-pro",
    "prompt": "fa un banner de reclama pentru produsul atasat",
    "image_url": "https://i.ibb.co/...",
    "negative_prompt": "blurry, low quality, distorted",
    "width": 1080,
    "height": 1920,
    "num_inference_steps": 20,
    "guidance_scale": 7.5
  }
}
```

## Soluție: Verifică documentația KIE.AI

1. **Accesează documentația KIE.AI**: https://api.kie.ai/docs sau dashboard-ul tău
2. **Verifică endpoint-ul exact**: Ce URL folosește pentru generare/editare imagini?
3. **Verifică formatul request-ului**: Ce structură JSON așteaptă?
4. **Verifică câmpurile obligatorii**: Ce câmpuri sunt required?

## Debugging: Verifică ce trimite API-ul

Adaugă un nod Code după "Edit Image" pentru a vedea răspunsul complet:

```javascript
return [{
  json: {
    statusCode: $input.item.statusCode,
    response: $input.item.json,
    code: $input.item.json.code,
    message: $input.item.json.msg,
    data: $input.item.json.data,
    fullResponse: $input.item
  }
}];
```

Aceasta îți va arăta exact ce returnează API-ul.

## Soluție temporară: Testează cu Postman

Testează direct API-ul KIE.AI cu Postman pentru a verifica formatul corect:

```bash
curl -X POST https://api.kie.ai/api/v1/jobs/createTask \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "model": "nano-banana-pro",
    "prompt": "test",
    "image_url": "https://example.com/image.jpg",
    "width": 1024,
    "height": 1024
  }'
```

Compară formatul care funcționează în Postman cu cel din n8n.

## Verificare: Toate câmpurile sunt non-null?

Adaugă validare în nodul Code înainte de "Edit Image":

```javascript
const prompt = $('Code').item.json.prompt || '';
const imageUrl = $input.item.json.data.url || '';
const options = $('Code').item.json.options || {};

// Validare strictă
if (!prompt || prompt.trim() === '') {
  throw new Error('Prompt cannot be null or empty');
}

if (!imageUrl || imageUrl.trim() === '') {
  throw new Error('Image URL cannot be null or empty');
}

// Asigură-te că toate valorile sunt non-null
return [{
  json: {
    model: "nano-banana-pro",
    prompt: String(prompt).trim(), // Asigură-te că este string non-empty
    image_url: String(imageUrl).trim(), // Asigură-te că este string non-empty
    negative_prompt: String(options.negative_prompt || 'blurry, low quality, distorted').trim(),
    width: Number(options.width || 1024), // Asigură-te că este număr
    height: Number(options.height || 1024),
    num_inference_steps: Number(options.num_inference_steps || 20),
    guidance_scale: Number(options.guidance_scale || 7.5)
  }
}];
```

## Verificare finală

După ce aplici fix-urile:
1. ✅ Toate câmpurile sunt non-null
2. ✅ Formatul JSON este corect pentru KIE.AI API
3. ✅ Endpoint-ul este corect
4. ✅ Headers-urile sunt setate corect (Content-Type, Authorization)

