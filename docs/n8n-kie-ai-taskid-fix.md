# Fix: KIE.AI returnează taskId, NU job_id

## Problema

După ce "Edit Image" rulează cu succes, răspunsul KIE.AI este:

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "2f6131d977805e8de00fd18edbb318b9",
    "recordId": "2f6131d977805e8de00fd18edbb318b9"
  }
}
```

**NU** `job_id`!

## Soluție

### Nod "Get Image1" (HTTP Request2)

**URL**: 
```
https://api.kie.ai/api/v1/jobs/{{ $json.data.taskId }}
```

SAU

```
https://api.kie.ai/api/v1/tasks/{{ $json.data.taskId }}
```

**IMPORTANT**: 
- Folosește `{{ $json.data.taskId }}` sau `{{ $json.data.recordId }}`
- Ambele (`taskId` și `recordId`) par să fie identice
- Verifică documentația KIE.AI pentru endpoint-ul exact

### Verificare Endpoint

KIE.AI poate folosi:
- `/api/v1/jobs/{taskId}` - pentru job status
- `/api/v1/tasks/{taskId}` - pentru task status
- `/api/v1/jobs/{taskId}/status` - pentru status check

Verifică documentația KIE.AI pentru endpoint-ul corect!

## Eroare 404

Dacă primești **404 Not Found**, verifică:
1. ✅ Folosești `taskId` (NU `job_id`)
2. ✅ Endpoint-ul este corect (`/jobs/` sau `/tasks/`)
3. ✅ `taskId` este valid (nu este `undefined` sau `null`)

## Debug

Adaugă un nod Code înainte de "Get Image1" pentru a verifica datele:

**Code**:
```javascript
const taskId = $input.item.json.data?.taskId;
const recordId = $input.item.json.data?.recordId;

return [{
  json: {
    taskId: taskId,
    recordId: recordId,
    hasTaskId: !!taskId,
    hasRecordId: !!recordId,
    fullData: $input.item.json
  }
}];
```

Apoi verifică output-ul pentru a vedea ce valori sunt disponibile.

