import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

// Client cu service role key pentru operații admin
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    // Obține token-ul de autentificare din header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verifică sesiunea utilizatorului
    const token = authHeader.replace('Bearer ', '')
    
    // Creează un client temporar cu token-ul pentru verificare
    const { createClient } = await import('@supabase/supabase-js')
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    })

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Adaugă 10 credite folosind funcția SQL
    const { data, error } = await supabaseAdmin.rpc('add_credits', {
      user_uuid: user.id,
      credits_amount: 10,
      transaction_description: 'Credite de test (10 credite)',
      package_uuid: null,
      payment_id_param: null,
      metadata_param: { source: 'test_button' }
    })

    if (error) {
      console.error('Error adding test credits:', error)
      return NextResponse.json(
        { error: 'Failed to add credits', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '10 credite au fost adăugate cu succes',
      transaction_id: data || null
    })
  } catch (error) {
    console.error('Error in add-test-credits route:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

