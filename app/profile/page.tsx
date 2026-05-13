"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ProfileDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics');

  // Animation variants for the container
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#1A1D23] font-sans overflow-x-hidden">
      
      {/* NAVIGATION HEADER */}
      <header className="w-full bg-white border-b border-gray-100 px-16 py-8 sticky top-0 z-30 flex justify-between items-center">
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center"
        >
          <img 
            src="/images/logo.png" 
            alt="Echo Logo" 
            className="h-14 w-auto object-contain ml-4 cursor-pointer" 
            style={{ filter: 'invert(18%) sepia(88%) saturate(4535%) hue-rotate(262deg) brightness(82%) contrast(92%)' }}
          />
        </motion.div>

        <nav className="hidden lg:flex items-center gap-10">
          {['Exam Mood Booster', 'Active Recall', 'Document Merger', 'Skim-Sync', 'Burnout Detection'].map((item) => (
            <motion.button 
              key={item}
              whileHover={{ y: -2, color: '#631DC3' }}
              className="text-[14px] font-semibold text-slate-600 transition-colors"
            >
              {item}
            </motion.button>
          ))}
        </nav>

        <div className="flex items-center gap-8">
          <button className="flex items-center gap-2 group">
            <img src="/images/user-square.png" className="w-5 h-5 opacity-70" alt="Profile" />
            <span className="text-[14px] font-semibold text-slate-600">Profile</span>
          </button>
          <button className="flex items-center gap-2 group">
            <img src="/images/logout.png" className="w-5 h-5 opacity-50" alt="Logout" />
            <span className="text-[14px] font-semibold text-slate-500 group-hover:text-red-500 transition-colors">Logout</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-10">
        
        {/* GRADIENT HERO CARD */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-gradient-to-r from-[#631DC3] via-[#7B42D9] to-[#A3B4D5] rounded-3xl p-12 mb-10 text-white shadow-xl flex items-center relative overflow-hidden"
        >
          <div className="flex items-center gap-8 z-10">
            <motion.div 
              whileHover={{ rotate: 5 }}
              className="w-28 h-28 bg-[#D9D9D9] rounded-full border-4 border-white/20 shadow-lg flex items-center justify-center"
            />
            
            <div className="space-y-1">
              <h1 className="text-4xl font-bold tracking-tight">Juan Dela Cruz</h1>
              <div className="flex items-center gap-2">
                <img src="/images/sms.png" className="w-4 h-4 opacity-70 brightness-200" alt="Email" />
                <p className="text-white/80 text-sm font-medium">juandelacruz@gmail.com</p>
              </div>
            </div>
          </div>

          <div className="absolute right-12 bottom-12 flex gap-3 z-10">
            <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} label="Edit Profile" />
            <TabButton active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} label="View Analytics" />
          </div>
          
          {/* Subtle animated background flare */}
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute -right-20 -top-20 w-80 h-80 bg-white opacity-20 blur-[100px] rounded-full" 
          />
        </motion.div>

        {/* ANIMATED TAB SWITCHING */}
        <AnimatePresence mode="wait">
          {activeTab === 'analytics' ? (
            <motion.div 
              key="analytics"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard variants={itemVariants} label="Total Study Time" value="127.5 hrs" trend="+12%" icon="clock-fast-forward.png" />
                <StatCard variants={itemVariants} label="Documents Processed" value="48" trend="+8" icon="grid-03.png" />
                <StatCard variants={itemVariants} label="Avg Retention Rate" value="82%" trend="+5%" icon="chart-breakout-square.png" />
                <StatCard variants={itemVariants} label="Exam Sessions" value="34" trend="+11" icon="star-01.png" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ChartBox title="Weekly Study Time" icon="bar-chart-square-02.png" />
                <ChartBox title="Retention Rate Trend" icon="chart-breakout-square.png" />
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white rounded-3xl p-12 shadow-sm border border-gray-100"
            >
              <h2 className="text-xl font-bold mb-10 text-slate-800">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                <InputBlock label="Full Name" placeholder="Juan Dela Cruz" />
                <InputBlock label="Nick Name" placeholder="Juan" />
                <SelectBlock label="Gender" options={['Male', 'Female', 'Other']} />
                <InputBlock label="Email Address" placeholder="juandelacruz@gmail.com" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

/* REUSABLE UI COMPONENTS WITH MOTION */

const TabButton = ({ active, onClick, label }: any) => (
  <motion.button 
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${active ? 'bg-white text-[#631DC3] shadow-lg' : 'bg-white/20 text-white hover:bg-white/30'}`}
  >
    {label}
  </motion.button>
);

const StatCard = ({ label, value, trend, icon, variants }: any) => (
  <motion.div 
    variants={variants}
    whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
    className="bg-white p-7 rounded-2xl border border-gray-100 shadow-sm cursor-default"
  >
    <div className="flex justify-between items-start mb-5">
      <div className="p-3 bg-gray-50 rounded-xl">
        <img src={`/images/${icon}`} className="w-6 h-6 object-contain" alt="icon" />
      </div>
      <span className="text-[11px] font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-full">{trend}</span>
    </div>
    <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{label}</p>
  </motion.div>
);

const ChartBox = ({ title, icon }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm h-80 flex flex-col"
  >
    <h3 className="font-bold text-sm mb-10 flex items-center gap-2 text-slate-700">
      <img src={`/images/${icon}`} className="w-4 h-4 opacity-60" alt="chart-icon" /> {title}
    </h3>
    <div className="flex-grow bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 flex items-center justify-center">
       <p className="text-gray-300 text-xs italic">Chart Visualization Area</p>
    </div>
  </motion.div>
);

const InputBlock = ({ label, placeholder }: any) => (
  <div className="space-y-3">
    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">{label}</label>
    <motion.input 
      whileFocus={{ scale: 1.01, borderColor: '#631DC3' }}
      className="w-full bg-[#F9FAFB] border border-gray-100 rounded-xl px-5 py-4 text-sm font-medium outline-none transition-all" 
      placeholder={placeholder} 
    />
  </div>
);

const SelectBlock = ({ label, options }: any) => (
  <div className="space-y-3">
    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">{label}</label>
    <select className="w-full bg-[#F9FAFB] border border-gray-100 rounded-xl px-5 py-4 text-sm font-medium outline-none cursor-pointer focus:ring-2 focus:ring-[#631DC3]">
      {options.map((opt: string) => <option key={opt}>{opt}</option>)}
    </select>
  </div>
);

export default ProfileDashboard;