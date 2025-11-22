'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import Auth from '@/components/Auth'
import type { User } from '@supabase/supabase-js'
import {
  LayoutDashboard,
  Wrench,
  FileText,
  Coins,
  Settings,
  User as UserIcon,
  Menu,
  X,
  Sparkles,
  LogOut,
  Bell,
  Search,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  Eye,
  Plus,
  Minus,
  CreditCard,
  BarChart3,
  Activity,
  Zap,
  Image as ImageIcon,
  FileEdit,
  History,
  Shield,
  Mail,
  Phone,
  Globe,
  ChevronDown,
  ChevronUp,
  Check,
} from 'lucide-react'

type Section = 'tooluri' | 'logs' | 'credite' | 'setari' | 'profil'

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
    previewClass: 'w-16 aspect-video'
  },
  '9:16': { 
    width: 1080, 
    height: 1920, 
    label: '9:16', 
    description: 'Portrait (Stories, Mobile)',
    previewClass: 'w-10 aspect-[9/16] mx-auto'
  },
  '1:1': { 
    width: 1024, 
    height: 1024, 
    label: '1:1', 
    description: 'Square (Instagram, Facebook)',
    previewClass: 'w-16 aspect-square'
  },
  '4:3': { 
    width: 1280, 
    height: 960, 
    label: '4:3', 
    description: 'Classic (Print, Presentation)',
    previewClass: 'w-16 aspect-[4/3]'
  },
}

const IMAGE_GENERATION_COST = 5

interface LogEntry {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  timestamp: string
  action: string
}

interface CreditTransaction {
  id: string
  type: 'purchase' | 'usage' | 'refund'
  amount: number
  description: string
  timestamp: string
  status: 'completed' | 'pending' | 'failed'
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState<Section>('tooluri')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Date reale din baza de date
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [transactions, setTransactions] = useState<CreditTransaction[]>([])
  const [currentCredits, setCurrentCredits] = useState<number>(0)
  const [totalSpent, setTotalSpent] = useState<number>(0)
  const [totalEarned, setTotalEarned] = useState<number>(0)
  const [totalGenerations, setTotalGenerations] = useState<number>(0)
  const [successfulGenerations, setSuccessfulGenerations] = useState<number>(0)
  const [failedGenerations, setFailedGenerations] = useState<number>(0)
  
  // Modal state pentru generare reclama
  const [isGenerateAdModalOpen, setIsGenerateAdModalOpen] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)
  const [generatedImageError, setGeneratedImageError] = useState<string | null>(null)
  const [options, setOptions] = useState<ImageOptions>({
    aspectRatio: '1:1',
    style: 'professional',
    negativePrompt: 'blurry, low quality, distorted',
    guidanceScale: 7.5,
    numInferenceSteps: 20,
  })

  // Funcție pentru încărcarea datelor reale (cu protecție împotriva apelurilor multiple)
  const loadUserDataRef = useRef<{ [key: string]: boolean }>({})
  
  const loadUserData = async (userId: string) => {
    // Previne apelurile multiple simultane pentru același user
    if (loadUserDataRef.current[userId]) {
      console.log('loadUserData already in progress for user:', userId)
      return
    }

    loadUserDataRef.current[userId] = true

    try {
      // OPTIMIZARE: Încarcă toate datele în paralel pentru viteză maximă
      const [creditsResult, transactionsResult, logsResult, generationsResult] = await Promise.all([
        // 1. Încearcă să încarce creditele folosind funcția SQL
        supabase.rpc('get_user_credits', { user_uuid: userId }),
        // 2. Încarcă tranzacțiile (folosim pentru calcul credite ca fallback)
        supabase
          .from('credit_transactions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50),
        // 3. Încarcă logs
        supabase
          .from('activity_logs')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50),
        // 4. Încarcă statistici generări
        supabase
          .from('generations')
          .select('id, status')
          .eq('user_id', userId)
      ])

      // Procesează creditele
      const { data: creditsData, error: creditsError } = creditsResult
      
      if (!creditsError && creditsData !== null && creditsData !== undefined) {
        setCurrentCredits(creditsData || 0)
      } else {
        // Fallback: calculează creditele direct din tranzacții
        const { data: transactionsData } = transactionsResult
        if (transactionsData) {
          const calculatedCredits = transactionsData
            .filter(t => t.status === 'completed')
            .reduce((sum, t) => sum + (t.amount || 0), 0)
          setCurrentCredits(calculatedCredits)
          console.log('Calculated credits from transactions:', calculatedCredits)
        } else {
          setCurrentCredits(0)
        }
      }

      // Procesează tranzacțiile
      const { data: transactionsData, error: transactionsError } = transactionsResult
      if (!transactionsError && transactionsData) {
        const formattedTransactions: CreditTransaction[] = transactionsData.map(t => ({
          id: t.id,
          type: t.type as 'purchase' | 'usage' | 'refund',
          amount: t.amount,
          description: t.description,
          timestamp: new Date(t.created_at).toLocaleString('ro-RO'),
          status: t.status as 'completed' | 'pending' | 'failed',
        }))
        setTransactions(formattedTransactions)

        // Calculează total cumpărat și total folosit
        const earned = transactionsData
          .filter(t => t.type === 'purchase' && t.status === 'completed')
          .reduce((sum, t) => sum + (t.amount > 0 ? t.amount : 0), 0)
        
        const spent = transactionsData
          .filter(t => t.type === 'usage' && t.status === 'completed')
          .reduce((sum, t) => sum + Math.abs(t.amount), 0)
        
        setTotalEarned(earned)
        setTotalSpent(spent)
      }

      // Procesează logs
      const { data: logsData, error: logsError } = logsResult
      if (!logsError && logsData) {
        const formattedLogs: LogEntry[] = logsData.map(log => ({
          id: log.id,
          type: log.type as 'success' | 'error' | 'info' | 'warning',
          message: log.message,
          timestamp: new Date(log.created_at).toLocaleString('ro-RO'),
          action: log.action,
        }))
        setLogs(formattedLogs)
      }

      // Procesează statistici generări
      const { data: generationsData, error: generationsError } = generationsResult
      if (!generationsError && generationsData) {
        setTotalGenerations(generationsData.length)
        setSuccessfulGenerations(generationsData.filter(g => g.status === 'completed').length)
        setFailedGenerations(generationsData.filter(g => g.status === 'failed').length)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      // Eliberează lock-ul imediat după terminare
      delete loadUserDataRef.current[userId]
    }
  }

  const menuItems = [
    { id: 'tooluri' as Section, label: 'Tooluri', icon: Wrench },
    { id: 'logs' as Section, label: 'Logs', icon: FileText },
    { id: 'credite' as Section, label: 'Credite', icon: Coins },
    { id: 'setari' as Section, label: 'Setări', icon: Settings },
    { id: 'profil' as Section, label: 'Profil', icon: UserIcon },
  ]

  // Verifică sesiunea și încarcă profilul
  useEffect(() => {
    let mounted = true
    let subscription: { unsubscribe: () => void } | null = null
    let loadingTimeout: NodeJS.Timeout | null = null
    let isLoadingData = false

    const checkSession = async () => {
      try {
        // Timeout de siguranță - oprește loading după 5 secunde (optimizat)
        loadingTimeout = setTimeout(() => {
          if (mounted) {
            console.warn('Loading timeout - forcing loading to stop')
            setLoading(false)
          }
        }, 5000)

        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          if (mounted) {
            setLoading(false)
          }
          return
        }

        if (mounted) {
          setUser(session?.user ?? null)

          if (session?.user && !isLoadingData) {
            isLoadingData = true
            
            try {
              // Încarcă profilul utilizatorului
              const { data: profile, error: profileError } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', session.user.id)
                .single()

              if (profileError) {
                console.error('Error loading profile:', profileError)
              }

              if (mounted) {
                setUserProfile(profile)
                
                // Încarcă datele utilizatorului (doar o dată)
                await loadUserData(session.user.id)
              }
            } catch (loadError) {
              console.error('Error loading user data:', loadError)
            } finally {
              isLoadingData = false
            }
          }
        }
      } catch (error) {
        console.error('Error checking session:', error)
      } finally {
        if (loadingTimeout) {
          clearTimeout(loadingTimeout)
        }
        if (mounted) {
          setLoading(false)
        }
      }
    }

    checkSession()

    // Ascultă schimbările de autentificare (doar o dată)
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        // Evită loop-uri infinite - procesează doar evenimente relevante și doar o dată
        if ((event === 'SIGNED_OUT' || event === 'SIGNED_IN') && !isLoadingData) {
          isLoadingData = true
          
          try {
            setUser(session?.user ?? null)
            
            if (session?.user) {
              const { data: profile } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', session.user.id)
                .single()
            
              if (mounted) {
                setUserProfile(profile)
                // Reîncarcă datele când se schimbă sesiunea (doar pentru SIGNED_IN)
                if (event === 'SIGNED_IN') {
                  await loadUserData(session.user.id)
                }
              }
            } else {
              if (mounted) {
                setUserProfile(null)
                // Resetează datele când user-ul se deconectează
                setLogs([])
                setTransactions([])
                setCurrentCredits(0)
                setTotalSpent(0)
                setTotalEarned(0)
                setTotalGenerations(0)
                setSuccessfulGenerations(0)
                setFailedGenerations(0)
              }
            }
          } catch (error) {
            console.error('Error in auth state change:', error)
          } finally {
            isLoadingData = false
          }
        }
      }
    )

    subscription = authSubscription

    return () => {
      mounted = false
      if (loadingTimeout) {
        clearTimeout(loadingTimeout)
      }
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, []) // Empty deps - rulează doar o dată la mount

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setUserProfile(null)
  }

  const handleAddTestCredits = async () => {
    if (!user) return

    try {
      // Trimite user_id direct (utilizatorul este deja autentificat)
      const response = await fetch('/api/add-test-credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id
        }),
      })

      const result = await response.json()
      console.log('API response:', result)

      if (!response.ok) {
        console.error('API error response:', result)
        throw new Error(result.error || result.details || 'Eroare la adăugarea creditelor')
      }

      // Reîncarcă datele utilizatorului
      if (user) {
        await loadUserData(user.id)
      }

      alert('10 credite au fost adăugate cu succes!')
    } catch (error) {
      console.error('Error adding test credits:', error)
      alert(error instanceof Error ? error.message : 'Eroare la adăugarea creditelor')
    }
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
    setGeneratedImageError(null)
    
    try {
      // Verifică dacă utilizatorul are suficiente credite
      if (currentCredits < IMAGE_GENERATION_COST) {
        setGeneratedImageError(`Nu ai suficiente credite! Ai nevoie de ${IMAGE_GENERATION_COST} credite, dar ai doar ${currentCredits}. Te rugăm să adaugi credite pentru a continua.`)
        setIsLoading(false)
        return
      }

      // Convertim imaginea în base64 dacă există
      let imageBase64 = null
      if (image) {
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
          generateOnlyText: false,
          options: {
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
        if (result.data?.image_url) {
          // Reclama este gata - afișăm imaginea
          setGeneratedImageUrl(result.data.image_url)
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
    } finally {
      setIsLoading(false)
    }
  }

  const getLogIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />
      case 'warning':
        return <Clock className="w-5 h-5 text-yellow-400" />
      default:
        return <FileText className="w-5 h-5 text-blue-400" />
    }
  }

  const getTransactionIcon = (type: CreditTransaction['type']) => {
    switch (type) {
      case 'purchase':
        return <Plus className="w-5 h-5 text-green-400" />
      case 'usage':
        return <Minus className="w-5 h-5 text-red-400" />
      case 'refund':
        return <CreditCard className="w-5 h-5 text-blue-400" />
    }
  }

  // Afișează formularul de autentificare dacă nu e autentificat
  if (loading) {
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
          <p className="text-gray-400">Se încarcă...</p>
        </motion.div>
      </div>
    )
  }

  if (!user) {
    return <Auth onAuthSuccess={() => window.location.reload()} />
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: sidebarOpen ? 0 : -280 }}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        transition={{ duration: 0.3 }}
        className="fixed lg:static inset-y-0 left-0 z-40 w-72 bg-gradient-to-b from-gray-900/95 to-gray-800/95 backdrop-blur-xl border-r border-gray-800/50 flex flex-col"
      >
        {/* Logo & Header */}
        <div className="p-6 border-b border-gray-800/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                <Sparkles className="w-8 h-8 text-blue-400" />
                <motion.div
                  className="absolute inset-0 bg-blue-400/20 rounded-full blur-xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  AdCraft AI
                </h1>
                <p className="text-xs text-gray-400">Dashboard</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id
            return (
              <motion.button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </motion.button>
            )
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-800/50">
          <div className="flex items-center space-x-3 px-4 py-3 bg-gray-800/50 rounded-lg mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {userProfile?.full_name || user.email?.split('@')[0] || 'Utilizator'}
              </p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleAddTestCredits}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-green-400 hover:text-green-300 hover:bg-green-500/30 transition-all mb-2"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">+10 Credite (Test)</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Deconectare</span>
          </button>
        </div>
      </motion.aside>

      {/* Overlay pentru mobile */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800/50">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <Menu className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-bold text-white capitalize">
                  {menuItems.find((item) => item.id === activeSection)?.label}
                </h2>
              </div>
              <div className="flex items-center space-x-4">
                {/* Search */}
                <div className="hidden md:flex items-center space-x-2 px-4 py-2 bg-gray-800/50 rounded-lg border border-gray-700/50">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Caută..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none text-white placeholder-gray-400 text-sm w-48"
                  />
                </div>
                {/* Notifications */}
                <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                {/* Credits Badge */}
                <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg">
                  <Coins className="w-5 h-5 text-purple-400" />
                  <span className="text-sm font-bold text-white">{currentCredits}</span>
                  <span className="text-xs text-gray-400">credite</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            {activeSection === 'tooluri' && (
              <motion.div
                key="tooluri"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Generate Ad Tool */}
                  <motion.div
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6 hover:border-blue-500/50 transition-all cursor-pointer"
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Generează Reclamă</h3>
                        <p className="text-sm text-gray-400">5 credite</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 mb-4">
                      Creează reclame optimizate cu AI pentru produsele tale
                    </p>
                    <button 
                      onClick={() => setIsGenerateAdModalOpen(true)}
                      className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-lg transition-all"
                    >
                      Deschide Tool
                    </button>
                  </motion.div>

                  {/* Generate Text Tool */}
                  <motion.div
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6 hover:border-purple-500/50 transition-all cursor-pointer"
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                        <FileEdit className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Generează Text</h3>
                        <p className="text-sm text-gray-400">3 credite</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 mb-4">
                      Copywriting optimizat pentru reclame și marketing
                    </p>
                    <button className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-lg transition-all">
                      Deschide Tool
                    </button>
                  </motion.div>

                  {/* Analytics Tool */}
                  <motion.div
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6 hover:border-green-500/50 transition-all cursor-pointer"
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500/20 to-cyan-500/20 flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Analiză Performanță</h3>
                        <p className="text-sm text-gray-400">Gratuit</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 mb-4">
                      Vezi statistici și analize pentru reclamele generate
                    </p>
                    <button className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-500 hover:to-cyan-500 text-white font-semibold rounded-lg transition-all">
                      Deschide Tool
                    </button>
                  </motion.div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Total Generări</span>
                      <Zap className="w-5 h-5 text-yellow-400" />
                    </div>
                    <p className="text-3xl font-bold text-white">{totalGenerations}</p>
                    {totalGenerations > 0 && (
                      <p className="text-xs text-gray-400 mt-2">{successfulGenerations} reușite</p>
                    )}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Credite Rămase</span>
                      <Coins className="w-5 h-5 text-purple-400" />
                    </div>
                    <p className="text-3xl font-bold text-white">{currentCredits}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {currentCredits > 0 ? `~${Math.floor(currentCredits / IMAGE_GENERATION_COST)} generări de imagini` : 'Fără credite'}
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Rata Succes</span>
                      <TrendingUp className="w-5 h-5 text-green-400" />
                    </div>
                    <p className="text-3xl font-bold text-white">
                      {totalGenerations > 0 
                        ? `${((successfulGenerations / totalGenerations) * 100).toFixed(1)}%`
                        : '0%'}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {successfulGenerations}/{totalGenerations} generări reușite
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {activeSection === 'logs' && (
              <motion.div
                key="logs"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-4">
                  <button className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-white rounded-lg text-sm font-medium">
                    Toate
                  </button>
                  <button className="px-4 py-2 bg-gray-800/50 border border-gray-700/50 text-gray-400 rounded-lg text-sm font-medium hover:text-white transition-colors">
                    Succes
                  </button>
                  <button className="px-4 py-2 bg-gray-800/50 border border-gray-700/50 text-gray-400 rounded-lg text-sm font-medium hover:text-white transition-colors">
                    Erori
                  </button>
                  <button className="px-4 py-2 bg-gray-800/50 border border-gray-700/50 text-gray-400 rounded-lg text-sm font-medium hover:text-white transition-colors">
                    Info
                  </button>
                </div>

                {/* Logs List */}
                <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-xl overflow-hidden">
                  <div className="p-6 border-b border-gray-700/50">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Activity className="w-5 h-5 text-blue-400" />
                      Istoric Activități
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-700/50">
                    {logs.length === 0 ? (
                      <div className="p-6 text-center text-gray-400">
                        <p>Nu există activități încă</p>
                      </div>
                    ) : (
                      logs.map((log, index) => (
                        <motion.div
                          key={log.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="p-6 hover:bg-gray-800/30 transition-colors"
                        >
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 mt-1">{getLogIcon(log.type)}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-sm font-semibold text-white">{log.message}</p>
                                <span className="text-xs text-gray-400">{log.timestamp}</span>
                              </div>
                              <p className="text-xs text-gray-500">Acțiune: {log.action}</p>
                            </div>
                            <button className="p-2 text-gray-400 hover:text-white transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeSection === 'credite' && (
              <motion.div
                key="credite"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Credits Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-300">Credite Disponibile</span>
                      <Coins className="w-8 h-8 text-purple-400" />
                    </div>
                    <p className="text-4xl font-bold text-white mb-2">{currentCredits}</p>
                    <p className="text-xs text-gray-400">
                      {currentCredits > 0 ? `~${Math.floor(currentCredits / IMAGE_GENERATION_COST)} generări de imagini` : 'Fără credite'}
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-green-500/20 to-cyan-500/20 border border-green-500/30 rounded-xl p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-300">Total Cumpărate</span>
                      <TrendingUp className="w-8 h-8 text-green-400" />
                    </div>
                    <p className="text-4xl font-bold text-white mb-2">{totalEarned}</p>
                    <p className="text-xs text-gray-400">În total</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-xl p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-300">Total Folosite</span>
                      <Activity className="w-8 h-8 text-red-400" />
                    </div>
                    <p className="text-4xl font-bold text-white mb-2">{totalSpent}</p>
                    <p className="text-xs text-gray-400">În această lună</p>
                  </motion.div>
                </div>

                {/* Purchase Packages */}
                <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-400" />
                    Cumpără Credite
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { credits: 50, price: 10, popular: false },
                      { credits: 120, price: 20, popular: true },
                      { credits: 350, price: 50, popular: false },
                    ].map((pkg, index) => (
                      <motion.div
                        key={pkg.credits}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + index * 0.1 }}
                        className={`relative p-6 rounded-lg border-2 ${
                          pkg.popular
                            ? 'border-purple-500/50 bg-gradient-to-br from-purple-500/10 to-pink-500/10'
                            : 'border-gray-700/50 bg-gray-800/30'
                        }`}
                      >
                        {pkg.popular && (
                          <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold rounded-full">
                            Popular
                          </span>
                        )}
                        <div className="text-center mb-4">
                          <p className="text-3xl font-bold text-white">{pkg.credits}</p>
                          <p className="text-sm text-gray-400">credite</p>
                          <p className="text-2xl font-bold text-purple-400 mt-2">{pkg.price}€</p>
                        </div>
                        <button className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-lg transition-all">
                          Cumpără
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Transactions */}
                <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-xl overflow-hidden">
                  <div className="p-6 border-b border-gray-700/50">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <History className="w-5 h-5 text-blue-400" />
                      Istoric Tranzacții
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-700/50">
                    {transactions.length === 0 ? (
                      <div className="p-6 text-center text-gray-400">
                        <p>Nu există tranzacții încă</p>
                      </div>
                    ) : (
                      transactions.map((transaction, index) => (
                        <motion.div
                          key={transaction.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="p-6 hover:bg-gray-800/30 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                transaction.type === 'purchase'
                                  ? 'bg-green-500/20'
                                  : 'bg-red-500/20'
                              }`}>
                                {transaction.type === 'purchase' ? (
                                  <Plus className="w-5 h-5 text-green-400" />
                                ) : (
                                  <Minus className="w-5 h-5 text-red-400" />
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-white">{transaction.description}</p>
                                <p className="text-xs text-gray-400">{transaction.timestamp}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`text-lg font-bold ${
                                transaction.amount > 0 ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                              </p>
                              <span className={`text-xs px-2 py-1 rounded ${
                                transaction.status === 'completed'
                                  ? 'bg-green-500/20 text-green-400'
                                  : transaction.status === 'pending'
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : 'bg-red-500/20 text-red-400'
                              }`}>
                                {transaction.status}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeSection === 'setari' && (
              <motion.div
                key="setari"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 max-w-4xl"
              >
                {/* General Settings */}
                <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-blue-400" />
                    Setări Generale
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Limba Interfață
                      </label>
                      <select className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50">
                        <option>Română</option>
                        <option>English</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Tema
                      </label>
                      <select className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50">
                        <option>Dark (Implicit)</option>
                        <option>Light</option>
                        <option>Auto</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-1">
                          Notificări Email
                        </label>
                        <p className="text-xs text-gray-400">Primește notificări despre activitățile tale</p>
                      </div>
                      <button className="w-12 h-6 bg-blue-600 rounded-full relative">
                        <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* API Settings */}
                <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-400" />
                    Setări API
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        API Key
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="password"
                          value="sk_live_••••••••••••••••"
                          readOnly
                          className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white"
                        />
                        <button className="px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-400 hover:text-white transition-colors">
                          <Eye className="w-5 h-5" />
                        </button>
                        <button className="px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-400 hover:text-white transition-colors">
                          Copiază
                        </button>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-colors">
                      Regenerare API Key
                    </button>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-gradient-to-br from-red-900/20 to-orange-900/20 backdrop-blur-xl border border-red-500/30 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Zonă Periculoasă</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-white">Șterge Contul</p>
                        <p className="text-xs text-gray-400">Șterge permanent contul și toate datele</p>
                      </div>
                      <button className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors">
                        Șterge
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeSection === 'profil' && (
              <motion.div
                key="profil"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 max-w-4xl"
              >
                {/* Profile Header */}
                <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6">
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <UserIcon className="w-12 h-12 text-white" />
                      </div>
                      <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors">
                        <Settings className="w-4 h-4 text-white" />
                      </button>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-white mb-1">
                        {userProfile?.full_name || user.email?.split('@')[0] || 'Utilizator'}
                      </h2>
                      <p className="text-gray-400 mb-2">{user.email}</p>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-gray-400">Membru din</span>
                        <span className="text-white font-semibold">
                          {userProfile?.created_at 
                            ? new Date(userProfile.created_at).toLocaleDateString('ro-RO', { month: 'long', year: 'numeric' })
                            : 'Recent'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile Information */}
                <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-blue-400" />
                    Informații Personale
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Nume Complet
                      </label>
                      <input
                        type="text"
                        defaultValue={userProfile?.full_name || ''}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        defaultValue={user?.email || ''}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Telefon
                      </label>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 flex items-center space-x-2 px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg">
                          <Globe className="w-5 h-5 text-gray-400" />
                          <input
                            type="tel"
                            defaultValue={userProfile?.phone || ''}
                            className="flex-1 bg-transparent border-none outline-none text-white"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Bio
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Despre tine..."
                        defaultValue={userProfile?.bio || ''}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50"
                      />
                    </div>
                    <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-lg transition-all">
                      Salvează Modificările
                    </button>
                  </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Total Generări</span>
                      <Zap className="w-5 h-5 text-yellow-400" />
                    </div>
                    <p className="text-3xl font-bold text-white">{totalGenerations}</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Credite Folosite</span>
                      <Coins className="w-5 h-5 text-purple-400" />
                    </div>
                    <p className="text-3xl font-bold text-white">{totalSpent}</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Membru de</span>
                      <Clock className="w-5 h-5 text-blue-400" />
                    </div>
                    <p className="text-3xl font-bold text-white">
                      {userProfile?.created_at 
                        ? Math.floor((Date.now() - new Date(userProfile.created_at).getTime()) / (1000 * 60 * 60 * 24))
                        : 0}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">zile</p>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Modal pentru Generare Reclamă */}
      <AnimatePresence>
        {isGenerateAdModalOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsGenerateAdModalOpen(false)
                setGeneratedImageUrl(null)
                setGeneratedImageError(null)
                setImage(null)
                setImagePreview(null)
                setPrompt('')
              }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div 
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border-2 border-gray-700/50 rounded-2xl shadow-2xl"
              >
                {/* Header */}
                <div className="sticky top-0 bg-gray-900/95 backdrop-blur-xl border-b border-gray-700/50 px-6 py-4 flex items-center justify-between z-10">
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                      Generează Reclamă
                    </h2>
                    <p className="text-sm text-gray-400">Creează reclame optimizate cu AI</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsGenerateAdModalOpen(false)
                      setGeneratedImageUrl(null)
                      setGeneratedImageError(null)
                      setImage(null)
                      setImagePreview(null)
                      setPrompt('')
                    }}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6">
                  {generatedImageUrl ? (
                    /* Rezultat generat */
                    <div className="space-y-4">
                      <div className="relative rounded-lg overflow-hidden border-2 border-purple-500/50 shadow-xl">
                        <img
                          src={generatedImageUrl}
                          alt="Generated ad"
                          className="w-full h-auto"
                        />
                      </div>
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
                            setPrompt('')
                            setImage(null)
                            setImagePreview(null)
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all shadow-lg"
                        >
                          Generează Altă Reclamă
                        </motion.button>
                      </div>
                    </div>
                  ) : (
                    /* Formular */
                    <form onSubmit={handleSubmit} className="space-y-5">
                      {/* Prompt */}
                      <div>
                        <label htmlFor="prompt" className="block text-sm font-semibold text-white mb-3 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-blue-400" />
                          Descrie produsul
                        </label>
                        <input
                          type="text"
                          id="prompt"
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          placeholder="Ex: ceai organic premium, ambalaj eco-friendly..."
                          className="w-full px-5 py-3.5 bg-gray-800/80 border-2 border-blue-500/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-400 transition-all text-base font-medium shadow-lg shadow-blue-500/20"
                          required
                        />
                      </div>

                      {/* Image Upload */}
                      <div>
                        <label htmlFor="image" className="block text-sm font-semibold text-white mb-3 flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-purple-400" />
                          Poza produsului <span className="text-xs text-gray-400 font-normal">(opțional)</span>
                        </label>
                        {imagePreview ? (
                          <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="relative rounded-lg overflow-hidden border-2 border-purple-500/50 shadow-lg shadow-purple-500/20"
                          >
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-full h-52 object-cover"
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
                          <label className="relative flex items-center justify-center w-full h-16 border-2 border-dashed border-purple-500/50 rounded-lg cursor-pointer bg-gray-800/60 hover:bg-gray-800/80 transition-all group shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20 hover:border-purple-400">
                            <div className="flex items-center space-x-3">
                              <ImageIcon className="w-6 h-6 text-purple-400 group-hover:text-purple-300 transition-colors" />
                              <p className="text-sm text-gray-300 group-hover:text-white font-medium transition-colors">
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
                      </div>

                      {/* Advanced Options */}
                      <div>
                        <motion.button
                          type="button"
                          onClick={() => setShowAdvanced(!showAdvanced)}
                          className="w-full flex items-center justify-between px-4 py-3 bg-gray-800/60 hover:bg-gray-800/80 border border-gray-700/50 rounded-lg transition-all"
                        >
                          <div className="flex items-center gap-2">
                            <Settings className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-semibold text-white">Opțiuni avansate</span>
                          </div>
                          {showAdvanced ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          )}
                        </motion.button>

                        <AnimatePresence>
                          {showAdvanced && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-4 space-y-4 p-4 bg-gray-800/40 rounded-lg border border-gray-700/30">
                                {/* Aspect Ratio */}
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
                                          <div className="mb-3 flex items-center justify-center">
                                            <div
                                              className={`${preset.previewClass} ${
                                                isSelected
                                                  ? 'bg-gradient-to-br from-blue-500/30 to-purple-500/30 border-2 border-blue-400/50'
                                                  : 'bg-gradient-to-br from-gray-700/50 to-gray-800/50 border border-gray-600/50'
                                              } rounded transition-all shadow-lg`}
                                            />
                                          </div>
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

                                {/* Style */}
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
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Cost */}
                      <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">Cost:</span>
                          <span className="text-lg font-bold text-purple-400">
                            {IMAGE_GENERATION_COST} credite
                          </span>
                        </div>
                      </div>

                      {/* Error Message */}
                      {generatedImageError && (
                        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                          <p className="text-yellow-400 text-sm">{generatedImageError}</p>
                        </div>
                      )}

                      {/* Submit Button */}
                      <motion.button
                        type="submit"
                        disabled={isLoading || !prompt.trim()}
                        whileHover={{ scale: isLoading ? 1 : 1.02 }}
                        whileTap={{ scale: isLoading ? 1 : 0.98 }}
                        className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 text-white font-bold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl shadow-purple-500/50 flex items-center justify-center space-x-2"
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
                            <span>Se generează...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5" />
                            <span>Generează Reclamă</span>
                          </>
                        )}
                      </motion.button>
                    </form>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

