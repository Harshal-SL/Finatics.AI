import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Facebook, Frame, Instagram, Linkedin, Youtube } from 'lucide-react';

/**
 * Footer Section Component
 * 
 * An animated footer with smooth scroll-into-view effects.
 * Features:
 * - Animated entrance with blur and fade effects
 * - Responsive grid layout
 * - Social media links with icons
 * - Respects reduced motion preferences
 * - Radial gradient background effect
 * 
 * @returns {JSX.Element} Animated footer component
 */

const footerLinks = [
  {
    label: 'Product',
    links: [
      { title: 'Features', href: '#features' },
      { title: 'Pricing', href: '#pricing' },
      { title: 'Testimonials', href: '#testimonials' },
      { title: 'Integration', href: '/' },
    ],
  },
  {
    label: 'Company',
    links: [
      { title: 'FAQs', href: '/faqs' },
      { title: 'About Us', href: '/about' },
      { title: 'Privacy Policy', href: '/privacy' },
      { title: 'Terms of Services', href: '/terms' },
    ],
  },
  {
    label: 'Resources',
    links: [
      { title: 'Blog', href: '/blog' },
      { title: 'Changelog', href: '/changelog' },
      { title: 'Brand', href: '/brand' },
      { title: 'Help', href: '/help' },
    ],
  },
  {
    label: 'Social Links',
    links: [
      { title: 'Facebook', href: 'https://facebook.com', icon: Facebook },
      { title: 'Instagram', href: 'https://instagram.com', icon: Instagram },
      { title: 'Youtube', href: 'https://youtube.com', icon: Youtube },
      { title: 'LinkedIn', href: 'https://linkedin.com', icon: Linkedin },
    ],
  },
];

/**
 * AnimatedContainer - Wraps children with scroll animation
 * 
 * @param {Object} props
 * @param {string} props.className - Additional CSS classes
 * @param {number} props.delay - Animation delay in seconds
 * @param {React.ReactNode} props.children - Child elements to animate
 */
function AnimatedContainer({ className, delay = 0.1, children }) {
  const shouldReduceMotion = useReducedMotion();

  // Skip animation if user prefers reduced motion
  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ filter: 'blur(4px)', translateY: -8, opacity: 0 }}
      whileInView={{ filter: 'blur(0px)', translateY: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Footer Component
 * 
 * Main footer with company info, navigation links, and social media
 */
export function Footer() {
  return (
    <footer className="md:rounded-t-6xl relative w-full max-w-6xl mx-auto flex flex-col items-center justify-center rounded-t-4xl border-t bg-[radial-gradient(35%_128px_at_50%_0%,theme(backgroundColor.white/8%),transparent)] px-6 py-12 lg:py-16">
      {/* Decorative top line */}
      <div className="bg-foreground/20 absolute top-0 right-1/2 left-1/2 h-px w-1/3 -translate-x-1/2 -translate-y-1/2 rounded-full blur" />

      <div className="grid w-full gap-8 xl:grid-cols-3 xl:gap-8">
        {/* Company Logo and Copyright */}
        <AnimatedContainer className="space-y-4">
          <Frame className="size-8 text-white" />
          <p className="text-white mt-8 text-sm md:mt-0">
            © {new Date().getFullYear()} Finatics.AI. All rights reserved.
          </p>
        </AnimatedContainer>

        {/* Footer Links Grid */}
        <div className="mt-10 grid grid-cols-2 gap-8 md:grid-cols-4 xl:col-span-2 xl:mt-0">
          {footerLinks.map((section, index) => (
            <AnimatedContainer key={section.label} delay={0.1 + index * 0.1}>
              <div className="mb-10 md:mb-0">
                <h3 className="text-xs font-semibold text-white">{section.label}</h3>
                <ul className="text-white mt-4 space-y-2 text-sm">
                  {section.links.map((link) => {
                    const IconComponent = link.icon;
                    return (
                      <li key={link.title}>
                        <a
                          href={link.href}
                          className="hover:text-primary inline-flex items-center transition-all duration-300"
                        >
                          {IconComponent && <IconComponent className="me-1 size-4" />}
                          {link.title}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </AnimatedContainer>
          ))}
        </div>
      </div>
    </footer>
  );
}

export default Footer;
