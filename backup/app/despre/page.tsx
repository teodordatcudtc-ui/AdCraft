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
  },
  {
    icon: Rocket,
    title: 'Viteză Excepțională',
    description: 'Generează reclame profesionale în câteva secunde, economisind timp și resurse.',
  },
  {
    icon: Target,
    title: 'Optimizare Perfectă',
    description: 'Fiecare reclamă este adaptată pentru target-ul tău specific, maximizând conversiile.',
  },
  {
    icon: Shield,
    title: 'Securitate Maximă',
    description: 'Datele tale sunt protejate cu standarde de securitate enterprise-grade.',
  },
  {
    icon: Users,
    title: 'Echipa Expertă',
    description: 'O echipă dedicată de specialiști în AI și marketing digital la dispoziția ta.',
  },
  {
    icon: Globe,
    title: 'Global & Local',
    description: 'Suport pentru multiple limbi și adaptare culturală pentru piața ta.',
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
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-light mb-8 tracking-tight">
            <span className="text-white">Despre</span>
            <br />
            <span className="text-[#771967]">Noi</span>
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto font-light">
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
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-32"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="text-center p-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl hover:border-white/30 transition-all"
            >
              <div className="text-4xl sm:text-5xl font-light text-white mb-3 tracking-tight">
                {stat.value}
              </div>
              <div className="text-sm text-gray-400 font-light">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto mb-32"
        >
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-12 sm:p-16">
            <h2 className="text-4xl sm:text-5xl font-light mb-8 text-white tracking-tight">
              Misiunea Noastră
            </h2>
            <div className="space-y-6 text-lg text-gray-300 leading-relaxed font-light">
              <p>
                Creăm o platformă care democratizează accesul la tehnologii avansate de AI pentru 
                generarea de reclame. Vrem ca orice business, indiferent de mărime, să poată crea 
                campanii publicitare profesionale și eficiente.
              </p>
              <p>
                Prin combinarea inteligenței artificiale cu expertiza noastră în marketing, 
                transformăm ideile în reclame care convertesc și cresc business-ul tău.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Values */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-32"
        >
          <h2 className="text-5xl sm:text-6xl font-light text-center mb-20 text-white tracking-tight">
            Valorile Noastre
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <motion.div
                  key={value.title}
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  className="p-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl hover:border-white/30 transition-all group"
                >
                  <div className="mb-6">
                    <div className="inline-flex p-4 rounded-2xl bg-[#771967]/20 border border-[#771967]/30">
                      <Icon className="w-6 h-6 text-[#771967]" />
                    </div>
                  </div>
                  <h3 className="text-xl font-medium mb-3 text-white tracking-tight">{value.title}</h3>
                  <p className="text-gray-400 leading-relaxed font-light">{value.description}</p>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </main>
  )
}
