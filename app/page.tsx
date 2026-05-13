import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 relative overflow-hidden">
      {/* Subtle Dotted Background Pattern */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-50"></div>

      {/* --- NAVBAR --- */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 max-w-7xl mx-auto bg-white/80 backdrop-blur-md border-b border-transparent">
        
        {/* Logo Image */}
        <div className="flex items-center w-24 h-auto">
          <img 
            src="/images/logo.png" 
            alt="Echo Logo" 
            className="w-full h-auto object-contain"
          />
        </div>

        {/* Navigation Links (Hidden on Mobile) */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link href="#exam-mode" className="hover:text-purple-700 transition">Exam Mood Booster</Link>
          <Link href="#active-recall" className="hover:text-purple-700 transition">Active Recall</Link>
          <Link href="#document-merger" className="hover:text-purple-700 transition">Document Merger</Link>
          <Link href="#skim-sync" className="hover:text-purple-700 transition">Skim-Sync</Link>
          <Link href="#burnout" className="hover:text-purple-700 transition">Burnout Detection</Link>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-4 text-sm font-medium">
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <main className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Column: Copy & CTA */}
        <div className="max-w-xl">
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
            <button className="px-6 py-3 bg-[#5A22C3] text-white font-medium rounded-md hover:bg-[#4a1ca3] transition shadow-md whitespace-nowrap">
              Get started
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            We value your privacy. See our privacy policy.
          </p>
        </div>

        {/* Right Column: Image & Arrow Placeholders */}
        <div className="relative w-full flex justify-center lg:justify-end">
          
          {/* ARROW IMAGE */}
          <div className="absolute -left-16 bottom-12 w-32 h-32 z-20 pointer-events-none">
            <img 
              src="/images/Hand-drawn arrow.png" 
              alt="Arrow pointing to student" 
              className="w-full h-full object-contain" 
            />
          </div>

          {/* MAIN IMAGE PLACEHOLDER (Left empty as requested) */}
          <div className="relative w-full max-w-[500px] aspect-[4/5] bg-gray-100 border border-gray-200 rounded-sm shadow-xl overflow-hidden flex items-center justify-center">
             {/* <img src="/images/your-student-image.jpg" alt="Student studying" className="absolute inset-0 w-full h-full object-cover" /> */}
             
             {/* Play Button Overlay (Optional, remove if baked into your image) */}
             <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <div className="w-20 h-20 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                  <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-black/70 border-b-[12px] border-b-transparent ml-2"></div>
                </div>
             </div>
          </div>

        </div>
      </main>

      {/* --- FEATURES SECTION --- */}
      <section className="relative z-10 max-w-4xl mx-auto px-8 py-20 text-center">
        <h3 className="text-[#5A22C3] font-semibold text-sm tracking-wide uppercase mb-3">
          Main Features
        </h3>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          Smart Learning Companion
        </h2>
        <p className="text-gray-600 text-lg leading-relaxed mb-8">
          Instead of a static tool, this feature acts as an empathetic digital partner that monitors the user's interaction with dense academic materials. It utilizes a linguistic analysis algorithm to measure the density of an uploaded document, calculating sentence complexity and academic jargon frequency. The Companion proactively interacts with the user via a "Cognitive Load" visualizer. If the system detects a high probability of mental fatigue, the Companion suggests "Audio Chunks," breaking a 60 minute document into manageable segments to preserve the user's attention span. It transforms a modern frustration—mental shutdown during workplace immersion—into an invisible convenience by ensuring the student remains mentally fresh through structured, AI-guided pacing.
        </p>
      </section>

    </div>
  );
}