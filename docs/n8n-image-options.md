# Configurare Opțiuni de Aspect pentru Generare Imagini

## Date trimise de Next.js

Next.js trimite următoarele opțiuni către n8n:

```json
{
  "prompt": "Descriere produs",
  "image": "data:image/jpeg;base64,...",
  "options": {
    "aspect_ratio": "1:1",
    "width": 1024,
    "height": 1024,
    "style": "professional",
    "negative_prompt": "blurry, low quality, distorted",
    "guidance_scale": 7.5,
    "num_inference_steps": 20
  },
  "timestamp": "2025-11-21T..."
}
```

### Preseturi Aspect Ratio disponibile:
- `16:9` - Landscape (1920×1080px) - Banner, Desktop
- `9:16` - Portrait (1080×1920px) - Stories, Mobile
- `1:1` - Square (1024×1024px) - Instagram, Facebook
- `4:3` - Classic Landscape (1280×960px) - Print, Presentation
- `3:4` - Classic Portrait (960×1280px) - Portrait Classic

## Configurare n8n Workflow

### 1. Nod Code pentru procesare opțiuni

După Webhook, actualizează nodul Code pentru a extrage și opțiunile:

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
  
  return {
    json: {
      prompt: prompt,
      imageBase64: base64Only,
      options: {
        aspect_ratio: options.aspect_ratio || '1:1',
        width: options.width || 1024,
        height: options.height || 1024,
        style: options.style || 'professional',
        negative_prompt: options.negative_prompt || 'blurry, low quality, distorted',
        guidance_scale: options.guidance_scale || 7.5,
        num_inference_steps: options.num_inference_steps || 20
      },
      timestamp: item.json.body?.timestamp || item.json.timestamp
    }
  };
});
```

### 2. Nod "Edit Image" (KIE.AI API)

Actualizează Body JSON pentru a folosi formatul corect KIE.AI:

```json
{
  "model": "nano-banana-pro",
  "callBackUrl": "",
  "input": {
    "prompt": "{{ $json.prompt }}",
    "image_url": "{{ $('Get URL').item.json.data.url }}",
    "aspect_ratio": "{{ $json.options.aspect_ratio }}",
    "resolution": "1K",
    "output_format": "png"
  }
}
```

**IMPORTANT**: 
- KIE.AI folosește `input` object, NU parametri directi!
- `aspect_ratio`: "1:1", "16:9", "9:16", "4:3" (NU width/height separat!)
- `resolution`: "1K", "2K" (NU dimensiuni în pixeli!)
- `width` și `height` NU sunt folosite - KIE.AI calculează automat din aspect_ratio și resolution

### 3. Soluție alternativă: Nod Code pentru construire JSON

Pentru mai mult control, construiește JSON-ul în nodul Code:

```javascript
const prompt = $json.prompt;
const imageUrl = $('Get URL').item.json.data.url;
const options = $json.options;

return [{
  json: {
    model: "nano-banana-pro",
    prompt: prompt,
    image_url: imageUrl,
    negative_prompt: options.negative_prompt || 'blurry, low quality, distorted',
    width: options.width || 1024,
    height: options.height || 1024,
    num_inference_steps: options.num_inference_steps || 20,
    guidance_scale: options.guidance_scale || 7.5
  }
}];
```

Apoi în nodul "Edit Image":
- **Body Content Type**: JSON
- **Specify Body**: Using Fields Below
- Mapează câmpurile din JSON-ul generat

## Opțiuni disponibile

### Aspect Ratio (Preseturi)
- `16:9` - Landscape (1920×1080px) - Banner, Desktop
- `9:16` - Portrait (1080×1920px) - Stories, Mobile
- `1:1` - Square (1024×1024px) - Instagram, Facebook (default)
- `4:3` - Classic Landscape (1280×960px) - Print, Presentation
- `3:4` - Classic Portrait (960×1280px) - Portrait Classic

### Dimensiuni (calculate automat)
- `width`: Calculat automat în funcție de aspect ratio
- `height`: Calculat automat în funcție de aspect ratio

### Stil
- `professional` - Stil profesional, clean
- `artistic` - Stil artistic, creativ
- `modern` - Stil modern, contemporan
- `vintage` - Stil vintage, retro
- `minimalist` - Stil minimalist, simplu
- `bold` - Stil bold, colorat

### Negative Prompt
- String care descrie ce să evite (ex: "blurry, low quality, distorted")
- Default: "blurry, low quality, distorted"

### Guidance Scale
- Range: 1-20 (default: 7.5)
- Mai mic = mai puțin creativ, mai mare = mai creativ

### Num Inference Steps
- Range: 10-50 (default: 20)
- Mai mic = mai rapid, mai mare = mai bună calitate

## Verificare

Adaugă un nod Code după Webhook pentru debugging:

```javascript
return [{
  json: {
    hasOptions: !!$input.item.json.body?.options,
    options: $input.item.json.body?.options,
    width: $input.item.json.body?.options?.width,
    height: $input.item.json.body?.options?.height,
    style: $input.item.json.body?.options?.style
  }
}];
```

Aceasta îți va arăta exact ce opțiuni primește webhook-ul.

