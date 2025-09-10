import React from 'react';

export const GlowingOrb = () => {
    return (
        <div className="relative flex items-center justify-center w-40 h-40">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/50 via-cyan-300/50 to-white/50 blur-2xl animate-pulse duration-[0.5s]"></div>
            <div className="absolute -inset-4 rounded-full bg-gradient-to-br from-electric-blue/30 via-cyan-400/30 to-blue-300/30 blur-3xl animate-pulse duration-[0.8s]"></div>

            <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 via-cyan-300 to-white shadow-2xl shadow-cyan-400/90">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/60 to-transparent animate-spin duration-[1s]"></div>

                <div className="absolute inset-1 rounded-full bg-gradient-to-br from-cyan-200/70 via-blue-300/70 to-white/70 blur-md animate-pulse duration-[0.3s]"></div>

                <div className="absolute inset-3 rounded-full bg-gradient-to-br from-white/80 via-cyan-100/60 to-blue-200/40 animate-ping duration-[0.6s]"></div>

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white blur-sm animate-pulse duration-[0.2s]"></div>

                <div className="absolute top-1/4 left-1/2 w-0.5 h-4 bg-white/80 blur-sm animate-ping duration-[0.4s]"></div>
                <div className="absolute bottom-1/4 right-1/3 w-4 h-0.5 bg-cyan-200/80 blur-sm animate-ping duration-[0.6s]"></div>
            </div>
        </div>
    );
};