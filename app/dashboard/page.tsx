"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  Timer,
  ListFilter,
  AlertCircle,
  CreditCard,
  Download,
  BarChart3,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
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

// --- Mock Data ---
const INITIAL_FILES: StudyFile[] = [
  { id: '1', name: 'Introduction to Psychology.pdf', date: '2026-05-10', size: '2.4 MB', format: 'PDF', load: 'Medium', duration: '45 min' },
  { id: '2', name: 'Advanced Organic Chemistry - Unit 4.pptx', date: '2026-05-12', size: '15.2 MB', format: 'PPTX', load: 'High', duration: '120 min' },
  { id: '3', name: 'Macroeconomics Final Review.docx', date: '2026-05-13', size: '1.1 MB', format: 'DOCX', load: 'Low', duration: '30 min' },
  { id: '4', name: 'Discrete Mathematics Logic Proofs.pdf', date: '2026-05-11', size: '4.8 MB', format: 'PDF', load: 'High', duration: '90 min' },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [files, setFiles] = useState<StudyFile[]>(INITIAL_FILES);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [selectedLoads, setSelectedLoads] = useState<string[]>([]);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [examSelectedFiles, setExamSelectedFiles] = useState<StudyFile[]>([]);
  const [examUploadedFiles, setExamUploadedFiles] = useState<StudyFile[]>([]);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const [confidenceRating, setConfidenceRating] = useState<number | null>(null);
  
  // Ref for the scrollable container
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const BRAND_PURPLE = "#581DC6";

  // EFFECT: Reset scroll position to top whenever the tab changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo(0, 0);
    }
  }, [activeTab]);

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

  const filteredFiles = useMemo(() => {
    return files.filter(f => {
      const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFormat = selectedFormats.length === 0 || selectedFormats.includes(f.format);
      const matchesLoad = selectedLoads.length === 0 || selectedLoads.includes(f.load);
      return matchesSearch && matchesFormat && matchesLoad;
    });
  }, [files, searchQuery, selectedFormats, selectedLoads]);

  return (
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

      <nav className="z-30 flex items-center justify-between px-8 py-3 bg-white border-b border-gray-100 shrink-0">
        <div className="flex items-center">
          <img 
            src="/images/logo.png" 
            alt="Echo Logo" 
            className="h-10 md:h-10 w-auto object-contain cursor-pointer mr-2" 
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
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                    <User size={16} className="text-slate-400" />
                    <span className="font-medium">My Profile</span>
                  </button>
                  <button 
                    onClick={() => { showToast("Logging out...", 'info'); setIsProfileOpen(false); }}
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

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 bg-white border-r border-gray-100 flex flex-col p-4 shrink-0">
          <div className="px-2">
            <h2 className="text-[10px] font-bold uppercase tracking-wider mb-4" style={{ color: BRAND_PURPLE }}>SkimSync Dashboard</h2>
            <nav className="space-y-1">
              <SidebarItem icon={<Home size={18}/>} label="Home" active={activeTab === 'home'} brandColor={BRAND_PURPLE} onClick={() => setActiveTab('home')} />
              <SidebarItem icon={<Files size={18}/>} label="All Files" active={activeTab === 'files'} brandColor={BRAND_PURPLE} onClick={() => setActiveTab('files')} />
              <SidebarItem icon={<BrainCircuit size={18}/>} label="Exam Mode" active={activeTab === 'exam'} brandColor={BRAND_PURPLE} onClick={() => setActiveTab('exam')} />
            </nav>
          </div>
        </aside>

        {/* scrollContainerRef reset happens here */}
        <main ref={scrollContainerRef} className="flex-1 overflow-y-auto p-12 bg-[#F9FAFB] scroll-smooth">
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
                {activeTab === 'home' && <HomeView files={files} onUpload={handleUpload} onAction={showToast} />}
                {activeTab === 'files' && (
                    <FilesView 
                        files={filteredFiles} 
                        searchQuery={searchQuery} 
                        setSearchQuery={setSearchQuery} 
                        onAction={showToast}
                    />
                )}
                {activeTab === 'exam' && (
                    <ExamView 
                        files={files}
                        selectedFiles={examSelectedFiles}
                        setSelectedFiles={setExamSelectedFiles}
                        uploadedFiles={examUploadedFiles}
                        setUploadedFiles={setExamUploadedFiles}
                        onProceed={() => setActiveTab('exam-results')}
                    />
                )}
                {activeTab === 'exam-results' && (
                    <PostBriefView
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
  );
}

// --- Sidebar Item ---
function SidebarItem({ icon, label, active, brandColor, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
        active ? 'bg-[#F1F5F9] font-bold translate-x-1' : 'text-[#64748B] hover:bg-gray-50 font-medium'
      }`}
      style={active ? { color: brandColor } : {}}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </button>
  );
}

// --- Exam Preparation View ---
function ExamView({ files, selectedFiles, setSelectedFiles, uploadedFiles, setUploadedFiles, onProceed }: any) {
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
        <div className="max-w-[1000px] mx-auto">
            <header className="mb-8">
                <h1 className="text-[32px] font-bold tracking-tight text-slate-900 flex items-center gap-3">
                    <BrainCircuit className="text-[#581DC6]" size={32} />
                    Exam Booster
                </h1>
                <p className="text-[#64748B] text-lg mt-2 font-medium">Select your study materials to unlock active recall tools.</p>
            </header>

            <button onClick={handleFileUpload} className="w-full border-2 border-dashed border-[#E2E8F0] rounded-[32px] bg-white p-8 flex flex-col items-center justify-center mb-12 transition-all hover:border-[#581DC680] group shadow-sm">
                <div className="w-[64px] h-[64px] bg-[#F1F5F9] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-[#475569] group-hover:text-[#581DC6]"><Upload size={28} /></div>
                <h3 className="text-[20px] font-bold mb-1">Add to SkimSync</h3>
                <p className="text-[#64748B] text-[15px] mb-5 font-medium">Select new materials to boost your exam readiness</p>
                <div className="bg-[#0F172A] text-white px-8 py-2.5 rounded-2xl font-bold text-[14px] group-hover:bg-[#581DC6] transition-colors shadow-lg">Choose Files</div>
            </button>

            <div className="flex items-center justify-between mb-6">
                <h2 className="text-[22px] font-bold flex items-center gap-2 text-slate-900">
                    <Files size={22} className="text-slate-400" />
                    Available Materials
                </h2>
                {selectedFiles.length > 0 && (
                    <button
                        onClick={onProceed}
                        className="px-8 py-3 bg-[#581DC6] text-white rounded-xl font-bold text-sm hover:bg-opacity-90 transition-all shadow-md"
                    >
                        Create Exam Briefs →
                    </button>
                )}
            </div>
            <div className="flex flex-col gap-4">
                {allFiles.map((file: any) => {
                    const isSelected = selectedFiles.some((f: StudyFile) => f.id === file.id);
                    return (
                        <div key={file.id} className={`bg-white border rounded-[24px] p-5 flex items-center justify-between cursor-pointer transition-all ${isSelected ? 'border-[#581DC6] bg-purple-50/20' : 'border-slate-100 hover:border-slate-200'}`} onClick={() => toggleFileSelection(file)}>
                            <div className="flex items-center gap-4">
                                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${isSelected ? 'bg-[#581DC6] border-[#581DC6]' : 'border-slate-300'}`}>
                                    {isSelected && <CheckCircle2 size={16} className="text-white" />}
                                </div>
                                <div className="w-12 h-12 bg-purple-100 text-[#581DC6] rounded-xl flex items-center justify-center"><FileText size={22} /></div>
                                <div>
                                    <h4 className="font-bold text-slate-800">{file.name}</h4>
                                    <p className="text-xs text-slate-500">{file.format} • {file.duration}</p>
                                </div>
                            </div>
                            <LoadBadge load={file.load} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// --- Exam Mode Results View (Active Recall Tools) ---
function PostBriefView({ flippedCards, setFlippedCards, confidenceRating, setConfidenceRating, onBack, onAction }: any) {
    const toggleCard = (index: number) => {
        const next = new Set(flippedCards);
        if (next.has(index)) next.delete(index);
        else next.add(index);
        setFlippedCards(next);
    };

    const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const item = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } };

    return (
        <div className="max-w-[1000px] mx-auto pb-20">
            <header className="mb-8">
                <button onClick={onBack} className="mb-4 text-slate-400 font-bold hover:text-slate-600 transition-colors">← Back to Setup</button>
                <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                   Exam Modes
                </h1>
            </header>

            <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 1. Flashcards */}
                    <motion.div variants={item} className="bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><CreditCard size={20} /></div>
                            <h3 className="font-bold text-slate-900">Hero Fact Flashcards</h3>
                        </div>
                        <div 
                            onClick={() => toggleCard(0)}
                            className="bg-slate-50 rounded-2xl p-8 h-40 flex flex-col items-center justify-center border border-dashed border-slate-200 cursor-pointer hover:border-blue-400 transition-all"
                        >
                            <AnimatePresence mode="wait">
                                {!flippedCards.has(0) ? (
                                    <motion.h4 key="front" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="text-lg font-black text-slate-800">Classical Conditioning</motion.h4>
                                ) : (
                                    <motion.p key="back" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="text-sm text-center text-slate-600">A learning process that occurs through associations between an environmental stimulus and a naturally occurring stimulus.</motion.p>
                                )}
                            </AnimatePresence>
                        </div>
                        <button onClick={() => onAction("Launching Active Recall Session...")} className="w-full mt-4 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm">Practice Flashcards</button>
                    </motion.div>

                    {/* 2. Cheat Sheet */}
                    <motion.div variants={item} className="bg-[#0F172A] rounded-[28px] p-6 shadow-xl text-white flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-white/10 text-white rounded-xl flex items-center justify-center"><Download size={20} /></div>
                                <h3 className="font-bold">Priority "Cheat Sheet"</h3>
                            </div>
                            <p className="text-sm text-slate-400 mb-6">Download a tangible one-page artifact containing all essential definitions and cues from your selected documents.</p>
                        </div>
                        <button onClick={() => onAction("Preparing SkimSync PDF Export...")} className="w-full py-3 bg-emerald-500 text-white rounded-xl font-bold text-sm">Download Cheat Sheet</button>
                    </motion.div>
                </div>

                {/* 3. Confidence Meter */}
                <motion.div variants={item} className="bg-amber-50 border border-amber-100 rounded-[28px] p-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <h3 className="text-xl font-bold text-amber-900">Confidence Meter</h3>
                            <p className="text-amber-700/70 text-sm font-medium">How ready do you feel for this topic?</p>
                        </div>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((num) => (
                                <button 
                                    key={num}
                                    onClick={() => setConfidenceRating(num)}
                                    className={`w-12 h-12 rounded-xl font-bold text-lg transition-all ${confidenceRating === num ? 'bg-amber-500 text-white shadow-lg scale-105' : 'bg-white text-amber-600 hover:bg-amber-100'}`}
                                >{num}</button>
                            ))}
                        </div>
                    </div>
                    {confidenceRating && confidenceRating <= 2 && (
                        <div className="mt-6 p-4 bg-white/50 rounded-xl flex items-center gap-3 text-sm text-amber-800 border border-amber-200">
                            <AlertCircle size={18} />
                            <p>You seem unsure. SkimSync suggests replaying the <span className="font-bold underline cursor-pointer">Summary Audio Chunks</span>.</p>
                        </div>
                    )}
                </motion.div>

                {/* 4. Focus Visualizer */}
                <motion.div variants={item} className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm">
                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2"><BarChart3 size={24} className="text-purple-500" /> Focus Visualizer</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Time Saved</span>
                            <div className="flex items-baseline gap-2"><span className="text-3xl font-black text-purple-600">20</span><span className="text-sm font-bold text-slate-500">pages</span></div>
                            <p className="text-xs text-emerald-600 flex items-center gap-1 font-bold mt-1"><Zap size={10} fill="currentColor"/> processed in 6m</p>
                        </div>
                        <div className="md:col-span-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Keywords Mastered</span>
                            <div className="flex flex-wrap gap-2">
                                {['Conditioning', 'Inflation', 'Proofs', 'Mechanism', 'Organic', 'Macro', 'Induction'].map(t => <span key={t} className="px-3 py-1 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold border border-slate-100">{t}</span>)}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}

// --- Other Views ---
function HomeView({ files, onUpload, onAction }: any) {
    return (
      <div className="max-w-[1000px] mx-auto">
        <h1 className="text-[32px] font-black text-slate-900 mb-8 tracking-tight">Welcome to SkimSync</h1>
        <button onClick={onUpload} className="w-full border-2 border-dashed border-slate-200 rounded-[32px] bg-white p-12 flex flex-col items-center mb-12 hover:border-purple-300 transition-all group">
          <Upload size={32} className="text-slate-300 mb-4 group-hover:scale-110 transition-transform" />
          <h3 className="text-lg font-bold">Upload to SkimSync</h3>
          <p className="text-sm text-slate-500 mb-6">Drop your lecture notes or study guides here</p>
          <div className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold group-hover:bg-[#581DC6]">Select Files</div>
        </button>
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Clock size={20} className="text-slate-400" /> Recent Study Sessions</h2>
        <div className="space-y-4">
            {files.slice(0, 3).map((f:any) => (
                <div key={f.id} className="bg-white p-5 rounded-[24px] border border-slate-100 flex items-center justify-between hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600"><FileText size={20} /></div>
                      <span className="font-bold text-slate-700">{f.name}</span>
                    </div>
                    <button onClick={() => onAction("Opening focus reader...")} className="bg-[#581DC6] text-white px-6 py-2 rounded-xl font-bold text-sm">Study Now</button>
                </div>
            ))}
        </div>
      </div>
    );
}

function FilesView({ files, searchQuery, setSearchQuery, onAction }: any) {
    return (
        <div className="max-w-[1000px] mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-black">SkimSync Library</h1>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search your files..." className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-purple-100" />
                </div>
            </div>
            <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <tr><th className="px-6 py-5">Material Name</th><th className="px-6 py-5">Format</th><th className="px-6 py-5">Complexity</th><th className="px-6 py-5 text-right">Action</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {files.map((f:any) => (
                            <tr key={f.id} className="group hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-5 font-bold text-slate-700">{f.name}</td>
                                <td className="px-6 py-5 text-xs text-slate-400 font-bold">{f.format}</td>
                                <td className="px-6 py-5"><LoadBadge load={f.load} /></td>
                                <td className="px-6 py-5 text-right"><button onClick={() => onAction("Opening Document...")} className="p-2 text-slate-300 group-hover:text-purple-600 transition-colors"><ExternalLink size={18} /></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function LoadBadge({ load }: { load: string }) {
    const styles: any = { Low: 'bg-green-50 text-green-700 border-green-100', Medium: 'bg-amber-50 text-amber-700 border-amber-100', High: 'bg-rose-50 text-rose-700 border-rose-100' };
    return <span className={`text-[11px] font-bold px-3 py-1 rounded-md border ${styles[load]}`}>{load} Load</span>;
}