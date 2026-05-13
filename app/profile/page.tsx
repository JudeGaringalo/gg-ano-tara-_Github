"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// --- CONFIGURATION ---
const COLORS = ['#0085FF', '#00C292', '#F5A623', '#631DC3'];

const chartData = [
  { name: 'PDFs', value: 45 }, 
  { name: 'Docs', value: 25 },
  { name: 'Slides', value: 15 }, 
  { name: 'Notes', value: 15 },
];

const ProfileDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [isEditing, setIsEditing] = useState(false);

  // Parent Stagger logic
  const pageVariants = {
    initial: { opacity: 0, y: 15 },
    animate: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.4, staggerChildren: 0.1, ease: "easeOut" } 
    },
    exit: { opacity: 0, y: -15, transition: { duration: 0.2 } }
  };

  const itemVariants = {
    initial: { opacity: 0, scale: 0.95, y: 10 },
    animate: { opacity: 1, scale: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#1A1D23] font-sans overflow-x-hidden">
      
      {/* 1. ANIMATED HEADER */}
      <header className="w-full bg-white border-b border-gray-100 px-16 py-8 sticky top-0 z-50 flex items-center justify-between h-24">
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <img 
            src="/images/logo.png" 
            alt="Echo Logo" 
            className="h-14 w-auto object-contain cursor-pointer" 
            style={{ filter: 'invert(18%) sepia(88%) saturate(4535%) hue-rotate(262deg) brightness(82%) contrast(92%)' }}
          />
        </motion.div>

        <motion.button 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          whileHover={{ scale: 1.1, backgroundColor: '#FEF2F2' }}
          whileTap={{ scale: 0.9 }}
          className="p-3 rounded-xl transition-colors group"
          title="Logout"
        >
          <svg className="w-6 h-6 text-slate-400 group-hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </motion.button>
      </header>

      <main className="max-w-7xl mx-auto px-10 pb-20">
        
        {/* 2. ANIMATED BACK BUTTON */}
        <div className="pt-18 pb-6">
          <motion.button 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            whileHover={{ x: -4 }}
            className="flex items-center gap-2 text-[14px] font-bold text-slate-400 hover:text-[#F5A623] transition-colors group"
          >
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </motion.button>
        </div>

        {/* 3. HERO CARD */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.4, duration: 0.5 }}
          className="bg-[#631DC3] rounded-3xl p-12 mb-10 text-white shadow-xl flex items-center relative overflow-hidden"
        >
          <div className="flex items-center gap-8 z-10">
            <motion.div whileHover={{ rotate: 5, scale: 1.05 }} className="w-28 h-28 bg-[#D9D9D9] rounded-full border-4 border-white/20 shadow-lg" />
            <div className="space-y-1">
              <h1 className="text-4xl font-bold">Juan Dela Cruz</h1>
              <div className="flex items-center gap-2 opacity-80">
                <img src="/images/sms.png" className="w-4 h-4 brightness-200" alt="Email" />
                <p className="text-sm font-medium">juandelacruz@gmail.com</p>
              </div>
            </div>
          </div>

          <div className="absolute right-12 flex gap-3 z-10">
            <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} label="Edit Profile" />
            <TabButton active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} label="View Analytics" />
          </div>
        </motion.div>

        {/* 4. TAB CONTENT */}
        <AnimatePresence mode="wait">
          {activeTab === 'analytics' ? (
            <motion.div key="analytics" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-10">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard variants={itemVariants} label="Total Study Time" value="127.5 hrs" trend="+12%" icon="clock-fast-forward.png" />
                <StatCard variants={itemVariants} label="Documents Processed" value="48" trend="+8" icon="grid-03.png" />
                <StatCard variants={itemVariants} label="Avg Retention Rate" value="82%" trend="+5%" icon="chart-breakout-square.png" />
                <StatCard variants={itemVariants} label="Exam Sessions" value="34" trend="+11" icon="star-01.png" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <motion.div variants={itemVariants} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col h-[400px]">
                  <h3 className="font-bold text-sm text-slate-700 mb-4">Document Types</h3>
                  <div className="flex-grow">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none">
                          {chartData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.05)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-base text-slate-800 mb-6">Achievements</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AchievementCard title="7-Day Streak" desc="Studied for 7 consecutive days" icon="star-01.png" active />
                    <AchievementCard title="High Retention" desc="Achieved 90% retention rate" icon="chart-breakout-square.png" active />
                    <AchievementCard title="Study Master" desc="Completed 50+ documents" icon="grid-03.png" active={false} />
                    <AchievementCard title="Cognitive Champion" desc="Maintained optimal cognitive load" icon="check-done-01.png" active />
                  </div>
                </motion.div>
              </div>

              <motion.div variants={itemVariants} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-sm text-slate-700 mb-8">Recent Activity</h3>
                <div className="space-y-6">
                  <ActivityItem title="Completed: Introduction to Psychology.pdf" time="2 hours ago" icon="grid-03.png" />
                  <ActivityItem title="Exam Booster: Data Structures Lecture" time="5 hours ago" icon="star-01.png" />
                  <ActivityItem title="Uploaded: Research Methods Notes.docx" time="1 day ago" icon="clock-fast-forward.png" />
                  <ActivityItem title="Completed: Statistics Chapter 3" time="2 days ago" icon="grid-03.png" />
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div key="settings" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="bg-white rounded-3xl p-12 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-10">
                <motion.h2 variants={itemVariants} className="text-xl font-bold">Personal Information</motion.h2>
                {!isEditing && (
                  <motion.button 
                    variants={itemVariants} whileTap={{ scale: 0.95 }} onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#F9FAFB] border border-gray-100 rounded-xl text-[12px] font-bold text-slate-600 hover:bg-[#F5A623] hover:text-[#1A1D23] transition-all"
                  >
                    <img src="/images/mdi_pencil.png" className="w-4 h-4 opacity-70" alt="edit" /> Edit
                  </motion.button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                <motion.div variants={itemVariants}><InputBlock label="Full Name" placeholder="Juan Dela Cruz" disabled={!isEditing} /></motion.div>
                <motion.div variants={itemVariants}><InputBlock label="Nick Name" placeholder="Juan" disabled={!isEditing} /></motion.div>
                <motion.div variants={itemVariants}><SelectBlock label="Gender" options={['Male', 'Female', 'Other']} disabled={!isEditing} /></motion.div>
                <motion.div variants={itemVariants}><InputBlock label="Email Address" placeholder="juandelacruz@gmail.com" disabled={!isEditing} /></motion.div>
              </div>

              <AnimatePresence>
                {isEditing && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-12 pt-8 border-t border-gray-50 flex justify-end gap-4">
                    <button onClick={() => setIsEditing(false)} className="px-6 py-2 text-slate-400 font-bold hover:text-red-500 transition-colors">Cancel</button>
                    <button onClick={() => setIsEditing(false)} className="px-8 py-2.5 bg-[#F5A623] text-[#1A1D23] rounded-xl font-bold shadow-lg shadow-orange-500/10 hover:brightness-110 transition-all">Save Changes</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

/* --- REUSABLE COMPONENTS --- */

const TabButton = ({ active, onClick, label }: any) => (
  <button 
    onClick={onClick} 
    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${active ? 'bg-[#F5A623] text-[#1A1D23] shadow-lg shadow-orange-500/20 scale-105' : 'bg-white/10 text-white hover:bg-[#F5A623] hover:text-[#1A1D23]'}`}
  >
    {label}
  </button>
);

const StatCard = ({ label, value, trend, icon, variants }: any) => (
  <motion.div variants={variants} whileHover={{ y: -5 }} className="bg-white p-7 rounded-2xl border border-gray-100 shadow-sm cursor-default">
    <div className="flex justify-between items-start mb-5">
      <div className="p-3 bg-gray-50 rounded-xl"><img src={`/images/${icon}`} className="w-6 h-6 opacity-70" alt="icon" /></div>
      <span className="text-[11px] font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-full">{trend}</span>
    </div>
    <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{label}</p>
  </motion.div>
);

const AchievementCard = ({ title, desc, icon, active = false }: any) => (
  <div className={`flex items-center gap-4 p-4 rounded-xl transition-all ${active ? 'bg-[#F4F5F7] border-2 border-[#1A1D23]' : 'bg-white border border-gray-100 opacity-60'}`}>
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${active ? 'bg-[#E5E7EB]' : 'bg-gray-50'}`}>
      <img src={`/images/${icon}`} className="w-5 h-5" alt="icon" />
    </div>
    <div className="text-left">
      <p className={`text-sm font-bold ${active ? 'text-[#1A1D23]' : 'text-gray-400'}`}>{title}</p>
      <p className="text-[11px] text-gray-400 leading-tight">{desc}</p>
    </div>
  </div>
);

const ActivityItem = ({ title, time, icon }: any) => (
  <div className="flex items-center gap-4 group cursor-pointer">
    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center transition-colors group-hover:bg-orange-50">
      <img src={`/images/${icon}`} className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity" alt="icon" />
    </div>
    <div className="text-left">
      <p className="text-sm font-bold text-slate-700 group-hover:text-[#F5A623] transition-colors">{title}</p>
      <p className="text-[11px] text-slate-400">{time}</p>
    </div>
  </div>
);

const InputBlock = ({ label, placeholder, disabled }: any) => (
  <div className="space-y-3 text-left">
    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">{label}</label>
    <input disabled={disabled} className={`w-full border border-gray-100 rounded-xl px-5 py-4 text-sm font-medium outline-none transition-all ${disabled ? 'bg-[#F9FAFB] opacity-80' : 'bg-white ring-2 ring-[#F5A623]/20 focus:ring-[#F5A623]'}`} placeholder={placeholder} />
  </div>
);

const SelectBlock = ({ label, options, disabled }: any) => (
  <div className="space-y-3 text-left">
    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">{label}</label>
    <select disabled={disabled} className={`w-full border border-gray-100 rounded-xl px-5 py-4 text-sm font-medium outline-none appearance-none transition-all ${disabled ? 'bg-[#F9FAFB] opacity-80' : 'bg-white ring-2 ring-[#F5A623]/20 focus:ring-[#F5A623]'}`}>
      {options.map((opt: string) => <option key={opt}>{opt}</option>)}
    </select>
  </div>
);

export default ProfileDashboard;