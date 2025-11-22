'use client'

import { motion } from 'framer-motion'
import { Brain, Rocket, Users, TrendingUp, Shield, Globe, Target } from 'lucide-react'

const stats = [
  { value: '10K+', label: 'Reclame Generate' },
  { value: '500+', label: 'Clienți Mulțumiți' },
  { value: '99.9%', label: 'Uptime' },
  { value: '24/7', label: 'Suport' },
]

const values = [
  {
    icon: Brain,
    title: 'Inteligență Artificială Avansată',
    description: 'Folosim cele mai recente tehnologii AI pentru a genera conținut optimizat și imagini captivante.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Rocket,
    title: 'Viteză Excepțională',
    description: 'Generează reclame profesionale în câteva secunde, economisind timp și resurse.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Target,
    title: 'Optimizare Perfectă',
    description: 'Fiecare reclamă este adaptată pentru target-ul tău specific, maximizând conversiile.',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: Shield,
    title: 'Securitate Maximă',
    description: 'Datele tale sunt protejate cu standarde de securitate enterprise-grade.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Users,
    title: 'Echipa Expertă',
    description: 'O echipă dedicată de specialiști în AI și marketing digital la dispoziția ta.',
    color: 'from-indigo-500 to-blue-500',
  },
  {
    icon: Globe,
    title: 'Global & Local',
    description: 'Suport pentru multiple limbi și adaptare culturală pentru piața ta.',
    color: 'from-cyan-500 to-teal-500',
  },
]

export default function Despre() {
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
              Despre Noi
            </span>
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed">
            Suntem o echipă pasionată de tehnologie și marketing, dedicată să transformăm 
            modul în care se creează reclame în era digitală.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -5 }}
              className="text-center p-6 bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-xl"
            >
              <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto mb-20"
        >
          <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 sm:p-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Misiunea Noastră
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-4">
              Creăm o platformă care democratizează accesul la tehnologii avansate de AI pentru 
              generarea de reclame. Vrem ca orice business, indiferent de mărime, să poată crea 
              campanii publicitare profesionale și eficiente.
            </p>
            <p className="text-gray-300 text-lg leading-relaxed">
              Prin combinarea inteligenței artificiale cu expertiza noastră în marketing, 
              transformăm ideile în reclame care convertesc și cresc business-ul tău.
            </p>
          </div>
        </motion.div>

        {/* Values */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Valorile Noastre
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <motion.div
                  key={value.title}
                  variants={itemVariants}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="p-6 bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-xl hover:border-gray-600/50 transition-all group relative overflow-hidden"
                >
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${value.color} opacity-0 group-hover:opacity-10 transition-opacity`}
                  />
                  <div className="relative z-10">
                    <motion.div
                      className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${value.color} mb-4`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </motion.div>
                    <h3 className="text-xl font-semibold mb-2 text-white">{value.title}</h3>
                    <p className="text-gray-400">{value.description}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </main>
  )
}

