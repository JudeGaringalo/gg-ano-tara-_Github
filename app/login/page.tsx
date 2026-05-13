import Link from 'next/link';
import React from 'react'; 

const avatarUrls = [
  "/images/users/Jude.jpg",
  "/images/users/Jude.jpg",
  "/images/users/Jude.jpg",
  "/images/users/Jude.jpg",
  "/images/users/Jude.jpg",
  "/images/users/Jude.jpg",
  "/images/users/Jude.jpg",
];

const LoginPage: React.FC = () => {
  return (
    <div className="flex min-h-screen w-full font-sans text-slate-900">
      
      <section className="relative flex w-full flex-col p-8 md:w-1/2 lg:p-16">

        <div className="flex items-center w-24 h-auto">
          <img src="/images/logo.png" alt="Echo Logo" className="w-full h-auto object-contain " />
        </div>

        <div className="flex flex-1 flex-col justify-center items-center">
          <div className="w-full max-w-sm">
            <h2 className="text-4xl font-semibold tracking-tight">Log In</h2>
            <p className="mt-2 text-slate-500">Login to your account.</p>

            <button type="button" className="mt-8 flex w-full items-center justify-center gap-3 rounded-full border border-slate-300 bg-white px-4 py-3 text-sm font-medium transition hover:bg-slate-50">
              <img src="/images/Social icon.png" alt="Google logo" className="h-5 w-5"/>
              Log In with Google
            </button>
          </div>
        </div>

        <div className="absolute bottom-10 right-10">
            <img src="/images/Hand-drawn arrow.png" alt="Hand drawn arrow decoration" className="h-[120px] w-[120px] object-contain "/>
        </div>
      </section>

      <section className="relative hidden w-1/2 overflow-hidden md:block">
        <img 
          src="image_4703fe.jpg" 
          alt="Student studying" 
          className="absolute h-full w-full object-cover"
        />
        
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" 
             style={{ backgroundImage: 'radial-gradient(circle, #ffffff22 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
        />

        <div className="absolute inset-0 flex flex-col justify-end p-12 text-white bg-gradient-to-t from-black/60 via-transparent to-transparent">
            <div className="max-w-2xl">
                <h2 className="mb-6 text-5xl font-semibold leading-tight tracking-tighter">
                Start fine-tuning your focus.
                </h2>
                <p className="mb-10 text-lg text-slate-200 leading-relaxed">
                Log in to unlock a smarter way to study. With Echo, your documents become dynamic audio experiences that adapt to your mental energy. 
                </p>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                    {avatarUrls.map((imgSrc, index) => (
                    <img
                        key={index}
                        src={imgSrc}
                        alt={`Reviewer ${index + 1}`}
                        className="h-10 w-10 rounded-full border-2 border-white object-cover bg-slate-300"
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
                            className="h-4 w-4 object-contain" 
                        />
                        ))}
                    </div>
                    
                    {/* Rating Number */}
                    <span className="ml-2 font-bold text-white">5.0</span>
                    </div>
                    
                    <p className="text-xs text-slate-300">from 200+ reviews</p>
                </div>
            </div>
        </div>
      </section>
    </div>
  );
};

export default LoginPage;