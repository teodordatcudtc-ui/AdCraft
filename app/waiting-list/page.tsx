'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sparkles, Mail, User, MessageSquare, Calendar, Lock, ArrowRight } from 'lucide-react'
import { isAdminAuthenticated, setAdminAuthenticated } from '@/lib/admin-auth'

export default function WaitingList() {
  const router = useRouter()
  
  // Verifică dacă utilizatorul e deja autentificat ca admin
  useEffect(() => {
    if (isAdminAuthenticated()) {
      router.push('/')
    }
  }, [router])

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    howDidYouHear: '',
    whyDoYouNeed: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Admin login state
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [adminError, setAdminError] = useState<string | null>(null)
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/waiting-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Eroare la trimiterea formularului')
      }

      setIsSubmitted(true)
      setFormData({ name: '', email: '', howDidYouHear: '', whyDoYouNeed: '' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare la trimiterea formularului')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoggingIn(true)
    setAdminError(null)

    if (adminPassword === 'Teodor_200710') {
      // Salvează autentificarea
      setAdminAuthenticated()
      
      // Redirect la pagina principală
      router.push('/')
    } else {
      setAdminError('Parolă incorectă')
      setIsLoggingIn(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const launchDate = new Date('2025-01-10')
  const today = new Date()
  const daysUntilLaunch = Math.ceil((launchDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
          <div className="flex items-center justify-center space-x-2">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <Sparkles className="w-8 h-8 text-blue-400" />
            </motion.div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              AdLence.ai
            </span>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-2xl"
          >
            {/* Launch Date Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-8"
            >
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-full mb-6">
                <Calendar className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-300 font-medium">
                  Lansare: 10 Ianuarie 2025
                </span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                <span className="text-white">Alătură-te</span>
                <br />
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Waiting List
                </span>
              </h1>
              
              <p className="text-lg text-gray-400 mb-8 max-w-xl mx-auto">
                AdLence.ai este în curând! Fii printre primii care vor avea acces la platforma noastră revoluționară de generare de reclame cu AI.
              </p>
            </motion.div>

            {/* Success Message */}
            {isSubmitted && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg"
              >
                <p className="text-green-300 text-center">
                  ✅ Te-ai înscris cu succes! Vei primi un email când platforma va fi lansată.
                </p>
              </motion.div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg"
              >
                <p className="text-red-300 text-center">{error}</p>
              </motion.div>
            )}

            {/* Form */}
            {!isSubmitted && (
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                onSubmit={handleSubmit}
                className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 sm:p-8 space-y-6"
              >
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-400" />
                    Nume complet
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Introdu numele tău"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-400" />
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="introdu@email.com"
                  />
                </div>

                {/* How did you hear about us */}
                <div>
                  <label htmlFor="howDidYouHear" className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-400" />
                    Cum ai aflat despre noi?
                  </label>
                  <select
                    id="howDidYouHear"
                    name="howDidYouHear"
                    value={formData.howDidYouHear}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Selectează o opțiune</option>
                    <option value="social-media">Social Media (Facebook, Instagram, LinkedIn)</option>
                    <option value="google">Căutare Google</option>
                    <option value="friend">Recomandare de la prieten/coleg</option>
                    <option value="advertisement">Reclamă</option>
                    <option value="other">Altfel</option>
                  </select>
                </div>

                {/* Why do you need our services */}
                <div>
                  <label htmlFor="whyDoYouNeed" className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-400" />
                    De ce ai nevoie de serviciile noastre?
                  </label>
                  <textarea
                    id="whyDoYouNeed"
                    name="whyDoYouNeed"
                    value={formData.whyDoYouNeed}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    placeholder="Spune-ne despre nevoile tale și cum te-ar putea ajuta AdLence.ai..."
                  />
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
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
                      <span>Se trimite...</span>
                    </>
                  ) : (
                    <>
                      <span>Alătură-te Waiting List</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              </motion.form>
            )}
          </motion.div>
        </div>

        {/* Admin Login Section - Bottom of page */}
        <footer className="container mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="text-center">
            <button
              onClick={() => setShowAdminLogin(!showAdminLogin)}
              className="text-gray-500 hover:text-gray-400 text-sm flex items-center justify-center gap-2 mx-auto transition-colors"
            >
              <Lock className="w-4 h-4" />
              <span>Log in admin</span>
            </button>

            {showAdminLogin && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 max-w-md mx-auto"
              >
                <form onSubmit={handleAdminLogin} className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-lg p-4 space-y-4">
                  <div>
                    <label htmlFor="adminPassword" className="block text-sm font-semibold text-gray-300 mb-2">
                      Parolă Admin
                    </label>
                    <input
                      type="password"
                      id="adminPassword"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Introdu parola"
                    />
                  </div>
                  
                  {adminError && (
                    <p className="text-red-400 text-sm">{adminError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoggingIn ? 'Se conectează...' : 'Conectează-te'}
                  </button>
                </form>
              </motion.div>
            )}
          </div>
        </footer>
      </div>
    </main>
  )
}

