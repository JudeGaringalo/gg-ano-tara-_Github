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
        
        <div className="relative flex min-h-screen w-full font-sans text-slate-900 overflow-hidden">

            <div className="absolute inset-0 z-0 lg:left-1/2 lg:w-1/2">
                <img 
                    src="/images/login-bg.png" 
                    alt="Student studying" 
                    className="h-full w-full object-cover" 
                />
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    transition={{ duration: 1 }} 
                    className="absolute inset-0 z-10 bg-gradient-to-t from-black/95 via-black/60 to-black/40 lg:to-black/20 pointer-events-none" 
                />
                {/* Subtle dot pattern overlay */}
                <div 
                    className="absolute inset-0 z-10 bg-black/10 backdrop-blur-[2px] lg:backdrop-blur-[1px]" 
                    style={{ backgroundImage: 'radial-gradient(circle, #ffffff22 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
                />
            </div>

            {/* --- LEFT SECTION: LOGIN FORM --- */}
            <section className="relative z-20 flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:bg-white lg:px-16 min-h-screen lg:min-h-0">
                
                {/* Logo */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }} 
                > 
                    <button 
                        type="button" 
                        onClick={() => router.push('/')} 
                        className="absolute top-8 left-6 lg:top-10 lg:left-12 z-30 flex items-center w-28 lg:w-32 h-auto cursor-pointer transition-transform hover:scale-105 active:scale-95 focus:outline-none"
                    >
                        <img 
                            src="/images/logo.png" 
                            alt="Echo Logo" 
                            // Turns white on mobile dark bg, stays black on desktop white bg
                            style={{ filter: 'invert(18%) sepia(88%) saturate(4535%) hue-rotate(262deg) brightness(82%) contrast(92%)' }}
                            className="w-full h-auto object-contain brightness-0 invert lg:brightness-100 lg:invert-0" 
                        />
                    </button>
                </motion.div>

                {/* Form Container */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                    className="mx-auto w-full max-w-sm"
                >
                    {/* Glassmorphism on mobile, Flat white on desktop */}
                    <div className="w-full rounded-[2rem] bg-white/10 p-8 backdrop-blur-xl border border-white/20 shadow-2xl lg:border-none lg:bg-transparent lg:p-0 lg:backdrop-blur-none lg:shadow-none text-center lg:text-left">
                        
                        <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight text-white lg:text-slate-900">
                            Log In
                        </h2>
                        <p className="mt-2 text-slate-200 lg:text-slate-500 text-sm lg:text-base">
                            Ready to fine-tune your focus?
                        </p>

                        <button 
                            onClick={loginWithGoogle} 
                            type="button" 
                            className="mt-8 flex w-full items-center justify-center gap-3 rounded-full border border-slate-300 bg-white px-4 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 hover:scale-[1.05] active:scale-95 shadow-sm"
                        >
                            <img src="/images/Social icon.png" alt="Google logo" className="h-5 w-5"/>
                            Log In with Google
                        </button>

                        <Link 
                            href="/" 
                            className="group mt-8 flex items-center justify-center lg:justify-start gap-2 text-sm text-slate-300 lg:text-slate-400 transition-colors hover:text-white lg:hover:text-black font-medium"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:-translate-x-1">
                                <path d="m12 19-7-7 7-7"/>
                                <path d="M19 12H5"/>
                            </svg>
                            Go back to home page
                        </Link>
                    </div>
                </motion.div>

                {/* Hand-drawn Arrow Decoration (Desktop Only) */}
                <motion.div 
                    className="hidden lg:block absolute right-[-60px] top-1/2 -translate-y-[20%] z-50 pointer-events-none"
                    initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ duration: 0.5, delay: 1.2, type: "spring", stiffness: 100 }} 
                >
                    <motion.img 
                        src="/images/Hand-drawn arrow.png" 
                        alt="Hand drawn arrow decoration" 
                        className="h-[180px] w-[180px] object-contain opacity-80"
                        animate={{ x: [0, 10, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} 
                    />
                </motion.div>
            </section>

            {/* --- RIGHT SECTION: COPY & TESTIMONIALS (Hidden on Mobile) --- */}
            <section className="relative z-10 hidden w-1/2 flex-col justify-end p-12 xl:p-20 text-white lg:flex pointer-events-none">
                
                <motion.img 
                    src="/images/sparkles.png" 
                    alt="Sparkle"
                    className="w-12 h-12 mb-6 object-contain origin-center"
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} 
                />

                <motion.div
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
                    className="max-w-xl" 
                >
                    <h2 className="mb-4 text-4xl xl:text-5xl font-semibold leading-tight tracking-tighter">
                        Start fine-tuning your focus.
                    </h2>
                    <p className="mb-10 text-base xl:text-lg text-slate-200 leading-relaxed">
                        Log in to unlock a smarter way to study. With Echo, your documents become dynamic audio experiences that adapt to your mental energy. 
                    </p>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                    className="flex items-center gap-5 pointer-events-auto" 
                >
                    <div className="flex -space-x-3">
                        {avatarUrls.map((imgSrc, index) => (
                            <img
                                key={index}
                                src={imgSrc}
                                alt={`Reviewer ${index + 1}`}
                                className="relative h-10 w-10 xl:h-12 xl:w-12 rounded-full border-2 border-white/20 bg-slate-300 object-cover transition-all duration-300 hover:z-10 hover:scale-110 hover:-translate-y-1 hover:border-white shadow-lg cursor-pointer"
                            />
                        ))}
                    </div>

                    <div>
                        <div className="flex items-center">
                            <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <img key={i} src="/images/Star.png" alt="star" className="h-4 w-4 xl:h-5 xl:w-5 object-contain" />
                                ))}
                            </div>
                            <span className="ml-2 font-bold text-white text-lg">5.0</span>
                        </div>
                        <p className="text-sm text-slate-300 mt-0.5">from 200+ reviews</p>
                    </div>
                </motion.div>
            </section>

        </div>
        </ReactLenis>
    );
};

export default LoginPage;