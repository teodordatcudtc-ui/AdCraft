# Favicon și Icon-uri

## 📍 Unde să adaugi favicon-ul?

**Adaugă toate fișierele direct în folderul `public/`** (același folder unde este acest README).

Structura ar trebui să arate așa:
```
public/
  ├── favicon.ico          ← Aici
  ├── icon.svg              ← Aici
  ├── apple-touch-icon.png  ← Aici
  ├── manifest.json         ← Aici (opțional)
  └── carousel/
```

## 📋 Fișiere necesare:

### 1. **favicon.ico** (OBLIGATORIU)
- **Format**: `.ico`
- **Dimensiuni**: Multi-size (16x16, 32x32, 48x48 pixels în același fișier)
- **Locație**: `public/favicon.ico`
- **Folosit pentru**: Browser-uri desktop (Chrome, Firefox, Edge, etc.)

### 2. **icon.svg** (RECOMANDAT)
- **Format**: `.svg` (vectorial, scalabil)
- **Dimensiune recomandată**: 512x512 pixels ca bază
- **Locație**: `public/icon.svg`
- **Folosit pentru**: Browser-uri moderne, icon-uri clare la orice mărime

### 3. **apple-touch-icon.png** (PENTRU iOS)
- **Format**: `.png`
- **Dimensiune**: 180x180 pixels (exact!)
- **Locație**: `public/apple-touch-icon.png`
- **Folosit pentru**: iOS Safari (când utilizatorii adaugă site-ul pe home screen)

### 4. **manifest.json** (OPȚIONAL - pentru PWA)
- **Format**: `.json`
- **Locație**: `public/manifest.json`
- **Folosit pentru**: Progressive Web App features

## 🛠️ Cum să generezi favicon-urile:

### Opțiunea 1: Favicon.io (CEL MAI UȘOR) ⭐
1. Mergi pe [https://favicon.io](https://favicon.io)
2. Alege "Text" sau "Image"
3. Upload o imagine sau scrie text
4. Download pachetul complet
5. Extrage fișierele în `public/`

### Opțiunea 2: RealFaviconGenerator (CEL MAI COMPLET)
1. Mergi pe [https://realfavicongenerator.net](https://realfavicongenerator.net)
2. Upload imaginea ta (PNG, JPG, SVG)
3. Configurează pentru toate platformele
4. Download și extrage în `public/`

### Opțiunea 3: Manual
1. Creează o imagine pătrată (512x512px recomandat)
2. Convertește la `.ico` folosind [CloudConvert](https://cloudconvert.com) sau [ConvertICO](https://convertico.com)
3. Salvează ca `favicon.ico` în `public/`
4. Pentru SVG, exportă direct din design tool (Figma, Illustrator, etc.)

## ✅ Verificare:

După ce ai adăugat fișierele:
1. Restart serverul de development (`npm run dev`)
2. Verifică în browser: `http://localhost:3000/favicon.ico` (ar trebui să vezi icon-ul)
3. Verifică în tab-ul browser-ului (ar trebui să apară icon-ul)

## 📝 Note importante:

- ✅ Link-urile sunt **deja configurate** în `app/layout.tsx`
- ✅ Nu trebuie să modifici nimic în cod - doar adaugă fișierele
- ✅ Numele fișierelor trebuie să fie **exact** ca mai sus (case-sensitive!)
- ✅ Pentru `favicon.ico`, cel mai simplu este să folosești un generator online

## 🎨 Recomandări design:

- Folosește culorile brand-ului tău
- Asigură-te că icon-ul este clar și recunoscut la dimensiuni mici
- Testează pe fundal alb și negru
- Evită detalii prea fine (nu se vor vedea la 16x16px)

