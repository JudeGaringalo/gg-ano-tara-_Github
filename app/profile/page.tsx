"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from "@/app/lib/supabase/client";
import { ReactLenis } from '@studio-freight/react-lenis';

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
  
  // UI States
  const [isLoading, setIsLoading] = useState(true);
  
  // Data States
  const [user, setUser] = useState<any>(null);
  const [profileForm, setProfileForm] = useState<ProfileFormState>({
    fullName: '',
    nickname: '',
    username: '',
    gender: 'Other',
    email: '',
  });

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          router.push('/login');
          return;
        }

        setUser(session.user);

        // Extracting data strictly from Google OAuth metadata
        const authMetadata = session.user.user_metadata ?? {};
        const email = session.user.email ?? '';
        const fallbackName = email ? email.split('@')[0] : 'User';

        setProfileForm({
          fullName: authMetadata.full_name ?? authMetadata.name ?? fallbackName,
          // Google sometimes provides given_name which acts nicely as a nickname
          nickname: authMetadata.given_name ?? authMetadata.nickname ?? fallbackName, 
          username: authMetadata.preferred_username ?? fallbackName,
          gender: authMetadata.gender ?? 'Other',
          email: email,
        });
      } catch (error) {
        console.error("Unexpected error loading user:", error);
      } finally {
        setIsLoading(false); 
      }
    };
    
    fetchUserAndProfile();
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const pageVariants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, staggerChildren: 0.1, delayChildren: 0.1 } },
    exit: { opacity: 0, y: -15, transition: { duration: 0.2 } }
  };

  const itemVariants = {
    initial: { opacity: 0, scale: 0.95, y: 10 },
    animate: { opacity: 1, scale: 1, y: 0 }
  };

  // Prevent UI flashing before data arrives
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center font-bold text-slate-500">
        Loading Profile...
      </div>
    );
  }

  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}>
      <style>{`::-webkit-scrollbar { display: none; } * { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
      <div className="min-h-screen bg-[#F9FAFB] text-[#1A1D23] font-sans overflow-x-hidden">
        
        {/* --- HEADER --- */}
        <header className="w-full bg-white border-b border-gray-100 px-6 md:px-16 py-4 md:py-8 sticky top-0 z-50 flex items-center justify-between h-20 md:h-24">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="w-24 md:w-32">
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
            initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            whileHover={{ scale: 1.1, backgroundColor: '#FEF2F2' }} whileTap={{ scale: 0.9 }}
            className="p-2 md:p-3 rounded-xl transition-colors group" title="Logout"
          >
            <svg className="w-6 h-6 text-slate-400 group-hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013-3v1" />
            </svg>
          </motion.button>
        </header>

        <main className="max-w-7xl mx-auto px-6 md:px-10 pb-20">
          
          <div className="pt-10 md:pt-18 pb-6">
            <motion.button onClick={() => router.push('/dashboard')} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.4 }} whileHover={{ x: -4 }} className="flex items-center gap-2 text-[14px] font-bold text-slate-400 hover:text-[#F5A623] transition-colors group">
              <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back to Dashboard
            </motion.button>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }} className="bg-[#631DC3] rounded-3xl p-8 md:p-12 mb-10 text-white shadow-xl flex flex-col md:flex-row items-center relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 z-10 text-center md:text-left w-full">
              <motion.div whileHover={{ rotate: 5, scale: 1.05 }} className="w-24 h-24 md:w-28 md:h-28 bg-[#D9D9D9] rounded-full border-4 border-white/20 shadow-lg overflow-hidden flex items-center justify-center shrink-0">
                {user?.user_metadata?.avatar_url || user?.user_metadata?.picture ? (
                  <img 
                    src={user.user_metadata.avatar_url || user.user_metadata.picture} 
                    alt={profileForm.fullName} 
                    className="h-full w-full object-cover" 
                    referrerPolicy="no-referrer" 
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
                  <p className="text-sm font-medium">{profileForm.email}</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
              <motion.h2 variants={itemVariants} className="text-xl font-bold">Personal Information</motion.h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 md:gap-y-8">
              <motion.div variants={itemVariants}>
                <InputBlock label="Full Name" value={profileForm.fullName} />
              </motion.div>
              <motion.div variants={itemVariants}>
                <InputBlock label="Username" value={profileForm.username} />
              </motion.div>
              <motion.div variants={itemVariants}>
                <InputBlock label="Nickname" value={profileForm.nickname} />
              </motion.div>
              <motion.div variants={itemVariants}>
                <InputBlock label="Gender" value={profileForm.gender} />
              </motion.div>
              <motion.div variants={itemVariants} className="md:col-span-2">
                <InputBlock label="Email Address" value={profileForm.email} />
              </motion.div>
            </div>
          </motion.div>

        </main>
      </div>
    </ReactLenis>
  );
};

/* --- HELPER COMPONENTS --- */

const InputBlock = ({ label, value }: any) => (
  <div className="space-y-3 text-left">
    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">{label}</label>
    <input 
      value={value} 
      readOnly
      disabled
      className="w-full border border-gray-100 rounded-xl px-5 py-4 text-sm font-medium outline-none transition-all bg-[#F9FAFB] opacity-80 cursor-not-allowed text-slate-600" 
    />
  </div>
);

export default ProfileDashboard;