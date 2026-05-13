"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from "@/app/lib/supabase/client";
import { 
  Upload, FileText, Clock, Home, BrainCircuit, Sparkles, LogOut,
  Files, Search, MoreVertical, CheckCircle2, X, Filter,
  RotateCcw, User, ChevronDown, ChevronUp, Timer,
  Download, Zap, Play, Pause, SkipBack, SkipForward, Volume2, Shuffle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ReactLenis, useLenis } from '@studio-freight/react-lenis';

type TabType = 'home' | 'files' | 'exam' | 'exam-results' | 'skim-sync';

interface StudyFile {
  id: string;
  name: string;
  date: string;
  size: string;
  format: string;
  load: 'Low' | 'Medium' | 'High';
  duration: string;
  filePath?: string; // Needed for the backend parser
}

export default function Dashboard() {
  const router = useRouter();
  const supabase = createClient();
  const lenis = useLenis();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const BRAND_PURPLE = "#581DC6";

  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [files, setFiles] = useState<StudyFile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [selectedLoads, setSelectedLoads] = useState<string[]>([]);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [examSelectedFiles, setExamSelectedFiles] = useState<StudyFile[]>([]);
  const [examUploadedFiles, setExamUploadedFiles] = useState<StudyFile[]>([]);
  const [skimSyncFile, setSkimSyncFile] = useState<StudyFile | null>(null);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const [confidenceRating, setConfidenceRating] = useState<number | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const { data: { session: activeSession } } = await supabase.auth.getSession();
      
      if (!activeSession) {
        router.push('/login');
        return;
      }
      setSession(activeSession);

      const { data: profileData } = await supabase
  .from('profile')
  .select('nickname, username')
  .eq('id', activeSession.user.id)
  .maybeSingle();
      if (profileData) setUserProfile(profileData);

      // Fetch User's Files
      const { data: filesData } = await supabase
        .from('files')
        .select('*')
        .eq('user_id', activeSession.user.id)
        .order('created_at', { ascending: false });

      if (filesData) {
        const mappedFiles: StudyFile[] = filesData.map((f: any) => ({
          id: f.id,
          name: f.file_name,
          date: new Date(f.created_at).toISOString().split('T')[0],
          size: (f.file_size / (1024 * 1024)).toFixed(1) + ' MB',
          format: f.file_type.toUpperCase(),
          load: 'Medium', 
          duration: 'Est. 5 min',
          filePath: f.file_path
        }));
        setFiles(mappedFiles);
      }
    };
    fetchDashboardData();
  }, [router, supabase]);

  useEffect(() => {
    if (lenis) lenis.scrollTo(0, { immediate: true });
    else if (scrollContainerRef.current) scrollContainerRef.current.scrollTo(0, 0);
    else window.scrollTo(0, 0);
  }, [activeTab, lenis]);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleRealUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile || !session) return;
  
    setIsUploading(true);
    showToast("Uploading to Supabase...", "info");
  
    try {
      const fileExt = uploadedFile.name.split('.').pop()?.toLowerCase() || 'txt';
const filePath = `${session.user.id}/${crypto.randomUUID()}.${fileExt}`;

// 1. Upload to Storage
const { data: uploadData, error: uploadError } = await supabase.storage
  .from('documents')
  .upload(filePath, uploadedFile, {
    contentType: uploadedFile.type,
    upsert: false,
  });

if (uploadError) {
  console.error("UPLOAD ERROR:", uploadError);
  throw uploadError;
}

// 2. Insert to DB only after successful upload
const { data: dbRecord, error } = await supabase
  .from('files')
  .insert({
    user_id: session.user.id,
    file_name: uploadedFile.name,
    file_path: filePath,
    file_type: fileExt,
    file_size: uploadedFile.size,
  })
  .select()
  .single();

if (error) throw error;
  
      // 3. Update UI
      setFiles(prev => [{
        id: dbRecord.id,
        name: dbRecord.file_name,
        date: new Date().toISOString().split('T')[0],
        size: (uploadedFile.size / 1024 / 1024).toFixed(1) + ' MB',
        format: fileExt.toUpperCase(),
        load: 'Medium',
        duration: 'Est. 5 min',
        filePath: filePath 
      } as any, ...prev]);
  
      showToast("File ready for Skim-Sync!");
    } catch (err) {
      showToast("Upload failed", "info");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleLogout = async () => {
    setIsProfileOpen(false);
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleStartSkimSync = (file: StudyFile) => {
    setSkimSyncFile(file);
    setActiveTab('skim-sync');
  };

  const filteredFiles = useMemo(() => {
    return files.filter(f => {
      const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFormat = selectedFormats.length === 0 || selectedFormats.includes(f.format);
      const matchesLoad = selectedLoads.length === 0 || selectedLoads.includes(f.load);
      return matchesSearch && matchesFormat && matchesLoad;
    });
  }, [files, searchQuery, selectedFormats, selectedLoads]);

  if (activeTab === 'skim-sync' && skimSyncFile) {
    return (
      <ReactLenis root options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}>
        <style>{`::-webkit-scrollbar { display: none; } * { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
        <div className="min-h-screen bg-[#F9FAFB] font-sans text-[#0F172A]">
           <nav className="sticky top-0 z-40 flex items-center justify-between px-8 py-3 bg-white border-b border-gray-100 shrink-0">
             <div className="flex items-center gap-6">
                <div className="h-8 w-auto font-black text-xl text-[#581DC6]">Sikaptala</div>
                <div className="h-4 w-[1px] bg-slate-200"></div>
                <button onClick={() => setActiveTab('home')} className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-2">
                  <Home size={16} /> Dashboard
                </button>
             </div>
             <div className="flex items-center gap-4">
                <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-red-500 transition-colors">
                  <LogOut size={16} /> Logout
                </button>
             </div>
           </nav>
           <main className="p-6 md:p-8 lg:p-12">
             <SkimSyncView file={skimSyncFile} onBack={() => setActiveTab('home')} />
           </main>
        </div>
      </ReactLenis>
    );
  }

  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}>
      <style>{`::-webkit-scrollbar { display: none; } * { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
      <div className="min-h-screen bg-[#F9FAFB] font-sans text-[#0F172A] flex flex-col relative">
        <input type="file" ref={fileInputRef} onChange={handleRealUpload} className="hidden" accept=".pdf,.docx,.xlsx,.txt" />
        
        <AnimatePresence>
          {toast && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed bottom-8 right-8 z-50 flex items-center gap-3 bg-[#0F172A] text-white px-6 py-4 rounded-2xl shadow-2xl border border-white/10"
            >
              <CheckCircle2 size={20} className="text-green-400" />
              <span className="font-bold text-sm">{toast.message}</span>
              <button onClick={() => setToast(null)} className="ml-4 text-slate-400 hover:text-white"><X size={16}/></button>
            </motion.div>
          )}
        </AnimatePresence>

        <nav className="sticky top-0 z-40 flex items-center justify-between px-8 py-3 bg-white border-b border-gray-100 shrink-0">
          <div className="flex items-center">
            <div className="h-10 w-auto font-black text-2xl text-[#581DC6] flex items-center">Sikaptala</div>
          </div>

          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs ring-2 ring-transparent hover:ring-purple-100 transition-all cursor-pointer shadow-sm active:scale-95" 
              style={{ backgroundColor: BRAND_PURPLE }}
            >
              {userProfile?.nickname?.charAt(0)?.toUpperCase() || 'U'}
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-52 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-20 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-slate-50 mb-1 bg-slate-50/50">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Signed in as</p>
                      <p className="text-xs font-bold text-slate-700 mt-0.5 truncate">{userProfile?.nickname || session?.user?.email || 'User'}</p>
                    </div>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors border-t border-slate-50">
                      <LogOut size={16} /> <span className="font-bold">Logout</span>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </nav>

        <div className="flex flex-col md:flex-row flex-1 min-h-0">
          <aside className="w-full md:w-56 bg-white border-b md:border-b-0 md:border-r border-slate-100 flex flex-col p-4 md:p-5 shrink-0 overflow-hidden z-30">
            <div className="flex flex-col gap-4">
              <nav className="flex flex-col gap-1.5">
                <SidebarItem icon={<Home size={16}/>} label="Home" active={activeTab === 'home'} brandColor={BRAND_PURPLE} onClick={() => setActiveTab('home')} />
                <SidebarItem icon={<Files size={16}/>} label="All files" active={activeTab === 'files'} brandColor={BRAND_PURPLE} onClick={() => setActiveTab('files')} />
                <SidebarItem icon={<BrainCircuit size={16}/>} label="Exam Mode" active={activeTab === 'exam'} brandColor={BRAND_PURPLE} onClick={() => setActiveTab('exam')} />
              </nav>
            </div>
          </aside>

          <main className="flex-1 min-h-0 p-4 sm:p-6 md:p-8 lg:p-12 bg-[#F9FAFB]" ref={scrollContainerRef}>
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                  {activeTab === 'home' && <HomeView BRAND_PURPLE={BRAND_PURPLE} files={files} onUpload={() => fileInputRef.current?.click()} isUploading={isUploading} onAction={showToast} onStartSkimSync={handleStartSkimSync} />}
                  
                  {activeTab === 'files' && (
                      <FilesView 
                          BRAND_PURPLE={BRAND_PURPLE} files={filteredFiles} searchQuery={searchQuery} setSearchQuery={setSearchQuery} 
                          selectedFormats={selectedFormats} setSelectedFormats={setSelectedFormats} selectedLoads={selectedLoads} setSelectedLoads={setSelectedLoads} 
                          onAction={showToast} showFilters={showFilters} setShowFilters={setShowFilters} onStartSkimSync={handleStartSkimSync} 
                      />
                  )}
                  
                  {activeTab === 'exam' && (
                      <ExamView 
                          BRAND_PURPLE={BRAND_PURPLE} files={files} selectedFiles={examSelectedFiles} setSelectedFiles={setExamSelectedFiles} 
                          uploadedFiles={examUploadedFiles} setUploadedFiles={setExamUploadedFiles} onViewBriefs={() => setActiveTab('exam-results')} 
                          onUpload={() => fileInputRef.current?.click()}
                      />
                  )}

                  {activeTab === 'exam-results' && (
                      <PostBriefView BRAND_PURPLE={BRAND_PURPLE} selectedFiles={examSelectedFiles} flippedCards={flippedCards} setFlippedCards={setFlippedCards} confidenceRating={confidenceRating} setConfidenceRating={setConfidenceRating} onBack={() => setActiveTab('exam')} onAction={showToast} />
                  )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </ReactLenis>
  );
}

// ============================================================================
// DYNAMIC SKIM-SYNC LYRIC UI VIEW
// ============================================================================

function SkimSyncView({ file, onBack }: any) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [aiScript, setAiScript] = useState<string>('');
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchScript = async () => {
      try {
        // FIXED: Removed /route.ts from the endpoint URL
        const res = await fetch('/api/process-document', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filePath: file.filePath, fileType: file.format })
        });
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error("Server returned an error:", res.status);
          console.error("Raw response:", errorText);
          throw new Error(`Server responded with status ${res.status}`);
        }

        const data = await res.json();
        setAiScript(data.script || "Could not generate summary.");
        setIsLoading(false);

      } catch (err) {
        console.error("Fetch failed:", err);
        setAiScript("Error connecting to the AI processing server.");
        setIsLoading(false);
      }
    };

    if (file?.filePath) fetchScript();
    else setIsLoading(false);
  }, [file]);

  useEffect(() => {
    return () => window.speechSynthesis.cancel();
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
    } else {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      } else {
        const utterance = new SpeechSynthesisUtterance(aiScript);
        
        // Listen to the onboundary event for the Karaoke effect
        utterance.onboundary = (event) => {
          if (event.name === 'word') {
            setCurrentCharIndex(event.charIndex);
          }
        };

        utterance.onend = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
      }
      setIsPlaying(true);
    }
  };

  const scriptChunks = aiScript.split(/(?<=\.)\s+/);
  let cumulativeLength = 0;

  return (
    <div className="max-w-[1200px] mx-auto pb-[120px] relative">
      <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[28px] md:text-[32px] font-bold tracking-tight text-slate-900 mb-1">
            {file?.name}
          </h1>
          <p className="text-slate-400 text-sm font-medium">Interactive Skim-Sync Mode</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-sm transition-colors shadow-sm">
            Exit
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-8 md:p-12 shadow-sm h-[600px] overflow-y-auto scroll-smooth">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 animate-pulse">
              <BrainCircuit size={48} className="mb-4 text-[#581DC6] animate-spin" />
              <p className="font-bold text-lg">AI is reading and parsing document via GROQ...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {scriptChunks.map((chunk, index) => {
                const chunkStart = cumulativeLength;
                const chunkEnd = chunkStart + chunk.length;
                cumulativeLength = chunkEnd + 1; 

                const isPast = currentCharIndex > chunkEnd;
                const isActive = currentCharIndex >= chunkStart && currentCharIndex <= chunkEnd;

                return (
                  <p key={index} className={`text-2xl md:text-3xl lg:text-4xl leading-snug transition-all duration-300 ${
                    isActive ? 'text-slate-900 font-black scale-[1.02]' : 
                    isPast ? 'text-slate-400 font-medium' : 'text-slate-300 font-medium'
                  }`}>
                    {chunk}
                  </p>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4 text-lg">
              <BrainCircuit size={20} /> Zero-Cost API Mode
            </h3>
            <p className="text-sm text-slate-500 mb-6">Text parsed via serverless functions. Audio synthesized locally via Web Speech API.</p>
            
            <div className="space-y-4 border-t border-slate-100 pt-5">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-500 font-medium">
                  <Clock size={16} className="text-slate-400" /> Word Count
                </span>
                <span className="text-slate-800 font-bold">{aiScript.split(' ').length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 shadow-[0_-10px_30px_rgba(0,0,0,0.03)] z-50">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex flex-col items-center justify-center gap-2 relative">
           <div className="flex items-center justify-center w-full max-w-2xl mt-1 gap-6">
              <button disabled={isLoading} className="text-slate-400 hover:text-slate-800 transition-colors cursor-pointer">
                <SkipBack size={22} className="fill-current" />
              </button>
              <button 
                onClick={togglePlay} disabled={isLoading}
                className="w-14 h-14 bg-[#0F172A] disabled:bg-slate-300 hover:bg-slate-800 rounded-full flex items-center justify-center text-white transition-transform hover:scale-105 shadow-md"
              >
                {isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" className="ml-1" />}
              </button>
              <button disabled={isLoading} className="text-slate-400 hover:text-slate-800 transition-colors cursor-pointer">
                <SkipForward size={22} className="fill-current" />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// OTHER SUB-COMPONENTS
// ============================================================================

function SidebarItem({ icon, label, active, brandColor, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all ${
        active ? 'bg-slate-100 font-semibold shadow-none' : 'text-[#64748B] hover:bg-slate-50 font-medium'
      }`}
      style={active ? { color: brandColor } : {}}
    >
      {icon}
      <span className="text-[14px]">{label}</span>
    </button>
  );
}

function ExamView({ BRAND_PURPLE, files, selectedFiles, setSelectedFiles, uploadedFiles, setUploadedFiles, onViewBriefs, onUpload }: any) {
    const allFiles = [...files, ...uploadedFiles];
    const toggleFileSelection = (file: StudyFile) => {
        setSelectedFiles((prev: StudyFile[]) => {
            if (prev.some((f: StudyFile) => f.id === file.id)) return prev.filter((f: StudyFile) => f.id !== file.id);
            return [...prev, file];
        });
    };

    return (
      <div className="w-full max-w-[1400px] mx-auto">
            <header className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-[32px] font-bold tracking-tight text-slate-900 flex items-center gap-3">Exam Mode Booster</h1>
                        <p className="text-[#64748B] text-lg mt-2">
                            {selectedFiles.length === 0 ? 'Upload or select documents to generate exam briefs' : `${selectedFiles.length} documents selected`}
                        </p>
                    </div>
                </div>
            </header>

            <button onClick={onUpload} className="w-full border-2 border-dashed border-[#E2E8F0] rounded-[24px] sm:rounded-[32px] bg-white p-5 sm:p-6 md:p-8 flex flex-col items-center justify-center mb-12 transition-all hover:border-[#581DC680] group shadow-sm">
              <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-[64px] md:h-[64px] bg-[#F1F5F9] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-[#475569] group-hover:text-[#581DC6]"><Upload size={28} /></div>
              <h3 className="text-[18px] sm:text-[20px] font-bold mb-1 text-center">Upload Study Materials</h3>
              <p className="text-[#64748B] text-sm sm:text-[15px] mb-5 font-medium text-center max-w-md">Select documents to generate exam mode briefs</p>
              <div className="bg-[#0F172A] text-white px-6 sm:px-8 py-2.5 rounded-2xl font-bold text-[13px] sm:text-[14px] group-hover:bg-[#581DC6] transition-colors shadow-lg">Choose Files</div>
            </button>

            <div className="flex items-center justify-between mb-6">
                <h2 className="text-[22px] font-bold flex items-center gap-2 text-slate-900">
                    <Clock size={20} className="text-slate-400" /> Available Documents
                </h2>
                {selectedFiles.length > 0 && (
                    <button onClick={onViewBriefs} className="px-6 py-2.5 bg-[#581DC6] text-white rounded-xl font-bold text-sm hover:bg-opacity-90 transition-all shadow-md flex items-center gap-2">
                        <Sparkles size={16} /> View Flashcards & Reviewer
                    </button>
                )}
            </div>
            <div className="flex flex-col gap-4">
                {allFiles.map((file: any) => (
                    <ExamFileRow key={file.id} file={file} BRAND_PURPLE={BRAND_PURPLE} isSelected={selectedFiles.some((f: StudyFile) => f.id === file.id)} onSelect={() => toggleFileSelection(file)} />
                ))}
            </div>
        </div>
    );
}

function ExamFileRow({ file, BRAND_PURPLE, isSelected, onSelect }: any) {
    return (
        <div className={`bg-white border rounded-[20px] sm:rounded-[24px] p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer group ${isSelected ? `border-[#581DC6] ring-2 ring-[#581DC6]/10 bg-purple-50/30` : 'border-[#F1F5F9] hover:border-slate-200'}`} onClick={onSelect}>
          <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
            <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${isSelected ? `bg-[#581DC6] border-[#581DC6]` : 'border-slate-300 hover:border-slate-400'}`}>
              {isSelected && <CheckCircle2 size={16} className="text-white" fill="white" />}
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[14px] flex items-center justify-center bg-[#F3E8FF] text-[#581DC6] shrink-0">
              <FileText size={22} />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-[14px] sm:text-[16px] leading-tight text-slate-800 line-clamp-2 sm:line-clamp-1 break-words mb-1">{file.name}</h4>
              <div className="flex items-center flex-wrap gap-x-2 sm:gap-x-3 gap-y-1 text-[#94A3B8] text-[11px] sm:text-xs font-medium">
                  <span className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 text-[#64748B] text-[10px] font-bold uppercase">{file.format}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-200" />
                  <span className="flex items-center gap-1">{file.date}</span>
              </div>
            </div>
          </div>
        </div>
    );
}

const generateHighlights = (file: StudyFile) => {
    return [
        { type: 'definition', title: 'Key Concept', content: 'Extracted definition from your document for ' + file.name },
        { type: 'question', title: 'Test Potential', content: 'Focus on high-probability exam questions.' }
    ];
};

function PostBriefView({ BRAND_PURPLE, selectedFiles, flippedCards, setFlippedCards, confidenceRating, setConfidenceRating, onBack, onAction }: any) {
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const allHighlights = selectedFiles.flatMap((file: StudyFile) => {
        const fileHighlights = generateHighlights(file);
        return fileHighlights.filter((h: any) => h.type === 'definition').map((h: any) => ({ ...h, fileId: file.id, fileName: file.name }));
    });

    const toggleFlip = (index: number) => {
        const newFlipped = new Set(flippedCards);
        if (newFlipped.has(index)) newFlipped.delete(index);
        else newFlipped.add(index);
        setFlippedCards(newFlipped);
    };

    return (
      <div className="w-full max-w-[1400px] mx-auto">
            <header className="mb-12">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-[32px] font-bold tracking-tight text-slate-900">Skim Sync Study Session</h1>
                        <p className="text-[#64748B] text-lg mt-2">Master your extracted insights with interactive tools</p>
                    </div>
                    <button onClick={onBack} className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all">← Back</button>
                </div>
            </header>

            <div className="mb-12">
                <h2 className="text-[24px] font-bold mb-2 text-slate-900">Learn with Flashcards</h2>
                <p className="text-slate-600 mb-8">Click to flip.</p>
                {allHighlights.length > 0 ? (
                    <div>
                        <div className="flex flex-col items-center gap-8 mb-8">
                            <motion.div onClick={() => toggleFlip(currentCardIndex)} className="w-full max-w-full sm:max-w-3xl min-h-[18rem] rounded-2xl shadow-2xl cursor-pointer perspective">
                                <motion.div className={`w-full h-full rounded-2xl px-8 py-12 flex flex-col items-center justify-center text-center transition-all border-4 ${flippedCards.has(currentCardIndex) ? 'bg-blue-50 border-blue-300' : 'bg-slate-900 border-slate-700'}`} animate={{ rotateY: flippedCards.has(currentCardIndex) ? 180 : 0 }}>
                                    <div className={`text-3xl font-bold ${flippedCards.has(currentCardIndex) ? 'text-slate-800' : 'text-white'}`}>
                                        {flippedCards.has(currentCardIndex) ? allHighlights[currentCardIndex].content : allHighlights[currentCardIndex].title}
                                    </div>
                                </motion.div>
                            </motion.div>
                            <div className="flex gap-4">
                                <button onClick={() => setCurrentCardIndex(Math.max(0, currentCardIndex - 1))} className="px-6 py-3 rounded-xl font-bold bg-slate-100 text-slate-700">Previous</button>
                                <button onClick={() => setCurrentCardIndex(Math.min(allHighlights.length - 1, currentCardIndex + 1))} className="px-6 py-3 rounded-xl font-bold bg-purple-600 text-white">Next</button>
                            </div>
                        </div>
                    </div>
                ) : <p className="text-center text-slate-400 py-12">No definitions found.</p>}
            </div>
        </div>
    );
}

function FilesView({ files, searchQuery, setSearchQuery, showFilters, setShowFilters, onStartSkimSync }: any) {
  return (
    <div className="w-full max-w-[1400px] mx-auto">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-[32px] font-bold text-slate-900">All Files</h1>
          <p className="text-[#64748B] text-lg font-medium">Total of {files.length} study documents</p>
        </div>
        <div className="relative">
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search files..." className="pl-4 pr-4 py-2.5 bg-white border rounded-xl text-sm w-64 shadow-sm" />
        </div>
      </header>
      <div className="bg-white border border-slate-100 rounded-[24px] shadow-sm overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">File Name</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Format</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {files.map((file: any) => (
              <tr key={file.id} className="hover:bg-slate-50/30">
                <td className="px-6 py-4 font-bold text-[14px] text-slate-700">{file.name}</td>
                <td className="px-6 py-4"><span className="bg-slate-100 px-2 py-1 rounded text-[10px] font-bold text-slate-500 uppercase">{file.format}</span></td>
                <td className="px-6 py-4">
                  <button onClick={() => onStartSkimSync(file)} className="text-white px-4 py-1.5 rounded-lg font-bold text-[12px] bg-[#581DC6]">Skim-Sync</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LoadBadge({ load }: { load: string }) {
  const styles: any = { Low: 'bg-green-50 text-green-700', Medium: 'bg-yellow-50 text-yellow-700', High: 'bg-red-50 text-red-700' };
  return <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md ${styles[load] || styles.Medium}`}>{load} Load</span>;
}

function HomeView({ BRAND_PURPLE, files, onUpload, isUploading, onAction, onStartSkimSync }: any) {
  return (
    <div className="max-w-[1000px] mx-auto">
      <header className="mb-8">
        <h1 className="text-[32px] font-bold text-slate-900">Skim-Sync</h1>
        <p className="text-[#64748B] text-lg mt-1">Ready to tackle your study sessions?</p>
      </header>
      
      <button disabled={isUploading} onClick={onUpload} className="w-full border-2 border-dashed border-[#E2E8F0] rounded-[32px] bg-white p-8 flex flex-col items-center justify-center mb-12 hover:border-[#581DC680] group shadow-sm">
        <div className="w-[64px] h-[64px] bg-[#F1F5F9] rounded-full flex items-center justify-center mb-4"><Upload size={28} className={isUploading ? "animate-bounce" : ""} /></div>
        <h3 className="text-[20px] font-bold mb-1">{isUploading ? "Uploading..." : "Upload Study Materials"}</h3>
        <p className="text-[#64748B] text-[15px] mb-5 font-medium">Drag and drop files here, or click to browse</p>
      </button>

      <h2 className="text-[22px] font-bold mb-6 flex items-center gap-2 text-slate-900"><Clock size={20} className="text-slate-400" /> Recent Files</h2>
      <div className="flex flex-col gap-4">
        {files.slice(0, 4).map((file: any) => (
          <FileRow key={file.id} file={file} BRAND_PURPLE={BRAND_PURPLE} onStartSkimSync={onStartSkimSync} />
        ))}
      </div>
    </div>
  );
}

function FileRow({ file, BRAND_PURPLE, onStartSkimSync }: any) {
  return (
    <div className="bg-white border rounded-[24px] p-5 shadow-sm flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-[14px] flex items-center justify-center bg-[#F3E8FF] text-[#581DC6]"><FileText size={22} /></div>
        <div>
          <h4 className="font-bold text-[16px] text-slate-800">{file.name}</h4>
          <span className="text-xs text-slate-500">{file.format} • {file.date}</span>
        </div>
      </div>
      <button onClick={() => onStartSkimSync(file)} className="text-white px-5 py-2.5 rounded-xl font-bold text-[13px]" style={{ backgroundColor: BRAND_PURPLE }}>Start Learning</button>
    </div>
  );
}