import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = supabaseUrl && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null

// GET - Încarcă calendarul pentru un utilizator
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const user_id = searchParams.get('user_id')

    if (!user_id) {
      return NextResponse.json(
        { error: 'Missing user_id parameter' },
        { status: 400 }
      )
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase admin client not configured' },
        { status: 500 }
      )
    }

    // Încarcă calendarul din user_profiles
    const { data: profile, error } = await supabaseAdmin
      .from('user_profiles')
      .select('content_calendar')
      .eq('id', user_id)
      .maybeSingle() // maybeSingle() returnează null dacă nu există, nu aruncă eroare

    if (error) {
      console.error('Error loading calendar:', error)
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      return NextResponse.json(
        { error: 'Failed to load calendar', details: error.message, code: error.code },
        { status: 500 }
      )
    }

    // Dacă profilul nu există, returnează null pentru calendar
    const calendar = profile?.content_calendar || null

    return NextResponse.json({
      success: true,
      calendar: calendar,
    })
  } catch (error) {
    console.error('Error in calendar GET route:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// POST - Salvează calendarul pentru un utilizator
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, calendar } = body

    if (!user_id || !calendar) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id, calendar' },
        { status: 400 }
      )
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase admin client not configured' },
        { status: 500 }
      )
    }

    // Verifică mai întâi dacă profilul există
    const { data: existingProfile, error: checkError } = await supabaseAdmin
      .from('user_profiles')
      .select('id')
      .eq('id', user_id)
      .maybeSingle() // maybeSingle() returnează null dacă nu există, nu aruncă eroare

    if (checkError) {
      console.error('Error checking profile:', checkError)
      console.error('Error details:', {
        code: checkError.code,
        message: checkError.message,
        details: checkError.details,
        hint: checkError.hint
      })
      return NextResponse.json(
        { error: 'Failed to check profile', details: checkError.message, code: checkError.code },
        { status: 500 }
      )
    }

    let data, error

    if (existingProfile) {
      // Profilul există, actualizează doar calendarul
      console.log('📝 Updating existing profile calendar for user:', user_id)
      const result = await supabaseAdmin
        .from('user_profiles')
        .update({
          content_calendar: calendar,
          // updated_at este actualizat automat de trigger
        })
        .eq('id', user_id)
        .select()
        .maybeSingle()
      
      data = result.data
      error = result.error
    } else {
      // Profilul nu există, îl creăm
      console.log('🆕 Creating new profile with calendar for user:', user_id)
      const result = await supabaseAdmin
        .from('user_profiles')
        .insert({
          id: user_id,
          content_calendar: calendar,
        })
        .select()
        .maybeSingle()
      
      data = result.data
      error = result.error
    }

    if (error) {
      console.error('Error saving calendar:', error)
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      return NextResponse.json(
        { error: 'Failed to save calendar', details: error.message, code: error.code },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Calendar saved successfully',
    })
  } catch (error) {
    console.error('Error in calendar POST route:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

