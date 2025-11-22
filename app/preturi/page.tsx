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
      '~10 generări de imagini (5 credite)',
      'Sau combinații personalizate',
      'Suport email',
    ],
    color: 'from-blue-500 to-cyan-500',
    borderColor: 'border-blue-500/50',
  },
  {
    name: 'Pachet 2',
    credits: 120,
    price: 20,
    features: [
      '120 credite',
      '~40 generări de text (3 credite)',
      '~24 generări de imagini (5 credite)',
      'Sau combinații personalizate',
      'Suport priorititar',
    ],
    color: 'from-purple-500 to-pink-500',
    borderColor: 'border-purple-500/50',
    popular: true,
  },
  {
    name: 'Pachet 3',
    credits: 350,
    price: 50,
    features: [
      '350 credite',
      '~116 generări de text (3 credite)',
      '~70 generări de imagini (5 credite)',
      'Sau combinații personalizate',
      'Suport dedicat',
    ],
    color: 'from-orange-500 to-red-500',
    borderColor: 'border-orange-500/50',
  },
]

export default function Preturi() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
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
              Prețuri
            </span>
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed">
            Alege pachetul de credite perfect pentru nevoile tale. Folosește creditele pentru generare text (3 credite) sau imagini (5 credite).
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-20">
          {pricingPackages.map((pkg, index) => (
            <motion.div
              key={pkg.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className={`relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border-2 ${pkg.borderColor} rounded-2xl p-8 ${
                pkg.popular ? 'md:-mt-4 md:mb-4' : ''
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, type: 'spring' }}
                    className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold rounded-full whitespace-nowrap"
                  >
                    Cel Mai Popular
                  </motion.div>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-3xl font-extrabold text-white mb-3 tracking-tight" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '-0.02em' }}>
                  {pkg.name}
                </h3>
                <div className="flex flex-col items-center justify-center mb-4">
                  <span className="text-5xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '-0.03em', lineHeight: '1' }}>
                    {pkg.price}€
                  </span>
                  <p className="text-2xl font-bold text-purple-400 mt-2">{pkg.credits} credite</p>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {pkg.features.map((feature, featureIndex) => (
                  <motion.li
                    key={featureIndex}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 + featureIndex * 0.05 }}
                    className="flex items-start"
                  >
                    <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-200 text-base font-medium leading-relaxed">{feature}</span>
                  </motion.li>
                ))}
              </ul>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`w-full py-4 px-6 font-bold text-base rounded-lg transition-all duration-300 tracking-wide ${
                  pkg.popular
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700'
                }`}
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
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
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Întrebări Frecvente
          </h2>
          <div className="space-y-4">
            {[
              {
                q: 'Cum funcționează sistemul de credite?',
                a: 'Fiecare pachet oferă un număr de credite. Generarea de text costă 3 credite, iar generarea de imagini costă 5 credite. Poți folosi creditele oricând, în orice combinație.',
              },
              {
                q: 'Cât costă fiecare generare?',
                a: 'Generarea de text (copywriting) costă 3 credite, iar generarea de imagini costă 5 credite. Poți alege să generezi doar text sau doar imagini, sau ambele.',
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
                className="p-6 bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-xl"
              >
                <h3 className="text-white font-semibold mb-2">{faq.q}</h3>
                <p className="text-gray-400">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </main>
  )
}

