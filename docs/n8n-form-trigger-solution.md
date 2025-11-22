# Soluție: Form n8n - Accesare corectă date

## Structura datelor din Form n8n

Când folosești un formular n8n (Form Trigger sau Form.io), datele vin astfel:

- `$json.Prompt` - text din câmpul "Prompt"
- `$json.Imagine` - obiect file din câmpul "Imagine"
- `$binary.Imagine` - binary data pentru imagine

## Soluție: Nod Code pentru a extrage base64

### Pas 1: Adaugă nod Code după Form Trigger

**Nume nod**: "Extract Base64 from Form"

**Code**:
```javascript
const items = $input.all();

return items.map(item => {
  // Accesează prompt-ul
  const prompt = item.json.Prompt || item.json.prompt || '';
  
  // Accesează binary data pentru imagine
  let imageBase64 = '';
  
  if (item.binary && item.binary.Imagine) {
    // Binary data este deja în format base64 în n8n
    imageBase64 = item.binary.Imagine.data;
  } else if (item.json.Imagine && typeof item.json.Imagine === 'object') {
    // Dacă Imagine este obiect, verifică dacă are data property
    if (item.json.Imagine.data && item.json.Imagine.data !== 'filesystem-v2') {
      imageBase64 = item.json.Imagine.data;
    }
  } else if (typeof item.json.Imagine === 'string') {
    // Dacă Imagine este deja string base64
    if (item.json.Imagine.startsWith('data:')) {
      imageBase64 = item.json.Imagine.split(',')[1] || item.json.Imagine;
    } else {
      imageBase64 = item.json.Imagine;
    }
  }
  
  return {
    json: {
      prompt: prompt,
      imageBase64: imageBase64
    }
  };
});
```

### Pas 2: Actualizează nodul "Get URL"

**Parameter 1 (key)**:
- Name: `key`
- Parameter Type: Form Data
- Value: `={{ $env.IMGBB_API_KEY }}`

**Parameter 2 (image)**:
- Name: `image`
- Parameter Type: Form Data
- Value: `={{ $json.imageBase64 }}`

## Soluție alternativă: Trimite direct binary (fără Code)

Dacă vrei să eviți nodul Code, poți trimite direct binary în HTTP Request:

### Opțiunea A: Folosește "n8n Binary File"

**Parameter 2 (image)**:
- Parameter Type: **n8n Binary File** (NU Form Data!)
- Input Data Field Name: `={{ $binary.Imagine }}`

**NOTĂ**: imgbb.com așteaptă base64 string, nu binary file. Această opțiune poate să nu funcționeze.

### Opțiunea B: Folosește nodul "Read Binary File" (dacă ai path)

Dacă ai un path la fișier, poți folosi nodul "Read Binary File" pentru a citi datele.

## Verificare: Debug ce date ai

Adaugă un nod Code după Form Trigger pentru debugging:

```javascript
return [{
  json: {
    prompt: $input.item.json.Prompt,
    hasImagine: !!$input.item.json.Imagine,
    imagineType: typeof $input.item.json.Imagine,
    imagineData: $input.item.json.Imagine,
    hasBinary: !!$input.item.binary,
    binaryKeys: Object.keys($input.item.binary || {}),
    binaryDataLength: $input.item.binary?.Imagine?.data?.length || 0,
    binaryDataPreview: $input.item.binary?.Imagine?.data?.substring(0, 50) || 'N/A'
  }
}];
```

Aceasta îți va arăta exact ce date ai disponibile.

## Structura completă workflow

```
Form Trigger → Code (Extract Base64) → Get URL (imgbb) → Edit Image (KIE.AI) → ...
```

## Dacă tot nu funcționează

Verifică:
1. **Form Trigger settings**: Asigură-te că câmpul pentru imagine este configurat ca "File Upload"
2. **Binary data**: Verifică dacă binary data este disponibilă în `$binary.Imagine`
3. **Base64 format**: Verifică dacă `$binary.Imagine.data` conține base64 valid (nu "filesystem-v2")

