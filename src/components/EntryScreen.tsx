import React from 'react';
import { Sparkles, Heart, Compass, Volume2, VolumeX } from 'lucide-react';
import { RelationshipSettings } from '../types';

interface EntryScreenProps {
  settings: RelationshipSettings;
  onEnter: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const EntryScreen: React.FC<EntryScreenProps> = ({
  settings,
  onEnter,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 sm:p-12 bg-radial from-[#382b4a]/90 via-[#221c33]/95 to-[#130f1e] text-[#fff5e9] select-none backdrop-blur-md">
      {/* Subtle floating particles background styling */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#ebcad8]/20 blur-3xl" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 rounded-full bg-[#beb5e9]/20 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 rounded-full bg-[#b8d4b4]/15 blur-3xl" />
      </div>

      {/* Top Header Badge */}
      <div className="w-full flex items-center justify-between max-w-4xl relative z-10">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-[#ebcad8]">
          <Heart className="w-3.5 h-3.5 fill-[#ebcad8]" />
          <span>A Private Sanctuary for {settings.couple_name}</span>
        </div>

        <button
          onClick={onToggleMute}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/70 hover:text-white transition-colors"
          title={isMuted ? 'Unmute Atmosphere Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-white/50" /> : <Volume2 className="w-4 h-4 text-[#ebcad8]" />}
          <span>{isMuted ? 'Muted' : 'Atmosphere On'}</span>
        </button>
      </div>

      {/* Center Cinematic Card */}
      <div className="flex flex-col items-center text-center max-w-xl relative z-10 my-auto py-8">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#ebcad8]/20 to-[#beb5e9]/30 border border-white/20 flex items-center justify-center mb-6 shadow-xl shadow-purple-950/40">
          <Sparkles className="w-8 h-8 text-[#fff5e9] animate-pulse" />
        </div>

        <h1 className="text-4xl sm:text-6xl font-serif tracking-wide text-[#fff5e9] mb-4 drop-shadow-md">
          Floating Memory Island
        </h1>

        <p className="text-base sm:text-lg font-serif italic text-[#ebcad8] mb-4">
          &ldquo;{settings.tagline}&rdquo;
        </p>

        <p className="text-xs sm:text-sm text-white/70 max-w-md leading-relaxed mb-8">
          A freely explorable 3D realm suspended above the clouds. Step inside to wander through our cottage,
          read our letters, listen to our songs, and relive our dearest memories.
        </p>

        <button
          onClick={onEnter}
          className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-[#ebcad8] via-[#e2c1d3] to-[#beb5e9] text-[#2c243b] font-medium text-sm sm:text-base tracking-wider uppercase shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300"
        >
          <Compass className="w-4 h-4 transition-transform group-hover:rotate-45" />
          <span>Enter Our World</span>
        </button>

        <div className="mt-6 flex items-center gap-6 text-[11px] text-white/40 tracking-wider">
          <span>WASD or Drag to Fly</span>
          <span>•</span>
          <span>Click to Inspect Memories</span>
          <span>•</span>
          <span>100% Private</span>
        </div>
      </div>

      {/* Bottom Quote */}
      <div className="w-full max-w-xl text-center relative z-10 text-xs text-white/40 font-serif italic border-t border-white/5 pt-4">
        &ldquo;{settings.featured_quote}&rdquo;
      </div>
    </div>
  );
};
