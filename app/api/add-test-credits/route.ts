import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables (URL or Anon Key)')
}

// Client cu service role key pentru operații admin (dacă este disponibil)
const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

// Client cu anon key pentru operații normale
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)

export async function POST(request: NextRequest) {
  try {
    // Verifică dacă service role key este setat
    if (!supabaseServiceKey) {
      console.error('SUPABASE_SERVICE_ROLE_KEY is not set in environment variables')
      console.error('Available env vars:', {
        hasUrl: !!supabaseUrl,
        hasAnonKey: !!supabaseAnonKey,
        hasServiceKey: !!supabaseServiceKey
      })
      return NextResponse.json(
        { 
          error: 'Server configuration error', 
          details: 'Service role key is not configured. Please set SUPABASE_SERVICE_ROLE_KEY in your environment variables.',
          hint: 'Get your service role key from Supabase Dashboard → Settings → API → Secret keys. Make sure to add it in Vercel Dashboard → Settings → Environment Variables for Production environment.',
          troubleshooting: 'If you are on Vercel, make sure SUPABASE_SERVICE_ROLE_KEY is added in Vercel Dashboard → Settings → Environment Variables → Production'
        },
        { status: 500 }
      )
    }

    // Verifică formatul cheii
    if (!supabaseServiceKey.startsWith('sb_secret_')) {
      console.error('Invalid service role key format. Should start with sb_secret_')
      return NextResponse.json(
        { 
          error: 'Invalid API key format', 
          details: 'Service role key should start with "sb_secret_". Make sure you copied the correct key from Supabase Dashboard → Settings → API → Secret keys (not Publishable key).',
          hint: 'The key should look like: sb_secret_xxxxxxxxxxxxx'
        },
        { status: 500 }
      )
    }

    // Obține user_id din body (utilizatorul este deja autentificat în frontend)
    const body = await request.json()
    const { user_id } = body

    if (!user_id) {
      return NextResponse.json(
        { error: 'Unauthorized - User ID is required' },
        { status: 401 }
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

    console.log('Adding credits for user:', user_id)
    console.log('Using service role key:', supabaseServiceKey ? 'Yes' : 'No')

    // Folosim service role key pentru operații admin
    if (!supabaseAdmin) {
      return NextResponse.json(
        { 
          error: 'Server configuration error', 
          details: 'Failed to initialize Supabase admin client'
        },
        { status: 500 }
      )
    }

    // Încearcă să folosească funcția SQL
    let transactionId: string | null = null
    let error = null

    const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc('add_credits', {
      user_uuid: user_id,
      credits_amount: 10,
      transaction_description: 'Credite de test (10 credite)',
      package_uuid: null,
      payment_id_param: null,
      metadata_param: { source: 'test_button' }
    })

    if (rpcError) {
      console.error('RPC error, trying direct INSERT:', rpcError)
      console.error('RPC error details:', JSON.stringify(rpcError, null, 2))
      
      // Fallback: face direct INSERT în tabel (bypass RLS cu service role key)
      const { data: insertData, error: insertError } = await supabaseAdmin
        .from('credit_transactions')
        .insert({
          user_id: user_id,
          type: 'purchase',
          amount: 10,
          description: 'Credite de test (10 credite)',
          status: 'completed',
          metadata: { source: 'test_button' }
        })
        .select('id')
        .single()

      if (insertError) {
        console.error('Direct INSERT also failed:', insertError)
        console.error('Insert error details:', JSON.stringify(insertError, null, 2))
        error = insertError
      } else {
        transactionId = insertData?.id || null
        
        // Adaugă și log-ul de activitate
        const { error: logError } = await supabaseAdmin
          .from('activity_logs')
          .insert({
            user_id: user_id,
            type: 'success',
            message: 'Credite de test (10 credite)',
            action: 'purchase_credits'
          })
        
        if (logError) {
          console.error('Failed to insert activity log:', logError)
        }
      }
    } else {
      transactionId = rpcData
      console.log('RPC success, transaction ID:', transactionId)
    }

    if (error) {
      console.error('Error adding test credits:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      return NextResponse.json(
        { 
          error: 'Failed to add credits', 
          details: error.message,
          code: error.code,
          hint: error.hint
        },
        { status: 500 }
      )
    }

    console.log('Successfully added credits. Transaction ID:', transactionId)

    return NextResponse.json({
      success: true,
      message: '10 credite au fost adăugate cu succes',
      transaction_id: transactionId
    })
  } catch (error) {
    console.error('Error in add-test-credits route:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error',
        type: error instanceof Error ? error.constructor.name : typeof error
      },
      { status: 500 }
    )
  }
}

