import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Compass,
  Home,
  Flower2,
  Waves,
  Image,
  Mail,
  Sparkles,
  Music,
  Sunset,
  Eye,
  X,
  Keyboard,
} from 'lucide-react';
import { IslandLocationId } from '../../types';
import { ISLAND_LOCATIONS } from '../../three/CameraController';

interface BottomDockProps {
  currentLocationId: IslandLocationId;
  onFlyToLocation: (loc: IslandLocationId) => void;
  isInspecting: boolean;
  onExitInspection: () => void;
  hoveredObjectName?: string;
  compassAngle: number;
}

export const BottomDock: React.FC<BottomDockProps> = ({
  currentLocationId,
  onFlyToLocation,
  isInspecting,
  onExitInspection,
  hoveredObjectName,
  compassAngle,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(() => window.innerWidth < 768);
  const [showControlsHelp, setShowControlsHelp] = useState(false);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Home':
        return <Home className="w-3.5 h-3.5" />;
      case 'Flower2':
        return <Flower2 className="w-3.5 h-3.5" />;
      case 'Waves':
        return <Waves className="w-3.5 h-3.5" />;
      case 'Image':
        return <Image className="w-3.5 h-3.5" />;
      case 'Mail':
        return <Mail className="w-3.5 h-3.5" />;
      case 'Sparkles':
        return <Sparkles className="w-3.5 h-3.5" />;
      case 'Music':
        return <Music className="w-3.5 h-3.5" />;
      case 'Sunset':
        return <Sunset className="w-3.5 h-3.5" />;
      default:
        return <Compass className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div
      className="fixed z-40 transition-transform duration-300 pointer-events-none select-none flex flex-col items-center"
      style={{
        bottom: window.innerWidth < 768 ? '8px' : '20px',
        left: '50%',
        transform: `translateX(-50%) translateY(${isCollapsed ? 'calc(100% - 24px)' : '0'})`,
        maxWidth: 'min(940px, 95vw)',
        width: '100%',
      }}
    >
      {/* Interaction Hint Banner when hovering interactive object */}
      {hoveredObjectName && !isInspecting && (
        <div className="mb-2 pointer-events-auto animate-fade-in">
          <div className="glass-panel px-4 py-1.5 rounded-full text-xs font-medium text-[#fff5e9] flex items-center gap-2 shadow-lg border border-[#ebcad8]/40">
            <span className="w-2 h-2 rounded-full bg-[#ebcad8]" />
            <span>Click to inspect: <strong className="text-[#ebcad8]">{hoveredObjectName}</strong></span>
          </div>
        </div>
      )}

      {/* If currently in inspection mode, show Exit Inspection Bar */}
      {isInspecting && (
        <div className="mb-2 pointer-events-auto">
          <button
            onClick={onExitInspection}
            className="glass-panel px-4 py-2 rounded-full text-xs font-semibold text-[#fff5e9] bg-[#ebcad8]/30 hover:bg-[#ebcad8]/40 border border-[#ebcad8]/50 flex items-center gap-2 shadow-xl transition-transform active:scale-95"
          >
            <X className="w-3.5 h-3.5 text-[#ebcad8]" />
            <span>Exit Close-Up Inspection</span>
          </button>
        </div>
      )}

      {/* Collapse/Expand Toggle Handle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="pointer-events-auto glass-panel px-3 py-1 rounded-t-xl text-[10px] uppercase tracking-wider text-white/60 hover:text-white flex items-center gap-1.5 border-b-0 shadow-md transition-colors"
      >
        {isCollapsed ? (
          <>
            <ChevronUp className="w-3 h-3" />
            <span>Show Destinations</span>
          </>
        ) : (
          <>
            <ChevronDown className="w-3 h-3" />
            <span>Hide Controls</span>
          </>
        )}
      </button>

      {/* Main Glassmorphic Dock */}
      <div className="pointer-events-auto w-full glass-panel p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl flex items-center justify-between gap-2 shadow-2xl overflow-x-auto">
        {/* Compass & Quick Orientation */}
        <div className="hidden lg:flex items-center gap-2 pl-2 pr-1 border-r border-white/10 shrink-0">
          <div
            className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center transition-transform"
            style={{ transform: `rotate(${-compassAngle}rad)` }}
            title="Compass Orientation"
          >
            <Compass className="w-4 h-4 text-[#ebcad8]" />
          </div>
        </div>

        {/* 8 Fly-To Destination Pills */}
        <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar py-0.5 px-1 scroll-smooth">
          {ISLAND_LOCATIONS.map((loc) => {
            const isActive = currentLocationId === loc.id;
            return (
              <button
                key={loc.id}
                onClick={() => onFlyToLocation(loc.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 flex items-center gap-1.5 whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#ebcad8] text-[#2c243b] shadow-md font-semibold'
                    : 'text-white/75 hover:text-white hover:bg-white/10'
                }`}
                title={loc.description}
              >
                {getIcon(loc.icon)}
                <span className="inline">{loc.name}</span>
              </button>
            );
          })}
        </div>

        {/* Keyboard Controls Info Trigger */}
        <div className="hidden md:flex items-center pl-1 border-l border-white/10 shrink-0">
          <button
            onClick={() => setShowControlsHelp(!showControlsHelp)}
            className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            title="View Navigation Keyboard Controls"
          >
            <Keyboard className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Controls Help Modal */}
      {showControlsHelp && (
        <div className="absolute bottom-16 right-4 pointer-events-auto glass-panel p-4 rounded-2xl w-64 text-xs shadow-2xl z-50">
          <div className="flex items-center justify-between text-[#ebcad8] font-semibold mb-2">
            <span>Exploration Controls</span>
            <button
              onClick={() => setShowControlsHelp(false)}
              className="text-white/40 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-1.5 text-white/80">
            <div className="flex justify-between">
              <span className="text-white/50">Move Forward/Back</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px]">W / S</kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Strafe Left/Right</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px]">A / D</kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Fly Upward</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px]">Space</kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Fly Downward</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px]">C / Ctrl</kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Speed Boost</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px]">Shift</kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Look Around</span>
              <span className="text-[10px] text-white/60">Drag Mouse / Touch</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Zoom</span>
              <span className="text-[10px] text-white/60">Mouse Wheel</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
