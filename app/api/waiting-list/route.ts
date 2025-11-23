import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, howDidYouHear, whyDoYouNeed } = body

    // Validare
    if (!name || !email || !howDidYouHear || !whyDoYouNeed) {
      return NextResponse.json(
        { error: 'Toate câmpurile sunt obligatorii' },
        { status: 400 }
      )
    }

    // Validare email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email invalid' },
        { status: 400 }
      )
    }

    // Trimite email la adresa specificată
    const recipientEmail = 'teodordatcu.dtc@gmail.com'
    
    // Folosim webhook n8n pentru trimiterea email-ului (similar cu generarea de reclame)
    const n8nEmailWebhookUrl = process.env.N8N_EMAIL_WEBHOOK_URL || process.env.N8N_WEBHOOK_URL
    
    if (n8nEmailWebhookUrl) {
      try {
        const emailPayload = {
          to: recipientEmail,
          subject: 'Nouă înscriere în Waiting List - AdLence.ai',
          name: name,
          email: email,
          howDidYouHear: howDidYouHear,
          whyDoYouNeed: whyDoYouNeed,
          timestamp: new Date().toLocaleString('ro-RO'),
        }
        
        const emailResponse = await fetch(n8nEmailWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(emailPayload),
        })
        
        if (!emailResponse.ok) {
          console.error('Eroare la trimiterea email-ului prin n8n:', await emailResponse.text())
          // Continuă chiar dacă email-ul nu s-a trimis (nu vrem să blocheze înscrierea)
        }
      } catch (error) {
        console.error('Eroare la trimiterea email-ului:', error)
        // Continuă chiar dacă email-ul nu s-a trimis
      }
    } else {
      // Fallback: log pentru debugging (în producție, configurează webhook-ul)
      console.log('📧 Email de trimis (webhook neconfigurat):', {
        to: recipientEmail,
        subject: 'Nouă înscriere în Waiting List - AdLence.ai',
        name,
        email,
        howDidYouHear,
        whyDoYouNeed,
        timestamp: new Date().toLocaleString('ro-RO'),
      })
    }
    return NextResponse.json({
      success: true,
      message: 'Înscrierea a fost trimisă cu succes',
    })
  } catch (error) {
    console.error('Error in waiting-list route:', error)
    return NextResponse.json(
      { error: 'Eroare la procesarea cererii' },
      { status: 500 }
    )
  }
}

