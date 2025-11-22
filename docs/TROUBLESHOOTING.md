# Troubleshooting - Erori Comune

## Eroare: "Missing Supabase environment variables" la Deploy pe Vercel

### Cauză:
Variabilele de mediu Supabase nu sunt configurate în Vercel Dashboard.

### Soluție Rapidă:

1. **Mergi la Vercel Dashboard**
   - Accesează [https://vercel.com/dashboard](https://vercel.com/dashboard)
   - Selectează proiectul tău

2. **Adaugă Variabilele de Mediu**
   - Mergi la **Settings** → **Environment Variables**
   - Adaugă următoarele variabile:

   ```
   NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = sb_publishable_...
   SUPABASE_SERVICE_ROLE_KEY = sb_secret_... (opțional)
   N8N_WEBHOOK_URL = https://your-n8n-instance.com/webhook/... (dacă folosești)
   ```

3. **Important:**
   - Selectează **Production, Preview, Development** pentru fiecare variabilă
   - Fă **Redeploy** după adăugarea variabilelor

4. **Verifică:**
   - Build-ul ar trebui să reușească
   - Aplicația ar trebui să funcționeze corect

**Vezi ghidul complet:** `docs/VERCEL-DEPLOY.md`

---

# Troubleshooting - Erori Comune n8n

## Eroare: "source.on is not a function" la nodul HTTP Request

### Cauze posibile:

1. **Format greșit pentru form-data**
2. **Content-Type setat manual când nu trebuie**
3. **Datele nu sunt în formatul corect**

### Soluție pentru nodul "Get URL":

#### Pas 1: Verifică configurarea Body și Headers
1. Deschide nodul "Get URL"
2. Asigură-te că:
   - ✅ "Send Body" este bifat
   - ✅ "Body Content Type" este setat la **"Form-Data"** (NU "Form Urlencoded")
   - ❌ **NU adăuga header manual pentru Content-Type**
   - ❌ **Dacă vezi în Headers "Content-Type: application/x-www-form-urlencoded", ȘTERGE-L COMPLET!**
   - n8n va seta automat `multipart/form-data` când folosești Form-Data

#### Pas 2: Verifică Body Parameters
În secțiunea "Specify Body" → "Body Parameters":

**Parameter 1:**
- Name: `key`
- Value: `={{ $env.IMGBB_API_KEY }}`

**Parameter 2:**
- Name: `image`
- Value: `={{ $json.body.image }}`

#### Pas 3: Verifică formatul imaginii

Dacă primești eroare, verifică formatul datelor care vin din webhook:

**Opțiunea 1 - Base64 complet:**
```javascript
data:image/jpeg;base64,/9j/4AAQSkZJRg...
```

**Opțiunea 2 - Doar base64 (fără prefix):**
```javascript
/9j/4AAQSkZJRg...
```

**Pentru imgbb.com, ambele formate funcționează**, dar dacă ai probleme, încearcă să extragi doar partea de base64:

```javascript
{{ $json.body.image.replace(/^data:image\/[a-z]+;base64,/, '') }}
```

#### Pas 4: Verifică datele din nodul anterior

Adaugă un nod "Code" sau "Set" între Webhook și "Get URL" pentru a verifica datele:

```javascript
// În nodul Code
return [{
  json: {
    original: $input.item.json,
    body: $input.item.json.body,
    imageType: typeof $input.item.json.body?.image,
    imageLength: $input.item.json.body?.image?.length
  }
}];
```

### Soluție alternativă - Folosește "Form Urlencoded"

Dacă "Form-Data" nu funcționează, încearcă "Form Urlencoded":

1. Setează "Content Type" la **"Form Urlencoded"**
2. Folosește același format pentru Body Parameters
3. imgbb.com acceptă ambele formate

### Soluție alternativă - Trimite direct URL

Dacă ai deja un URL al imaginii (nu base64), poți să-l trimiți direct:

**Parameter 2:**
- Name: `image`
- Value: `={{ $json.body.image }}` (direct URL-ul)

## Eroare: "Cannot read property 'data' of undefined"

### Cauză:
Nodul "Get URL" nu returnează datele în formatul așteptat.

### Soluție:
1. Verifică răspunsul din nodul "Get URL" - rulează workflow-ul până la acest nod
2. Verifică structura răspunsului imgbb:
   ```json
   {
     "data": {
       "url": "..."
     }
   }
   ```
3. Dacă structura este diferită, ajustează expresia în nodul următor:
   ```javascript
   {{ $json.data.url }}
   ```

## Eroare: "job_id is not defined" la nodul "Get Image1"

### Cauză:
Nodul "Edit Image" nu returnează `job_id` în formatul așteptat.

### Soluție:
1. Verifică răspunsul API-ului KIE.AI
2. Poate că câmpul se numește diferit (ex: `id`, `task_id`, `jobId`)
3. Ajustează expresia în nodul "Get Image1":
   ```javascript
   // În loc de:
   {{ $('Edit Image').item.json.job_id }}
   
   // Încearcă:
   {{ $('Edit Image').item.json.id }}
   // sau
   {{ $('Edit Image').item.json.task_id }}
   ```

## Eroare: Timeout la nodul "Get Image1"

### Cauză:
Job-ul durează mai mult decât timeout-ul setat.

### Soluție:
1. Mărește timeout-ul în nodul "Get Image1":
   - Options → Timeout: 60000ms (sau mai mult)
2. Mărește numărul de iterații în loop:
   - În nodul "Wait1" sau în configurarea loop-ului
3. Verifică statusul job-ului direct în API-ul KIE.AI

## Workflow-ul se blochează în loop infinit

### Cauză:
Statusul rămâne "generating" și loop-ul nu se oprește.

### Soluție:
1. Adaugă o limită de iterații în nodul "Wait1" sau în configurarea loop-ului
2. Adaugă un nod "IF" care verifică numărul de iterații:
   ```javascript
   {{ $('Wait1').item.json.iteration }} < 20
   ```
3. Adaugă un timeout global pentru workflow

## Datele nu ajung corect la webhook

### Verificare:
1. Testează webhook-ul direct cu Postman:
   ```bash
   curl -X POST https://your-n8n-instance.com/webhook/generate-ad \
     -H "Content-Type: application/json" \
     -d '{"prompt": "test", "image": "data:image/jpeg;base64,..."}'
   ```

2. Verifică logs-urile din n8n
3. Adaugă un nod "Code" după webhook pentru a vedea ce primești:
   ```javascript
   return [{ json: $input.item.json }];
   ```

## Debugging Tips

### 1. Adaugă noduri "Code" pentru debugging
```javascript
// După fiecare nod important, adaugă:
return [{
  json: {
    previous: $input.item.json,
    debug: "Check this node"
  }
}];
```

### 2. Folosește "Execute Workflow" cu "Execute Once"
- Rulează workflow-ul pas cu pas
- Verifică output-ul fiecărui nod

### 3. Verifică variabilele de mediu
- Settings → Environment Variables
- Asigură-te că `IMGBB_API_KEY` și `KIE_AI_API_KEY` sunt setate corect

### 4. Testează API-urile direct
- Testează imgbb.com direct cu Postman
- Testează KIE.AI API direct
- Compară răspunsurile cu ce primești în n8n

## Contact

Dacă problemele persistă:
1. Verifică logs-urile complete din n8n
2. Verifică documentația API-urilor:
   - imgbb: https://api.imgbb.com/
   - KIE.AI: https://api.kie.ai/docs
3. Verifică versiunea n8n (ar trebui să fie >= 1.0)

