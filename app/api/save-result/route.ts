import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { toolId, result, inputs, user_id } = body

    if (!toolId || !result || !user_id) {
      return NextResponse.json(
        { error: 'Missing required fields: toolId, result, user_id' },
        { status: 400 }
      )
    }

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      )
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Salvează generarea în baza de date
    const { data: genData, error: genError } = await supabaseAdmin
      .from('generations')
      .insert({
        user_id: user_id,
        type: toolId,
        prompt: inputs ? JSON.stringify(inputs) : null,
        result_text: JSON.stringify(result),
        status: 'completed',
        cost: 0, // Salvare manuală nu costă credite
      })
      .select('id')
      .single()

    if (genError) {
      console.error('Error saving result:', genError)
      return NextResponse.json(
        { error: 'Failed to save result', details: genError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      generation_id: genData.id,
      message: 'Result saved successfully',
    })
  } catch (error) {
    console.error('Error in save-result route:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

