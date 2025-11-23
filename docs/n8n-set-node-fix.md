# Fix pentru Nodul "Set" - Accesare Date Corectă

## Problema

Expresiile `$json.state`, `$json.firstImageUrl` returnează `undefined` pentru că datele sunt în `$json.data.state`, nu direct în `$json`.

## Soluție: Accesează Datele din `data`

### Configurare Corectă pentru Nodul "Set"

În nodul **Set**, folosește următoarele expresii:

#### 1. Field: `success`
**Mapping**: 
```
={{ $json.data.state === "success" }}
```

#### 2. Field: `image_url`
**Mapping**: 
```
={{ $json.data.resultJson ? JSON.parse($json.data.resultJson).resultUrls?.[0] : null }}
```

Sau, dacă ai deja un nod "Parse Result" care extrage `firstImageUrl`, folosește:
```
={{ $json.firstImageUrl || ($json.data.resultJson ? JSON.parse($json.data.resultJson).resultUrls?.[0] : null) }}
```

#### 3. Field: `taskId`
**Mapping**: 
```
={{ $json.data.taskId }}
```

#### 4. Field: `state`
**Mapping**: 
```
={{ $json.data.state }}
```

## Structura Completă

Dacă INPUT-ul tău arată așa:
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "d7177ae6461ad1174a6b31b71ec300a2",
    "state": "success",
    "resultJson": "{\"resultUrls\":[\"https://tempfile.aiquickdraw.com/...\"]}"
  }
}
```

Atunci expresiile trebuie să acceseze `$json.data.*`, nu `$json.*`.

## Verificare

După configurare, OUTPUT-ul ar trebui să fie:
```json
{
  "success": true,
  "image_url": "https://tempfile.aiquickdraw.com/...",
  "taskId": "d7177ae6461ad1174a6b31b71ec300a2",
  "state": "success"
}
```

## Notă Importantă

Dacă ai un nod "Parse Result" înainte de "Set" care deja extrage `firstImageUrl`, atunci:
- Verifică output-ul nodului "Parse Result"
- Dacă "Parse Result" returnează `firstImageUrl` direct, atunci în "Set" poți folosi `$json.firstImageUrl`
- Dacă "Parse Result" nu funcționează corect, folosește expresia de mai sus care parsează direct `resultJson`

