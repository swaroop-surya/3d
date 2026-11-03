import React, { useRef, useState, useCallback, useEffect } from 'react';
import { ChevronUp, ChevronDown, Hand, Sparkles } from 'lucide-react';
import { CameraController } from '../../three/CameraController';

interface MobileControlsProps {
  controller: CameraController | null;
  onInteract?: () => void;
  hoveredObjectName?: string;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  controller,
  onInteract,
  hoveredObjectName,
}) => {
  // Joystick State
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isJoystickDragging, setIsJoystickDragging] = useState(false);
  const joystickPointerId = useRef<number | null>(null);

  // Screen Rotate / Look State
  const lookPointerId = useRef<number | null>(null);
  const lastLookPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showSwipeHint, setShowSwipeHint] = useState(true);

  // Auto-hide swipe hint after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowSwipeHint(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // =========================================================================
  // 1. SCREEN ROTATION (Swipe anywhere outside joystick & buttons)
  // =========================================================================
  const handleLookStart = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only accept if not already tracking a look pointer
    if (lookPointerId.current !== null) return;

    lookPointerId.current = e.pointerId;
    lastLookPos.current = { x: e.clientX, y: e.clientY };
    setShowSwipeHint(false);

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
  };

  const handleLookMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (lookPointerId.current !== e.pointerId || !controller) return;

    const dx = e.clientX - lastLookPos.current.x;
    const dy = e.clientY - lastLookPos.current.y;

    lastLookPos.current = { x: e.clientX, y: e.clientY };

    // Rotate camera smoothly (sensitivity tuned for mobile touch)
    controller.rotateCameraDelta(dx, dy, 0.0042);
  };

  const handleLookEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (lookPointerId.current === e.pointerId) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
      lookPointerId.current = null;
    }
  };

  // =========================================================================
  // 2. VIRTUAL JOYSTICK (Horizontal Ground Movement)
  // =========================================================================
  const updateJoystick = useCallback(
    (clientX: number, clientY: number) => {
      if (!joystickBaseRef.current || !controller) return;
      const rect = joystickBaseRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      let dx = clientX - centerX;
      let dy = clientY - centerY;
      const maxRadius = rect.width / 2 - 8;

      const dist = Math.hypot(dx, dy);
      if (dist > maxRadius) {
        dx = (dx / dist) * maxRadius;
        dy = (dy / dist) * maxRadius;
      }

      setKnobPos({ x: dx, y: dy });

      // Calculate normalized vector with deadzone
      const normX = dx / maxRadius;
      const normY = -dy / maxRadius; // pushing up yields positive Y (forward)

      const deadzone = 0.06;
      controller.virtualJoystick.x = Math.abs(normX) > deadzone ? normX : 0;
      controller.virtualJoystick.y = Math.abs(normY) > deadzone ? normY : 0;
    },
    [controller]
  );

  const resetJoystick = useCallback(() => {
    setIsJoystickDragging(false);
    joystickPointerId.current = null;
    setKnobPos({ x: 0, y: 0 });
    if (controller) {
      controller.virtualJoystick.x = 0;
      controller.virtualJoystick.y = 0;
    }
  }, [controller]);

  const handleJoystickDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    joystickPointerId.current = e.pointerId;
    setIsJoystickDragging(true);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    updateJoystick(e.clientX, e.clientY);
  };

  const handleJoystickMove = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!isJoystickDragging || joystickPointerId.current !== e.pointerId) return;
    updateJoystick(e.clientX, e.clientY);
  };

  const handleJoystickUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (joystickPointerId.current === e.pointerId) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
      resetJoystick();
    }
  };

  // Safety cleanup on window
  useEffect(() => {
    window.addEventListener('pointerup', resetJoystick);
    window.addEventListener('pointercancel', resetJoystick);
    return () => {
      window.removeEventListener('pointerup', resetJoystick);
      window.removeEventListener('pointercancel', resetJoystick);
    };
  }, [resetJoystick]);

  // Elevation vertical helper
  const setVertical = (val: number) => {
    if (controller) {
      controller.virtualVertical = val;
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none select-none z-30 lg:hidden overflow-hidden">
      {/* 1. Touch Look Area (Full-screen swipe to rotate view) */}
      <div
        onPointerDown={handleLookStart}
        onPointerMove={handleLookMove}
        onPointerUp={handleLookEnd}
        onPointerCancel={handleLookEnd}
        className="absolute inset-0 pointer-events-auto touch-none"
        style={{ touchAction: 'none' }}
      />

      {/* Swipe to Look Around Floating Hint */}
      {showSwipeHint && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 pointer-events-none animate-fade-in">
          <div className="glass-panel px-3.5 py-1.5 rounded-full text-[11px] text-[#ebcad8] font-medium flex items-center gap-1.5 shadow-lg border border-white/20 whitespace-nowrap">
            <span>✨ Drag screen to look around • Left thumb to move</span>
          </div>
        </div>
      )}

      {/* 2. Interactive Object Inspection Alert Pill */}
      {hoveredObjectName && (
        <div className="absolute bottom-40 left-1/2 -translate-x-1/2 pointer-events-auto z-40 animate-bounce">
          <button
            onClick={onInteract}
            className="glass-panel px-4 py-2 rounded-full text-xs font-semibold text-[#fff5e9] bg-[#ebcad8]/40 hover:bg-[#ebcad8]/50 border-2 border-[#ebcad8] flex items-center gap-2 shadow-2xl transition-transform active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-[#ebcad8]" />
            <span>Inspect: <strong className="text-[#ebcad8]">{hoveredObjectName}</strong></span>
          </button>
        </div>
      )}

      {/* 3. Virtual Movement Joystick (Bottom-Left) */}
      <div className="absolute bottom-16 left-4 pointer-events-auto z-20 flex flex-col items-center">
        <div
          ref={joystickBaseRef}
          onPointerDown={handleJoystickDown}
          onPointerMove={handleJoystickMove}
          onPointerUp={handleJoystickUp}
          onPointerCancel={handleJoystickUp}
          className="w-28 h-28 rounded-full bg-black/45 border-2 border-white/20 backdrop-blur-md relative flex items-center justify-center touch-none shadow-2xl active:border-[#ebcad8]/80 transition-colors"
          style={{ touchAction: 'none' }}
        >
          {/* Compass Direction Labels */}
          <span className="absolute top-1.5 text-[8px] uppercase tracking-wider text-white/40 font-bold">
            ▲
          </span>
          <span className="absolute bottom-1.5 text-[8px] uppercase tracking-wider text-white/40 font-bold">
            ▼
          </span>
          <span className="absolute left-2 text-[8px] uppercase tracking-wider text-white/40 font-bold">
            ◀
          </span>
          <span className="absolute right-2 text-[8px] uppercase tracking-wider text-white/40 font-bold">
            ▶
          </span>

          {/* Inner boundary ring */}
          <div className="w-14 h-14 rounded-full border border-white/10 pointer-events-none" />

          {/* Movable Thumb Knob */}
          <div
            className={`w-12 h-12 rounded-full border border-white/70 shadow-xl absolute flex items-center justify-center pointer-events-none ${
              isJoystickDragging
                ? 'bg-[#ebcad8] text-[#2c243b] scale-105 ring-4 ring-[#ebcad8]/40'
                : 'bg-gradient-to-tr from-[#ebcad8]/90 to-[#beb5e9]/90 text-[#2c243b]'
            }`}
            style={{
              transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
              transition: isJoystickDragging ? 'none' : 'transform 0.12s ease-out',
            }}
          >
            <div className="w-3.5 h-3.5 rounded-full bg-white/70 shadow-inner" />
          </div>
        </div>

        <span className="mt-1 text-[9px] uppercase tracking-wider text-white/50 font-semibold">
          Move & Strafe
        </span>
      </div>

      {/* 4. Elevation (Up / Down Altitude) Controls (Bottom-Right) */}
      <div className="absolute bottom-16 right-4 pointer-events-auto z-20 flex flex-col items-center gap-2">
        {/* Quick Interact button on right if near object */}
        {hoveredObjectName && (
          <button
            onClick={onInteract}
            className="w-12 h-12 rounded-full bg-[#ebcad8] text-[#2c243b] shadow-2xl flex items-center justify-center font-bold active:scale-90 transition-transform border-2 border-white/80"
            title="Interact"
          >
            <Hand className="w-6 h-6" />
          </button>
        )}

        {/* Altitude Vertical Pill */}
        <div className="p-1 rounded-2xl bg-black/45 border-2 border-white/20 backdrop-blur-md flex flex-col gap-1.5 shadow-2xl">
          {/* Fly Upwards */}
          <button
            onPointerDown={(e) => {
              e.stopPropagation();
              setVertical(1);
            }}
            onPointerUp={(e) => {
              e.stopPropagation();
              setVertical(0);
            }}
            onPointerLeave={(e) => {
              e.stopPropagation();
              setVertical(0);
            }}
            onPointerCancel={(e) => {
              e.stopPropagation();
              setVertical(0);
            }}
            className="w-11 h-11 rounded-xl bg-white/10 hover:bg-white/20 active:bg-[#ebcad8] active:text-[#2c243b] text-white flex flex-col items-center justify-center transition-all shadow"
            title="Fly Upward"
          >
            <ChevronUp className="w-4 h-4" />
            <span className="text-[8px] font-bold uppercase tracking-tighter -mt-1">Up</span>
          </button>

          {/* Fly Downwards */}
          <button
            onPointerDown={(e) => {
              e.stopPropagation();
              setVertical(-1);
            }}
            onPointerUp={(e) => {
              e.stopPropagation();
              setVertical(0);
            }}
            onPointerLeave={(e) => {
              e.stopPropagation();
              setVertical(0);
            }}
            onPointerCancel={(e) => {
              e.stopPropagation();
              setVertical(0);
            }}
            className="w-11 h-11 rounded-xl bg-white/10 hover:bg-white/20 active:bg-[#ebcad8] active:text-[#2c243b] text-white flex flex-col items-center justify-center transition-all shadow"
            title="Fly Downward"
          >
            <span className="text-[8px] font-bold uppercase tracking-tighter -mb-1">Down</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        <span className="text-[9px] uppercase tracking-wider text-white/50 font-semibold">
          Altitude
        </span>
      </div>
    </div>
  );
};
