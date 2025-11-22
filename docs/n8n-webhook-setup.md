# Configurare n8n Webhook pentru Site

## Endpoint Webhook

URL-ul webhook-ului n8n este:
```
https://agentie-reclame.app.n8n.cloud/webhook/reclama
```

## Formatul datelor trimise de Next.js

Next.js trimite către n8n webhook următoarele date:

```json
{
  "prompt": "Descriere produs",
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "timestamp": "2025-11-21T15:00:00.000Z"
}
```

### Detalii:
- `prompt`: String - descrierea produsului
- `image`: String - base64 encoded image cu prefix `data:image/[type];base64,`
- `timestamp`: String ISO - timestamp-ul cererii

## Configurare n8n Webhook

### 1. Configurare Webhook Trigger

**Tip**: Webhook
**Metodă**: POST
**Path**: `/reclama`

**Setări**:
- Authentication: None (sau Basic Auth pentru securitate)
- **Respond**: "When Last Node Finishes" SAU "Using 'Respond to Webhook' Node" (NU "Immediately"!)
- Response Data: All Entries

**IMPORTANT**: 
- Dacă "Respond" este setat pe "Immediately", webhook-ul răspunde imediat și workflow-ul se poate opri
- Folosește "When Last Node Finishes" pentru a aștepta finalizarea workflow-ului
- SAU folosește "Using 'Respond to Webhook' Node" și adaugă un nod "Respond to Webhook" la final

### 2. Nod Code pentru procesare date

După Webhook, adaugă un nod Code pentru a extrage base64:

**Code**:
```javascript
const items = $input.all();

return items.map(item => {
  const prompt = item.json.body?.prompt || item.json.prompt || '';
  const imageBase64 = item.json.body?.image || item.json.image || '';
  const options = item.json.body?.options || item.json.options || {};
  
  // Extrage doar base64 (fără prefix "data:image/...;base64,")
  let base64Only = '';
  
  if (typeof imageBase64 === 'string' && imageBase64.startsWith('data:')) {
    const parts = imageBase64.split(',');
    base64Only = parts.length > 1 ? parts[1] : imageBase64;
  } else {
    base64Only = imageBase64;
  }
  
  // Procesează opțiunile cu valori default
  const processedOptions = {
    aspect_ratio: options.aspect_ratio || '1:1',
    width: options.width || 1024,
    height: options.height || 1024,
    style: options.style || 'professional',
    negative_prompt: options.negative_prompt || 'blurry, low quality, distorted',
    guidance_scale: options.guidance_scale || 7.5,
    num_inference_steps: options.num_inference_steps || 20
  };
  
  return {
    json: {
      prompt: prompt,
      imageBase64: base64Only,
      options: processedOptions,
      timestamp: item.json.body?.timestamp || item.json.timestamp
    }
  };
});
```

### 3. Nod "Get URL" (imgbb.com)

**Parameter 1 (key)**:
- Name: `key`
- Parameter Type: Form Data
- Value: `={{ $env.IMGBB_API_KEY }}`

**Parameter 2 (image)**:
- Name: `image`
- Parameter Type: Form Data
- Value: `={{ $json.imageBase64 }}`

## Configurare Next.js

### Variabile de mediu

Creează fișierul `.env.local`:

```bash
N8N_WEBHOOK_URL=https://agentie-reclame.app.n8n.cloud/webhook/reclama
```

Sau lasă gol - codul folosește URL-ul default.

### Testare

1. Pornește Next.js: `npm run dev`
2. Accesează http://localhost:3000
3. Completează formularul cu prompt și imagine
4. Click pe "Generează Reclamă"
5. Verifică în n8n dacă workflow-ul rulează

## Structura completă workflow n8n

```
Webhook (/reclama) 
  → Code (Extract Base64) 
  → Get URL (imgbb.com) 
  → Edit Image (KIE.AI) 
  → Wait 
  → Get Image Status 
  → Switch (success/generating/fail) 
  → Result (Respond to Webhook)
```

## Debugging

Dacă nu funcționează, adaugă un nod Code după Webhook pentru debugging:

```javascript
return [{
  json: {
    body: $input.item.json.body,
    hasPrompt: !!$input.item.json.body?.prompt,
    hasImage: !!$input.item.json.body?.image,
    imageType: typeof $input.item.json.body?.image,
    imageLength: $input.item.json.body?.image?.length || 0,
    imagePreview: $input.item.json.body?.image?.substring(0, 50) || 'N/A'
  }
}];
```

Aceasta îți va arăta exact ce date primește webhook-ul.

