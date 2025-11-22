# Endpoint Corect KIE.AI - Conform Documentației Oficiale

## Endpoint Corect

Conform documentației oficiale KIE.AI, endpoint-ul pentru verificarea statusului job-ului este:

```
GET https://api.kie.ai/api/v1/jobs/recordInfo?taskId={taskId}
```

**IMPORTANT**: 
- ❌ NU este `/api/v1/jobs/{taskId}` (path parameter)
- ✅ Este `/api/v1/jobs/recordInfo?taskId={taskId}` (query parameter)

## Configurare Nod "Get Image1"

**Tip**: HTTP Request
**Metodă**: GET
**URL**: `https://api.kie.ai/api/v1/jobs/recordInfo?taskId={{ $json.data.taskId }}`

**Headers**:
```
Authorization: Bearer {{ $env.KIE_AI_API_KEY }}
```

**Setări**:
- Response Format: JSON
- Timeout: 30000ms

## Răspuns Așteptat

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "taskId": "task_12345678",
    "model": "nano-banana-pro",
    "state": "success",
    "param": "{...}",
    "resultJson": "{\"resultUrls\":[\"https://example.com/generated-image.jpg\"]}",
    "failCode": "",
    "failMsg": "",
    "completeTime": 1698765432000,
    "createTime": 1698765400000,
    "updateTime": 1698765432000
  }
}
```

## Parsing ResultJson

`data.resultJson` este un **JSON string**, nu un obiect JSON! Trebuie să-l parsezi:

**Nod Code: "Parse Result"**:
```javascript
const response = $input.item.json;

// Parse resultJson pentru a obține URL-urile
let imageUrls = [];
if (response.data?.resultJson) {
  try {
    const resultJson = JSON.parse(response.data.resultJson);
    imageUrls = resultJson.resultUrls || [];
  } catch (e) {
    console.error('Error parsing resultJson:', e);
  }
}

return [{
  json: {
    code: response.code,
    message: response.message,
    taskId: response.data?.taskId,
    state: response.data?.state,
    imageUrls: imageUrls,
    firstImageUrl: imageUrls.length > 0 ? imageUrls[0] : null,
    failCode: response.data?.failCode,
    failMsg: response.data?.failMsg
  }
}];
```

## State Values

`data.state` poate fi:
- `waiting` - Așteaptă generarea
- `queuing` - În coadă
- `generating` - Se generează
- `success` - Generare reușită ✅
- `fail` - Generare eșuată ❌

## Switch Node Configuration

**Rule: success**
- Condition: `{{ $json.state }}` equals `success`

**Rule: generating**
- Condition: `{{ $json.state }}` equals `generating` sau `queuing` sau `waiting`

**Rule: fail**
- Condition: `{{ $json.state }}` equals `fail`

## Returnare în Site

**Nod "Result1" (Respond to Webhook)**:
```json
{
  "success": true,
  "image_url": "{{ $('Parse Result').item.json.firstImageUrl }}",
  "image_urls": "{{ $('Parse Result').item.json.imageUrls }}",
  "taskId": "{{ $('Parse Result').item.json.taskId }}"
}
```

## Flow Complet

1. **Edit Image** → Returnează `taskId`
2. **Wait1** → Așteaptă 5 secunde
3. **Get Image1** → `GET /api/v1/jobs/recordInfo?taskId={taskId}`
4. **Parse Result** → Parsează `resultJson` și extrage `resultUrls`
5. **Switch1** → Verifică `state` (success/generating/fail)
6. **Loop Back** → Dacă `generating`, merge înapoi la Wait1
7. **Result1** → Returnează `firstImageUrl` către Next.js

## Verificare

După configurare:
1. ✅ Endpoint-ul este `/api/v1/jobs/recordInfo?taskId={taskId}`
2. ✅ Headers conțin `Authorization: Bearer {API_KEY}`
3. ✅ Nodul "Parse Result" parsează `resultJson`
4. ✅ Switch verifică `state` (nu `status`)
5. ✅ Result1 returnează `firstImageUrl` din nodul "Parse Result"

