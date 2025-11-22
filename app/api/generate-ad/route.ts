import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, image, options, generateOnlyText } = body

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // Obține URL-ul webhook-ului n8n din variabilele de mediu sau folosește default
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || 'https://agentie-reclame.app.n8n.cloud/webhook/reclama'

    // Pregătește datele pentru n8n
    // n8n webhook așteaptă datele direct în body, nu în body.body
    const payload = {
      prompt,
      image: generateOnlyText ? null : (image || null), // Base64 string cu prefix "data:image/...;base64,"
      generateOnlyText: generateOnlyText || false,
      options: generateOnlyText ? null : (options || {
        aspect_ratio: '1:1',
        width: 1024,
        height: 1024,
        style: 'professional',
        negative_prompt: 'blurry, low quality, distorted',
        guidance_scale: 7.5,
        num_inference_steps: 20,
      }),
      timestamp: new Date().toISOString(),
    }

    // Trimite cererea către n8n
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('N8N webhook error:', errorText)
      return NextResponse.json(
        { error: 'Failed to process request', details: errorText },
        { status: response.status }
      )
    }

    const result = await response.json()

    // Dacă este generare doar text
    if (generateOnlyText) {
      let text = null
      
      if (result.text) {
        text = result.text
      } else if (result.data?.text) {
        text = result.data.text
      } else if (result.data?.result?.text) {
        text = result.data.result.text
      } else if (result.content) {
        text = result.content
      } else if (result.data?.content) {
        text = result.data.content
      }

      return NextResponse.json({
        success: true,
        data: {
          text: text,
          ...result, // Include toate datele pentru debugging
        },
      })
    }

    // n8n returnează direct răspunsul KIE.AI sau un obiect cu success/image_url
    // Procesăm răspunsul pentru a extrage image_url
    let imageUrl = null
    let taskId = null
    
    if (result.image_url) {
      // Format direct: { image_url: "...", taskId: "..." }
      imageUrl = result.image_url
      taskId = result.taskId
    } else if (result.data?.image_url) {
      // Format nested: { data: { image_url: "...", taskId: "..." } }
      imageUrl = result.data.image_url
      taskId = result.data.taskId
    } else if (result.data?.result?.image_url) {
      // Format KIE.AI: { data: { result: { image_url: "..." }, taskId: "..." } }
      imageUrl = result.data.result.image_url
      taskId = result.data.taskId
    }

    return NextResponse.json({
      success: true,
      data: {
        image_url: imageUrl,
        taskId: taskId,
        ...result, // Include toate datele pentru debugging
      },
    })
  } catch (error) {
    console.error('Error in generate-ad route:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

