# Soluție: Eroare "source.on is not a function" cu obiect file

## Problema

Când primești un obiect file în n8n (ex: `[Object: {"filename": "_IMG8933.JPG", "mimetype": "image/jpeg"}]`), nu poți să-l trimiți direct în Form-Data la imgbb.com. Eroarea "source.on is not a function" apare pentru că n8n încearcă să trateze obiectul JSON ca un stream.

## Soluție: Adaugă nodul Code pentru conversie

### Pas 1: Adaugă nodul Code între Webhook și "Get URL"

1. **Creează un nod nou de tip "Code"**
2. **Numește-l**: "Convert Image to Base64"
3. **Pune-l între**: Webhook → Code → Get URL

### Pas 2: Configurează nodul Code

**Mode**: Run Once for All Items

**Code**:
```javascript
const items = $input.all();

return items.map(item => {
  // Accesează obiectul Imagine din datele primite
  const imageObj = item.json.Imagine || item.json.body?.Imagine || item.json.image || item.json.body?.image;
  
  // Verifică dacă este deja base64 string
  if (typeof imageObj === 'string') {
    // Dacă deja este base64, folosește-l direct
    if (imageObj.startsWith('data:')) {
      return {
        json: {
          ...item.json,
          imageBase64: imageObj
        }
      };
    }
    // Dacă este URL, returnează-l
    if (imageObj.startsWith('http')) {
      return {
        json: {
          ...item.json,
          imageBase64: imageObj
        }
      };
    }
  }
  
  // Dacă este obiect file, încearcă să accesezi binary data
  if (imageObj && typeof imageObj === 'object') {
    // Verifică dacă există binary data în item
    const binaryKey = Object.keys(item.binary || {}).find(key => 
      key.toLowerCase().includes('image') || key.toLowerCase().includes('imagine')
    );
    
  if (binaryKey && item.binary[binaryKey]) {
    // Binary data este deja în format base64 în n8n
    const binaryData = item.binary[binaryKey];
    const base64 = binaryData.data; // Deja base64 string
    
    // imgbb.com vrea DOAR base64, fără prefix "data:image/..."
    return {
      json: {
        ...item.json,
        imageBase64: base64
      }
    };
  }
  
  // Funcție helper pentru a extrage doar base64 (fără prefix)
  const extractBase64 = (str) => {
    if (!str) return '';
    if (str.startsWith('data:')) {
      const parts = str.split(',');
      return parts.length > 1 ? parts[1] : str;
    }
    return str;
  };
  
  // Dacă obiectul are proprietatea 'data' cu base64
  if (imageObj.data) {
    const base64Only = extractBase64(imageObj.data);
    return {
      json: {
        ...item.json,
        imageBase64: base64Only
      }
    };
  }
  
  // Dacă este deja string base64
  if (typeof imageObj === 'string') {
    const base64Only = extractBase64(imageObj);
    return {
      json: {
        ...item.json,
        imageBase64: base64Only
      }
    };
  }
  }
  
  // Fallback - returnează ce ai primit
  return {
    json: {
      ...item.json,
      imageBase64: imageObj || ''
    }
  };
});
```

### Pas 3: Actualizează nodul "Get URL"

În nodul "Get URL", în Body Parameters:

**Parameter 2 (image)**:
- Name: `image`
- Value: `={{ $json.imageBase64 }}` (folosește rezultatul din nodul Code)

## Soluție alternativă: Folosește Binary Data direct

Dacă nodul Code nu funcționează, încearcă să accesezi direct binary data:

### Opțiunea A: Folosește expresie pentru binary

În nodul "Get URL", pentru parameter `image`:
- Value: `={{ $binary.Imagine.data }}` (dacă binary key-ul este "Imagine")

### Opțiunea B: Schimbă modul de trimitere

1. În nodul "Get URL", schimbă "Body Content Type" la **"Raw"**
2. Setează "Body" la:
```json
{
  "key": "{{ $env.IMGBB_API_KEY }}",
  "image": "{{ $json.imageBase64 }}"
}
```
3. Setează manual header-ul:
   - `Content-Type: application/json`

**NOTĂ**: imgbb.com acceptă și JSON, dar preferă form-data.

## Debugging: Verifică ce primești

Adaugă un nod "Code" după Webhook pentru a vedea structura datelor:

```javascript
return [{
  json: {
    debug: {
      hasImagine: !!$input.item.json.Imagine,
      imagineType: typeof $input.item.json.Imagine,
      imagineValue: $input.item.json.Imagine,
      hasBinary: !!$input.item.binary,
      binaryKeys: Object.keys($input.item.binary || {}),
      fullItem: $input.item
    }
  }
}];
```

Aceasta îți va arăta exact ce structură au datele și cum să le accesezi.

## Testare

După ce adaugi nodul Code:

1. Rulează workflow-ul până la nodul Code
2. Verifică output-ul - ar trebui să vezi `imageBase64` cu un string base64 complet
3. Dacă `imageBase64` este gol sau undefined, verifică expresia din Code
4. Continuă workflow-ul și verifică dacă "Get URL" funcționează

## Dacă tot nu funcționează

1. **Verifică dacă imaginea vine ca binary sau JSON**:
   - Dacă vine ca binary, folosește `$binary.Imagine.data`
   - Dacă vine ca JSON, folosește nodul Code

2. **Testează direct cu Postman**:
   - Trimite manual o cerere POST la imgbb.com cu base64
   - Verifică dacă funcționează

3. **Verifică versiunea n8n**:
   - Unele versiuni mai vechi au probleme cu file objects
   - Actualizează n8n la ultima versiune

