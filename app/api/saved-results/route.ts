import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Client cu service role key pentru operații admin (bypass RLS)
const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('user_id')
    const toolId = searchParams.get('tool_id') // Opțional - filtrează după tool

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase admin client not configured' },
        { status: 500 }
      )
    }

    // Construiește query-ul
    console.log('Fetching saved results:', { userId, toolId })
    let query = supabaseAdmin
      .from('generations')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(50)

    // Filtrează după tool dacă este specificat
    if (toolId) {
      console.log('Filtering by tool_id:', toolId)
      query = query.eq('type', toolId)
    }

    const { data, error } = await query
    
    console.log('Query result:', { 
      dataLength: data?.length || 0, 
      error: error?.message, 
      sampleType: data?.[0]?.type 
    })

    if (error) {
      console.error('Error fetching saved results:', error)
      return NextResponse.json(
        { error: 'Failed to fetch saved results', details: error.message },
        { status: 500 }
      )
    }

    // Parsează result_text pentru fiecare generare
    const parsedResults = (data || []).map((gen: any) => {
      let parsedResult = null
      try {
        if (gen.result_text) {
          parsedResult = JSON.parse(gen.result_text)
        }
      } catch (e) {
        console.error('Error parsing result_text:', e)
      }

      return {
        id: gen.id,
        type: gen.type,
        prompt: gen.prompt,
        result: parsedResult || gen.result_text,
        cost: gen.cost,
        created_at: gen.created_at,
        completed_at: gen.completed_at,
      }
    })

    return NextResponse.json({
      success: true,
      data: parsedResults,
    })
  } catch (error) {
    console.error('Error in saved-results route:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

