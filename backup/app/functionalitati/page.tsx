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
  Settings,
  ArrowRight
} from 'lucide-react'

const features = [
  {
    icon: Wand2,
    title: 'Generare Conținut AI',
    description: 'Creează copywriting optimizat pentru orice tip de produs sau serviciu, adaptat pentru target-ul tău specific.',
  },
  {
    icon: ImageIcon,
    title: 'Generare Imagini',
    description: 'Generează imagini profesionale pentru reclame folosind AI avansat, perfect adaptate pentru brand-ul tău.',
  },
  {
    icon: FileText,
    title: 'Multiple Formate',
    description: 'Exportă reclamele în multiple formate: social media, banner-uri web, print, și multe altele.',
  },
  {
    icon: BarChart3,
    title: 'Analiză Performanță',
    description: 'Obține insights despre performanța reclamelor și recomandări pentru optimizare continuă.',
  },
  {
    icon: Zap,
    title: 'Generare Rapidă',
    description: 'Generează sute de variante de reclame în secunde, economisind timp și resurse.',
  },
  {
    icon: Globe,
    title: 'Multi-Language',
    description: 'Suport pentru peste 50 de limbi, cu adaptare culturală automată pentru fiecare piață.',
  },
  {
    icon: Palette,
    title: 'Brand Customization',
    description: 'Personalizează culorile, fonturile și stilul pentru a se potrivi perfect cu brand-ul tău.',
  },
  {
    icon: Target,
    title: 'Targeting Avansat',
    description: 'Optimizează reclamele pentru demografice specifice, interese și comportamente de cumpărare.',
  },
  {
    icon: Languages,
    title: 'A/B Testing',
    description: 'Testează automat multiple variante și identifică cea mai eficientă pentru audiența ta.',
  },
  {
    icon: Sparkles,
    title: 'Templates Premium',
    description: 'Accesează o bibliotecă vastă de template-uri profesionale pentru orice industrie.',
  },
  {
    icon: Download,
    title: 'Export Ilimit',
    description: 'Descarcă reclamele în rezoluție înaltă, fără limitări sau watermark-uri.',
  },
  {
    icon: Settings,
    title: 'API Integration',
    description: 'Integrează platforma în workflow-ul tău existent prin API-uri puternice și documentație completă.',
  },
]

const featureCategories = [
  {
    title: 'Generare Inteligentă',
    description: 'AI avansat pentru conținut și imagini',
    features: features.slice(0, 4),
    icon: Sparkles,
  },
  {
    title: 'Optimizare & Analiză',
    description: 'Instrumente pentru performanță maximă',
    features: features.slice(4, 8),
    icon: BarChart3,
  },
  {
    title: 'Integrare & Export',
    description: 'Flexibilitate completă în workflow',
    features: features.slice(8, 12),
    icon: Settings,
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
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white relative overflow-hidden pt-20">
      {/* Modern animated background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
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
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at 20% 30%, rgba(119, 25, 103, 0.2) 0%, transparent 40%),
              radial-gradient(circle at 80% 70%, rgba(119, 25, 103, 0.15) 0%, transparent 40%),
              radial-gradient(circle at 50% 50%, rgba(119, 25, 103, 0.1) 0%, transparent 50%)
            `,
          }}
          animate={{
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        {[...Array(15)].map((_, i) => (
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
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-32">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center mb-32"
        >
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-semibold mb-8 tracking-tight">
            <span className="text-white">Funcționalități</span>
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto font-light">
            Descoperă toate instrumentele și capabilitățile care fac din platforma noastră 
            soluția perfectă pentru generarea de reclame AI.
          </p>
        </motion.div>

        {/* Feature Categories */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-24 mb-32"
        >
          {featureCategories.map((category, categoryIndex) => {
            const CategoryIcon = category.icon
            return (
              <motion.div
                key={category.title}
                variants={itemVariants}
                className="relative"
              >
                {/* Category Header */}
                <div className="flex items-center gap-6 mb-12">
                  <div className="p-5 rounded-2xl bg-[#771967]/20 border border-[#771967]/30">
                    <CategoryIcon className="w-8 h-8 text-[#771967]" />
                  </div>
                  <div>
                    <h2 className="text-4xl font-semibold text-white mb-2 tracking-tight">
                      {category.title}
                    </h2>
                    <p className="text-lg text-gray-400 font-light">
                      {category.description}
                    </p>
                  </div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {category.features.map((feature, index) => {
                    const Icon = feature.icon
                    return (
                      <motion.div
                        key={feature.title}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: categoryIndex * 0.2 + index * 0.1 }}
                        whileHover={{ y: -5 }}
                        className="p-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl hover:border-white/30 transition-all group"
                      >
                        <div className="mb-4">
                          <div className="inline-flex p-3 rounded-xl bg-[#771967]/20 border border-[#771967]/30 group-hover:bg-[#771967]/30 transition-colors">
                            <Icon className="w-5 h-5 text-[#771967]" />
                          </div>
                        </div>
                        <h3 className="text-lg font-medium mb-2 text-white tracking-tight">{feature.title}</h3>
                        <p className="text-gray-400 text-sm leading-relaxed font-light">{feature.description}</p>
                      </motion.div>
                    )
                  })}
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
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-12 sm:p-16">
            <h2 className="text-4xl sm:text-5xl font-semibold mb-6 text-white tracking-tight">
              Gata să începi?
            </h2>
            <p className="text-lg text-gray-400 mb-10 font-light">
              Începe să generezi reclame AI profesionale în doar câteva minute.
            </p>
            <motion.a
              href="/contact"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-10 py-4 bg-[#771967] hover:bg-[#771967]/90 text-white font-medium rounded-full transition-all duration-300"
            >
              Începe Gratuit
              <ArrowRight className="w-5 h-5" />
            </motion.a>
          </div>
        </motion.div>
      </div>
    </main>
  )
}
