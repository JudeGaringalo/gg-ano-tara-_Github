"use client";

import { useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import BackToTop from './components/BackToTop';
// 1. Import ReactLenis
import { ReactLenis } from '@studio-freight/react-lenis';

// --- TEAM DATA ---
const TEAM_MEMBERS = [
  { id: 1, name: "Jahmelle Dorias", role: "Backend Developer", img: "/images/team/jahmell.jpg" },
  { id: 2, name: "Mary Garganera", role: "UI/UX Developer", img: "/images/team/mary.jpg" },
  { id: 3, name: "Jude Garingalo", role: "Full Stack Developer", img: "/images/team/jude.jpg" },
  { id: 4, name: "Kristine Ignas", role: "UI/UX Developer", img: "/images/team/kristine.jpg" },
  { id: 5, name: "Gabrielle Madarang", role: "Graphic Designer", img: "/images/team/gab.jpg" },
  { id: 6, name: "Andrea Malicdem", role: "UI/UX Developer", img: "/images/team/sai.jpg" },
  { id: 7, name: "Trisha Mostoles", role: "UI/UX Developer", img: "/images/team/trisha.jpg" },
];

// Animation presets
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.1 } },
  viewport: { once: true }
};

export default function LandingPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play()
        .then(() => setIsPlaying(true))
        .catch((error) => {
          console.error("Playback failed:", error);
          setIsPlaying(false);
        });
    }
  };

  return (
    // 2. Wrap the component in ReactLenis and define options for web & mobile
    <ReactLenis root options={{ lerp: 0.1, duration: 1.2, smoothWheel: true }}>
      <div className="min-h-screen bg-white relative overflow-x-hidden">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-50"></div>

        {/* --- FIXED NAVBAR --- */}
        <nav className="fixed top-0 left-0 right-0 z-[100] px-6 md:px-8 py-5 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center w-20 md:w-24 h-auto"
            >
              <img 
                src="/images/logo.png" 
                alt="Echo Logo" 
                className="w-full h-auto object-contain"
                style={{ filter: 'invert(18%) sepia(88%) saturate(4535%) hue-rotate(262deg) brightness(82%) contrast(92%)' }}
              />
            </motion.div>

            {/* Desktop Links */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden md:flex items-center gap-8 lg:gap-12 text-sm font-medium text-gray-600"
            >
              <Link href="#features" className="hover:text-[#5A22C3] transition">Features</Link>
              <Link href="#developers" className="hover:text-[#5A22C3] transition">Developers</Link>
              <Link href="#about-us" className="hover:text-[#5A22C3] transition">About Us</Link>
            </motion.div>

            <div className="flex items-center gap-4">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="hidden md:block"
              >
                <Link href="/login">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-5 py-2 bg-[#5A22C3] text-white rounded-lg hover:bg-[#4a1ca3] transition shadow-md font-medium text-sm"
                  >
                    Get started
                  </motion.button>
                </Link>
              </motion.div>

              {/* Mobile Menu Toggle Button */}
              <button 
                className="md:hidden text-gray-600 focus:outline-none"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Dropdown Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden mt-4 flex flex-col gap-4 overflow-hidden bg-white/95 rounded-lg"
              >
                <Link href="#features" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 hover:text-[#5A22C3] font-medium transition px-2 py-1">Features</Link>
                <Link href="#developers" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 hover:text-[#5A22C3] font-medium transition px-2 py-1">Developers</Link>
                <Link href="#about-us" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 hover:text-[#5A22C3] font-medium transition px-2 py-1">About Us</Link>
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <button className="w-full mt-2 px-5 py-3 bg-[#5A22C3] text-white rounded-lg hover:bg-[#4a1ca3] transition shadow-md font-medium text-sm">
                    Get started
                  </button>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* --- MAIN CONTENT (with top padding to account for fixed nav) --- */}
        <div className="pt-24 md:pt-32">
          {/* --- HERO SECTION --- */}
          <main className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 pb-16 md:pb-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-xl text-center lg:text-left mx-auto lg:mx-0 order-2 lg:order-1"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.2] lg:leading-[1.1] mb-6 text-gray-900">
                Intelligent Audio Learning Platform
              </h1>
              <p className="text-base md:text-lg text-gray-600 mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0">
                Process multiple file formats into structured, concise, and interactive audio study guides.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 max-w-lg lg:max-w-xl mx-auto lg:mx-0">
                <Link href="/login" className="w-full sm:w-auto">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-4 bg-[#5A22C3] text-white font-semibold rounded-md hover:bg-[#4a1ca3] transition shadow-lg whitespace-nowrap w-full sm:w-64"
                  >
                    Get started
                  </motion.button>
                </Link>
              </div>
              <p className="text-xs text-gray-500 mt-4">Start your learning journey today.</p>
            </motion.div>

            <div className="relative w-full flex justify-center lg:justify-end order-1 lg:order-2">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                onClick={togglePlay}
                className="relative w-full max-w-[320px] sm:max-w-[450px] lg:max-w-[500px] aspect-[4/5] rounded-xl overflow-hidden flex items-center justify-center z-10 cursor-pointer group shadow-2xl mx-auto"
              >
                <video 
                  ref={videoRef}
                  src="/images/landingvid.mp4" 
                  className="absolute inset-0 w-full h-full object-cover"
                  playsInline
                  muted
                  onEnded={() => setIsPlaying(false)}
                />
                <AnimatePresence>
                  {!isPlaying && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.1 }}
                      className="relative z-20 w-16 h-16 md:w-20 md:h-20 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/50 group-hover:bg-white/40 transition-colors shadow-lg"
                    >
                      <div className="w-0 h-0 border-t-[10px] md:border-t-[12px] border-t-transparent border-l-[16px] md:border-l-[20px] border-l-white border-b-[10px] md:border-b-[12px] border-b-transparent ml-2" />
                    </motion.div>
                  )}
                </AnimatePresence>
                {!isPlaying && <div className="absolute inset-0 bg-black/10 z-10" />}
              </motion.div>
            </div>
          </main>

          {/* --- MAIN FEATURES INTRO --- */}
          <motion.section id="features" {...fadeInUp} className="relative z-10 max-w-4xl mx-auto px-6 md:px-8 py-16 md:py-20 text-center">
            <h3 className="text-[#5A22C3] font-semibold text-xs md:text-sm tracking-wide uppercase mb-3">Main Features</h3>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Smart Learning Companion</h2>
            <p className="text-gray-600 text-sm md:text-lg leading-relaxed mb-8">
              Instead of a static tool, this feature acts as an empathetic digital partner that monitors the user’s interaction with dense academic materials. It utilizes a linguistic analysis algorithm to measure the density of an uploaded document, calculating sentence complexity and academic jargon frequency. The Companion proactively interacts with the user via a “Cognitive Load” visualizer. If the system detects a high probability of mental fatigue, the Companion suggests “Audio Chunks,” breaking a 60 minute document into manageable segments to preserve the user’s attention span.
            </p>
          </motion.section>

          {/* --- EXAM MODE BOOSTER SECTION --- */}
          <section id="exam-mode" className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left order-2 lg:order-1"
            >
              <div className="w-12 h-12 bg-[#F3E8FF] rounded-full flex items-center justify-center mb-6 mx-auto lg:mx-0">
                <img src="/images/message-chat-circle.png" alt="Exam Mode Icon" className="w-7 h-7 object-contain" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Exam Mode Booster</h2>
              <p className="text-gray-600 text-sm md:text-lg leading-relaxed mb-8">
                This feature automates the extraction of high-value information by scanning documents for structural cues such as bolded terms, definitions and summary sections. It instantly generates a “High-Priority Audio Brief.” Instead of listening to the entire document, the user can toggle “Exam Mode” to hear only the critical definitions and potential test questions, significantly reducing study time while increasing focus on essential data.
              </p>
              <ul className="space-y-4 inline-block text-left w-full sm:w-auto">
                {["Automated Summarization", "Concise and Interactive", "Interactive Skim-Sync"].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-gray-700 font-medium text-sm md:text-base">
                    <div className="flex-shrink-0 w-5 h-5 md:w-6 md:h-6 rounded-full border-2 border-[#5A22C3] flex items-center justify-center">
                      <svg className="w-3 h-3 md:w-3.5 md:h-3.5 text-[#5A22C3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative rounded-2xl overflow-hidden order-1 lg:order-2"
            >
              <img src="/images/landing 2.png" alt="Exam Mode" className="w-full h-auto object-cover rounded-xl shadow-lg" />
            </motion.div>
          </section>
          
          {/* --- INSTANT AUDIO CONVERSION / SKIM-SYNC --- */}
          <section id="skim-sync" className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative rounded-2xl overflow-hidden"
            >
              <img src="/images/landing 3.png" alt="Skim-Sync" className="w-full h-auto object-cover rounded-xl shadow-lg" />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              <div className="w-12 h-12 bg-[#F3E8FF] rounded-full flex items-center justify-center mb-6 mx-auto lg:mx-0">
                <img src="/images/Icon (2).png" alt="Icon" className="w-7 h-7 object-contain" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Instant Audio Conversion</h2>
              <p className="text-gray-600 text-sm md:text-lg leading-relaxed mb-8">
                This creates a simultaneous multimodal learning environment where the web application highlights the corresponding text on the screen in real-time as the audio brief plays. By allowing users to skim with their eyes while absorbing with their ears, it caters to different learning styles and helps keep the user’s place in the document even in high-distraction environments like a commute.
              </p>
              <ul className="space-y-4 inline-block text-left w-full sm:w-auto">
                {["Interactive audio guides", "Cross-device access", "Active Recall Check-ins"].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-gray-700 font-medium text-sm md:text-base">
                    <div className="flex-shrink-0 w-5 h-5 md:w-6 md:h-6 rounded-full border-2 border-[#5A22C3] flex items-center justify-center">
                      <svg className="w-3 h-3 md:w-3.5 md:h-3.5 text-[#5A22C3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </section>

          {/* --- TRACK PROGRESS / ACTIVE RECALL --- */}
          <section id="active-recall" className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left order-2 lg:order-1"
            >
              <div className="w-12 h-12 bg-[#F3E8FF] rounded-full flex items-center justify-center mb-6 mx-auto lg:mx-0">
                <img src="/images/chart-breakout-square.png" alt="Chart Icon" className="w-7 h-7 object-contain" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Track Learning Progress</h2>
              <p className="text-gray-600 text-sm md:text-lg leading-relaxed mb-8">
                The purpose of this feature is to transform passive listening into an active, high-retention learning session. At logical breaks in the audio brief, the system pauses and asks context-aware questions in either English or Tagalog. The user provides a verbal or text response to continue playback. This acts as a digital bridge to foundational mastery.
              </p>
              <ul className="space-y-4 inline-block text-left w-full sm:w-auto">
                {["Analyze key data insights", "Automated progress reports", "Universal Document Merger"].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-gray-700 font-medium text-sm md:text-base">
                    <div className="flex-shrink-0 w-5 h-5 md:w-6 md:h-6 rounded-full border-2 border-[#5A22C3] flex items-center justify-center">
                      <svg className="w-3 h-3 md:w-3.5 md:h-3.5 text-[#5A22C3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative rounded-2xl overflow-hidden order-1 lg:order-2"
            >
              <img src="/images/landing 4.png" alt="Progress Tracking" className="w-full h-auto object-cover rounded-xl shadow-lg" />
            </motion.div>
          </section>

          {/* --- ABOUT US SECTION --- */}
          <motion.section id="about-us" {...fadeInUp} className="relative z-10 max-w-4xl mx-auto px-6 md:px-8 py-16 md:py-24 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">About Us</h2>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed">
              Our journey began with a shared frustration: the sheer exhaustion of staring at endless walls of text in academic PDFs. We recognized that for Filipino college students, especially those balancing part-time jobs, leadership roles, and long commutes, the sheer volume of static PDFs often leads to cognitive overload and mental exhaustion. Our mission was to create a "digital bridge" that moves beyond passive reading, utilizing auditory processing and multimodal learning to improve retention while preserving the user's mental energy.
            </p>
          </motion.section>

          {/* --- MEET THE DEVELOPERS SECTION --- */}
          <section id="developers" className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 py-16 md:py-24">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-[#0F172A] text-center mb-16"
            >
              Meet the Developers
            </motion.h2>

            <motion.div 
              variants={staggerContainer}
              initial="initial"
              whileInView="whileInView"
              className="flex flex-wrap justify-center gap-x-10 gap-y-14"
            >
              {TEAM_MEMBERS.map((dev) => (
                <DeveloperCard key={dev.id} dev={dev} />
              ))}
            </motion.div>
          </section>
        </div>
        <BackToTop />
      </div>
    </ReactLenis>
  );
}

function DeveloperCard({ dev }: { dev: any }) {
  return (
    <motion.div 
      variants={fadeInUp}
      className="flex flex-col items-center group w-full max-w-[240px]"
    >
      <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-lg mb-5">
        <img 
          src={dev.img} 
          alt={dev.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#5A22C3] via-transparent to-transparent flex flex-col justify-end p-6">
          <h4 className="text-white font-bold text-lg md:text-xl leading-tight uppercase">
            {dev.name.split(' ').map((word: string, i: number) => (
              <span key={i} className="block">{word}</span>
            ))}
          </h4>
        </div>
      </div>
      <p className="text-[#5A22C3] text-[10px] md:text-[11px] font-bold tracking-[0.15em] uppercase text-center leading-relaxed">
        {dev.role}
      </p>
    </motion.div>
  );
}