# Fix: Accesare corectă date din Webhook n8n

## Problema

Next.js trimite:
```json
{
  "prompt": "...",
  "image": "data:image/jpeg;base64,..."
}
```

Dar n8n webhook procesează datele și le pune în:
- `$json.Prompt` (nu `$json.body.prompt`)
- `$json.Imagine` (nu `$json.body.image`)

Și `Imagine` devine un obiect file, nu base64 string.

## Soluție: Nod Code pentru a extrage base64

### Pas 1: Adaugă nod Code după Webhook

**Nume nod**: "Extract Base64"

**Code**:
```javascript
const items = $input.all();

return items.map(item => {
  // Verifică toate locațiile posibile pentru base64
  const imageBase64 = 
    item.json.body?.image ||           // Dacă vine direct din Next.js
    item.json.image ||                 // Dacă webhook nu procesează body
    item.json.Imagine?.data ||          // Dacă Imagine are data property
    (typeof item.json.Imagine === 'string' ? item.json.Imagine : null); // Dacă Imagine este string
  
  // Extrage doar base64 (fără prefix "data:image/...;base64,")
  let base64Only = '';
  
  if (typeof imageBase64 === 'string') {
    if (imageBase64.startsWith('data:')) {
      // Extrage partea după virgulă
      const parts = imageBase64.split(',');
      base64Only = parts.length > 1 ? parts[1] : imageBase64;
    } else {
      base64Only = imageBase64;
    }
  }
  
  // Dacă nu găsește base64, verifică binary data
  if (!base64Only && item.binary) {
    const binaryKey = Object.keys(item.binary)[0];
    if (binaryKey && item.binary[binaryKey].data) {
      base64Only = item.binary[binaryKey].data;
    }
  }
  
  return {
    json: {
      prompt: item.json.Prompt || item.json.body?.prompt || item.json.prompt,
      imageBase64: base64Only,
      originalData: {
        hasBody: !!item.json.body,
        hasImage: !!item.json.image,
        hasImagine: !!item.json.Imagine,
        imagineType: typeof item.json.Imagine
      }
    }
  };
});
```

### Pas 2: Actualizează nodul "Get URL"

**Parameter 1 (key)**:
- Name: `key`
- Value: `={{ $env.IMGBB_API_KEY }}`

**Parameter 2 (image)**:
- Name: `image`
- Value: `={{ $json.imageBase64 }}`

## Soluție alternativă: Modifică Next.js să trimită direct

Dacă vrei să eviți nodul Code, modifică `app/api/generate-ad/route.ts` să trimită datele direct către n8n fără procesare:

```typescript
// În app/api/generate-ad/route.ts
const payload = {
  prompt,
  image: image, // Base64 string direct
  timestamp: new Date().toISOString(),
};

// Trimite ca form-data sau JSON direct
const response = await fetch(n8nWebhookUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload),
});
```

Și în n8n, accesează direct:
- `{{ $json.prompt }}`
- `{{ $json.image }}` (sau `{{ $json.image.split(',')[1] }}` pentru a extrage base64)

## Debugging: Verifică ce primește webhook-ul

Adaugă un nod Code după Webhook pentru debugging:

```javascript
return [{
  json: {
    allKeys: Object.keys($input.item.json),
    hasBody: !!$input.item.json.body,
    bodyKeys: $input.item.json.body ? Object.keys($input.item.json.body) : [],
    prompt: $input.item.json.Prompt || $input.item.json.body?.prompt || $input.item.json.prompt,
    image: $input.item.json.image || $input.item.json.body?.image,
    imagine: $input.item.json.Imagine,
    imagineType: typeof $input.item.json.Imagine,
    fullJson: $input.item.json
  }
}];
```

Aceasta îți va arăta exact ce date primește webhook-ul și unde se află base64-ul.

