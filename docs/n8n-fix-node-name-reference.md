# Fix: "Referenced node doesn't exist" - Nume nod incorect

## Problema

Eroarea `Referenced node doesn't exist` apare când:
- Numele nodului în expresie nu se potrivește cu numele real
- Nodul nu este conectat în workflow
- Nodul are alt nume decât cel folosit în expresie

## Soluție: Verifică și folosește numele corect

### Pas 1: Verifică numele exact al nodului

1. Click pe nodul "Edit Image" (sau cum se numește el)
2. Verifică numele exact din header-ul nodului
3. Poate fi: "Edit Image", "HTTP Request", "HTTP Request1", "KIE.AI Request", etc.

### Pas 2: Folosește numele exact în expresie

În nodul "Get Image1", pentru URL:

**Dacă nodul se numește "Edit Image"**:
```
https://api.kie.ai/api/v1/jobs/{{ $('Edit Image').item.json.job_id }}
```

**Dacă nodul se numește "HTTP Request"**:
```
https://api.kie.ai/api/v1/jobs/{{ $('HTTP Request').item.json.job_id }}
```

**Dacă nodul se numește "HTTP Request1"**:
```
https://api.kie.ai/api/v1/jobs/{{ $('HTTP Request1').item.json.job_id }}
```

### Pas 3: Soluție alternativă - Folosește referință relativă

Dacă "Get Image1" este conectat direct după "Edit Image", poți folosi:

```
https://api.kie.ai/api/v1/jobs/{{ $json.job_id }}
```

Aceasta accesează `job_id` din nodul anterior direct, fără să specifice numele.

## Verificare: Ce noduri ai disponibile?

Adaugă un nod Code pentru debugging:

```javascript
// Încearcă să acceseze job_id din diferite noduri
return [{
  json: {
    // Referință relativă (nodul anterior)
    relativeJobId: $input.item.json.job_id,
    
    // Referințe explicite (verifică dacă există)
    editImageJobId: $('Edit Image') ? $('Edit Image').item.json.job_id : 'Edit Image not found',
    httpRequestJobId: $('HTTP Request') ? $('HTTP Request').item.json.job_id : 'HTTP Request not found',
    httpRequest1JobId: $('HTTP Request1') ? $('HTTP Request1').item.json.job_id : 'HTTP Request1 not found',
    
    // Verificare disponibilitate
    hasEditImage: !!$('Edit Image'),
    hasHttpRequest: !!$('HTTP Request'),
    hasHttpRequest1: !!$('HTTP Request1')
  }
}];
```

Aceasta îți va arăta exact ce noduri există și care funcționează.

## Soluție recomandată

Folosește referința relativă dacă nodurile sunt conectate direct:

```
https://api.kie.ai/api/v1/jobs/{{ $json.job_id }}
```

Aceasta este cea mai sigură metodă și funcționează indiferent de numele nodului.

