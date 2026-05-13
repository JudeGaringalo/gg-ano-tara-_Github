"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#0085FF', '#00C292', '#FFA500', '#631DC3'];

const chartData = [
  { name: 'PDFs', value: 45 },
  { name: 'Docs', value: 25 },
  { name: 'Slides', value: 15 },
  { name: 'Notes', value: 15 },
];

const ProfileDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [isEditing, setIsEditing] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#1A1D23] font-sans overflow-x-hidden">
      
      {/* NAVIGATION HEADER */}
      <header className="w-full bg-white border-b border-gray-100 px-16 py-8 sticky top-0 z-40 flex items-center justify-between h-24">
        <div className="flex items-center flex-1">
          <motion.img 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }}
            src="/images/logo.png" 
            alt="Echo Logo" 
            className="h-14 w-auto object-contain cursor-pointer" 
            style={{ filter: 'invert(18%) sepia(88%) saturate(4535%) hue-rotate(262deg) brightness(82%) contrast(92%)' }}
          />
        </div>

        <nav className="hidden lg:flex items-center gap-10">
          {['Exam Mood Booster', 'Active Recall', 'Document Merger', 'Skim-Sync', 'Burnout Detection'].map((item) => (
            <button key={item} className="text-[13px] font-semibold text-slate-600 hover:text-[#631DC3] transition-colors">{item}</button>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-8 flex-1">
          <button className="flex items-center gap-2 group cursor-pointer">
            <img src="/images/user-square.png" className="w-5 h-5 opacity-70" alt="Profile" />
            <span className="text-[14px] font-semibold text-slate-600">Profile</span>
          </button>
          <button className="flex items-center gap-2 group cursor-pointer">
            <img src="/images/logout.png" className="w-5 h-5 opacity-50" alt="Logout" />
            <span className="text-[14px] font-semibold text-slate-500">Logout</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-10">
        
        {/* HERO CARD */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-[#631DC3] via-[#7B42D9] to-[#A3B4D5] rounded-3xl p-12 mb-10 text-white shadow-xl flex items-center relative overflow-hidden">
          <div className="flex items-center gap-8 z-10">
            <div className="w-28 h-28 bg-[#D9D9D9] rounded-full border-4 border-white/20 shadow-lg" />
            <div className="space-y-1">
              <h1 className="text-4xl font-bold tracking-tight">Juan Dela Cruz</h1>
              <div className="flex items-center gap-2">
                <img src="/images/sms.png" className="w-4 h-4 opacity-70 brightness-200" alt="Email" />
                <p className="text-white/80 text-sm font-medium">juandelacruz@gmail.com</p>
              </div>
            </div>
          </div>

          <div className="absolute right-12 flex gap-3 z-10">
            <button onClick={() => setActiveTab('settings')} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'settings' ? 'bg-white text-[#631DC3]' : 'bg-white/20 text-white hover:bg-white/30'}`}>Edit Profile</button>
            <button onClick={() => setActiveTab('analytics')} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'analytics' ? 'bg-white text-[#631DC3]' : 'bg-white/20 text-white hover:bg-white/30'}`}>View Analytics</button>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === 'analytics' ? (
            <motion.div key="analytics" variants={containerVariants} initial="hidden" animate="visible" exit={{ opacity: 0 }} className="space-y-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Total Study Time" value="127.5 hrs" trend="+12%" icon="clock-fast-forward.png" />
                <StatCard label="Documents Processed" value="48" trend="+8" icon="grid-03.png" />
                <StatCard label="Avg Retention Rate" value="82%" trend="+5%" icon="chart-breakout-square.png" />
                <StatCard label="Exam Sessions" value="34" trend="+11" icon="star-01.png" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col h-[400px]">
                  <h3 className="font-bold text-sm text-slate-700 mb-4">Document Types</h3>
                  <div className="flex-grow">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none">
                          {chartData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-sm text-slate-700 mb-8">Achievements</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AchievementCard title="7-Day Streak" desc="Studied for 7 consecutive days" icon="star-01.png" active />
                    <AchievementCard title="High Retention" desc="Achieved 90% retention rate" icon="chart-breakout-square.png" active />
                  </div>
                </div>
              </div>

              {/* RESTORED RECENT ACTIVITY */}
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-sm text-slate-700 mb-8">Recent Activity</h3>
                <div className="space-y-6">
                  <ActivityItem title="Completed: Introduction to Psychology.pdf" time="2 hours ago" icon="grid-03.png" />
                  <ActivityItem title="Exam Booster: Data Structures Lecture" time="5 hours ago" icon="star-01.png" />
                  <ActivityItem title="Uploaded: Research Methods Notes.docx" time="1 day ago" icon="clock-fast-forward.png" />
                  <ActivityItem title="Completed: Statistics Chapter 3" time="2 days ago" icon="grid-03.png" />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="settings" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl p-12 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-xl font-bold">Personal Information</h2>
                {!isEditing && (
                  <motion.button 
                    whileTap={{ scale: 0.95 }} 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#F9FAFB] border border-gray-100 rounded-xl text-[12px] font-bold text-slate-600 hover:bg-[#631DC3] hover:text-white transition-all shadow-sm"
                  >
                    <img src="/images/mdi_pencil.png" className="w-4 h-4 opacity-70" alt="edit" /> Edit
                  </motion.button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                <InputBlock label="Full Name" placeholder="Juan Dela Cruz" disabled={!isEditing} />
                <InputBlock label="Nick Name" placeholder="Juan" disabled={!isEditing} />
                <SelectBlock label="Gender" options={['Male', 'Female', 'Other']} disabled={!isEditing} />
                <InputBlock label="Email Address" placeholder="juandelacruz@gmail.com" disabled={!isEditing} />
              </div>

              {/* ACTION BUTTONS: Visible only when in edit mode */}
              <AnimatePresence>
                {isEditing && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: 10 }}
                    className="mt-12 pt-8 border-t border-gray-50 flex justify-end gap-4"
                  >
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-2 text-slate-400 text-sm font-bold hover:text-slate-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="px-8 py-2.5 bg-[#631DC3] text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-200 hover:brightness-110 transition-all"
                    >
                      Save Changes
                    </button>
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

/* --- HELPERS --- */

const StatCard = ({ label, value, trend, icon }: any) => (
  <div className="bg-white p-7 rounded-2xl border border-gray-100 shadow-sm">
    <div className="flex justify-between items-start mb-5">
      <div className="p-3 bg-gray-50 rounded-xl"><img src={`/images/${icon}`} className="w-6 h-6 opacity-70" alt="icon" /></div>
      <span className="text-[11px] font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-full">{trend}</span>
    </div>
    <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{label}</p>
  </div>
);

const AchievementCard = ({ title, desc, icon, active = false }: any) => (
  <div className={`flex items-center gap-4 p-5 rounded-2xl border ${active ? 'border-gray-200 bg-white shadow-sm' : 'border-gray-50 bg-gray-50/50 opacity-60'}`}>
    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
      <img src={`/images/${icon}`} className="w-5 h-5 opacity-60" alt="icon" />
    </div>
    <div className="text-left">
      <p className="text-sm font-bold text-slate-800">{title}</p>
      <p className="text-[10px] text-slate-400">{desc}</p>
    </div>
  </div>
);

const ActivityItem = ({ title, time, icon }: any) => (
  <div className="flex items-center gap-4 group cursor-pointer">
    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center transition-colors group-hover:bg-indigo-50">
      <img src={`/images/${icon}`} className="w-4 h-4 opacity-40" alt="icon" />
    </div>
    <div>
      <p className="text-sm font-bold text-slate-700 group-hover:text-[#631DC3] transition-colors">{title}</p>
      <p className="text-[11px] text-slate-400">{time}</p>
    </div>
  </div>
);

const InputBlock = ({ label, placeholder, disabled }: any) => (
  <div className="space-y-3 text-left">
    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">{label}</label>
    <input 
      disabled={disabled} 
      className={`w-full border border-gray-100 rounded-xl px-5 py-4 text-sm font-medium outline-none transition-all ${disabled ? 'bg-[#F9FAFB] opacity-80' : 'bg-white ring-2 ring-[#631DC3]/10 focus:ring-[#631DC3]'}`} 
      placeholder={placeholder} 
    />
  </div>
);

const SelectBlock = ({ label, options, disabled }: any) => (
  <div className="space-y-3 text-left">
    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">{label}</label>
    <select 
      disabled={disabled} 
      className={`w-full border border-gray-100 rounded-xl px-5 py-4 text-sm font-medium outline-none appearance-none transition-all ${disabled ? 'bg-[#F9FAFB] opacity-80' : 'bg-white ring-2 ring-[#631DC3]/10 focus:ring-[#631DC3]'}`}
    >
      {options.map((opt: string) => <option key={opt}>{opt}</option>)}
    </select>
  </div>
);

export default ProfileDashboard;