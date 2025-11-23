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

    // Obține URL-urile webhook-urilor n8n din variabilele de mediu sau folosește default
    const n8nImageWebhookUrl = process.env.N8N_WEBHOOK_URL || 'https://agentie-reclame.app.n8n.cloud/webhook/reclama'
    const n8nTextWebhookUrl = process.env.N8N_TEXT_WEBHOOK_URL || 'https://agentie-reclame.app.n8n.cloud/webhook/generate-text'

    // Dacă este generare doar text
    if (generateOnlyText) {
      // Pregătește datele pentru workflow-ul de text
      const textPayload = {
        prompt,
        textOptions: {
          maxTokens: 300,
          temperature: 0.8,
          model: 'gpt-4o-mini',
        },
        timestamp: new Date().toISOString(),
      }

      // Trimite cererea către workflow-ul de text
      const textResponse = await fetch(n8nTextWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(textPayload),
      })

      if (!textResponse.ok) {
        const errorText = await textResponse.text()
        console.error('N8N text webhook error:', errorText)
        return NextResponse.json(
          { error: 'Failed to generate text', details: errorText },
          { status: textResponse.status }
        )
      }

      const textResult = await textResponse.json()

      // Log pentru debugging
      console.log('N8N text response:', JSON.stringify(textResult, null, 2))

      // Extrage textul generat
      // n8n poate returna fie un obiect, fie un array cu un obiect
      let data = textResult
      if (Array.isArray(textResult) && textResult.length > 0) {
        data = textResult[0]
      }
      
      let generatedText = null
      
      // Verifică dacă textul este literal string-ul {{ $json.text }} (n8n nu a evaluat expresia)
      if (data.text && typeof data.text === 'string' && data.text.trim() === '{{ $json.text }}') {
        // n8n nu a evaluat expresia - încearcă să extragă din altă parte
        console.warn('n8n returned literal {{ $json.text }}, trying alternative extraction')
        
        // Verifică dacă există în array-ul original
        if (Array.isArray(textResult) && textResult.length > 0) {
          const firstItem = textResult[0]
          // Verifică toate locațiile posibile
          if (firstItem.text && firstItem.text !== '{{ $json.text }}') {
            generatedText = firstItem.text
          } else if (firstItem.output) {
            generatedText = firstItem.output
          } else if (firstItem.content) {
            generatedText = firstItem.content
          } else if (firstItem.data?.text) {
            generatedText = firstItem.data.text
          } else if (firstItem.data?.output) {
            generatedText = firstItem.data.output
          }
        }
      } else if (data.text) {
        generatedText = data.text
      } else if (data.output) {
        generatedText = data.output
      } else if (data.data?.text) {
        generatedText = data.data.text
      } else if (data.data?.output) {
        generatedText = data.data.output
      } else if (data.data?.result?.text) {
        generatedText = data.data.result.text
      } else if (data.content) {
        generatedText = data.content
      } else if (data.data?.content) {
        generatedText = data.data.content
      }

      // Dacă încă nu am găsit textul și avem array, verifică toate elementele
      if (!generatedText && Array.isArray(textResult)) {
        for (const item of textResult) {
          if (item.text && item.text !== '{{ $json.text }}') {
            generatedText = item.text
            break
          } else if (item.output) {
            generatedText = item.output
            break
          }
        }
      }

      // Dacă tot nu am găsit, verifică dacă textul este literal string-ul și returnează eroare
      if (!generatedText || generatedText === '{{ $json.text }}') {
        console.error('Failed to extract text from n8n response:', textResult)
        return NextResponse.json(
          { 
            error: 'Failed to extract generated text', 
            details: 'n8n returned literal expression instead of evaluated text. Please check "Respond to Webhook" node configuration.',
            debug: textResult
          },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        data: {
          text: generatedText,
        },
      })
    }

    // Varianta doar imagine: generare doar imagine (fără text)
    // Pregătește datele pentru workflow-ul de imagine
    const imagePayload = {
      prompt,
      image: image || null, // Base64 string cu prefix "data:image/...;base64,"
      generateOnlyText: false,
      options: options || {
        aspect_ratio: '1:1',
        width: 1024,
        height: 1024,
        style: 'professional',
        negative_prompt: 'blurry, low quality, distorted',
        guidance_scale: 7.5,
        num_inference_steps: 20,
      },
      timestamp: new Date().toISOString(),
    }

    // Apelează doar workflow-ul de imagine
    const imageResponse = await fetch(n8nImageWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(imagePayload),
    })

    // Procesează răspunsul pentru imagine
    let imageUrl = null
    let taskId = null

    if (!imageResponse.ok) {
      const errorText = await imageResponse.text()
      console.error('N8N image webhook error:', errorText)
      return NextResponse.json(
        { error: 'Failed to generate image', details: errorText },
        { status: imageResponse.status }
      )
    }

    const imageResult = await imageResponse.json()
    
    // Log pentru debugging
    console.log('N8N image response:', JSON.stringify(imageResult, null, 2))
    
    if (imageResult.image_url) {
      imageUrl = imageResult.image_url
      taskId = imageResult.taskId
    } else if (imageResult.data?.image_url) {
      imageUrl = imageResult.data.image_url
      taskId = imageResult.data.taskId
    } else if (imageResult.data?.result?.image_url) {
      imageUrl = imageResult.data.result.image_url
      taskId = imageResult.data.taskId
    }

    // Normalizează URL-ul (asigură-te că are protocol complet)
    if (imageUrl) {
      // Fix pentru URL-uri cu format incorect (ex: https:/ în loc de https://)
      imageUrl = imageUrl.replace(/^https:\/(?!\/)/, 'https://')
      
      // Dacă nu are protocol, adaugă https://
      if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
        imageUrl = `https://${imageUrl}`
      }
    }

    // Returnează doar imaginea (fără text)
    return NextResponse.json({
      success: true,
      data: {
        image_url: imageUrl,
        taskId: taskId,
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

