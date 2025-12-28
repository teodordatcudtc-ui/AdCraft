# Fix pentru "{{ $json.text }}" în loc de textul real

## Problema

În aplicație primești textul literal `{{ $json.text }}` în loc de textul generat efectiv.

## Cauza

Nodul "Respond to Webhook" din n8n nu procesează corect expresiile `{{ }}` când sunt în string-uri JSON.

## Soluție: Folosește expresii n8n corecte

### Opțiunea 1: Folosește expresii n8n cu `=` (Recomandat)

În nodul **Respond to Webhook**, în loc de:
```json
{
  "success": true,
  "text": "{{ $json.text }}",
  "model": "{{ $json.model }}"
}
```

Folosește:
```json
{
  "success": true,
  "text": "={{ $json.text }}",
  "model": "={{ $json.model }}"
}
```

**IMPORTANT**: Adaugă `=` în fața expresiilor pentru ca n8n să le evalueze corect!

### Opțiunea 2: Returnează direct JSON-ul (Cel mai simplu)

În nodul **Respond to Webhook**:

1. **Respond With**: `JSON`
2. **Response Body**: Selectează **"Using JSON"** (nu "Using JSON Template")
3. **JSON Body**: 
```json
={{ JSON.stringify($json) }}
```

Sau mai simplu, folosește:
```json
={{ $json }}
```

Aceasta va returna direct tot JSON-ul din nodul anterior (Parse Response).

### Opțiunea 3: Construiește JSON-ul manual (Cel mai controlat)

În nodul **Respond to Webhook**:

1. **Respond With**: `JSON`
2. **Response Body**: Selectează **"Using JSON"**
3. **JSON Body**:
```json
={
  "success": true,
  "text": $json.text,
  "model": $json.model
}
```

**Notă**: Fără ghilimele în jurul expresiilor când folosești `=`!

## Configurare Recomandată

### Pasul 1: Deschide nodul "Respond to Webhook"

1. Deschide workflow-ul în n8n
2. Click pe nodul **Respond to Webhook**

### Pasul 2: Configurează răspunsul

1. **Respond With**: `JSON`
2. **Response Body**: Selectează **"Using JSON"**
3. **JSON Body**: 
```json
={
  "success": true,
  "text": $json.text,
  "model": $json.model || "gemini-1.5-flash"
}
```

**IMPORTANT**: 
- Folosește `=` la început pentru a activa evaluarea expresiilor
- NU pune ghilimele în jurul expresiilor `$json.text`
- Folosește `||` pentru valori default

### Pasul 3: Salvează și testează

1. Click **Save**
2. Testează workflow-ul

## Verificare

După aplicarea fix-ului, răspunsul ar trebui să fie:
```json
{
  "success": true,
  "text": "Textul generat efectiv...",
  "model": "gemini-1.5-flash"
}
```

Nu mai ar trebui să vezi `{{ $json.text }}` în aplicație.

## Alternative: Folosește nodul "Set" înainte de "Respond to Webhook"

Dacă problemele persistă, poți adăuga un nod **Set** înainte de "Respond to Webhook":

1. Adaugă nod **Set** după "Parse Response"
2. Setează câmpurile:
   - `success`: `true`
   - `text`: `={{ $json.text }}`
   - `model`: `={{ $json.model }}`
3. În "Respond to Webhook", returnează: `={{ $json }}`

Aceasta asigură că datele sunt procesate corect înainte de răspuns.

