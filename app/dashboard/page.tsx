import React from 'react';
import { 
  Upload, 
  Layers, 
  FileText, 
  Clock, 
  Sparkles, 
  Globe 
} from 'lucide-react';

// --- Types ---
type LoadLevel = 'Low' | 'Medium' | 'High';

interface StudyFile {
  id: string;
  name: string;
  date: string;
  size: string;
  format: string;
  load: LoadLevel;
  duration: string;
}

// --- Mock Data ---
const recentFiles: StudyFile[] = [
  {
    id: '1',
    name: 'Introduction to Psychology.pdf',
    date: '2026-05-10',
    size: '2.4 MB',
    format: 'PDF',
    load: 'Medium',
    duration: '45 min'
  },
  {
    id: '2',
    name: 'Data Structures Lecture 5.pptx',
    date: '2026-05-08',
    size: '1.8 MB',
    format: 'PPTX',
    load: 'High',
    duration: '60 min'
  },
  {
    id: '3',
    name: 'Research Methods Notes.docx',
    date: '2026-05-05',
    size: '856 KB',
    format: 'DOCX',
    load: 'Low',
    duration: '20 min'
  }
];

// --- Helper Functions ---
const getLoadBadgeStyles = (load: LoadLevel) => {
  switch (load) {
    case 'Low':
      return 'bg-green-50 text-green-600 border-green-200';
    case 'Medium':
      return 'bg-yellow-50 text-yellow-600 border-yellow-200';
    case 'High':
      return 'bg-red-50 text-red-600 border-red-200';
    default:
      return 'bg-gray-50 text-gray-600 border-gray-200';
  }
};

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      
      {/* Navigation (Updated) */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 max-w-7xl mx-auto bg-white/80 backdrop-blur-md border-b border-transparent">
        <div className="flex items-center w-24 h-auto">
          {/* Ensure this path matches your public folder structure (e.g., /icon.png or /images/logo.png) */}
          <img src="/images/logo.png" alt="Echo Logo" className="w-full h-auto object-contain" />
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <a className="hover:text-purple-700 transition" href="#exam-mode">Exam Mood Booster</a>
          <a className="hover:text-purple-700 transition" href="#active-recall">Active Recall</a>
          <a className="hover:text-purple-700 transition" href="#document-merger">Document Merger</a>
          <a className="hover:text-purple-700 transition" href="#skim-sync">Skim-Sync</a>
          <a className="hover:text-purple-700 transition" href="#burnout">Burnout Detection</a>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium">
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        
        {/* Header */}
        <header className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Upload and manage your study materials</p>
          <div className="flex items-center pt-2 text-gray-400 space-x-2">
            <Globe className="w-4 h-4" />
            <div className="h-6 w-16 border border-gray-200 rounded-md"></div>
          </div>
        </header>

        {/* Upload Section */}
        <section className="border-2 border-dashed border-gray-200 rounded-xl p-10 flex flex-col items-center justify-center text-center space-y-4 hover:bg-gray-50 transition-colors">
          <div className="p-3 bg-gray-50 rounded-full">
            <Upload className="w-8 h-8 text-gray-500" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Upload Study Materials</h3>
            <p className="text-sm text-gray-500 mt-1">Drag and drop files here, or click to browse</p>
          </div>
          <button className="bg-gray-900 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
            Choose Files
          </button>
          <p className="text-xs text-gray-400">
            Supported formats: PDF, DOCX, PPT, PPTX, Excel, TXT
          </p>
        </section>

        {/* Recent Files */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Recent Files</h2>
          <div className="space-y-4">
            {recentFiles.map((file) => (
              <div key={file.id} className="border border-gray-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                {/* File Info */}
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-purple-50 rounded-lg shrink-0 text-purple-600">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">{file.name}</h4>
                    <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{file.date}</span>
                      <span>•</span>
                      <span>{file.size}</span>
                      <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded uppercase font-medium text-[10px]">
                        {file.format}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions & Metadata */}
                <div className="flex flex-col sm:items-end space-y-3">
                  <div className="flex items-center space-x-4">
                    <span className={`text-[11px] font-semibold px-2 py-1 rounded-md border ${getLoadBadgeStyles(file.load)}`}>
                      {file.load} Load
                    </span>
                    <div className="flex items-center text-xs text-gray-500 space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{file.duration}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="bg-purple-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-purple-800 transition-colors">
                      Start Learning
                    </button>
                    <button className="flex items-center space-x-1 bg-purple-50 text-purple-700 px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors">
                      <Sparkles className="w-4 h-4" />
                      <span>Exam Mode</span>
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}