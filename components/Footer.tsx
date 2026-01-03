'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sparkles, Github, Twitter, Linkedin, Mail, Info } from 'lucide-react'

const footerLinks = {
  product: [
    { name: 'Funcționalități', href: '/functionalitati' },
    { name: 'Prețuri', href: '/preturi' },
    { name: 'API', href: '#' },
    { name: 'Documentație', href: '#' },
  ],
  company: [
    { name: 'Despre', href: '/despre' },
    { name: 'Blog', href: '#' },
    { name: 'Cariere', href: '#' },
    { name: 'Contact', href: '/contact' },
  ],
  legal: [
    { name: 'Termeni', href: '#' },
    { name: 'Confidențialitate', href: '#' },
    { name: 'Cookie-uri', href: '#' },
  ],
}

const socialLinks = [
  { icon: Github, href: '#', label: 'GitHub' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Mail, href: '#', label: 'Email' },
]

export default function Footer() {
  return (
    <footer className="relative border-t border-gray-800 bg-gray-900/50 backdrop-blur-xl">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4 group">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                <Sparkles className="w-8 h-8 text-blue-400" />
              </motion.div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              AdLence.ai
            </span>
            </Link>
            <p className="text-gray-400 text-sm max-w-md mb-4">
              AdLence.ai - Platformă avansată pentru generarea de reclame optimizate. 
              Transformă produsele tale în campanii publicitare de succes.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => {
                const Icon = social.icon
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                    aria-label={social.label}
                  >
                    <Icon size={20} />
                  </motion.a>
                )
              })}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Produs</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Companie</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Disclaimer subtil */}
        <div className="pt-6 border-t border-gray-800/50">
          <div className="flex items-start gap-2 max-w-2xl">
            <Info className="w-3.5 h-3.5 text-gray-600 mt-0.5 flex-shrink-0" />
            <p className="text-[10px] text-gray-600 leading-relaxed">
              Conținut generat de AI. Rezultatele pot varia și ar trebui verificate. AdLence.ai utilizează inteligență artificială pentru a genera conținut, iar rezultatele pot conține erori ocazionale.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} AdLence.ai. Toate drepturile rezervate.
          </p>
          <p className="text-gray-500 text-sm">
            Construit cu <span className="text-red-500">❤</span> și AI
          </p>
        </div>
      </div>
    </footer>
  )
}

