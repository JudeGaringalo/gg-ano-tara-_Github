"use client";

import React, { useState, useMemo } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
type TabType = 'home' | 'files' | 'exam' | 'exam-highlights' | 'exam-results';

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
  const [showFilters, setShowFilters] = useState(false);
  const [examSelectedFiles, setExamSelectedFiles] = useState<StudyFile[]>([]);
  const [examModeEnabled, setExamModeEnabled] = useState(true);
  const [examUploadedFiles, setExamUploadedFiles] = useState<StudyFile[]>([]);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const [confidenceRating, setConfidenceRating] = useState<number | null>(null);
  
  const BRAND_PURPLE = "#581DC6";

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
          <div className="h-8 w-8 bg-[#581DC6] rounded-lg mr-2 flex items-center justify-center text-white font-black italic shadow-lg shadow-purple-200">S</div>
          <span className="font-black text-xl tracking-tighter text-slate-900">SKIM</span>
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
            <h2 className="text-[10px] font-bold uppercase tracking-wider mb-4" style={{ color: BRAND_PURPLE }}>Dashboard</h2>
            <nav className="space-y-1">
              <SidebarItem icon={<Home size={18}/>} label="Home" active={activeTab === 'home'} brandColor={BRAND_PURPLE} onClick={() => setActiveTab('home')} />
              <SidebarItem icon={<Files size={18}/>} label="All Files" active={activeTab === 'files'} brandColor={BRAND_PURPLE} onClick={() => setActiveTab('files')} />
              <SidebarItem icon={<BrainCircuit size={18}/>} label="Exam Mode" active={activeTab === 'exam'} brandColor={BRAND_PURPLE} onClick={() => setActiveTab('exam')} />
            </nav>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-12 bg-[#F9FAFB]">
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
                        onViewBriefs={() => setActiveTab('exam-highlights')}
                    />
                )}
                {activeTab === 'exam-highlights' && (
                    <ExamHighlightsView
                        BRAND_PURPLE={BRAND_PURPLE}
                        selectedFiles={examSelectedFiles}
                        examModeEnabled={examModeEnabled}
                        setExamModeEnabled={setExamModeEnabled}
                        onBack={() => setActiveTab('exam')}
                        onProceed={() => setActiveTab('exam-results')}
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
                        onBack={() => setActiveTab('exam-highlights')}
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
        <div className="max-w-[1000px] mx-auto">
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
            <button onClick={handleFileUpload} className="w-full border-2 border-dashed border-[#E2E8F0] rounded-[32px] bg-white p-8 flex flex-col items-center justify-center mb-12 transition-all hover:border-[#581DC680] group shadow-sm">
                <div className="w-[64px] h-[64px] bg-[#F1F5F9] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-[#475569] group-hover:text-[#581DC6]"><Upload size={28} /></div>
                <h3 className="text-[20px] font-bold mb-1">Upload Study Materials</h3>
                <p className="text-[#64748B] text-[15px] mb-5 font-medium">Select documents to generate exam mode briefs</p>
                <div className="bg-[#0F172A] text-white px-8 py-2.5 rounded-2xl font-bold text-[14px] group-hover:bg-[#581DC6] transition-colors shadow-lg">Choose Files</div>
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
                        Create Exam Briefs
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
        <div className={`bg-white border rounded-[24px] p-5 shadow-sm hover:shadow-md transition-all flex items-center justify-between cursor-pointer group ${isSelected ? `border-[#581DC6] ring-2 ring-[#581DC6]/10 bg-purple-50/30` : 'border-[#F1F5F9] hover:border-slate-200'}`} onClick={onSelect}>
            <div className="flex items-center gap-4 flex-1">
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
                    isSelected 
                        ? `bg-[#581DC6] border-[#581DC6]` 
                        : 'border-slate-300 hover:border-slate-400'
                }`}>
                    {isSelected && <CheckCircle2 size={16} className="text-white" fill="white" />}
                </div>

                <div className="w-12 h-12 rounded-[14px] flex items-center justify-center bg-[#F3E8FF] text-[#581DC6] shrink-0">
                    <FileText size={22} />
                </div>
                <div className="min-w-0">
                    <h4 className="font-bold text-[16px] leading-tight text-slate-800 truncate mb-1">{file.name}</h4>
                    <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-[#94A3B8] text-xs font-medium">
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

            <div className="flex items-center gap-3 px-6">
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
        <div className="max-w-[1000px] mx-auto">
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
    <div className="max-w-[1000px] mx-auto">
      <header className="mb-8">
        <div className="flex justify-between items-end mb-6">
            <div>
                <h1 className="text-[32px] font-bold tracking-tight text-slate-900">All Files</h1>
                <p className="text-[#64748B] text-lg mt-1 font-medium">Total of {files.length} study documents</p>
            </div>
            <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-bold text-sm transition-all shadow-sm ${
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

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search files..." 
                        className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#581DC640] w-64 shadow-sm transition-all" 
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
      
      <div className="bg-white border border-slate-100 rounded-[24px] shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">File Name</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Format</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Load</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {files.map((file: any) => (
              <tr key={file.id} className="hover:bg-slate-50/30 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 text-[#581DC6] rounded-lg"><FileText size={18} /></div>
                    <span className="font-bold text-[14px] text-slate-700">{file.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="bg-[#F1F5F9] px-2.5 py-1 rounded text-[10px] font-bold text-[#64748B] border border-slate-200 uppercase">{file.format}</span>
                </td>
                <td className="px-6 py-4"><LoadBadge load={file.load} /></td>
                <td className="px-6 py-4 text-right">
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
    <div className="bg-white border border-[#F1F5F9] rounded-[24px] p-5 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1">
        <div className="w-12 h-12 rounded-[14px] flex items-center justify-center bg-[#F3E8FF] text-[#581DC6] shrink-0">
          <FileText size={22} />
        </div>
        <div className="min-w-0">
          <h4 className="font-bold text-[16px] leading-tight text-slate-800 truncate mb-1">{file.name}</h4>
          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-[#94A3B8] text-xs font-medium">
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

      <div className="flex items-center gap-6 px-6">
        <div className="hidden sm:block">
            <LoadBadge load={file.load} />
        </div>
        <div className="h-8 w-[1px] bg-slate-100" />
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onAction(`Entering focus mode...`)} 
            className="text-white px-5 py-2.5 rounded-xl font-bold text-[13px] hover:opacity-90 transition-opacity shadow-sm" 
            style={{ backgroundColor: BRAND_PURPLE }}
          >
            Start Learning
          </button>
          <button 
            onClick={() => onAction(`Preparing exam mode...`)} 
            className="px-5 py-2.5 rounded-xl font-bold text-[13px] bg-[#FDFBFF] text-[#581DC6] border border-[#F3E8FF] hover:bg-[#F3E8FF] transition-colors"
          >
            Exam Mode
          </button>
        </div>
      </div>
    </div>
  );
}