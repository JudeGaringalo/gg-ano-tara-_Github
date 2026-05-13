"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, FileText, FileCode, AlertCircle, ChevronRight } from 'lucide-react';

// 1. Tell TypeScript what a 'StudyFile' looks like
export interface StudyFile {
    id: string;
    name: string;
    date: string;
    size: string;
    format: string;
    load: 'Low' | 'Medium' | 'High';
    duration: string;
}

// 2. Helper function to generate mock flashcards
const generateHighlights = (file: StudyFile) => {
    return [
        { type: 'definition', title: 'Classical Conditioning', content: 'A learning process that occurs through associations between an environmental stimulus and a naturally occurring stimulus.' },
        { type: 'definition', title: 'Operant Conditioning', content: 'A method of learning that employs rewards and punishments for behavior.' }
    ];
};

// 3. Export the component so your dashboard can use it
export default function PostBriefView({ 
    BRAND_PURPLE, 
    selectedFiles, 
    flippedCards, 
    setFlippedCards, 
    confidenceRating, 
    setConfidenceRating, 
    onBack, 
    onAction 
}: any) {
    const [showCheatSheetExport, setShowCheatSheetExport] = useState(false);
    
    // Get all highlights for flashcards
    const allHighlights = selectedFiles.flatMap((file: StudyFile) => {
        const fileHighlights = generateHighlights(file);
        return fileHighlights.filter((h: any) => h.type === 'definition').map((h: any) => ({ ...h, fileId: file.id, fileName: file.name }));
    });

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
        setShowCheatSheetExport(true);
        onAction("Cheat Sheet exported successfully!");
        setTimeout(() => setShowCheatSheetExport(false), 2000);
    };

    const handleConfidenceRating = (rating: number) => {
        setConfidenceRating(rating);
        if (rating <= 2) {
            onAction("You seem a bit unsure. Want to review the summary section?");
        } else if (rating === 5) {
            onAction("Excellent! You're ready to move to the next topic!");
        }
    };

    // Calculate metrics
    const totalPages = selectedFiles.reduce((acc: number) => acc + 20, 0); // Mock: assume 20 pages per file
    const timeSavedMinutes = Math.round((totalPages / 10) * 2); 
    const keywordsCount = allHighlights.length;

    return (
        <div className="max-w-[1200px] mx-auto">
            <header className="mb-12">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-[32px] font-bold tracking-tight text-slate-900 flex items-center gap-3">
                            <Sparkles className="text-purple-500" size={32} />
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

            {/* Hero Fact Flashcards */}
            <div className="mb-12">
                <h2 className="text-[24px] font-bold mb-6 flex items-center gap-2 text-slate-900">
                    <FileText size={24} className="text-blue-600" />
                    Hero Fact Flashcards
                </h2>
                <p className="text-slate-600 mb-6">Flip through key definitions to test your active recall</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allHighlights.map((highlight: any, idx: number) => (
                        <motion.div
                            key={idx}
                            onClick={() => toggleFlip(idx)}
                            className="h-40 cursor-pointer"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <motion.div
                                className={`w-full h-full rounded-2xl p-6 flex items-center justify-center text-center shadow-lg border-2 transition-all ${
                                    flippedCards.has(idx)
                                        ? 'bg-blue-50 border-blue-200'
                                        : 'bg-gradient-to-br from-blue-500 to-purple-500 border-blue-400'
                                }`}
                                animate={{ rotateY: flippedCards.has(idx) ? 180 : 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className={flippedCards.has(idx) ? 'text-slate-700' : 'text-white'}>
                                    {flippedCards.has(idx) ? (
                                        <div className="text-sm leading-relaxed">{highlight.content}</div>
                                    ) : (
                                        <div>
                                            <div className="font-bold text-lg mb-2">{highlight.title}</div>
                                            <div className="text-xs opacity-80">Click to reveal</div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Cheat Sheet Export */}
            <div className="mb-12 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-[28px] p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-[24px] font-bold mb-2 text-slate-900 flex items-center gap-2">
                            <FileCode size={24} className="text-emerald-600" />
                            High-Priority Cheat Sheet
                        </h2>
                        <p className="text-slate-600">Download a one-page PDF with all key definitions and terms</p>
                    </div>
                    <button
                        onClick={handleExportCheatSheet}
                        className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-md whitespace-nowrap"
                    >
                        {showCheatSheetExport ? '✓ Exported!' : 'Download PDF'}
                    </button>
                </div>
            </div>

            {/* Confidence Meter */}
            <div className="mb-12">
                <h2 className="text-[24px] font-bold mb-6 flex items-center gap-2 text-slate-900">
                    <AlertCircle size={24} className="text-amber-600" />
                    How Confident Do You Feel?
                </h2>
                <p className="text-slate-600 mb-6">Rate your understanding of the material (1-5)</p>
                
                <div className="bg-white border border-slate-100 rounded-[28px] p-8 shadow-sm">
                    <div className="flex gap-4 justify-center mb-8">
                        {[1, 2, 3, 4, 5].map((rating) => (
                            <motion.button
                                key={rating}
                                onClick={() => handleConfidenceRating(rating)}
                                className={`w-14 h-14 rounded-2xl font-bold text-lg transition-all border-2 ${
                                    confidenceRating === rating
                                        ? `bg-${rating === 5 ? 'emerald' : rating >= 3 ? 'amber' : 'rose'}-600 text-white border-${rating === 5 ? 'emerald' : rating >= 3 ? 'amber' : 'rose'}-600`
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
                <h2 className="text-[24px] font-bold mb-6 flex items-center gap-2 text-slate-900">
                    <Sparkles size={24} className="text-purple-600" />
                    Your Session Summary
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Time Saved Card */}
                    <motion.div
                        className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-[24px] p-8 shadow-sm"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="text-4xl font-bold text-purple-600 mb-2">{timeSavedMinutes}</div>
                        <div className="text-sm text-slate-600 mb-4">Minutes Saved</div>
                        <p className="text-xs text-slate-500">You processed {totalPages} pages efficiently with Skim Sync</p>
                    </motion.div>

                    {/* Keywords Mastered Card */}
                    <motion.div
                        className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-[24px] p-8 shadow-sm"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="text-4xl font-bold text-blue-600 mb-2">{keywordsCount}</div>
                        <div className="text-sm text-slate-600 mb-4">Key Definitions</div>
                        <p className="text-xs text-slate-500">Critical terms extracted and ready to master</p>
                    </motion.div>

                    {/* Documents Analyzed Card */}
                    <motion.div
                        className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-[24px] p-8 shadow-sm"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="text-4xl font-bold text-emerald-600 mb-2">{selectedFiles.length}</div>
                        <div className="text-sm text-slate-600 mb-4">Documents Analyzed</div>
                        <p className="text-xs text-slate-500">Successfully processed and extracted</p>
                    </motion.div>
                </div>
            </div>

            {/* Keywords Cloud */}
            <div className="bg-slate-50 border border-slate-200 rounded-[28px] p-8 mb-12">
                <h3 className="text-lg font-bold mb-6 text-slate-900">Keywords Mastered</h3>
                <div className="flex flex-wrap gap-3">
                    {allHighlights.slice(0, 12).map((highlight: any, idx: number) => (
                        <motion.span
                            key={idx}
                            className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-700 hover:border-purple-400 transition-colors cursor-pointer"
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