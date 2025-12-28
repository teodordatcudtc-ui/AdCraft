# Workflow n8n Unificat pentru Tool-uri (Text-Based)

Acest document descrie configurarea unui workflow n8n optimizat care procesează tool-urile bazate pe text într-un singur workflow.

**NOTĂ IMPORTANTĂ**: 
- Tool-ul "Design Publicitar" (generare imagini) folosește un workflow separat și nu este inclus aici. Vezi `docs/n8n-workflow-config.md` pentru workflow-ul de generare imagini.
- Tool-ul "Analiză de Piață & Concurență" necesită căutare web reală. Asigură-te că AI Agent-ul are tool-urile de căutare web activate (vezi instrucțiunile în secțiunea tool-ului).

## Structura Workflow-ului

Workflow-ul constă din următoarele noduri:

1. **Webhook Trigger** - Primește cereri de la API
2. **Switch Node** - Rutează către tool-ul specific (5 outputs - câte unul pentru fiecare tool)
3. **Code Nodes** - Pregătesc datele pentru fiecare tool (5 noduri Code, câte unul pentru fiecare output din Switch)
4. **AI Agent Node (Gemini)** - **UN SINGUR NOD** care procesează toate tool-urile (toate nodurile Code se conectează aici)
5. **Code Node (Parse Response)** - Parsează răspunsul (un singur nod)
6. **Respond to Webhook** - Returnează rezultatul (un singur nod)

**IMPORTANT**: 
- Switch are 5 outputs (câte unul pentru fiecare tool)
- Fiecare output are propriul nod "Code: Build Prompt"
- **PENTRU "analiza-piata"**: După "Code: Build Search Queries", adaugă 2 noduri HTTP Request (pentru video-uri și creatori), apoi "Code: Format Results" și "Code: Build Prompt"
- **TOATE nodurile Code (sau ultimul nod pentru fiecare tool) se conectează la ACELAȘI nod AI Agent**
- Un singur nod Parse Response și Respond to Webhook la final

## Configurare Noduri

### 1. Webhook Trigger

**Tip**: Webhook
**Metodă**: POST
**Path**: `/webhook/tools`

**Setări**:
- Authentication: None
- Response Mode: Respond When Last Node Finishes
- Response Data: All Entries

**Date primite**:
```json
{
  "toolId": "strategie-client",
  "inputs": {
    "businessType": "...",
    "sellType": "...",
    "priceRange": "...",
    "targetAudience": "...",
    "objective": "..."
  },
  "businessContext": {
    "businessType": "Service auto",
    "businessDescription": "Service auto specializat în reparații..."
  },
  "timestamp": "2025-01-21T..."
}
```

**NOTĂ**: `businessContext` este opțional și conține informații despre business-ul utilizatorului (din profil). Aceste date sunt folosite pentru a oferi context AI-ului în toate generările.

### 2. Switch Node - Route by Tool ID

**Tip**: Switch
**Mode**: Rules

**Rules** (câte una pentru fiecare tool text-based):
1. `strategie-client` → Output: strategie-client
2. `analiza-piata` → Output: analiza-piata
3. `copywriting` → Output: copywriting
4. `planificare-conținut` → Output: planificare-conținut
5. `strategie-video` → Output: strategie-video

**NOTĂ**: `design-publicitar` NU este inclus aici - folosește workflow-ul separat pentru generare imagini.

**Condition pentru fiecare rule**:
```
{{ $json.toolId }} equals "strategie-client"
```

**IMPORTANT - Structura Workflow-ului**:
```
Webhook
  ↓
Switch (rutează pe tool-ul specific)
  ├─ strategie-client → Code (Build Prompt) ─┐
  ├─ analiza-piata → Code (Build Search Queries) → HTTP Request (Videos) → HTTP Request (Creators) → Code (Format Results) → Code (Build Prompt) ─┤
  ├─ copywriting → Code (Build Prompt) ──────┤
  ├─ planificare-conținut → Code (Build Prompt) ─┤
  └─ strategie-video → Code (Build Prompt) ───┤
                                               ↓
                                    AI Agent (UN SINGUR NOD)
                                               ↓
                                    Parse Response
                                               ↓
                                    Respond to Webhook
```

**Toate ramurile se conectează la același nod AI Agent!**

**NOTĂ SPECIALĂ pentru "analiza-piata"**: 
- Acest tool necesită căutare web reală pentru a găsi link-uri reale
- Folosește DuckDuckGo (gratuit, fără API key) pentru căutare
- Vezi secțiunea detaliată mai jos pentru configurarea nodurilor suplimentare

### 3. Code Node - Build Prompt pentru fiecare tool

**IMPORTANT - Template pentru businessContext**:
Toate nodurile Code trebuie să extragă `businessContext` din body și să-l includă în prompt dacă este disponibil:

```javascript
const businessContext = body.businessContext || {};

// La sfârșitul prompt-ului, înainte de instrucțiunile JSON, adaugă:
if (businessContext.businessType || businessContext.businessDescription) {
  prompt += `\n\n**Context despre business-ul utilizatorului:**`;
  if (businessContext.businessType) {
    prompt += `\n- Tip business: ${businessContext.businessType}`;
  }
  if (businessContext.businessDescription) {
    prompt += `\n- Descriere: ${businessContext.businessDescription}`;
  }
  prompt += `\nFolosește aceste informații pentru a genera conținut mai precis și relevant pentru acest business.`;
}
```

Acest context ajută AI-ul să genereze conținut mai relevant și personalizat pentru business-ul utilizatorului.

#### Tool 1: Strategie de Client & Mesaj

**Code**:
```javascript
// Datele de la Webhook sunt în body
const body = $input.item.json.body || $input.item.json;
const inputs = body.inputs || {};
const toolId = body.toolId || $input.item.json.toolId;
const businessContext = body.businessContext || {};

// Construiește prompt-ul pentru strategie client
let prompt = `Analizează următoarea afacere și creează o strategie de mesaj:

Tip afacere/produs: ${inputs.businessType}
Vinde: ${inputs.sellType === 'online' ? 'online' : inputs.sellType === 'local' ? 'local' : 'online și local'}
Preț: ${inputs.priceRange === 'low' ? 'mic' : inputs.priceRange === 'medium' ? 'mediu' : 'mare'}
Cui vinde: ${inputs.targetAudience}
Obiectiv: ${inputs.objective === 'sales' ? 'vânzări' : 'lead-uri'}`;

// Adaugă context despre business dacă este disponibil
if (businessContext.businessType || businessContext.businessDescription) {
  prompt += `\n\n**Context despre business-ul utilizatorului:**`;
  if (businessContext.businessType) {
    prompt += `\n- Tip business: ${businessContext.businessType}`;
  }
  if (businessContext.businessDescription) {
    prompt += `\n- Descriere: ${businessContext.businessDescription}`;
  }
  prompt += `\nFolosește aceste informații pentru a crea o strategie mai precisă și relevantă.`;
}

prompt += `

Generează:
1. Descriere clară a clientului ideal
2. Problema principală a clientului
3. Promisiunea care îl atrage
4. 3-5 mesaje recomandate
5. 3-5 mesaje de evitat

Răspunde în format JSON:
{
  "idealClient": "...",
  "mainProblem": "...",
  "promise": "...",
  "recommendedMessages": ["...", "..."],
  "messagesToAvoid": ["...", "..."]
}`;

return [{
  json: {
    toolId: $input.item.json.toolId,
    prompt: prompt,
    model: "gemini-pro",
    maxTokens: 1000,
    temperature: 0.7
  }
}];
```

#### Tool 2: Analiză de Piață & Concurență

**⚠️ IMPORTANT**: Acest tool necesită căutare web reală! Structură specială cu noduri HTTP Request pentru căutare.

**NOTĂ**: businessContext este inclus în nodul "Code: Build Prompt" (Pasul 5), nu în "Code: Build Search Queries".

**Structură specială pentru "analiza-piata"**:
```
Switch (analiza-piata output)
  ↓
Code: Build Search Queries
  ↓
HTTP Request 1: Search Videos (DuckDuckGo)
  ↓
HTTP Request 2: Search Creators (DuckDuckGo)
  ↓
Code: Format Search Results
  ↓
Code: Build Prompt (cu link-uri reale)
  ↓
AI Agent
```

##### Pas 1: Code Node - Build Search Queries

**Code**:
```javascript
// IMPORTANT: Datele de la Webhook sunt în body, nu direct în json!
const body = $input.item.json.body || $input.item.json;
const inputs = body.inputs || {};
const toolId = body.toolId || $input.item.json.toolId;

if (!inputs || !inputs.niche) {
  throw new Error('Missing required inputs: niche is required');
}

const location = inputs.location ? ` ${inputs.location}` : '';
const platformDomain = inputs.platform === 'instagram' ? 'instagram.com' : 
                       inputs.platform === 'tiktok' ? 'tiktok.com' : 
                       'facebook.com';

// Query pentru video-uri populare
const videoQuery = `site:${platformDomain} ${inputs.niche}${location} popular viral trending videos`;

// Query pentru creatori de succes
const creatorQuery = `site:${platformDomain} ${inputs.niche}${location} successful creators influencers`;

return [{
  json: {
    toolId: toolId,
    inputs: inputs,
    videoQuery: videoQuery,
    creatorQuery: creatorQuery,
    platform: inputs.platform,
    platformDomain: platformDomain
  }
}];
```

##### Pas 2: HTTP Request 1 - Search Videos (DuckDuckGo)

**Tip**: HTTP Request
**Method**: GET
**URL**: `https://html.duckduckgo.com/html/`

**Query Parameters**:
- `q`: `={{ $json.videoQuery }}`

**IMPORTANT**: 
- Conectează acest nod DIRECT după nodul "Code: Build Search Queries"
- Folosește `$json.videoQuery` pentru a accesa datele direct din nodul Code anterior

**Headers**:
- `User-Agent`: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36`

**Options**:
- Response Format: `Text`

##### Pas 3: HTTP Request 2 - Search Creators (DuckDuckGo)

**Tip**: HTTP Request
**Method**: GET
**URL**: `https://html.duckduckgo.com/html/`

**Query Parameters**:
- `q`: `={{ $json.creatorQuery }}`

**IMPORTANT**: 
- Conectează acest nod DIRECT după nodul "Code: Build Search Queries" (nu după primul HTTP Request)
- Astfel, ambele HTTP Request-uri (Videos și Creators) vor rula în paralel și ambele vor avea acces la datele din Code
- Folosește `$json.creatorQuery` pentru a accesa datele direct din nodul Code anterior

**Headers**:
- `User-Agent`: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36`

**Options**:
- Response Format: `Text`

##### Pas 4: Code Node - Format Search Results

**IMPORTANT**: 
- Conectează acest nod după AMBELE noduri HTTP Request (Videos și Creators)
- În n8n, conectează ambele HTTP Request-uri la acest nod Code (vor merge ambele rezultate în același nod)

**Code**:
```javascript
// Primește rezultatele căutărilor
// n8n va trimite ambele rezultate (din ambele HTTP Request-uri) către acest nod
// Trebuie să identificăm care este pentru video-uri și care pentru creatori

let videoSearchHtml = '';
let creatorSearchHtml = '';
let queryData = null;

// Parcurge toate input-urile pentru a găsi rezultatele
const allInputs = $input.all();
const htmlResults = [];

for (let i = 0; i < allInputs.length; i++) {
  const item = allInputs[i];
  const json = item.json || {};
  
  // Verifică dacă este rezultatul căutării (are data, body sau este HTML)
  const htmlContent = json.data || json.body || (typeof json === 'string' ? json : '');
  
  if (htmlContent && typeof htmlContent === 'string' && (htmlContent.includes('html') || htmlContent.includes('<!DOCTYPE'))) {
    // Adaugă HTML-ul în listă
    htmlResults.push(htmlContent);
  } else if (json.videoQuery || json.creatorQuery) {
    // Acesta este nodul Code original cu datele
    queryData = json;
  }
}

// Primul HTML este pentru video-uri, al doilea pentru creatori
if (htmlResults.length > 0) {
  videoSearchHtml = htmlResults[0] || '';
}
if (htmlResults.length > 1) {
  creatorSearchHtml = htmlResults[1] || '';
}

// Extrage informații despre platformă din HTML (pentru a reconstrui queryData dacă nu există)
let detectedPlatform = null;
let detectedNiche = null;
let detectedLocation = null;

if (videoSearchHtml || creatorSearchHtml) {
  const htmlToCheck = videoSearchHtml || creatorSearchHtml;
  
  // Caută în HTML query-ul de căutare pentru a extrage platforma
  const platformMatch = htmlToCheck.match(/site:(\w+\.com)/i);
  if (platformMatch) {
    const domain = platformMatch[1];
    if (domain.includes('instagram')) {
      detectedPlatform = 'instagram';
    } else if (domain.includes('tiktok')) {
      detectedPlatform = 'tiktok';
    } else if (domain.includes('facebook')) {
      detectedPlatform = 'facebook';
    }
  }
  
  // Caută query-ul complet din input-ul de căutare
  const queryMatch = htmlToCheck.match(/<input[^>]*name="q"[^>]*value="([^"]+)"/i);
  if (queryMatch) {
    const fullQuery = queryMatch[1];
    // Extrage nișa din query (ex: "site:facebook.com service auto Romania popular viral trending videos")
    // Format: site:platform.com niche location keywords
    const parts = fullQuery.split(/\s+/);
    let nicheParts = [];
    let foundSite = false;
    
    for (let i = 0; i < parts.length; i++) {
      if (parts[i].startsWith('site:')) {
        foundSite = true;
        continue;
      }
      if (foundSite) {
        // Oprește când găsește locația sau cuvintele cheie
        if (parts[i].match(/^(Romania|România|Bucharest|Cluj|București)$/i)) {
          detectedLocation = parts[i];
          break;
        }
        if (parts[i].match(/^(popular|viral|trending|videos|creators|influencers|successful)$/i)) {
          break;
        }
        nicheParts.push(parts[i]);
      }
    }
    
    detectedNiche = nicheParts.join(' ').trim();
    
    // Dacă nu am găsit locația, verifică din query
    if (!detectedLocation && fullQuery.match(/Romania|România/i)) {
      detectedLocation = 'Romania';
    }
  }
  
  // Reconstruiește queryData dacă nu există
  if (!queryData && detectedPlatform) {
    queryData = {
      toolId: 'analiza-piata',
      inputs: {
        niche: detectedNiche || 'unknown',
        platform: detectedPlatform,
        location: detectedLocation || null
      },
      platform: detectedPlatform,
      platformDomain: detectedPlatform === 'instagram' ? 'instagram.com' : 
                      detectedPlatform === 'tiktok' ? 'tiktok.com' : 
                      'facebook.com'
    };
  }
}

// Dacă nu am găsit queryData, încearcă să-l găsim din nodurile anterioare
if (!queryData) {
  try {
    // Încearcă să găsească nodul Code anterior - folosește numele exact din workflow
    const codeNodeNames = [
      'Code in JavaScript',   // Numele exact din workflow-ul tău
      'Code in JavaScript1',  // Numele exact din workflow-ul tău
      'Code', 
      'Build Search Queries', 
      'Code: Build Search Queries',
      'JavaScript',
      'JavaScript1'
    ];
    
    for (const nodeName of codeNodeNames) {
      try {
        const nodeData = $(nodeName);
        if (nodeData && nodeData.item && nodeData.item.json) {
          const json = nodeData.item.json;
          if (json.videoQuery || json.creatorQuery || json.toolId) {
            queryData = json;
            break;
          }
        }
      } catch (e) {
        // Continuă cu următorul nume
      }
    }
  } catch (e) {
    // Ignoră eroarea
  }
  
  // Dacă tot nu am găsit, încearcă să accesezi direct din nodurile HTTP Request
  if (!queryData) {
    try {
      // Încearcă să găsească datele originale din nodurile HTTP Request
      const httpNodeNames = ['HTTP Request', 'HTTP Request1'];
      for (const httpNodeName of httpNodeNames) {
        try {
          const httpNode = $(httpNodeName);
          if (httpNode && httpNode.item && httpNode.item.json) {
            // Verifică dacă are datele originale (nu HTML)
            const httpJson = httpNode.item.json;
            if (httpJson.videoQuery || httpJson.creatorQuery) {
              queryData = httpJson;
              break;
            }
          }
        } catch (e) {
          // Continuă cu următorul
        }
      }
    } catch (e) {
      // Ignoră eroarea
    }
  }
}

// Dacă tot nu am găsit queryData, folosește datele din Webhook
if (!queryData) {
  try {
    const webhookNodeNames = ['Webhook', 'On Webhook Call', 'Webhook Trigger'];
    for (const webhookName of webhookNodeNames) {
      try {
        const webhookData = $(webhookName);
        if (webhookData && webhookData.item && webhookData.item.json) {
          const body = webhookData.item.json.body || webhookData.item.json;
          if (body && body.inputs && body.toolId) {
            // Reconstruiește queryData din datele webhook
            const inputs = body.inputs || {};
            const platformDomain = inputs.platform === 'instagram' ? 'instagram.com' : 
                                 inputs.platform === 'tiktok' ? 'tiktok.com' : 
                                 'facebook.com';
            queryData = {
              toolId: body.toolId,
              inputs: inputs,
              platform: inputs.platform,
              platformDomain: platformDomain
            };
            break;
          }
        }
      } catch (e) {
        // Continuă cu următorul
      }
    }
  } catch (e) {
    // Ultimă încercare - folosește valori default bazate pe platform
    throw new Error('Nu s-au găsit datele originale. Verifică că ambele HTTP Request-uri sunt conectate direct după nodul Code (nu unul după altul) și că nodul Code returnează datele corecte.');
  }
}

// Funcție simplă pentru a extrage link-uri din HTML
function extractLinks(html, platformDomain) {
  if (!html || typeof html !== 'string') {
    return [];
  }
  
  const links = [];
  
  // Extrage link-uri din DuckDuckGo redirect-uri (format: //duckduckgo.com/l/?uddg=URL_ENCODED&rut=...)
  const duckDuckGoRegex = /\/\/duckduckgo\.com\/l\/\?uddg=([^&"'\s<>]+)/gi;
  const duckDuckGoMatches = html.match(duckDuckGoRegex);
  
  if (duckDuckGoMatches) {
    duckDuckGoMatches.forEach((match, idx) => {
      try {
        // Extrage URL-ul din parametrul uddg
        const uddgMatch = match.match(/uddg=([^&]+)/);
        if (uddgMatch) {
          const encodedUrl = uddgMatch[1];
          // Decodează URL-ul
          const decodedUrl = decodeURIComponent(encodedUrl);
          
          // Verifică dacă URL-ul este către platforma corectă
          if (decodedUrl.includes(platformDomain)) {
            // Extrage titlul din HTML - caută link-ul asociat
            let title = `Result ${idx + 1}`;
            try {
              // Caută titlul înainte sau după link
              const titleMatch = html.match(new RegExp(`<a[^>]*href=["']?${match.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^>]*>([^<]+)</a>`, 'i'));
              if (titleMatch && titleMatch[1]) {
                title = titleMatch[1].trim().replace(/\s+/g, ' ').substring(0, 100);
              } else {
                // Caută în result__title
                const titleMatch2 = html.match(new RegExp(`<h2[^>]*class="result__title"[^>]*>\\s*<a[^>]*href=["']?${match.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^>]*>([^<]+)</a>`, 'i'));
                if (titleMatch2 && titleMatch2[1]) {
                  title = titleMatch2[1].trim().replace(/\s+/g, ' ').substring(0, 100);
                }
              }
            } catch (e) {
              // Folosește titlul default
            }
            
            links.push({
              title: title,
              url: decodedUrl
            });
          }
        }
      } catch (e) {
        // Ignoră link-urile care nu pot fi procesate
      }
    });
  }
  
  // Dacă nu am găsit link-uri prin DuckDuckGo, încearcă să găsească direct link-uri către platformă
  if (links.length === 0) {
    const escapedDomain = platformDomain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const directRegex = new RegExp(`https?://(www\\.)?${escapedDomain}[^"\\s<>'"]+`, 'gi');
    const directMatches = html.match(directRegex);
    
    if (directMatches) {
      const uniqueLinks = [...new Set(directMatches)].slice(0, 5);
      uniqueLinks.forEach((url, idx) => {
        const cleanUrl = url.replace(/[.,;:!?]+$/, '');
        let title = `Result ${idx + 1}`;
        
        try {
          const escapedUrl = cleanUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const titleMatch = html.match(new RegExp(`<a[^>]*href=["']${escapedUrl}[^>]*>([^<]+)</a>`, 'i'));
          if (titleMatch && titleMatch[1]) {
            title = titleMatch[1].trim().substring(0, 100);
          }
        } catch (e) {
          // Folosește titlul default
        }
        
        links.push({
          title: title,
          url: cleanUrl
        });
      });
    }
  }
  
  // Elimină duplicatele și păstrează primele 5 unice
  const uniqueLinks = [];
  const seenUrls = new Set();
  
  for (const link of links) {
    if (!seenUrls.has(link.url) && uniqueLinks.length < 5) {
      seenUrls.add(link.url);
      uniqueLinks.push(link);
    }
  }
  
  return uniqueLinks;
}

const videoLinks = extractLinks(videoSearchHtml, queryData.platformDomain);
const creatorLinks = extractLinks(creatorSearchHtml, queryData.platformDomain);

return [{
  json: {
    toolId: queryData.toolId,
    inputs: queryData.inputs,
    videoLinks: videoLinks,
    creatorLinks: creatorLinks,
    platform: queryData.platform
  }
}];
```

##### Pas 5: Code Node - Build Prompt (pentru AI Agent)

**Code**:
```javascript
const data = $input.item.json;
const inputs = data.inputs || {};
const videoLinks = data.videoLinks || [];
const creatorLinks = data.creatorLinks || [];

// Extrage businessContext din webhook
let businessContext = {};
try {
  const webhookData = $('Webhook');
  if (webhookData && webhookData.item && webhookData.item.json) {
    const body = webhookData.item.json.body || webhookData.item.json;
    businessContext = body.businessContext || {};
  }
} catch (e) {
  // Ignoră eroarea
}

let prompt = `Ești un expert în analiză de piață și marketing digital. Ai primit link-uri REALE găsite prin căutare web pentru:

Nișă/Industrie: ${inputs.niche}
${inputs.location ? `Locație: ${inputs.location}` : ''}
Platformă: ${inputs.platform}

**LINK-URI VIDEO GĂSITE** (folosește DOAR aceste link-uri reale):
${videoLinks.length > 0 ? videoLinks.map((v, i) => `${i + 1}. ${v.title} - ${v.url}`).join('\n') : 'Nu s-au găsit link-uri pentru video-uri.'}

**LINK-URI CREATORI GĂSIȚI** (folosește DOAR aceste link-uri reale):
${creatorLinks.length > 0 ? creatorLinks.map((c, i) => `${i + 1}. ${c.title} - ${c.url}`).join('\n') : 'Nu s-au găsit link-uri pentru creatori.'}

**IMPORTANT**: 
- Folosește DOAR link-urile de mai sus (sunt reale, găsite prin căutare web)
- Nu inventa link-uri sau persoane!
- Analizează link-urile și extrage informații relevante
- Dacă nu sunt suficiente link-uri, folosește doar cele disponibile`;

// Adaugă context despre business dacă este disponibil
if (businessContext.businessType || businessContext.businessDescription) {
  prompt += `\n\n**Context despre business-ul utilizatorului:**`;
  if (businessContext.businessType) {
    prompt += `\n- Tip business: ${businessContext.businessType}`;
  }
  if (businessContext.businessDescription) {
    prompt += `\n- Descriere: ${businessContext.businessDescription}`;
  }
  prompt += `\nFolosește aceste informații pentru a oferi analize mai relevante și personalizate pentru acest business.`;
}

prompt += `\n\nGenerează:
1. Tipuri de reclame populare în nișă (2-3 tipuri)
2. Mesaje folosite frecvent (3-5 mesaje)
3. Stil vizual dominant
4. 2-3 direcții de diferențiere
5. Top 5 cele mai populare video-uri din nișă (folosind link-urile de mai sus, sau mai puține dacă nu sunt suficiente)
6. Top 5 creatorii cei mai de succes din nișă (folosind link-urile de mai sus, sau mai puține dacă nu sunt suficiente)

Răspunde în format JSON:
{
  "popularAdTypes": ["...", "..."],
  "commonMessages": ["...", "..."],
  "visualStyle": "...",
  "differentiationDirections": ["...", "..."],
  "topVideos": [
    {
      "title": "Titlul din link-ul real",
      "creator": "Numele creatorului (extras din link sau estimat)",
      "platform": "${inputs.platform}",
      "url": "LINK-UL REAL DIN LISTA DE MAI SUS",
      "whyPopular": "De ce este popular (bazat pe analiză)"
    }
  ],
  "topCreators": [
    {
      "name": "Numele creatorului (extras din link)",
      "followers": "Număr aproximativ (estimat)",
      "url": "LINK-UL REAL DIN LISTA DE MAI SUS",
      "whatWorks": "Ce face bine (bazat pe analiză)"
    }
  ]
}

**FOARTE IMPORTANT**: Folosește DOAR link-urile reale din listele de mai sus! Nu inventa link-uri!`;

return [{
  json: {
    toolId: data.toolId,
    prompt: prompt,
    model: "gemini-pro",
    maxTokens: 2000,
    temperature: 0.7
  }
}];
```

**⚠️ ATENȚIE**: 
- Dacă primești eroarea `Cannot read properties of undefined (reading 'niche')`, înseamnă că accesezi greșit datele. Folosește `body.inputs` nu `$input.item.json.inputs`!
- DuckDuckGo este gratuit și nu necesită API key, dar poate avea rate limits
- Dacă DuckDuckGo nu funcționează, poți încerca să folosești un alt serviciu de căutare web gratuit

**⚠️ ATENȚIE**: Dacă primești eroarea `Cannot read properties of undefined (reading 'niche')`, înseamnă că accesezi greșit datele. Folosește `body.inputs` nu `$input.item.json.inputs`!

#### Tool 3: Copywriting Publicitar

**Code**:
```javascript
// Datele de la Webhook sunt în body
const body = $input.item.json.body || $input.item.json;
const inputs = body.inputs || {};
const toolId = body.toolId || $input.item.json.toolId;
const businessContext = body.businessContext || {};
const strategyData = $('Webhook').item.json.body?.strategyData || null; // Date din Tool 1 (dacă există)

let contextPrompt = '';
if (strategyData) {
  contextPrompt = `
Context din Strategie Client:
- Client ideal: ${strategyData.idealClient || 'N/A'}
- Problema: ${strategyData.mainProblem || 'N/A'}
- Promisiune: ${strategyData.promise || 'N/A'}
`;
}

// Mapare tip conținut
const contentTypeMap = {
  'ad': 'reclame',
  'post': 'postări',
  'article': 'articole'
};

const contentTypeText = contentTypeMap[inputs.contentType] || 'conținut';

let prompt = `${contextPrompt}

Generează ${contentTypeText} de copywriting pentru ${inputs.platform}.

Tip conținut: ${inputs.contentType === 'ad' ? 'Reclamă' : inputs.contentType === 'post' ? 'Postare' : 'Articol'}
Platformă: ${inputs.platform}
Obiectiv: ${inputs.objective === 'sales' ? 'vânzare' : 'vizibilitate'}
Ton: ${inputs.tone === 'serious' ? 'serios' : inputs.tone === 'casual' ? 'casual' : 'premium'}

${inputs.description ? `Despre ce vrei textul:\n${inputs.description}\n` : ''}

**IMPORTANT:** Generează texte simple de copywriting, nu structuri de clipuri video sau componente speciale. Textul trebuie să fie:
- Natural și fluent
- Convingător și relevant
- Potrivit pentru tipul de conținut ales
- Fără mențiuni de "hook", "CTA" sau alte componente structurale - doar text continuu și natural

${inputs.contentType === 'article' ? '**Pentru Articole:** Textul trebuie să fie mai lung, structurat în paragrafe, cu informații detaliate și valoroase. Format natural de articol.' : ''}
${inputs.contentType === 'ad' ? '**Pentru Reclame:** Textul trebuie să fie concis, impactant, optimizat pentru conversie. Text continuu, fără structuri speciale.' : ''}
${inputs.contentType === 'post' ? '**Pentru Postări:** Textul trebuie să fie engaging, potrivit pentru social media, natural și fluent. Text continuu, ca o postare normală.' : ''}`;

// Adaugă context despre business dacă este disponibil
if (businessContext.businessType || businessContext.businessDescription) {
  prompt += `\n\n**Context despre business-ul utilizatorului:**`;
  if (businessContext.businessType) {
    prompt += `\n- Tip business: ${businessContext.businessType}`;
  }
  if (businessContext.businessDescription) {
    prompt += `\n- Descriere: ${businessContext.businessDescription}`;
  }
  prompt += `\nFolosește aceste informații pentru a genera texte de copywriting mai relevante și personalizate pentru acest business.`;
}

prompt += `\n\nGenerează 3-5 texte complete de copywriting (text simplu, natural, fără structuri speciale).

${inputs.contentType === 'ad' || inputs.contentType === 'post' ? `**IMPORTANT - Hashtag-uri (DOAR pentru Reclame și Postări):**
Pentru fiecare text, generează și 5-7 hashtag-uri simple și populare, potrivite pentru ${inputs.platform}. Hashtag-urile trebuie să fie:
- Simple și ușor de citit
- Populare și folosite frecvent pe ${inputs.platform}
- Relevante pentru conținutul textului
- Fără spații sau caractere speciale
- Format: #hashtag (cu # la început)
- Exemple bune: #marketing, #business, #success, #motivation (hashtag-uri populare și simple)` : '**IMPORTANT:** Pentru articole, NU genera hashtag-uri. Doar textul.'}

Răspunde în format JSON:
${inputs.contentType === 'ad' || inputs.contentType === 'post' ? `{
  "texts": [
    {
      "text": "Text complet 1 - text simplu și natural de copywriting",
      "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3", "#hashtag4", "#hashtag5", "#hashtag6", "#hashtag7"]
    },
    {
      "text": "Text complet 2 - text simplu și natural de copywriting",
      "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3", "#hashtag4", "#hashtag5", "#hashtag6", "#hashtag7"]
    },
    ...
  ]
}` : `{
  "texts": [
    "Text complet 1 - text simplu și natural de copywriting",
    "Text complet 2 - text simplu și natural de copywriting",
    ...
  ]
}`}`;

return [{
  json: {
    toolId: toolId,
    prompt: prompt,
    model: "gemini-pro",
    maxTokens: 1200,
    temperature: 0.8
  }
}];
```

#### Tool 5: Planificare de Conținut

**Code**:
```javascript
// Datele de la Webhook sunt în body
const body = $input.item.json.body || $input.item.json;
const inputs = body.inputs || {};
const toolId = body.toolId || $input.item.json.toolId;
const businessContext = body.businessContext || {};

// Verifică dacă platforma suportă story-uri
const supportsStories = inputs.platform === 'instagram' || inputs.platform === 'tiktok';

// Construiește prompt-ul pas cu pas pentru a evita template literals nested
let prompt = `Creează un plan de conținut FOARTE BINE GÂNDIT și OPTIMIZAT pentru ${inputs.period} zile pe ${inputs.platform}.

**IMPORTANT - Gândire Strategică:**
- Planificarea trebuie să fie FOARTE BINE GÂNDITĂ, cu sens și logică
- Fiecare postare și story trebuie să aibă un scop clar și să se potrivească în strategia generală
- Planificarea trebuie să fie OPTIMIZATĂ pentru obiectivul ales
- Conținutul trebuie să fie diversificat și să mențină interesul audienței
- Distribuția postărilor și story-urilor trebuie să fie echilibrată

Obiectiv: ${inputs.objective === 'sales' ? 'vânzări' : 'vizibilitate'}
Platformă: ${inputs.platform}`;

// Adaugă context despre business dacă este disponibil
if (businessContext.businessType || businessContext.businessDescription) {
  prompt += `\n\n**Context despre business-ul utilizatorului:**`;
  if (businessContext.businessType) {
    prompt += `\n- Tip business: ${businessContext.businessType}`;
  }
  if (businessContext.businessDescription) {
    prompt += `\n- Descriere: ${businessContext.businessDescription}`;
  }
  prompt += `\nFolosește aceste informații pentru a crea un plan de conținut mai relevant și personalizat pentru acest business.`;
}

prompt += `\n\n**Tipuri de Postări (OBLIGATORIU să folosești unul dintre acestea pentru fiecare postare):**
1. **Educativ** - Conținut educativ, informativ, care învață ceva util
2. **Double Downs** - Continuarea cu o afirmație controversată sau provocatoare
3. **Storytelling** - Povestire, narativă, experiențe personale
4. **Social Proof** - Dovezi sociale, testimoniale, cazuri de succes
5. **Serie** - Parte dintr-o serie de postări (trebuie să specifice partea din serie)

**IMPORTANT - Realism și Optimizare:**`;

// Adaugă instrucțiuni specifice în funcție de platformă
if (supportsStories) {
  const postsCount = inputs.period <= 7 ? '3-5 postări' : inputs.period <= 14 ? '6-10 postări' : '12-18 postări';
  const storiesCount = inputs.period <= 7 ? '5-7 story-uri' : inputs.period <= 14 ? '10-14 story-uri' : '20-25 story-uri';
  const restDays = inputs.period <= 7 ? '1-2 zile' : inputs.period <= 14 ? '2-4 zile' : '5-8 zile';
  
  prompt += `
- Planificarea trebuie să fie REALISTĂ și OPTIMĂ - NU trebuie să postezi zilnic!
- Distribuie conținutul strategic: unele zile doar postări, alte zile doar story-uri, alte zile ambele, iar unele zile NIMIC (zile de pauză)
- Pentru ${inputs.period} zile, recomandarea este:
  * Postări: ${postsCount} (distribuite strategic, nu zilnic!)
  * Story-uri: ${storiesCount} (distribuite strategic)
  * Zile fără conținut: ${restDays} (zile de pauză, foarte importante!)
- Story-urile trebuie să fie complementare postărilor, nu duplicate
- Nu posta zilnic - este nerealist și poate să obosească audiența
- Distribuie echilibrat postările și story-urile pe parcursul zilelor, cu pauze strategice
- Story-urile pot fi folosite pentru behind-the-scenes, quick tips, engagement, sau continuarea unor postări`;
} else {
  const postsCount = inputs.period <= 7 ? '3-5 postări' : inputs.period <= 14 ? '6-10 postări' : '12-18 postări';
  const restDays = inputs.period <= 7 ? '1-2 zile' : inputs.period <= 14 ? '2-4 zile' : '5-8 zile';
  
  prompt += `
- Planificarea trebuie să fie REALISTĂ și OPTIMĂ - NU trebuie să postezi zilnic!
- Distribuie conținutul strategic: unele zile cu postări, alte zile NIMIC (zile de pauză)
- Pentru ${inputs.period} zile, recomandarea este:
  * Postări: ${postsCount} (distribuite strategic, nu zilnic!)
  * Zile fără conținut: ${restDays} (zile de pauză, foarte importante!)
- Nu posta zilnic - este nerealist și poate să obosească audiența`;
}

prompt += `

**IMPORTANT - NU genera idei de clipuri sau conținut detaliat!**
- Tool-ul "Strategie Video & Scripturi" este pentru generarea ideilor de clipuri
- Acest tool generează DOAR PROGRAMUL (când postezi, ce tip de post, format)
- NU include idei detaliate de conținut sau propuneri de clipuri

Pentru fiecare zi, generează DOAR dacă există conținut planificat pentru acea zi:
- **Postări** (doar dacă există postări planificate pentru acea zi, 1-2 max):
  - Tip postare (OBLIGATORIU unul din: Educativ, Double Downs, Storytelling, Social Proof, Serie)
  - Scopul postării (clar și specific - ex: "educare audiență", "generare engagement", "promovare produs")
  - Format recomandat (video / imagine / carousel / reel)
  - Dacă este "Serie", specifică partea (ex: "Partea 1 din 3")
  - **NU include idei detaliate de conținut - doar tipul și scopul**`;

if (supportsStories) {
  prompt += `
- **Story-uri** (doar dacă există story-uri planificate pentru acea zi, 1-3 max):
  - Tip story (behind-the-scenes / quick tip / engagement / continuare postare / promoție)
  - Scopul story-ului (clar și specific)
  - Format recomandat (video / imagine / poll / question)
  - **NU include idei detaliate de conținut - doar tipul și scopul**`;
}

prompt += `
- **Dacă ziua este o zi de pauză** (fără conținut), lasă arrays-urile posts${supportsStories ? ' și stories' : ''} goale sau omite complet ziua din calendar

**Optimizare:**
- Asigură-te că planificarea are sens și este coerentă
- Postările și story-urile trebuie să se completeze reciproc
- Distribuie tipurile de postări echilibrat (nu toate în același stil)
- Planificarea trebuie să fie realistă și aplicabilă

**IMPORTANT pentru JSON:**
- Include DOAR zilele cu conținut planificat (nu include zilele de pauză sau zilele fără conținut)
- Sau, dacă incluzi toate zilele, pentru zilele de pauză lasă arrays-urile posts${supportsStories ? ' și stories' : ''} goale
- Nu genera conținut pentru fiecare zi - este nerealist!

Răspunde în format JSON:`;

// Construiește exemplul JSON în funcție de platformă
if (supportsStories) {
  prompt += `
{
  "calendar": [
    {
      "day": 1,
      "posts": [
        {
          "type": "Educativ | Double Downs | Storytelling | Social Proof | Serie",
          "purpose": "... (scop clar - ex: educare audiență, generare engagement, promovare produs)",
          "format": "video | imagine | carousel | reel",
          "seriesPart": "Partea X din Y (doar dacă type este 'Serie')"
        }
      ],
      "stories": [
        {
          "type": "behind-the-scenes | quick tip | engagement | continuare postare | promoție",
          "purpose": "... (scop clar - ex: engagement, promovare, educare rapidă)",
          "format": "video | imagine | poll | question"
        }
      ],
      "notes": "... (observații sau recomandări pentru această zi)"
    },
    {
      "day": 2,
      "posts": [],
      "stories": [],
      "notes": "Zi de pauză - fără conținut (important pentru a nu obosi audiența)"
    },
    ...
  ]
}`;
} else {
  prompt += `
{
  "calendar": [
    {
      "day": 1,
      "posts": [
        {
          "type": "Educativ | Double Downs | Storytelling | Social Proof | Serie",
          "purpose": "... (scop clar - ex: educare audiență, generare engagement, promovare produs)",
          "format": "video | imagine | carousel | reel",
          "seriesPart": "Partea X din Y (doar dacă type este 'Serie')"
        }
      ],
      "notes": "... (observații sau recomandări pentru această zi)"
    },
    {
      "day": 2,
      "posts": [],
      "notes": "Zi de pauză - fără conținut (important pentru a nu obosi audiența)"
    },
    ...
  ]
}`;
}

return [{
  json: {
    toolId: toolId,
    prompt: prompt,
    model: "gemini-pro",
    maxTokens: 2000,
    temperature: 0.7
  }
}];
```

#### Tool 4: Strategie Video & Scripturi

**Code**:
```javascript
// Datele de la Webhook sunt în body
const body = $input.item.json.body || $input.item.json;
const inputs = body.inputs || {};
const toolId = body.toolId || $input.item.json.toolId;
const businessContext = body.businessContext || {};

// Mapare stiluri
const styleMap = {
  'educational': 'Educativ',
  'double-downs': 'Double Downs (tehnica de a continua cu o afirmație controversată sau provocatoare)',
  'storytelling': 'Storytelling (povestire)',
  'social-proof': 'Social Proof (dovezi sociale/testimoniale)',
  'series': 'Serie (parte dintr-o serie de clipuri)'
};

const styleText = styleMap[inputs.style] || inputs.style;

// Hook-uri predefinite
const predefinedHooks = [
  'Dacă te chinui cu [X], adu-ți aminte că...',
  'Nu știu cine ar trebui să audă asta dar...',
  'E posibil să [X], fără să [Y]...',
  'Ascultă asta înainte să [X]...',
  'Dacă ar trebui să încep de la 0, aș face asta...',
  'Probabil o să îmi iau hate că spun asta dar...',
  'Ai fost mințit despre [X], și sunt aici să îți [Y]...',
  'De ce 90% din...',
  'Mi-aș fi dorit să știu asta înainte să mă apuc...'
];

const hooksList = predefinedHooks.map((hook, idx) => `${idx + 1}. ${hook}`).join('\n');

// Construiește prompt-ul
let prompt = `Generează strategie video și script pentru ${inputs.platform}.

**Context:**
Platformă: ${inputs.platform}
Stil: ${styleText}
Durață: ${inputs.duration === 'short' ? 'scurt (15 secunde)' : inputs.duration === 'medium' ? 'mediu (30-40 secunde)' : inputs.duration === 'long' ? 'lung (60-70 secunde)' : 'nespecificată'}
Obiectiv: ${inputs.objective === 'follow' ? 'urmărire' : 'vânzare'}
Descriere video: ${inputs.videoDescription || 'Nu este specificată'}
${inputs.painPoint ? `Pain Point (problema audienței): ${inputs.painPoint}` : ''}

**IMPORTANT - Structura scriptului:**
Fiecare idee de clip trebuie să aibă următoarea structură EXACTĂ:

1. **Hook** (trebuie să fie format din 2 părți):
   - **Verbal**: Textul pe care îl spui în clip (trebuie să fie unul dintre hook-urile predefinite de mai jos, adaptat la context)
   - **Written**: Textul care apare pe ecran în momentul când spui hook-ul verbal

2. **Content**: SCRIPTUL COMPLET ȘI DETALIAT al clipului - trebuie să fie un script full, pas cu pas, cu toate detaliile:
   - Fiecare secțiune a clipului (ce spui în primele 3 secunde, următoarele 5 secunde, etc.)
   - Tranziții între idei
   - Puncte cheie pe care trebuie să le evidențiezi
   - Exemple concrete, analogii, sau povestiri (dacă se aplică)
   - Toate detaliile necesare pentru a crea clipul efectiv
   - Scriptul trebuie să fie SUFICIENT DE DETALIAT pentru a putea fi folosit direct pentru filmare
   - Minim 200-300 cuvinte pentru fiecare script

3. **Format**: Structura și formatul clipului - descriere detaliată:
   - Tipul de clip (ex: "Povestire personală", "Tutorial pas cu pas", "Comparație", "Demo", etc.)
   - Structura vizuală (ce apare pe ecran în fiecare moment)
   - Tipul de montaj și tranziții
   - Elemente vizuale importante (grafică, text pe ecran, etc.)
   - Ritmul și pacing-ul clipului

4. **CTA**: Call-to-action final (ce vrei să facă viewer-ul) - trebuie să fie clar, specific și acționabil

**Hook-uri predefinite (OBLIGATORIU să folosești unul dintre acestea, adaptat la context):**
${hooksList}

**Instrucțiuni CRITICE:**
- TREBUIE să folosești unul dintre hook-urile predefinite de mai sus, dar poți să îl adaptezi ușor pentru a se potrivi perfect cu contextul
- Hook-ul verbal trebuie să fie bazat pe unul dintre hook-urile predefinite
- Hook-ul written (pe ecran) trebuie să fie scurt, impactant, și să completeze hook-ul verbal
- **Content (SCRIPTUL) este CEL MAI IMPORTANT**: Trebuie să fie un SCRIPT COMPLET, DETALIAT, pas cu pas, cu TOATE detaliile necesare pentru a crea clipul. NU doar un rezumat sau o idee generală! Trebuie să includă:
  * Fiecare secțiune a clipului explicată în detaliu
  * Ce spui exact în fiecare moment (sau aproximativ)
  * Tranziții și cum treci de la o idee la alta
  * Exemple concrete, analogii, sau povestiri relevante
  * Puncte cheie pe care trebuie să le evidențiezi
  * Scriptul trebuie să fie SUFICIENT DE LUNG ȘI DETALIAT (minim 200-300 cuvinte pentru scripturi scurte, 400-500 cuvinte pentru medii, 600-800 cuvinte pentru lungi)
  * Optimizat pentru platformă (${inputs.platform}) și durată (${inputs.duration === 'short' ? '15 secunde' : inputs.duration === 'medium' ? '30-40 secunde' : inputs.duration === 'long' ? '60-70 secunde' : 'nespecificată'})
- Formatul trebuie să fie DETALIAT, nu doar un cuvânt - descrie structura vizuală, tipul de montaj, elemente vizuale, ritmul
- CTA-ul trebuie să fie specific și acționabil

${inputs.painPoint ? `**IMPORTANT:** Scriptul trebuie să rezolve sau să abordeze pain point-ul menționat: "${inputs.painPoint}"` : ''}`;

// Adaugă context despre business dacă este disponibil
if (businessContext.businessType || businessContext.businessDescription) {
  prompt += `\n\n**Context despre business-ul utilizatorului:**`;
  if (businessContext.businessType) {
    prompt += `\n- Tip business: ${businessContext.businessType}`;
  }
  if (businessContext.businessDescription) {
    prompt += `\n- Descriere: ${businessContext.businessDescription}`;
  }
  prompt += `\nFolosește aceste informații pentru a genera strategii video și scripturi mai relevante și personalizate pentru acest business.`;
}

prompt += `\n\nGenerează 3-5 idei de clipuri complete.

Răspunde în format JSON:
{
  "videoIdeas": [
    {
      "hook": {
        "verbal": "... (textul pe care îl spui, bazat pe unul dintre hook-urile predefinite)",
        "written": "... (textul care apare pe ecran)"
      },
      "content": "... (SCRIPTUL COMPLET ȘI DETALIAT al clipului - minim 200-300 cuvinte, cu toate detaliile, pas cu pas, ce spui în fiecare moment, tranziții, exemple concrete, etc. - TREBUIE să fie suficient de detaliat pentru a putea fi folosit direct pentru filmare)",
      "format": "... (descriere detaliată a structurii și formatului clipului - tipul de clip, structura vizuală, tipul de montaj, elemente vizuale, ritmul)",
      "cta": "... (call-to-action final - clar, specific și acționabil)"
    },
    ...
  ]
}`;

return [{
  json: {
    toolId: toolId,
    prompt: prompt,
    model: "gemini-pro",
    maxTokens: 2000,
    temperature: 0.8
  }
}];
```

### 4. AI Agent Node - Google Gemini

**Tip**: AI Agent
**Provider**: Google Gemini

**Setări**:
- **Connection**: Creează o conexiune la Google Gemini
  - **API Key**: `{{ $env.GEMINI_API_KEY }}`
  - **Model**: `gemini-pro` sau `gemini-1.5-pro`

**Configuration**:
- **Mode**: Chat
- **System Message**: (opțional) Poți adăuga un mesaj de sistem pentru context
- **User Message**: `={{ $json.prompt }}`
- **Temperature**: `={{ $json.temperature || 0.7 }}`
- **Max Tokens**: `={{ $json.maxTokens || 1000 }}`

**Advanced Options**:
- **Top P**: 0.95 (default)
- **Top K**: 40 (default)
- **Stop Sequences**: (opțional)

**IMPORTANT**: 
- Nodul AI Agent gestionează automat formatarea cererilor și răspunsurile
- Nu mai este nevoie de HTTP Request manual
- Răspunsul vine direct în format structurat

### 5. Code Node - Parse Response

**Code**:
```javascript
const response = $input.item.json;

// Extrage toolId din nodul anterior (Code care a construit prompt-ul)
// Încearcă mai multe variante de nume de nod
let toolId = null;
try {
  // Încearcă să găsească toolId din nodurile anterioare
  const previousNodes = ['Code', 'Build Prompt', 'Prepare Prompt'];
  for (const nodeName of previousNodes) {
    try {
      const nodeData = $(nodeName);
      if (nodeData && nodeData.item && nodeData.item.json && nodeData.item.json.toolId) {
        toolId = nodeData.item.json.toolId;
        break;
      }
    } catch (e) {
      // Continuă cu următorul nod
    }
  }
  
  // Dacă nu găsește, încearcă să extragă din Switch (webhook body)
  if (!toolId) {
    try {
      const webhookData = $('Webhook');
      if (webhookData && webhookData.item && webhookData.item.json) {
        const body = webhookData.item.json.body || webhookData.item.json;
        toolId = body.toolId;
      }
    } catch (e) {
      // Ignoră eroarea
    }
  }
} catch (e) {
  // Ignoră eroarea
}

// AI Agent returnează răspunsul în format diferit
// Verifică structura răspunsului AI Agent
let generatedText = '';

// Structura răspunsului AI Agent pentru Gemini
// Verifică mai întâi output direct (format nou)
if (response.output) {
  generatedText = response.output;
} else if (response.response && response.response.text) {
  generatedText = response.response.text;
} else if (response.text) {
  generatedText = response.text;
} else if (response.content) {
  generatedText = response.content;
} else if (response.message && response.message.content) {
  generatedText = response.message.content;
} else if (response.choices && response.choices[0] && response.choices[0].message) {
  generatedText = response.choices[0].message.content;
} else if (response.data && response.data.text) {
  generatedText = response.data.text;
}

// Curăță textul - elimină markdown code blocks dacă există
if (generatedText) {
  // Elimină ```json și ``` de la început și sfârșit
  generatedText = generatedText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
}

// Parsează JSON-ul din text
let parsedResult = {};
try {
  // Încearcă să extragă JSON-ul din text
  const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    parsedResult = JSON.parse(jsonMatch[0]);
  } else {
    // Dacă nu e JSON, returnează textul raw
    parsedResult = { raw: generatedText, error: 'Response is not valid JSON' };
  }
} catch (e) {
  // Dacă parsing-ul eșuează, returnează textul raw cu eroarea
  console.error('Error parsing JSON:', e);
  parsedResult = { 
    raw: generatedText, 
    error: 'Failed to parse JSON response',
    errorDetails: e.message 
  };
}

// IMPORTANT: Returnează rezultatul direct (așa cum se așteaptă aplicația)
// Aplicația procesează răspunsul direct din n8n și îl înfășoară în { success: true, data: ... }
// Deci aici returnăm direct structura rezultatului (ex: { videoIdeas: [...] } pentru strategie-video)
return [{
  json: parsedResult
}];
```

### 6. Respond to Webhook

**Tip**: Respond to Webhook
**Respond With**: JSON

**Response Body**:
```json
={{ $json }}
```

**IMPORTANT**: 
- Nodul Parse Response returnează direct rezultatul (nu într-un wrapper `{ result: ... }`)
- Respond to Webhook returnează direct `$json` care conține rezultatul parsat
- Aplicația se așteaptă la structura directă a rezultatului (ex: `{ videoIdeas: [...] }` pentru strategie-video)

## Variabile de Mediu

Adaugă în n8n:
- `GEMINI_API_KEY` - Cheia API Google Gemini

**Sau configurează direct în AI Agent Node**:
- Creează o conexiune Google Gemini în n8n
- Adaugă API Key-ul direct în conexiune
- Selectează conexiunea în nodul AI Agent

## Optimizări

1. **Un singur workflow** - Toate tool-urile sunt procesate în același workflow
2. **Switch Node** - Rutează eficient către tool-ul specific
3. **Reutilizare cod** - Nodurile AI Agent și Parse sunt comune
4. **AI Agent Node** - Gestionează automat formatarea și erorile
5. **Costuri optimizate** - Folosește `gemini-pro` pentru costuri mai mici

## Configurare AI Agent Node

### Pasul 1: Creează Conexiunea Google Gemini

1. În n8n, mergi la **Credentials** → **Add Credential**
2. Selectează **Google Gemini** (sau caută "AI Agent" și selectează Google Gemini ca provider)
3. Adaugă **API Key**-ul tău Gemini
   - Obține API Key de la: https://makersuite.google.com/app/apikey
4. Salvează conexiunea cu un nume descriptiv (ex: "Gemini API")

### Pasul 2: Adaugă și Configurează AI Agent Node

1. **Adaugă nodul AI Agent**:
   - Click pe **+** pentru a adăuga un nod nou
   - Caută "AI Agent" sau "Google Gemini"
   - Selectează nodul **AI Agent**

2. **Configurează conexiunea**:
   - **Credential**: Selectează conexiunea Google Gemini creată anterior
   - **Model**: Selectează `gemini-pro` sau `gemini-1.5-pro`

3. **Configurează parametrii**:
   - **Mode**: Selectează **Chat** (pentru conversații)
   - **User Message**: `={{ $json.prompt }}` (folosește prompt-ul din nodul anterior)
   - **System Message**: (opțional) Poți adăuga un mesaj de sistem pentru context
   - **Temperature**: `={{ $json.temperature || 0.7 }}` (folosește temperatura din nodul anterior)
   - **Max Tokens**: `={{ $json.maxTokens || 1000 }}` (folosește maxTokens din nodul anterior)

4. **Advanced Options** (opțional):
   - **Top P**: 0.95 (default)
   - **Top K**: 40 (default)
   - **Stop Sequences**: (lasă gol sau adaugă secvențe de stop dacă e necesar)

### Pasul 3: Conectează Nodurile

**IMPORTANT**: Folosește UN SINGUR nod AI Agent pentru toate tool-urile!

**Structura completă**:
```
Webhook
  ↓
Switch (5 outputs - câte unul pentru fiecare tool)
  ├─ Output 1: strategie-client
  │     ↓
  │   Code: Build Prompt (strategie-client)
  │     ↓
  ├─ Output 2: analiza-piata
  │     ↓
  │   Code: Build Prompt (analiza-piata)
  │     ↓
  ├─ Output 3: copywriting
  │     ↓
  │   Code: Build Prompt (copywriting)
  │     ↓
  ├─ Output 4: planificare-conținut
  │     ↓
  │   Code: Build Prompt (planificare-conținut)
  │     ↓
  └─ Output 5: strategie-video
        ↓
      Code: Build Prompt (strategie-video)
        ↓
    [TOATE SE CONECTEAZĂ AICI]
        ↓
    AI Agent (UN SINGUR NOD pentru toate)
        ↓
    Parse Response
        ↓
    Respond to Webhook
```

**Cum să conectezi**:
1. După Switch, adaugă câte un nod "Code: Build Prompt" pentru fiecare output
2. Toate nodurile "Code" se conectează la ACELAȘI nod "AI Agent"
3. AI Agent procesează orice prompt, indiferent de tool
4. Un singur nod "Parse Response" și "Respond to Webhook" la final

**Avantaje**:
- ✅ Mai puține noduri (un singur AI Agent în loc de 5)
- ✅ Mai ușor de întreținut
- ✅ Mai eficient
- ✅ Configurare simplificată

### Pasul 4: Testează AI Agent Node

1. **Testează manual în n8n**:
   - Click pe nodul AI Agent
   - Click pe **Execute Node**
   - Verifică răspunsul în output

2. **Structura răspunsului AI Agent**:
   - Răspunsul poate fi în: `response.response.text`, `response.text`, sau `response.content`
   - Nodul "Parse Response" gestionează toate variantele

**IMPORTANT**: 
- AI Agent Node returnează răspunsul în format diferit față de HTTP Request direct
- Nodul "Parse Response" este configurat să gestioneze toate variantele de răspuns
- Nodul gestionează automat erorile și retry-urile
- Nu mai este nevoie de HTTP Request manual sau de gestionare manuală a headers/body

## Testare

Testează fiecare tool cu Postman sau curl:

```bash
curl -X POST https://your-n8n-instance.com/webhook/tools \
  -H "Content-Type: application/json" \
  -d '{
    "toolId": "strategie-client",
    "inputs": {
      "businessType": "Produs premium de ceai organic",
      "sellType": "online",
      "priceRange": "high",
      "targetAudience": "B2C",
      "objective": "sales"
    }
  }'
```

## Notă Importantă

- Tool-ul "Copywriting" poate folosi datele din "Strategie Client" dacă sunt disponibile
- Toate tool-urile returnează JSON structurat pentru ușurință în procesare
- Workflow-ul este optimizat pentru a minimiza numărul de noduri și a maximiza reutilizarea codului

---

## 📋 REZUMAT: Toate Codurile Actualizate cu businessContext

### ✅ Template Standard pentru businessContext

**IMPORTANT**: Toate nodurile Code trebuie să includă următorul cod pentru a extrage și folosi businessContext:

```javascript
const businessContext = body.businessContext || {};

// La sfârșitul prompt-ului, înainte de instrucțiunile JSON, adaugă:
if (businessContext.businessType || businessContext.businessDescription) {
  prompt += `\n\n**Context despre business-ul utilizatorului:**`;
  if (businessContext.businessType) {
    prompt += `\n- Tip business: ${businessContext.businessType}`;
  }
  if (businessContext.businessDescription) {
    prompt += `\n- Descriere: ${businessContext.businessDescription}`;
  }
  prompt += `\nFolosește aceste informații pentru a genera conținut mai precis și relevant pentru acest business.`;
}
```

### 📝 Lista Completă de Noduri Actualizate

1. ✅ **Tool 1: Strategie de Client & Mesaj** - Nodul "Code: Build Prompt" (linia 128-186)
2. ✅ **Tool 2: Analiză de Piață & Concurență** - Nodul "Code: Build Prompt" (Pasul 5, linia 606-702)
3. ✅ **Tool 3: Copywriting Publicitar** - Nodul "Code: Build Prompt" (linia 712-810)
4. ✅ **Tool 4: Strategie Video & Scripturi** - Nodul "Code: Build Prompt" (linia 953-1104)
5. ✅ **Tool 5: Planificare de Conținut** - Nodul "Code: Build Prompt" (linia 779-950)
6. ✅ **Parse Response** - Actualizat pentru a returna rezultatul direct (linia 1100-1259)
7. ✅ **Respond to Webhook** - Actualizat pentru a returna `={{ $json }}` (linia 1262-1275)

### 🔧 Fix pentru Problema Strategie Video

**Problema**: Rezultatul nu apare în aplicație după generare.

**Soluție**: 
1. Verifică că nodul **Parse Response** returnează direct `parsedResult` (nu `{ result: parsedResult }`)
2. Verifică că nodul **Respond to Webhook** returnează `={{ $json }}` (nu `={{ $json.result }}`)
3. Verifică că AI Agent returnează JSON valid cu structura `{ videoIdeas: [...] }`

**Structura așteptată pentru strategie-video**:
```json
{
  "videoIdeas": [
    {
      "hook": {
        "verbal": "...",
        "written": "..."
      },
      "content": "...",
      "format": "...",
      "cta": "..."
    }
  ]
}
```

