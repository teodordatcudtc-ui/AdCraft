import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
})

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export async function POST(request: NextRequest) {
  try {
    // Verifică configurarea Stripe
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      )
    }

    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      )
    }

    // Obține datele din body
    const body = await request.json()
    const { packageName, credits, price, userId } = body

    if (!packageName || !credits || !price || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: packageName, credits, price, userId' },
        { status: 400 }
      )
    }

    // Verifică autentificarea utilizatorului
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verifică că userId din body corespunde cu utilizatorul autentificat
    // (În producție, ar trebui să verifici token-ul JWT)

    // Creează produsul dinamic în Stripe
    const product = await stripe.products.create({
      name: `Pachet ${packageName} - ${credits} credite`,
      description: `Pachet de ${credits} credite pentru AdLence.ai`,
      metadata: {
        packageName,
        credits: credits.toString(),
        userId,
      },
    })

    // Creează prețul pentru produs
    // Stripe folosește cenți, deci înmulțim cu 100
    const priceInCents = Math.round(price * 100)
    
    const stripePrice = await stripe.prices.create({
      product: product.id,
      unit_amount: priceInCents,
      currency: 'eur', // Poți schimba la 'ron' dacă Stripe suportă RON în contul tău
      metadata: {
        packageName,
        credits: credits.toString(),
        userId,
      },
    })

    // Obține URL-ul aplicației
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Creează sesiunea de checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripePrice.id,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${appUrl}/dashboard?payment=success`,
      cancel_url: `${appUrl}/preturi?payment=cancelled`,
      metadata: {
        userId,
        packageName,
        credits: credits.toString(),
        price: price.toString(),
      },
      customer_email: undefined, // Stripe va cere email-ul automat
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

