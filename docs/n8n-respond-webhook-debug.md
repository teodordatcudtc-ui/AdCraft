# Debug pentru "Respond to Webhook" - Verificare Date

## Problema

Expresiile `$json.firstImageUrl` nu returnează valorile corecte în "Respond to Webhook".

## Soluție: Verifică Structura Datelor

### Pasul 1: Verifică Output-ul Nodului Anterior

1. Rulează workflow-ul în **test mode** (sau execută manual)
2. Click pe nodul **înainte de "Respond to Webhook"** (probabil "Switch" sau "Parse Result")
3. Verifică **Output** - vezi exact ce structură de date are

### Pasul 2: Ajustează Expresiile în Funcție de Structură

#### Dacă datele vin direct (din "Parse Result"):

```json
={
  "success": $json.state === "success",
  "image_url": $json.firstImageUrl,
  "taskId": $json.taskId,
  "state": $json.state
}
```

#### Dacă datele sunt în `data` (din "Switch" care primește de la "Get Image1"):

```json
={
  "success": $json.data?.state === "success",
  "image_url": $json.data?.firstImageUrl || $json.firstImageUrl,
  "taskId": $json.data?.taskId || $json.taskId,
  "state": $json.data?.state || $json.state
}
```

#### Dacă trebuie să parsezi `resultJson` direct:

```json
={
  "success": $json.data?.state === "success",
  "image_url": $json.data?.resultJson ? JSON.parse($json.data.resultJson).resultUrls?.[0] : null,
  "taskId": $json.data?.taskId,
  "state": $json.data?.state
}
```

### Pasul 3: Folosește Nodul "Set" pentru Claritate

Dacă expresiile sunt prea complexe, adaugă un nod **Set** înainte de "Respond to Webhook":

1. Adaugă nod **Set** după "Switch" (output "success")
2. Setează câmpurile:
   - `success`: `={{ $json.state === "success" || ($json.data?.state === "success") }}`
   - `image_url`: `={{ $json.firstImageUrl || ($json.data?.resultJson ? JSON.parse($json.data.resultJson).resultUrls?.[0] : null) }}`
   - `taskId`: `={{ $json.taskId || $json.data?.taskId }}`
   - `state`: `={{ $json.state || $json.data?.state }}`
3. În "Respond to Webhook", returnează: `={{ $json }}`

## Verificare Rapidă

În nodul "Respond to Webhook", în **JSON Body**, testează temporar:

```json
={{ JSON.stringify($json, null, 2) }}
```

Aceasta va returna întreaga structură de date pentru debugging. Apoi ajustează expresiile în funcție de structura reală.

## Soluție Finală Recomandată

Cel mai sigur este să folosești nodul **Set** pentru a normaliza datele:

1. **Set Node** (după Switch → success):
   - `success`: `={{ $json.state === "success" }}`
   - `image_url`: `={{ $json.firstImageUrl }}`
   - `taskId`: `={{ $json.taskId }}`
   - `state`: `={{ $json.state }}`

2. **Respond to Webhook**:
   - **JSON Body**: `={{ $json }}`

Aceasta asigură că datele sunt procesate corect înainte de răspuns.

