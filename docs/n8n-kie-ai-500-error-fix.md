# Fix: Eroare 500 "Server exception" la KIE.AI

## Problema

Primești eroarea 500 de la KIE.AI:
```json
{
  "code": 500,
  "msg": "Server exception, please try again later or contact customer service",
  "data": null
}
```

## Cauze Principale

### 1. ❌ Format greșit: `image_input` ca string în loc de array

**GREȘIT**:
```json
{
  "input": {
    "image_input": "https://..."  // ❌ GREȘIT! Trebuie să fie array!
  }
}
```

**CORECT**:
```json
{
  "input": {
    "image_input": ["https://..."]  // ✅ CORECT! Array de URL-uri!
  }
}
```

**IMPORTANT**: Conform documentației KIE.AI:
- Parametrul se numește `image_input` (NU `image_url`)
- Este un **array** de URL-uri, nu un string simplu
- Poate conține până la 8 imagini
- Este opțional (poate fi array gol `[]`)

### 2. Prompt-ul conține caractere speciale sau text în română

KIE.AI poate avea probleme cu:
- Textul în română (diacritice, caractere speciale)
- Prompt-uri prea lungi
- Caractere speciale neașteptate

### 3. URL-ul imaginii este invalid sau inaccesibil

Verifică că:
- URL-ul este accesibil public
- URL-ul este valid (nu expirat, nu 404)
- Formatul este corect (https://...)

### 4. Parametrii invalizi

Verifică că:
- `resolution` este valid: "1K" sau "2K" (nu alte valori)
- `aspect_ratio` este valid: "1:1", "16:9", "9:16", "4:3"
- `output_format` este valid: "png" sau "jpg"

## Soluție

### Pasul 1: Actualizează nodul "Build KIE.AI Request"

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
// IMPORTANT: Conform documentației KIE.AI, image_input este array de URL-uri!
return [{
  json: {
    model: "nano-banana-pro",
    callBackUrl: "", // Opțional - lasă gol sau adaugă URL-ul tău
    input: {
      prompt: sanitizedPrompt,
      image_input: imageUrl ? [String(imageUrl).trim()] : [], // ✅ CORECT: image_input este array!
      aspect_ratio: aspectRatio,
      resolution: resolution,
      output_format: 'png'
    }
  }
}];
```

### Pasul 2: Verifică URL-ul imaginii

Adaugă un nod Code înainte de "Build KIE.AI Request" pentru a valida URL-ul:

**Code** (opțional - pentru debugging):
```javascript
const imageUrl = $input.item.json.data.url || '';

// Verifică că URL-ul este valid
if (!imageUrl || imageUrl.trim() === '') {
  throw new Error('Image URL is empty');
}

if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
  throw new Error(`Invalid image URL format: ${imageUrl}`);
}

return [{
  json: {
    imageUrl: imageUrl,
    isValid: true,
    urlLength: imageUrl.length
  }
}];
```

### Pasul 3: Verifică promptul

Dacă promptul conține text în română, asigură-te că este tradus și reformulat în codul de mai sus.

## Debugging

### Verifică Request-ul Trimis

Adaugă un nod Code după "Build KIE.AI Request" pentru a vedea exact ce se trimite:

**Code**:
```javascript
const request = $input.item.json;

return [{
  json: {
    fullRequest: request,
    hasImageInput: !!request.input?.image_input,
    isImageInputArray: Array.isArray(request.input?.image_input),
    imageInput: request.input?.image_input,
    imageInputLength: request.input?.image_input?.length || 0,
    prompt: request.input?.prompt,
    aspectRatio: request.input?.aspect_ratio,
    resolution: request.input?.resolution,
    outputFormat: request.input?.output_format
  }
}];
```

### Verifică Răspunsul KIE.AI

Dacă primești 500, verifică:
1. ✅ Folosești `image_input` (NU `image_url`) - conform documentației KIE.AI
2. ✅ `image_input` este un **array** de URL-uri, nu string
3. ✅ URL-ul imaginii este valid și accesibil
4. ✅ Promptul este reformulat și nu conține caractere problematice
5. ✅ Parametrii (`resolution`, `aspect_ratio`) sunt valizi

## Checklist

Înainte de a trimite request-ul, verifică:

- [ ] Folosești `image_input` (NU `image_url`) - conform documentației KIE.AI
- [ ] `image_input` este un **array** de URL-uri, nu string (ex: `["https://..."]`)
- [ ] URL-ul imaginii este valid și accesibil
- [ ] Promptul este reformulat (tradus în engleză, context pozitiv adăugat)
- [ ] `resolution` este "1K" sau "2K"
- [ ] `aspect_ratio` este unul dintre: "1:1", "16:9", "9:16", "4:3"
- [ ] `output_format` este "png" sau "jpg"
- [ ] `model` este "nano-banana-pro"
- [ ] `callBackUrl` este gol sau un URL valid

## Exemple

### ✅ CORECT:
```json
{
  "model": "nano-banana-pro",
  "callBackUrl": "",
  "input": {
    "prompt": "Professional product photography: make a poster type post to promote these Jordan 3 White Cement Reimagined sneakers. discount from 500 euros to 300. modern and minimalist design. Clean design, commercial photography style, brand-safe content, family-friendly imagery.",
    "image_input": ["https://i.ibb.co/VYVt5pTt/6685f6b1ab7a.jpg"],  // ✅ Array de URL-uri!
    "aspect_ratio": "9:16",
    "resolution": "2K",
    "output_format": "png"
  }
}
```

### ❌ GREȘIT:
```json
{
  "model": "nano-banana-pro",
  "callBackUrl": "",
  "input": {
    "prompt": "fa o posta tip poster pentru a promova asesti adidica Jordan 3 White Cement Reimagined. reducere de la 500 uero la 300. design modern sim inimalist.",
    "image_input": "https://i.ibb.co/VYVt5pTt/6685f6b1ab7a.jpg",  // ❌ String în loc de array!
    "aspect_ratio": "9:16",
    "resolution": "2K",
    "output_format": "png"
  }
}
```

