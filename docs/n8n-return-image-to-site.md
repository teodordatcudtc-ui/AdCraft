# Returnare Imagine Generată în Site

## Configurare Nod "Result1" (Respond to Webhook) în n8n

### Format Răspuns pentru Success

**Tip**: Respond to Webhook

**Response Code**: 200

**Response Body** (JSON):
```json
{
  "success": true,
  "image_url": "{{ $('Parse Result').item.json.firstImageUrl }}",
  "taskId": "{{ $('Parse Result').item.json.taskId }}"
}
```

**IMPORTANT**: 
- Folosește nodul "Parse Result" (NU "Get Image1") pentru a accesa `firstImageUrl`!
- Nodul "Parse Result" parsează `resultJson` din răspunsul KIE.AI și extrage `resultUrls`
- `firstImageUrl` este primul URL din array-ul `resultUrls`

### Format Răspuns pentru Fail

**Response Code**: 500 (sau 400)

**Response Body** (JSON):
```json
{
  "success": false,
  "error": "{{ $('Parse Result').item.json.failMsg || $('Parse Result').item.json.message }}",
  "taskId": "{{ $('Parse Result').item.json.taskId }}"
}
```

## Structura Răspunsului KIE.AI

După ce "Get Image1" funcționează, răspunsul KIE.AI este:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "taskId": "task_12345678",
    "state": "success",
    "resultJson": "{\"resultUrls\":[\"https://example.com/generated-image.jpg\"]}"
  }
}
```

**IMPORTANT**: 
- `resultJson` este un JSON string, NU un obiect!
- Trebuie să parsezi `resultJson` pentru a obține `resultUrls`
- Nodul "Parse Result" face asta automat și returnează `firstImageUrl`

## Verificare Structură

Dacă nu ești sigur de structura răspunsului, verifică output-ul nodului "Parse Result":

**Output așteptat din "Parse Result"**:
```json
{
  "code": 200,
  "message": "success",
  "taskId": "task_12345678",
  "state": "success",
  "imageUrls": ["https://example.com/generated-image.jpg"],
  "firstImageUrl": "https://example.com/generated-image.jpg",
  "failCode": "",
  "failMsg": ""
}
```

**IMPORTANT**: 
- Folosește `firstImageUrl` din nodul "Parse Result"!
- Dacă `firstImageUrl` este `null`, verifică că `resultJson` este parsat corect

## Frontend (Next.js)

Frontend-ul este deja configurat pentru a:
1. ✅ Afișa imaginea generată în UI
2. ✅ Afișa erori dacă apare o problemă
3. ✅ Permite descărcarea imaginii
4. ✅ Scroll automat la imaginea generată

## Flow Complet

1. **User trimite formular** → Next.js `/api/generate-ad`
2. **Next.js trimite la n8n** → Webhook n8n
3. **n8n procesează** → KIE.AI API
4. **n8n returnează** → Next.js (nodul "Result1")
5. **Next.js returnează** → Frontend
6. **Frontend afișează** → Imaginea generată în UI

## Debugging

Dacă imaginea nu apare în site:

1. **Verifică răspunsul n8n**:
   - Rulează workflow-ul până la "Result1"
   - Verifică output-ul nodului "Result1"
   - Verifică că `image_url` este prezent

2. **Verifică răspunsul Next.js**:
   - Deschide Network tab în browser
   - Verifică răspunsul de la `/api/generate-ad`
   - Verifică că `data.image_url` este prezent

3. **Verifică frontend-ul**:
   - Deschide Console în browser
   - Verifică erorile JavaScript
   - Verifică că `result.data.image_url` este setat corect

## Exemple de Expresii

### Dacă răspunsul KIE.AI este:
```json
{
  "data": {
    "result": {
      "image_url": "https://..."
    }
  }
}
```

**Expresie**: `{{ $('Get Image1').item.json.data.result.image_url }}`

### Dacă răspunsul KIE.AI este:
```json
{
  "result": {
    "image_url": "https://..."
  }
}
```

**Expresie**: `{{ $('Get Image1').item.json.result.image_url }}`

### Dacă răspunsul KIE.AI este:
```json
{
  "image_url": "https://..."
}
```

**Expresie**: `{{ $('Get Image1').item.json.image_url }}`

**IMPORTANT**: Ajustează expresiile în funcție de structura exactă a răspunsului KIE.AI!

