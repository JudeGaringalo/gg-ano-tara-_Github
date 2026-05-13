"use client";

import React, { useState } from 'react';

const ProfileDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics');

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#1A1D23] font-sans">
      
      {/* NAVIGATION HEADER */}
      <header className="w-full bg-white border-b border-gray-100 px-16 py-8 sticky top-0 z-30 flex justify-between items-center">
        <div className="flex items-center">
          <img 
            src="/images/logo.png" 
            alt="Echo Logo" 
            className="h-14 w-auto object-contain ml-4" 
            style={{ 
              filter: 'invert(18%) sepia(88%) saturate(4535%) hue-rotate(262deg) brightness(82%) contrast(92%)' 
            }}
          />
        </div>

        <nav className="hidden lg:flex items-center gap-10">
          <button className="text-[14px] font-semibold text-slate-600 hover:text-[#631DC3] transition-colors">Exam Mood Booster</button>
          <button className="text-[14px] font-semibold text-slate-600 hover:text-[#631DC3] transition-colors">Active Recall</button>
          <button className="text-[14px] font-semibold text-slate-600 hover:text-[#631DC3] transition-colors">Document Merger</button>
          <button className="text-[14px] font-semibold text-slate-600 hover:text-[#631DC3] transition-colors">Skim-Sync</button>
          <button className="text-[14px] font-semibold text-slate-600 hover:text-[#631DC3] transition-colors">Burnout Detection</button>
        </nav>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 cursor-pointer group">
            <img src="/images/user-square.png" className="w-5 h-5 opacity-70" alt="Profile" />
            <span className="text-[14px] font-semibold text-slate-600">Profile</span>
          </div>
          <div className="flex items-center gap-2 cursor-pointer group">
            <img src="/images/logout.png" className="w-5 h-5 opacity-50" alt="Logout" />
            <span className="text-[14px] font-semibold text-slate-500">Logout</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-10">
        
        {/* GRADIENT HERO CARD - Icon beside name removed */}
        <div className="bg-gradient-to-r from-[#631DC3] via-[#7B42D9] to-[#A3B4D5] rounded-3xl p-12 mb-10 text-white shadow-xl flex items-center relative overflow-hidden">
          <div className="flex items-center gap-8 z-10">
            <div className="w-28 h-28 bg-[#D9D9D9] rounded-full border-4 border-white/20 shadow-lg flex items-center justify-center">
            </div>
            
            <div className="space-y-1">
              <h1 className="text-4xl font-bold tracking-tight">Juan Dela Cruz</h1>
              
              <div className="flex items-center gap-2">
                <img src="/images/sms.png" className="w-4 h-4 opacity-70 brightness-200" alt="Email" />
                <p className="text-white/80 text-sm font-medium">juandelacruz@gmail.com</p>
              </div>
            </div>
          </div>

          <div className="absolute right-12 bottom-12 flex gap-3 z-10">
            <button 
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'settings' ? 'bg-white text-[#631DC3] shadow-lg' : 'bg-white/20 text-white hover:bg-white/30'}`}
            >
              Edit Profile
            </button>
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'analytics' ? 'bg-white text-[#631DC3] shadow-lg' : 'bg-white/20 text-white hover:bg-white/30'}`}
            >
              View Analytics
            </button>
          </div>
        </div>

        {/* TAB CONTENT */}
        {activeTab === 'analytics' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard label="Total Study Time" value="127.5 hrs" trend="+12%" icon="clock-fast-forward.png" />
              <StatCard label="Documents Processed" value="48" trend="+8" icon="grid-03.png" />
              <StatCard label="Avg Retention Rate" value="82%" trend="+5%" icon="chart-breakout-square.png" />
              <StatCard label="Exam Sessions" value="34" trend="+11" icon="star-01.png" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ChartBox title="Weekly Study Time" icon="bar-chart-square-02.png" />
              <ChartBox title="Retention Rate Trend" icon="chart-breakout-square.png" />
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl p-12 shadow-sm border border-gray-100 animate-in slide-in-from-right-4 duration-500">
            <h2 className="text-xl font-bold mb-10">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              <InputBlock label="Full Name" placeholder="Juan Dela Cruz" />
              <InputBlock label="Nick Name" placeholder="Juan" />
              <SelectBlock label="Gender" options={['Male', 'Female', 'Other']} />
              <InputBlock label="Email Address" placeholder="juandelacruz@gmail.com" />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

/* REUSABLE UI COMPONENTS */

const StatCard = ({ label, value, trend, icon }) => (
  <div className="bg-white p-7 rounded-2xl border border-gray-100 shadow-sm transition-hover hover:shadow-md">
    <div className="flex justify-between items-start mb-5">
      <div className="p-3 bg-gray-50 rounded-xl">
        <img src={`/images/${icon}`} className="w-6 h-6 object-contain" alt="icon" />
      </div>
      <span className="text-[11px] font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-full">{trend}</span>
    </div>
    <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{label}</p>
  </div>
);

const ChartBox = ({ title, icon }) => (
  <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm h-80 flex flex-col">
    <h3 className="font-bold text-sm mb-10 flex items-center gap-2 text-slate-700">
      <img src={`/images/${icon}`} className="w-4 h-4 opacity-60" alt="chart-icon" /> {title}
    </h3>
    <div className="flex-grow bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 flex items-center justify-center">
       <p className="text-gray-300 text-xs italic">Chart Visualization Area</p>
    </div>
  </div>
);

const InputBlock = ({ label, placeholder }) => (
  <div className="space-y-3">
    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">{label}</label>
    <input className="w-full bg-[#F9FAFB] border border-gray-100 rounded-xl px-5 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-[#631DC3] transition-all" placeholder={placeholder} />
  </div>
);

const SelectBlock = ({ label, options }) => (
  <div className="space-y-3">
    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">{label}</label>
    <select className="w-full bg-[#F9FAFB] border border-gray-100 rounded-xl px-5 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-[#631DC3] transition-all cursor-pointer">
      {options.map(opt => <option key={opt}>{opt}</option>)}
    </select>
  </div>
);

export default ProfileDashboard;