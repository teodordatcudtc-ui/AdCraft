# Favicon și Icon-uri

Pentru optimizarea SEO completă, adaugă următoarele fișiere în folderul `public/`:

## Fișiere necesare:

1. **favicon.ico** - Icon standard (16x16, 32x32, 48x48 pixels)
2. **icon.svg** - Icon SVG modern (scalabil)
3. **apple-touch-icon.png** - Icon pentru iOS (180x180 pixels)
4. **manifest.json** - Manifest pentru PWA (opțional)

## Generare rapidă:

Poți genera aceste icon-uri folosind:
- [Favicon.io](https://favicon.io/) - Generator gratuit
- [RealFaviconGenerator](https://realfavicongenerator.net/) - Generator complet
- [Favicon Generator](https://www.favicon-generator.org/) - Alt generator

## Dimensiuni recomandate:

- favicon.ico: 16x16, 32x32, 48x48 (multi-size)
- icon.svg: Scalabil (recomandat 512x512 ca bază)
- apple-touch-icon.png: 180x180 pixels

## Note:

Link-urile sunt deja configurate în `app/layout.tsx`. Doar adaugă fișierele în folderul `public/` și vor funcționa automat.

