# Ghid de Integrare Stripe - Pas cu Pas

## 📋 Prezentare Generală

Acest ghid te va ajuta să implementezi plățile cu Stripe pentru sistemul de credite.

---

## 🔧 PASUL 1: Instalare Dependențe

```bash
npm install stripe
```

---

## 🔑 PASUL 2: Configurare Stripe Account

### 2.1. Creează cont Stripe

1. Mergi pe [https://stripe.com](https://stripe.com)
2. Creează un cont și completează informațiile despre business

### 2.2. Obține API Keys

1. Mergi în **Dashboard** → **Developers** → **API keys**
2. Copiază **"Publishable key"** (începe cu `pk_test_` sau `pk_live_`)
3. Copiază **"Secret key"** (începe cu `sk_test_` sau `sk_live_`)

**IMPORTANT**: 
- Pentru testare: folosește **Test keys** (`pk_test_` și `sk_test_`)
- Pentru producție: folosește **Live keys** (`pk_live_` și `sk_live_`)

### 2.3. Adaugă variabilele de mediu în Vercel

1. Mergi în proiectul tău pe [vercel.com](https://vercel.com)
2. Click pe proiect → **Settings** → **Environment Variables**
3. Adaugă următoarele variabile:

```
STRIPE_SECRET_KEY = sk_test_... (sau sk_live_... pentru producție)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_test_... (sau pk_live_... pentru producție)
NEXT_PUBLIC_APP_URL = https://yourdomain.vercel.app (sau domeniul tău)
STRIPE_WEBHOOK_SECRET = whsec_... (vezi Pasul 4)
```

**IMPORTANT**: 
- Pentru fiecare variabilă, selectează **Production**, **Preview**, și **Development**
- Click **Save** după fiecare variabilă

---

## 🛠️ PASUL 3: Creare API Routes

✅ **DEJA FĂCUT** - Fișierele sunt create:
- `app/api/create-checkout-session/route.ts`
- `app/api/webhooks/stripe/route.ts`

---

## 🔔 PASUL 4: Configurare Webhook în Stripe Dashboard

### 4.1. Creează Webhook Endpoint

1. Mergi în **Stripe Dashboard** → **Developers** → **Webhooks**
2. Click pe **"Add endpoint"**
3. **Endpoint URL**: `https://yourdomain.vercel.app/api/webhooks/stripe`
   - Înlocuiește `yourdomain.vercel.app` cu URL-ul real al aplicației tale pe Vercel
4. **Description**: "AdLence.ai - Credit Purchase Webhook"
5. **Events to send**: Selectează doar:
   - ✅ `checkout.session.completed`
6. Click pe **"Add endpoint"**

### 4.2. Obține Webhook Secret

1. După creare, click pe endpoint-ul creat
2. În secțiunea **"Signing secret"**, click pe **"Reveal"**
3. Copiază secret-ul (începe cu `whsec_`)
4. Adaugă-l în Vercel ca variabilă de mediu:
   - **Settings** → **Environment Variables**
   - **Name**: `STRIPE_WEBHOOK_SECRET`
   - **Value**: `whsec_...` (secret-ul copiat)
   - Selectează **Production**, **Preview**, și **Development**
   - Click **Save**

### 4.3. Redeploy aplicația

După ce ai adăugat toate variabilele de mediu:
1. Mergi în **Deployments** pe Vercel
2. Click pe **"Redeploy"** pentru ultimul deployment
3. Sau fă un commit nou pentru a declanșa un deploy automat

---

## ✅ PASUL 5: Testare

### 5.1. Carduri de test Stripe

Folosește aceste carduri pentru testare:
- **Succes**: `4242 4242 4242 4242`
- **Declinare**: `4000 0000 0000 0002`

Data expirării: orice dată viitoare (ex: `12/34`)
CVC: orice 3 cifre (ex: `123`)
ZIP: orice cod (ex: `12345`)

### 5.2. Testează flow-ul

1. Mergi pe aplicația ta deploy-ată pe Vercel
2. Click pe "Alege Planul" pentru pachetul "Test" (0.10 EUR)
3. Dacă nu ești logat, ar trebui să apară modalul de login
4. După login, ar trebui să fii redirectat la Stripe Checkout
5. Completează cu cardul de test `4242 4242 4242 4242`
6. Verifică că după plată:
   - Ești redirectat înapoi la aplicație
   - Creditele sunt adăugate în cont
   - Apare o tranzacție în Stripe Dashboard

---

## 🚨 Probleme Comune

### Webhook-urile nu funcționează
- Verifică că `STRIPE_WEBHOOK_SECRET` este corect în Vercel
- Verifică că URL-ul webhook-ului este corect (cu `https://`)
- Verifică logs-urile în Vercel → **Deployments** → [deployment-ul tău] → **Functions** → `api/webhooks/stripe`
- Verifică logs-urile în Stripe Dashboard → **Webhooks** → [endpoint-ul tău] → **Recent events**

### Plățile nu se procesează
- Verifică că folosești cheile corecte (test vs live)
- Verifică că toate variabilele de mediu sunt setate în Vercel
- Verifică console-ul browser-ului pentru erori

### Creditele nu se adaugă
- Verifică logs-urile webhook-ului în Vercel
- Verifică că funcția `add_credits` din Supabase funcționează
- Verifică că `SUPABASE_SERVICE_ROLE_KEY` este setat în Vercel

---

## 📝 Checklist Final

Înainte de a merge live, verifică:

- [ ] Stripe account creat și completat
- [ ] API keys obținute (Test keys pentru testare, Live keys pentru producție)
- [ ] Toate variabilele de mediu setate în Vercel:
  - [ ] `STRIPE_SECRET_KEY`
  - [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - [ ] `NEXT_PUBLIC_APP_URL`
  - [ ] `STRIPE_WEBHOOK_SECRET`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` (pentru webhook)
- [ ] Webhook endpoint creat în Stripe Dashboard
- [ ] Webhook secret copiat și adăugat în Vercel
- [ ] Aplicația redeploy-ată pe Vercel
- [ ] Testat cu cardul de test `4242 4242 4242 4242`
- [ ] Verificat că creditele se adaugă corect

---

## 🎯 Pentru Producție

Când ești gata să mergi live:

1. **Schimbă cheile la Live keys** în Vercel:
   - `STRIPE_SECRET_KEY` → `sk_live_...`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → `pk_live_...`

2. **Creează un webhook nou pentru producție** în Stripe Dashboard:
   - URL: `https://yourdomain.com/api/webhooks/stripe`
   - Folosește același secret sau creează unul nou
   - Actualizează `STRIPE_WEBHOOK_SECRET` în Vercel

3. **Testează din nou** cu o sumă mică reală

4. **Monitorizează tranzacțiile** în Stripe Dashboard

---

**Notă**: Acest ghid presupune că ai deja configurat Supabase și că funcția `add_credits` există în baza de date.
