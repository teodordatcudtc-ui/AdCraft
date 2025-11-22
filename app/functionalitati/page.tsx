'use client'

import { motion } from 'framer-motion'
import { 
  Wand2, 
  Image as ImageIcon, 
  FileText, 
  BarChart3, 
  Zap, 
  Globe,
  Palette,
  Languages,
  Target,
  Sparkles,
  Download,
  Settings
} from 'lucide-react'

const features = [
  {
    icon: Wand2,
    title: 'Generare Conținut AI',
    description: 'Creează copywriting optimizat pentru orice tip de produs sau serviciu, adaptat pentru target-ul tău specific.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: ImageIcon,
    title: 'Generare Imagini',
    description: 'Generează imagini profesionale pentru reclame folosind AI avansat, perfect adaptate pentru brand-ul tău.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: FileText,
    title: 'Multiple Formate',
    description: 'Exportă reclamele în multiple formate: social media, banner-uri web, print, și multe altele.',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: BarChart3,
    title: 'Analiză Performanță',
    description: 'Obține insights despre performanța reclamelor și recomandări pentru optimizare continuă.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Zap,
    title: 'Generare Rapidă',
    description: 'Generează sute de variante de reclame în secunde, economisind timp și resurse.',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    icon: Globe,
    title: 'Multi-Language',
    description: 'Suport pentru peste 50 de limbi, cu adaptare culturală automată pentru fiecare piață.',
    color: 'from-indigo-500 to-blue-500',
  },
  {
    icon: Palette,
    title: 'Brand Customization',
    description: 'Personalizează culorile, fonturile și stilul pentru a se potrivi perfect cu brand-ul tău.',
    color: 'from-pink-500 to-rose-500',
  },
  {
    icon: Target,
    title: 'Targeting Avansat',
    description: 'Optimizează reclamele pentru demografice specifice, interese și comportamente de cumpărare.',
    color: 'from-cyan-500 to-teal-500',
  },
  {
    icon: Languages,
    title: 'A/B Testing',
    description: 'Testează automat multiple variante și identifică cea mai eficientă pentru audiența ta.',
    color: 'from-violet-500 to-purple-500',
  },
  {
    icon: Sparkles,
    title: 'Templates Premium',
    description: 'Accesează o bibliotecă vastă de template-uri profesionale pentru orice industrie.',
    color: 'from-amber-500 to-yellow-500',
  },
  {
    icon: Download,
    title: 'Export Ilimit',
    description: 'Descarcă reclamele în rezoluție înaltă, fără limitări sau watermark-uri.',
    color: 'from-emerald-500 to-green-500',
  },
  {
    icon: Settings,
    title: 'API Integration',
    description: 'Integrează platforma în workflow-ul tău existent prin API-uri puternice și documentație completă.',
    color: 'from-slate-500 to-gray-500',
  },
]

export default function Functionalitati() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white relative overflow-hidden pt-20">
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

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center mb-20"
        >
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
              Funcționalități
            </span>
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed">
            Descoperă toate instrumentele și capabilitățile care fac din platforma noastră 
            soluția perfectă pentru generarea de reclame AI.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{ y: -10, scale: 1.02 }}
                className="p-6 bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-xl hover:border-gray-600/50 transition-all group relative overflow-hidden"
              >
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity`}
                />
                <div className="relative z-10">
                  <motion.div
                    className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-4`}
                    whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 sm:p-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Gata să începi?
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              Începe să generezi reclame AI profesionale în doar câteva minute.
            </p>
            <motion.a
              href="/contact"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg shadow-blue-500/25"
            >
              Începe Gratuit
            </motion.a>
          </div>
        </motion.div>
      </div>
    </main>
  )
}

