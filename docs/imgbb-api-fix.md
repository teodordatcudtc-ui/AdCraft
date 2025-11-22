# Fix: "Bad request - please check your parameters" la imgbb.com

## Problema

Eroarea "Bad request" de la imgbb.com apare când:
1. Base64-ul include prefixul `data:image/jpeg;base64,` (imgbb vrea DOAR base64)
2. Parametrul `key` lipsește sau este greșit
3. Formatul base64 este invalid

## Soluție: Trimite DOAR base64 (fără prefix)

### imgbb.com așteaptă:
- **key**: Cheia API (string)
- **image**: DOAR base64 string (fără `data:image/...;base64,`)

### Actualizează nodul Code

**Code pentru conversie corectă**:
```javascript
const items = $input.all();

return items.map(item => {
  const imageObj = item.json.Imagine || item.json.body?.Imagine || item.json.image || item.json.body?.image;
  
  // Funcție helper pentru a extrage doar base64 (fără prefix)
  const extractBase64 = (str) => {
    if (!str) return '';
    if (typeof str !== 'string') return '';
    if (str.startsWith('data:')) {
      // Extrage doar partea de base64 după virgulă
      const parts = str.split(',');
      return parts.length > 1 ? parts[1] : str;
    }
    return str;
  };
  
  // Verifică dacă este deja base64 string
  if (typeof imageObj === 'string') {
    const base64Only = extractBase64(imageObj);
    return {
      json: {
        ...item.json,
        imageBase64: base64Only
      }
    };
  }
  
  // Dacă este obiect file, încearcă să accesezi binary data
  if (imageObj && typeof imageObj === 'object') {
    const binaryKey = Object.keys(item.binary || {}).find(key => 
      key.toLowerCase().includes('image') || key.toLowerCase().includes('imagine')
    );
    
    if (binaryKey && item.binary[binaryKey]) {
      // Binary data este deja în format base64 în n8n
      const binaryData = item.binary[binaryKey];
      const base64 = binaryData.data; // Deja base64 string, fără prefix
      
      return {
        json: {
          ...item.json,
          imageBase64: base64
        }
      };
    }
    
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
  }
  
  return {
    json: {
      ...item.json,
      imageBase64: ''
    }
  };
});
```

## Verificare parametri în nodul "Get URL"

### Parameter 1: key
- **Name**: `key`
- **Value**: `={{ $env.IMGBB_API_KEY }}`
- **Verifică**: Asigură-te că variabila de mediu este setată corect

### Parameter 2: image
- **Name**: `image`
- **Value**: `={{ $json.imageBase64 }}`
- **IMPORTANT**: Trebuie să fie DOAR base64, fără prefix

## Testare rapidă

### Pas 1: Verifică output-ul nodului Code
După nodul Code, ar trebui să vezi:
```json
{
  "imageBase64": "/9j/4AAQSkZJRgABAQAAAQ..." // DOAR base64, fără prefix
}
```

**NU ar trebui să fie**:
```json
{
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQ..." // ❌ GREȘIT
}
```

### Pas 2: Testează direct cu Postman
```bash
curl -X POST https://api.imgbb.com/1/upload \
  -F "key=YOUR_API_KEY" \
  -F "image=/9j/4AAQSkZJRg..." 
```

## Debugging

### Adaugă nod "Code" după "Get URL" pentru a vedea răspunsul:
```javascript
return [{
  json: {
    response: $input.item.json,
    statusCode: $input.item.statusCode
  }
}];
```

### Verifică dacă base64-ul este valid:
```javascript
// În nodul Code, înainte de "Get URL"
const base64 = $input.item.json.imageBase64;
const isValid = /^[A-Za-z0-9+/=]+$/.test(base64);

return [{
  json: {
    ...$input.item.json,
    base64Length: base64?.length || 0,
    isValidBase64: isValid,
    firstChars: base64?.substring(0, 20) || ''
  }
}];
```

## Soluții alternative

### Opțiunea 1: Folosește "Form Urlencoded" în loc de "Form-Data"
1. În nodul "Get URL", schimbă "Body Content Type" la **"Form Urlencoded"**
2. Păstrează aceiași parametri
3. imgbb.com acceptă ambele formate

### Opțiunea 2: Trimite direct binary data
Dacă ai binary data direct, poți să-l trimiți ca file:
1. În nodul "Get URL", pentru parameter `image`:
   - **Parameter Type**: File
   - **Value**: `={{ $binary.Imagine }}` (sau key-ul corect)

### Opțiunea 3: Folosește URL în loc de base64
Dacă ai deja un URL al imaginii:
- **Parameter 2**:
  - Name: `image`
  - Value: `={{ $json.body.image }}` (direct URL-ul)

## Verificare finală

După ce aplici fix-urile:
1. ✅ Base64-ul este fără prefix `data:image/...`
2. ✅ Parametrul `key` este setat corect
3. ✅ Body Content Type este "Form-Data" sau "Form Urlencoded"
4. ✅ NU există header manual pentru Content-Type

Dacă tot primești "Bad request", verifică:
- Logs-urile din n8n pentru detalii despre eroare
- Răspunsul complet de la imgbb.com (poate conține detalii despre ce parametru lipsește)

