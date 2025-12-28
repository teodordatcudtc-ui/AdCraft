'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sparkles, Zap, Target, Award, ArrowRight, Image as ImageIcon, Check, TrendingUp, Users, Clock, Settings, ChevronDown, ChevronUp } from 'lucide-react'
import { isAdminAuthenticated } from '@/lib/admin-auth'

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

// Typing effect component
function TypingText({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isDeleting && currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1))
        setCurrentIndex(currentIndex + 1)
      } else if (!isDeleting && currentIndex === text.length) {
        // Wait before deleting
        setTimeout(() => setIsDeleting(true), 2000)
      } else if (isDeleting && currentIndex > 0) {
        setDisplayedText(text.slice(0, currentIndex - 1))
        setCurrentIndex(currentIndex - 1)
      } else if (isDeleting && currentIndex === 0) {
        setIsDeleting(false)
      }
    }, isDeleting ? 50 : 100)

    return () => clearTimeout(timeout)
  }, [currentIndex, isDeleting, text])

  return (
    <span>
      {displayedText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
        className="inline-block w-0.5 h-[1em] bg-[#771967] ml-1"
      />
    </span>
  )
}

export default function Home() {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  
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

  // Dacă se verifică autentificarea, afișează loading
  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            className="w-16 h-16 border-4 border-white/10 border-t-[#771967] rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <p className="text-gray-400 font-light">Se verifică accesul...</p>
        </motion.div>
      </div>
    )
  }

  // Costuri în credite
  const TEXT_GENERATION_COST = 3
  const IMAGE_GENERATION_COST = 6
  
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
      name: 'Pachet 1',
      credits: 50,
      price: 10,
      features: [
        '50 credite',
        '~16 generări de text (3 credite)',
        '~8 generări de imagini (6 credite)',
        'Sau combinații personalizate',
        'Suport email',
      ],
      color: 'from-blue-500 to-cyan-500',
      borderColor: 'border-blue-500/50',
    },
    {
      name: 'Pachet 2',
      credits: 120,
      price: 20,
      features: [
        '120 credite',
        '~40 generări de text (3 credite)',
        '~20 generări de imagini (6 credite)',
        'Sau combinații personalizate',
        'Suport priorititar',
      ],
      color: 'from-purple-500 to-pink-500',
      borderColor: 'border-purple-500/50',
      popular: true,
    },
    {
      name: 'Pachet 3',
      credits: 350,
      price: 50,
      features: [
        '350 credite',
        '~116 generări de text (3 credite)',
        '~58 generări de imagini (6 credite)',
        'Sau combinații personalizate',
        'Suport dedicat',
      ],
      color: 'from-orange-500 to-red-500',
      borderColor: 'border-orange-500/50',
    },
  ]

  const stats = [
    { value: '1200+', label: 'Reclame Generate', icon: TrendingUp },
    { value: '500+', label: 'Clienți Mulțumiți', icon: Users },
    { value: '< 30s', label: 'Timp Generare', icon: Clock },
  ]

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white relative overflow-hidden">
      {/* Modern animated background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Animated gradient orbs */}
        <motion.div
          className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-[#771967]/15 rounded-full blur-[250px]"
          animate={{
            x: [0, 150, -80, 0],
            y: [0, 200, 120, 0],
            scale: [1, 1.3, 0.8, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-[700px] h-[700px] bg-[#771967]/12 rounded-full blur-[250px]"
          animate={{
            x: [0, -120, 80, 0],
            y: [0, -150, -100, 0],
            scale: [1, 1.4, 0.7, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 3,
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-[#771967]/10 rounded-full blur-[200px] -translate-x-1/2 -translate-y-1/2"
          animate={{
            scale: [1, 1.5, 0.9, 1],
            opacity: [0.4, 0.7, 0.4],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1.5,
          }}
        />
        
        {/* Animated mesh gradient with movement */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at 20% 30%, rgba(119, 25, 103, 0.2) 0%, transparent 40%),
              radial-gradient(circle at 80% 70%, rgba(119, 25, 103, 0.15) 0%, transparent 40%),
              radial-gradient(circle at 50% 50%, rgba(119, 25, 103, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 10% 80%, rgba(119, 25, 103, 0.12) 0%, transparent 35%)
            `,
          }}
          animate={{
            opacity: [0.6, 1, 0.6],
            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        {/* Animated particles/stars effect */}
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#771967] rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
              y: [0, -100, -200],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: 'linear',
            }}
          />
        ))}
        
        {/* Animated grid pattern with movement */}
        <motion.div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(119, 25, 103, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(119, 25, 103, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
          animate={{
            backgroundPosition: ['0 0', '60px 60px'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(119, 25, 103, 0.1) 50%, transparent 100%)',
            transform: 'skewX(-20deg)',
          }}
          animate={{
            x: ['-100%', '200%'],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'linear',
            repeatDelay: 2,
          }}
        />
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
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold mb-8 leading-[1.1] tracking-tight">
                <span className="text-white">Noul Standard pentru</span>
                <br />
                <span className="text-[#771967]">
                  Generarea de Reclame
                </span>
                <br />
                <span className="text-white">
                  cu <TypingText text="Inteligență Artificială" />
                </span>
              </h1>

              <p className="text-xl text-gray-300 mb-10 leading-relaxed max-w-xl font-light">
                AdLence.ai este o platformă avansată care generează reclame optimizate pentru produsele tale. 
                Creează conținut inteligent și imagini captivante în secunde, adaptate perfect pentru target-ul tău.
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 bg-[#771967] hover:bg-[#771967]/90 text-white font-medium rounded-full transition-all duration-300"
                >
                  Începe Acum
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 bg-transparent border border-white/20 hover:border-white/30 text-white font-medium rounded-full transition-all duration-300"
                >
                  Vezi Demo
                </motion.button>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 mt-8">
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
                      <div className="w-2 h-2 bg-[#771967] rounded-full" />
                      <span className="text-sm font-medium text-white">{stat.value}</span>
                      <span className="text-xs text-gray-400 font-light">{stat.label}</span>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>

            {/* Right Column - Form */}
            <motion.div
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 sm:p-10">
                <div className="relative z-10">
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <h2 className="text-3xl font-light mb-2 text-white tracking-tight">
                      Testează Acum
                    </h2>
                    <p className="text-sm text-gray-400 mb-6 font-light">Generează prima ta reclamă în secunde</p>
                  </motion.div>
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="relative"
                    >
                      <label htmlFor="prompt" className="block text-sm font-medium text-white mb-2 tracking-tight">
                        Descrie produsul
                      </label>
                      <input
                        type="text"
                        id="prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ex: ceai organic premium, ambalaj eco-friendly..."
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#771967]/50 focus:border-[#771967]/50 transition-all text-sm font-light"
                        required
                      />
                    </motion.div>

                    {/* Opțiune generare doar text */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 }}
                      className="relative"
                    >
                      <label className="flex items-center gap-3 p-4 bg-white/10 hover:bg-white/15 border border-white/20 rounded-2xl cursor-pointer transition-all group">
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
                          className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#771967] focus:ring-[#771967] focus:ring-2"
                        />
                        <span className="text-sm font-medium text-white tracking-tight">Generează doar text (copywriting)</span>
                      </label>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="relative"
                    >
                      <label htmlFor="image" className="block text-sm font-medium text-white mb-2 tracking-tight">
                        Poza produsului <span className="text-xs text-gray-400 font-light">(opțional)</span>
                      </label>
                      {generateOnlyText ? (
                        <div className="w-full h-16 border border-dashed border-white/20 rounded-2xl bg-white/10 flex items-center justify-center">
                          <p className="text-sm text-gray-400 font-light">Generare doar text - imaginea nu este necesară</p>
                        </div>
                      ) : imagePreview ? (
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="relative group rounded-2xl overflow-hidden border border-white/10"
                        >
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-40 object-cover"
                          />
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setImage(null)
                              setImagePreview(null)
                            }}
                            className="absolute top-3 right-3 px-4 py-2 bg-red-500/90 hover:bg-red-500 text-white text-sm font-medium rounded-full transition-colors"
                          >
                            Șterge
                          </motion.button>
                        </motion.div>
                      ) : (
                        <label className="relative flex items-center justify-center w-full h-16 border border-dashed border-white/20 rounded-2xl cursor-pointer bg-white/10 hover:bg-white/15 transition-all group">
                          <div className="relative flex items-center space-x-2">
                            <ImageIcon className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                            <p className="text-sm text-gray-400 group-hover:text-white font-light transition-colors">
                              Click pentru a încărca sau drag & drop
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
                          className="w-full flex items-center justify-between px-4 py-3 bg-white/10 hover:bg-white/15 border border-white/20 rounded-2xl transition-all"
                        >
                          <div className="flex items-center gap-2">
                            <Settings className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-white tracking-tight">Opțiuni avansate</span>
                          </div>
                          {showAdvanced ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
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
                          <div className="mt-4 space-y-4 p-6 bg-white/10 rounded-2xl border border-white/20">
                          {/* Aspect Ratio Presets */}
                          <div>
                            <label className="block text-sm font-medium text-white mb-4 tracking-tight">Aspect Ratio</label>
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
                                    className={`relative p-4 rounded-2xl border transition-all ${
                                      isSelected
                                        ? 'border-[#771967] bg-[#771967]/20'
                                        : 'border-white/10 bg-white/5 hover:border-white/20'
                                    }`}
                                  >
                                    {/* Preview Rectangle */}
                                    <div className="mb-3 flex items-center justify-center">
                                      <div
                                        className={`${preset.previewClass} ${
                                          isSelected
                                            ? 'bg-[#771967]/30 border border-[#771967]/50'
                                            : 'bg-white/10 border border-white/20'
                                        } rounded transition-all`}
                                      />
                                    </div>
                                    
                                    {/* Label and Info */}
                                    <div className="text-center">
                                      <div className="flex items-center justify-center gap-2 mb-1">
                                        <span className={`text-sm font-medium ${isSelected ? 'text-[#771967]' : 'text-white'}`}>
                                          {preset.label}
                                        </span>
                                        {isSelected && (
                                          <Check className="w-4 h-4 text-[#771967]" />
                                        )}
                                      </div>
                                      <p className="text-xs text-gray-400 mb-1 font-light">{preset.description}</p>
                                      <p className="text-xs text-gray-500 font-light">
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
                            <label className="block text-sm font-medium text-white mb-2 tracking-tight">Stil</label>
                            <select
                              value={options.style}
                              onChange={(e) => setOptions({ ...options, style: e.target.value })}
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#771967]/50 focus:border-[#771967]/50 font-light"
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
                            <label className="block text-sm font-medium text-white mb-2 tracking-tight">Negative Prompt</label>
                            <input
                              type="text"
                              value={options.negativePrompt}
                              onChange={(e) => setOptions({ ...options, negativePrompt: e.target.value })}
                              placeholder="blurry, low quality, distorted"
                              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#771967]/50 focus:border-[#771967]/50 font-light"
                            />
                          </div>

                          {/* Guidance Scale */}
                          <div>
                            <label className="block text-sm font-medium text-white mb-2 tracking-tight">
                              Guidance Scale: {options.guidanceScale}
                            </label>
                            <input
                              type="range"
                              min="1"
                              max="20"
                              step="0.5"
                              value={options.guidanceScale}
                              onChange={(e) => setOptions({ ...options, guidanceScale: parseFloat(e.target.value) })}
                              className="w-full accent-[#771967]"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1 font-light">
                              <span>Mai puțin creativ</span>
                              <span>Mai creativ</span>
                            </div>
                          </div>

                          {/* Num Inference Steps */}
                          <div>
                            <label className="block text-sm font-medium text-white mb-2 tracking-tight">
                              Calitate (Steps): {options.numInferenceSteps}
                            </label>
                            <input
                              type="range"
                              min="10"
                              max="50"
                              step="5"
                              value={options.numInferenceSteps}
                              onChange={(e) => setOptions({ ...options, numInferenceSteps: parseInt(e.target.value) })}
                              className="w-full accent-[#771967]"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1 font-light">
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
                      whileHover={{ scale: isLoading ? 1 : 1.02 }}
                      whileTap={{ scale: isLoading ? 1 : 0.98 }}
                      className="w-full py-4 px-6 bg-[#771967] hover:bg-[#771967]/90 text-white font-medium rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <motion.svg
                            className="animate-spin h-5 w-5 text-white"
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
                          <Sparkles className="w-5 h-5" />
                          <span className="text-sm">{generateOnlyText ? 'Generează Text' : 'Generează Reclamă'}</span>
                          <span className="text-xs bg-white/20 px-2 py-1 rounded-full font-medium">
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
                        className="relative group overflow-hidden rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all flex-shrink-0 w-64 lg:w-80 xl:w-96"
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
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black to-transparent pointer-events-none z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black to-transparent pointer-events-none z-10" />
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
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10"
              >
                <h2 className="text-3xl font-light mb-8 text-white tracking-tight flex items-center gap-3">
                  {generatedText ? (
                    <>
                      <Sparkles className="w-6 h-6 text-[#771967]" />
                      Text Generat
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-6 h-6 text-[#771967]" />
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
                      className="relative rounded-2xl overflow-hidden border border-white/10 bg-white/5 p-8"
                    >
                      <div className="prose prose-invert max-w-none">
                        <p className="text-white text-lg leading-relaxed whitespace-pre-wrap font-light">
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
                      className="relative rounded-2xl overflow-hidden border border-white/10"
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
                  <div className="p-8 bg-white/5 border border-white/10 rounded-2xl">
                    <p className="text-gray-300 text-center font-light">{generatedImageError}</p>
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
            <h2 className="text-5xl sm:text-6xl font-light mb-6 text-white tracking-tight">
              Pachete de Prețuri
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light">
              Alege pachetul de credite perfect pentru nevoile tale. Folosește creditele pentru generare text (3 credite) sau imagini (6 credite).
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
                whileHover={{ y: -5 }}
                className={`relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-10 ${
                  pkg.popular ? 'md:-mt-4 md:mb-4 border-[#771967]/60' : ''
                } hover:border-white/30 transition-all group`}
                style={{
                  boxShadow: pkg.popular 
                    ? '0 0 40px rgba(119, 25, 103, 0.3), 0 0 80px rgba(119, 25, 103, 0.15), 0 0 120px rgba(119, 25, 103, 0.1)' 
                    : '0 0 30px rgba(119, 25, 103, 0.15), 0 0 60px rgba(119, 25, 103, 0.08)'
                }}
              >
                {/* Animated glow effect */}
                <motion.div
                  className="absolute -inset-0.5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: `linear-gradient(135deg, rgba(119, 25, 103, 0.3), rgba(119, 25, 103, 0.1))`,
                    filter: 'blur(20px)',
                  }}
                  animate={{
                    opacity: [0, 0.3, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
                {pkg.popular && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center z-10">
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3, type: 'spring' }}
                      className="px-4 py-1.5 bg-[#771967] text-white text-sm font-medium rounded-full whitespace-nowrap"
                    >
                      Cel Mai Popular
                    </motion.div>
                  </div>
                )}

                <div className="text-center mb-8 relative z-10">
                  <h3 className="text-2xl font-semibold text-white mb-6 tracking-tight">
                    {pkg.name}
                  </h3>
                  <div className="flex flex-col items-center justify-center mb-6">
                    <span className="text-6xl font-bold text-white mb-2 tracking-tight">
                      {pkg.price}€
                    </span>
                    <p className="text-xl font-semibold text-[#771967]">{pkg.credits} credite</p>
                  </div>
                </div>

                <ul className="space-y-4 mb-10 relative z-10">
                  {pkg.features.map((feature, featureIndex) => (
                    <motion.li
                      key={featureIndex}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 + featureIndex * 0.05 }}
                      className="flex items-start"
                    >
                      <Check className="w-5 h-5 text-[#771967] mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300 text-sm leading-relaxed font-medium">{feature}</span>
                    </motion.li>
                  ))}
                </ul>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-4 px-6 font-medium text-sm rounded-full transition-all duration-300 relative z-10 ${
                    pkg.popular
                      ? 'bg-[#771967] hover:bg-[#771967]/90 text-white'
                      : 'bg-white/10 hover:bg-white/15 text-white border border-white/20'
                  }`}
                >
                  Alege Planul
                </motion.button>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

