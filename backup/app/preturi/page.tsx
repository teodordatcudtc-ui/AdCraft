'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

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
  },
]

export default function Preturi() {
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
            <span className="text-white">Prețuri</span>
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto font-light">
            Alege pachetul de credite perfect pentru nevoile tale. Folosește creditele pentru generare text (3 credite) sau imagini (6 credite).
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-32">
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
                    : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                }`}
              >
                Alege Planul
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-4xl sm:text-5xl font-light text-center mb-16 text-white tracking-tight">
            Întrebări Frecvente
          </h2>
          <div className="space-y-4">
            {[
              {
                q: 'Cum funcționează sistemul de credite?',
                a: 'Fiecare pachet oferă un număr de credite. Generarea de text costă 3 credite, iar generarea de imagini costă 6 credite. Poți folosi creditele oricând, în orice combinație.',
              },
              {
                q: 'Cât costă fiecare generare?',
                a: 'Generarea de text (copywriting) costă 3 credite, iar generarea de imagini costă 6 credite. Poți alege să generezi doar text sau doar imagini, sau ambele.',
              },
              {
                q: 'Ce metode de plată acceptați?',
                a: 'Acceptăm carduri de credit, PayPal și transfer bancar pentru toate pachetele.',
              },
              {
                q: 'Reclamele și textele generate sunt ale mele?',
                a: 'Da, toate reclamele și textele generate sunt 100% ale tale. Nu există watermark-uri sau restricții. Poți folosi conținutul generat comercial fără limitări.',
              },
              {
                q: 'Creditele expiră?',
                a: 'Nu, creditele nu expiră. Le poți folosi oricând, la ritmul tău.',
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl"
              >
                <h3 className="text-white font-medium mb-3 tracking-tight">{faq.q}</h3>
                <p className="text-gray-400 font-light leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </main>
  )
}
