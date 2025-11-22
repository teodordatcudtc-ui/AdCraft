# Fix: "No path back to referenced node" în n8n

## Problema

Eroarea apare când folosești o expresie care face referință la un nod care nu este conectat în workflow:

```
{{ $('On form submission').item.json.body.prompt }}
```

## Soluție: Folosește nodurile conectate

### Structura workflow-ului corectă

```
Webhook (/reclama) 
  → Code (Extract Base64) 
  → Get URL (imgbb.com) 
  → Edit Image (KIE.AI) 
  → ...
```

### Expresii corecte pentru nodul "Edit Image"

În nodul "Edit Image" (HTTP Request către KIE.AI), folosește:

**Pentru prompt**:
- `{{ $('Code').item.json.prompt }}` - referință explicită la nodul Code
- SAU `{{ $json.prompt }}` - dacă prompt-ul este disponibil direct

**Pentru image_url**:
- `{{ $json.data.url }}` - URL-ul din răspunsul imgbb (corect)

### Exemplu complet Body JSON:

```json
{
  "model": "nano-banana-pro",
  "prompt": "{{ $('Code').item.json.prompt }}",
  "image_url": "{{ $json.data.url }}",
  "negative_prompt": "blurry, low quality, distorted",
  "width": 1024,
  "height": 1024,
  "num_inference_steps": 20,
  "guidance_scale": 7.5
}
```

## Cum să găsești numele corect al nodului

1. **Verifică numele nodului**: Click pe nodul Code și verifică numele exact (ex: "Code", "Extract Base64", etc.)
2. **Folosește numele exact**: `{{ $('Nume Exact Nod').item.json.prompt }}`
3. **Sau folosește referință relativă**: `{{ $json.prompt }}` - datele din nodul anterior

## Verificare rapidă

Adaugă un nod Code înainte de "Edit Image" pentru a vedea ce date ai:

```javascript
return [{
  json: {
    prompt: $input.item.json.prompt,
    imageUrl: $input.item.json.data?.url,
    allData: $input.item.json
  }
}];
```

Aceasta îți va arăta exact ce date sunt disponibile.

## Reguli pentru expresii n8n

1. **Referință explicită**: `{{ $('Nume Nod').item.json.field }}`
2. **Referință relativă**: `{{ $json.field }}` - datele din nodul anterior
3. **Referință la nod specific**: `{{ $('Get URL').item.json.data.url }}`

## Dacă tot primești eroare

1. **Verifică conexiunile**: Asigură-te că toate nodurile sunt conectate
2. **Verifică numele nodurilor**: Folosește numele exacte (case-sensitive)
3. **Folosește referință relativă**: `{{ $json.field }}` în loc de referință explicită

