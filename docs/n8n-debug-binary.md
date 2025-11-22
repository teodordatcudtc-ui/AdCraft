# Debug: Verifică binary data în n8n

## Pas 1: Adaugă nod Code pentru debugging

Adaugă un nod Code **după Webhook** și **înainte de nodul Code principal** pentru a vedea ce date ai:

**Nume nod**: "Debug Binary Data"

**Code**:
```javascript
return [{
  json: {
    // Verifică JSON
    hasImagine: !!$input.item.json.Imagine,
    imagineType: typeof $input.item.json.Imagine,
    imagineData: $input.item.json.Imagine?.data,
    
    // Verifică Binary
    hasBinary: !!$input.item.binary,
    binaryKeys: Object.keys($input.item.binary || {}),
    
    // Detalii despre fiecare binary key
    binaryDetails: $input.item.binary ? Object.keys($input.item.binary).map(key => ({
      key: key,
      hasData: !!$input.item.binary[key].data,
      dataType: typeof $input.item.binary[key].data,
      dataLength: $input.item.binary[key].data?.length || 0,
      dataPreview: $input.item.binary[key].data?.substring(0, 50) || 'N/A',
      mimeType: $input.item.binary[key].mimeType,
      fileName: $input.item.binary[key].fileName
    })) : [],
    
    // Full item pentru debugging
    fullItemKeys: Object.keys($input.item)
  }
}];
```

## Pas 2: Analizează rezultatul

După ce rulezi nodul de debugging, vei vedea:
- Dacă există binary data
- Ce key-uri binary ai
- Dacă binary data are `data` property
- Tipul datelor

## Pas 3: Cod corect bazat pe rezultate

### Dacă binary data există și are key "Imagine":

```javascript
const items = $input.all();

return items.map(item => {
  // Accesează direct binary data
  if (item.binary && item.binary.Imagine && item.binary.Imagine.data) {
    return {
      json: {
        ...item.json,
        imageBase64: item.binary.Imagine.data
      }
    };
  }
  
  // Dacă key-ul este diferit, caută-l
  if (item.binary) {
    const binaryKey = Object.keys(item.binary)[0]; // Ia primul key
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

### Dacă binary data NU există (doar JSON):

Atunci trebuie să folosești un alt nod pentru a citi fișierul. Vezi soluția de mai jos.

