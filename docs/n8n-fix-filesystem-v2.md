# Fix: imageBase64 = "filesystem-v2" în loc de base64

## Problema

Când vezi în output `imageBase64: filesystem-v2`, înseamnă că codul nu accesează corect datele binare din n8n. `filesystem-v2` este referința internă n8n pentru binary data, nu datele reale.

## Soluție: Accesează corect binary data

### Cod corect pentru nodul Code:

```javascript
const items = $input.all();

return items.map(item => {
  const imageObj = item.json.Imagine || item.json.body?.Imagine || item.json.image || item.json.body?.image;
  
  // PRIORITATE 1: Accesează direct binary data (cea mai sigură metodă)
  if (item.binary) {
    // Caută key-ul binary care conține imaginea
    const binaryKey = Object.keys(item.binary).find(key => 
      key.toLowerCase().includes('image') || 
      key.toLowerCase().includes('imagine') ||
      key === 'Imagine' ||
      key === 'image'
    );
    
    if (binaryKey && item.binary[binaryKey]) {
      const binaryData = item.binary[binaryKey];
      // binaryData.data este deja base64 string în n8n
      const base64 = binaryData.data;
      
      // imgbb.com vrea DOAR base64, fără prefix
      return {
        json: {
          ...item.json,
          imageBase64: base64
        }
      };
    }
  }
  
  // PRIORITATE 2: Dacă obiectul are data = 'filesystem-v2', accesează binary
  if (imageObj && typeof imageObj === 'object' && imageObj.data === 'filesystem-v2') {
    if (item.binary) {
      // Ia primul binary key disponibil
      const binaryKey = Object.keys(item.binary)[0];
      if (binaryKey && item.binary[binaryKey]) {
        return {
          json: {
            ...item.json,
            imageBase64: item.binary[binaryKey].data
          }
        };
      }
    }
  }
  
  // PRIORITATE 3: Verifică dacă este deja base64 string
  if (typeof imageObj === 'string' && imageObj !== 'filesystem-v2') {
    const extractBase64 = (str) => {
      if (!str || typeof str !== 'string') return '';
      if (str.startsWith('data:')) {
        const parts = str.split(',');
        return parts.length > 1 ? parts[1] : str;
      }
      return str;
    };
    
    const base64Only = extractBase64(imageObj);
    if (base64Only) {
      return {
        json: {
          ...item.json,
          imageBase64: base64Only
        }
      };
    }
  }
  
  // Fallback
  return {
    json: {
      ...item.json,
      imageBase64: ''
    }
  };
});
```

## Verificare

### Pas 1: Verifică ce binary keys ai

Adaugă un nod Code temporar după Webhook pentru debugging:

```javascript
return [{
  json: {
    binaryKeys: Object.keys($input.item.binary || {}),
    hasBinary: !!$input.item.binary,
    binaryData: $input.item.binary ? Object.keys($input.item.binary).map(key => ({
      key: key,
      hasData: !!$input.item.binary[key].data,
      dataLength: $input.item.binary[key].data?.length || 0,
      mimeType: $input.item.binary[key].mimeType
    })) : []
  }
}];
```

Aceasta îți va arăta:
- Ce binary keys există
- Dacă au date
- Lungimea datelor
- MIME type-ul

### Pas 2: Folosește key-ul corect

După ce vezi ce key-uri ai, actualizează codul:

```javascript
// Dacă key-ul este "Imagine" (cu I mare)
const binaryData = item.binary.Imagine;

// Dacă key-ul este "image" (cu i mic)
const binaryData = item.binary.image;

// Sau folosește primul key disponibil
const binaryKey = Object.keys(item.binary)[0];
const binaryData = item.binary[binaryKey];
```

## Structura corectă a binary data în n8n

Binary data în n8n are structura:
```javascript
{
  binary: {
    "Imagine": {  // sau "image" sau alt key
      data: "base64_string_here",  // Base64 fără prefix
      mimeType: "image/jpeg",
      fileName: "_IMG8933.JPG"
    }
  }
}
```

## Testare

După ce aplici codul corect:

1. **Rulează workflow-ul până la nodul Code**
2. **Verifică output-ul**:
   - `imageBase64` ar trebui să fie un string lung de base64
   - Ar trebui să înceapă cu caractere precum: `/9j/`, `iVBORw0KGgo`, etc.
   - NU ar trebui să fie `filesystem-v2`

3. **Verifică lungimea**:
   - Base64 pentru o imagine de 4.92 MB ar trebui să aibă ~6.5 milioane de caractere
   - Dacă este foarte scurt, ceva nu e bine

## Dacă tot primești "filesystem-v2"

### Pas 1: Debug - Verifică ce date ai

Adaugă un nod Code **după Webhook** pentru debugging:

```javascript
return [{
  json: {
    hasBinary: !!$input.item.binary,
    binaryKeys: Object.keys($input.item.binary || {}),
    binaryDetails: $input.item.binary ? Object.keys($input.item.binary).map(key => ({
      key: key,
      hasData: !!$input.item.binary[key].data,
      dataLength: $input.item.binary[key].data?.length || 0,
      mimeType: $input.item.binary[key].mimeType
    })) : []
  }
}];
```

### Opțiunea 1: Dacă binary data EXISTĂ

Folosește codul simplificat:
```javascript
const items = $input.all();

return items.map(item => {
  // Accesează direct binary data
  if (item.binary) {
    // Încearcă key-ul "Imagine" (cu I mare)
    if (item.binary.Imagine && item.binary.Imagine.data) {
      return {
        json: {
          ...item.json,
          imageBase64: item.binary.Imagine.data
        }
      };
    }
    
    // Sau ia primul binary key disponibil
    const binaryKey = Object.keys(item.binary)[0];
    if (binaryKey && item.binary[binaryKey].data) {
      return {
        json: {
          ...item.json,
          imageBase64: item.binary[binaryKey].data
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

### Opțiunea 2: Dacă binary data NU există - Folosește nodul HTTP Request direct

Dacă binary data nu este disponibilă în n8n, poți trimite direct obiectul file în HTTP Request:

În nodul "Get URL":
- **Parameter 2 (image)**:
  - **Parameter Type**: File (NU Form Data!)
  - **Value**: `={{ $binary.Imagine }}` sau `={{ $binary[Object.keys($binary)[0]] }}`

### Opțiunea 3: Folosește nodul "Read Binary File"

Dacă ai un path la fișier, poți folosi nodul "Read Binary File" pentru a citi datele.

### Opțiunea 4: Trimite direct din Next.js ca base64

Modifică endpoint-ul Next.js să trimită direct base64:

În `app/api/generate-ad/route.ts`, asigură-te că trimiți base64 complet:
```typescript
const imageBase64 = await new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onloadend = () => {
    if (typeof reader.result === 'string') {
      resolve(reader.result); // Include "data:image/...;base64,"
    } else {
      reject(new Error('Failed to convert'));
    }
  };
  reader.onerror = reject;
  reader.readAsDataURL(image);
});
```

## Verificare finală

Output-ul corect ar trebui să arate așa:
```json
{
  "Prompt": "test",
  "Imagine": {
    "filename": "_IMG8933.JPG",
    "mimetype": "image/jpeg",
    "size": 4924239
  },
  "imageBase64": "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
}
```

**NU** ar trebui să fie:
```json
{
  "imageBase64": "filesystem-v2"  // ❌ GREȘIT
}
```

