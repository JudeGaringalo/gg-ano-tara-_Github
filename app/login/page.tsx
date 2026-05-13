"use client";

import Link from 'next/link';
import React from 'react'; 
import { motion } from 'framer-motion';
import { createClient } from "@/app/lib/supabase/client"; // import client 

const avatarUrls = [
  "/images/Team/Jude.jpg",
  "/images/Team/Sai.jpg",
  "/images/Team/Kristine.jpg",
  "/images/Team/Trisha.jpg",
  "/images/Team/Mary.jpg",
  "/images/Team/Gab.jpg",
  "/images/Team/Jahmell.jpg",
];

const LoginPage: React.FC = () => {
  const supabase = createClient();

  // handle login
  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3000/api/auth/callback",
      },
    });
  };

  return (
    <div className="flex min-h-screen w-full font-sans text-slate-900">
      
      <section className="relative flex w-full flex-col p-8 md:w-1/2 lg:p-16 bg-white">

        <motion.div 
        initial={{ opacity: 0, }}
        animate={{ opacity: 1, }}
        transition={{ duration: 0.6, ease: "easeOut" }}>
            <button type="button" onClick={() => console.log("Logo clicked!")} className="absolute top-4 left-4 lg:top-6 lg:left-6 z-10 flex items-center w-30 h-auto cursor-pointer transition-transform hover:scale-105 active:scale-95 focus:outline-none">
            <img src="/images/logo.png" alt="Echo Logo" className="w-full h-auto object-contain" />
            </button>
        </motion.div>

        <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        className="flex flex-1 flex-col items-center justify-center">
        <div className="w-full max-w-[340px] px-6">
          <div className="w-full max-w-sm">
            <h2 className="text-4xl font-semibold tracking-tight">Log In</h2>
            <p className="mt-2 text-slate-500">Ready to fine-tune your focus?</p>

            <button onClick={loginWithGoogle}  type="button" className="mt-8 flex w-full items-center justify-center gap-3 rounded-full border border-slate-300 bg-white px-4 py-3 text-sm font-medium transition hover:bg-slate-50 hover:scale-[1.05] active:scale-100">
              <img src="/images/Social icon.png" alt="Google logo" className="h-5 w-5"/>
              Log In with Google
            </button>

            <a href="/" className="group mt-6 flex items-center justify-center gap-2 text-base text-slate-400 transition-colors hover:text-slate-700" >
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="transition-transform group-hover:-translate-x-1">
                    <path d="m12 19-7-7 7-7"/>
                    <path d="M19 12H5"/>
                </svg>
                Go back to home page
            </a>

          </div>
        </div>
        </motion.div>
        
        <motion.div 
        className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        
        initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ 
            duration: 0.5, 
            delay: 1.2, 
            type: "spring",
            stiffness: 100
        }} />

        <motion.div 
        className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ 
            duration: 0.5, 
            delay: 1.2, 
            type: "spring",
            stiffness: 100
        }} >
            <motion.img 
            src="/images/Hand-drawn arrow.png" 
            alt="Hand drawn arrow decoration" 
            className="h-[250px] w-[250px] object-contain relative top-60 translate-x-[-60px]"
            animate={{ y: [0, -12, 0] }}
            transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: "easeInOut" 
            }}/>
        </motion.div>

      </section>

      <section className="relative hidden w-1/2 overflow-hidden md:block">

        <img 
        src="/images/login-bg.png" 
        alt="Student studying" 
        className="absolute inset-0 h-full w-full object-cover z-0"
        />

        <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 1 }}
        className="absolute inset-0 z-10 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none"
        />
        
       <div className="absolute inset-0 z-10 bg-black/10 backdrop-blur-[1px]" style={{ backgroundImage: 'radial-gradient(circle, #ffffff22 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="absolute inset-0 z-20 flex flex-col justify-end p-16 text-white">
            <motion.img 
                src="/images/sparkles.png" 
                alt="Sparkle"
                className="w-16 h-16 mb-6 object-contain origin-center"
                animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                    duration: 4, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                }}
            />

            <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
                className="max-w-2xl"
            >
                <h2 className="mb-6 text-5xl font-semibold leading-tight tracking-tighter">
                    Start fine-tuning your focus.
                </h2>
                <p className="mb-10 text-lg text-slate-200 leading-relaxed">
                    Log in to unlock a smarter way to study. With Echo, your documents become dynamic audio experiences that adapt to your mental energy. 
                </p>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="flex items-center gap-4"
            >
                <div className="flex -space-x-3 hover-group">
                    {avatarUrls.map((imgSrc, index) => (
                    <img
                        key={index}
                        src={imgSrc}
                        alt={`Reviewer ${index + 1}`}
                        className="relative h-[52px] w-[52px] rounded-full border-2 border-white bg-slate-300 object-cover transition-all duration-300 ease-out hover:z-10 hover:scale-110 hover:-translate-y-1 hover:shadow-lg cursor-pointer active:scale-95"
                    />
                    ))}
                </div>

                <div>
                    <div className="flex items-center">
                    <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                        <img 
                            key={i} 
                            src="/images/Star.png" 
                            alt="star" 
                            className="h-6 w-6 object-contain" 
                        />
                        ))}
                    </div>
                    <span className="ml-2 font-bold text-white">5.0</span>
                    </div>
                    <p className="text-sm text-slate-300">from 200+ reviews</p>
                </div>
            </motion.div>
        </div>
        </section>
    </div>
  );
};

export default LoginPage;