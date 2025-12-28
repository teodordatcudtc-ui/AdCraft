import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

// URL-ul webhook-ului n8n pentru tool-uri
const N8N_TOOLS_WEBHOOK_URL = process.env.N8N_TOOLS_WEBHOOK_URL || 'https://agentie-reclame.app.n8n.cloud/webhook/tools'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { toolId, inputs, user_id } = body

    if (!toolId) {
      return NextResponse.json(
        { error: 'Tool ID is required' },
        { status: 400 }
      )
    }

    // Design Publicitar folosește workflow-ul separat (generate-ad)
    if (toolId === 'design-publicitar') {
      return NextResponse.json(
        { error: 'Design Publicitar uses a separate workflow. Please use the generate-ad endpoint.' },
        { status: 400 }
      )
    }

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Costuri pentru fiecare tool (excluzând design-publicitar)
    const toolCosts: Record<string, number> = {
      'strategie-client': 5,
      'analiza-piata': 5,
      'strategie-video': 4,
      'copywriting': 3,
      'planificare-conținut': 4,
    }

    const cost = toolCosts[toolId] || 3

    // Verifică creditele utilizatorului și obține datele despre business
    let businessType = null
    let businessDescription = null
    
    if (supabaseAdmin) {
      const { data: profile } = await supabaseAdmin
        .from('user_profiles')
        .select('*')
        .eq('id', user_id)
        .single()

      if (profile) {
        // Obține datele despre business pentru context
        businessType = profile.business_type || null
        businessDescription = profile.business_description || null
        
        // Calculează creditele din tranzacții
        const { data: transactions } = await supabaseAdmin
          .from('credit_transactions')
          .select('amount')
          .eq('user_id', user_id)
          .eq('status', 'completed')

        const totalCredits = transactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0

        if (totalCredits < cost) {
          return NextResponse.json(
            { error: `Insufficient credits. You need ${cost} credits but have ${totalCredits}.` },
            { status: 400 }
          )
        }
      }
    }

    // Pregătește payload-ul pentru n8n (include datele despre business pentru context)
    const n8nPayload = {
      toolId,
      inputs,
      businessContext: {
        businessType: businessType,
        businessDescription: businessDescription,
      },
      timestamp: new Date().toISOString(),
    }

    // Trimite cererea către n8n
    const n8nResponse = await fetch(N8N_TOOLS_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(n8nPayload),
    })

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text()
      console.error('N8N tools webhook error:', errorText)
      return NextResponse.json(
        { error: 'Failed to process tool request', details: errorText },
        { status: n8nResponse.status }
      )
    }

    const n8nResult = await n8nResponse.json()

    // Salvează generarea în baza de date
    let generationId = null
    if (supabaseAdmin) {
      try {
        console.log('Saving generation to database:', { toolId, user_id, cost })
        const { data: genData, error: genError } = await supabaseAdmin
          .from('generations')
          .insert({
            user_id: user_id,
            type: toolId,
            prompt: JSON.stringify(inputs),
            result_text: JSON.stringify(n8nResult),
            status: 'completed',
            cost: cost,
          })
          .select('id')
          .single()

        if (genError) {
          console.error('Error saving generation to database:', genError)
        } else if (genData) {
          generationId = genData.id
          console.log('✅ Generation saved successfully with ID:', generationId)
        } else {
          console.warn('No data returned from generation insert')
        }
      } catch (err) {
        console.error('Exception saving generation:', err)
      }

      // Deduce creditele
      try {
        await supabaseAdmin
          .from('credit_transactions')
          .insert({
            user_id: user_id,
            type: 'usage',
            amount: -cost,
            description: `Tool usage: ${toolId} (${cost} credits)`,
            status: 'completed',
          })
      } catch (err) {
        console.error('Error deducting credits:', err)
      }
    }

    return NextResponse.json({
      success: true,
      data: n8nResult,
      generation_id: generationId,
    })
  } catch (error) {
    console.error('Error in tools route:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

