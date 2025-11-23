# Fix pentru Eroare "Cannot assign to read only property 'name'"

## Problema

Eroare: `Cannot assign to read only property 'name' of object 'Error: Referenced node doesn't exist'`

Această eroare apare când codul încearcă să acceseze un nod care nu există sau are un nume diferit.

## Soluție: Cod Corectat pentru "Parse Response"

Înlocuiește codul din nodul **Parse Response** cu următorul:

```javascript
const response = $input.item.json;

// AI Agent returnează textul în diferite locații posibile
let generatedText = '';

// Verifică output-ul direct (format AI Agent)
if (response.output) {
  generatedText = String(response.output).trim();
}
// Verifică text
else if (response.text) {
  generatedText = String(response.text).trim();
}
// Verifică message.content
else if (response.message?.content) {
  generatedText = String(response.message.content).trim();
}
// Verifică choices (format similar OpenAI)
else if (response.choices && response.choices.length > 0) {
  const firstChoice = response.choices[0];
  if (firstChoice.message?.content) {
    generatedText = String(firstChoice.message.content).trim();
  }
}
// Verifică în răspunsul complet (pentru debugging)
else if (response.data?.output) {
  generatedText = String(response.data.output).trim();
}
else if (response.data?.text) {
  generatedText = String(response.data.text).trim();
}
// Fallback - verifică întregul obiect pentru debugging
else {
  // Dacă nu găsește, arată întregul răspuns pentru debugging
  generatedText = JSON.stringify(response, null, 2);
}

// Încearcă să obțină originalPrompt din input-ul anterior (fără referință la nod)
// Folosește datele din input-ul curent sau lasă null
let originalPrompt = null;
try {
  // Verifică dacă există în input
  if ($input.first()?.json?.originalPrompt) {
    originalPrompt = $input.first().json.originalPrompt;
  }
  // Sau verifică în răspuns
  else if (response.originalPrompt) {
    originalPrompt = response.originalPrompt;
  }
} catch (e) {
  // Ignoră eroarea dacă nu poate accesa
  originalPrompt = null;
}

return [{
  json: {
    success: true,
    text: generatedText,
    model: response.model || 'gemini-1.5-flash',
    originalPrompt: originalPrompt,
    timestamp: new Date().toISOString()
  }
}];
```

## Pași pentru Aplicare

1. Deschide workflow-ul în n8n
2. Click pe nodul **Parse Response** (sau "Parse OpenAI Response")
3. Înlocuiește tot codul JavaScript cu codul de mai sus
4. Click **Save**
5. Testează workflow-ul

## Explicație

Problema era în linia:
```javascript
originalPrompt: $('Build Copywriting Prompt').item.json.originalPrompt,
```

Această referință la nod nu funcționează dacă:
- Nodul nu există
- Nodul are un nume diferit
- Nodul nu este accesibil din contextul curent

**Soluția**: Folosim `$input.first()` pentru a accesa datele din input-ul anterior, fără să ne bazăm pe numele nodului.

## Verificare

După aplicarea fix-ului, testează workflow-ul. Eroarea ar trebui să dispară.

## Alternative

Dacă vrei să păstrezi `originalPrompt`, poți:
1. Păstra-l în output-ul nodului "Build Copywriting Prompt"
2. Să fie transmis prin toate nodurile
3. Să fie accesat din `$input.first().json.originalPrompt`

