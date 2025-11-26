'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
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
  ArrowLeft,
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
    width: 1600, 
    height: 1200, 
    label: '4:3', 
    description: 'Classic (Print, Presentation)',
    previewClass: 'w-16 aspect-[4/3]'
  },
}

const IMAGE_GENERATION_COST = 6
const TEXT_GENERATION_COST = 3

// Traduceri pentru dashboard
const translations = {
  ro: {
    // Sidebar
    tools: 'Tooluri',
    logs: 'Loguri',
    credits: 'Credite',
    settings: 'Setări',
    profile: 'Profil',
    dashboard: 'Dashboard',
    logout: 'Deconectare',
    search: 'Caută...',
    
    // Tooluri
    generateAd: 'Generează Reclamă',
    generateText: 'Generează Text',
    creditsCost: 'credite',
    
    // Profil
    edit: 'Editează',
    cancel: 'Anulează',
    save: 'Salvează',
    saving: 'Se salvează...',
    fullName: 'Nume complet',
    email: 'Email',
    phone: 'Telefon',
    bio: 'Bio',
    avatarUrl: 'URL Avatar',
    apiKey: 'API Key',
    copy: 'Copiază',
    memberSince: 'Membru din',
    notSet: 'Nu este setat',
    emailCannotBeChanged: 'Email-ul nu poate fi modificat',
    enterFullName: 'Introdu numele tău complet',
    aboutYou: 'Despre tine...',
    characters: 'caractere',
    profileUpdated: 'Profilul a fost actualizat cu succes!',
    errorUpdatingProfile: 'Eroare la actualizarea profilului',
    
    // Setări
    language: 'Limbă',
    emailNotifications: 'Notificări Email',
    emailNotificationsDesc: 'Primește notificări pe email pentru activități importante',
    saveSettings: 'Salvează Setările',
    settingsSaved: 'Setările au fost salvate cu succes!',
    errorSavingSettings: 'Eroare la salvarea setărilor',
    userNotAuthenticated: 'Utilizatorul nu este autentificat',
    
    // Notificări
    success: 'Succes',
    error: 'Eroare',
    
    // Credits
    remainingCredits: 'Credite Rămase',
    availableCredits: 'Credite Disponibile',
    transactionHistory: 'Istoric Tranzacții',
    noTransactions: 'Nu există tranzacții încă',
    addTestCredits: '+10 Credite (Test)',
    
    // Logs/History
    activityHistory: 'Istoric Activități',
    noActivities: 'Nu există activități încă',
    
    // Tools
    openTool: 'Deschide Tool',
    createOptimizedAds: 'Creează reclame optimizate cu AI pentru produsele tale (imagine + text)',
    generateCopywriting: 'Generează text publicitar optimizat pentru produsele tale',
    generating: 'Se generează...',
    generateAdWithCredits: 'credite',
    generateTextWithCredits: 'credite',
  },
  en: {
    // Sidebar
    tools: 'Tools',
    logs: 'Logs',
    credits: 'Credits',
    settings: 'Settings',
    profile: 'Profile',
    dashboard: 'Dashboard',
    logout: 'Logout',
    search: 'Search...',
    
    // Tooluri
    generateAd: 'Generate Ad',
    generateText: 'Generate Text',
    creditsCost: 'credits',
    
    // Profil
    edit: 'Edit',
    cancel: 'Cancel',
    save: 'Save',
    saving: 'Saving...',
    fullName: 'Full Name',
    email: 'Email',
    phone: 'Phone',
    bio: 'Bio',
    avatarUrl: 'Avatar URL',
    apiKey: 'API Key',
    copy: 'Copy',
    memberSince: 'Member since',
    notSet: 'Not set',
    emailCannotBeChanged: 'Email cannot be changed',
    enterFullName: 'Enter your full name',
    aboutYou: 'About you...',
    characters: 'characters',
    profileUpdated: 'Profile updated successfully!',
    errorUpdatingProfile: 'Error updating profile',
    
    // Setări
    language: 'Language',
    emailNotifications: 'Email Notifications',
    emailNotificationsDesc: 'Receive email notifications for important activities',
    saveSettings: 'Save Settings',
    settingsSaved: 'Settings saved successfully!',
    errorSavingSettings: 'Error saving settings',
    userNotAuthenticated: 'User is not authenticated',
    
    // Notificări
    success: 'Success',
    error: 'Error',
    
    // Credits
    remainingCredits: 'Remaining Credits',
    availableCredits: 'Available Credits',
    transactionHistory: 'Transaction History',
    noTransactions: 'No transactions yet',
    addTestCredits: '+10 Credits (Test)',
    
    // Logs/History
    activityHistory: 'Activity History',
    noActivities: 'No activities yet',
    
    // Tools
    openTool: 'Open Tool',
    createOptimizedAds: 'Create AI-optimized ads for your products (image + text)',
    generateCopywriting: 'Generate optimized advertising text for your products',
    generating: 'Generating...',
    generateAdWithCredits: 'credits',
    generateTextWithCredits: 'credits',
  },
}

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
  
  // State pentru editare profil
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileFormData, setProfileFormData] = useState({
    full_name: '',
    phone: '',
    bio: '',
    avatar_url: '',
  })
  const [savingProfile, setSavingProfile] = useState(false)
  
  // State pentru setări
  const [settingsFormData, setSettingsFormData] = useState({
    language: 'ro',
    email_notifications: true,
  })
  const [savingSettings, setSavingSettings] = useState(false)
  
  // Funcție helper pentru traduceri
  const t = (key: keyof typeof translations.ro): string => {
    const lang = settingsFormData.language || 'ro'
    return translations[lang as 'ro' | 'en']?.[key] || translations.ro[key] || key
  }
  
  // State pentru notificări
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  
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
  const [isGenerateTextModalOpen, setIsGenerateTextModalOpen] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [textPrompt, setTextPrompt] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isTextLoading, setIsTextLoading] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)
  const [generatedImageError, setGeneratedImageError] = useState<string | null>(null)
  const [generatedText, setGeneratedText] = useState<string | null>(null)
  const [generatedTextError, setGeneratedTextError] = useState<string | null>(null)
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
      console.log('📡 Starting Promise.all for data fetching...')
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
        (async () => {
          try {
            console.log('📊 Fetching credit_transactions...')
            const result = await supabase
              .from('credit_transactions')
              .select('*')
              .eq('user_id', userId)
              .order('created_at', { ascending: false })
              .limit(100)
            console.log('📊 credit_transactions fetched:', { count: result.data?.length || 0, error: result.error })
            return result
          } catch (err) {
            console.error('❌ Error fetching transactions:', err)
            return { data: null, error: err }
          }
        })(),
        supabase
          .from('activity_logs')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('generations')
          .select('id, status, type')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
        supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .single(),
      ])
      
      console.log('✅ Promise.all completed, processing results...')

      // Procesează profilul
      if (profileResult.data) {
        setUserProfile(profileResult.data)
        // Inițializează formularul cu datele existente
        setProfileFormData({
          full_name: profileResult.data.full_name || '',
          phone: profileResult.data.phone || '',
          bio: profileResult.data.bio || '',
          avatar_url: profileResult.data.avatar_url || '',
        })
        // Inițializează setările
        setSettingsFormData({
          language: profileResult.data.language || 'ro',
          email_notifications: profileResult.data.email_notifications !== false,
        })
      }

      // Procesează creditele - PRIORITATE: tranzacții (mai sigur)
      const { data: transactionsData, error: transactionsError } = transactionsResult
      const { data: creditsData, error: creditsError } = creditsResult
      
      console.log('💰 Processing credits:', {
        transactionsCount: transactionsData?.length || 0,
        transactionsError: transactionsError ? String(transactionsError) : null,
        rpcData: creditsData,
        rpcError: creditsError ? String(creditsError) : null,
        rpcDataType: typeof creditsData,
      })
      
      if (transactionsData && transactionsData.length > 0) {
        console.log('📊 Transactions found:', transactionsData.length)
        
        // Calculează creditele din tranzacții (metodă sigură)
        const purchases = transactionsData
          .filter(t => t.type === 'purchase' && t.status === 'completed')
          .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0)
        
        const usages = transactionsData
          .filter(t => t.type === 'usage' && t.status === 'completed')
          .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0)
        
        const calculatedCredits = purchases - usages
        const finalCredits = Math.max(0, calculatedCredits)
        
        console.log('💳 Credit calculation:', {
          purchases,
          usages,
          calculatedCredits,
          finalCredits,
        })
        
        // Verifică dacă RPC-ul a returnat o valoare validă
        if (!creditsError && creditsData !== null && creditsData !== undefined) {
          const rpcCredits = typeof creditsData === 'number' ? creditsData : Number(creditsData)
          if (!isNaN(rpcCredits) && rpcCredits >= 0) {
            // Folosește RPC dacă este valid
            setCurrentCredits(rpcCredits)
            console.log('✅ Credits from RPC:', rpcCredits)
          } else {
            // Fallback la calcul
            setCurrentCredits(finalCredits)
            console.log('✅ Credits calculated from transactions (RPC invalid):', finalCredits)
          }
        } else {
          // Fallback la calcul
          setCurrentCredits(finalCredits)
          console.log('✅ Credits calculated from transactions (RPC failed):', finalCredits, {
            error: creditsError ? String(creditsError) : null,
          })
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
        console.log('⚠️ No transactions found, checking RPC...')
        if (!creditsError && creditsData !== null && creditsData !== undefined) {
          const rpcCredits = typeof creditsData === 'number' ? creditsData : Number(creditsData)
          if (!isNaN(rpcCredits) && rpcCredits >= 0) {
            setCurrentCredits(rpcCredits)
            console.log('✅ Credits from RPC (no transactions):', rpcCredits)
          } else {
            setCurrentCredits(0)
            console.log('⚠️ RPC returned invalid value:', creditsData)
          }
        } else {
          setCurrentCredits(0)
          console.log('⚠️ No transactions and RPC failed:', {
            error: creditsError ? String(creditsError) : null,
            data: creditsData,
          })
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
      if (generationsResult.data && Array.isArray(generationsResult.data)) {
        const total = generationsResult.data.length
        const successful = generationsResult.data.filter(g => g.status === 'completed').length
        const failed = generationsResult.data.filter(g => g.status === 'failed').length
        
        console.log('📊 Generations stats:', { total, successful, failed, sample: generationsResult.data.slice(0, 3) })
        
        setTotalGenerations(total)
        setSuccessfulGenerations(successful)
        setFailedGenerations(failed)
      } else {
        console.warn('⚠️ No generations data or invalid format:', generationsResult)
        setTotalGenerations(0)
        setSuccessfulGenerations(0)
        setFailedGenerations(0)
      }

      console.log('✅ All user data loaded successfully')
    } catch (error) {
      console.error('❌ Error loading user data:', error)
    } finally {
      delete loadUserDataRef.current[userId]
    }
  }

  // Menu items - se actualizează dinamic cu traducerile (memoizat pentru performanță)
  const menuItems = useMemo(() => [
    { id: 'tooluri' as Section, label: t('tools'), icon: Wrench },
    { id: 'logs' as Section, label: t('logs'), icon: FileText },
    { id: 'credite' as Section, label: t('credits'), icon: Coins },
    { id: 'setari' as Section, label: t('settings'), icon: Settings },
    { id: 'profil' as Section, label: t('profile'), icon: UserIcon },
  ], [settingsFormData.language])

  // VERIFICARE SESIUNE - ABORDARE FINALĂ: Citire directă token JWT din localStorage
  useEffect(() => {
    let mounted = true
    let subscription: { unsubscribe: () => void } | null = null
    let timeoutId: NodeJS.Timeout | null = null

    // Timeout de siguranță - oprește loading după 3 secunde
    timeoutId = setTimeout(() => {
      if (mounted && loading) {
        console.warn('⏱️ Loading timeout - forcing stop')
        setLoading(false)
      }
    }, 3000)

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

      console.log('🔍 Initializing auth...')

      // Configurează onAuthStateChange pentru evenimente viitoare
      const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (!mounted) return

          console.log('🔄 Auth state changed:', event, { 
            hasSession: !!session, 
            hasUser: !!session?.user,
            userId: session?.user?.id 
          })

          if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
            console.log('✅ Session detected via event:', session.user.id)
            clearTimeout(timeoutId!)
            setUser(session.user)
            setLoading(false)
            sessionCheckedRef.current = false
            await loadUserData(session.user.id)
          } else if (event === 'SIGNED_OUT') {
            console.log('👋 User signed out')
            clearTimeout(timeoutId!)
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
            setLoading(false)
            sessionCheckedRef.current = false
          }
        }
      )

      subscription = authSubscription

      // ABORDARE NOUĂ: Citește direct sesiunea JSON din localStorage Supabase
      try {
        const allKeys = Object.keys(localStorage)
        const supabaseKeys = allKeys.filter(key => 
          (key.includes('supabase') || key.includes('sb-')) && (key.includes('auth-token') || key.includes('auth'))
        )
        
        console.log('📦 Checking Supabase storage keys:', supabaseKeys.length)

        let foundUser: User | null = null

        // Caută sesiunea în storage - Supabase o stochează ca JSON stringified
        for (const key of supabaseKeys) {
          try {
            const value = localStorage.getItem(key)
            if (value && value.length > 50) {
              console.log('🔑 Found data in storage:', key.substring(0, 40) + '...')
              
              // Încearcă să parsezi ca JSON (Supabase stochează sesiunea ca JSON)
              try {
                const parsed = JSON.parse(value)
                
                // Verifică dacă este un obiect de sesiune Supabase
                if (parsed && typeof parsed === 'object') {
                  // Poate fi: { access_token, refresh_token, expires_at, user, ... }
                  if (parsed.user && parsed.user.id) {
                    // Verifică dacă token-ul nu este expirat
                    const now = Math.floor(Date.now() / 1000)
                    const expiresAt = parsed.expires_at || parsed.expiresAt
                    
                    if (!expiresAt || expiresAt > now) {
                      foundUser = parsed.user as User
                      console.log('✅ Valid session found in storage, user ID:', parsed.user.id)
                      break
                    } else {
                      console.log('⚠️ Session expired')
                    }
                  }
                  
                  // Sau poate fi direct user object
                  if (parsed.id && !foundUser) {
                    foundUser = parsed as User
                    console.log('✅ User found directly in storage, ID:', parsed.id)
                    break
                  }
                }
              } catch (jsonError) {
                // Nu este JSON, încearcă să decodifici ca JWT
                try {
                  const tokenParts = value.split('.')
                  if (tokenParts.length === 3) {
                    const payload = JSON.parse(atob(tokenParts[1]))
                    const now = Math.floor(Date.now() / 1000)
                    if (payload.exp && payload.exp > now && payload.sub) {
                      // Creează user object din JWT payload
                      foundUser = {
                        id: payload.sub,
                        email: payload.email,
                        aud: payload.aud || 'authenticated',
                        role: payload.role || 'authenticated',
                        created_at: new Date(payload.iat * 1000).toISOString(),
                        app_metadata: payload.app_metadata || {},
                        user_metadata: payload.user_metadata || {},
                      } as User
                      console.log('✅ Valid JWT token found, user ID:', payload.sub)
                      break
                    }
                  }
                } catch (jwtError) {
                  // Nu este nici JWT, continuă
                  console.log('⚠️ Not JSON or JWT, skipping...')
                }
              }
            }
          } catch (e) {
            // Ignoră erorile
          }
        }

        // Dacă am găsit user din storage, folosește-l direct
        if (foundUser) {
          console.log('✅ Using user from storage:', foundUser.id)
          clearTimeout(timeoutId!)
          setUser(foundUser)
          setLoading(false)
          sessionCheckedRef.current = false
          await loadUserData(foundUser.id)
          return
        }

        // Dacă nu am găsit în storage, încearcă getUser() cu timeout scurt
        console.log('🔄 Trying getUser() as fallback...')
        try {
          const getUserPromise = supabase.auth.getUser()
          const timeoutPromise = new Promise<{ data: { user: null }, error: { message: 'timeout' } }>((resolve) => 
            setTimeout(() => resolve({ data: { user: null }, error: { message: 'timeout' } }), 1500)
          )

          const result = await Promise.race([getUserPromise, timeoutPromise]) as { data: { user: any }, error: any }

          if (result.data?.user && !result.error) {
            console.log('✅ User from getUser():', result.data.user.id)
            clearTimeout(timeoutId!)
            setUser(result.data.user)
            setLoading(false)
            sessionCheckedRef.current = false
            await loadUserData(result.data.user.id)
            return
          } else if (result.error && result.error.message !== 'timeout') {
            console.warn('⚠️ getUser() error:', result.error)
          } else {
            console.warn('⏱️ getUser() timed out')
          }
        } catch (getUserError) {
          console.warn('⚠️ getUser() failed:', getUserError)
        }

        // Dacă nu am găsit nimic, oprește loading
        console.log('❌ No valid session found')
        clearTimeout(timeoutId!)
        setUser(null)
        setLoading(false)
      } catch (error) {
        console.error('❌ Error checking session:', error)
        clearTimeout(timeoutId!)
        setUser(null)
        setLoading(false)
      }
    }

    // Așteaptă puțin pentru a ne asigura că window este disponibil
    const timer = setTimeout(() => {
      initializeAuth()
    }, 100)

    return () => {
      mounted = false
      clearTimeout(timer)
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      if (subscription) {
        subscription.unsubscribe()
      }
      sessionCheckedRef.current = false
    }
  }, [])

  const handleLogout = async () => {
    try {
      // Face signOut din Supabase PRIMA dată
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Error signing out:', error)
        setNotification({ type: 'error', message: 'Eroare la deconectare' })
        return
      }
      
      // Șterge starea locală imediat după signOut
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
      
      // Așteaptă puțin pentru ca evenimentul SIGNED_OUT să fie procesat
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // Componenta se va re-rendera automat și va afișa formularul de autentificare
      // deoarece user este null - verificarea if (!user) va returna <Auth />
    } catch (error) {
      console.error('Error during logout:', error)
      setNotification({ type: 'error', message: 'Eroare la deconectare' })
      // Chiar dacă apare o eroare, resetăm starea locală
      setUser(null)
      setUserProfile(null)
      sessionCheckedRef.current = false
    }
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

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsTextLoading(true)
    setGeneratedTextError(null)
    setGeneratedText(null)
    
    try {
      if (currentCredits < TEXT_GENERATION_COST) {
        setGeneratedTextError(`Nu ai suficiente credite! Ai nevoie de ${TEXT_GENERATION_COST} credite, dar ai doar ${currentCredits}.`)
        setIsTextLoading(false)
        return
      }

      if (!user) return

      // Generează textul PRIMA dată (fără să deduc creditele)
      const response = await fetch('/api/generate-ad', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: textPrompt,
          generateOnlyText: true,
          user_id: user.id,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Eroare la generarea textului')
      }

      // Deduce creditele DOAR dacă generarea a reușit
      if (result.success && result.data?.text) {
        // Deduce creditele după succes
        const deductResponse = await fetch('/api/deduct-credits', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: user.id,
            credits_amount: TEXT_GENERATION_COST,
            description: `Generare text publicitar (${TEXT_GENERATION_COST} credite)`,
          }),
        })

        if (!deductResponse.ok) {
          const errorData = await deductResponse.json()
          throw new Error(errorData.error || 'Eroare la deducerea creditelor')
        }

        setGeneratedText(result.data.text)
        // Reîncarcă datele pentru a reflecta scăderea creditelor și actualizarea statisticilor
        await loadUserData(user.id)
      } else {
        // Dacă generarea a eșuat, nu se deduc credite, dar reîncarcă datele pentru statistici
        setGeneratedTextError(result.error || 'Eroare la generarea textului')
        await loadUserData(user.id)
      }
    } catch (error) {
      console.error('Error generating text:', error)
      setGeneratedTextError(error instanceof Error ? error.message : 'Eroare la generarea textului')
      setGeneratedText(null)
      // Reîncarcă datele chiar și la eroare pentru a actualiza statisticile
      if (user) {
        await loadUserData(user.id)
      }
    } finally {
      setIsTextLoading(false)
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

      if (!user) return

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

      // Generează imaginea PRIMA dată (fără să deduc creditele)
      const response = await fetch('/api/generate-ad', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          image: imageBase64,
          generateOnlyText: false,
          user_id: user.id,
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

      // Deduce creditele DOAR dacă generarea a reușit
      if (result.success && (result.data?.image_url || result.data?.taskId)) {
        // Deduce creditele după succes
        const deductResponse = await fetch('/api/deduct-credits', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: user.id,
            credits_amount: IMAGE_GENERATION_COST,
            description: `Generare reclamă cu imagine (${IMAGE_GENERATION_COST} credite)`,
          }),
        })

        if (!deductResponse.ok) {
          const errorData = await deductResponse.json()
          throw new Error(errorData.error || 'Eroare la deducerea creditelor')
        }

        if (result.data?.image_url) {
          setGeneratedImageUrl(result.data.image_url)
        } else if (result.data?.taskId) {
          setGeneratedImageError(`Reclama este în procesare (Task ID: ${result.data.taskId}).`)
        } else {
          setGeneratedImageError('Cererea a fost trimisă cu succes.')
        }
        // Reîncarcă datele pentru a reflecta scăderea creditelor și actualizarea statisticilor
        await loadUserData(user.id)
      } else {
        // Dacă generarea a eșuat, nu se deduc credite, dar reîncarcă datele pentru statistici
        setGeneratedImageError(result.error || 'Eroare la generarea reclamei')
        await loadUserData(user.id)
      }
    } catch (error) {
      console.error('Error generating ad:', error)
      setGeneratedImageError(error instanceof Error ? error.message : 'Eroare la generarea reclamei')
      setGeneratedImageUrl(null)
      // Reîncarcă datele chiar și la eroare pentru a actualiza statisticile
      if (user) {
        await loadUserData(user.id)
      }
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
              <a 
                href="https://adlence.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer hover:opacity-80 transition-opacity"
              >
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  AdLence.ai
                </h1>
                <p className="text-xs text-gray-400">Dashboard</p>
              </a>
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
        {user && (
          <div className="p-4 border-t border-gray-800/50">
            <div className="flex items-center space-x-3 px-4 py-3 bg-gray-800/50 rounded-lg mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {userProfile?.full_name || user?.email?.split('@')[0] || 'Utilizator'}
                </p>
                <p className="text-xs text-gray-400 truncate">{user?.email || ''}</p>
              </div>
            </div>
            <button
              onClick={handleAddTestCredits}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-green-400 hover:text-green-300 hover:bg-green-500/30 transition-all mb-2"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">{t('addTestCredits')}</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Deconectare</span>
            </button>
          </div>
        )}
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
                <a
                  href="https://adlence.vercel.app"
                  className="flex items-center space-x-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="text-sm font-medium">Înapoi pe site</span>
                </a>
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
                        <h3 className="text-lg font-bold text-white">{t('generateAd')}</h3>
                        <p className="text-sm text-gray-400">{IMAGE_GENERATION_COST} {t('creditsCost')}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 mb-4">
                      {t('createOptimizedAds')}
                    </p>
                    <button 
                      onClick={() => setIsGenerateAdModalOpen(true)}
                      className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-lg transition-all"
                    >
                      {t('openTool')}
                    </button>
                  </motion.div>

                  <motion.div
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6 hover:border-green-500/50 transition-all cursor-pointer"
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                        <FileEdit className="w-6 h-6 text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{t('generateText')}</h3>
                        <p className="text-sm text-gray-400">{TEXT_GENERATION_COST} {t('creditsCost')}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 mb-4">
                      {t('generateCopywriting')}
                    </p>
                    <button 
                      onClick={() => setIsGenerateTextModalOpen(true)}
                      className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold rounded-lg transition-all"
                    >
                      {t('openTool')}
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
                      <span className="text-sm text-gray-400">{t('remainingCredits')}</span>
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
                    <span className="text-sm text-gray-300">{t('availableCredits')}</span>
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
                      <h3 className="text-lg font-bold text-white">{t('transactionHistory')}</h3>
                    </div>
                    <div className="divide-y divide-gray-700/50">
                      {transactions.length === 0 ? (
                        <div className="p-6 text-center">
                          <p className="text-gray-400">{t('noTransactions')}</p>
                        </div>
                      ) : (
                        transactions.map((transaction) => (
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
                        ))
                      )}
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
                  <h3 className="text-lg font-bold text-white mb-4">{t('activityHistory')}</h3>
                  {logs.length === 0 ? (
                    <p className="text-gray-400">{t('noActivities')}</p>
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
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Settings className="w-5 h-5 text-blue-400" />
                      {t('settings')}
                    </h3>
                  </div>
                  
                  <form onSubmit={async (e) => {
                    e.preventDefault()
                    if (!user) {
                      setNotification({ type: 'error', message: t('userNotAuthenticated') })
                      setTimeout(() => setNotification(null), 3000)
                      return
                    }
                    
                    setSavingSettings(true)
                    try {
                      const { data, error } = await supabase
                        .from('user_profiles')
                        .update({
                          language: settingsFormData.language,
                          email_notifications: settingsFormData.email_notifications,
                          updated_at: new Date().toISOString(),
                        })
                        .eq('id', user.id)
                        .select()
                        .single()
                      
                      if (error) {
                        console.error('Supabase error:', error)
                        throw error
                      }
                      
                      // Actualizează profilul local
                      if (data) {
                        setUserProfile({
                          ...(userProfile || {}),
                          ...data,
                        })
                        // Actualizează și limba în settingsFormData pentru ca traducerile să se actualizeze imediat
                        // Folosim funcție updater pentru a evita dependențe circulare
                        setSettingsFormData(prev => ({
                          ...prev,
                          language: data.language || 'ro',
                          email_notifications: data.email_notifications !== false,
                        }))
                      }
                      
                      // Folosește limba nouă pentru notificare (folosim direct din data, nu din state)
                      const lang = data?.language || settingsFormData.language || 'ro'
                      const successMsg = translations[lang as 'ro' | 'en']?.settingsSaved || translations.ro.settingsSaved
                      setNotification({ type: 'success', message: successMsg })
                      setTimeout(() => setNotification(null), 3000)
                    } catch (error: any) {
                      console.error('Error saving settings:', error)
                      setNotification({ 
                        type: 'error', 
                        message: t('errorSavingSettings') + ': ' + (error.message || 'Unknown error') 
                      })
                      setTimeout(() => setNotification(null), 5000)
                    } finally {
                      setSavingSettings(false)
                    }
                  }} className="space-y-6">
                    {/* Limba */}
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-blue-400" />
                        {t('language')}
                      </label>
                      <select
                        value={settingsFormData.language}
                        onChange={(e) => {
                          const newLang = e.target.value as 'ro' | 'en'
                          setSettingsFormData({ ...settingsFormData, language: newLang })
                        }}
                        className="w-full px-4 py-2.5 bg-gray-800/80 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50"
                      >
                        <option value="ro">Română</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                    
                    {/* Notificări email */}
                    <div>
                      <label className="flex items-center justify-between p-4 bg-gray-800/60 border border-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-800/80 transition-all">
                        <div className="flex items-center gap-3">
                          <Bell className="w-4 h-4 text-yellow-400" />
                          <div>
                            <p className="text-sm font-semibold text-white">{t('emailNotifications')}</p>
                            <p className="text-xs text-gray-400">{t('emailNotificationsDesc')}</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settingsFormData.email_notifications}
                            onChange={(e) => setSettingsFormData({ ...settingsFormData, email_notifications: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-500/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </label>
                    </div>
                    
                    {/* Notificare */}
                    {notification && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-3 rounded-lg ${
                          notification.type === 'success' 
                            ? 'bg-green-500/20 border border-green-500/50 text-green-400' 
                            : 'bg-red-500/20 border border-red-500/50 text-red-400'
                        }`}
                      >
                        <p className="text-sm font-medium">{notification.message}</p>
                      </motion.div>
                    )}
                    
                    {/* Buton salvare */}
                    <button
                      type="submit"
                      disabled={savingSettings}
                      className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {savingSettings ? (
                        <>
                          <motion.svg
                            className="animate-spin h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </motion.svg>
                          <span>{t('saving')}</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>{t('saveSettings')}</span>
                        </>
                      )}
                    </button>
                  </form>
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
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <UserIcon className="w-5 h-5 text-blue-400" />
                      {t('profile')}
                    </h3>
                    {!isEditingProfile && (
                      <button
                        onClick={() => setIsEditingProfile(true)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-all flex items-center gap-2"
                      >
                        <FileEdit className="w-4 h-4" />
                        {t('edit')}
                      </button>
                    )}
                  </div>
                  
                  {!isEditingProfile ? (
                    // Vizualizare profil
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-400 mb-1">{t('fullName')}</p>
                        <p className="text-white font-medium">{userProfile?.full_name || t('notSet')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">{t('email')}</p>
                        <p className="text-white font-medium">{user?.email || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1 flex items-center gap-2">
                          <Phone className="w-3 h-3" />
                          {t('phone')}
                        </p>
                        <p className="text-white font-medium">{userProfile?.phone || t('notSet')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">{t('bio')}</p>
                        <p className="text-white font-medium whitespace-pre-wrap">{userProfile?.bio || t('notSet')}</p>
                      </div>
                      {userProfile?.avatar_url && (
                        <div>
                          <p className="text-sm text-gray-400 mb-2">Avatar</p>
                          <img
                            src={userProfile.avatar_url}
                            alt="Avatar"
                            className="w-24 h-24 rounded-full object-cover border-2 border-gray-700"
                          />
                        </div>
                      )}
                      {userProfile?.api_key && (
                        <div>
                          <p className="text-sm text-gray-400 mb-1 flex items-center gap-2">
                            <Shield className="w-3 h-3" />
                            API Key
                          </p>
                          <div className="flex items-center gap-2">
                            <code className="text-xs text-gray-300 bg-gray-800/50 px-3 py-2 rounded border border-gray-700/50 font-mono">
                              {userProfile.api_key}
                            </code>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(userProfile.api_key)
                                setNotification({ type: 'success', message: t('apiKey') + ' ' + t('copy') + '!' })
                                setTimeout(() => setNotification(null), 2000)
                              }}
                              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-all"
                            >
                              {t('copy')}
                            </button>
                          </div>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-400 mb-1">{t('memberSince')}</p>
                        <p className="text-white font-medium">
                          {userProfile?.created_at 
                            ? new Date(userProfile.created_at).toLocaleDateString(settingsFormData.language === 'en' ? 'en-US' : 'ro-RO', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    // Formular editare profil
                    <form onSubmit={async (e) => {
                      e.preventDefault()
                      if (!user) {
                        setNotification({ type: 'error', message: 'Utilizatorul nu este autentificat' })
                        setTimeout(() => setNotification(null), 3000)
                        return
                      }
                      
                      setSavingProfile(true)
                      try {
                        // Pregătește datele pentru update - tratează bio special
                        const updateData: any = {
                          full_name: profileFormData.full_name?.trim() || null,
                          phone: profileFormData.phone?.trim() || null,
                          avatar_url: profileFormData.avatar_url?.trim() || null,
                          updated_at: new Date().toISOString(),
                        }
                        
                        // Tratează bio separat - normalizează newlines și trim
                        if (profileFormData.bio) {
                          // Normalizează newlines (Windows \r\n -> \n, apoi normalizează)
                          const normalizedBio = profileFormData.bio
                            .replace(/\r\n/g, '\n')
                            .replace(/\r/g, '\n')
                            .trim()
                          updateData.bio = normalizedBio || null
                        } else {
                          updateData.bio = null
                        }
                        
                        console.log('Updating profile with data:', {
                          ...updateData,
                          bio_length: updateData.bio?.length || 0,
                          bio_preview: updateData.bio?.substring(0, 50) || 'empty'
                        })
                        
                        const { data, error } = await supabase
                          .from('user_profiles')
                          .update(updateData)
                          .eq('id', user.id)
                          .select()
                          .single()
                        
                        if (error) {
                          console.error('Supabase error details:', {
                            message: error.message,
                            details: error.details,
                            hint: error.hint,
                            code: error.code
                          })
                          throw error
                        }
                        
                        console.log('Profile updated successfully:', data)
                        
                        // Actualizează profilul local
                        if (data) {
                          setUserProfile(data)
                          // Actualizează și formularul cu datele salvate
                          setProfileFormData({
                            full_name: data.full_name || '',
                            phone: data.phone || '',
                            bio: data.bio || '',
                            avatar_url: data.avatar_url || '',
                          })
                        }
                        
                        setIsEditingProfile(false)
                        setNotification({ type: 'success', message: t('profileUpdated') })
                        setTimeout(() => setNotification(null), 3000)
                      } catch (error: any) {
                        console.error('Error updating profile:', error)
                        const errorMessage = error.message || error.details || 'Unknown error'
                        setNotification({ 
                          type: 'error', 
                          message: `${t('errorUpdatingProfile')}: ${errorMessage}` 
                        })
                        setTimeout(() => setNotification(null), 5000)
                      } finally {
                        setSavingProfile(false)
                      }
                    }} className="space-y-4">
                      {/* Nume complet */}
                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">
                          {t('fullName')}
                        </label>
                        <input
                          type="text"
                          value={profileFormData.full_name}
                          onChange={(e) => setProfileFormData({ ...profileFormData, full_name: e.target.value })}
                          placeholder={t('enterFullName')}
                          className="w-full px-4 py-2.5 bg-gray-800/80 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50"
                        />
                      </div>
                      
                      {/* Email (read-only) */}
                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">
                          {t('email')}
                        </label>
                        <input
                          type="email"
                          value={user?.email || ''}
                          disabled
                          className="w-full px-4 py-2.5 bg-gray-800/40 border border-gray-700/30 rounded-lg text-gray-400 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 mt-1">{t('emailCannotBeChanged')}</p>
                      </div>
                      
                      {/* Telefon */}
                      <div>
                        <label className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
                          <Phone className="w-4 h-4 text-blue-400" />
                          {t('phone')}
                        </label>
                        <input
                          type="tel"
                          value={profileFormData.phone}
                          onChange={(e) => setProfileFormData({ ...profileFormData, phone: e.target.value })}
                          placeholder="+40 123 456 789"
                          className="w-full px-4 py-2.5 bg-gray-800/80 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50"
                        />
                      </div>
                      
                      {/* Bio */}
                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">
                          {t('bio')}
                        </label>
                        <textarea
                          value={profileFormData.bio}
                          onChange={(e) => {
                            const value = e.target.value
                            // Limitează la 500 caractere pentru a evita probleme
                            const limitedValue = value.length > 500 ? value.substring(0, 500) : value
                            setProfileFormData({ ...profileFormData, bio: limitedValue })
                          }}
                          placeholder={t('aboutYou')}
                          rows={4}
                          maxLength={500}
                          className="w-full px-4 py-2.5 bg-gray-800/80 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 resize-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {profileFormData.bio.length}/500 {t('characters')}
                        </p>
                      </div>
                      
                      {/* Avatar URL */}
                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">
                          {t('avatarUrl')}
                        </label>
                        <input
                          type="url"
                          value={profileFormData.avatar_url}
                          onChange={(e) => setProfileFormData({ ...profileFormData, avatar_url: e.target.value })}
                          placeholder="https://example.com/avatar.jpg"
                          className="w-full px-4 py-2.5 bg-gray-800/80 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50"
                        />
                        {profileFormData.avatar_url && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-400 mb-2">Preview:</p>
                            <img
                              src={profileFormData.avatar_url}
                              alt="Avatar preview"
                              className="w-16 h-16 rounded-full object-cover border-2 border-gray-700"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                              }}
                            />
                          </div>
                        )}
                      </div>
                      
                      {/* Notificare */}
                      {notification && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-3 rounded-lg ${
                            notification.type === 'success' 
                              ? 'bg-green-500/20 border border-green-500/50 text-green-400' 
                              : 'bg-red-500/20 border border-red-500/50 text-red-400'
                          }`}
                        >
                          <p className="text-sm font-medium">{notification.message}</p>
                        </motion.div>
                      )}
                      
                      {/* Butoane */}
                      <div className="flex gap-3 pt-2">
                        <button
                          type="submit"
                          disabled={savingProfile}
                          className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {savingProfile ? (
                            <>
                              <motion.svg
                                className="animate-spin h-4 w-4 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </motion.svg>
                              <span>{t('saving')}</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-4 h-4" />
                              <span>{t('save')}</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingProfile(false)
                            // Resetează formularul la valorile originale
                            if (userProfile) {
                              setProfileFormData({
                                full_name: userProfile.full_name || '',
                                phone: userProfile.phone || '',
                                bio: userProfile.bio || '',
                                avatar_url: userProfile.avatar_url || '',
                              })
                            }
                          }}
                          className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all"
                        >
                          {t('cancel')}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Generate Ad Modal - Full Form from Hero */}
      {isGenerateAdModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 rounded-xl p-6 max-w-3xl w-full max-h-[95vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                {t('generateAd')}
              </h3>
              <button
                onClick={() => {
                  setIsGenerateAdModalOpen(false)
                  setPrompt('')
                  setImage(null)
                  setImagePreview(null)
                  setGeneratedImageUrl(null)
                  setGeneratedImageError(null)
                  setShowAdvanced(false)
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Prompt Input */}
              <div className="relative">
                <label htmlFor="prompt" className="block text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  Descrie produsul
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ex: ceai organic premium, ambalaj eco-friendly..."
                    className="relative w-full px-5 py-3.5 bg-gray-800/80 border-2 border-blue-500/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-400 transition-all text-base font-medium shadow-lg shadow-blue-500/20"
                    required
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div className="relative">
                <label htmlFor="image" className="block text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-purple-400" />
                  Poza produsului <span className="text-xs text-gray-400 font-normal">(opțional)</span>
                </label>
                {imagePreview ? (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative group rounded-lg overflow-hidden border-2 border-purple-500/50 shadow-lg shadow-purple-500/20"
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
              <div className="relative">
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

              {/* Cost display */}
              <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Cost:</span>
                  <span className="text-lg font-bold text-purple-400">
                    {IMAGE_GENERATION_COST} credite
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Generare imagine</p>
              </div>

              {/* Error Display */}
              {generatedImageError && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm">{generatedImageError}</p>
                </div>
              )}

              {/* Generated Image Display */}
              {generatedImageUrl && (
                <div className="space-y-2">
                  <div className="relative rounded-lg border-2 border-purple-500/50 shadow-lg overflow-hidden bg-gray-800/50">
                    <img 
                      src={`/api/proxy-image?url=${encodeURIComponent(generatedImageUrl)}`}
                      alt="Generated ad" 
                      className="w-full h-auto"
                      onError={(e) => {
                        console.error('Image load error, trying direct URL:', generatedImageUrl)
                        // Fallback la URL-ul direct dacă proxy-ul eșuează
                        const target = e.target as HTMLImageElement
                        target.src = generatedImageUrl
                      }}
                      crossOrigin="anonymous"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => window.open(generatedImageUrl, '_blank')}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Descarcă
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading || currentCredits < IMAGE_GENERATION_COST || !prompt.trim()}
                whileHover={{ scale: isLoading ? 1 : 1.02, y: -2 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 text-white font-bold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl shadow-purple-500/50 flex items-center justify-center space-x-2 relative overflow-hidden group"
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
                    <span>{t('generateAd')} ({IMAGE_GENERATION_COST} {t('creditsCost')})</span>
                  </>
                )}
              </motion.button>

              {/* Cancel Button */}
              <button
                type="button"
                onClick={() => {
                  setIsGenerateAdModalOpen(false)
                  setPrompt('')
                  setImage(null)
                  setImagePreview(null)
                  setGeneratedImageUrl(null)
                  setGeneratedImageError(null)
                  setShowAdvanced(false)
                }}
                className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Anulează
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Generate Text Modal */}
      {isGenerateTextModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">{t('generateText')}</h3>
              <button
                onClick={() => {
                  setIsGenerateTextModalOpen(false)
                  setTextPrompt('')
                  setGeneratedText(null)
                  setGeneratedTextError(null)
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleTextSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Descriere Produs/Serviciu
                </label>
                <textarea
                  value={textPrompt}
                  onChange={(e) => setTextPrompt(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/30"
                  placeholder="Descrie produsul sau serviciul pentru care vrei să generezi text publicitar..."
                  rows={4}
                  required
                />
              </div>
              {generatedTextError && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm">{generatedTextError}</p>
                </div>
              )}
              {generatedText && (
                <div className="space-y-2">
                  <div className="p-4 bg-gray-800/50 border border-gray-700/50 rounded-lg">
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Text Generat:
                    </label>
                    <p className="text-white whitespace-pre-wrap">{generatedText}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedText)
                      alert('Text copiat în clipboard!')
                    }}
                    className="w-full px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg"
                  >
                    <Download className="w-4 h-4 inline mr-2" />
                    Copiază Text
                  </button>
                </div>
              )}
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={isTextLoading || currentCredits < TEXT_GENERATION_COST}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
                >
                  {isTextLoading ? t('generating') : `${t('generateText')} (${TEXT_GENERATION_COST} ${t('creditsCost')})`}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsGenerateTextModalOpen(false)
                    setTextPrompt('')
                    setGeneratedText(null)
                    setGeneratedTextError(null)
                  }}
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
