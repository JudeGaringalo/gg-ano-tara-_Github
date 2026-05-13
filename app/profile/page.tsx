"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { createClient } from "@/app/lib/supabase/client";
import { ReactLenis } from '@studio-freight/react-lenis';

const COLORS = ['#0085FF', '#00C292', '#F5A623', '#631DC3'];

const chartData = [
  { name: 'PDFs', value: 45 }, 
  { name: 'Docs', value: 25 },
  { name: 'Slides', value: 15 }, 
  { name: 'Notes', value: 15 },
];

type ProfileFormState = {
  fullName: string;
  nickname: string;
  username: string;
  gender: string;
  email: string;
};

const ProfileDashboard = () => {
  const router = useRouter();
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState('analytics');
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [profileForm, setProfileForm] = useState<ProfileFormState>({
    fullName: '',
    nickname: '',
    username: '',
    gender: 'Other',
    email: '',
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      setUser(session.user);

      const authMetadata = session.user.user_metadata ?? {};
      const email = session.user.email ?? '';
      const fallbackName = email ? email.split('@')[0] : 'User';

      const { data: profileData } = await supabase
        .from('profile')
        .select('nickname, username')
        .eq('id', session.user.id)
        .maybeSingle();

      setProfileForm({
        fullName: authMetadata.full_name ?? authMetadata.name ?? fallbackName,
        nickname: profileData?.nickname ?? authMetadata.nickname ?? fallbackName,
        username: profileData?.username ?? authMetadata.username ?? fallbackName,
        gender: authMetadata.gender ?? 'Other',
        email,
      });
    };
    checkUser();
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleSaveProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    setIsSaving(true);

    const [{ error: profileError }, { error: authError }] = await Promise.all([
      supabase
        .from('profile')
        .upsert({
          id: session.user.id,
          nickname: profileForm.nickname,
          username: profileForm.username,
        }),
      supabase.auth.updateUser({
        data: {
          full_name: profileForm.fullName,
          name: profileForm.fullName,
          nickname: profileForm.nickname,
          username: profileForm.username,
          gender: profileForm.gender,
        },
      }),
    ]);

    setIsSaving(false);

    if (profileError || authError) {
      return;
    }

    setIsEditing(false);
  };

  const pageVariants = {
    initial: { opacity: 0, y: 15 },
    animate: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.4, staggerChildren: 0.1, delayChildren: 0.1 } 
    },
    exit: { opacity: 0, y: -15, transition: { duration: 0.2 } }
  };

  const itemVariants = {
    initial: { opacity: 0, scale: 0.95, y: 10 },
    animate: { opacity: 1, scale: 1, y: 0 }
  };

  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}>
      <style>{`::-webkit-scrollbar { display: none; } * { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
      <div className="min-h-screen bg-[#F9FAFB] text-[#1A1D23] font-sans overflow-x-hidden">
        
        <header className="w-full bg-white border-b border-gray-100 px-6 md:px-16 py-4 md:py-8 sticky top-0 z-50 flex items-center justify-between h-20 md:h-24">
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-24 md:w-32"
          >
            <img 
              src="/images/logo.png" 
              alt="Echo Logo" 
              className="w-full h-auto object-contain cursor-pointer" 
              onClick={() => router.push('/dashboard')}
              style={{ filter: 'invert(18%) sepia(88%) saturate(4535%) hue-rotate(262deg) brightness(82%) contrast(92%)' }}
            />
          </motion.div>

          <motion.button 
            onClick={handleLogout}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            whileHover={{ scale: 1.1, backgroundColor: '#FEF2F2' }}
            whileTap={{ scale: 0.9 }}
            className="p-2 md:p-3 rounded-xl transition-colors group"
            title="Logout"
          >
            <svg className="w-6 h-6 text-slate-400 group-hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013-3v1" />
            </svg>
          </motion.button>
        </header>

        <main className="max-w-7xl mx-auto px-6 md:px-10 pb-20">
          
          <div className="pt-10 md:pt-18 pb-6">
            <motion.button 
              onClick={() => router.push('/dashboard')}
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

          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.4, duration: 0.5 }}
            className="bg-[#631DC3] rounded-3xl p-8 md:p-12 mb-10 text-white shadow-xl flex flex-col md:flex-row items-center md:items-center justify-between relative overflow-hidden"
          >
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 z-10 text-center md:text-left">
              <motion.div whileHover={{ rotate: 5, scale: 1.05 }} className="w-24 h-24 md:w-28 md:h-28 bg-[#D9D9D9] rounded-full border-4 border-white/20 shadow-lg overflow-hidden flex items-center justify-center">
                {user?.user_metadata?.avatar_url || user?.user_metadata?.picture ? (
                  <img
                    src={user.user_metadata.avatar_url || user.user_metadata.picture}
                    alt={profileForm.fullName || 'User profile picture'}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-3xl md:text-4xl font-black text-[#631DC3]">
                    {(profileForm.nickname || profileForm.fullName || profileForm.email || 'U').charAt(0).toUpperCase()}
                  </span>
                )}
              </motion.div>
              <div className="space-y-1">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{profileForm.fullName || 'User'}</h1>
                <div className="flex items-center justify-center md:justify-start gap-2 opacity-80">
                  <img src="/images/sms.png" className="w-4 h-4 brightness-200" alt="Email icon" />
                  <p className="text-sm font-medium">{profileForm.email || 'No email found'}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 z-10 mt-8 md:mt-0 w-full md:w-auto justify-center">
              <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} label="Edit Profile" />
              <TabButton active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} label="View Analytics" />
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {activeTab === 'analytics' ? (
              <motion.div key="analytics" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-10">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  <StatCard variants={itemVariants} label="Total Study Time" value="127.5 hrs" trend="+12%" icon="clock-fast-forward.png" />
                  <StatCard variants={itemVariants} label="Documents Processed" value="48" trend="+8" icon="grid-03.png" />
                  <StatCard variants={itemVariants} label="Avg Retention Rate" value="82%" trend="+5%" icon="chart-breakout-square.png" />
                  <StatCard variants={itemVariants} label="Exam Sessions" value="34" trend="+11" icon="star-01.png" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <motion.div variants={itemVariants} className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col h-[350px] md:h-[400px]">
                    <h3 className="font-bold text-sm text-slate-700 mb-4">Document Types</h3>
                    <div className="flex-grow">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">
                            {chartData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.05)' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="lg:col-span-2 bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-base text-slate-800 mb-6">Achievements</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <AchievementCard title="7-Day Streak" desc="Studied for 7 consecutive days" icon="star-01.png" active />
                      <AchievementCard title="High Retention" desc="Achieved 90% retention rate" icon="chart-breakout-square.png" active />
                      <AchievementCard title="Study Master" desc="Completed 50+ documents" icon="grid-03.png" active={false} />
                      <AchievementCard title="Cognitive Champion" desc="Maintained optimal cognitive load" icon="check-done-01.png" active />
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="settings" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                  <motion.h2 variants={itemVariants} className="text-xl font-bold">Personal Information</motion.h2>
                  {!isEditing && (
                    <motion.button 
                      variants={itemVariants} whileTap={{ scale: 0.95 }} onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#F9FAFB] border border-gray-100 rounded-xl text-[12px] font-bold text-slate-600 hover:bg-[#F5A623] hover:text-[#1A1D23] transition-all group"
                    >
                      <img src="/images/mdi_pencil.png" className="w-4 h-4 opacity-70 group-hover:opacity-100" alt="pencil icon" /> Edit
                    </motion.button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 md:gap-y-8">
                  <motion.div variants={itemVariants}><InputBlock label="Full Name" value={profileForm.fullName} onChange={(value: string) => setProfileForm((current) => ({ ...current, fullName: value }))} disabled={!isEditing} /></motion.div>
                  <motion.div variants={itemVariants}><InputBlock label="Nick Name" value={profileForm.nickname} onChange={(value: string) => setProfileForm((current) => ({ ...current, nickname: value }))} disabled={!isEditing} /></motion.div>
                  <motion.div variants={itemVariants}><SelectBlock label="Gender" value={profileForm.gender} onChange={(value: string) => setProfileForm((current) => ({ ...current, gender: value }))} options={['Male', 'Female', 'Other']} disabled={!isEditing} /></motion.div>
                  <motion.div variants={itemVariants}><InputBlock label="Email Address" value={profileForm.email} disabled /></motion.div>
                </div>

                <AnimatePresence>
                  {isEditing && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-12 pt-8 border-t border-gray-50 flex flex-col sm:flex-row justify-end gap-4">
                      <button onClick={() => setIsEditing(false)} className="px-6 py-2 text-slate-400 font-bold hover:text-red-500 transition-colors w-full sm:w-auto">Cancel</button>
                      <button onClick={handleSaveProfile} disabled={isSaving} className="px-8 py-2.5 bg-[#F5A623] text-[#1A1D23] rounded-xl font-bold shadow-lg shadow-orange-500/10 hover:brightness-110 transition-all w-full sm:w-auto disabled:opacity-60 disabled:cursor-not-allowed">{isSaving ? 'Saving...' : 'Save Changes'}</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </ReactLenis>
  );
};

const TabButton = ({ active, onClick, label }: any) => (
  <button 
    onClick={onClick} 
    className={`px-4 md:px-6 py-2 rounded-xl text-xs md:text-sm font-bold transition-all duration-300 ${active ? 'bg-[#F5A623] text-[#1A1D23] shadow-lg shadow-orange-500/20 scale-105' : 'bg-white/10 text-white hover:bg-[#F5A623] hover:text-[#1A1D23]'}`}
  >
    {label}
  </button>
);

const StatCard = ({ label, value, trend, icon, variants }: any) => (
  <motion.div variants={variants} whileHover={{ y: -5 }} className="bg-white p-6 md:p-7 rounded-2xl border border-gray-100 shadow-sm cursor-default">
    <div className="flex justify-between items-start mb-5">
      <div className="p-3 bg-gray-50 rounded-xl"><img src={`/images/${icon}`} className="w-6 h-6 opacity-70" alt="card icon" /></div>
      <span className="text-[11px] font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-full">{trend}</span>
    </div>
    <h3 className="text-xl md:text-2xl font-bold tracking-tight">{value}</h3>
    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{label}</p>
  </motion.div>
);

const AchievementCard = ({ title, desc, icon, active = false }: any) => (
  <div className={`flex items-center gap-4 p-4 rounded-xl transition-all ${active ? 'bg-[#F4F5F7] border-2 border-[#1A1D23]' : 'bg-white border border-gray-100 opacity-60'}`}>
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${active ? 'bg-[#E5E7EB]' : 'bg-gray-50'}`}>
      <img src={`/images/${icon}`} className="w-5 h-5" alt="achievement icon" />
    </div>
    <div className="text-left">
      <p className={`text-sm font-bold ${active ? 'text-[#1A1D23]' : 'text-gray-400'}`}>{title}</p>
      <p className="text-[11px] text-gray-400 leading-tight">{desc}</p>
    </div>
  </div>
);

const InputBlock = ({ label, value, onChange, disabled }: any) => (
  <div className="space-y-3 text-left">
    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">{label}</label>
    <input value={value} onChange={(event) => onChange?.(event.target.value)} disabled={disabled} className={`w-full border border-gray-100 rounded-xl px-5 py-4 text-sm font-medium outline-none transition-all ${disabled ? 'bg-[#F9FAFB] opacity-80' : 'bg-white ring-2 ring-[#F5A623]/20 focus:ring-[#F5A623]'}`} />
  </div>
);

const SelectBlock = ({ label, value, onChange, options, disabled }: any) => (
  <div className="space-y-3 text-left">
    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">{label}</label>
    <select value={value} onChange={(event) => onChange?.(event.target.value)} disabled={disabled} className={`w-full border border-gray-100 rounded-xl px-5 py-4 text-sm font-medium outline-none appearance-none transition-all ${disabled ? 'bg-[#F9FAFB] opacity-80' : 'bg-white ring-2 ring-[#F5A623]/20 focus:ring-[#F5A623]'}`}>
      {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

export default ProfileDashboard;