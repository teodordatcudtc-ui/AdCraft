import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Client cu service role key pentru operații admin
const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null

export async function POST(request: NextRequest) {
  try {
    // Verifică dacă service role key este setat
    if (!supabaseServiceKey) {
      return NextResponse.json(
        { 
          error: 'Server configuration error', 
          details: 'Service role key is not configured'
        },
        { status: 500 }
      )
    }

    // Obține datele din body
    const body = await request.json()
    const { user_id, credits_amount, description, generation_id } = body

    if (!user_id || !credits_amount || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id, credits_amount, description' },
        { status: 400 }
      )
    }

    // Verifică că user_id este un UUID valid
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(user_id)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      )
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { 
          error: 'Server configuration error', 
          details: 'Failed to initialize Supabase admin client'
        },
        { status: 500 }
      )
    }

    // Folosește funcția SQL pentru deducerea creditelor
    const { data: transactionId, error: rpcError } = await supabaseAdmin.rpc('deduct_credits', {
      user_uuid: user_id,
      credits_amount: credits_amount,
      transaction_description: description,
      generation_uuid: generation_id || null,
    })

    if (rpcError) {
      console.error('Error deducting credits:', rpcError)
      return NextResponse.json(
        { 
          error: 'Failed to deduct credits', 
          details: rpcError.message 
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      transaction_id: transactionId,
      message: `Successfully deducted ${credits_amount} credits`,
    })
  } catch (error) {
    console.error('Error in deduct-credits route:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

