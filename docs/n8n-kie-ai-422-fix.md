# Fix: Eroare 422 "The input cannot be null" la KIE.AI

## Problema

Primești eroarea 422 chiar dacă toate datele par să fie prezente:
```json
{
  "code": 422,
  "msg": "The input cannot be null",
  "data": null
}
```

## Cauze posibile

1. **Format JSON greșit** - API-ul așteaptă un format diferit (ex: `input` object, `task` object)
2. **Câmpuri obligatorii lipsă** - Există câmpuri required care nu sunt trimise
3. **Valori null** - Unele valori sunt `null` în loc de valori valide
4. **Endpoint greșit** - URL-ul nu este corect pentru acțiunea dorită

## Soluție: Verifică formatul exact al API-ului KIE.AI

### Pas 1: Verifică documentația KIE.AI

1. Accesează dashboard-ul KIE.AI sau documentația API
2. Verifică endpoint-ul exact pentru generare/editare imagini
3. Verifică formatul exact al request-ului

### Pas 2: Format posibil cu `input` object

Dacă API-ul așteaptă un `input` object, actualizează Body JSON:

```json
{
  "input": {
    "model": "nano-banana-pro",
    "prompt": "{{ $('Code').item.json.prompt }}",
    "image_url": "{{ $json.data.url }}",
    "negative_prompt": "{{ $('Code').item.json.options.negative_prompt }}",
    "width": {{ $('Code').item.json.options.width }},
    "height": {{ $('Code').item.json.options.height }},
    "num_inference_steps": {{ $('Code').item.json.options.num_inference_steps }},
    "guidance_scale": {{ $('Code').item.json.options.guidance_scale }}
  }
}
```

### Pas 3: Format posibil cu `task` object

```json
{
  "task": {
    "type": "image_edit",
    "model": "nano-banana-pro",
    "prompt": "{{ $('Code').item.json.prompt }}",
    "image_url": "{{ $json.data.url }}",
    "negative_prompt": "{{ $('Code').item.json.options.negative_prompt }}",
    "width": {{ $('Code').item.json.options.width }},
    "height": {{ $('Code').item.json.options.height }},
    "num_inference_steps": {{ $('Code').item.json.options.num_inference_steps }},
    "guidance_scale": {{ $('Code').item.json.options.guidance_scale }}
  }
}
```

### Pas 4: Soluție recomandată - Nod Code pentru construire JSON

Construiește JSON-ul în nodul Code pentru mai mult control:

**Nume nod**: "Build KIE.AI Request"

**Code**:
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

// Construiește JSON-ul în formatul așteptat de KIE.AI
// Încearcă fiecare format posibil până găsești cel corect

// Format 1: Direct (fără wrapper)
return [{
  json: {
    model: "nano-banana-pro",
    prompt: String(prompt).trim(),
    image_url: String(imageUrl).trim(),
    negative_prompt: String(options.negative_prompt || 'blurry, low quality, distorted').trim(),
    width: Number(options.width || 1024),
    height: Number(options.height || 1024),
    num_inference_steps: Number(options.num_inference_steps || 20),
    guidance_scale: Number(options.guidance_scale || 7.5)
  }
}];

// SAU Format 2: Cu input wrapper (comentează formatul 1 și de-comentează acesta)
/*
return [{
  json: {
    input: {
      model: "nano-banana-pro",
      prompt: String(prompt).trim(),
      image_url: String(imageUrl).trim(),
      negative_prompt: String(options.negative_prompt || 'blurry, low quality, distorted').trim(),
      width: Number(options.width || 1024),
      height: Number(options.height || 1024),
      num_inference_steps: Number(options.num_inference_steps || 20),
      guidance_scale: Number(options.guidance_scale || 7.5)
    }
  }
}];
*/
```

### Pas 5: Verifică Headers

Asigură-te că Headers sunt setate corect:
- `Content-Type: application/json`
- `Authorization: Bearer {{ $env.KIE_AI_API_KEY }}`

## Testare: Verifică ce trimite n8n

Adaugă un nod Code după "Edit Image" pentru a vedea exact ce s-a trimis:

```javascript
return [{
  json: {
    requestBody: $('Edit Image').item.json, // Dacă ai salvat request-ul
    response: $input.item.json,
    statusCode: $input.item.statusCode,
    error: $input.item.json.msg
  }
}];
```

## Contactează suportul KIE.AI

Dacă niciun format nu funcționează:
1. Contactează suportul KIE.AI
2. Cere formatul exact al request-ului pentru endpoint-ul `/api/v1/jobs/createTask`
3. Cere exemple de request-uri care funcționează

## Verificare finală

După ce aplici fix-urile:
1. ✅ Formatul JSON este corect pentru KIE.AI API
2. ✅ Toate câmpurile sunt non-null și validate
3. ✅ Headers-urile sunt setate corect
4. ✅ Endpoint-ul este corect

