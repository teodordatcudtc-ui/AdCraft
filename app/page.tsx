'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Zap, Target, Award, ArrowRight, Image as ImageIcon, Check, TrendingUp, Users, Clock, Settings, ChevronDown, ChevronUp, X } from 'lucide-react'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { supabase } from '@/lib/supabase'
import Auth from '@/components/Auth'
import type { User } from '@supabase/supabase-js'

type AspectRatio = '16:9' | '9:16' | '1:1' | '4:3'

interface ImageOptions {
  aspectRatio: AspectRatio
  style: string
  negativePrompt: string
  guidanceScale: number
  numInferenceSteps: number
}

const ASPECT_RATIO_PRESETS: Record<AspectRatio, { width: number; height: number; label: string; description: string; previewClass: string }> = {
  '16:9': { 
    width: 1920, 
    height: 1080, 
    label: '16:9', 
    description: 'Landscape (Banner, Desktop)',
    previewClass: 'w-16 aspect-video' // 16:9 - mai mic
  },
  '9:16': { 
    width: 1080, 
    height: 1920, 
    label: '9:16', 
    description: 'Portrait (Stories, Mobile)',
    previewClass: 'w-10 aspect-[9/16] mx-auto' // 9:16 - mai mic
  },
  '1:1': { 
    width: 1024, 
    height: 1024, 
    label: '1:1', 
    description: 'Square (Instagram, Facebook)',
    previewClass: 'w-16 aspect-square' // 1:1 - mai mic
  },
  '4:3': { 
    width: 1280, 
    height: 960, 
    label: '4:3', 
    description: 'Classic (Print, Presentation)',
    previewClass: 'w-16 aspect-[4/3]' // 4:3 - mai mic
  },
}

export default function Home() {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<typeof pricingPackages[0] | null>(null)
  
  // Toate hook-urile trebuie să fie apelate înainte de orice return condiționat
  const [prompt, setPrompt] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)
  const [generatedImageError, setGeneratedImageError] = useState<string | null>(null)
  const [generateOnlyText, setGenerateOnlyText] = useState(false)
  const [generatedText, setGeneratedText] = useState<string | null>(null)
  const [options, setOptions] = useState<ImageOptions>({
    aspectRatio: '1:1',
    style: 'professional',
    negativePrompt: 'blurry, low quality, distorted',
    guidanceScale: 7.5,
    numInferenceSteps: 20,
  })

  // Verifică autentificarea admin la mount
  useEffect(() => {
    if (!isAdminAuthenticated()) {
      router.push('/waiting-list')
    } else {
      setIsChecking(false)
    }
  }, [router])

  const handleStripeCheckout = useCallback(async (pkg: typeof pricingPackages[0]) => {
    // Verifică din nou utilizatorul pentru siguranță
    const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
    
    if (!currentUser || userError) {
      console.error('User not authenticated for checkout:', userError)
      setSelectedPackage(pkg)
      setShowAuthModal(true)
      return
    }

    // Verifică sesiunea
    const { data: { session } } = await supabase.auth.getSession()
    if (!session || !session.user) {
      console.error('No valid session for checkout')
      setSelectedPackage(pkg)
      setShowAuthModal(true)
      return
    }

    // Utilizatorul este 100% logat - continuă cu Stripe
    console.log('Starting Stripe checkout for package:', pkg.name, 'User:', currentUser.id)
    
    try {
      // Obține token-ul de sesiune pentru autentificare în API
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      if (!currentSession?.access_token) {
        throw new Error('No access token')
      }

      // Creează sesiunea de checkout
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentSession.access_token}`,
        },
        body: JSON.stringify({
          packageName: pkg.name,
          credits: pkg.credits,
          price: pkg.price,
          userId: currentUser.id,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create checkout session')
      }

      const { url } = await response.json()
      
      if (!url) {
        throw new Error('No checkout URL returned')
      }

      // Redirecționează către Stripe Checkout
      window.location.href = url
    } catch (error: any) {
      console.error('Error during checkout:', error)
      alert(error.message || 'Eroare la crearea sesiunii de plată. Te rugăm să încerci din nou.')
    }
  }, [])

  // Verifică autentificarea utilizatorului
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        setUser(currentUser)
      } catch (error) {
        console.error('Error checking user:', error)
      }
    }

    checkUser()

    // Ascultă pentru schimbări de autentificare
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        // Utilizatorul s-a logat, închide modalul și continuă cu Stripe
        setShowAuthModal(false)
        if (selectedPackage) {
          handleStripeCheckout(selectedPackage)
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [selectedPackage, handleStripeCheckout])

  const handleChoosePlan = async (pkg: typeof pricingPackages[0]) => {
    // Verifică dacă utilizatorul este logat
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    
    if (!currentUser) {
      // Utilizatorul nu este logat - deschide modalul de autentificare
      setSelectedPackage(pkg)
      setShowAuthModal(true)
      return
    }

    // Utilizatorul este logat - verifică din nou pentru siguranță
    const { data: { session } } = await supabase.auth.getSession()
    if (!session || !session.user) {
      // Sesiunea nu este validă - deschide modalul de autentificare
      setSelectedPackage(pkg)
      setShowAuthModal(true)
      return
    }

    // Utilizatorul este 100% logat - continuă cu Stripe
    handleStripeCheckout(pkg)
  }

  // Dacă se verifică autentificarea, afișează loading
  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <p className="text-gray-400">Se verifică accesul...</p>
        </motion.div>
      </div>
    )
  }

  // Costuri în credite
  const TEXT_GENERATION_COST = 3
  const IMAGE_GENERATION_COST = 8
  
  // Calculează costul total
  const calculateCost = () => {
    if (generateOnlyText) {
      return TEXT_GENERATION_COST
    }
    return IMAGE_GENERATION_COST
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // Convertim imaginea în base64 dacă există și nu generăm doar text
      let imageBase64 = null
      if (image && !generateOnlyText) {
        const reader = new FileReader()
        imageBase64 = await new Promise<string>((resolve, reject) => {
          reader.onloadend = () => {
            if (typeof reader.result === 'string') {
              resolve(reader.result)
            } else {
              reject(new Error('Failed to convert image to base64'))
            }
          }
          reader.onerror = reject
          reader.readAsDataURL(image)
        })
      }

      // Trimitem cererea către API
      const response = await fetch('/api/generate-ad', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          image: imageBase64,
          generateOnlyText: generateOnlyText,
          options: generateOnlyText ? null : {
            aspect_ratio: options.aspectRatio,
            width: ASPECT_RATIO_PRESETS[options.aspectRatio].width,
            height: ASPECT_RATIO_PRESETS[options.aspectRatio].height,
            style: options.style,
            negative_prompt: options.negativePrompt,
            guidance_scale: options.guidanceScale,
            num_inference_steps: options.numInferenceSteps,
          },
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Eroare la generarea reclamei')
      }

      // Afișăm rezultatul
      if (result.success) {
        // Resetăm erorile anterioare
        setGeneratedImageError(null)
        
        if (generateOnlyText && result.data?.text) {
          // Doar text generat
          setGeneratedText(result.data.text)
          setGeneratedImageUrl(null)
          // Scroll la rezultat
          setTimeout(() => {
            const element = document.getElementById('generated-image')
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          }, 100)
        } else if (result.data?.image_url) {
          // Reclama este gata - afișăm imaginea
          setGeneratedImageUrl(result.data.image_url)
          setGeneratedText(null)
          // Scroll la imaginea generată
          setTimeout(() => {
            const element = document.getElementById('generated-image')
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          }, 100)
        } else if (result.data?.taskId) {
          // Reclama este în procesare
          setGeneratedImageError(`Reclama este în procesare (Task ID: ${result.data.taskId}). Veți primi notificare când este gata.`)
        } else {
          setGeneratedImageError('Cererea a fost trimisă cu succes. Reclama este în procesare.')
        }
      } else {
        setGeneratedImageError(result.error || 'Reclama este în procesare. Veți primi notificare când este gata.')
      }
    } catch (error) {
      console.error('Error generating ad:', error)
      setGeneratedImageError(error instanceof Error ? error.message : 'Eroare la generarea reclamei. Vă rugăm să încercați din nou.')
      setGeneratedImageUrl(null)
      setGeneratedText(null)
    } finally {
      setIsLoading(false)
    }
  }

  const pricingPackages = [
    {
      name: 'Test',
      credits: 1,
      price: 0.50,
      features: [
        '1 credit pentru testare',
        'Test Stripe integration',
      ],
      color: 'from-green-500 to-emerald-500',
      borderColor: 'border-green-500/50',
    },
    {
      name: 'Starter',
      credits: 40,
      price: 10,
      features: [
        '40 credite',
        '~10 generări copywriting (4 credite)',
        '~5 generări imagini (8 credite)',
        'Sau combinații personalizate',
        'Suport email',
      ],
      color: 'from-blue-500 to-cyan-500',
      borderColor: 'border-blue-500/50',
    },
    {
      name: 'Pro',
      credits: 280,
      price: 50,
      features: [
        '280 credite',
        '~70 generări copywriting (4 credite)',
        '~35 generări imagini (8 credite)',
        'Sau combinații personalizate',
        'Suport dedicat',
      ],
      color: 'from-orange-500 to-red-500',
      borderColor: 'border-orange-500/50',
      popular: true,
    },
    {
      name: 'Growth',
      credits: 100,
      price: 20,
      features: [
        '100 credite',
        '~25 generări copywriting (4 credite)',
        '~12 generări imagini (8 credite)',
        'Sau combinații personalizate',
        'Suport priorititar',
      ],
      color: 'from-purple-500 to-pink-500',
      borderColor: 'border-purple-500/50',
    },
  ]

  const stats = [
    { value: '1200+', label: 'Reclame Generate', icon: TrendingUp },
    { value: '500+', label: 'Clienți Mulțumiți', icon: Users },
    { value: '< 30s', label: 'Timp Generare', icon: Clock },
  ]

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white relative overflow-hidden">
      {/* Enhanced Animated Background Effects - Color Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Large animated color blobs */}
        <motion.div
          className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px]"
          animate={{
            x: [0, 100, -50, 0],
            y: [0, 150, 100, 0],
            scale: [1, 1.3, 0.8, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px]"
          animate={{
            x: [0, -80, 50, 0],
            y: [0, -100, 80, 0],
            scale: [1, 1.4, 0.9, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
        />
        <motion.div
          className="absolute bottom-0 left-1/3 w-[700px] h-[700px] bg-green-500/15 rounded-full blur-[140px]"
          animate={{
            x: [0, 120, -80, 0],
            y: [0, -150, -100, 0],
            scale: [1, 1.5, 0.7, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        />
        <motion.div
          className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-pink-500/20 rounded-full blur-[100px]"
          animate={{
            x: [0, -60, 40, 0],
            y: [0, 80, -60, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 3,
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/3 w-[550px] h-[550px] bg-cyan-500/15 rounded-full blur-[130px]"
          animate={{
            x: [0, 90, -70, 0],
            y: [0, -120, 90, 0],
            scale: [1, 1.3, 0.8, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 4,
          }}
        />
        <motion.div
          className="absolute top-3/4 left-1/4 w-[450px] h-[450px] bg-orange-500/15 rounded-full blur-[110px]"
          animate={{
            x: [0, -70, 50, 0],
            y: [0, 100, -80, 0],
            scale: [1, 1.4, 0.9, 1],
          }}
          transition={{
            duration: 24,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2.5,
          }}
        />
        
        {/* Gradient mesh overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5" />
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-green-500/5 to-cyan-500/5" />
      </div>

      <div className="relative z-10 pt-16">
        {/* Hero Section - Two Column Layout */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                className="inline-flex items-center space-x-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-full mb-6 mx-auto md:mx-0"
                whileHover={{ scale: 1.05 }}
              >
                <Sparkles className="w-3 h-3 text-green-400" />
                <span className="text-xs text-green-300 font-medium">Powered by AdLence.ai</span>
              </motion.div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight text-center md:text-left">
                <span className="text-white">Noul Standard pentru</span>
                <br />
                <span className="bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
                  Generarea de Reclame
                </span>
                <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  cu Inteligență Artificială
                </span>
              </h1>

              <p className="md:hidden text-base text-gray-400 mb-6 leading-relaxed text-center">
                Platformă avansată cu tool-uri de marketing pentru a-ți crește business-ul.
              </p>
              <p className="hidden md:block text-lg text-gray-400 mb-8 leading-relaxed max-w-xl">
                AdLence.ai este o platformă avansată cu multiple tool-uri de marketing pentru nevoile tale. 
                De la generarea de reclame și copywriting, la analiză de piață și planificare de conținut - 
                tot ce ai nevoie pentru a-ți crește business-ul într-un singur loc.
              </p>

              <div className="flex flex-wrap gap-4 mb-8 justify-center md:justify-start">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg shadow-purple-500/25"
                >
                  Începe Acum
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-transparent border-2 border-gray-800 hover:border-gray-700 text-white font-semibold rounded-lg transition-all duration-300"
                >
                  Vezi Demo
                </motion.button>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 mt-8 justify-center md:justify-start">
                {stats.map((stat, index) => {
                  const Icon = stat.icon
                  return (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="flex items-center space-x-2"
                    >
                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                      <span className="text-sm font-semibold text-white">{stat.value}</span>
                      <span className="text-xs text-gray-400">{stat.label}</span>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>

            {/* Right Column - Form - Enhanced */}
            <motion.div
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              {/* Animated border glow */}
              <motion.div
                className="absolute -inset-1 rounded-2xl"
                style={{
                  background: 'linear-gradient(45deg, #3b82f6, #8b5cf6, #ec4899, #06b6d4, #3b82f6)',
                  backgroundSize: '400% 400%',
                }}
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
              
              {/* Pulsing glow effect */}
              <motion.div
                className="absolute -inset-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur-2xl opacity-50"
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />

              <div className="relative bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border-2 border-transparent rounded-2xl p-4 sm:p-6 shadow-2xl overflow-hidden">
                {/* Animated gradient background */}
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 50%, rgba(236, 72, 153, 0.1) 100%)',
                  }}
                  animate={{
                    opacity: [0.1, 0.2, 0.1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
                
                {/* Sparkle effects */}
                <div className="absolute top-4 right-4">
                  <motion.div
                    animate={{
                      rotate: [0, 360],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  >
                    <Sparkles className="w-6 h-6 text-yellow-400" />
                  </motion.div>
                </div>

                <div className="relative z-10">
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <h2 className="text-2xl font-bold mb-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                      Testează Acum
                    </h2>
                    <p className="text-xs text-gray-400 mb-4">Generează prima ta reclamă în secunde</p>
                  </motion.div>
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="relative"
                    >
                      <label htmlFor="prompt" className="block text-xs font-semibold text-white mb-2 flex items-center gap-2">
                        <Sparkles className="w-3 h-3 text-blue-400" />
                        Descrie produsul
                      </label>
                      <div className="relative">
                        <motion.div
                          className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg blur-sm opacity-0 group-hover:opacity-50 transition-opacity"
                          whileHover={{ opacity: 0.3 }}
                        />
                        <input
                          type="text"
                          id="prompt"
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          placeholder="Ex: ceai organic premium, ambalaj eco-friendly..."
                          className="relative w-full px-4 py-2.5 bg-gray-800/80 border-2 border-blue-500/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-400 transition-all text-sm font-medium shadow-lg shadow-blue-500/20"
                          required
                        />
                      </div>
                    </motion.div>

                    {/* Opțiune generare doar text */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 }}
                      className="relative"
                    >
                      <label className="flex items-center gap-2 p-2.5 bg-gray-800/60 hover:bg-gray-800/80 border border-gray-700/50 rounded-lg cursor-pointer transition-all group">
                        <input
                          type="checkbox"
                          checked={generateOnlyText}
                          onChange={(e) => {
                            setGenerateOnlyText(e.target.checked)
                            if (e.target.checked) {
                              setImage(null)
                              setImagePreview(null)
                            }
                          }}
                          className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500 focus:ring-2"
                        />
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-3 h-3 text-purple-400" />
                          <span className="text-xs font-semibold text-white">Generează doar text (copywriting)</span>
                        </div>
                      </label>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="relative"
                    >
                      <label htmlFor="image" className="block text-xs font-semibold text-white mb-2 flex items-center gap-2">
                        <ImageIcon className="w-3 h-3 text-purple-400" />
                        Poza produsului <span className="text-xs text-gray-400 font-normal">(opțional)</span>
                      </label>
                      {generateOnlyText ? (
                        <div className="w-full h-12 border-2 border-dashed border-gray-700/50 rounded-lg bg-gray-800/40 flex items-center justify-center">
                          <p className="text-xs text-gray-500">Generare doar text - imaginea nu este necesară</p>
                        </div>
                      ) : imagePreview ? (
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="relative group rounded-lg overflow-hidden border-2 border-purple-500/50 shadow-lg shadow-purple-500/20"
                        >
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-40 object-cover"
                          />
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              setImage(null)
                              setImagePreview(null)
                            }}
                            className="absolute top-3 right-3 px-4 py-2 bg-red-500/90 hover:bg-red-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg"
                          >
                            Șterge
                          </motion.button>
                        </motion.div>
                      ) : (
                        <label className="relative flex items-center justify-center w-full h-12 border-2 border-dashed border-purple-500/50 rounded-lg cursor-pointer bg-gray-800/60 hover:bg-gray-800/80 transition-all group shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20 hover:border-purple-400">
                          <motion.div
                            className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg blur-sm opacity-0 group-hover:opacity-30 transition-opacity"
                          />
                          <div className="relative flex items-center space-x-2">
                            <motion.div
                              whileHover={{ rotate: 360 }}
                              transition={{ duration: 0.6 }}
                            >
                              <ImageIcon className="w-4 h-4 text-purple-400 group-hover:text-purple-300 transition-colors" />
                            </motion.div>
                            <p className="text-xs text-gray-300 group-hover:text-white font-medium transition-colors">
                              <span className="font-semibold">Click pentru a încărca</span> sau drag & drop
                            </p>
                          </div>
                          <input
                            id="image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                      )}
                    </motion.div>

                    {/* Opțiuni avansate - doar pentru generare imagini */}
                    {!generateOnlyText && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="relative"
                      >
                        <motion.button
                          type="button"
                          onClick={() => setShowAdvanced(!showAdvanced)}
                          className="w-full flex items-center justify-between px-3 py-2 bg-gray-800/60 hover:bg-gray-800/80 border border-gray-700/50 rounded-lg transition-all"
                        >
                          <div className="flex items-center gap-2">
                            <Settings className="w-3 h-3 text-gray-400" />
                            <span className="text-xs font-semibold text-white">Opțiuni avansate</span>
                          </div>
                          {showAdvanced ? (
                            <ChevronUp className="w-3 h-3 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-3 h-3 text-gray-400" />
                          )}
                        </motion.button>

                        <motion.div
                          initial={false}
                          animate={{
                            height: showAdvanced ? 'auto' : 0,
                            opacity: showAdvanced ? 1 : 0,
                          }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 space-y-4 p-4 bg-gray-800/40 rounded-lg border border-gray-700/30">
                          {/* Aspect Ratio Presets */}
                          <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-3">Aspect Ratio</label>
                            <div className="grid grid-cols-2 gap-3">
                              {(Object.keys(ASPECT_RATIO_PRESETS) as AspectRatio[]).map((ratio) => {
                                const preset = ASPECT_RATIO_PRESETS[ratio]
                                const isSelected = options.aspectRatio === ratio
                                return (
                                  <motion.button
                                    key={ratio}
                                    type="button"
                                    onClick={() => setOptions({ ...options, aspectRatio: ratio })}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`relative p-4 rounded-lg border-2 transition-all ${
                                      isSelected
                                        ? 'border-blue-500 bg-blue-500/20'
                                        : 'border-gray-700/50 bg-gray-800/60 hover:border-gray-600/50'
                                    }`}
                                  >
                                    {/* Preview Rectangle */}
                                    <div className="mb-3 flex items-center justify-center">
                                      <div
                                        className={`${preset.previewClass} ${
                                          isSelected
                                            ? 'bg-gradient-to-br from-blue-500/30 to-purple-500/30 border-2 border-blue-400/50'
                                            : 'bg-gradient-to-br from-gray-700/50 to-gray-800/50 border border-gray-600/50'
                                        } rounded transition-all shadow-lg`}
                                      />
                                    </div>
                                    
                                    {/* Label and Info */}
                                    <div className="text-center">
                                      <div className="flex items-center justify-center gap-2 mb-1">
                                        <span className={`text-sm font-bold ${isSelected ? 'text-blue-400' : 'text-white'}`}>
                                          {preset.label}
                                        </span>
                                        {isSelected && (
                                          <Check className="w-4 h-4 text-blue-400" />
                                        )}
                                      </div>
                                      <p className="text-xs text-gray-400 mb-1">{preset.description}</p>
                                      <p className="text-xs text-gray-500">
                                        {preset.width} × {preset.height}px
                                      </p>
                                    </div>
                                  </motion.button>
                                )
                              })}
                            </div>
                          </div>

                          {/* Stil */}
                          <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-2">Stil</label>
                            <select
                              value={options.style}
                              onChange={(e) => setOptions({ ...options, style: e.target.value })}
                              className="w-full px-3 py-2 bg-gray-800/80 border border-gray-700/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50"
                            >
                              <option value="professional">Profesional</option>
                              <option value="artistic">Artistic</option>
                              <option value="modern">Modern</option>
                              <option value="vintage">Vintage</option>
                              <option value="minimalist">Minimalist</option>
                              <option value="bold">Bold & Colorful</option>
                            </select>
                          </div>

                          {/* Negative Prompt */}
                          <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-2">Negative Prompt</label>
                            <input
                              type="text"
                              value={options.negativePrompt}
                              onChange={(e) => setOptions({ ...options, negativePrompt: e.target.value })}
                              placeholder="blurry, low quality, distorted"
                              className="w-full px-3 py-2 bg-gray-800/80 border border-gray-700/50 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50"
                            />
                          </div>

                          {/* Guidance Scale */}
                          <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-2">
                              Guidance Scale: {options.guidanceScale}
                            </label>
                            <input
                              type="range"
                              min="1"
                              max="20"
                              step="0.5"
                              value={options.guidanceScale}
                              onChange={(e) => setOptions({ ...options, guidanceScale: parseFloat(e.target.value) })}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>Mai puțin creativ</span>
                              <span>Mai creativ</span>
                            </div>
                          </div>

                          {/* Num Inference Steps */}
                          <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-2">
                              Calitate (Steps): {options.numInferenceSteps}
                            </label>
                            <input
                              type="range"
                              min="10"
                              max="50"
                              step="5"
                              value={options.numInferenceSteps}
                              onChange={(e) => setOptions({ ...options, numInferenceSteps: parseInt(e.target.value) })}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>Rapid</span>
                              <span>Mai bună calitate</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                    )}

                    <motion.button
                      type="submit"
                      disabled={isLoading || !prompt.trim()}
                      whileHover={{ scale: isLoading ? 1 : 1.05, y: -2 }}
                      whileTap={{ scale: isLoading ? 1 : 0.95 }}
                      className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 text-white font-bold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl shadow-purple-500/50 flex items-center justify-center gap-2 relative overflow-hidden group"
                    >
                      {/* Button glow effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                        animate={{
                          x: ['-100%', '100%'],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 1,
                          ease: 'easeInOut',
                        }}
                      />
                      {isLoading ? (
                        <>
                          <motion.svg
                            className="animate-spin h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          >
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </motion.svg>
                          <span className="text-sm">Se generează...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span className="text-sm">{generateOnlyText ? 'Generează Text' : 'Generează Reclamă'}</span>
                          <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-semibold">
                            {calculateCost()} credite
                          </span>
                        </>
                      )}
                    </motion.button>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Showcase Section - Carousel - Moved up for visibility */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 overflow-hidden">
          <div className="relative">
            {/* Carousel Container */}
            <div className="overflow-hidden">
              <div className="flex gap-4 lg:gap-6 carousel-infinite" style={{ width: 'fit-content' }}>
                {/* Duplicate ads for infinite scroll - 2 sets pentru loop smooth */}
                {[...Array(2)].map((_, duplicateIndex) => (
                  <div key={duplicateIndex} className="flex gap-4 lg:gap-6 flex-shrink-0">
                    {/* Array cu 10 imagini */}
                    {[
                      'galerie-1.jpg',
                      'galerie-2.jpg',
                      'galerie-3.jpg',
                      'galerie-4.jpg',
                      'galerie-5.jpg',
                      'galerie-6.jpg',
                      'galerie-7.jpg',
                      'galerie-8.jpg',
                      'galerie-9.jpg',
                      'galerie-10.jpg',
                    ].map((imageName, index) => (
                      <motion.div
                        key={`${duplicateIndex}-${index}`}
                        whileHover={{ y: -8, scale: 1.02 }}
                        className="relative group overflow-hidden rounded-xl bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 hover:border-gray-600/50 transition-all flex-shrink-0 w-64 lg:w-80 xl:w-96 shadow-2xl"
                      >
                        {/* Ad Preview */}
                        <div className="aspect-[2/3] relative overflow-hidden">
                          {/* Imaginea reală */}
                          <img
                            src={`/carousel/${imageName}`}
                            alt={`Galerie ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback dacă imaginea nu există
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center"><p class="text-gray-500 text-sm">Imagine indisponibilă</p></div>';
                              }
                            }}
                          />
                          
                          {/* Overlay gradient pentru text readability */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Gradient Fade Edges */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#0a0a0f] to-transparent pointer-events-none z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#0a0a0f] to-transparent pointer-events-none z-10" />
          </div>
        </section>

        {/* Marketing Tools Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Tool-uri de Marketing
              </span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Descoperă ce mai poți face cu AdLence.ai. De la analiză de piață la planificare de conținut, 
              avem tot ce ai nevoie pentru a-ți dezvolta strategia de marketing.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Tool 1: Analiză de Piață */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border-2 border-blue-500/50 rounded-2xl p-8 shadow-2xl flex flex-col h-full"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl mb-6">
                <Target className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Analiză de Piață & Concurență</h3>
              <p className="text-gray-400 mb-6 leading-relaxed flex-grow">
                Analizează piața și competitorii pentru a vedea ce funcționează deja. 
                Obține insights valoroase despre strategiile care marchează în industria ta.
              </p>
              <motion.button
                onClick={() => router.push('/dashboard?tool=analiza-piata')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 mt-auto"
              >
                <span>Încearcă</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>

            {/* Tool 2: Copywriting */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border-2 border-purple-500/50 rounded-2xl p-8 shadow-2xl flex flex-col h-full"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl mb-6">
                <Zap className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Copywriting Publicitar</h3>
              <p className="text-gray-400 mb-6 leading-relaxed flex-grow">
                Generează texte clare și convingătoare pentru marketing. 
                De la postări pe social media la descrieri de produse, creează conținut care vinde.
              </p>
              <motion.button
                onClick={() => router.push('/dashboard?tool=copywriting')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 mt-auto"
              >
                <span>Încearcă</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>

            {/* Tool 3: Planificare Conținut */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border-2 border-green-500/50 rounded-2xl p-8 shadow-2xl flex flex-col h-full"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl mb-6">
                <Award className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Planificare de Conținut</h3>
              <p className="text-gray-400 mb-6 leading-relaxed flex-grow">
                Construiește un plan clar de postare pentru social media. 
                Organizează-ți conținutul pe săptămâni și luni pentru o strategie consistentă.
              </p>
              <motion.button
                onClick={() => router.push('/dashboard?tool=planificare-conținut')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg shadow-green-500/25 flex items-center justify-center gap-2 mt-auto"
              >
                <span>Încearcă</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          </div>
        </section>

        {/* Generated Result Section */}
        {(generatedImageUrl || generatedText || generatedImageError) && (
          <section id="generated-image" className="py-16 px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700/50 shadow-2xl"
              >
                <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-2">
                  {generatedText ? (
                    <>
                      <Sparkles className="w-6 h-6 text-purple-400" />
                      Text Generat
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-6 h-6 text-purple-400" />
                      Reclama Generată
                    </>
                  )}
                </h2>

                {generatedText ? (
                  <div className="space-y-4">
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="relative rounded-lg overflow-hidden border-2 border-purple-500/50 shadow-xl bg-gray-800/50 p-6"
                    >
                      <div className="prose prose-invert max-w-none">
                        <p className="text-white text-lg leading-relaxed whitespace-pre-wrap">
                          {generatedText}
                        </p>
                      </div>
                    </motion.div>
                    
                    <div className="flex gap-4">
                      <motion.button
                        onClick={() => {
                          navigator.clipboard.writeText(generatedText)
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-lg transition-all text-center shadow-lg"
                      >
                        Copiază Textul
                      </motion.button>
                      <motion.button
                        onClick={() => {
                          setGeneratedText(null)
                          setGeneratedImageError(null)
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all shadow-lg"
                      >
                        Șterge
                      </motion.button>
                    </div>
                  </div>
                ) : generatedImageUrl ? (
                  <div className="space-y-4">
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="relative rounded-lg overflow-hidden border-2 border-purple-500/50 shadow-xl"
                    >
                      <img
                        src={generatedImageUrl}
                        alt="Generated ad"
                        className="w-full h-auto"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
                    </motion.div>
                    
                    <div className="flex gap-4">
                      <motion.a
                        href={generatedImageUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-lg transition-all text-center shadow-lg"
                      >
                        Descarcă Imaginea
                      </motion.a>
                      <motion.button
                        onClick={() => {
                          setGeneratedImageUrl(null)
                          setGeneratedImageError(null)
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all shadow-lg"
                      >
                        Șterge
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <p className="text-yellow-400 text-center">{generatedImageError}</p>
                  </div>
                )}
              </motion.div>
            </div>
          </section>
        )}


        {/* Pricing Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Pachete de Prețuri
              </span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Alege pachetul de credite perfect pentru nevoile tale. Copywriting (4 credite), imagini (8 credite), analiză de piață (6 credite), strategie video (6 credite), planificare (7 credite).
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {pricingPackages.map((pkg, index) => (
              <motion.div
                key={pkg.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className={`relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border-2 ${pkg.borderColor} rounded-2xl p-8 ${
                  pkg.popular ? 'md:-mt-4 md:mb-4' : ''
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3, type: 'spring' }}
                      className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold rounded-full whitespace-nowrap"
                    >
                      Cel Mai Popular
                    </motion.div>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-3xl font-extrabold text-white mb-3 tracking-tight" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '-0.02em' }}>
                    {pkg.name}
                  </h3>
                  <div className="flex flex-col items-center justify-center mb-4">
                    <span className="text-5xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '-0.03em', lineHeight: '1' }}>
                      {pkg.price}€
                    </span>
                    <p className="text-2xl font-bold text-purple-400 mt-2">{pkg.credits} credite</p>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {pkg.features.map((feature, featureIndex) => (
                    <motion.li
                      key={featureIndex}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 + featureIndex * 0.05 }}
                      className="flex items-start"
                    >
                      <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-200 text-base font-medium leading-relaxed">{feature}</span>
                    </motion.li>
                  ))}
                </ul>

                <motion.button
                  onClick={() => handleChoosePlan(pkg)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full py-4 px-6 font-bold text-base rounded-lg transition-all duration-300 tracking-wide ${
                    pkg.popular
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/25'
                      : 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700'
                  }`}
                  style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                >
                  Alege Planul
                </motion.button>
              </motion.div>
            ))}
          </div>
        </section>
      </div>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0a0a0f]"
          >
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-white transition-colors z-10 bg-gray-800/50 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="min-h-screen flex items-center justify-center p-4">
              <Auth 
                onAuthSuccess={() => {
                  setShowAuthModal(false)
                  // handleStripeCheckout va fi apelat automat când utilizatorul se autentifică
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}

