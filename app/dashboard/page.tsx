"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from "@/app/lib/supabase/client";
import { 
  Upload, 
  FileText, 
  Clock, 
  Home, 
  BrainCircuit, 
  Sparkles, 
  LogOut,
  Files,
  Search,
  MoreVertical,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  X,
  Filter,
  RotateCcw,
  User,
  ChevronDown,
  ChevronUp,
  FileCode,
  Timer,
  ListFilter,
  AlertCircle,
  Download,
  CreditCard,
  BarChart3,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ReactLenis, useLenis } from '@studio-freight/react-lenis';

type TabType = 'home' | 'files' | 'exam' | 'exam-results';

interface StudyFile {
  id: string;
  name: string;
  date: string;
  size: string;
  format: string;
  load: 'Low' | 'Medium' | 'High';
  duration: string;
}

const INITIAL_FILES: StudyFile[] = [
  { id: '1', name: 'Introduction to Psychology.pdf', date: '2026-05-10', size: '2.4 MB', format: 'PDF', load: 'Medium', duration: '45 min' },
  { id: '2', name: 'Advanced Organic Chemistry - Unit 4.pptx', date: '2026-05-12', size: '15.2 MB', format: 'PPTX', load: 'High', duration: '120 min' },
  { id: '3', name: 'Macroeconomics Final Review.docx', date: '2026-05-13', size: '1.1 MB', format: 'DOCX', load: 'Low', duration: '30 min' },
  { id: '4', name: 'Discrete Mathematics Logic Proofs.pdf', date: '2026-05-11', size: '4.8 MB', format: 'PDF', load: 'High', duration: '90 min' },
];

export default function Dashboard() {
  const router = useRouter();
  const supabase = createClient();
  const lenis = useLenis();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const BRAND_PURPLE = "#581DC6";

  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [files, setFiles] = useState<StudyFile[]>(INITIAL_FILES);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [selectedLoads, setSelectedLoads] = useState<string[]>([]);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [examSelectedFiles, setExamSelectedFiles] = useState<StudyFile[]>([]);
  const [examModeEnabled, setExamModeEnabled] = useState(true);
  const [examUploadedFiles, setExamUploadedFiles] = useState<StudyFile[]>([]);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const [confidenceRating, setConfidenceRating] = useState<number | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      }
    };
    checkUser();
  }, [router, supabase]);

  // Scroll to top when tab changes
  useEffect(() => {
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else if (scrollContainerRef.current) {
      requestAnimationFrame(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo(0, 0);
        }
      });
    } else {
      window.scrollTo(0, 0);
    }
  }, [activeTab, lenis]);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpload = () => {
    const newFile: StudyFile = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'New Uploaded Document.pdf',
      date: new Date().toISOString().split('T')[0],
      size: '1.2 MB',
      format: 'PDF',
      load: 'Medium',
      duration: '20 min'
    };
    setFiles([newFile, ...files]);
    showToast("File uploaded successfully!");
  };

  const handleLogout = async () => {
    showToast("Logging out...", 'info');
    setIsProfileOpen(false);
    await supabase.auth.signOut();
    router.push('/login');
  };

  const filteredFiles = useMemo(() => {
    return files.filter(f => {
      const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFormat = selectedFormats.length === 0 || selectedFormats.includes(f.format);
      const matchesLoad = selectedLoads.length === 0 || selectedLoads.includes(f.load);
      return matchesSearch && matchesFormat && matchesLoad;
    });
  }, [files, searchQuery, selectedFormats, selectedLoads]);

  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}>
      <style>{`::-webkit-scrollbar { display: none; } * { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
      <div className="min-h-screen bg-[#F9FAFB] font-sans text-[#0F172A] flex flex-col relative">
        <AnimatePresence>
          {toast && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95 }}
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
            <img 
              src="/images/logo.png" 
              alt="Echo Logo" 
              className="h-10 w-auto object-contain cursor-pointer mr-2" 
              style={{filter:'invert(18%) sepia(88%) saturate(4535%) hue-rotate(262deg) brightness(82%) contrast(92%)'}} 
            />
          </div>

          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs ring-2 ring-transparent hover:ring-purple-100 transition-all cursor-pointer shadow-sm active:scale-95" 
              style={{ backgroundColor: BRAND_PURPLE }}
            >
              TM
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-52 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-20 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-slate-50 mb-1 bg-slate-50/50">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Signed in as</p>
                      <p className="text-xs font-bold text-slate-700 mt-0.5 truncate">Trisha Mostoles</p>
                    </div>
                    <button onClick={() => router.push('/profile')} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                      <User size={16} className="text-slate-400" />
                      <span className="font-medium">My Profile</span>
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors border-t border-slate-50"
                    >
                      <LogOut size={16} />
                      <span className="font-bold">Logout</span>
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
              <motion.div 
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                  {activeTab === 'home' && <HomeView BRAND_PURPLE={BRAND_PURPLE} files={files} onUpload={handleUpload} onAction={showToast} />}
                  
                  {activeTab === 'files' && (
                      <FilesView 
                          BRAND_PURPLE={BRAND_PURPLE} 
                          files={filteredFiles} 
                          searchQuery={searchQuery} 
                          setSearchQuery={setSearchQuery} 
                          selectedFormats={selectedFormats}
                          setSelectedFormats={setSelectedFormats}
                          selectedLoads={selectedLoads}
                          setSelectedLoads={setSelectedLoads}
                          onAction={showToast}
                          showFilters={showFilters}
                          setShowFilters={setShowFilters}
                      />
                  )}
                  
                  {activeTab === 'exam' && (
                      <ExamView 
                          BRAND_PURPLE={BRAND_PURPLE} 
                          files={files}
                          selectedFiles={examSelectedFiles}
                          setSelectedFiles={setExamSelectedFiles}
                          uploadedFiles={examUploadedFiles}
                          setUploadedFiles={setExamUploadedFiles}
                          onViewBriefs={() => setActiveTab('exam-results')}
                      />
                  )}

                  {activeTab === 'exam-results' && (
                      <PostBriefView
                          BRAND_PURPLE={BRAND_PURPLE}
                          selectedFiles={examSelectedFiles}
                          flippedCards={flippedCards}
                          setFlippedCards={setFlippedCards}
                          confidenceRating={confidenceRating}
                          setConfidenceRating={setConfidenceRating}
                          onBack={() => setActiveTab('exam')}
                          onAction={showToast}
                      />
                  )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </ReactLenis>
  );
}

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

function ExamView({ BRAND_PURPLE, files, selectedFiles, setSelectedFiles, uploadedFiles, setUploadedFiles, onViewBriefs }: any) {
    const allFiles = [...files, ...uploadedFiles];

    const handleFileUpload = () => {
        const newFile: StudyFile = {
            id: Math.random().toString(36).substr(2, 9),
            name: 'Uploaded Study Material.pdf',
            date: new Date().toISOString().split('T')[0],
            size: '2.1 MB',
            format: 'PDF',
            load: 'Medium',
            duration: '45 min'
        };
        setUploadedFiles([...uploadedFiles, newFile]);
        setSelectedFiles([...selectedFiles, newFile]);
    };

    const toggleFileSelection = (file: StudyFile) => {
        setSelectedFiles((prev: StudyFile[]) => {
            const isSelected = prev.some((f: StudyFile) => f.id === file.id);
            if (isSelected) {
                return prev.filter((f: StudyFile) => f.id !== file.id);
            } else {
                return [...prev, file];
            }
        });
    };

    return (
      <div className="w-full max-w-[1400px] mx-auto">
            <header className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-[32px] font-bold tracking-tight text-slate-900 flex items-center gap-3">
                            Exam Mode Booster
                        </h1>
                        <p className="text-[#64748B] text-lg mt-2">
                            {selectedFiles.length === 0 
                                ? 'Upload or select documents to generate exam briefs'
                                : `${selectedFiles.length} ${selectedFiles.length === 1 ? 'document' : 'documents'} selected`
                            }
                        </p>
                    </div>
                </div>
            </header>

            {/* Compact Upload Box */}
            <button onClick={handleFileUpload} className="w-full border-2 border-dashed border-[#E2E8F0] rounded-[24px] sm:rounded-[32px] bg-white p-5 sm:p-6 md:p-8 flex flex-col items-center justify-center mb-12 transition-all hover:border-[#581DC680] group shadow-sm">
              <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-[64px] md:h-[64px] bg-[#F1F5F9] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-[#475569] group-hover:text-[#581DC6]"><Upload size={24} className="sm:hidden" /><Upload size={28} className="hidden sm:block" /></div>
              <h3 className="text-[18px] sm:text-[20px] font-bold mb-1 text-center">Upload Study Materials</h3>
              <p className="text-[#64748B] text-sm sm:text-[15px] mb-5 font-medium text-center max-w-md">Select documents to generate exam mode briefs</p>
              <div className="bg-[#0F172A] text-white px-6 sm:px-8 py-2.5 rounded-2xl font-bold text-[13px] sm:text-[14px] group-hover:bg-[#581DC6] transition-colors shadow-lg">Choose Files</div>
            </button>

            {/* Available Documents */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-[22px] font-bold flex items-center gap-2 text-slate-900">
                    <Clock size={20} className="text-slate-400" />
                    Available Documents
                </h2>
                {selectedFiles.length > 0 && (
                    <button
                        onClick={onViewBriefs}
                        className="px-6 py-2.5 bg-[#581DC6] text-white rounded-xl font-bold text-sm hover:bg-opacity-90 transition-all shadow-md flex items-center gap-2"
                    >
                        <Sparkles size={16} />
                        View Flashcards & Reviewer
                    </button>
                )}
            </div>
            <div className="flex flex-col gap-4">
                {allFiles.map((file: any) => {
                    const isSelected = selectedFiles.some((f: StudyFile) => f.id === file.id);
                    return (
                        <ExamFileRow 
                            key={file.id} 
                            file={file} 
                            BRAND_PURPLE={BRAND_PURPLE} 
                            isSelected={isSelected}
                            onSelect={() => toggleFileSelection(file)}
                        />
                    );
                })}
                {allFiles.length === 0 && (
                    <div className="text-center py-12 text-slate-400">
                        <p className="text-sm font-medium">No documents yet. Upload a file to get started!</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function ExamFileRow({ file, BRAND_PURPLE, isSelected, onSelect }: any) {
    return (
        <div className={`bg-white border rounded-[20px] sm:rounded-[24px] p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer group ${isSelected ? `border-[#581DC6] ring-2 ring-[#581DC6]/10 bg-purple-50/30` : 'border-[#F1F5F9] hover:border-slate-200'}`} onClick={onSelect}>
          <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
            <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
                    isSelected 
                        ? `bg-[#581DC6] border-[#581DC6]` 
                        : 'border-slate-300 hover:border-slate-400'
                }`}>
              {isSelected && <CheckCircle2 size={14} className="sm:hidden text-white" fill="white" />}
              {isSelected && <CheckCircle2 size={16} className="hidden sm:block text-white" fill="white" />}
                </div>

            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[14px] flex items-center justify-center bg-[#F3E8FF] text-[#581DC6] shrink-0">
              <FileText size={18} className="sm:hidden" />
              <FileText size={22} className="hidden sm:block" />
                </div>
                <div className="min-w-0">
              <h4 className="font-bold text-[14px] sm:text-[16px] leading-tight text-slate-800 line-clamp-2 sm:line-clamp-1 break-words mb-1">{file.name}</h4>
              <div className="flex items-center flex-wrap gap-x-2 sm:gap-x-3 gap-y-1 text-[#94A3B8] text-[11px] sm:text-xs font-medium">
                        <span className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 text-[#64748B] text-[10px] font-bold uppercase">
                            {file.format}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-slate-200" />
                        <span className="flex items-center gap-1">
                            <Clock size={12} className="text-slate-300" />
                            {file.date}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-slate-200" />
                        <span>{file.size}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-200" />
                        <span className="flex items-center gap-1 text-[#581DC6]">
                            <Timer size={12} />
                            {file.duration}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 sm:px-6">
                <div className="hidden sm:block">
                    <LoadBadge load={file.load} />
                </div>
            </div>
        </div>
    );
}

// Generate highlights helper function
const generateHighlights = (file: StudyFile) => {
    const highlightDatabase: any = {
        '1': [ // Psychology
            { type: 'definition', title: 'Classical Conditioning', content: 'A learning process where a neutral stimulus becomes associated with a meaningful stimulus to produce a behavioral response.' },
            { type: 'definition', title: 'Operant Conditioning', content: 'A method of learning that employs rewards and punishments for behavior.' },
            { type: 'question', title: 'Test Potential', content: 'What are the three main differences between classical and operant conditioning?' },
            { type: 'summary', title: 'Core Principle', content: 'Behavior followed by pleasant consequences is likely to be repeated.' }
        ],
        '2': [ // Chemistry
            { type: 'definition', title: 'Organic Compounds', content: 'Compounds that contain carbon atoms bonded to hydrogen and other elements, forming the backbone of life.' },
            { type: 'definition', title: 'Stereoisomerism', content: 'The arrangement of atoms in space that differs between molecules with the same molecular formula.' },
            { type: 'question', title: 'Exam Focus', content: 'How do you differentiate between E1 and E2 elimination mechanisms in organic chemistry?' },
            { type: 'summary', title: 'Key Concept', content: 'Reaction mechanisms depend on substrate structure, nucleophile strength, and solvent polarity.' }
        ],
        '3': [ // Economics
            { type: 'definition', title: 'Inflation', content: 'A sustained increase in the general price level of goods and services in an economy over time.' },
            { type: 'definition', title: 'Monetary Policy', content: 'Actions taken by central banks to influence the money supply and interest rates.' },
            { type: 'question', title: 'Critical Question', content: 'How does quantitative easing affect long-term economic growth?' },
            { type: 'summary', title: 'Essential Point', content: 'Central banks balance inflation control with employment and growth objectives.' }
        ],
        '4': [ // Discrete Math
            { type: 'definition', title: 'Proof by Induction', content: 'A mathematical proof technique where you prove a base case, then assume the statement is true for n and prove it for n+1.' },
            { type: 'definition', title: 'Predicate Logic', content: 'An extension of propositional logic that uses predicates and quantifiers to express more complex statements.' },
            { type: 'question', title: 'Test Question', content: 'Prove that the sum of the first n natural numbers equals n(n+1)/2 using mathematical induction.' },
            { type: 'summary', title: 'Key Takeaway', content: 'Logic proofs require careful reasoning and complete coverage of all cases.' }
        ]
    };
    
    return highlightDatabase[file.id] || [
        { type: 'definition', title: 'Key Definition', content: 'Extract and master the most important concepts from your document.' },
        { type: 'question', title: 'Test Potential', content: 'Focus on high-probability exam questions.' },
        { type: 'summary', title: 'Core Summary', content: 'Retain only the critical information needed for success.' }
    ];
};

function ExamHighlightsView({ BRAND_PURPLE, selectedFiles, examModeEnabled, setExamModeEnabled, onBack, onProceed }: any) {
    const allHighlights = selectedFiles.flatMap((file: StudyFile) => {
        const fileHighlights = generateHighlights(file);
        return fileHighlights.map((h: any) => ({ ...h, fileId: file.id, fileName: file.name }));
    });

    const filteredHighlights = examModeEnabled 
        ? allHighlights.filter((h: any) => h.type === 'definition' || h.type === 'question')
        : allHighlights;

    return (
      <div className="w-full max-w-[1400px] mx-auto">
            <header className="mb-8">
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
                    >
                        ← Back
                    </button>
                    <div className="flex-1">
                        <h1 className="text-[32px] font-bold tracking-tight text-slate-900 flex items-center gap-3">
                            <Sparkles className="text-purple-500" size={32} />
                            Exam Priority Highlights
                        </h1>
                        <p className="text-[#64748B] text-lg mt-2">
                            From {selectedFiles.length} {selectedFiles.length === 1 ? 'document' : 'documents'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-purple-50 border border-purple-100 rounded-2xl px-6 py-4 w-fit">
                    <div className="flex items-center gap-3 flex-1">
                        <div className={`w-3 h-3 rounded-full transition-colors ${examModeEnabled ? 'bg-purple-500' : 'bg-slate-300'}`} />
                        <div>
                            <p className="text-[10px] font-black uppercase text-purple-700 tracking-wider">Mode</p>
                            <p className="text-sm font-bold text-slate-700">{examModeEnabled ? 'Exam Mode' : 'Full Document'}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setExamModeEnabled(!examModeEnabled)}
                        className={`ml-4 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                            examModeEnabled
                                ? 'bg-purple-600 text-white hover:bg-purple-700'
                                : 'bg-white text-purple-600 border border-purple-200 hover:bg-purple-50'
                        }`}
                    >
                        {examModeEnabled ? 'Disable' : 'Enable'}
                    </button>
                </div>
            </header>

            <div className="bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm">
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                        <ListFilter size={20} className="text-slate-400" />
                        {examModeEnabled ? 'Exam Mode Only' : 'All Content'}
                    </h2>
                    <p className="text-xs text-slate-500">
                        {filteredHighlights.length} highlights extracted
                    </p>
                </div>

                <div className="space-y-3">
                    {filteredHighlights.length > 0 ? (
                        filteredHighlights.map((item: any, i: number) => (
                            <div key={i} className="flex gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                                <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center font-bold text-sm ${
                                    item.type === 'definition' ? 'bg-blue-50 text-blue-600' : 
                                    item.type === 'question' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                                }`}>
                                    {item.type === 'definition' ? 'D' : 
                                     item.type === 'question' ? 'Q' : 'S'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1 gap-2 flex-wrap">
                                        <h4 className="font-bold text-[14px] text-slate-800">{item.title}</h4>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] font-black uppercase tracking-wider whitespace-nowrap ${
                                                item.type === 'definition' ? 'text-blue-600' :
                                                item.type === 'question' ? 'text-rose-600' : 'text-emerald-600'
                                            }`}>{item.type}</span>
                                            <span className="text-[9px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{item.fileName}</span>
                                        </div>
                                    </div>
                                    <p className="text-slate-600 text-sm leading-relaxed">{item.content}</p>
                                </div>
                                <button className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-[#581DC6] transition-all shrink-0">
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-slate-400 py-12 text-sm">No highlights found</p>
                    )}
                </div>
            </div>

            <div className="mt-12">
                <h3 className="text-[22px] font-bold mb-6 flex items-center gap-2 text-slate-900">
                    <Files size={20} className="text-slate-400" />
                    Selected Documents ({selectedFiles.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedFiles.map((file: StudyFile) => (
                        <div key={file.id} className="bg-white border border-slate-100 rounded-[20px] p-4 shadow-sm">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-50 text-[#581DC6] flex items-center justify-center shrink-0 mt-0.5">
                                    <FileText size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-sm text-slate-800 truncate">{file.name}</h4>
                                    <p className="text-xs text-slate-500 mt-1">{file.format} • {file.duration}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-12 flex gap-4 justify-center">
                <button
                    onClick={onBack}
                    className="px-8 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
                >
                    Back
                </button>
                <button
                    onClick={onProceed}
                    className="px-8 py-3 bg-[#581DC6] text-white rounded-xl font-bold hover:bg-opacity-90 transition-all shadow-md flex items-center gap-2"
                >
                    <Sparkles size={18} />
                    Proceed to Skim Sync
                </button>
            </div>
        </div>
    );
}

function PostBriefView({ BRAND_PURPLE, selectedFiles, flippedCards, setFlippedCards, confidenceRating, setConfidenceRating, onBack, onAction }: any) {
    const [showCheatSheetExport, setShowCheatSheetExport] = useState(false);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    
    // Get all highlights for flashcards
    const allHighlights = selectedFiles.flatMap((file: StudyFile) => {
        const fileHighlights = generateHighlights(file);
        return fileHighlights.filter((h: any) => h.type === 'definition').map((h: any) => ({ ...h, fileId: file.id, fileName: file.name }));
    });

    // Keyboard support for flashcards
    useEffect(() => {
        const handleKeydown = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                e.preventDefault();
                toggleFlip(currentCardIndex);
            } else if (e.code === 'ArrowLeft') {
                e.preventDefault();
                setCurrentCardIndex(Math.max(0, currentCardIndex - 1));
            } else if (e.code === 'ArrowRight') {
                e.preventDefault();
                setCurrentCardIndex(Math.min(allHighlights.length - 1, currentCardIndex + 1));
            }
        };
        
        window.addEventListener('keydown', handleKeydown);
        return () => window.removeEventListener('keydown', handleKeydown);
    }, [currentCardIndex, allHighlights.length]);

    const toggleFlip = (index: number) => {
        const newFlipped = new Set(flippedCards);
        if (newFlipped.has(index)) {
            newFlipped.delete(index);
        } else {
            newFlipped.add(index);
        }
        setFlippedCards(newFlipped);
    };

    const handleExportCheatSheet = () => {
        // Generate text-based cheat sheet and download
        const cheatSheetContent = allHighlights
            .map((h: any) => `${h.title}\n${'-'.repeat(h.title.length)}\n${h.content}`)
            .join('\n\n');
        
        const blob = new Blob([cheatSheetContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `exam-reviewer-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);

        setShowCheatSheetExport(true);
        onAction("Exam reviewer exported successfully!");
        setTimeout(() => setShowCheatSheetExport(false), 2000);
    };

    const handleConfidenceRating = (rating: number) => {
        setConfidenceRating(rating);
        if (rating <= 2) {
            onAction("You seem unsure. Consider reviewing the summary section or replaying the audio.");
        } else if (rating === 5) {
            onAction("Excellent! You're ready to move to the next topic!");
        }
    };

    // Calculate metrics (mocked from selected files)
    const totalPages = selectedFiles.length * 20; // Mock: 20 pages per file
    const timeSavedMinutes = Math.round((totalPages / 10) * 2);
    const keywordsCount = allHighlights.length;

    return (
      <div className="w-full max-w-[1400px] mx-auto">
            <header className="mb-12">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-[32px] font-bold tracking-tight text-slate-900">
                            Skim Sync Study Session
                        </h1>
                        <p className="text-[#64748B] text-lg mt-2">Master your extracted insights with interactive tools</p>
                    </div>
                    <button
                        onClick={onBack}
                        className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
                    >
                        ← Back
                    </button>
                </div>
            </header>

            {/* Hero Fact Flashcards - Quizlet Style */}
            <div className="mb-12">
                <h2 className="text-[24px] font-bold mb-2 text-slate-900">
                    Learn with Flashcards
                </h2>
                <p className="text-slate-600 mb-8">Click or press SPACE to flip. Use arrow keys or buttons to navigate.</p>
                
                {allHighlights.length > 0 ? (
                    <div>
                        {/* Flashcard Container */}
                        <div className="flex flex-col items-center gap-8 mb-8">
                            {/* Progress Bar */}
                            <div className="w-full max-w-full sm:max-w-2xl">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-bold text-slate-600">
                                        Card {currentCardIndex + 1} of {allHighlights.length}
                                    </span>
                                    <span className="text-xs text-slate-400">{Math.round(((currentCardIndex + 1) / allHighlights.length) * 100)}%</span>
                                </div>
                                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${((currentCardIndex + 1) / allHighlights.length) * 100}%` }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </div>
                            </div>

                            {/* Main Flashcard */}
                            <motion.div
                              onClick={() => toggleFlip(currentCardIndex)}
                              className="w-full max-w-full sm:max-w-3xl min-h-[18rem] sm:min-h-[22rem] lg:min-h-[26rem] rounded-2xl sm:rounded-3xl shadow-2xl cursor-pointer perspective"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <motion.div
                                className={`w-full h-full rounded-2xl sm:rounded-3xl px-5 sm:px-8 md:px-12 py-6 sm:py-8 md:py-12 flex flex-col items-center justify-center text-center transition-all border-4 ${
                                        flippedCards.has(currentCardIndex)
                                            ? 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-300 shadow-lg'
                                            : 'bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 shadow-2xl'
                                    }`}
                                    animate={{ rotateY: flippedCards.has(currentCardIndex) ? 180 : 0 }}
                                    transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
                                >
                                    <div className={`flex flex-col items-center justify-center w-full ${
                                        flippedCards.has(currentCardIndex) ? 'text-slate-900' : 'text-white'
                                    }`}>
                                        {/* Label */}
                                        <div className={`text-xs md:text-sm font-bold uppercase tracking-widest mb-6 ${
                                            flippedCards.has(currentCardIndex) ? 'text-blue-600' : 'text-blue-300'
                                        }`}>
                                            {flippedCards.has(currentCardIndex) ? 'Definition' : 'Term'}
                                        </div>
                                        
                                        {/* Content */}
                                        <div className={`max-w-full text-balance text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight line-clamp-4 sm:line-clamp-5 break-words ${
                                            flippedCards.has(currentCardIndex) ? 'text-slate-800' : 'text-white'
                                        }`}>
                                            {flippedCards.has(currentCardIndex) 
                                                ? allHighlights[currentCardIndex].content 
                                                : allHighlights[currentCardIndex].title
                                            }
                                        </div>

                                        {/* Flip Hint */}
                                        {!flippedCards.has(currentCardIndex) && (
                                            <div className="mt-auto pt-6 text-xs md:text-sm text-blue-200 opacity-70">
                                                Click card to reveal
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            </motion.div>

                            {/* Navigation Controls */}
                            <div className="w-full max-w-full sm:max-w-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
                                <button
                                    onClick={() => setCurrentCardIndex(Math.max(0, currentCardIndex - 1))}
                                    disabled={currentCardIndex === 0}
                                    className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold flex items-center justify-center sm:justify-start gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95"
                                >
                                    ← Previous
                                </button>

                                <div className="flex items-center gap-1.5 flex-wrap justify-center">
                                    {allHighlights.map((_: any, idx: number) => (
                                        <motion.button
                                            key={idx}
                                            onClick={() => setCurrentCardIndex(idx)}
                                            className={`rounded-full transition-all ${
                                                idx === currentCardIndex 
                                                    ? 'w-8 h-2.5 bg-purple-600' 
                                                    : 'w-2.5 h-2.5 bg-slate-300 hover:bg-slate-400'
                                            }`}
                                            whileHover={{ scale: 1.2 }}
                                            title={`Card ${idx + 1}`}
                                        />
                                    ))}
                                </div>

                                <button
                                    onClick={() => setCurrentCardIndex(Math.min(allHighlights.length - 1, currentCardIndex + 1))}
                                    disabled={currentCardIndex === allHighlights.length - 1}
                                    className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold flex items-center justify-center sm:justify-end gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-purple-600 text-white hover:bg-purple-700 active:scale-95"
                                >
                                    Next →
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-slate-400 py-12">No definitions found. Try selecting files with definition-type highlights.</p>
                )}
            </div>

            {/* Exam Reviewer Export */}
            <div className="mb-12 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-[24px] sm:rounded-[28px] p-5 sm:p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h2 className="text-[24px] font-bold mb-2 text-slate-900">
                            Exam Reviewer
                        </h2>
                        <p className="text-slate-600">Download a complete text reviewer with all key definitions and terms from your selected files</p>
                    </div>
                    <button
                        onClick={handleExportCheatSheet}
                        className="px-6 sm:px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-md whitespace-nowrap w-full md:w-auto"
                    >
                        {showCheatSheetExport ? '✓ Exported!' : 'Download Reviewer'}
                    </button>
                </div>
            </div>

            {/* Confidence Meter */}
            <div className="mb-12">
                <h2 className="text-[24px] font-bold mb-6 text-slate-900">
                    How Confident Do You Feel?
                </h2>
                <p className="text-slate-600 mb-6">Rate your understanding of the material (1-5)</p>
                
                <div className="bg-white border border-slate-100 rounded-[24px] sm:rounded-[28px] p-5 sm:p-6 md:p-8 shadow-sm">
                  <div className="flex flex-wrap gap-3 sm:gap-4 justify-center mb-8">
                        {[1, 2, 3, 4, 5].map((rating) => (
                            <motion.button
                                key={rating}
                                onClick={() => handleConfidenceRating(rating)}
                        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl font-bold text-base sm:text-lg transition-all border-2 ${
                                    confidenceRating === rating
                                        ? 'bg-purple-600 text-white border-purple-600'
                                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300'
                                }`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {rating}
                            </motion.button>
                        ))}
                    </div>
                    
                    {confidenceRating && confidenceRating <= 2 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-rose-50 border border-rose-200 rounded-lg p-4 text-center text-rose-700 font-medium"
                        >
                            📚 You seem unsure. Consider reviewing the summary section or replaying the audio.
                        </motion.div>
                    )}
                    
                    {confidenceRating === 5 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center text-emerald-700 font-medium"
                        >
                            🎉 Excellent! You're ready to move to the next topic!
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Focus Visualizer */}
            <div className="mb-12">
                <h2 className="text-[24px] font-bold mb-6 text-slate-900">
                    Your Session Summary
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                    <motion.div
                    className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-[20px] sm:rounded-[24px] p-5 sm:p-6 md:p-8 shadow-sm"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="text-4xl font-bold text-purple-600 mb-2">{timeSavedMinutes}</div>
                        <div className="text-sm text-slate-600 mb-4">Minutes Saved</div>
                        <p className="text-xs text-slate-500 break-words">You processed {totalPages} pages efficiently with Skim Sync</p>
                    </motion.div>

                    <motion.div
                      className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-[20px] sm:rounded-[24px] p-5 sm:p-6 md:p-8 shadow-sm"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="text-4xl font-bold text-blue-600 mb-2">{keywordsCount}</div>
                        <div className="text-sm text-slate-600 mb-4">Key Definitions</div>
                        <p className="text-xs text-slate-500 break-words">Critical terms extracted and ready to master</p>
                    </motion.div>

                    <motion.div
                      className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-[20px] sm:rounded-[24px] p-5 sm:p-6 md:p-8 shadow-sm"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="text-4xl font-bold text-emerald-600 mb-2">{selectedFiles.length}</div>
                        <div className="text-sm text-slate-600 mb-4">Documents Analyzed</div>
                        <p className="text-xs text-slate-500 break-words">Successfully processed and extracted</p>
                    </motion.div>
                </div>
            </div>

            {/* Keywords Cloud */}
            <div className="bg-slate-50 border border-slate-200 rounded-[24px] sm:rounded-[28px] p-5 sm:p-6 md:p-8 mb-12">
                <h3 className="text-lg font-bold mb-6 text-slate-900">Keywords Mastered</h3>
                <div className="flex flex-wrap gap-3">
                    {allHighlights.slice(0, 12).map((highlight: any, idx: number) => (
                        <motion.span
                            key={idx}
                      className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-700 hover:border-purple-400 transition-colors cursor-pointer max-w-full break-words"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            {highlight.title}
                        </motion.span>
                    ))}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center mb-12">
                <button
                    onClick={onBack}
                    className="px-8 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
                >
                    Back to Highlights
                </button>
                <button
                    className="px-8 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all shadow-md flex items-center gap-2"
                    onClick={() => onAction("Ready to start the next chapter!")}
                >
                    <ChevronRight size={18} />
                    Start Next Chapter
                </button>
            </div>
        </div>
    );
}

function FilesView({ 
  BRAND_PURPLE, 
  files, 
  searchQuery, 
  setSearchQuery, 
  selectedFormats, 
  setSelectedFormats, 
  selectedLoads, 
  setSelectedLoads, 
  onAction,
  showFilters,
  setShowFilters 
}: any) {
  const formats = ["PDF", "PPTX", "DOCX", "TXT"];
  const loads = ["Low", "Medium", "High"];

  const toggleFilter = (item: string, list: string[], setList: (val: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const activeFilterCount = selectedFormats.length + selectedLoads.length;
  const hasFilters = activeFilterCount > 0 || searchQuery !== "";

  return (
    <div className="w-full max-w-[1400px] mx-auto">
      <header className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
            <div>
                <h1 className="text-[32px] font-bold tracking-tight text-slate-900">All Files</h1>
                <p className="text-[#64748B] text-lg mt-1 font-medium">Total of {files.length} study documents</p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full lg:w-auto">
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border font-bold text-sm transition-all shadow-sm w-full sm:w-auto ${
                    showFilters 
                    ? 'bg-slate-800 text-white border-slate-800' 
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Filter size={16} />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="ml-1 w-5 h-5 rounded-full bg-[#581DC6] text-white text-[10px] flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                  {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search files..." 
                    className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#581DC640] w-full sm:w-64 shadow-sm transition-all" 
                    />
                </div>
            </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="flex flex-wrap items-center gap-8 py-6 border-y border-slate-100">
                  <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Format</span>
                      <div className="flex gap-1.5">
                          {formats.map(f => (
                              <button key={f} onClick={() => toggleFilter(f, selectedFormats, setSelectedFormats)} className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all border ${selectedFormats.includes(f) ? 'bg-[#581DC6] text-white border-[#581DC6]' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>{f}</button>
                          ))}
                      </div>
                  </div>
                  <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Load Intensity</span>
                      <div className="flex gap-1.5">
                          {loads.map(l => (
                              <button key={l} onClick={() => toggleFilter(l, selectedLoads, setSelectedLoads)} className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all border ${selectedLoads.includes(l) ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>{l}</button>
                          ))}
                      </div>
                  </div>
                  {hasFilters && (
                      <button onClick={() => {setSelectedFormats([]); setSelectedLoads([]); setSearchQuery("");}} className="ml-auto flex items-center gap-1.5 text-[#581DC6] text-xs font-bold hover:underline">
                          <RotateCcw size={14} />
                          Reset All
                      </button>
                  )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      
      <div className="space-y-4 sm:hidden">
        {files.map((file: any) => (
          <div key={file.id} className="bg-white border border-slate-100 rounded-[22px] shadow-sm p-4">
            <div className="flex items-start gap-3 min-w-0">
              <div className="p-2.5 bg-purple-50 text-[#581DC6] rounded-xl shrink-0">
                <FileText size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-[15px] leading-snug text-slate-800 break-words line-clamp-2 mb-2">{file.name}</h3>
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mb-3">
                  <span className="bg-[#F1F5F9] px-2.5 py-1 rounded-md border border-slate-200 text-[#64748B] font-bold uppercase">{file.format}</span>
                  <span className="whitespace-nowrap">{file.date}</span>
                  <span className="whitespace-nowrap">{file.size}</span>
                  <span className="whitespace-nowrap text-[#581DC6]">{file.duration}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <LoadBadge load={file.load} />
                  <div className="flex items-center gap-2">
                    <button onClick={() => onAction(`Opening ${file.name}...`)} className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                      <ExternalLink size={16} />
                    </button>
                    <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden sm:block bg-white border border-slate-100 rounded-[24px] shadow-sm overflow-x-auto">
        <table className="min-w-[760px] w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="px-4 sm:px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">File Name</th>
              <th className="px-4 sm:px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Format</th>
              <th className="px-4 sm:px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Load</th>
              <th className="px-4 sm:px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {files.map((file: any) => (
              <tr key={file.id} className="hover:bg-slate-50/30 transition-colors group">
                <td className="px-4 sm:px-6 py-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 bg-purple-50 text-[#581DC6] rounded-lg"><FileText size={18} /></div>
                    <span className="font-bold text-[14px] text-slate-700 truncate max-w-[220px] sm:max-w-none">{file.name}</span>
                  </div>
                </td>
                <td className="px-4 sm:px-6 py-4 text-center">
                  <span className="bg-[#F1F5F9] px-2.5 py-1 rounded text-[10px] font-bold text-[#64748B] border border-slate-200 uppercase">{file.format}</span>
                </td>
                <td className="px-4 sm:px-6 py-4"><LoadBadge load={file.load} /></td>
                <td className="px-4 sm:px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onAction(`Opening ${file.name}...`)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"><ExternalLink size={16}/></button>
                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"><MoreVertical size={16}/></button>
                  </div>
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
  const styles: any = {
    Low: 'bg-[#F0FDF4] text-[#166534] border-[#DCFCE7]',
    Medium: 'bg-[#FEFCE8] text-[#854D0E] border-[#FEF9C3]',
    High: 'bg-[#FEF2F2] text-[#991B1B] border-[#FEE2E2]',
  };
  return <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md border ${styles[load]}`}>{load} Load</span>;
}

function HomeView({ BRAND_PURPLE, files, onUpload, onAction }: any) {
  return (
    <div className="max-w-[1000px] mx-auto">
      <header className="mb-8">
        <h1 className="text-[32px] font-bold tracking-tight text-slate-900">Skim-Sync</h1>
        <p className="text-[#64748B] text-lg mt-1">Ready to tackle your study sessions?</p>
      </header>
      
      {/* Compact Upload Box */}
      <button onClick={onUpload} className="w-full border-2 border-dashed border-[#E2E8F0] rounded-[32px] bg-white p-8 flex flex-col items-center justify-center mb-12 transition-all hover:border-[#581DC680] group shadow-sm">
        <div className="w-[64px] h-[64px] bg-[#F1F5F9] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-[#475569] group-hover:text-[#581DC6]"><Upload size={28} /></div>
        <h3 className="text-[20px] font-bold mb-1">Upload Study Materials</h3>
        <p className="text-[#64748B] text-[15px] mb-5 font-medium">Drag and drop files here, or click to browse</p>
        <div className="bg-[#0F172A] text-white px-8 py-2.5 rounded-2xl font-bold text-[14px] group-hover:bg-[#581DC6] transition-colors shadow-lg">Choose Files</div>
      </button>

      <h2 className="text-[22px] font-bold mb-6 flex items-center gap-2 text-slate-900">
        <Clock size={20} className="text-slate-400" />
        Recent Files
      </h2>
      <div className="flex flex-col gap-4">
        {files.slice(0, 4).map((file: any) => (
          <FileRow key={file.id} file={file} BRAND_PURPLE={BRAND_PURPLE} onAction={onAction} />
        ))}
      </div>
    </div>
  );
}

function FileRow({ file, BRAND_PURPLE, onAction }: any) {
  return (
    <div className="bg-white border border-[#F1F5F9] rounded-[20px] sm:rounded-[24px] p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[14px] flex items-center justify-center bg-[#F3E8FF] text-[#581DC6] shrink-0">
          <FileText size={22} />
        </div>
        <div className="min-w-0">
          <h4 className="font-bold text-[15px] sm:text-[16px] leading-tight text-slate-800 line-clamp-2 sm:line-clamp-1 break-words mb-1">{file.name}</h4>
          <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-1 text-[#94A3B8] text-[11px] sm:text-xs font-medium">
            <span className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 text-[#64748B] text-[10px] font-bold uppercase shrink-0">
              {file.format}
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-200" />
            <span className="flex items-center gap-1 whitespace-nowrap">
              <Clock size={12} className="text-slate-300" />
              {file.date}
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-200" />
            <span className="whitespace-nowrap">{file.size}</span>
            <span className="w-1 h-1 rounded-full bg-slate-200" />
            <span className="flex items-center gap-1 text-[#581DC6] whitespace-nowrap">
              <Timer size={12} />
              {file.duration}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-6 w-full sm:w-auto sm:px-6 justify-between sm:justify-end">
        <div className="hidden sm:block">
            <LoadBadge load={file.load} />
        </div>
        <div className="hidden sm:block h-8 w-[1px] bg-slate-100" />
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button 
            onClick={() => onAction(`Entering focus mode...`)} 
            className="flex-1 sm:flex-none text-white px-4 sm:px-5 py-2.5 rounded-xl font-bold text-[13px] hover:opacity-90 transition-opacity shadow-sm whitespace-nowrap" 
            style={{ backgroundColor: BRAND_PURPLE }}
          >
            Start Learning
          </button>
          <button 
            onClick={() => onAction(`Preparing exam mode...`)} 
            className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 rounded-xl font-bold text-[13px] bg-[#FDFBFF] text-[#581DC6] border border-[#F3E8FF] hover:bg-[#F3E8FF] transition-colors whitespace-nowrap"
          >
            Exam Mode
          </button>
        </div>
      </div>
    </div>
  );
}