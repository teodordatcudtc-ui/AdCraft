'use client'

import { useState, useEffect, useRef, useMemo, Fragment, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
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
  ChevronRight,
  Check,
  ArrowLeft,
  ArrowRight,
  Target,
  BarChart,
  PenTool,
  Palette,
  Calendar,
  Video,
  Users,
  TrendingDown,
  ShoppingCart,
} from 'lucide-react'

type Section = 'tooluri' | 'logs' | 'credite' | 'setari' | 'profil'

// Tipuri pentru tool-uri
type ToolId = 
  | 'strategie-client' 
  | 'analiza-piata' 
  | 'strategie-video'
  | 'copywriting'
  | 'design-publicitar'
  | 'planificare-conținut'

interface Tool {
  id: ToolId
  name: string
  nameEn: string
  description: string
  descriptionEn: string
  icon: any
}

interface ToolGroup {
  id: string
  name: string
  nameEn: string
  icon: any
  tools: Tool[]
}

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

const IMAGE_GENERATION_COST = 9
const TEXT_GENERATION_COST = 3

// Costuri pentru fiecare tool
const TOOL_COSTS: Record<string, number> = {
  'strategie-client': 5,
  'analiza-piata': 6,
  'strategie-video': 6,
  'copywriting': 4,
  'planificare-conținut': 7,
}

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

function DashboardContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState<Section>('tooluri')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchResultsRef = useRef<HTMLDivElement>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [userMenuSection, setUserMenuSection] = useState<'setari' | 'profil' | null>(null)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [activeTool, setActiveTool] = useState<ToolId | null>(null)
  
  // State pentru editare profil
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileFormData, setProfileFormData] = useState({
    full_name: '',
    phone: '',
    bio: '',
    avatar_url: '',
    business_type: '',
    business_description: '',
  })
  const [savingProfile, setSavingProfile] = useState(false)
  const [clientStrategy, setClientStrategy] = useState<any>(null)
  const [loadingStrategy, setLoadingStrategy] = useState(false)
  const [showStrategyForm, setShowStrategyForm] = useState(false)
  const [strategyFormData, setStrategyFormData] = useState({
    businessType: '',
    sellType: '',
    priceRange: '',
    targetAudience: '',
    objective: '',
  })
  const [generatingNewStrategy, setGeneratingNewStrategy] = useState(false)
  
  // Funcție pentru încărcarea strategiei client
  const loadClientStrategy = async () => {
    if (!user) return
    setLoadingStrategy(true)
    try {
      const { data, error } = await supabase
        .from('generations')
        .select('id, result_text, created_at')
        .eq('user_id', user.id)
        .eq('type', 'strategie-client')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      
      if (error) throw error
      
      if (data && data.result_text) {
        try {
          const parsedResult = typeof data.result_text === 'string' 
            ? JSON.parse(data.result_text) 
            : data.result_text
          setClientStrategy(parsedResult)
        } catch (parseError) {
          console.error('Error parsing strategy result:', parseError)
        }
      } else {
        setClientStrategy(null)
      }
    } catch (error) {
      console.error('Error loading client strategy:', error)
    } finally {
      setLoadingStrategy(false)
    }
  }
  
  // State pentru onboarding (formular după signup)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardingData, setOnboardingData] = useState({
    business_type: '',
    business_description: '',
    // Câmpuri pentru strategie client
    businessType: '',
    sellType: '',
    priceRange: '',
    targetAudience: '',
    objective: '',
  })
  const [savingOnboarding, setSavingOnboarding] = useState(false)
  const [onboardingStrategyResult, setOnboardingStrategyResult] = useState<any>(null)
  const [generatingStrategy, setGeneratingStrategy] = useState(false)
  
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
  const [notifications, setNotifications] = useState<Array<{
    id: string
    type: 'success' | 'error' | 'info' | 'warning'
    message: string
    timestamp: Date
    read: boolean
  }>>([])
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const notificationsRef = useRef<HTMLDivElement>(null)
  
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

  // State pentru tool-uri
  const [toolInputs, setToolInputs] = useState<Record<string, any>>({})
  const [toolResults, setToolResults] = useState<Record<string, any>>({})
  const [savedResultIds, setSavedResultIds] = useState<Record<string, string | null>>({}) // Track saved generation IDs
  const [savingResult, setSavingResult] = useState<Record<string, boolean>>({}) // Track saving state
  const [toolLoading, setToolLoading] = useState<Record<string, boolean>>({})
  const [toolErrors, setToolErrors] = useState<Record<string, string | null>>({})
  const [savedResults, setSavedResults] = useState<Record<string, any[]>>({})
  const [loadingSavedResults, setLoadingSavedResults] = useState<Record<string, boolean>>({})
  const [showSavedResults, setShowSavedResults] = useState<Record<string, boolean>>({})
  
  // State pentru calendar
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number | null>(null)
  const [selectedCalendarDayData, setSelectedCalendarDayData] = useState<any | null>(null)
  
  // State pentru calendarul principal (30 de zile)
  const [mainCalendar, setMainCalendar] = useState<any>(null)
  const [mainCalendarSelectedDay, setMainCalendarSelectedDay] = useState<number | null>(null)
  const [mainCalendarSelectedDayData, setMainCalendarSelectedDayData] = useState<any | null>(null)

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
          business_type: profileResult.data.business_type || '',
          business_description: profileResult.data.business_description || '',
        })
        
        // Verifică dacă trebuie să afișeze onboarding (dacă business_type nu este setat SAU dacă nu există strategie client)
        const hasBusinessInfo = profileResult.data.business_type && profileResult.data.business_description
        if (!hasBusinessInfo) {
          setShowOnboarding(true)
        } else {
          // Verifică dacă există strategie client salvată
          const { data: strategyGen } = await supabase
            .from('generations')
            .select('id, result_text')
            .eq('user_id', userId)
            .eq('type', 'strategie-client')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()
          
          if (!strategyGen) {
            setShowOnboarding(true)
          }
        }
        
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
        // Setează explicit la 0 chiar dacă nu există date sau există eroare
        console.warn('⚠️ No generations data or invalid format:', {
          hasData: !!generationsResult.data,
          isArray: Array.isArray(generationsResult.data),
          error: generationsResult.error,
          dataType: typeof generationsResult.data
        })
        setTotalGenerations(0)
        setSuccessfulGenerations(0)
        setFailedGenerations(0)
      }
      
      // Asigură-te că creditele sunt setate chiar dacă nu există tranzacții
      if (currentCredits === undefined || currentCredits === null) {
        console.warn('⚠️ Credits not set, defaulting to 0')
        setCurrentCredits(0)
      }

      console.log('✅ All user data loaded successfully')
    } catch (error) {
      console.error('❌ Error loading user data:', error)
    } finally {
      delete loadUserDataRef.current[userId]
    }

    // Încarcă calendarul principal
    await loadMainCalendar(userId)
  }

  // Funcție pentru a deschide tool-ul Strategie Video cu datele din calendar
  const handleGenerateVideoFromCalendar = (postOrStory: any) => {
    // Mapează tipul de clip la style
    const typeToStyle: Record<string, string> = {
      'Educational': 'educational',
      'Educativ': 'educational',
      'Storytelling': 'storytelling',
      'Social Proof': 'social-proof',
      'Double Downs': 'double-downs',
      'Series': 'series',
      'Serie': 'series',
    }
    
    // Mapează formatul la platformă
    const formatToPlatform: Record<string, string> = {
      'TikTok': 'tiktok',
      'Reels': 'reels',
      'Instagram Reels': 'reels',
      'Shorts': 'shorts',
      'YouTube Shorts': 'shorts',
    }
    
    // Extrage și mapează datele
    const style = typeToStyle[postOrStory.type] || 'educational'
    const platform = formatToPlatform[postOrStory.format] || 'tiktok'
    const videoDescription = postOrStory.content || postOrStory.purpose || ''
    
    // Setează inputurile pentru tool-ul strategie-video
    setToolInputs(prev => ({
      ...prev,
      'strategie-video': {
        platform: platform,
        style: style,
        duration: 'medium', // Default
        objective: 'follow', // Default
        videoDescription: videoDescription,
        painPoint: '', // Opțional
      },
    }))
    
    // Deschide tool-ul strategie-video
    setActiveTool('strategie-video')
    
    // Închide modalurile calendar (atât cel din tool cât și cel principal)
    setSelectedCalendarDay(null)
    setSelectedCalendarDayData(null)
    setMainCalendarSelectedDay(null)
    setMainCalendarSelectedDayData(null)
    
    // Scroll la tool după un mic delay pentru a permite render-ul
    setTimeout(() => {
      const toolElement = document.getElementById('tool-interface')
      if (toolElement) {
        toolElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }

  // Funcție pentru încărcarea calendarului principal
  const loadMainCalendar = async (userId: string) => {
    try {
      const response = await fetch(`/api/calendar?user_id=${userId}`)
      
      if (!response.ok) {
        console.error('❌ Failed to load calendar:', response.status, response.statusText)
        const errorText = await response.text()
        console.error('Error response:', errorText)
        setMainCalendar(null)
        return
      }
      
      const result = await response.json()
      console.log('📥 Calendar load response:', result)
      
      if (result.success) {
        if (result.calendar && Array.isArray(result.calendar)) {
          setMainCalendar(result.calendar)
          console.log('✅ Calendar loaded successfully:', result.calendar.length, 'days')
        } else {
          setMainCalendar(null)
          console.log('ℹ️ No calendar data (null or not array)')
        }
      } else {
        console.warn('⚠️ Calendar load not successful:', result.error)
        setMainCalendar(null)
      }
    } catch (error) {
      console.error('❌ Error loading main calendar:', error)
      setMainCalendar(null)
    }
  }

  // Funcție pentru salvarea calendarului principal
  const saveMainCalendar = async (calendar: any) => {
    if (!user) {
      console.warn('⚠️ Cannot save calendar: user not authenticated')
      return
    }
    
    if (!calendar || !Array.isArray(calendar)) {
      console.error('❌ Invalid calendar data:', calendar)
      setNotification({ 
        type: 'error', 
        message: 'Invalid calendar data' 
      })
      setTimeout(() => setNotification(null), 5000)
      return
    }
    
    console.log('💾 Saving main calendar:', { 
      userId: user.id, 
      calendarType: Array.isArray(calendar) ? 'array' : typeof calendar,
      calendarLength: Array.isArray(calendar) ? calendar.length : 'N/A'
    })
    
    try {
      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          calendar: calendar,
        }),
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Failed to save calendar:', response.status, response.statusText)
        console.error('Error response:', errorText)
        let errorMessage = `Failed to save calendar: ${response.status} ${response.statusText}`
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.error || errorJson.details || errorMessage
        } catch (e) {
          // Nu e JSON, folosim textul
        }
        throw new Error(errorMessage)
      }
      
      const result = await response.json()
      console.log('📥 Calendar save response:', result)
      
      if (result.success) {
        // Actualizează starea locală imediat
        setMainCalendar(calendar)
        console.log('✅ Calendar saved and state updated:', calendar.length, 'days')
        setNotification({ 
          type: 'success', 
          message: settingsFormData.language === 'en' 
            ? 'Calendar saved successfully!' 
            : 'Calendar salvat cu succes!' 
        })
        setTimeout(() => setNotification(null), 3000)
      } else {
        throw new Error(result.error || result.details || 'Failed to save calendar')
      }
    } catch (error) {
      console.error('❌ Error saving calendar:', error)
      setNotification({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Failed to save calendar' 
      })
      setTimeout(() => setNotification(null), 5000)
    }
  }

  // Structura tool-urilor pe grupuri
  const toolGroups: ToolGroup[] = useMemo(() => [
    {
      id: 'strategie',
      name: 'Strategie & Analiză',
      nameEn: 'Strategy & Analysis',
      icon: Target,
      tools: [
        {
          id: 'strategie-client',
          name: 'Caută Client Ideal',
          nameEn: 'Find Ideal Client',
          description: 'Identifică clientul tău ideal și creează mesaje care rezonează cu el.',
          descriptionEn: 'Identify your ideal client and create messages that resonate with them.',
          icon: Users,
        },
        {
          id: 'analiza-piata',
          name: 'Analiză de Piață & Concurență',
          nameEn: 'Market & Competitor Analysis',
          description: 'Analizează piața și competitorii pentru a vedea ce funcționează deja.',
          descriptionEn: 'Analyze the market and competitors to see what already works.',
          icon: BarChart,
        },
        {
          id: 'strategie-video',
          name: 'Strategie Video & Scripturi',
          nameEn: 'Video Content Strategy',
          description: 'Generează idei și structuri pentru clipuri video care prind.',
          descriptionEn: 'Generate ideas and structures for engaging video clips.',
          icon: Video,
        },
      ],
    },
    {
      id: 'creare',
      name: 'Creare Conținut',
      nameEn: 'Content Creation',
      icon: PenTool,
      tools: [
        {
          id: 'copywriting',
          name: 'Copywriting Publicitar',
          nameEn: 'Ad & Content Copywriting',
          description: 'Generează texte clare și convingătoare pentru marketing.',
          descriptionEn: 'Generate clear and convincing texts for marketing.',
          icon: FileText,
        },
        {
          id: 'design-publicitar',
          name: 'Design Publicitar',
          nameEn: 'Ad Creative Design',
          description: 'Creează vizualuri profesionale pentru social media și reclame.',
          descriptionEn: 'Create professional visuals for social media and ads.',
          icon: Palette,
        },
        {
          id: 'planificare-conținut',
          name: 'Planificare de Conținut',
          nameEn: 'Content Strategy Planner',
          description: 'Construiește un plan clar de postare pentru social media.',
          descriptionEn: 'Build a clear posting plan for social media.',
          icon: Calendar,
        },
      ],
    },
  ], [])

  // Menu items - se actualizează dinamic cu traducerile (memoizat pentru performanță)
  const menuItems = useMemo(() => [
    { id: 'tooluri' as Section, label: t('tools'), icon: Wrench },
  ], [settingsFormData.language])

  // Funcție pentru a toggle un grup
  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev)
      if (newSet.has(groupId)) {
        newSet.delete(groupId)
      } else {
        newSet.add(groupId)
      }
      return newSet
    })
  }

  // Funcție pentru adăugarea notificărilor
  const addNotification = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    const newNotification = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type,
      message,
      timestamp: new Date(),
      read: false,
    }
    setNotifications(prev => [newNotification, ...prev].slice(0, 50)) // Păstrează ultimele 50 notificări
    
    // Marchează ca necitit
    setNotificationsOpen(false)
    
    // Auto-șterge notificările vechi (peste 7 zile)
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id))
    }, 7 * 24 * 60 * 60 * 1000)
  }

  // Funcție pentru marcarea notificărilor ca citite
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  // Funcție pentru ștergerea tuturor notificărilor
  const clearAllNotifications = () => {
    setNotifications([])
  }

  // Funcție pentru ștergerea unei notificări
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  // Funcție pentru căutare
  const performSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    const lowerQuery = query.toLowerCase().trim()
    const results: any[] = []

    // Caută în tool-uri
    toolGroups.forEach(group => {
      group.tools.forEach(tool => {
        const toolName = settingsFormData.language === 'en' ? tool.nameEn : tool.name
        const toolDescription = settingsFormData.language === 'en' ? tool.descriptionEn : tool.description
        
        if (
          toolName.toLowerCase().includes(lowerQuery) ||
          toolDescription.toLowerCase().includes(lowerQuery) ||
          tool.id.toLowerCase().includes(lowerQuery)
        ) {
          results.push({
            type: 'tool',
            id: tool.id,
            title: toolName,
            description: toolDescription,
            category: settingsFormData.language === 'en' ? group.nameEn : group.name,
            icon: tool.icon,
            action: () => {
              setActiveTool(tool.id as ToolId)
              setActiveSection('tooluri')
              setSearchQuery('')
              setShowSearchResults(false)
            }
          })
        }
      })
    })

    // Caută în secțiuni
    const sections = [
      { id: 'tooluri', name: settingsFormData.language === 'en' ? 'Tools' : 'Tooluri', nameEn: 'Tools', icon: Wrench },
      { id: 'logs', name: settingsFormData.language === 'en' ? 'Logs' : 'Loguri', nameEn: 'Logs', icon: History },
      { id: 'credite', name: settingsFormData.language === 'en' ? 'Credits' : 'Credite', nameEn: 'Credits', icon: Coins },
      { id: 'setari', name: settingsFormData.language === 'en' ? 'Settings' : 'Setări', nameEn: 'Settings', icon: Settings },
      { id: 'profil', name: settingsFormData.language === 'en' ? 'Profile' : 'Profil', nameEn: 'Profile', icon: UserIcon },
    ]

    sections.forEach(section => {
      const sectionName = settingsFormData.language === 'en' ? section.nameEn : section.name
      if (sectionName.toLowerCase().includes(lowerQuery) || section.id.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: 'section',
          id: section.id,
          title: sectionName,
          description: settingsFormData.language === 'en' 
            ? `Navigate to ${sectionName} section`
            : `Navighează la secțiunea ${sectionName}`,
          category: settingsFormData.language === 'en' ? 'Navigation' : 'Navigare',
          icon: section.icon,
          action: () => {
            if (section.id === 'setari' || section.id === 'profil') {
              setUserMenuSection(section.id as 'setari' | 'profil')
              setActiveSection('tooluri')
            } else {
              setActiveSection(section.id as Section)
              setUserMenuSection(null)
            }
            setSearchQuery('')
            setShowSearchResults(false)
          }
        })
      }
    })

    setSearchResults(results)
    setShowSearchResults(results.length > 0)
  }

  // Efect pentru citirea query param-ului tool și setarea tool-ului activ
  useEffect(() => {
    const toolParam = searchParams?.get('tool')
    if (toolParam) {
      const validToolIds: ToolId[] = ['analiza-piata', 'copywriting', 'planificare-conținut', 'strategie-client', 'strategie-video', 'design-publicitar']
      if (validToolIds.includes(toolParam as ToolId)) {
        setActiveTool(toolParam as ToolId)
        setActiveSection('tooluri')
        // Expandăm grupul care conține tool-ul
        const toolGroups = [
          { id: 'strategie', tools: ['strategie-client', 'analiza-piata', 'strategie-video'] },
          { id: 'creare', tools: ['copywriting', 'design-publicitar', 'planificare-conținut'] },
        ]
        const group = toolGroups.find(g => g.tools.includes(toolParam))
        if (group) {
          setExpandedGroups(new Set([group.id]))
        }
      }
    }
  }, [searchParams])

  // Efect pentru căutare
  useEffect(() => {
    if (searchQuery) {
      performSearch(searchQuery)
    } else {
      setSearchResults([])
      setShowSearchResults(false)
    }
  }, [searchQuery, settingsFormData.language])

  // Efect pentru a închide rezultatele când se face click în afara lor
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Închide rezultatele căutării
      if (
        searchResultsRef.current &&
        !searchResultsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSearchResults(false)
      }
      
      // Închide notificările
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement)?.closest('button[aria-label*="notification"]')
      ) {
        setNotificationsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

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

  // Reîncarcă datele când user-ul devine disponibil și loading s-a terminat
  // Acest useEffect asigură că datele se încarcă chiar dacă initializeAuth nu le-a încărcat
  useEffect(() => {
    if (user && !loading && user.id) {
      // Folosește un ref pentru a evita apeluri duplicate
      const shouldLoad = !loadUserDataRef.current[user.id]
      if (shouldLoad) {
        console.log('🔄 Ensuring user data is loaded after auth...', user.id)
        // Folosește un mic delay pentru a evita conflictul cu initializeAuth
        const timer = setTimeout(() => {
          loadUserData(user.id)
        }, 500)
        return () => clearTimeout(timer)
      }
    }
  }, [user?.id, loading]) // Reîncarcă când user.id se schimbă sau loading se termină

  // Încarcă strategia client când se deschide secțiunea de profil
  useEffect(() => {
    if (userMenuSection === 'profil' && user && !clientStrategy && !loadingStrategy) {
      loadClientStrategy()
    }
  }, [userMenuSection, user])

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

  // Păstrează sidebar-ul deschis pe desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true)
      }
    }

    // Verifică la mount
    handleResize()

    // Ascultă la resize
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Funcție pentru salvare manuală a rezultatului
  const saveResult = async (toolId: ToolId, result: any, inputs: any) => {
    if (!user) {
      setNotification({ 
        type: 'error', 
        message: settingsFormData.language === 'en' ? 'User not authenticated' : 'Utilizator neautentificat' 
      })
      setTimeout(() => setNotification(null), 3000)
      return
    }

    setSavingResult(prev => ({ ...prev, [toolId]: true }))

    try {
      const response = await fetch('/api/save-result', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toolId,
          result,
          inputs,
          user_id: user.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save result')
      }

      setSavedResultIds(prev => ({ ...prev, [toolId]: data.generation_id }))
      const successMessage = settingsFormData.language === 'en' ? 'Result saved successfully!' : 'Rezultat salvat cu succes!'
      setNotification({ type: 'success', message: successMessage })
      addNotification('success', successMessage)
      setTimeout(() => setNotification(null), 3000)

      // Reîncarcă lista de rezultate salvate
      await loadSavedResults(toolId)
    } catch (error) {
      console.error('Error saving result:', error)
      setNotification({ 
        type: 'error', 
        message: error instanceof Error ? error.message : (settingsFormData.language === 'en' ? 'Error saving result' : 'Eroare la salvare') 
      })
      setTimeout(() => setNotification(null), 5000)
    } finally {
      setSavingResult(prev => ({ ...prev, [toolId]: false }))
    }
  }

  // Funcție pentru încărcarea rezultatelor salvate
  const loadSavedResults = async (toolId: ToolId) => {
    if (!user) {
      console.warn('Cannot load saved results: user not authenticated')
      return
    }

    console.log('Loading saved results for tool:', toolId, 'user:', user.id)
    setLoadingSavedResults(prev => ({ ...prev, [toolId]: true }))

    try {
      const url = `/api/saved-results?user_id=${user.id}&tool_id=${toolId}`
      console.log('Fetching from:', url)
      
      const response = await fetch(url)
      const result = await response.json()

      console.log('Saved results response:', { ok: response.ok, success: result.success, dataLength: result.data?.length })

      if (response.ok && result.success) {
        const results = result.data || []
        console.log('Setting saved results:', results.length, 'items')
        console.log('Sample result:', results[0])
        setSavedResults(prev => ({ ...prev, [toolId]: results }))
        
        if (results.length === 0) {
          console.log('No saved results found for tool:', toolId)
        } else {
          console.log('✅ Found', results.length, 'saved results for', toolId)
        }
      } else {
        console.error('Error loading saved results:', result.error)
        setNotification({ 
          type: 'error', 
          message: result.error || (settingsFormData.language === 'en' ? 'Failed to load saved results' : 'Eroare la încărcarea rezultatelor salvate')
        })
        setTimeout(() => setNotification(null), 3000)
      }
    } catch (error) {
      console.error('Error loading saved results:', error)
      setNotification({ 
        type: 'error', 
        message: settingsFormData.language === 'en' ? 'Failed to load saved results' : 'Eroare la încărcarea rezultatelor salvate'
      })
      setTimeout(() => setNotification(null), 3000)
    } finally {
      setLoadingSavedResults(prev => ({ ...prev, [toolId]: false }))
    }
  }

  // Funcție pentru procesarea tool-urilor
  const handleToolSubmit = async (toolId: ToolId, inputs: any) => {
    if (!user) {
      setNotification({ type: 'error', message: t('userNotAuthenticated') })
      setTimeout(() => setNotification(null), 3000)
      return
    }

    setToolLoading(prev => ({ ...prev, [toolId]: true }))
    setToolErrors(prev => ({ ...prev, [toolId]: null }))

    try {
      const response = await fetch('/api/tools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toolId,
          inputs,
          user_id: user.id,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to process tool')
      }

      console.log('Tool response:', { success: result.success, hasData: !!result.data, generationId: result.generation_id })
      
      setToolResults(prev => ({ ...prev, [toolId]: result.data }))
      // Marchează rezultatul ca salvat dacă există generation_id (salvare automată)
      if (result.generation_id) {
        console.log('✅ Result automatically saved with ID:', result.generation_id)
        setSavedResultIds(prev => ({ ...prev, [toolId]: result.generation_id }))
      } else {
        console.warn('⚠️ No generation_id in response - result not automatically saved')
        setSavedResultIds(prev => ({ ...prev, [toolId]: null }))
      }
      
      // Resetează loading-ul imediat după ce am primit răspunsul și setat rezultatul
      setToolLoading(prev => ({ ...prev, [toolId]: false }))
      
      // Dacă este planificare de conținut, salvează calendarul principal
      if (toolId === 'planificare-conținut' && result.data) {
        console.log('📅 Planificare conținut result:', { 
          hasData: !!result.data, 
          hasCalendar: !!result.data.calendar,
          calendarType: result.data.calendar ? (Array.isArray(result.data.calendar) ? 'array' : typeof result.data.calendar) : 'none',
          calendarLength: result.data.calendar && Array.isArray(result.data.calendar) ? result.data.calendar.length : 'N/A'
        })
        
        if (result.data.calendar) {
          // Verifică dacă calendarul este un array valid
          if (Array.isArray(result.data.calendar)) {
            console.log('✅ Calendar is valid array, saving...')
            await saveMainCalendar(result.data.calendar)
            // Reîncarcă calendarul pentru a fi sigur că este actualizat
            if (user) {
              await loadMainCalendar(user.id)
            }
          } else {
            console.warn('⚠️ Calendar is not an array:', result.data.calendar)
          }
        } else {
          console.warn('⚠️ No calendar in result.data:', result.data)
        }
      }
      
      const toolName = toolGroups.flatMap(g => g.tools).find(t => t.id === toolId)
      const successMessage = settingsFormData.language === 'en'
        ? `${toolName ? (toolName.nameEn || toolName.name) : 'Tool'} generated successfully!`
        : `${toolName ? toolName.name : 'Tool-ul'} a fost generat cu succes!`
      
      setNotification({ type: 'success', message: successMessage })
      addNotification('success', successMessage)
      setTimeout(() => setNotification(null), 3000)

      // Reîncarcă datele utilizatorului (dar NU calendarul, deja l-am reîncărcat mai sus)
      if (user) {
        // Reîncarcă doar datele generale, nu calendarul (l-am reîncărcat deja)
        try {
          const profileResult = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          if (profileResult.data) {
            setUserProfile(profileResult.data)
          }

          // Reîncarcă creditele
          const creditsResult = await supabase
            .from('credit_transactions')
            .select('amount')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

          if (creditsResult.data) {
            const total = creditsResult.data.reduce((sum, t) => sum + (t.amount || 0), 0)
            setCurrentCredits(total)
          }

          // Reîncarcă generările
          const generationsResult = await supabase
            .from('generations')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(100)

          if (generationsResult.data) {
            const total = generationsResult.data.length
            const successful = generationsResult.data.filter(g => g.status === 'completed').length
            const failed = generationsResult.data.filter(g => g.status === 'failed').length
            setTotalGenerations(total)
            setSuccessfulGenerations(successful)
            setFailedGenerations(failed)
          }
        } catch (error) {
          console.error('Error reloading user data:', error)
        }
      }
    } catch (error) {
      console.error('Error processing tool:', error)
      setToolErrors(prev => ({ ...prev, [toolId]: error instanceof Error ? error.message : 'Unknown error' }))
      const errorMessage = error instanceof Error ? error.message : (settingsFormData.language === 'en' ? 'Error processing tool' : 'Eroare la procesarea tool-ului')
      setNotification({ type: 'error', message: errorMessage })
      addNotification('error', errorMessage)
      setTimeout(() => setNotification(null), 5000)
      // Resetează loading-ul și în caz de eroare
      setToolLoading(prev => ({ ...prev, [toolId]: false }))
    }
  }

  // Funcție helper pentru a genera un titlu frumos pentru rezultatele salvate
  const getSavedResultTitle = (saved: any, toolId: ToolId): string => {
    try {
      // Extrage rezultatul parsat
      let result = saved.result
      if (typeof result === 'string') {
        result = JSON.parse(result)
      }
      if (result?.result) {
        result = result.result
      }

      // Extrage prompt-ul parsat pentru informații suplimentare
      let promptData: any = null
      if (saved.prompt) {
        try {
          promptData = typeof saved.prompt === 'string' ? JSON.parse(saved.prompt) : saved.prompt
        } catch (e) {
          // Ignoră eroarea
        }
      }

      // Generează titlu bazat pe tipul de tool
      switch (toolId) {
        case 'strategie-client':
          const businessType = promptData?.businessType || result?.businessType || ''
          const idealClient = result?.idealClient || ''
          if (businessType && idealClient) {
            return `${businessType} - ${idealClient.substring(0, 50)}${idealClient.length > 50 ? '...' : ''}`
          } else if (businessType) {
            return businessType
          } else if (idealClient) {
            return idealClient.substring(0, 60) + (idealClient.length > 60 ? '...' : '')
          }
          return settingsFormData.language === 'en' ? 'Client Strategy' : 'Strategie Client'
        
        case 'analiza-piata':
          const marketType = promptData?.businessType || result?.businessType || ''
          if (marketType) {
            return `${settingsFormData.language === 'en' ? 'Market Analysis' : 'Analiză Piață'}: ${marketType}`
          }
          return settingsFormData.language === 'en' ? 'Market Analysis' : 'Analiză Piață'
        
        case 'strategie-video':
          const videoPlatform = promptData?.platform || result?.platform || ''
          const videoStyle = promptData?.style || result?.style || ''
          const videoDuration = promptData?.duration || result?.duration || ''
          const videoDescription = promptData?.videoDescription || result?.videoDescription || ''
          
          // Construiește un titlu descriptiv
          const parts: string[] = []
          if (videoPlatform) {
            parts.push(videoPlatform.charAt(0).toUpperCase() + videoPlatform.slice(1))
          }
          if (videoStyle) {
            const styleMap: Record<string, string> = {
              'educational': settingsFormData.language === 'en' ? 'Educational' : 'Educativ',
              'double-downs': 'Double Downs',
              'storytelling': 'Storytelling',
              'social-proof': 'Social Proof',
              'series': settingsFormData.language === 'en' ? 'Series' : 'Serie',
            }
            parts.push(styleMap[videoStyle] || videoStyle)
          }
          if (videoDuration) {
            const durationMap: Record<string, string> = {
              'short': settingsFormData.language === 'en' ? '15s' : '15s',
              'medium': settingsFormData.language === 'en' ? '30-40s' : '30-40s',
              'long': settingsFormData.language === 'en' ? '60-70s' : '60-70s',
            }
            parts.push(durationMap[videoDuration] || videoDuration)
          }
          
          if (parts.length > 0) {
            return `${settingsFormData.language === 'en' ? 'Video Strategy' : 'Strategie Video'}: ${parts.join(' • ')}`
          }
          
          // Fallback la descriere dacă există
          if (videoDescription && videoDescription.length > 0) {
            const shortDesc = videoDescription.substring(0, 50) + (videoDescription.length > 50 ? '...' : '')
            return `${settingsFormData.language === 'en' ? 'Video Strategy' : 'Strategie Video'}: ${shortDesc}`
          }
          
          return settingsFormData.language === 'en' ? 'Video Strategy' : 'Strategie Video'
        
        case 'copywriting':
          const copyType = promptData?.businessType || result?.businessType || ''
          if (copyType) {
            return `${settingsFormData.language === 'en' ? 'Ad Copy' : 'Copy Publicitar'}: ${copyType}`
          }
          return settingsFormData.language === 'en' ? 'Ad Copy' : 'Copy Publicitar'
        
        case 'planificare-conținut':
          const planType = promptData?.businessType || result?.businessType || ''
          if (planType) {
            return `${settingsFormData.language === 'en' ? 'Content Plan' : 'Plan Conținut'}: ${planType}`
          }
          return settingsFormData.language === 'en' ? 'Content Plan' : 'Plan Conținut'
        
        default:
          return settingsFormData.language === 'en' ? 'Saved Result' : 'Rezultat Salvat'
      }
    } catch (e) {
      console.error('Error generating saved result title:', e)
      return settingsFormData.language === 'en' ? 'Saved Result' : 'Rezultat Salvat'
    }
  }

  // Funcție pentru a randa interfața tool-ului
  const renderToolInterface = (toolId: ToolId, toolName: string, toolDescription: string) => {
    const inputs = toolInputs[toolId] || {}
    const result = toolResults[toolId]
    const isLoading = toolLoading[toolId] || false
    const error = toolErrors[toolId]

    const updateInput = (field: string, value: any) => {
      setToolInputs(prev => ({
        ...prev,
        [toolId]: {
          ...prev[toolId],
          [field]: value,
        },
      }))
    }

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      handleToolSubmit(toolId, inputs)
    }

    // Tool 1: Strategie de Client & Mesaj
    if (toolId === 'strategie-client') {
      return (
        <Fragment>
          <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                {settingsFormData.language === 'en' ? 'Business Type / Product' : 'Tip Afacere / Produs'}
              </label>
              <input
                type="text"
                value={inputs.businessType || ''}
                onChange={(e) => updateInput('businessType', e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-800/80 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                {settingsFormData.language === 'en' ? 'Sells Online or Local' : 'Vinde Online sau Local'}
              </label>
              <select
                value={inputs.sellType || ''}
                onChange={(e) => updateInput('sellType', e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-800/80 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                required
              >
                <option value="">{settingsFormData.language === 'en' ? 'Select...' : 'Selectează...'}</option>
                <option value="online">{settingsFormData.language === 'en' ? 'Online' : 'Online'}</option>
                <option value="local">{settingsFormData.language === 'en' ? 'Local' : 'Local'}</option>
                <option value="both">{settingsFormData.language === 'en' ? 'Both' : 'Ambele'}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                {settingsFormData.language === 'en' ? 'Price Range' : 'Preț'}
              </label>
              <select
                value={inputs.priceRange || ''}
                onChange={(e) => updateInput('priceRange', e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-800/80 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                required
              >
                <option value="">{settingsFormData.language === 'en' ? 'Select...' : 'Selectează...'}</option>
                <option value="low">{settingsFormData.language === 'en' ? 'Low' : 'Mic'}</option>
                <option value="medium">{settingsFormData.language === 'en' ? 'Medium' : 'Mediu'}</option>
                <option value="high">{settingsFormData.language === 'en' ? 'High' : 'Mare'}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                {settingsFormData.language === 'en' ? 'Target Audience' : 'Cui Vinde'}
              </label>
              <select
                value={inputs.targetAudience || ''}
                onChange={(e) => updateInput('targetAudience', e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-800/80 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                required
              >
                <option value="">{settingsFormData.language === 'en' ? 'Select...' : 'Selectează...'}</option>
                <option value="B2C">B2C</option>
                <option value="B2B">B2B</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-white mb-2">
                {settingsFormData.language === 'en' ? 'Main Objective' : 'Obiectiv Principal'}
              </label>
              <select
                value={inputs.objective || ''}
                onChange={(e) => updateInput('objective', e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-800/80 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                required
              >
                <option value="">{settingsFormData.language === 'en' ? 'Select...' : 'Selectează...'}</option>
                <option value="sales">{settingsFormData.language === 'en' ? 'Sales' : 'Vânzări'}</option>
                <option value="leads">{settingsFormData.language === 'en' ? 'Leads' : 'Lead-uri'}</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="relative w-full px-6 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>{settingsFormData.language === 'en' ? 'Processing...' : 'Se procesează...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>{settingsFormData.language === 'en' ? 'Generate Strategy' : 'Generează Strategia'}</span>
                <span className="ml-2 px-2 py-1 bg-white/20 rounded-lg text-xs font-semibold">
                  ({TOOL_COSTS['strategie-client']} {settingsFormData.language === 'en' ? 'credits' : 'credite'})
                </span>
              </>
            )}
          </button>

          {/* Buton pentru rezultate salvate */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              const willShow = !showSavedResults[toolId]
              setShowSavedResults(prev => ({ ...prev, [toolId]: willShow }))
              // Dacă deschidem lista și nu avem date încărcate, le încărcăm
              if (willShow && (!savedResults[toolId] || savedResults[toolId].length === 0)) {
                loadSavedResults(toolId)
              }
            }}
            className="w-full mt-3 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 rounded-lg text-gray-300 hover:text-white transition-colors flex items-center justify-center space-x-2"
          >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span className="text-sm font-medium">
                {settingsFormData.language === 'en' ? 'Saved Results' : 'Rezultate Salvate'}
              </span>
              {loadingSavedResults[toolId] && (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
          </button>

          {result && (
            <div className="mt-6 p-6 bg-gray-800/50 rounded-lg border border-gray-700/50 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-white">{settingsFormData.language === 'en' ? 'Results' : 'Rezultate'}</h4>
                <div className="flex items-center space-x-3">
                  {savedResultIds[toolId] ? (
                    <div className="flex items-center space-x-2 text-xs text-green-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{settingsFormData.language === 'en' ? 'Saved' : 'Salvat'}</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => saveResult(toolId, result, inputs)}
                      disabled={savingResult[toolId]}
                      className="px-4 py-1.5 text-xs bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded-lg text-green-400 hover:text-green-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {savingResult[toolId] ? (
                        <>
                          <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>{settingsFormData.language === 'en' ? 'Saving...' : 'Se salvează...'}</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{settingsFormData.language === 'en' ? 'Save Result' : 'Salvează Rezultatul'}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
              {result.idealClient && (
                <div>
                  <h5 className="text-sm font-semibold text-gray-300 mb-2">{settingsFormData.language === 'en' ? 'Ideal Client' : 'Client Ideal'}</h5>
                  <p className="text-white">{result.idealClient}</p>
                </div>
              )}
              {result.mainProblem && (
                <div>
                  <h5 className="text-sm font-semibold text-gray-300 mb-2">{settingsFormData.language === 'en' ? 'Main Problem' : 'Problema Principală'}</h5>
                  <p className="text-white">{result.mainProblem}</p>
                </div>
              )}
              {result.promise && (
                <div>
                  <h5 className="text-sm font-semibold text-gray-300 mb-2">{settingsFormData.language === 'en' ? 'Attractive Promise' : 'Promisiunea Atractivă'}</h5>
                  <p className="text-white">{result.promise}</p>
                </div>
              )}
              {result.recommendedMessages && Array.isArray(result.recommendedMessages) && result.recommendedMessages.length > 0 && (
                <div>
                  <h5 className="text-sm font-semibold text-gray-300 mb-2">{settingsFormData.language === 'en' ? 'Recommended Messages' : 'Mesaje Recomandate'}</h5>
                  <ul className="list-disc list-inside space-y-1">
                    {result.recommendedMessages.map((msg: string, idx: number) => (
                      <li key={idx} className="text-white">{msg}</li>
                    ))}
                  </ul>
                </div>
              )}
              {result.messagesToAvoid && Array.isArray(result.messagesToAvoid) && result.messagesToAvoid.length > 0 && (
                <div>
                  <h5 className="text-sm font-semibold text-gray-300 mb-2">{settingsFormData.language === 'en' ? 'Messages to Avoid' : 'Mesaje de Evitat'}</h5>
                  <ul className="list-disc list-inside space-y-1">
                    {result.messagesToAvoid.map((msg: string, idx: number) => (
                      <li key={idx} className="text-white">{msg}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </form>

        {/* Lista rezultatelor salvate - în afara form-ului */}
        {showSavedResults[toolId] && (
          <div className="mt-6 space-y-3">
            <h4 className="text-lg font-bold text-white mb-3">
              {settingsFormData.language === 'en' ? 'Saved Results' : 'Rezultate Salvate'}
              {savedResults[toolId] && savedResults[toolId].length > 0 && (
                <span className="text-sm text-gray-400 ml-2">({savedResults[toolId].length})</span>
              )}
            </h4>
            
            {loadingSavedResults[toolId] ? (
              <div className="text-center py-8">
                <svg className="animate-spin h-8 w-8 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-gray-400 text-sm mt-4">
                  {settingsFormData.language === 'en' ? 'Loading...' : 'Se încarcă...'}
                </p>
              </div>
            ) : (savedResults[toolId] && Array.isArray(savedResults[toolId]) && savedResults[toolId].length > 0) ? (
              savedResults[toolId].map((saved: any, idx: number) => (
                <div
                  key={saved.id || idx}
                  className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-blue-500/50 transition-colors cursor-pointer"
                  onClick={() => {
                    // Parsează rezultatul - structura: saved.result = { result: {...} } sau saved.result direct
                    let parsedResult = null
                    console.log('Clicking saved result:', saved)
                    
                    if (saved.result) {
                      // Dacă result are o proprietate 'result' (structura din n8n)
                      if (saved.result.result && typeof saved.result.result === 'object') {
                        parsedResult = saved.result.result
                      } 
                      // Dacă result este direct obiectul
                      else if (typeof saved.result === 'object' && !Array.isArray(saved.result)) {
                        parsedResult = saved.result
                      } 
                      // Dacă e string, încearcă să-l parseze
                      else if (typeof saved.result === 'string') {
                        try {
                          const parsed = JSON.parse(saved.result)
                          // Verifică dacă parsed are o proprietate 'result'
                          parsedResult = parsed.result || parsed
                        } catch (e) {
                          parsedResult = saved.result
                        }
                      }
                    }
                    
                    console.log('Parsed result:', parsedResult)
                    if (parsedResult) {
                      setToolResults(prev => ({ ...prev, [toolId]: parsedResult }))
                    }
                    setShowSavedResults(prev => ({ ...prev, [toolId]: false }))
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white mb-1">
                        {getSavedResultTitle(saved, toolId)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(saved.created_at).toLocaleDateString(settingsFormData.language === 'en' ? 'en-US' : 'ro-RO', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 bg-gray-800/30 rounded-lg border border-gray-700/30 text-center">
                <svg className="w-12 h-12 text-gray-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <p className="text-gray-400 text-sm">
                  {settingsFormData.language === 'en' ? 'No saved results yet. Generate a result to save it here.' : 'Nu există rezultate salvate. Generează un rezultat pentru a-l salva aici.'}
                </p>
                {/* Debug info - șterge după testare */}
                {process.env.NODE_ENV === 'development' && (
                  <p className="text-xs text-gray-600 mt-2">
                    Debug: savedResults[{toolId}] = {JSON.stringify(savedResults[toolId])}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
        </Fragment>
      )
    }

    // Tool 2: Analiză de Piață & Concurență
    if (toolId === 'analiza-piata') {
      return (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                {settingsFormData.language === 'en' ? 'Niche / Industry' : 'Nișă / Industrie'}
              </label>
              <input
                type="text"
                value={inputs.niche || ''}
                onChange={(e) => updateInput('niche', e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-800/80 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                {settingsFormData.language === 'en' ? 'Location (Optional)' : 'Locație (Opțional)'}
              </label>
              <input
                type="text"
                value={inputs.location || ''}
                onChange={(e) => updateInput('location', e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-800/80 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-white mb-2">
                {settingsFormData.language === 'en' ? 'Main Platform' : 'Platformă Principală'}
              </label>
              <select
                value={inputs.platform || ''}
                onChange={(e) => updateInput('platform', e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-800/80 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                required
              >
                <option value="">{settingsFormData.language === 'en' ? 'Select...' : 'Selectează...'}</option>
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="facebook">Facebook</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="relative w-full px-6 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>{settingsFormData.language === 'en' ? 'Processing...' : 'Se procesează...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>{settingsFormData.language === 'en' ? 'Analyze Market' : 'Analizează Piața'}</span>
                <span className="ml-2 px-2 py-1 bg-white/20 rounded-lg text-xs font-semibold">
                  ({TOOL_COSTS['analiza-piata']} {settingsFormData.language === 'en' ? 'credits' : 'credite'})
                </span>
              </>
            )}
          </button>

          {result && (
            <div className="mt-6 p-6 bg-gray-800/50 rounded-lg border border-gray-700/50 space-y-4">
              <h4 className="text-lg font-bold text-white">{settingsFormData.language === 'en' ? 'Analysis Results' : 'Rezultate Analiză'}</h4>
              {result.popularAdTypes && Array.isArray(result.popularAdTypes) && result.popularAdTypes.length > 0 && (
                <div>
                  <h5 className="text-sm font-semibold text-gray-300 mb-2">{settingsFormData.language === 'en' ? 'Popular Ad Types' : 'Tipuri de Reclame Populare'}</h5>
                  <ul className="list-disc list-inside space-y-1">
                    {result.popularAdTypes.map((type: string, idx: number) => (
                      <li key={idx} className="text-white">{type}</li>
                    ))}
                  </ul>
                </div>
              )}
              {result.commonMessages && Array.isArray(result.commonMessages) && result.commonMessages.length > 0 && (
                <div>
                  <h5 className="text-sm font-semibold text-gray-300 mb-2">{settingsFormData.language === 'en' ? 'Common Messages' : 'Mesaje Frecvente'}</h5>
                  <ul className="list-disc list-inside space-y-1">
                    {result.commonMessages.map((msg: string, idx: number) => (
                      <li key={idx} className="text-white">{msg}</li>
                    ))}
                  </ul>
                </div>
              )}
              {result.visualStyle && (
                <div>
                  <h5 className="text-sm font-semibold text-gray-300 mb-2">{settingsFormData.language === 'en' ? 'Dominant Visual Style' : 'Stil Vizual Dominant'}</h5>
                  <p className="text-white">{result.visualStyle}</p>
                </div>
              )}
              {result.differentiationDirections && Array.isArray(result.differentiationDirections) && result.differentiationDirections.length > 0 && (
                <div>
                  <h5 className="text-sm font-semibold text-gray-300 mb-2">{settingsFormData.language === 'en' ? 'Differentiation Directions' : 'Direcții de Diferențiere'}</h5>
                  <ul className="list-disc list-inside space-y-1">
                    {result.differentiationDirections.map((dir: string, idx: number) => (
                      <li key={idx} className="text-white">{dir}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Top 5 Video-uri Populare */}
              {result.topVideos && Array.isArray(result.topVideos) && result.topVideos.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-700/50">
                  <h5 className="text-lg font-semibold text-white mb-4">
                    {settingsFormData.language === 'en' ? 'Top 5 Popular Videos' : 'Top 5 Video-uri Populare'}
                  </h5>
                  <div className="space-y-3">
                    {result.topVideos.map((video: any, idx: number) => (
                      <div key={idx} className="p-4 bg-gray-900/50 rounded-lg border border-gray-700/30">
                        <div className="flex items-start justify-between mb-2">
                          <h6 className="text-sm font-semibold text-white flex-1">
                            {video.url ? (
                              <a 
                                href={video.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="hover:text-blue-400 transition-colors"
                              >
                                {video.title || `Video ${idx + 1}`}
                              </a>
                            ) : (
                              video.title || `Video ${idx + 1}`
                            )}
                          </h6>
                          <span className="text-xs text-gray-400 ml-2">#{idx + 1}</span>
                        </div>
                        <div className="text-xs text-gray-400 space-y-1">
                          <p><span className="text-gray-500">{settingsFormData.language === 'en' ? 'Creator' : 'Creator'}:</span> {video.creator || 'N/A'}</p>
                          {video.platform && (
                            <p><span className="text-gray-500">{settingsFormData.language === 'en' ? 'Platform' : 'Platformă'}:</span> {video.platform}</p>
                          )}
                          {video.url && (
                            <p>
                              <a 
                                href={video.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 underline flex items-center space-x-1"
                              >
                                <span>{settingsFormData.language === 'en' ? 'View Video' : 'Vezi Video'}</span>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                            </p>
                          )}
                          {video.whyPopular && (
                            <p className="text-gray-300 mt-2"><span className="text-gray-500">{settingsFormData.language === 'en' ? 'Why Popular' : 'De ce e popular'}:</span> {video.whyPopular}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Top 5 Creatori */}
              {result.topCreators && Array.isArray(result.topCreators) && result.topCreators.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-700/50">
                  <h5 className="text-lg font-semibold text-white mb-4">
                    {settingsFormData.language === 'en' ? 'Top 5 Successful Creators' : 'Top 5 Creatori de Succes'}
                  </h5>
                  <div className="space-y-3">
                    {result.topCreators.map((creator: any, idx: number) => (
                      <div key={idx} className="p-4 bg-gray-900/50 rounded-lg border border-gray-700/30">
                        <div className="flex items-start justify-between mb-2">
                          <h6 className="text-sm font-semibold text-white flex-1">
                            {creator.url ? (
                              <a 
                                href={creator.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="hover:text-blue-400 transition-colors"
                              >
                                {creator.name || `Creator ${idx + 1}`}
                              </a>
                            ) : (
                              creator.name || `Creator ${idx + 1}`
                            )}
                          </h6>
                          <span className="text-xs text-gray-400 ml-2">#{idx + 1}</span>
                        </div>
                        <div className="text-xs text-gray-400 space-y-1">
                          {creator.followers && (
                            <p><span className="text-gray-500">{settingsFormData.language === 'en' ? 'Followers' : 'Urmăritori'}:</span> <span className="text-blue-400">{creator.followers}</span></p>
                          )}
                          {creator.url && (
                            <p>
                              <a 
                                href={creator.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 underline flex items-center space-x-1"
                              >
                                <span>{settingsFormData.language === 'en' ? 'View Profile' : 'Vezi Profil'}</span>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                            </p>
                          )}
                          {creator.whatWorks && (
                            <p className="text-gray-300 mt-2"><span className="text-gray-500">{settingsFormData.language === 'en' ? 'What Works' : 'Ce face bine'}:</span> {creator.whatWorks}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </form>
      )
    }

    // Tool 3: Copywriting Publicitar (folosește datele din Tool 1 dacă există)
    if (toolId === 'copywriting') {
      const strategyData = toolResults['strategie-client']
      return (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                {settingsFormData.language === 'en' ? 'Content Type' : 'Tip Conținut'}
              </label>
              <select
                value={inputs.contentType || ''}
                onChange={(e) => updateInput('contentType', e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-800/80 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                required
              >
                <option value="">{settingsFormData.language === 'en' ? 'Select...' : 'Selectează...'}</option>
                <option value="ad">{settingsFormData.language === 'en' ? 'Ad' : 'Reclamă'}</option>
                <option value="post">{settingsFormData.language === 'en' ? 'Post' : 'Postare'}</option>
                <option value="article">{settingsFormData.language === 'en' ? 'Article' : 'Articol'}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                {settingsFormData.language === 'en' ? 'Platform' : 'Platformă'}
              </label>
              <select
                value={inputs.platform || ''}
                onChange={(e) => updateInput('platform', e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-800/80 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                required
              >
                <option value="">{settingsFormData.language === 'en' ? 'Select...' : 'Selectează...'}</option>
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
                <option value="tiktok">TikTok</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                {settingsFormData.language === 'en' ? 'Objective' : 'Obiectiv'}
              </label>
              <select
                value={inputs.objective || ''}
                onChange={(e) => updateInput('objective', e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-800/80 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                required
              >
                <option value="">{settingsFormData.language === 'en' ? 'Select...' : 'Selectează...'}</option>
                <option value="sales">{settingsFormData.language === 'en' ? 'Sales' : 'Vânzare'}</option>
                <option value="reach">{settingsFormData.language === 'en' ? 'Reach' : 'Vizibilitate'}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                {settingsFormData.language === 'en' ? 'Tone' : 'Ton'}
              </label>
              <select
                value={inputs.tone || ''}
                onChange={(e) => updateInput('tone', e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-800/80 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                required
              >
                <option value="">{settingsFormData.language === 'en' ? 'Select...' : 'Selectează...'}</option>
                <option value="serious">{settingsFormData.language === 'en' ? 'Serious' : 'Serios'}</option>
                <option value="casual">{settingsFormData.language === 'en' ? 'Casual' : 'Casual'}</option>
                <option value="premium">{settingsFormData.language === 'en' ? 'Premium' : 'Premium'}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              {settingsFormData.language === 'en' ? 'Describe what you want the text to be about' : 'Descrie despre ce vrei textul'}
            </label>
            <textarea
              value={inputs.description || ''}
              onChange={(e) => updateInput('description', e.target.value)}
              placeholder={settingsFormData.language === 'en' ? 'Describe your product, service, or what you want to promote...' : 'Descrie produsul, serviciul sau ce vrei să promovezi...'}
              className="w-full px-4 py-2.5 bg-gray-800/80 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 min-h-[100px] resize-y"
              required
            />
          </div>

          {strategyData && (
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-sm text-blue-400">
                {settingsFormData.language === 'en' 
                  ? 'Using data from Client Strategy tool' 
                  : 'Se folosesc datele din tool-ul Strategie de Client'}
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="relative w-full px-6 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>{settingsFormData.language === 'en' ? 'Processing...' : 'Se procesează...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>{settingsFormData.language === 'en' ? 'Generate Copywriting' : 'Generează Copywriting'}</span>
                <span className="ml-2 px-2 py-1 bg-white/20 rounded-lg text-xs font-semibold">
                  ({TOOL_COSTS['copywriting']} {settingsFormData.language === 'en' ? 'credits' : 'credite'})
                </span>
              </>
            )}
          </button>

          {result && (
            <div className="mt-6 p-6 bg-gray-800/50 rounded-lg border border-gray-700/50 space-y-4">
              <h4 className="text-lg font-bold text-white">{settingsFormData.language === 'en' ? 'Generated Texts' : 'Texte Generate'}</h4>
              {result.texts && Array.isArray(result.texts) && result.texts.map((item: any, idx: number) => {
                // Suport pentru format vechi (string) și format nou (object cu text și hashtags)
                const text = typeof item === 'string' ? item : item.text || '';
                const hashtags = typeof item === 'object' && item.hashtags ? item.hashtags : [];
                
                return (
                  <div key={idx} className="p-4 bg-gray-900/50 rounded-lg space-y-3">
                    <p className="text-white whitespace-pre-wrap">{text}</p>
                    {hashtags && hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-700/50">
                        {hashtags.map((hashtag: string, tagIdx: number) => (
                          <span key={tagIdx} className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
                            {hashtag}
                          </span>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={() => {
                        const textToCopy = text + (hashtags && hashtags.length > 0 ? '\n\n' + hashtags.join(' ') : '');
                        navigator.clipboard.writeText(textToCopy)
                        setNotification({ type: 'success', message: settingsFormData.language === 'en' ? 'Copied!' : 'Copiat!' })
                        setTimeout(() => setNotification(null), 2000)
                      }}
                      className="mt-2 px-3 py-1 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
                    >
                      {settingsFormData.language === 'en' ? 'Copy' : 'Copiază'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </form>
      )
    }

    // Tool 5: Planificare de Conținut
    if (toolId === 'planificare-conținut') {
      return (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                {settingsFormData.language === 'en' ? 'Period' : 'Perioadă'}
              </label>
              <select
                value={inputs.period || ''}
                onChange={(e) => updateInput('period', e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-800/80 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                required
              >
                <option value="">{settingsFormData.language === 'en' ? 'Select...' : 'Selectează...'}</option>
                <option value="7">{settingsFormData.language === 'en' ? '7 days' : '7 zile'}</option>
                <option value="14">{settingsFormData.language === 'en' ? '14 days' : '14 zile'}</option>
                <option value="30">{settingsFormData.language === 'en' ? '30 days' : '30 zile'}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                {settingsFormData.language === 'en' ? 'Main Platform' : 'Platformă Principală'}
              </label>
              <select
                value={inputs.platform || ''}
                onChange={(e) => updateInput('platform', e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-800/80 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                required
              >
                <option value="">{settingsFormData.language === 'en' ? 'Select...' : 'Selectează...'}</option>
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="facebook">Facebook</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-white mb-2">
                {settingsFormData.language === 'en' ? 'Objective' : 'Obiectiv'}
              </label>
              <select
                value={inputs.objective || ''}
                onChange={(e) => updateInput('objective', e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-800/80 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                required
              >
                <option value="">{settingsFormData.language === 'en' ? 'Select...' : 'Selectează...'}</option>
                <option value="sales">{settingsFormData.language === 'en' ? 'Sales' : 'Vânzări'}</option>
                <option value="visibility">{settingsFormData.language === 'en' ? 'Visibility' : 'Vizibilitate'}</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="relative w-full px-6 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>{settingsFormData.language === 'en' ? 'Processing...' : 'Se procesează...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>{settingsFormData.language === 'en' ? 'Generate Plan' : 'Generează Planul'}</span>
                <span className="ml-2 px-2 py-1 bg-white/20 rounded-lg text-xs font-semibold">
                  ({TOOL_COSTS['planificare-conținut']} {settingsFormData.language === 'en' ? 'credits' : 'credite'})
                </span>
              </>
            )}
          </button>

          {result && result.calendar && Array.isArray(result.calendar) && (() => {
            // Creează un map pentru a accesa rapid datele după zi
            const calendarMap = new Map<number, any>();
            result.calendar.forEach((day: any) => {
              const dayNum = typeof day.day === 'number' ? day.day : parseInt(day.day) || 0;
              if (dayNum > 0) {
                calendarMap.set(dayNum, day);
              }
            });

            // Găsește ziua maximă pentru a determina perioada
            const period = parseInt(inputs.period) || 30;
            const maxDay = Math.max(...Array.from(calendarMap.keys()), period);

            // Funcție pentru a obține tipul de postare pentru o zi
            const getDayPostType = (dayNum: number): string | null => {
              const dayData = calendarMap.get(dayNum);
              if (!dayData) return null;
              
              if (dayData.posts && dayData.posts.length > 0) {
                return dayData.posts[0].type || null;
              }
              
              if (dayData.stories && dayData.stories.length > 0) {
                return 'Story';
              }
              
              return 'Rest';
            };

            // Funcție pentru a obține culoarea badge-ului
            const getTypeColor = (type: string | null): string => {
              if (!type) return 'bg-gray-700/50 text-gray-300';
              
              const typeLower = type.toLowerCase();
              if (typeLower.includes('educativ') || typeLower.includes('educational')) {
                return 'bg-blue-500/20 text-blue-400';
              } else if (typeLower.includes('double')) {
                return 'bg-red-500/20 text-red-400';
              } else if (typeLower.includes('storytelling')) {
                return 'bg-purple-500/20 text-purple-400';
              } else if (typeLower.includes('social') || typeLower.includes('proof')) {
                return 'bg-green-500/20 text-green-400';
              } else if (typeLower.includes('serie') || typeLower.includes('series')) {
                return 'bg-pink-500/20 text-pink-400';
              } else if (typeLower === 'story') {
                return 'bg-purple-500/20 text-purple-400';
              } else if (typeLower === 'rest') {
                return 'bg-yellow-500/20 text-yellow-400';
              }
              return 'bg-gray-700/50 text-gray-300';
            };

            const handleDayClick = (dayNum: number) => {
              const dayData = calendarMap.get(dayNum);
              if (dayData) {
                setSelectedCalendarDay(dayNum);
                setSelectedCalendarDayData(dayData);
              } else {
                setSelectedCalendarDay(null);
                setSelectedCalendarDayData(null);
              }
            };

            return (
              <div className="mt-6 space-y-6 -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8">
                <h4 className="text-lg font-bold text-white">{settingsFormData.language === 'en' ? 'Content Calendar' : 'Calendar Conținut'}</h4>
                
                {/* Calendar Grid */}
                <div className="bg-gray-800/50 rounded-lg border border-gray-700/50 p-4 md:p-6">
                  <div className="grid grid-cols-7 gap-2 md:gap-3">
                    {/* Headers pentru zilele săptămânii */}
                    {['Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm', 'Dum'].map((day, idx) => (
                      <div key={idx} className="text-center text-xs font-semibold text-gray-400 pb-2">
                        {day}
                      </div>
                    ))}
                    
                    {/* Zilele calendarului */}
                    {Array.from({ length: maxDay }, (_, i) => {
                      const dayNum = i + 1;
                      const postType = getDayPostType(dayNum);
                      const dayData = calendarMap.get(dayNum);
                      const isSelected = selectedCalendarDay === dayNum;
                      const hasContent = dayData && (dayData.posts?.length > 0 || dayData.stories?.length > 0);
                      
                      return (
                        <motion.button
                          key={dayNum}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDayClick(dayNum);
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`
                            relative aspect-square p-1.5 md:p-2 rounded-lg border-2 transition-all min-h-[60px] md:min-h-[80px]
                            ${isSelected 
                              ? 'border-blue-500 bg-blue-500/20' 
                              : hasContent 
                                ? 'border-gray-600 bg-gray-700/30 hover:border-gray-500' 
                                : 'border-gray-700/30 bg-gray-800/30 hover:border-gray-600/50'
                            }
                          `}
                        >
                          <div className="text-xs md:text-sm font-semibold text-white mb-1">{dayNum}</div>
                          {postType && (
                            <div className={`text-[9px] md:text-[10px] px-1 md:px-1.5 py-0.5 rounded font-semibold leading-tight ${getTypeColor(postType)}`}>
                              {postType === 'Rest' ? 'Pauză' : postType.length > 10 ? postType.substring(0, 10) + '...' : postType}
                            </div>
                          )}
                          {dayData?.posts?.length > 1 && (
                            <div className="absolute top-1 right-1 w-2 h-2 bg-blue-400 rounded-full"></div>
                          )}
                          {dayData?.stories?.length > 0 && (
                            <div className="absolute top-1 left-1 w-2 h-2 bg-purple-400 rounded-full"></div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-blue-500/20 border border-blue-400/50"></div>
                    <span className="text-gray-400">{settingsFormData.language === 'en' ? 'Post' : 'Postare'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-purple-500/20 border border-purple-400/50"></div>
                    <span className="text-gray-400">{settingsFormData.language === 'en' ? 'Story' : 'Story'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-yellow-500/20 border border-yellow-400/50"></div>
                    <span className="text-gray-400">{settingsFormData.language === 'en' ? 'Rest Day' : 'Zi de Pauză'}</span>
                  </div>
                </div>

                {/* Detalii pentru ziua selectată */}
                {selectedCalendarDayData && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 bg-gray-800/50 rounded-lg border border-gray-700/50 space-y-4"
                  >
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-700/50">
                      <span className="text-lg font-bold text-white">
                        {settingsFormData.language === 'en' ? 'Day' : 'Zi'} {selectedCalendarDay}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedCalendarDay(null);
                          setSelectedCalendarDayData(null);
                        }}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                      {selectedCalendarDayData.notes && (
                        <span className="text-xs text-gray-400 italic ml-auto mr-4">{selectedCalendarDayData.notes}</span>
                      )}
                    </div>

                    {/* Postări */}
                    {selectedCalendarDayData.posts && Array.isArray(selectedCalendarDayData.posts) && selectedCalendarDayData.posts.length > 0 && (
                      <div className="space-y-3">
                        <h5 className="text-sm font-semibold text-blue-400 uppercase tracking-wide">
                          {settingsFormData.language === 'en' ? 'Posts' : 'Postări'}
                        </h5>
                        {selectedCalendarDayData.posts.map((post: any, postIdx: number) => (
                          <div key={postIdx} className="p-4 bg-gray-900/50 rounded-lg border border-gray-700/30 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${getTypeColor(post.type)}`}>
                                {post.type || 'N/A'}
                              </span>
                              {post.seriesPart && (
                                <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                                  {post.seriesPart}
                                </span>
                              )}
                              <span className="px-2 py-1 bg-gray-700/50 text-gray-300 rounded text-xs">
                                {post.format || 'N/A'}
                              </span>
                              <button
                                onClick={() => handleGenerateVideoFromCalendar(post)}
                                className="ml-auto px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                              >
                                <Video className="w-3.5 h-3.5" />
                                {settingsFormData.language === 'en' ? 'Generate Now' : 'Generează Acum'}
                              </button>
                            </div>
                            <p className="text-white font-medium">{post.content || ''}</p>
                            <p className="text-sm text-gray-400">{post.purpose || ''}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Story-uri */}
                    {selectedCalendarDayData.stories && Array.isArray(selectedCalendarDayData.stories) && selectedCalendarDayData.stories.length > 0 && (
                      <div className="space-y-3">
                        <h5 className="text-sm font-semibold text-purple-400 uppercase tracking-wide">
                          {settingsFormData.language === 'en' ? 'Stories' : 'Story-uri'}
                        </h5>
                        {selectedCalendarDayData.stories.map((story: any, storyIdx: number) => (
                          <div key={storyIdx} className="p-4 bg-gray-900/50 rounded-lg border border-purple-700/30 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs font-semibold">
                                {story.type || 'N/A'}
                              </span>
                              <span className="px-2 py-1 bg-gray-700/50 text-gray-300 rounded text-xs">
                                {story.format || 'N/A'}
                              </span>
                              <button
                                onClick={() => handleGenerateVideoFromCalendar(story)}
                                className="ml-auto px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                              >
                                <Video className="w-3.5 h-3.5" />
                                {settingsFormData.language === 'en' ? 'Generate Now' : 'Generează Acum'}
                              </button>
                            </div>
                            <p className="text-white font-medium">{story.content || ''}</p>
                            <p className="text-sm text-gray-400">{story.purpose || ''}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Zi de pauză */}
                    {(!selectedCalendarDayData.posts || selectedCalendarDayData.posts.length === 0) && (!selectedCalendarDayData.stories || selectedCalendarDayData.stories.length === 0) && (
                      <div className="p-4 bg-gray-900/30 rounded-lg border border-gray-700/20 border-dashed">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded text-sm font-semibold">
                            {settingsFormData.language === 'en' ? 'Rest Day' : 'Zi de Pauză'}
                          </span>
                          <p className="text-gray-400 text-sm italic">
                            {selectedCalendarDayData.notes || (settingsFormData.language === 'en' ? 'No content scheduled - rest day' : 'Fără conținut planificat - zi de pauză')}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Fallback pentru format vechi */}
                    {(!selectedCalendarDayData.posts || selectedCalendarDayData.posts.length === 0) && (!selectedCalendarDayData.stories || selectedCalendarDayData.stories.length === 0) && !selectedCalendarDayData.notes && selectedCalendarDayData.content && (
                      <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-400">{selectedCalendarDayData.format || ''}</span>
                        </div>
                        <p className="text-white mb-1">{selectedCalendarDayData.content || ''}</p>
                        <p className="text-sm text-gray-400">{selectedCalendarDayData.purpose || ''}</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            );
          })()}
        </form>
      )
    }

    // Tool 6: Strategie Video & Scripturi
    if (toolId === 'strategie-video') {
      return (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="group">
              <label className="block text-sm font-semibold text-gray-300 mb-2.5 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                {settingsFormData.language === 'en' ? 'Platform' : 'Platformă'}
              </label>
              <select
                value={inputs.platform || ''}
                onChange={(e) => updateInput('platform', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/60 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all hover:border-gray-500/70 shadow-lg"
                required
              >
                <option value="">{settingsFormData.language === 'en' ? 'Select...' : 'Selectează...'}</option>
                <option value="tiktok">TikTok</option>
                <option value="reels">Instagram Reels</option>
                <option value="shorts">YouTube Shorts</option>
              </select>
            </div>
            <div className="group">
              <label className="block text-sm font-semibold text-gray-300 mb-2.5 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                {settingsFormData.language === 'en' ? 'Style' : 'Stil'}
              </label>
              <select
                value={inputs.style || ''}
                onChange={(e) => updateInput('style', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/60 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all hover:border-gray-500/70 shadow-lg"
                required
              >
                <option value="">{settingsFormData.language === 'en' ? 'Select...' : 'Selectează...'}</option>
                <option value="educational">{settingsFormData.language === 'en' ? 'Educational' : 'Educativ'}</option>
                <option value="double-downs">{settingsFormData.language === 'en' ? 'Double Downs' : 'Double Downs'}</option>
                <option value="storytelling">{settingsFormData.language === 'en' ? 'Storytelling' : 'Storytelling'}</option>
                <option value="social-proof">{settingsFormData.language === 'en' ? 'Social Proof' : 'Social Proof'}</option>
                <option value="series">{settingsFormData.language === 'en' ? 'Series' : 'Serie'}</option>
              </select>
            </div>
            <div className="group">
              <label className="block text-sm font-semibold text-gray-300 mb-2.5 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                {settingsFormData.language === 'en' ? 'Duration' : 'Durață'}
              </label>
              <select
                value={inputs.duration || ''}
                onChange={(e) => updateInput('duration', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/60 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all hover:border-gray-500/70 shadow-lg"
                required
              >
                <option value="">{settingsFormData.language === 'en' ? 'Select...' : 'Selectează...'}</option>
                <option value="short">{settingsFormData.language === 'en' ? 'Short (15 sec)' : 'Scurt (15 sec)'}</option>
                <option value="medium">{settingsFormData.language === 'en' ? 'Medium (30-40 sec)' : 'Mediu (30-40 sec)'}</option>
                <option value="long">{settingsFormData.language === 'en' ? 'Long (60-70 sec)' : 'Lung (60-70 sec)'}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                {settingsFormData.language === 'en' ? 'Objective' : 'Obiectiv'}
              </label>
              <select
                value={inputs.objective || ''}
                onChange={(e) => updateInput('objective', e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-800/80 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                required
              >
                <option value="">{settingsFormData.language === 'en' ? 'Select...' : 'Selectează...'}</option>
                <option value="follow">{settingsFormData.language === 'en' ? 'Follow' : 'Urmărire'}</option>
                <option value="sales">{settingsFormData.language === 'en' ? 'Sales' : 'Vânzare'}</option>
              </select>
            </div>
          </div>

          <div className="group">
            <label className="block text-sm font-semibold text-gray-300 mb-2.5 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400"></div>
              {settingsFormData.language === 'en' ? 'Video Description' : 'Descriere Video'}
            </label>
            <textarea
              value={inputs.videoDescription || ''}
              onChange={(e) => updateInput('videoDescription', e.target.value)}
              placeholder={settingsFormData.language === 'en' ? 'Describe what the video should be about...' : 'Descrie despre ce ar trebui să fie clipul...'}
              className="w-full px-4 py-3 bg-gray-800/60 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all hover:border-gray-500/70 shadow-lg min-h-[120px] resize-y"
              required
            />
          </div>

          <div className="group">
            <label className="block text-sm font-semibold text-gray-300 mb-2.5 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
              {settingsFormData.language === 'en' ? 'Pain Point (Optional)' : 'Pain Point (Opțional)'}
            </label>
            <textarea
              value={inputs.painPoint || ''}
              onChange={(e) => updateInput('painPoint', e.target.value)}
              placeholder={settingsFormData.language === 'en' ? 'What problem does your audience have? (Optional)' : 'Ce problemă are audiența ta? (Opțional)'}
              className="w-full px-4 py-3 bg-gray-800/60 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all hover:border-gray-500/70 shadow-lg min-h-[100px] resize-y"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="relative w-full px-6 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>{settingsFormData.language === 'en' ? 'Processing...' : 'Se procesează...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>{settingsFormData.language === 'en' ? 'Generate Video Strategy' : 'Generează Strategia Video'}</span>
                <span className="ml-2 px-2 py-1 bg-white/20 rounded-lg text-xs font-semibold">
                  ({TOOL_COSTS['strategie-video']} {settingsFormData.language === 'en' ? 'credits' : 'credite'})
                </span>
              </>
            )}
          </button>

          {result && result.videoIdeas && Array.isArray(result.videoIdeas) && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-white">{settingsFormData.language === 'en' ? 'Video Ideas' : 'Idei de Clipuri'}</h4>
                <div className="flex items-center space-x-3">
                  {savedResultIds[toolId] ? (
                    <div className="flex items-center space-x-2 text-xs text-green-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{settingsFormData.language === 'en' ? 'Saved' : 'Salvat'}</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => saveResult(toolId, result, inputs)}
                      disabled={savingResult[toolId]}
                      className="px-4 py-1.5 text-xs bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded-lg text-green-400 hover:text-green-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {savingResult[toolId] ? (
                        <>
                          <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>{settingsFormData.language === 'en' ? 'Saving...' : 'Se salvează...'}</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{settingsFormData.language === 'en' ? 'Save Strategy' : 'Salvează Strategia'}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
              {result.videoIdeas.map((idea: any, idx: number) => (
                <div key={idx} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
                  <h5 className="font-semibold text-white mb-3">{settingsFormData.language === 'en' ? 'Idea' : 'Idee'} {idx + 1}</h5>
                  
                  {idea.hook && (
                    <div className="mb-3">
                      <p className="text-blue-400 font-semibold mb-1">{settingsFormData.language === 'en' ? 'Hook' : 'Hook'}:</p>
                      {idea.hook.verbal && (
                        <p className="text-white mb-1"><strong>{settingsFormData.language === 'en' ? 'Verbal' : 'Verbal'}:</strong> {idea.hook.verbal}</p>
                      )}
                      {idea.hook.written && (
                        <p className="text-gray-300 mb-1"><strong>{settingsFormData.language === 'en' ? 'Written (on screen)' : 'Scris (pe ecran)'}:</strong> {idea.hook.written}</p>
                      )}
                    </div>
                  )}
                  
                  {idea.content && (
                    <div className="mb-3">
                      <p className="text-purple-400 font-semibold mb-1">{settingsFormData.language === 'en' ? 'Content (Full Script)' : 'Conținut (Script Complet)'}:</p>
                      <div className="text-white whitespace-pre-wrap bg-gray-900/50 p-3 rounded border border-gray-700/30">
                        {idea.content}
                      </div>
                    </div>
                  )}
                  
                  {idea.format && (
                    <div className="mb-3">
                      <p className="text-yellow-400 font-semibold mb-1">{settingsFormData.language === 'en' ? 'Format' : 'Format'}:</p>
                      <p className="text-white">{idea.format}</p>
                    </div>
                  )}
                  
                  {idea.cta && (
                    <div className="mb-3">
                      <p className="text-green-400 font-semibold mb-1">{settingsFormData.language === 'en' ? 'CTA' : 'CTA'}:</p>
                      <p className="text-white">{idea.cta}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Buton pentru rezultate salvate */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              const willShow = !showSavedResults[toolId]
              setShowSavedResults(prev => ({ ...prev, [toolId]: willShow }))
              // Dacă deschidem lista și nu avem date încărcate, le încărcăm
              if (willShow && (!savedResults[toolId] || savedResults[toolId].length === 0)) {
                loadSavedResults(toolId)
              }
            }}
            className="w-full mt-3 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 rounded-lg text-gray-300 hover:text-white transition-colors flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <span className="text-sm font-medium">
              {settingsFormData.language === 'en' ? 'Saved Strategies' : 'Strategii Salvate'}
            </span>
            {loadingSavedResults[toolId] && (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
          </button>

          {/* Lista de rezultate salvate */}
          {showSavedResults[toolId] && (
            <div className="mt-6 space-y-3">
              <h4 className="text-lg font-bold text-white mb-3">
                {settingsFormData.language === 'en' ? 'Saved Strategies' : 'Strategii Salvate'}
                {savedResults[toolId] && savedResults[toolId].length > 0 && (
                  <span className="ml-2 text-sm text-gray-400">({savedResults[toolId].length})</span>
                )}
              </h4>
              
              {loadingSavedResults[toolId] ? (
                <div className="text-center py-8">
                  <svg className="animate-spin h-8 w-8 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : savedResults[toolId] && savedResults[toolId].length > 0 ? (
                savedResults[toolId].map((saved: any) => {
                  let savedResult: any = null
                  try {
                    savedResult = typeof saved.result === 'string' ? JSON.parse(saved.result) : saved.result
                    if (savedResult?.result) {
                      savedResult = savedResult.result
                    }
                  } catch (e) {
                    console.error('Error parsing saved result:', e)
                  }

                  return (
                    <motion.div
                      key={saved.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-colors cursor-pointer"
                      onClick={() => {
                        if (savedResult && savedResult.videoIdeas) {
                          setToolResults(prev => ({ ...prev, [toolId]: savedResult }))
                          setShowSavedResults(prev => ({ ...prev, [toolId]: false }))
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white mb-1">
                            {getSavedResultTitle(saved, toolId)}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(saved.created_at).toLocaleDateString(settingsFormData.language === 'en' ? 'en-US' : 'ro-RO', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                          {savedResult?.videoIdeas && Array.isArray(savedResult.videoIdeas) && (
                            <p className="text-xs text-gray-500 mt-1">
                              {savedResult.videoIdeas.length} {settingsFormData.language === 'en' ? 'video ideas' : 'idei de clipuri'}
                            </p>
                          )}
                        </div>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </motion.div>
                  )
                })
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p>{settingsFormData.language === 'en' ? 'No saved strategies yet. Generate a strategy to save it here.' : 'Nu există strategii salvate încă. Generează o strategie pentru a o salva aici.'}</p>
                </div>
              )}
            </div>
          )}
        </form>
      )
    }

    // Default placeholder pentru tool-uri care nu au încă interfață
    return (
      <div className="mt-8 p-6 bg-gray-800/50 rounded-lg border border-gray-700/50">
        <p className="text-gray-400 text-center">
          {settingsFormData.language === 'en' 
            ? 'Tool interface coming soon...' 
            : 'Interfața tool-ului va fi disponibilă în curând...'}
        </p>
      </div>
    )
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
        const successMessage = settingsFormData.language === 'en'
          ? 'Text generated successfully!'
          : 'Text generat cu succes!'
        setNotification({ type: 'success', message: successMessage })
        addNotification('success', successMessage)
        setTimeout(() => setNotification(null), 3000)
        // Reîncarcă datele pentru a reflecta scăderea creditelor și actualizarea statisticilor
        await loadUserData(user.id)
      } else {
        // Dacă generarea a eșuat, nu se deduc credite, dar reîncarcă datele pentru statistici
        const errorMessage = result.error || (settingsFormData.language === 'en' ? 'Error generating text' : 'Eroare la generarea textului')
        setGeneratedTextError(errorMessage)
        addNotification('error', errorMessage)
        await loadUserData(user.id)
      }
    } catch (error) {
      console.error('Error generating text:', error)
      const errorMessage = error instanceof Error ? error.message : (settingsFormData.language === 'en' ? 'Error generating text' : 'Eroare la generarea textului')
      setGeneratedTextError(errorMessage)
      addNotification('error', errorMessage)
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
          const successMessage = settingsFormData.language === 'en'
            ? 'Ad generated successfully!'
            : 'Reclama a fost generată cu succes!'
          setNotification({ type: 'success', message: successMessage })
          addNotification('success', successMessage)
          setTimeout(() => setNotification(null), 3000)
        } else if (result.data?.taskId) {
          const processingMessage = settingsFormData.language === 'en'
            ? `Ad is processing (Task ID: ${result.data.taskId})`
            : `Reclama este în procesare (Task ID: ${result.data.taskId})`
          setGeneratedImageError(processingMessage)
          addNotification('info', processingMessage)
        } else {
          const sentMessage = settingsFormData.language === 'en'
            ? 'Request sent successfully'
            : 'Cererea a fost trimisă cu succes'
          setGeneratedImageError(sentMessage)
          addNotification('info', sentMessage)
        }
        // Reîncarcă datele pentru a reflecta scăderea creditelor și actualizarea statisticilor
        await loadUserData(user.id)
      } else {
        // Dacă generarea a eșuat, nu se deduc credite, dar reîncarcă datele pentru statistici
        const errorMessage = result.error || (settingsFormData.language === 'en' ? 'Error generating ad' : 'Eroare la generarea reclamei')
        setGeneratedImageError(errorMessage)
        addNotification('error', errorMessage)
        await loadUserData(user.id)
      }
    } catch (error) {
      console.error('Error generating ad:', error)
      const errorMessage = error instanceof Error ? error.message : (settingsFormData.language === 'en' ? 'Error generating ad' : 'Eroare la generarea reclamei')
      setGeneratedImageError(errorMessage)
      addNotification('error', errorMessage)
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

  // Onboarding - dacă utilizatorul nu are business_type setat
  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl"
        >
          <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 mb-4"
              >
                <Sparkles className="w-8 h-8 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {settingsFormData.language === 'en' ? 'Welcome! Tell us about your business' : 'Bun venit! Spune-ne despre afacerea ta'}
              </h2>
              <p className="text-gray-400">
                {settingsFormData.language === 'en' 
                  ? 'This information helps us generate better content for your business' 
                  : 'Aceste informații ne ajută să generăm conținut mai bun pentru afacerea ta'}
              </p>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault()
              if (!user) return
              
              setSavingOnboarding(true)
              try {
                // Pasul 1: Salvează informațiile despre business
                const { error: profileError } = await supabase
                  .from('user_profiles')
                  .update({
                    business_type: onboardingData.business_type.trim(),
                    business_description: onboardingData.business_description.trim(),
                    updated_at: new Date().toISOString(),
                  })
                  .eq('id', user.id)

                if (profileError) throw profileError

                // Nu mai generăm strategia automat - doar salvăm datele pentru uz ulterior

                // Reîncarcă profilul din baza de date pentru a actualiza starea
                const { data: updatedProfile } = await supabase
                  .from('user_profiles')
                  .select('*')
                  .eq('id', user.id)
                  .single()

                if (updatedProfile) {
                  setUserProfile(updatedProfile)
                  // Actualizează și formularul de profil
                  setProfileFormData({
                    full_name: updatedProfile.full_name || '',
                    phone: updatedProfile.phone || '',
                    bio: updatedProfile.bio || '',
                    avatar_url: updatedProfile.avatar_url || '',
                    business_type: updatedProfile.business_type || '',
                    business_description: updatedProfile.business_description || '',
                  })
                  
                  // Verifică din nou dacă trebuie să afișeze onboarding
                  const hasBusinessInfo = updatedProfile.business_type && updatedProfile.business_description
                  if (hasBusinessInfo) {
                    // Dacă datele sunt salvate, ascunde onboarding-ul
                    setShowOnboarding(false)
                  } else {
                    setShowOnboarding(false)
                  }
                } else {
                  setShowOnboarding(false)
                }
                setNotification({ 
                  type: 'success', 
                  message: settingsFormData.language === 'en' 
                    ? 'Business information saved!'
                    : 'Informațiile despre afacere au fost salvate!'
                })
                setTimeout(() => setNotification(null), 5000)
              } catch (error: any) {
                console.error('Error saving onboarding:', error)
                setNotification({ 
                  type: 'error', 
                  message: error.message || (settingsFormData.language === 'en' ? 'Failed to save information' : 'Eroare la salvarea informațiilor')
                })
                setTimeout(() => setNotification(null), 5000)
              } finally {
                setSavingOnboarding(false)
              }
            }} className="space-y-6">
              {/* Business Type */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  {settingsFormData.language === 'en' ? 'Business Type' : 'Tip Business'} *
                </label>
                <input
                  type="text"
                  value={onboardingData.business_type}
                  onChange={(e) => setOnboardingData({ ...onboardingData, business_type: e.target.value })}
                  placeholder={settingsFormData.language === 'en' ? 'e.g., Service auto, Restaurant, E-commerce' : 'ex: Service auto, Restaurant, E-commerce'}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50"
                  required
                />
              </div>

              {/* Business Description */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  {settingsFormData.language === 'en' ? 'Business Description' : 'Descriere Business'} *
                </label>
                <textarea
                  value={onboardingData.business_description}
                  onChange={(e) => setOnboardingData({ ...onboardingData, business_description: e.target.value })}
                  placeholder={settingsFormData.language === 'en' ? 'Describe your business in detail...' : 'Descrie afacerea ta în detaliu...'}
                  rows={5}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 resize-none"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  {settingsFormData.language === 'en' 
                    ? 'This information helps AI generate more relevant content for your business' 
                    : 'Această informație ajută AI-ul să genereze conținut mai relevant pentru afacerea ta'}
                </p>
              </div>

              {/* Separator pentru strategie */}
              <div className="pt-4 border-t border-gray-700/50">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-400" />
                  {settingsFormData.language === 'en' ? 'Client Strategy' : 'Strategie Client'}
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  {settingsFormData.language === 'en'
                    ? 'Help us understand your target audience and business goals'
                    : 'Ajută-ne să înțelegem audiența țintă și obiectivele afacerii tale'}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      {settingsFormData.language === 'en' ? 'Business Type / Product' : 'Tip Afacere / Produs'} *
                    </label>
                    <input
                      type="text"
                      value={onboardingData.businessType}
                      onChange={(e) => setOnboardingData({ ...onboardingData, businessType: e.target.value })}
                      placeholder={settingsFormData.language === 'en' ? 'e.g., Premium organic tea' : 'ex: Ceai organic premium'}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      {settingsFormData.language === 'en' ? 'Sells Online or Local' : 'Vinde Online sau Local'} *
                    </label>
                    <select
                      value={onboardingData.sellType}
                      onChange={(e) => setOnboardingData({ ...onboardingData, sellType: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50"
                      required
                    >
                      <option value="">{settingsFormData.language === 'en' ? 'Select...' : 'Selectează...'}</option>
                      <option value="online">{settingsFormData.language === 'en' ? 'Online' : 'Online'}</option>
                      <option value="local">{settingsFormData.language === 'en' ? 'Local' : 'Local'}</option>
                      <option value="both">{settingsFormData.language === 'en' ? 'Both' : 'Ambele'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      {settingsFormData.language === 'en' ? 'Price Range' : 'Preț'} *
                    </label>
                    <select
                      value={onboardingData.priceRange}
                      onChange={(e) => setOnboardingData({ ...onboardingData, priceRange: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50"
                      required
                    >
                      <option value="">{settingsFormData.language === 'en' ? 'Select...' : 'Selectează...'}</option>
                      <option value="low">{settingsFormData.language === 'en' ? 'Low' : 'Mic'}</option>
                      <option value="medium">{settingsFormData.language === 'en' ? 'Medium' : 'Mediu'}</option>
                      <option value="high">{settingsFormData.language === 'en' ? 'High' : 'Mare'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      {settingsFormData.language === 'en' ? 'Target Audience' : 'Cui Vinde'} *
                    </label>
                    <select
                      value={onboardingData.targetAudience}
                      onChange={(e) => setOnboardingData({ ...onboardingData, targetAudience: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50"
                      required
                    >
                      <option value="">{settingsFormData.language === 'en' ? 'Select...' : 'Selectează...'}</option>
                      <option value="B2C">B2C</option>
                      <option value="B2B">B2B</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-white mb-2">
                      {settingsFormData.language === 'en' ? 'Main Objective' : 'Obiectiv Principal'} *
                    </label>
                    <select
                      value={onboardingData.objective}
                      onChange={(e) => setOnboardingData({ ...onboardingData, objective: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50"
                      required
                    >
                      <option value="">{settingsFormData.language === 'en' ? 'Select...' : 'Selectează...'}</option>
                      <option value="sales">{settingsFormData.language === 'en' ? 'Sales' : 'Vânzări'}</option>
                      <option value="leads">{settingsFormData.language === 'en' ? 'Leads' : 'Lead-uri'}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Rezultat strategie dacă există */}
              {onboardingStrategyResult && (
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-sm text-green-400 font-semibold mb-2">
                    {settingsFormData.language === 'en' ? '✅ Strategy generated successfully!' : '✅ Strategia a fost generată cu succes!'}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={savingOnboarding}
                whileHover={{ scale: savingOnboarding ? 1 : 1.02 }}
                whileTap={{ scale: savingOnboarding ? 1 : 0.98 }}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {savingOnboarding || generatingStrategy ? (
                  <>
                    <motion.div
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    <span>
                      {generatingStrategy 
                        ? (settingsFormData.language === 'en' ? 'Generating strategy...' : 'Se generează strategia...')
                        : (settingsFormData.language === 'en' ? 'Saving...' : 'Se salvează...')
                      }
                    </span>
                  </>
                ) : (
                  <span>{settingsFormData.language === 'en' ? 'Continue & Generate Strategy' : 'Continuă & Generează Strategia'}</span>
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    )
  }

  // Rest of the component remains the same...
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: sidebarOpen ? 0 : -280 }}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        transition={{ duration: 0.3 }}
        className="fixed lg:static inset-y-0 left-0 z-40 w-72 bg-gradient-to-b from-gray-900/95 to-gray-800/95 backdrop-blur-xl border-r border-gray-800/50 flex flex-col h-screen"
      >
        {/* Logo & Header */}
        <div className="p-6 border-b border-gray-800/50 flex-shrink-0">
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
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto min-h-0">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id && activeTool === null
            return (
              <motion.button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id)
                  setActiveTool(null)
                  setUserMenuSection(null) // Reset userMenuSection când se selectează o secțiune din meniu
                  setUserMenuOpen(false)
                  // Închide sidebar-ul doar pe mobile
                  if (window.innerWidth < 1024) {
                    setSidebarOpen(false)
                  }
                }}
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

          {/* Tool Groups */}
          {activeSection === 'tooluri' && (
            <div className="mt-4 space-y-2">
              {toolGroups.map((group) => {
                const GroupIcon = group.icon
                const isExpanded = expandedGroups.has(group.id)
                const groupName = settingsFormData.language === 'en' ? group.nameEn : group.name
                
                return (
                  <div key={group.id} className="space-y-1">
                    <motion.button
                      onClick={() => toggleGroup(group.id)}
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <GroupIcon className="w-4 h-4" />
                        <span className="font-medium text-sm">{groupName}</span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </motion.button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden pl-4 space-y-1"
                        >
                          {group.tools.map((tool) => {
                            const ToolIcon = tool.icon
                            const isToolActive = activeTool === tool.id
                            const toolName = settingsFormData.language === 'en' ? tool.nameEn : tool.name
                            
                            return (
                              <motion.button
                                key={tool.id}
                                onClick={() => {
                                  setActiveTool(tool.id)
                                  setActiveSection('tooluri')
                                  // Închide sidebar-ul doar pe mobile
                                  if (window.innerWidth < 1024) {
                                    setSidebarOpen(false)
                                  }
                                }}
                                whileHover={{ x: 2 }}
                                whileTap={{ scale: 0.98 }}
                                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all text-sm ${
                                  isToolActive
                                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-white'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                                }`}
                              >
                                <ToolIcon className="w-3.5 h-3.5" />
                                <span className="font-medium">{toolName}</span>
                              </motion.button>
                            )
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          )}
        </nav>

        {/* User Section - Fixată în partea de jos */}
        {user && (
          <div className="p-4 border-t border-gray-800/50 space-y-2 flex-shrink-0 bg-gradient-to-b from-gray-900/95 to-gray-800/95">
            {/* Butoane Loguri și Credite */}
            <div className="space-y-2 mb-3">
              <motion.button
                onClick={() => {
                  setActiveSection('logs')
                  setUserMenuSection(null) // Reset userMenuSection când se selectează logs
                  setUserMenuOpen(false)
                  // Închide sidebar-ul doar pe mobile
                  if (window.innerWidth < 1024) {
                    setSidebarOpen(false)
                  }
                }}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  activeSection === 'logs'
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span className="font-medium">{t('logs')}</span>
              </motion.button>
              <motion.button
                onClick={() => {
                  setActiveSection('credite')
                  setUserMenuSection(null) // Reset userMenuSection când se selectează credite
                  setUserMenuOpen(false)
                  // Închide sidebar-ul doar pe mobile
                  if (window.innerWidth < 1024) {
                    setSidebarOpen(false)
                  }
                }}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  activeSection === 'credite'
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <Coins className="w-5 h-5" />
                <span className="font-medium">{t('credits')}</span>
              </motion.button>
            </div>

            {/* Nume Utilizator - Clickabil */}
            <div className="relative">
              <motion.button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center space-x-3 px-4 py-3 bg-gray-800/50 rounded-lg mb-3 hover:bg-gray-800/70 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                  <UserIcon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-semibold text-white truncate">
                    {userProfile?.full_name || user?.email?.split('@')[0] || 'Utilizator'}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{user?.email || ''}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </motion.button>

              {/* Dropdown pentru Setări și Profil */}
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden mb-3"
                  >
                    <div className="space-y-2 bg-gray-800/30 rounded-lg p-2">
                      <motion.button
                        onClick={() => {
                          setUserMenuSection('setari')
                          setActiveSection('tooluri') // Setăm la tooluri dar nu se va afișa datorită condiției !userMenuSection
                          setUserMenuOpen(false)
                          // Închide sidebar-ul doar pe mobile
                          if (window.innerWidth < 1024) {
                            setSidebarOpen(false)
                          }
                        }}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-all ${
                          userMenuSection === 'setari'
                            ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-white'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                        }`}
                      >
                        <Settings className="w-4 h-4" />
                        <span className="font-medium text-sm">{t('settings')}</span>
                      </motion.button>
                      <motion.button
                        onClick={() => {
                          setUserMenuSection('profil')
                          setActiveSection('tooluri') // Setăm la tooluri dar nu se va afișa datorită condiției !userMenuSection
                          setUserMenuOpen(false)
                          // Închide sidebar-ul doar pe mobile
                          if (window.innerWidth < 1024) {
                            setSidebarOpen(false)
                          }
                        }}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-all ${
                          userMenuSection === 'profil'
                            ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-white'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                        }`}
                      >
                        <UserIcon className="w-4 h-4" />
                        <span className="font-medium text-sm">{t('profile')}</span>
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Buton +10 Credite */}
            <button
              onClick={handleAddTestCredits}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-green-400 hover:text-green-300 hover:bg-green-500/30 transition-all"
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
                  {activeTool 
                    ? (() => {
                        const tool = toolGroups.flatMap(g => g.tools).find(t => t.id === activeTool)
                        return tool ? (settingsFormData.language === 'en' ? tool.nameEn : tool.name) : ''
                      })()
                    : userMenuSection === 'setari' 
                    ? t('settings')
                    : userMenuSection === 'profil'
                    ? t('profile')
                    : menuItems.find((item) => item.id === activeSection)?.label || 
                      (activeSection === 'logs' ? t('logs') : activeSection === 'credite' ? t('credits') : '')}
                </h2>
              </div>
              <div className="flex items-center space-x-4">
                {/* Search */}
                <div className="hidden md:flex relative">
                  <div className="flex items-center space-x-2 px-4 py-2 bg-gray-800/50 rounded-lg border border-gray-700/50 focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                    <Search className="w-4 h-4 text-gray-400" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder={settingsFormData.language === 'en' ? 'Search...' : 'Caută...'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => {
                        if (searchResults.length > 0) {
                          setShowSearchResults(true)
                        }
                      }}
                      className="bg-transparent border-none outline-none text-white placeholder-gray-400 text-sm w-48"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => {
                          setSearchQuery('')
                          setShowSearchResults(false)
                          searchInputRef.current?.focus()
                        }}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  {/* Rezultate căutare */}
                  {showSearchResults && searchResults.length > 0 && (
                    <motion.div
                      ref={searchResultsRef}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 mt-2 w-96 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto"
                    >
                      <div className="p-2">
                        <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-700/50 mb-1">
                          {settingsFormData.language === 'en' ? 'Search Results' : 'Rezultate Căutare'} ({searchResults.length})
                        </div>
                        {searchResults.map((result, index) => {
                          const Icon = result.icon
                          return (
                            <motion.button
                              key={`${result.type}-${result.id}-${index}`}
                              onClick={result.action}
                              whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                              className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-blue-500/10 transition-colors text-left group"
                            >
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0 group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all">
                                <Icon className="w-5 h-5 text-blue-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                                    {result.title}
                                  </h4>
                                  <span className="px-2 py-0.5 bg-gray-700/50 text-xs text-gray-400 rounded">
                                    {result.category}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-400 line-clamp-1">
                                  {result.description}
                                </p>
                              </div>
                              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors flex-shrink-0 mt-1" />
                            </motion.button>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}
                  
                  {showSearchResults && searchQuery && searchResults.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-full left-0 mt-2 w-96 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl z-50 p-4"
                    >
                      <p className="text-sm text-gray-400 text-center">
                        {settingsFormData.language === 'en' 
                          ? 'No results found' 
                          : 'Nu s-au găsit rezultate'}
                      </p>
                    </motion.div>
                  )}
                </div>
                {/* Notifications */}
                <div className="relative">
                  <motion.button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <Bell className="w-5 h-5" />
                    {notifications.filter(n => !n.read).length > 0 && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
                    )}
                    {notifications.filter(n => !n.read).length > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                        {notifications.filter(n => !n.read).length > 9 ? '9+' : notifications.filter(n => !n.read).length}
                      </span>
                    )}
                  </motion.button>
                  
                  {/* Dropdown Notificări */}
                  {notificationsOpen && (
                    <motion.div
                      ref={notificationsRef}
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl z-50 max-h-96 overflow-hidden flex flex-col"
                    >
                      {/* Header */}
                      <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <Bell className="w-4 h-4" />
                          {settingsFormData.language === 'en' ? 'Notifications' : 'Notificări'}
                          {notifications.filter(n => !n.read).length > 0 && (
                            <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">
                              {notifications.filter(n => !n.read).length}
                            </span>
                          )}
                        </h3>
                        {notifications.length > 0 && (
                          <button
                            onClick={clearAllNotifications}
                            className="text-xs text-gray-400 hover:text-white transition-colors"
                          >
                            {settingsFormData.language === 'en' ? 'Clear all' : 'Șterge toate'}
                          </button>
                        )}
                      </div>
                      
                      {/* Lista notificări */}
                      <div className="overflow-y-auto flex-1">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center">
                            <Bell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                            <p className="text-sm text-gray-400">
                              {settingsFormData.language === 'en' 
                                ? 'No notifications' 
                                : 'Nu există notificări'}
                            </p>
                          </div>
                        ) : (
                          <div className="divide-y divide-gray-700/50">
                            {notifications.map((notif) => {
                              const getIcon = () => {
                                switch (notif.type) {
                                  case 'success':
                                    return <CheckCircle className="w-5 h-5 text-green-400" />
                                  case 'error':
                                    return <XCircle className="w-5 h-5 text-red-400" />
                                  case 'warning':
                                    return <Clock className="w-5 h-5 text-yellow-400" />
                                  default:
                                    return <Bell className="w-5 h-5 text-blue-400" />
                                }
                              }
                              
                              const getBgColor = () => {
                                switch (notif.type) {
                                  case 'success':
                                    return 'bg-green-500/10 border-green-500/20'
                                  case 'error':
                                    return 'bg-red-500/10 border-red-500/20'
                                  case 'warning':
                                    return 'bg-yellow-500/10 border-yellow-500/20'
                                  default:
                                    return 'bg-blue-500/10 border-blue-500/20'
                                }
                              }
                              
                              return (
                                <motion.div
                                  key={notif.id}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  className={`p-3 hover:bg-gray-800/50 transition-colors cursor-pointer ${!notif.read ? 'bg-gray-800/30' : ''}`}
                                  onClick={() => markNotificationAsRead(notif.id)}
                                >
                                  <div className="flex items-start gap-3">
                                    <div className={`w-8 h-8 rounded-lg ${getBgColor()} flex items-center justify-center flex-shrink-0`}>
                                      {getIcon()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm text-white leading-relaxed">{notif.message}</p>
                                      <p className="text-xs text-gray-500 mt-1">
                                        {new Date(notif.timestamp).toLocaleString(settingsFormData.language === 'en' ? 'en-US' : 'ro-RO', {
                                          month: 'short',
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </p>
                                    </div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        removeNotification(notif.id)
                                      }}
                                      className="text-gray-500 hover:text-white transition-colors flex-shrink-0"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                </motion.div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
                {/* Credits Badge & Buy Button */}
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg">
                    <Coins className="w-5 h-5 text-purple-400" />
                    <span className="text-sm font-bold text-white">{currentCredits}</span>
                    <span className="text-xs text-gray-400">credite</span>
                  </div>
                  <motion.button
                    onClick={() => router.push('/preturi')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span className="text-sm">{settingsFormData.language === 'en' ? 'Buy Credits' : 'Cumpără Credite'}</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area - Simplified for now, add rest of sections as needed */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            {/* Tool Individual View */}
            {activeSection === 'tooluri' && activeTool && !userMenuSection && (
              <motion.div
                key={activeTool}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {(() => {
                  const tool = toolGroups.flatMap(g => g.tools).find(t => t.id === activeTool)
                  if (!tool) return null
                  
                  const ToolIcon = tool.icon
                  const toolName = settingsFormData.language === 'en' ? tool.nameEn : tool.name
                  const toolDescription = settingsFormData.language === 'en' ? tool.descriptionEn : tool.description
                  
                  // Dacă este tool-ul "Design Publicitar", afișăm direct formularul de generare reclamă
                  if (activeTool === 'design-publicitar') {
                    return (
                      <div className="w-full max-w-4xl space-y-6">
                        {/* Header îmbunătățit pentru Design Publicitar */}
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-blue-600/10 rounded-2xl blur-2xl animate-pulse"></div>
                          <div className="relative bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 md:p-8 shadow-2xl overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl"></div>
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500/5 rounded-full blur-3xl"></div>
                            
                            <button
                              onClick={() => {
                                setActiveTool(null)
                                setPrompt('')
                                setImage(null)
                                setImagePreview(null)
                                setGeneratedImageUrl(null)
                                setGeneratedImageError(null)
                                setShowAdvanced(false)
                              }}
                              className="relative flex items-center space-x-2 text-gray-400 hover:text-white mb-6 transition-all hover:translate-x-[-4px] group z-10"
                            >
                              <ArrowLeft className="w-4 h-4 group-hover:translate-x-[-2px] transition-transform" />
                              <span className="text-sm font-medium">
                                {settingsFormData.language === 'en' ? '← Back to Tools' : '← Înapoi la Tooluri'}
                              </span>
                            </button>

                            <div className="relative flex flex-col md:flex-row items-start gap-5 md:gap-6 z-10">
                              <div className="relative">
                                <motion.div
                                  animate={{ rotate: [0, 5, -5, 0] }}
                                  transition={{ duration: 4, repeat: Infinity, repeatDelay: 2 }}
                                  className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-xl blur-lg"
                                ></motion.div>
                                <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/30 shadow-lg">
                                  <ToolIcon className="w-10 h-10 md:w-12 md:h-12 text-purple-400" />
                                </div>
                              </div>
                              <div className="flex-1 pt-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-2xl md:text-3xl font-bold text-white bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent">
                                    {toolName}
                                  </h3>
                                  <div className="px-3 py-1 bg-purple-500/20 border border-purple-400/30 rounded-lg">
                                    <span className="text-xs font-semibold text-purple-300">
                                      {IMAGE_GENERATION_COST} {settingsFormData.language === 'en' ? 'credits' : 'credite'}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-gray-300 text-base md:text-lg leading-relaxed mb-3">{toolDescription}</p>
                                <div className="flex items-center gap-2 text-sm text-purple-400/80">
                                  <Sparkles className="w-4 h-4" />
                                  <span className="font-medium">
                                    {settingsFormData.language === 'en'
                                      ? 'Pro tip: Contrast makes text stand out'
                                      : 'Sfat pro: Contrastul face textul să iasă în evidență'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Formular în container îmbunătățit */}
                        <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 md:p-8 shadow-xl">
                        
                        {/* Formular de generare reclamă - afișat direct */}
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
                        </form>
                        </div>
                      </div>
                    )
                  }
                  
                  // Pentru celelalte tool-uri, afișăm interfața specifică
                  // Definește tool-urile conectate și tips pentru fiecare tool
                  const getToolTips = (toolId: ToolId): string[] => {
                    const tips: Record<ToolId, { ro: string[], en: string[] }> = {
                      'strategie-client': {
                        ro: [
                          '💡 Fii specific despre problema pe care o rezolvi',
                          '🎯 Gândește-te la ce îi face pe clienți să cumpere',
                          '✨ Mesajul tău trebuie să fie clar și memorabil'
                        ],
                        en: [
                          '💡 Be specific about the problem you solve',
                          '🎯 Think about what makes clients buy',
                          '✨ Your message needs to be clear and memorable'
                        ]
                      },
                      'analiza-piata': {
                        ro: [
                          '🔍 Uită-te la ce funcționează pentru competitori',
                          '📊 Identifică pattern-uri în strategiile de succes',
                          '🚀 Găsește oportunități unice pentru brand-ul tău'
                        ],
                        en: [
                          '🔍 Look at what works for competitors',
                          '📊 Identify patterns in successful strategies',
                          '🚀 Find unique opportunities for your brand'
                        ]
                      },
                      'strategie-video': {
                        ro: [
                          '🎬 Primele 3 secunde sunt cruciale!',
                          '📱 Adaptează conținutul pentru platformă',
                          '💬 Păstrează mesajul simplu și direct'
                        ],
                        en: [
                          '🎬 The first 3 seconds are crucial!',
                          '📱 Adapt content for the platform',
                          '💬 Keep the message simple and direct'
                        ]
                      },
                      'copywriting': {
                        ro: [
                          '✍️ Scrie ca și cum ai vorbi cu un prieten',
                          '🎯 Un call-to-action clar = mai multe conversii',
                          '💪 Evită jargon-ul, folosește cuvinte simple'
                        ],
                        en: [
                          '✍️ Write like you\'re talking to a friend',
                          '🎯 A clear call-to-action = more conversions',
                          '💪 Avoid jargon, use simple words'
                        ]
                      },
                      'design-publicitar': {
                        ro: [
                          '🎨 Contrastul face textul să iasă în evidență',
                          '📐 Folosește spațiu alb pentru respirație',
                          '✨ Menține brand-ul consistent în toate design-urile'
                        ],
                        en: [
                          '🎨 Contrast makes text stand out',
                          '📐 Use white space for breathing room',
                          '✨ Keep branding consistent across all designs'
                        ]
                      },
                      'planificare-conținut': {
                        ro: [
                          '📅 Consistența este cheia succesului',
                          '🔄 Mixă tipuri de conținut (educativ, fun, promovare)',
                          '⏰ Postează când audiența ta este activă'
                        ],
                        en: [
                          '📅 Consistency is key to success',
                          '🔄 Mix content types (educational, fun, promotional)',
                          '⏰ Post when your audience is active'
                        ]
                      }
                    }
                    const toolTips = tips[toolId] || { ro: [], en: [] }
                    return settingsFormData.language === 'en' ? toolTips.en : toolTips.ro
                  }

                  const getNextSteps = (toolId: ToolId): { id: ToolId, name: string, nameEn: string }[] => {
                    const connections: Record<ToolId, ToolId[]> = {
                      'strategie-client': ['copywriting', 'design-publicitar'],
                      'analiza-piata': ['strategie-client', 'planificare-conținut'],
                      'strategie-video': ['copywriting', 'design-publicitar'],
                      'copywriting': ['design-publicitar', 'planificare-conținut'],
                      'design-publicitar': ['planificare-conținut'],
                      'planificare-conținut': [],
                    }
                    const nextToolIds = connections[toolId] || []
                    return nextToolIds
                      .map(id => {
                        const found = toolGroups.flatMap(g => g.tools).find(t => t.id === id)
                        return found ? { id: found.id as ToolId, name: found.name, nameEn: found.nameEn } : null
                      })
                      .filter(Boolean) as { id: ToolId, name: string, nameEn: string }[]
                  }

                  const toolTips = getToolTips(activeTool)
                  const nextSteps = getNextSteps(activeTool)

                  // Pentru planificare conținut, folosim un container mai larg când există rezultat
                  const isPlanificareContent = activeTool === 'planificare-conținut'
                  const hasCalendarResult = isPlanificareContent && toolResults[activeTool]?.calendar
                  const containerWidth = hasCalendarResult ? 'max-w-6xl' : 'max-w-4xl'
                  
                  return (
                    <div className="w-full flex justify-center">
                      <div id="tool-interface" className={`w-full ${containerWidth} space-y-6`}>
                        {/* Header îmbunătățit cu mai multă personalitate */}
                        <div className="relative">
                          {/* Background decorative animat */}
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-2xl blur-2xl animate-pulse"></div>
                          
                          <div className="relative bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 md:p-8 shadow-2xl overflow-hidden">
                            {/* Decorative elements */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl"></div>
                            
                            {/* Back Button */}
                            <button
                              onClick={() => {
                                setActiveTool(null)
                                setToolResults(prev => {
                                  const newResults = { ...prev }
                                  delete newResults[activeTool]
                                  return newResults
                                })
                                setToolErrors(prev => {
                                  const newErrors = { ...prev }
                                  delete newErrors[activeTool]
                                  return newErrors
                                })
                              }}
                              className="relative flex items-center space-x-2 text-gray-400 hover:text-white mb-6 transition-all hover:translate-x-[-4px] group z-10"
                            >
                              <ArrowLeft className="w-4 h-4 group-hover:translate-x-[-2px] transition-transform" />
                              <span className="text-sm font-medium">
                                {settingsFormData.language === 'en' ? '← Back to Tools' : '← Înapoi la Tooluri'}
                              </span>
                            </button>

                            {/* Header cu icon și descriere - mai engaging */}
                            <div className="relative flex flex-col md:flex-row items-start gap-5 md:gap-6 z-10">
                              <div className="relative">
                                <motion.div
                                  animate={{ rotate: [0, 5, -5, 0] }}
                                  transition={{ duration: 4, repeat: Infinity, repeatDelay: 2 }}
                                  className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-xl blur-lg"
                                ></motion.div>
                                <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-blue-500/30 shadow-lg group-hover:shadow-blue-500/30 transition-all">
                                  <ToolIcon className="w-10 h-10 md:w-12 md:h-12 text-blue-400" />
                                </div>
                              </div>
                              <div className="flex-1 pt-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-2xl md:text-3xl font-bold text-white bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                                    {toolName}
                                  </h3>
                                  <div className="px-3 py-1 bg-purple-500/20 border border-purple-400/30 rounded-lg">
                                    <span className="text-xs font-semibold text-purple-300">
                                      {TOOL_COSTS[activeTool] || TEXT_GENERATION_COST} {settingsFormData.language === 'en' ? 'credits' : 'credite'}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-gray-300 text-base md:text-lg leading-relaxed mb-3">{toolDescription}</p>
                                
                                {/* Quick tips preview */}
                                {toolTips.length > 0 && (
                                  <div className="flex items-center gap-2 text-sm text-blue-400/80">
                                    <Sparkles className="w-4 h-4" />
                                    <span className="font-medium">
                                      {settingsFormData.language === 'en' 
                                        ? 'Pro tip: ' + toolTips[0].replace(/^[^\s]+\s/, '')
                                        : 'Sfat pro: ' + toolTips[0].replace(/^[^\s]+\s/, '')}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Tips & Next Steps Sidebar */}
                        {(toolTips.length > 0 || nextSteps.length > 0) && (
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Main Interface */}
                            <div className="lg:col-span-2">
                              <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 md:p-8 shadow-xl">
                                {renderToolInterface(activeTool, toolName, toolDescription)}
                              </div>
                            </div>

                            {/* Sidebar cu Tips și Next Steps */}
                            <div className="space-y-6">
                              {/* Tips Section */}
                              {toolTips.length > 0 && (
                                <motion.div
                                  initial={{ opacity: 0, x: 20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.2 }}
                                  className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-xl p-5 backdrop-blur-xl"
                                >
                                  <div className="flex items-center gap-2 mb-4">
                                    <Sparkles className="w-5 h-5 text-blue-400" />
                                    <h4 className="text-lg font-bold text-white">
                                      {settingsFormData.language === 'en' ? '💡 Pro Tips' : '💡 Sfaturi Pro'}
                                    </h4>
                                  </div>
                                  <ul className="space-y-3">
                                    {toolTips.map((tip, idx) => (
                                      <motion.li
                                        key={idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 + idx * 0.1 }}
                                        className="text-sm text-gray-300 leading-relaxed flex items-start gap-2"
                                      >
                                        <span className="text-blue-400 mt-0.5 flex-shrink-0">•</span>
                                        <span>{tip}</span>
                                      </motion.li>
                                    ))}
                                  </ul>
                                </motion.div>
                              )}

                              {/* Next Steps Section */}
                              {nextSteps.length > 0 && (
                                <motion.div
                                  initial={{ opacity: 0, x: 20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.4 }}
                                  className="bg-gradient-to-br from-purple-600/10 to-pink-600/10 border border-purple-500/20 rounded-xl p-5 backdrop-blur-xl"
                                >
                                  <div className="flex items-center gap-2 mb-4">
                                    <ArrowRight className="w-5 h-5 text-purple-400" />
                                    <h4 className="text-lg font-bold text-white">
                                      {settingsFormData.language === 'en' ? '🚀 Next Steps' : '🚀 Următorii Pași'}
                                    </h4>
                                  </div>
                                  <p className="text-xs text-gray-400 mb-3">
                                    {settingsFormData.language === 'en'
                                      ? 'Continue your workflow with these connected tools:'
                                      : 'Continuă workflow-ul cu aceste tool-uri conectate:'}
                                  </p>
                                  <div className="space-y-2">
                                    {nextSteps.map((step) => {
                                      const stepTool = toolGroups.flatMap(g => g.tools).find(t => t.id === step.id)
                                      const StepIcon = stepTool?.icon || Wrench
                                      return (
                                        <motion.button
                                          key={step.id}
                                          onClick={() => setActiveTool(step.id)}
                                          whileHover={{ scale: 1.02, x: 4 }}
                                          whileTap={{ scale: 0.98 }}
                                          className="w-full p-3 bg-gray-800/50 hover:bg-gray-800/70 border border-gray-700/50 hover:border-purple-500/50 rounded-lg transition-all text-left group"
                                        >
                                          <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-all">
                                              <StepIcon className="w-4 h-4 text-purple-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <p className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">
                                                {settingsFormData.language === 'en' ? step.nameEn : step.name}
                                              </p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-purple-400 transition-colors flex-shrink-0" />
                                          </div>
                                        </motion.button>
                                      )
                                    })}
                                  </div>
                                </motion.div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Dacă nu există tips/next steps, afișăm interfața normal */}
                        {toolTips.length === 0 && nextSteps.length === 0 && (
                          <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 md:p-8 shadow-xl">
                            {renderToolInterface(activeTool, toolName, toolDescription)}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })()}
              </motion.div>
            )}

            {/* Tooluri Overview - când nu e selectat niciun tool */}
            {activeSection === 'tooluri' && !activeTool && !userMenuSection && (
              <motion.div
                key="tooluri"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* Welcome Section cu workflow vizual - compact */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="relative bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10 border border-blue-500/20 rounded-xl p-4 backdrop-blur-xl"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-5 h-5 text-blue-300" />
                      </div>
                      <h2 className="text-lg md:text-xl font-bold text-white">
                        {settingsFormData.language === 'en' 
                          ? '🚀 Your Marketing Toolkit' 
                          : '🚀 Toolkit-ul Tău de Marketing'}
                      </h2>
                    </div>
                    
                    {/* Workflow Visualization - compact și discret */}
                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gray-900/60 rounded-lg border border-gray-700/50">
                      <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mr-1">
                        {settingsFormData.language === 'en' ? '💡 Workflow' : '💡 Workflow'}
                      </span>
                      <div className="flex items-center gap-1 text-[10px]">
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-500/20 border border-blue-400/30 rounded text-blue-300 font-medium">
                          <Target className="w-3 h-3" />
                          <span>{settingsFormData.language === 'en' ? 'Strategy' : 'Strategie'}</span>
                        </div>
                        <ChevronRight className="w-3 h-3 text-gray-500 flex-shrink-0" />
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-purple-500/20 border border-purple-400/30 rounded text-purple-300 font-medium">
                          <PenTool className="w-3 h-3" />
                          <span>{settingsFormData.language === 'en' ? 'Create' : 'Creare'}</span>
                        </div>
                        <ChevronRight className="w-3 h-3 text-gray-500 flex-shrink-0" />
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-pink-500/20 border border-pink-400/30 rounded text-pink-300 font-medium">
                          <Calendar className="w-3 h-3" />
                          <span>{settingsFormData.language === 'en' ? 'Plan' : 'Planificare'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Butoane Rapide pentru Tool-uri - îmbunătățite */}
                <div className="space-y-8">
                  {toolGroups.map((group, groupIndex) => {
                    // Definește tool-urile conectate pentru fiecare tool
                    const getRelatedTools = (toolId: ToolId): ToolId[] => {
                      const connections: Record<ToolId, ToolId[]> = {
                        'strategie-client': ['copywriting', 'design-publicitar'],
                        'analiza-piata': ['strategie-client', 'planificare-conținut'],
                        'strategie-video': ['copywriting', 'design-publicitar'],
                        'copywriting': ['design-publicitar', 'planificare-conținut'],
                        'design-publicitar': ['planificare-conținut'],
                        'planificare-conținut': [],
                      }
                      return connections[toolId] || []
                    }

                    return (
                      <motion.div
                        key={group.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + groupIndex * 0.1 }}
                        className="space-y-5"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                            <group.icon className="w-5 h-5 text-blue-400" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white">
                              {settingsFormData.language === 'en' ? group.nameEn : group.name}
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {groupIndex === 0 
                                ? (settingsFormData.language === 'en' ? 'Start here to build your foundation' : 'Începe aici pentru a-ți construi fundația')
                                : (settingsFormData.language === 'en' ? 'Create amazing content' : 'Creează conținut uimitor')}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {group.tools.map((tool, toolIndex) => {
                            const ToolIcon = tool.icon
                            const relatedTools = getRelatedTools(tool.id as ToolId)
                            const relatedToolNames = relatedTools
                              .map(id => {
                                const found = toolGroups.flatMap(g => g.tools).find(t => t.id === id)
                                return found ? (settingsFormData.language === 'en' ? found.nameEn : found.name) : null
                              })
                              .filter(Boolean)
                            
                            return (
                              <motion.button
                                key={tool.id}
                                onClick={() => setActiveTool(tool.id as ToolId)}
                                whileHover={{ scale: 1.02, y: -4 }}
                                whileTap={{ scale: 0.98 }}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + toolIndex * 0.05 }}
                                className="relative p-5 bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-xl hover:border-blue-500/50 transition-all text-left group overflow-hidden"
                              >
                                {/* Decorative gradient on hover */}
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 via-purple-600/0 to-pink-600/0 group-hover:from-blue-600/10 group-hover:via-purple-600/10 group-hover:to-pink-600/10 transition-all duration-300"></div>
                                
                                <div className="relative flex items-start gap-4">
                                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all flex-shrink-0 shadow-lg group-hover:shadow-blue-500/20">
                                    <ToolIcon className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                      <h4 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                                        {settingsFormData.language === 'en' ? tool.nameEn : tool.name}
                                      </h4>
                                      <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-blue-400 transition-colors flex-shrink-0 mt-0.5" />
                                    </div>
                                    <p className="text-sm text-gray-400 line-clamp-2 mb-2">
                                      {settingsFormData.language === 'en' ? tool.descriptionEn : tool.description}
                                    </p>
                                    
                                    {/* Related Tools Badge */}
                                    {relatedToolNames.length > 0 && (
                                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                                        <span className="text-[10px] text-gray-500 font-medium">
                                          {settingsFormData.language === 'en' ? '→' : '→'}
                                        </span>
                                        <span className="text-[10px] text-blue-400/80 font-medium">
                                          {settingsFormData.language === 'en' 
                                            ? `Works with: ${relatedToolNames.slice(0, 2).join(', ')}`
                                            : `Funcționează cu: ${relatedToolNames.slice(0, 2).join(', ')}`}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Cost badge */}
                                <div className="absolute top-3 right-3 px-2 py-1 bg-purple-500/20 border border-purple-400/30 rounded-md">
                                  <span className="text-[10px] font-semibold text-purple-300">
                                    {TOOL_COSTS[tool.id] || TEXT_GENERATION_COST} {settingsFormData.language === 'en' ? 'credits' : 'credite'}
                                  </span>
                                </div>
                              </motion.button>
                            )
                          })}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Calendar Principal - 30 de zile */}
                {(() => {
                  // Afișează calendarul întotdeauna (chiar dacă este gol)
                  const calendarMap = new Map<number, any>();
                  if (mainCalendar && Array.isArray(mainCalendar)) {
                    mainCalendar.forEach((day: any) => {
                      const dayNum = typeof day.day === 'number' ? day.day : parseInt(day.day) || 0;
                      if (dayNum > 0) {
                        calendarMap.set(dayNum, day);
                      }
                    });
                  }
                  // Funcție pentru a obține tipul de postare pentru o zi
                  const getDayPostType = (dayNum: number): string | null => {
                    const dayData = calendarMap.get(dayNum);
                    if (!dayData) return null;
                    
                    if (dayData.posts && dayData.posts.length > 0) {
                      return dayData.posts[0].type || null;
                    }
                    
                    if (dayData.stories && dayData.stories.length > 0) {
                      return 'Story';
                    }
                    
                    return 'Rest';
                  };

                  // Funcție pentru a obține culoarea badge-ului
                  const getTypeColor = (type: string | null): string => {
                    if (!type) return 'bg-gray-700/50 text-gray-300';
                    
                    const typeLower = type.toLowerCase();
                    if (typeLower.includes('educativ') || typeLower.includes('educational')) {
                      return 'bg-blue-500/20 text-blue-400';
                    } else if (typeLower.includes('double')) {
                      return 'bg-red-500/20 text-red-400';
                    } else if (typeLower.includes('storytelling')) {
                      return 'bg-purple-500/20 text-purple-400';
                    } else if (typeLower.includes('social') || typeLower.includes('proof')) {
                      return 'bg-green-500/20 text-green-400';
                    } else if (typeLower.includes('serie') || typeLower.includes('series')) {
                      return 'bg-pink-500/20 text-pink-400';
                    } else if (typeLower === 'story') {
                      return 'bg-purple-500/20 text-purple-400';
                    } else if (typeLower === 'rest') {
                      return 'bg-yellow-500/20 text-yellow-400';
                    }
                    return 'bg-gray-700/50 text-gray-300';
                  };

                  const handleMainCalendarDayClick = (dayNum: number) => {
                    const dayData = calendarMap.get(dayNum);
                    if (dayData) {
                      setMainCalendarSelectedDay(dayNum);
                      setMainCalendarSelectedDayData(dayData);
                    } else {
                      setMainCalendarSelectedDay(null);
                      setMainCalendarSelectedDayData(null);
                    }
                  };

                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-400" />
                          {settingsFormData.language === 'en' ? 'Content Calendar (30 days)' : 'Calendar Conținut (30 zile)'}
                        </h3>
                        {(!mainCalendar || !Array.isArray(mainCalendar) || mainCalendar.length === 0) && (
                          <p className="text-xs text-gray-500">
                            {settingsFormData.language === 'en' 
                              ? 'Generate a content plan to see your calendar here' 
                              : 'Generează un plan de conținut pentru a vedea calendarul aici'}
                          </p>
                        )}
                      </div>
                      
                      {/* Calendar Grid */}
                      <div className="bg-gray-800/50 rounded-lg border border-gray-700/50 p-2">
                        <div className="grid grid-cols-7 gap-1">
                          {/* Headers pentru zilele săptămânii */}
                          {['Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm', 'Dum'].map((day, idx) => (
                            <div key={idx} className="text-center text-[10px] font-semibold text-gray-400 pb-1">
                              {day}
                            </div>
                          ))}
                          
                          {/* Zilele calendarului - 30 de zile */}
                          {Array.from({ length: 30 }, (_, i) => {
                            const dayNum = i + 1;
                            const postType = getDayPostType(dayNum);
                            const dayData = calendarMap.get(dayNum);
                            const isSelected = mainCalendarSelectedDay === dayNum;
                            const hasContent = dayData && (dayData.posts?.length > 0 || dayData.stories?.length > 0);
                            
                            return (
                              <motion.button
                                key={dayNum}
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleMainCalendarDayClick(dayNum);
                                }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`
                                  relative p-1.5 rounded border transition-all h-[46px] w-full flex flex-col items-center justify-center
                                  ${isSelected 
                                    ? 'border-blue-500 bg-blue-500/20' 
                                    : hasContent 
                                      ? 'border-gray-600 bg-gray-700/30 hover:border-gray-500' 
                                      : 'border-gray-700/30 bg-gray-800/30 hover:border-gray-600/50'
                                  }
                                `}
                              >
                                <div className="text-[11px] font-semibold text-white leading-none mb-0.5">{dayNum}</div>
                                {postType && (
                                  <div className={`text-[8px] px-1 py-0.5 rounded font-bold leading-tight whitespace-nowrap overflow-hidden text-ellipsis max-w-full ${getTypeColor(postType)}`}>
                                    {postType === 'Rest' ? 'Pauză' : postType}
                                  </div>
                                )}
                                {dayData?.posts?.length > 1 && (
                                  <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                                )}
                                {dayData?.stories?.length > 0 && (
                                  <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                                )}
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Legend */}
                      <div className="flex flex-wrap gap-4 text-xs mt-4">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded bg-blue-500/20 border border-blue-400/50"></div>
                          <span className="text-gray-400">{settingsFormData.language === 'en' ? 'Post' : 'Postare'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded bg-purple-500/20 border border-purple-400/50"></div>
                          <span className="text-gray-400">{settingsFormData.language === 'en' ? 'Story' : 'Story'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded bg-yellow-500/20 border border-yellow-400/50"></div>
                          <span className="text-gray-400">{settingsFormData.language === 'en' ? 'Rest Day' : 'Zi de Pauză'}</span>
                        </div>
                      </div>

                      {/* Detalii pentru ziua selectată */}
                      {mainCalendarSelectedDayData && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-4 p-5 bg-gray-800/50 rounded-lg border border-gray-700/50 space-y-4"
                        >
                          <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-700/50">
                            <h4 className="text-lg font-bold text-white">
                              {settingsFormData.language === 'en' ? 'Day' : 'Ziua'} {mainCalendarSelectedDay}
                            </h4>
                            <button
                              onClick={() => {
                                setMainCalendarSelectedDay(null);
                                setMainCalendarSelectedDayData(null);
                              }}
                              className="text-gray-400 hover:text-white"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>

                          {/* Postări */}
                          {mainCalendarSelectedDayData.posts && mainCalendarSelectedDayData.posts.length > 0 && (
                            <div>
                              <h5 className="text-sm font-semibold text-blue-400 mb-2">
                                {settingsFormData.language === 'en' ? 'Posts' : 'Postări'}
                              </h5>
                              {mainCalendarSelectedDayData.posts.map((post: any, idx: number) => (
                                <div key={idx} className="mb-3 p-3 bg-gray-700/30 rounded-lg">
                                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    <span className={`text-xs px-2 py-1 rounded ${getTypeColor(post.type)}`}>
                                      {post.type}
                                    </span>
                                    {post.seriesPart && (
                                      <span className="text-xs text-pink-400">{post.seriesPart}</span>
                                    )}
                                    <button
                                      onClick={() => handleGenerateVideoFromCalendar(post)}
                                      className="ml-auto px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                                    >
                                      <Video className="w-3.5 h-3.5" />
                                      {settingsFormData.language === 'en' ? 'Generate Now' : 'Generează Acum'}
                                    </button>
                                  </div>
                                  <p className="text-sm text-gray-300 mb-1">
                                    <span className="text-gray-400">{settingsFormData.language === 'en' ? 'Purpose:' : 'Scop:'}</span> {post.purpose}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    <span className="text-gray-500">{settingsFormData.language === 'en' ? 'Format:' : 'Format:'}</span> {post.format}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Story-uri */}
                          {mainCalendarSelectedDayData.stories && mainCalendarSelectedDayData.stories.length > 0 && (
                            <div>
                              <h5 className="text-sm font-semibold text-purple-400 mb-2">
                                {settingsFormData.language === 'en' ? 'Stories' : 'Story-uri'}
                              </h5>
                              {mainCalendarSelectedDayData.stories.map((story: any, idx: number) => (
                                <div key={idx} className="mb-3 p-3 bg-gray-700/30 rounded-lg">
                                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    <span className="text-xs px-2 py-1 rounded bg-purple-500/20 text-purple-400">
                                      {story.type}
                                    </span>
                                    <button
                                      onClick={() => handleGenerateVideoFromCalendar(story)}
                                      className="ml-auto px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                                    >
                                      <Video className="w-3.5 h-3.5" />
                                      {settingsFormData.language === 'en' ? 'Generate Now' : 'Generează Acum'}
                                    </button>
                                  </div>
                                  <p className="text-sm text-gray-300 mb-1">
                                    <span className="text-gray-400">{settingsFormData.language === 'en' ? 'Purpose:' : 'Scop:'}</span> {story.purpose}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    <span className="text-gray-500">{settingsFormData.language === 'en' ? 'Format:' : 'Format:'}</span> {story.format}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Notes */}
                          {mainCalendarSelectedDayData.notes && (
                            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                              <p className="text-sm text-yellow-400">{mainCalendarSelectedDayData.notes}</p>
                            </div>
                          )}

                          {/* Zi de pauză */}
                          {(!mainCalendarSelectedDayData.posts || mainCalendarSelectedDayData.posts.length === 0) &&
                           (!mainCalendarSelectedDayData.stories || mainCalendarSelectedDayData.stories.length === 0) && (
                            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-center">
                              <p className="text-sm text-yellow-400">
                                {settingsFormData.language === 'en' ? 'Rest Day - No content scheduled' : 'Zi de Pauză - Fără conținut planificat'}
                              </p>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })()}

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

            {userMenuSection === 'setari' && (
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

            {userMenuSection === 'profil' && (
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
                      <div>
                        <p className="text-sm text-gray-400 mb-1 flex items-center gap-2">
                          <Target className="w-3 h-3" />
                          {settingsFormData.language === 'en' ? 'Business Type' : 'Tip Business'}
                        </p>
                        <p className="text-white font-medium">{userProfile?.business_type || t('notSet')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1 flex items-center gap-2">
                          <FileText className="w-3 h-3" />
                          {settingsFormData.language === 'en' ? 'Business Description' : 'Descriere Business'}
                        </p>
                        <p className="text-white font-medium whitespace-pre-wrap">{userProfile?.business_description || t('notSet')}</p>
                      </div>
                      
                      {/* Strategie Client */}
                      <div className="pt-4 border-t border-gray-700/50">
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-sm font-semibold text-white flex items-center gap-2">
                            <Target className="w-4 h-4 text-blue-400" />
                            {settingsFormData.language === 'en' ? 'Client Strategy' : 'Strategie Client'}
                          </p>
                          <div className="flex items-center gap-2">
                            {loadingStrategy && (
                              <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin"></div>
                            )}
                            {!showStrategyForm && (
                              <motion.button
                                onClick={() => {
                                  // Completează automat cu business_type din profil
                                  setStrategyFormData({
                                    businessType: userProfile?.business_type || '',
                                    sellType: '',
                                    priceRange: '',
                                    targetAudience: '',
                                    objective: '',
                                  })
                                  setShowStrategyForm(true)
                                }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-blue-400 hover:text-blue-300 text-xs font-semibold transition-all flex items-center gap-1.5"
                              >
                                <Users className="w-3.5 h-3.5" />
                                {settingsFormData.language === 'en' ? 'Find New Clients' : 'Caută Alți Clienți'}
                              </motion.button>
                            )}
                          </div>
                        </div>
                        
                        {/* Formular pentru generare strategie nouă */}
                        {showStrategyForm && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-4 p-4 bg-gray-800/50 rounded-lg border border-blue-500/30"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-sm font-bold text-white">
                                {settingsFormData.language === 'en' ? 'Generate New Strategy' : 'Generează Strategie Nouă'}
                              </h4>
                              <button
                                onClick={() => {
                                  setShowStrategyForm(false)
                                  setStrategyFormData({
                                    businessType: '',
                                    sellType: '',
                                    priceRange: '',
                                    targetAudience: '',
                                    objective: '',
                                  })
                                }}
                                className="text-gray-400 hover:text-white transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            
                            <form onSubmit={async (e) => {
                              e.preventDefault()
                              if (!user) return
                              
                              setGeneratingNewStrategy(true)
                              try {
                                const response = await fetch('/api/tools', {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                  },
                                  body: JSON.stringify({
                                    toolId: 'strategie-client',
                                    inputs: {
                                      businessType: strategyFormData.businessType.trim(),
                                      sellType: strategyFormData.sellType,
                                      priceRange: strategyFormData.priceRange,
                                      targetAudience: strategyFormData.targetAudience,
                                      objective: strategyFormData.objective,
                                    },
                                    user_id: user.id,
                                  }),
                                })

                                if (!response.ok) {
                                  const errorData = await response.json()
                                  throw new Error(errorData.error || 'Failed to generate strategy')
                                }

                                const data = await response.json()
                                setClientStrategy(data.data)
                                setShowStrategyForm(false)
                                setStrategyFormData({
                                  businessType: '',
                                  sellType: '',
                                  priceRange: '',
                                  targetAudience: '',
                                  objective: '',
                                })
                                
                                setNotification({ 
                                  type: 'success', 
                                  message: settingsFormData.language === 'en' 
                                    ? 'New strategy generated successfully!' 
                                    : 'Strategia nouă a fost generată cu succes!' 
                                })
                                setTimeout(() => setNotification(null), 5000)
                              } catch (error: any) {
                                console.error('Error generating strategy:', error)
                                setNotification({ 
                                  type: 'error', 
                                  message: error.message || (settingsFormData.language === 'en' 
                                    ? 'Failed to generate strategy' 
                                    : 'Eroare la generarea strategiei')
                                })
                                setTimeout(() => setNotification(null), 5000)
                              } finally {
                                setGeneratingNewStrategy(false)
                              }
                            }} className="space-y-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                                    {settingsFormData.language === 'en' ? 'Business Type / Product' : 'Tip Afacere / Produs'} *
                                  </label>
                                  <input
                                    type="text"
                                    value={strategyFormData.businessType}
                                    onChange={(e) => setStrategyFormData({ ...strategyFormData, businessType: e.target.value })}
                                    placeholder={settingsFormData.language === 'en' ? 'e.g., Premium organic tea' : 'ex: Ceai organic premium'}
                                    className="w-full px-3 py-2 bg-gray-800/80 border border-gray-700/50 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                                    {settingsFormData.language === 'en' ? 'Sells Online or Local' : 'Vinde Online sau Local'} *
                                  </label>
                                  <select
                                    value={strategyFormData.sellType}
                                    onChange={(e) => setStrategyFormData({ ...strategyFormData, sellType: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-800/80 border border-gray-700/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50"
                                    required
                                  >
                                    <option value="">{settingsFormData.language === 'en' ? 'Select...' : 'Selectează...'}</option>
                                    <option value="online">{settingsFormData.language === 'en' ? 'Online' : 'Online'}</option>
                                    <option value="local">{settingsFormData.language === 'en' ? 'Local' : 'Local'}</option>
                                    <option value="both">{settingsFormData.language === 'en' ? 'Both' : 'Ambele'}</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                                    {settingsFormData.language === 'en' ? 'Price Range' : 'Preț'} *
                                  </label>
                                  <select
                                    value={strategyFormData.priceRange}
                                    onChange={(e) => setStrategyFormData({ ...strategyFormData, priceRange: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-800/80 border border-gray-700/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50"
                                    required
                                  >
                                    <option value="">{settingsFormData.language === 'en' ? 'Select...' : 'Selectează...'}</option>
                                    <option value="low">{settingsFormData.language === 'en' ? 'Low' : 'Mic'}</option>
                                    <option value="medium">{settingsFormData.language === 'en' ? 'Medium' : 'Mediu'}</option>
                                    <option value="high">{settingsFormData.language === 'en' ? 'High' : 'Mare'}</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                                    {settingsFormData.language === 'en' ? 'Target Audience' : 'Cui Vinde'} *
                                  </label>
                                  <select
                                    value={strategyFormData.targetAudience}
                                    onChange={(e) => setStrategyFormData({ ...strategyFormData, targetAudience: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-800/80 border border-gray-700/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50"
                                    required
                                  >
                                    <option value="">{settingsFormData.language === 'en' ? 'Select...' : 'Selectează...'}</option>
                                    <option value="B2C">B2C</option>
                                    <option value="B2B">B2B</option>
                                  </select>
                                </div>
                                <div className="md:col-span-2">
                                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                                    {settingsFormData.language === 'en' ? 'Main Objective' : 'Obiectiv Principal'} *
                                  </label>
                                  <select
                                    value={strategyFormData.objective}
                                    onChange={(e) => setStrategyFormData({ ...strategyFormData, objective: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-800/80 border border-gray-700/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50"
                                    required
                                  >
                                    <option value="">{settingsFormData.language === 'en' ? 'Select...' : 'Selectează...'}</option>
                                    <option value="sales">{settingsFormData.language === 'en' ? 'Sales' : 'Vânzări'}</option>
                                    <option value="leads">{settingsFormData.language === 'en' ? 'Leads' : 'Lead-uri'}</option>
                                  </select>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between pt-2">
                                <p className="text-xs text-gray-500">
                                  {TOOL_COSTS['strategie-client']} {settingsFormData.language === 'en' ? 'credits' : 'credite'}
                                </p>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setShowStrategyForm(false)
                                      setStrategyFormData({
                                        businessType: '',
                                        sellType: '',
                                        priceRange: '',
                                        targetAudience: '',
                                        objective: '',
                                      })
                                    }}
                                    className="px-3 py-1.5 text-xs bg-gray-700/50 hover:bg-gray-700/70 border border-gray-600/50 rounded-lg text-gray-300 hover:text-white transition-all"
                                  >
                                    {settingsFormData.language === 'en' ? 'Cancel' : 'Anulează'}
                                  </button>
                                  <motion.button
                                    type="submit"
                                    disabled={generatingNewStrategy}
                                    whileHover={{ scale: generatingNewStrategy ? 1 : 1.05 }}
                                    whileTap={{ scale: generatingNewStrategy ? 1 : 0.95 }}
                                    className="px-4 py-1.5 text-xs bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                  >
                                    {generatingNewStrategy ? (
                                      <>
                                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>{settingsFormData.language === 'en' ? 'Generating...' : 'Se generează...'}</span>
                                      </>
                                    ) : (
                                      <>
                                        <Sparkles className="w-3 h-3" />
                                        <span>{settingsFormData.language === 'en' ? 'Generate' : 'Generează'}</span>
                                      </>
                                    )}
                                  </motion.button>
                                </div>
                              </div>
                            </form>
                          </motion.div>
                        )}
                        {loadingStrategy ? (
                          <p className="text-sm text-gray-400">{settingsFormData.language === 'en' ? 'Loading...' : 'Se încarcă...'}</p>
                        ) : clientStrategy ? (
                          <div className="space-y-4 p-4 bg-gray-800/30 rounded-lg border border-gray-700/30">
                            {clientStrategy.idealClient && (
                              <div>
                                <h5 className="text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide">
                                  {settingsFormData.language === 'en' ? 'Ideal Client' : 'Client Ideal'}
                                </h5>
                                <p className="text-white text-sm">{clientStrategy.idealClient}</p>
                              </div>
                            )}
                            {clientStrategy.mainProblem && (
                              <div>
                                <h5 className="text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide">
                                  {settingsFormData.language === 'en' ? 'Main Problem' : 'Problema Principală'}
                                </h5>
                                <p className="text-white text-sm">{clientStrategy.mainProblem}</p>
                              </div>
                            )}
                            {clientStrategy.promise && (
                              <div>
                                <h5 className="text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide">
                                  {settingsFormData.language === 'en' ? 'Attractive Promise' : 'Promisiunea Atractivă'}
                                </h5>
                                <p className="text-white text-sm">{clientStrategy.promise}</p>
                              </div>
                            )}
                            {clientStrategy.recommendedMessages && Array.isArray(clientStrategy.recommendedMessages) && clientStrategy.recommendedMessages.length > 0 && (
                              <div>
                                <h5 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                                  {settingsFormData.language === 'en' ? 'Recommended Messages' : 'Mesaje Recomandate'}
                                </h5>
                                <ul className="space-y-2">
                                  {clientStrategy.recommendedMessages.map((msg: string, idx: number) => (
                                    <li key={idx} className="text-white text-sm flex items-start gap-2">
                                      <span className="text-blue-400 mt-1">•</span>
                                      <span>{msg}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {clientStrategy.messagesToAvoid && Array.isArray(clientStrategy.messagesToAvoid) && clientStrategy.messagesToAvoid.length > 0 && (
                              <div>
                                <h5 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                                  {settingsFormData.language === 'en' ? 'Messages to Avoid' : 'Mesaje de Evitat'}
                                </h5>
                                <ul className="space-y-2">
                                  {clientStrategy.messagesToAvoid.map((msg: string, idx: number) => (
                                    <li key={idx} className="text-white text-sm flex items-start gap-2">
                                      <span className="text-red-400 mt-1">•</span>
                                      <span>{msg}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 italic">
                            {settingsFormData.language === 'en' 
                              ? 'No client strategy generated yet. Complete the onboarding to generate your strategy.' 
                              : 'Nicio strategie client generată încă. Completează onboarding-ul pentru a genera strategia ta.'}
                          </p>
                        )}
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
                          business_type: profileFormData.business_type?.trim() || null,
                          business_description: profileFormData.business_description?.trim() || null,
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
                            business_type: data.business_type || '',
                            business_description: data.business_description || '',
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
                      
                      {/* Business Type */}
                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">
                          {settingsFormData.language === 'en' ? 'Business Type' : 'Tip Business'}
                        </label>
                        <input
                          type="text"
                          value={profileFormData.business_type}
                          onChange={(e) => setProfileFormData({ ...profileFormData, business_type: e.target.value })}
                          placeholder={settingsFormData.language === 'en' ? 'e.g., Service auto, Restaurant, E-commerce' : 'ex: Service auto, Restaurant, E-commerce'}
                          className="w-full px-4 py-2.5 bg-gray-800/80 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {settingsFormData.language === 'en' ? 'Used to provide context for AI-generated content' : 'Folosit pentru a oferi context pentru conținutul generat de AI'}
                        </p>
                      </div>
                      
                      {/* Business Description */}
                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">
                          {settingsFormData.language === 'en' ? 'Business Description' : 'Descriere Business'}
                        </label>
                        <textarea
                          value={profileFormData.business_description}
                          onChange={(e) => setProfileFormData({ ...profileFormData, business_description: e.target.value })}
                          placeholder={settingsFormData.language === 'en' ? 'Describe your business in detail...' : 'Descrie afacerea ta în detaliu...'}
                          rows={4}
                          className="w-full px-4 py-2.5 bg-gray-800/80 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 resize-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {settingsFormData.language === 'en' ? 'This information helps AI generate more relevant content for your business' : 'Această informație ajută AI-ul să genereze conținut mai relevant pentru afacerea ta'}
                        </p>
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
                                business_type: userProfile.business_type || '',
                                business_description: userProfile.business_description || '',
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

export default function Dashboard() {
  return (
    <Suspense fallback={
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
    }>
      <DashboardContent />
    </Suspense>
  )
}
