import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

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
    const timestamp = new Date().toLocaleString('ro-RO')
    
    // Formatare HTML pentru email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #667eea; }
            .value { margin-top: 5px; padding: 10px; background: white; border-radius: 4px; border-left: 3px solid #667eea; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📧 Nouă înscriere în Waiting List</h1>
              <p style="margin: 0;">AdLence.ai</p>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">👤 Nume:</div>
                <div class="value">${name}</div>
              </div>
              <div class="field">
                <div class="label">📧 Email:</div>
                <div class="value">${email}</div>
              </div>
              <div class="field">
                <div class="label">🔍 Cum a aflat despre noi:</div>
                <div class="value">${howDidYouHear}</div>
              </div>
              <div class="field">
                <div class="label">💼 De ce are nevoie de serviciile noastre:</div>
                <div class="value">${whyDoYouNeed.replace(/\n/g, '<br>')}</div>
              </div>
              <div class="field">
                <div class="label">🕐 Data înscrierii:</div>
                <div class="value">${timestamp}</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    const emailText = `
Nouă înscriere în Waiting List - AdLence.ai

Nume: ${name}
Email: ${email}
Cum a aflat despre noi: ${howDidYouHear}
De ce are nevoie de serviciile noastre:
${whyDoYouNeed}

Data înscrierii: ${timestamp}
    `.trim()

    // Trimite email direct prin SMTP (fără servicii externe)
    // Configurare SMTP - poți folosi Gmail, Outlook, sau orice alt serviciu SMTP
    const smtpConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true pentru port 465, false pentru alte porturi
      auth: {
        user: process.env.SMTP_USER, // Email-ul tău
        pass: process.env.SMTP_PASS, // Parola aplicației sau parola normală
      },
    }

    if (!smtpConfig.auth.user || !smtpConfig.auth.pass) {
      console.error('❌ SMTP_USER sau SMTP_PASS nu sunt configurate în variabilele de mediu')
      return NextResponse.json(
        { error: 'Serviciul de email nu este configurat' },
        { status: 500 }
      )
    }

    try {
      // Creează transporter SMTP
      const transporter = nodemailer.createTransport(smtpConfig)

      // Verifică conexiunea
      await transporter.verify()

      // Trimite email-ul
      const info = await transporter.sendMail({
        from: `"AdLence.ai" <${smtpConfig.auth.user}>`,
        to: recipientEmail,
        subject: '📧 Nouă înscriere în Waiting List - AdLence.ai',
        html: emailHtml,
        text: emailText,
      })

      console.log('✅ Email trimis cu succes:', info.messageId)
    } catch (error) {
      console.error('❌ Eroare la trimiterea email-ului:', error)
      return NextResponse.json(
        { 
          error: 'Eroare la trimiterea email-ului', 
          details: error instanceof Error ? error.message : 'Unknown error' 
        },
        { status: 500 }
      )
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

