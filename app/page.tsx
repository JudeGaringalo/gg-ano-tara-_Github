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
          <button className="px-4 py-2 border border-gray-200 rounded-md hover:bg-gray-50 transition">
            Sign in
          </button>
          <button className="px-4 py-2 bg-[#5A22C3] text-white rounded-md hover:bg-[#4a1ca3] transition shadow-md">
            Get started
          </button>
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

      {/* --- EXAM MODE BOOSTER SECTION --- */}
      <section id="exam-mode" className="relative z-10 max-w-7xl mx-auto px-8 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <div className="w-12 h-12 bg-[#F3E8FF] rounded-full flex items-center justify-center mb-6">
            <img 
              src="/images/message-chat-circle.png" 
              alt="Exam Mode Icon" 
              className="w-7 h-7 object-contain" 
            />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Exam Mode Booster</h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-8">
            This feature automates the extraction of high-value information by scanning documents for structural cues such as bolded terms, definitions and summary sections. It instantly generates a “High-Priority Audio Brief.” Instead of listening to the entire document, the user can toggle “Exam Mode” to hear only the critical definitions and potential test questions, significantly reducing study time while increasing focus on essential data.
          </p>
          
          <ul className="space-y-4">
            {[
              "Automated Summarization",
              "Concise and Interactive",
              "Interactive Skim-Sync"
            ].map((item, index) => (
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
        </div>

        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-100">
          <img 
            src="/images/" 
            alt="Study Environment for Exam Mode" 
            className="w-full h-auto object-cover"
          />
        </div>
      </section>
      
      {/* --- INSTANT AUDIO CONVERSION SECTION --- */}
      <section id="audio-conversion" className="relative z-10 max-w-7xl mx-auto px-8 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Column: Image (Reference image_468498.png) */}
        <div className="order-2 lg:order-1 relative rounded-2xl overflow-hidden shadow-2xl border border-gray-100">
          <img 
            src="/images/" 
            alt="Audio waves visualization" 
            className="w-full h-auto object-cover"
          />
        </div>

        {/* Right Column: Content */}
        <div className="order-1 lg:order-2">
          {/* Icon Container matching the light purple aesthetic */}
          <div className="w-12 h-12 bg-[#F3E8FF] rounded-full flex items-center justify-center mb-6">
            <img 
              src="/images/Icon (2).png" 
              alt="Exam Mode Icon" 
              className="w-7 h-7 object-contain" 
            />
          </div>

          <h2 className="text-4xl font-bold text-gray-900 mb-6">Instant Audio Conversion</h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-8">
            This creates a simultaneous multimodal learning environment where the web application highlights the corresponding text on the screen in real-time as the audio brief plays. By allowing users to skim with their eyes while absorbing with their ears, it caters to different learning styles and helps keep the user's place in the document even in high-distraction environments like a commute.
          </p>
          
          <ul className="space-y-4">
            {[
              "Engage with content through interactive audio",
              "Access audio guides directly from your device",
              "Active Recall Check-ins"
            ].map((item, index) => (
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
        </div>
      </section>

      {/* --- TRACK LEARNING PROGRESS SECTION --- */}
      <section id="track-progress" className="relative z-10 max-w-7xl mx-auto px-8 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Column: Content */}
        <div>
          {/* Icon Container matching the light purple aesthetic */}
          <div className="w-12 h-12 bg-[#F3E8FF] rounded-full flex items-center justify-center mb-6">
            <img 
              src="/images/chart-breakout-square.png" 
              alt="Exam Mode Icon" 
              className="w-7 h-7 object-contain"
            />
          </div>

          <h2 className="text-4xl font-bold text-gray-900 mb-6">Track Learning Progress</h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-8">
            The purpose of this feature is to transform passive listening into an active, high-retention learning session. At logical breaks in the audio brief, the system pauses and asks context-aware questions in either English or Tagalog. The user provides a verbal or text response to continue playback. This acts as a digital bridge to foundational mastery, ensuring the user is actively processing and retaining the information rather than letting it become background noise.
          </p>
          
          <ul className="space-y-4">
            {[
              "Quickly analyze and export key data insights",
              "Schedule automated progress reports to your inbox",
              "Universal Document Merger & Multi-Format Export"
            ].map((item, index) => (
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
        </div>

        {/* Right Column: Image (Reference image_3c1716.png) */}
        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-100">
          <img 
            src="/images/image_3c1716.png" 
            alt="Person working on a" 
            className="w-full h-auto object-cover"
          />
        </div>
      </section>

    </div>
  );
}