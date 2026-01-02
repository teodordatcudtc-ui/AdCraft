import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
})

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    )
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: 'Supabase admin not configured' },
      { status: 500 }
    )
  }

  let event: Stripe.Event

  try {
    // Verifică semnătura webhook-ului
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  // Procesează evenimentul
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    try {
      // Extrage metadata
      const userId = session.metadata?.userId
      const packageName = session.metadata?.packageName
      const credits = parseInt(session.metadata?.credits || '0')
      const price = parseFloat(session.metadata?.price || '0')

      if (!userId || !credits) {
        console.error('Missing metadata in session:', session.metadata)
        return NextResponse.json(
          { error: 'Missing required metadata' },
          { status: 400 }
        )
      }

      // Adaugă creditele folosind funcția din Supabase
      // Funcția va valida automat dacă utilizatorul există
      const { data: transactionId, error: creditsError } = await supabaseAdmin.rpc('add_credits', {
        user_uuid: userId,
        credits_amount: credits,
        transaction_description: `Cumpărare pachet ${packageName} - ${credits} credite`,
        package_uuid: null, // Poți adăuga package_id dacă ai tabelul credit_packages
        payment_id_param: session.id,
        metadata_param: {
          packageName,
          price,
          stripe_session_id: session.id,
          stripe_payment_intent: session.payment_intent,
        },
      })

      if (creditsError) {
        console.error('Error adding credits:', creditsError)
        return NextResponse.json(
          { error: 'Failed to add credits', details: creditsError.message },
          { status: 500 }
        )
      }

      console.log(`Credits added successfully: ${credits} credits for user ${userId}, transaction: ${transactionId}`)

      return NextResponse.json({ 
        received: true,
        transactionId,
        credits,
        userId 
      })
    } catch (error: any) {
      console.error('Error processing webhook:', error)
      return NextResponse.json(
        { error: 'Error processing webhook', details: error.message },
        { status: 500 }
      )
    }
  }

  // Returnează confirmare pentru alte evenimente
  return NextResponse.json({ received: true })
}

// Important: Dezactivează body parsing pentru webhook-uri
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

