"use client"; 

import Link from 'next/link';
import { motion } from 'framer-motion';

// --- TEAM DATA ---
const TEAM_MEMBERS = [
  { id: 1, name: "Jahmelle Dorias", role: "Backend Developer", img: "/images/team/Jahmell.jpg" },
  { id: 2, name: "Mary Garganera", role: "UI/UX Developer", img: "/images/team/Mary.jpg" },
  { id: 3, name: "Jude Garingalo", role: "Full Stack Developer", img: "/images/team/Jude.jpg" },
  { id: 4, name: "Kristine Ignas", role: "UI/UX Developer", img: "/images/team/Kristine.jpg" },
  { id: 5, name: "Gabrielle Madarang", role: "Graphic Designer", img: "/images/team/Gab.jpg" },
  { id: 6, name: "Andrea Malicdem", role: "UI/UX Developer", img: "/images/team/Sai.jpg" },
  { id: 7, name: "Trisha Mostoles", role: "UI/UX Developer", img: "/images/team/Trisha.jpg" },
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
  // Splits the data into two rows
  const firstRow = TEAM_MEMBERS.slice(0, 4);
  const secondRow = TEAM_MEMBERS.slice(4, 7);

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Subtle Dotted Background Pattern */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-50"></div>

      {/* --- NAVBAR (Updated per image_2e0ab8.png) --- */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-5 max-w-7xl mx-auto bg-white/80 backdrop-blur-md">
        
        {/* Logo */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center w-24 h-auto"
        >
          <img 
            src="/images/logo.png" 
            alt="Echo Logo" 
            className="w-full h-auto object-contain"
          />
        </motion.div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-12 text-sm font-medium text-gray-600">
          <Link href="#features" className="hover:text-[#5A22C3] transition">Features</Link>
          <Link href="#developers" className="hover:text-[#5A22C3] transition">Developers</Link>
          <Link href="#about-us" className="hover:text-[#5A22C3] transition">About Us</Link>
        </div>

        {/* Action Button */}
        <div className="flex items-center">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2 bg-[#5A22C3] text-white rounded-lg hover:bg-[#4a1ca3] transition shadow-md font-medium"
          >
            Get started
          </motion.button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <main className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        <motion.div 
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-xl"
        >
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6 text-gray-900">
            Intelligent audio learning platform
          </h1>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Process multiple file formats into structured, concise, and interactive audio study guides.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 bg-[#5A22C3] text-white font-medium rounded-md hover:bg-[#4a1ca3] transition shadow-md whitespace-nowrap"
            >
              Get started
            </motion.button>
          </div>
          <p className="text-xs text-gray-500 mt-3">We value your privacy. See our privacy policy.</p>
        </motion.div>

        <div className="relative w-full flex justify-center lg:justify-end">
          <motion.div 
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-16 bottom-12 w-32 h-32 z-20 pointer-events-none"
          >
            <img src="/images/Hand-drawn arrow.png" alt="Arrow" className="w-full h-full object-contain" />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative w-full max-w-[500px] aspect-[4/5] border border-gray-200 rounded-sm shadow-xl overflow-hidden flex items-center justify-center"
          >
            {/* 1. YOUR NEW IMAGE */}
            <img 
              src="/images/landing 6.png" 
              alt="Video Thumbnail" 
              className="absolute inset-0 w-full h-full object-cover"
            />
          </motion.div>
        </div>
      </main>

      {/* --- MAIN FEATURES INTRO --- */}
      <motion.section id="features" {...fadeInUp} className="relative z-10 max-w-4xl mx-auto px-8 py-20 text-center">
        <h3 className="text-[#5A22C3] font-semibold text-sm tracking-wide uppercase mb-3">Main Features</h3>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Smart Learning Companion</h2>
        <p className="text-gray-600 text-lg leading-relaxed mb-8">
          Instead of a static tool, this feature acts as an empathetic digital partner that monitors the user’s interaction with dense academic materials. It utilizes a linguistic analysis algorithm to measure the density of an uploaded document, calculating sentence complexity and academic jargon frequency. The Companion proactively interacts with the user via a “Cognitive Load” visualizer. If the system detects a high probability of mental fatigue, the Companion suggests “Audio Chunks,” breaking a 60 minute document into manageable segments to preserve the user’s attention span. It transforms a modern frustration–mental shutdown during workplace immersion–into an invisible convenience by ensuring the student remains mentally fresh through structured, AI-guided pacing.
        </p>
      </motion.section>

      {/* --- EXAM MODE BOOSTER SECTION --- */}
      <section id="exam-mode" className="relative z-10 max-w-7xl mx-auto px-8 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-12 h-12 bg-[#F3E8FF] rounded-full flex items-center justify-center mb-6">
            <img src="/images/message-chat-circle.png" alt="Exam Mode Icon" className="w-7 h-7 object-contain" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Exam Mode Booster</h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-8">
            This feature automates the extraction of high-value information by scanning documents for structural cues such as bolded terms, definitions and summary sections. It instantly generates a “High-Priority Audio Brief.” Instead of listening to the entire document, the user can toggle “Exam Mode” to hear only the critical definitions and potential test questions, significantly reducing study time while increasing focus on essential data.
          </p>
          <ul className="space-y-4">
            {["Automated Summarization", "Concise and Interactive", "Interactive Skim-Sync"].map((item, index) => (
              <li key={index} className="flex items-center gap-3 text-gray-700 font-medium">
                <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-[#5A22C3] flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-[#5A22C3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          className="relative rounded-2xl overflow-hidden "
        >
          <img src="/images/landing 2.png" alt="Exam Mode" className="w-full h-auto object-cover" />
        </motion.div>
      </section>
      
      {/* --- INSTANT AUDIO CONVERSION / SKIM-SYNC --- */}
      <section id="skim-sync" className="relative z-10 max-w-7xl mx-auto px-8 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-2xl overflow-hidden "
        >
          <img src="/images/landing 3.png" alt="Skim-Sync" className="w-full h-auto object-cover" />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="order-1 lg:order-2"
        >
          <div className="w-12 h-12 bg-[#F3E8FF] rounded-full flex items-center justify-center mb-6">
            <img src="/images/Icon (2).png" alt="Icon" className="w-7 h-7 object-contain" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Instant Audio Conversion</h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-8">
           This creates a simultaneous multimodal learning environment where the web application highlights the corresponding text on the screen in real-time as the audio brief plays. By allowing users to skim with their eyes while absorbing with their ears, it caters to different learning styles and helps keep the user’s place in the document even in high-distraction environments like a commute.
          </p>
          <ul className="space-y-4">
            {["Interactive audio guides", "Cross-device access", "Active Recall Check-ins"].map((item, index) => (
              <li key={index} className="flex items-center gap-3 text-gray-700 font-medium">
                <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-[#5A22C3] flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-[#5A22C3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <section id="active-recall" className="relative z-10 max-w-7xl mx-auto px-8 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-12 h-12 bg-[#F3E8FF] rounded-full flex items-center justify-center mb-6">
            <img src="/images/chart-breakout-square.png" alt="Chart Icon" className="w-7 h-7 object-contain" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Track Learning Progress</h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-8">
            The purpose of this feature is to transform passive listening into an active, high-retention learning session. At logical breaks in the audio brief, the system pauses and asks context-aware questions in either English or Tagalog. The user provides a verbal or text response to continue playback. This acts as a digital bridge to foundational mastery, ensuring the user is actively processing and retaining the information rather than letting it become background noise.
          </p>
          <ul className="space-y-4">
            {["Analyze key data insights", "Automated progress reports", "Universal Document Merger"].map((item, index) => (
              <li key={index} className="flex items-center gap-3 text-gray-700 font-medium">
                <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-[#5A22C3] flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-[#5A22C3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          className="relative rounded-2xl overflow-hidden "
        >
          <img src="/images/landing 4.png" alt="Progress Tracking" className="w-full h-auto object-cover" />
        </motion.div>
      </section>

      {/* --- ABOUT US SECTION --- */}
      <motion.section id="about-us" {...fadeInUp} className="relative z-10 max-w-4xl mx-auto px-8 py-24 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">About Us</h2>
        <p className="text-gray-600 text-base leading-relaxed">
Our journey began with a shared frustration: the sheer exhaustion of staring at endless walls of text in academic PDFs.  We recognized that for Filipino college students, especially those balancing part-time jobs, leadership roles, and long commutes, the sheer volume of static PDFs often leads to cognitive overload and mental exhaustion. Our mission was to create a "digital bridge" that moves beyond passive reading, utilizing auditory processing and multimodal learning to improve retention while preserving the user's mental energy. By integrating features like Burnout Detection and Active Recall, we built an empathetic learning companion that turns lost hours into high-utility study sessions, ensuring that students can stay productive without the burnout.        </p>
      </motion.section>

      {/* --- MEET THE DEVELOPERS SECTION --- */}
      <section id="developers" className="relative z-10 max-w-7xl mx-auto px-8 pb-32">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Meet the Developers</h2>

        {/* First Row */}
        <motion.div 
          variants={staggerContainer}
          initial="initial"
          whileInView="whileInView"
          className="flex flex-wrap justify-center gap-6 mb-8"
        >
          {firstRow.map((dev) => (
            <motion.div 
              key={dev.id} 
              variants={fadeInUp}
              className="bg-[#f0f2f5] rounded-xl p-6 flex flex-col items-center w-full sm:w-[240px] transition-shadow hover:shadow-lg"
            >
              <div className="w-full aspect-square bg-[#d9dde3] rounded-lg overflow-hidden mb-6 flex items-center justify-center relative">
                <img 
                  src={dev.img} 
                  alt={dev.name} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <h4 className="font-bold text-gray-900 text-xl mb-1">{dev.name}</h4>
              <p className="text-gray-500 text-sm uppercase tracking-wide">{dev.role}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Second Row */}
        <motion.div 
          variants={staggerContainer}
          initial="initial"
          whileInView="whileInView"
          className="flex flex-wrap justify-center gap-6"
        >
          {secondRow.map((dev) => (
            <motion.div 
              key={dev.id} 
              variants={fadeInUp}
              className="bg-[#f0f2f5] rounded-xl p-6 flex flex-col items-center w-full sm:w-[240px] transition-shadow hover:shadow-lg"
            >
              <div className="w-full aspect-square bg-[#d9dde3] rounded-lg overflow-hidden mb-6 flex items-center justify-center relative">
                <img 
                  src={dev.img} 
                  alt={dev.name} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <h4 className="font-bold text-gray-900 text-xl mb-1">{dev.name}</h4>
              <p className="text-gray-500 text-sm uppercase tracking-wide">{dev.role}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}