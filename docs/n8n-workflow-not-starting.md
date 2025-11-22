# Fix: Workflow n8n nu pornește după Webhook

## Problema

Webhook-ul primește datele (vezi poza în webhook), dar workflow-ul nu pornește.

## Cauze posibile

### 1. Workflow-ul nu este activat

**Verificare**:
- Mergi în n8n la workflow-ul tău
- Verifică dacă toggle-ul "Active" este ON (verde)
- Dacă este OFF, activează-l

### 2. "Respond" este setat pe "Immediately"

**Problema**: Când "Respond" este "Immediately", webhook-ul răspunde imediat și workflow-ul se poate opri.

**Soluție**:
1. Deschide nodul Webhook
2. În secțiunea "Respond", schimbă la:
   - **"When Last Node Finishes"** - așteaptă finalizarea workflow-ului
   - SAU **"Using 'Respond to Webhook' Node"** - folosește un nod dedicat la final

### 3. Eroare în primul nod după Webhook

**Verificare**:
1. Rulează workflow-ul manual (Execute Workflow)
2. Verifică dacă există erori în nodurile după Webhook
3. Verifică logs-urile din n8n

### 4. Datele nu sunt în formatul așteptat

**Verificare**:
Adaugă un nod Code după Webhook pentru debugging:

```javascript
return [{
  json: {
    received: $input.item.json,
    body: $input.item.json.body,
    hasPrompt: !!$input.item.json.body?.prompt,
    hasImage: !!$input.item.json.body?.image,
    imageType: typeof $input.item.json.body?.image,
    imageLength: $input.item.json.body?.image?.length || 0
  }
}];
```

Aceasta îți va arăta exact ce primește webhook-ul.

## Soluție pas cu pas

### Pas 1: Verifică activarea workflow-ului

1. Deschide workflow-ul în n8n
2. Verifică dacă toggle-ul "Active" este ON (verde)
3. Dacă nu, activează-l

### Pas 2: Configurează corect Webhook

1. Deschide nodul Webhook
2. În secțiunea "Respond":
   - Selectează **"When Last Node Finishes"**
   - SAU **"Using 'Respond to Webhook' Node"** și adaugă nodul "Respond to Webhook" la final

### Pas 3: Verifică nodurile după Webhook

1. Rulează workflow-ul manual (Execute Workflow)
2. Verifică dacă toate nodurile funcționează
3. Dacă există erori, corectează-le

### Pas 4: Testează webhook-ul

1. Folosește butonul "Listen for test event" în nodul Webhook
2. Trimite o cerere de test din Next.js
3. Verifică dacă workflow-ul pornește

## Configurare corectă Webhook

```
Webhook Settings:
- Path: /reclama
- Method: POST
- Authentication: None
- Respond: When Last Node Finishes ✅ (NU "Immediately"!)
- Response Data: All Entries
```

## Debugging avansat

### Verifică execution history

1. Mergi la "Executions" în n8n
2. Verifică dacă există execuții pentru workflow-ul tău
3. Dacă există, verifică statusul (Success/Failed/Error)
4. Dacă sunt erori, verifică detalii

### Testează direct webhook-ul

Folosește curl sau Postman pentru a testa direct webhook-ul:

```bash
curl -X POST https://agentie-reclame.app.n8n.cloud/webhook/reclama \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "test",
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
  }'
```

Verifică dacă workflow-ul pornește.

## Dacă tot nu funcționează

1. **Verifică logs-urile n8n**: Poate există erori ascunse
2. **Verifică versiunea n8n**: Actualizează la ultima versiune
3. **Verifică permisiunile**: Asigură-te că workflow-ul are permisiuni să ruleze
4. **Contactează suport n8n**: Dacă problema persistă

