"use client";

import Link from 'next/link';
import React, { useEffect } from 'react'; 
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from "@/app/lib/supabase/client";
import { ReactLenis } from '@studio-freight/react-lenis';

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
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/dashboard');
      }
    };
    checkUser();
  }, [router, supabase]);

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
  };

  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}>
      <style>{`::-webkit-scrollbar { display: none; } * { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
      
      <div className="flex flex-col md:flex-row min-h-screen w-full font-sans text-slate-900 overflow-hidden md:overflow-visible">
        <section className="absolute inset-0 z-30 flex w-full flex-col p-8 justify-center lg:relative lg:inset-auto lg:w-1/2 lg:p-16 lg:bg-white">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <button type="button" onClick={() => router.push('/')} className="absolute top-4 left-4 lg:top-6 lg:left-6 z-10 flex items-center w-24 lg:w-32 h-auto cursor-pointer transition-transform hover:scale-105 active:scale-95 focus:outline-none">
              <img src="/images/logo.png" alt="Echo Logo" className="w-full h-auto object-contain md:brightness-0 md:invert lg:brightness-100 lg:invert-0" />
            </button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="flex flex-1 flex-col items-center justify-center pt-24 xs:pt-0 md:pt-0 xs:-translate-y-20 md:-translate-y-12 lg:translate-y-0"
          >
            <div className="w-full max-w-[340px] px-6 py-8 bg-white/10 backdrop-blur-md rounded-3xl lg:bg-transparent lg:backdrop-blur-none lg:p-0">
              <div className="w-full max-w-sm">
                <h2 className="text-4xl font-semibold tracking-tight xs:text-white xs:text-xs md:text-white lg:text-slate-900">Log In</h2>
                <p className="mt-2 text-slate-500 xs:text-slate-200 xs:text- xs md:text-slate-200 lg:text-slate-500">Ready to fine-tune your focus?</p>

                <button onClick={loginWithGoogle} type="button" className="mt-8 flex w-full items-center justify-center gap-3 rounded-full border border-slate-300 bg-white px-4 py-3 text-sm font-medium transition hover:bg-slate-50 hover:scale-[1.05] active:scale-100">
                  <img src="/images/Social icon.png" alt="Google logo" className="h-5 w-5"/>
                  Log In with Google
                </button>

                <Link href="/" className="group mt-6 flex items-center justify-center gap-2 text-base text-slate-400 transition-colors hover:text-black">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:-translate-x-1">
                    <path d="m12 19-7-7 7-7"/>
                    <path d="M19 12H5"/>
                  </svg>
                  Go back to home page
                </Link>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, delay: 1.2, type: "spring", stiffness: 100 }}
          >
            <motion.img 
              src="/images/Hand-drawn arrow.png" 
              alt="Hand drawn arrow decoration" 
              className="h-[250px] w-[250px] object-contain relative top-60 translate-x-[-60px] lg:h-[180px] lg:w-[180px] lg:translate-x-[-40px] lg:translate-y-[-77px] lg:block sm:hidden"
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </section>

        <section className="absolute inset-0 z-0 h-full w-full overflow-hidden lg:relative lg:inset-auto lg:w-1/2 lg:block min-h-[50vh] md:h-screen">
          <img src="/images/login-bg.png" alt="Student studying" className="absolute inset-0 h-full w-full object-cover z-0" />
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="absolute inset-0 z-10 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
          
          <div className="absolute inset-0 z-10 bg-black/10 backdrop-blur-[1px]" style={{ backgroundImage: 'radial-gradient(circle, #ffffff22 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

          <div className="absolute inset-0 z-20 flex flex-col justify-end p-8 md:p-16 text-white xs:hidden">
            <motion.img 
              src="/images/sparkles.png" 
              alt="Sparkle"
              className="w-12 h-12 md:w-16 md:h-16 mb-6 object-contain origin-center md:w-10 md:h-10"
              animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
              className="max-w-2xl"
            >
              <h2 className="mb-4 text-3xl md:text-3xl font-semibold leading-tight tracking-tighter xs:hidden xs:txt-xs">Start fine-tuning your focus.</h2>
              <p className="mb-8 md:mb-6 text-sm md:text-md text-slate-200 leading-relaxed xs:txt-xs">
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
                    className="relative h-10 w-10 md:h-[52px] md:w-[52px] rounded-full border-2 border-white bg-slate-300 object-cover transition-all duration-300 ease-out hover:z-10 hover:scale-110 hover:-translate-y-1 hover:shadow-lg cursor-pointer active:scale-95 lg:h-9 lg:w-9 lg:hover:scale-105 lg:hover:-translate-y-0.5"
                  />
                ))}
              </div>

              <div>
                <div className="flex items-center">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <img key={i} src="/images/Star.png" alt="star" className="h-4 w-4 md:h-6 md:w-6 object-contain lg:h-4 lg:w-4" />
                    ))}
                  </div>
                  <span className="ml-2 font-bold text-white">5.0</span>
                </div>
                <p className="text-xs md:text-sm text-slate-300">from 200+ reviews</p>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </ReactLenis>
  );
};

export default LoginPage;