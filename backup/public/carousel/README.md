# Carousel Images

Acest folder conține pozele pentru caruselul de pe pagina principală.

## Cum să adaugi poze:

1. **Numele fișierelor trebuie să fie exact (LOWERCASE - important pentru Vercel):**
   - `galerie-1.jpg`
   - `galerie-2.jpg`
   - `galerie-3.jpg`
   - `galerie-4.jpg`
   - `galerie-5.jpg`
   - `galerie-6.jpg`
   - ... și așa mai departe

2. **Formate acceptate:** `.jpg`, `.jpeg`, `.png`, `.webp`

3. **Dimensiuni recomandate:** 384x480px (aspect ratio 4:5) sau similar

4. **IMPORTANT:** 
   - Folosește nume EXACT ca mai sus (galerie-1.jpg, galerie-2.jpg, etc.) - **LOWERCASE**
   - Vercel/Linux este case-sensitive, deci `galerie-1.jpg` ≠ `GALERIE-1.JPG`
   - Poți adăuga câte imagini vrei (galerie-7.jpg, galerie-8.jpg, etc.)
   - Dacă vrei să adaugi mai multe imagini, modifică array-ul din `app/page.tsx` la linia cu `['galerie-1.jpg', 'galerie-2.jpg', ...]`

## Notă:

Imaginile din folderul `public` sunt servite static de Next.js și pot fi accesate direct prin URL-uri relative la root-ul site-ului.

