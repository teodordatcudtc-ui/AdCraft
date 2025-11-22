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

const ASPECT_RATIO_PRESETS: Record<AspectRatio, { width: number; height: number }> = {
  '16:9': { width: 1920, height: 1080 },
  '9:16': { width: 1080, height: 1920 },
  '1:1': { width: 1024, height: 1024 },
  '4:3': { width: 1600, height: 1200 },
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

  // Ref pentru a preveni apelurile multiple
  const loadUserDataRef = useRef<{ [key: string]: boolean }>({})
  const sessionCheckedRef = useRef(false)

  // FUNCȚIE SIMPLIFICATĂ PENTRU ÎNCĂRCAREA DATELOR
  const loadUserData = async (userId: string) => {
    // Previne apelurile multiple simultane
    if (loadUserDataRef.current[userId]) {
      console.log('⏳ loadUserData already in progress')
      return
    }

    loadUserDataRef.current[userId] = true
    console.log('🔄 Starting loadUserData for:', userId)

    try {
      // Încarcă toate datele în paralel
      const [creditsResult, transactionsResult, logsResult, generationsResult, profileResult] = await Promise.all([
        (async () => {
          try {
            return await supabase.rpc('get_user_credits', { user_uuid: userId })
          } catch (err) {
            console.warn('RPC get_user_credits failed:', err)
            return { data: null, error: err }
          }
        })(),
        supabase
          .from('credit_transactions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(100),
        supabase
          .from('activity_logs')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('generations')
          .select('id, status')
          .eq('user_id', userId),
        supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .single(),
      ])

      // Procesează profilul
      if (profileResult.data) {
        setUserProfile(profileResult.data)
      }

      // Procesează creditele - PRIORITATE: tranzacții (mai sigur)
      const { data: transactionsData } = transactionsResult
      
      if (transactionsData && transactionsData.length > 0) {
        // Calculează creditele din tranzacții (metodă sigură)
        const purchases = transactionsData
          .filter(t => t.type === 'purchase' && t.status === 'completed')
          .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0)
        
        const usages = transactionsData
          .filter(t => t.type === 'usage' && t.status === 'completed')
          .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0)
        
        const calculatedCredits = purchases - usages
        const finalCredits = Math.max(0, calculatedCredits)
        
        // Verifică dacă RPC-ul a returnat o valoare validă
        const { data: creditsData, error: creditsError } = creditsResult
        if (!creditsError && creditsData !== null && creditsData !== undefined) {
          const rpcCredits = typeof creditsData === 'number' ? creditsData : Number(creditsData)
          if (!isNaN(rpcCredits) && rpcCredits >= 0) {
            // Folosește RPC dacă este valid
            setCurrentCredits(rpcCredits)
            console.log('✅ Credits from RPC:', rpcCredits)
          } else {
            // Fallback la calcul
            setCurrentCredits(finalCredits)
            console.log('✅ Credits calculated from transactions:', finalCredits)
          }
        } else {
          // Fallback la calcul
          setCurrentCredits(finalCredits)
          console.log('✅ Credits calculated from transactions (RPC failed):', finalCredits)
        }

        // Formatează tranzacțiile
        const formattedTransactions: CreditTransaction[] = transactionsData.map(t => ({
          id: t.id,
          type: t.type as 'purchase' | 'usage' | 'refund',
          amount: t.amount,
          description: t.description,
          timestamp: new Date(t.created_at).toLocaleString('ro-RO'),
          status: t.status as 'completed' | 'pending' | 'failed',
        }))
        setTransactions(formattedTransactions)

        // Calculează totaluri
        const earned = transactionsData
          .filter(t => t.type === 'purchase' && t.status === 'completed')
          .reduce((sum, t) => sum + (t.amount > 0 ? t.amount : 0), 0)
        
        const spent = transactionsData
          .filter(t => t.type === 'usage' && t.status === 'completed')
          .reduce((sum, t) => sum + Math.abs(t.amount), 0)
        
        setTotalEarned(earned)
        setTotalSpent(spent)
      } else {
        // Nu există tranzacții - verifică RPC
        const { data: creditsData, error: creditsError } = creditsResult
        if (!creditsError && creditsData !== null && creditsData !== undefined) {
          const rpcCredits = typeof creditsData === 'number' ? creditsData : Number(creditsData)
          if (!isNaN(rpcCredits) && rpcCredits >= 0) {
            setCurrentCredits(rpcCredits)
            console.log('✅ Credits from RPC (no transactions):', rpcCredits)
          } else {
            setCurrentCredits(0)
            console.log('⚠️ No valid credits data')
          }
        } else {
          setCurrentCredits(0)
          console.log('⚠️ No transactions and RPC failed')
        }
        setTransactions([])
        setTotalEarned(0)
        setTotalSpent(0)
      }

      // Procesează logs
      if (logsResult.data) {
        const formattedLogs: LogEntry[] = logsResult.data.map(log => ({
          id: log.id,
          type: log.type as 'success' | 'error' | 'info' | 'warning',
          message: log.message,
          timestamp: new Date(log.created_at).toLocaleString('ro-RO'),
          action: log.action,
        }))
        setLogs(formattedLogs)
      }

      // Procesează statistici generări
      if (generationsResult.data) {
        setTotalGenerations(generationsResult.data.length)
        setSuccessfulGenerations(generationsResult.data.filter(g => g.status === 'completed').length)
        setFailedGenerations(generationsResult.data.filter(g => g.status === 'failed').length)
      }

      console.log('✅ All user data loaded successfully')
    } catch (error) {
      console.error('❌ Error loading user data:', error)
    } finally {
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

  // VERIFICARE SESIUNE SIMPLIFICATĂ ȘI ROBUSTĂ
  useEffect(() => {
    let mounted = true
    let subscription: { unsubscribe: () => void } | null = null

    const initializeAuth = async () => {
      // Așteaptă până când suntem în browser
      if (typeof window === 'undefined') {
        setLoading(false)
        return
      }

      // Previne verificări multiple
      if (sessionCheckedRef.current) {
        return
      }
      sessionCheckedRef.current = true

      try {
        console.log('🔍 Checking session...')
        
        // Verifică sesiunea
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ Session error:', error)
          if (mounted) {
            setUser(null)
            setLoading(false)
          }
          return
        }

        if (session?.user) {
          console.log('✅ Session found, user:', session.user.id)
          if (mounted) {
            setUser(session.user)
            setLoading(false)
            // Încarcă datele imediat
            await loadUserData(session.user.id)
          }
        } else {
          console.log('❌ No session found')
          if (mounted) {
            setUser(null)
            setLoading(false)
          }
        }
      } catch (error) {
        console.error('❌ Error initializing auth:', error)
        if (mounted) {
          setUser(null)
          setLoading(false)
        }
      }

      // Ascultă schimbările de autentificare
      const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (!mounted) return

          console.log('🔄 Auth state changed:', event)

          if (event === 'SIGNED_IN' && session?.user) {
            setUser(session.user)
            setLoading(false)
            sessionCheckedRef.current = false // Permite reîncărcare
            await loadUserData(session.user.id)
          } else if (event === 'SIGNED_OUT') {
            setUser(null)
            setUserProfile(null)
            setLogs([])
            setTransactions([])
            setCurrentCredits(0)
            setTotalSpent(0)
            setTotalEarned(0)
            setTotalGenerations(0)
            setSuccessfulGenerations(0)
            setFailedGenerations(0)
            sessionCheckedRef.current = false
          } else if (event === 'TOKEN_REFRESHED' && session?.user) {
            setUser(session.user)
            await loadUserData(session.user.id)
          }
        }
      )

      subscription = authSubscription
    }

    // Așteaptă puțin pentru a ne asigura că window este disponibil
    const timer = setTimeout(() => {
      initializeAuth()
    }, 100)

    return () => {
      mounted = false
      clearTimeout(timer)
      if (subscription) {
        subscription.unsubscribe()
      }
      sessionCheckedRef.current = false
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setUserProfile(null)
    sessionCheckedRef.current = false
  }

  const handleAddTestCredits = async () => {
    if (!user) return

    try {
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

      if (!response.ok) {
        throw new Error(result.error || result.details || 'Eroare la adăugarea creditelor')
      }

      // Reîncarcă datele
      await loadUserData(user.id)
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
      if (currentCredits < IMAGE_GENERATION_COST) {
        setGeneratedImageError(`Nu ai suficiente credite! Ai nevoie de ${IMAGE_GENERATION_COST} credite, dar ai doar ${currentCredits}.`)
        setIsLoading(false)
        return
      }

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

      if (result.success) {
        if (result.data?.image_url) {
          setGeneratedImageUrl(result.data.image_url)
        } else if (result.data?.taskId) {
          setGeneratedImageError(`Reclama este în procesare (Task ID: ${result.data.taskId}).`)
        } else {
          setGeneratedImageError('Cererea a fost trimisă cu succes.')
        }
      } else {
        setGeneratedImageError(result.error || 'Eroare la generarea reclamei')
      }
    } catch (error) {
      console.error('Error generating ad:', error)
      setGeneratedImageError(error instanceof Error ? error.message : 'Eroare la generarea reclamei')
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

  // Loading state
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

  // Not authenticated
  if (!user) {
    return <Auth onAuthSuccess={() => {
      sessionCheckedRef.current = false
      window.location.href = '/dashboard'
    }} />
  }

  // Rest of the component remains the same...
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

        {/* Content Area - Simplified for now, add rest of sections as needed */}
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

            {/* Add other sections (logs, credite, setari, profil) - keeping structure simple for now */}
            {activeSection === 'credite' && (
              <motion.div
                key="credite"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-300">Credite Disponibile</span>
                    <Coins className="w-8 h-8 text-purple-400" />
                  </div>
                  <p className="text-4xl font-bold text-white mb-2">{currentCredits}</p>
                  <p className="text-xs text-gray-400">
                    {currentCredits > 0 ? `~${Math.floor(currentCredits / IMAGE_GENERATION_COST)} generări de imagini` : 'Fără credite'}
                  </p>
                </div>

                {transactions.length > 0 && (
                  <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-gray-700/50">
                      <h3 className="text-lg font-bold text-white">Istoric Tranzacții</h3>
                    </div>
                    <div className="divide-y divide-gray-700/50">
                      {transactions.map((transaction) => (
                        <div key={transaction.id} className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-white">{transaction.description}</p>
                              <p className="text-xs text-gray-400">{transaction.timestamp}</p>
                            </div>
                            <p className={`text-lg font-bold ${transaction.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Add placeholder for other sections */}
            {activeSection === 'logs' && (
              <motion.div
                key="logs"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Istoric Activități</h3>
                  {logs.length === 0 ? (
                    <p className="text-gray-400">Nu există activități încă</p>
                  ) : (
                    <div className="space-y-4">
                      {logs.map((log) => (
                        <div key={log.id} className="flex items-start space-x-4">
                          {getLogIcon(log.type)}
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-white">{log.message}</p>
                            <p className="text-xs text-gray-400">{log.timestamp}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeSection === 'setari' && (
              <motion.div
                key="setari"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Setări</h3>
                  <p className="text-gray-400">Setările vor fi disponibile aici</p>
                </div>
              </motion.div>
            )}

            {activeSection === 'profil' && (
              <motion.div
                key="profil"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Profil</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-400">Nume</p>
                      <p className="text-white">{userProfile?.full_name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Email</p>
                      <p className="text-white">{user.email}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Generate Ad Modal - Simplified */}
      {isGenerateAdModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Generează Reclamă</h3>
              <button
                onClick={() => setIsGenerateAdModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Descriere Produs
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  placeholder="Descrie produsul pentru care vrei să generezi o reclamă..."
                  rows={4}
                  required
                />
              </div>
              {generatedImageError && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm">{generatedImageError}</p>
                </div>
              )}
              {generatedImageUrl && (
                <div className="space-y-2">
                  <img src={generatedImageUrl} alt="Generated ad" className="w-full rounded-lg" />
                  <button
                    type="button"
                    onClick={() => window.open(generatedImageUrl, '_blank')}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg"
                  >
                    <Download className="w-4 h-4 inline mr-2" />
                    Descarcă
                  </button>
                </div>
              )}
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={isLoading || currentCredits < IMAGE_GENERATION_COST}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
                >
                  {isLoading ? 'Se generează...' : `Generează (${IMAGE_GENERATION_COST} credite)`}
                </button>
                <button
                  type="button"
                  onClick={() => setIsGenerateAdModalOpen(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg"
                >
                  Anulează
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
