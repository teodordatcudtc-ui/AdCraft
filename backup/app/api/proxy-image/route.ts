import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const imageUrl = searchParams.get('url')

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      )
    }

    // Normalizează URL-ul (asigură-te că are protocol)
    let normalizedUrl = imageUrl.trim()
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = `https://${normalizedUrl}`
    }

    // Fix pentru URL-uri cu format incorect (ex: https:/ în loc de https://)
    normalizedUrl = normalizedUrl.replace(/^https:\/(?!\/)/, 'https://')

    // Fetch imaginea
    const imageResponse = await fetch(normalizedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    if (!imageResponse.ok) {
      console.error('Failed to fetch image:', imageResponse.status, normalizedUrl)
      return NextResponse.json(
        { error: 'Failed to fetch image', status: imageResponse.status },
        { status: imageResponse.status }
      )
    }

    // Obține tipul de conținut
    const contentType = imageResponse.headers.get('content-type') || 'image/png'
    const imageBuffer = await imageResponse.arrayBuffer()

    // Returnează imaginea cu headerele corecte pentru CORS
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
      },
    })
  } catch (error) {
    console.error('Error proxying image:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

