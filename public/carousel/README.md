# Carousel Images

Acest folder conține pozele pentru caruselul de pe pagina principală.

## Cum să adaugi poze:

1. **Numele fișierelor trebuie să fie exact:**
   - `GALERIE-1.JPG`
   - `GALERIE-2.JPG`
   - `GALERIE-3.JPG`
   - `GALERIE-4.JPG`
   - `GALERIE-5.JPG`
   - `GALERIE-6.JPG`
   - ... și așa mai departe

2. **Formate acceptate:** `.JPG`, `.jpg`, `.JPEG`, `.jpeg`, `.PNG`, `.png`, `.WEBP`, `.webp`

3. **Dimensiuni recomandate:** 384x480px (aspect ratio 4:5) sau similar

4. **IMPORTANT:** 
   - Folosește nume EXACT ca mai sus (GALERIE-1.JPG, GALERIE-2.JPG, etc.)
   - Poți adăuga câte imagini vrei (GALERIE-7.JPG, GALERIE-8.JPG, etc.)
   - Dacă vrei să adaugi mai multe imagini, modifică array-ul din `app/page.tsx` la linia cu `['GALERIE-1.JPG', 'GALERIE-2.JPG', ...]`

## Notă:

Imaginile din folderul `public` sunt servite static de Next.js și pot fi accesate direct prin URL-uri relative la root-ul site-ului.

