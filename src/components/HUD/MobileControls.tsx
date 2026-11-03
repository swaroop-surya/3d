import React, { useRef, useState, useCallback, useEffect } from 'react';
import { ChevronUp, ChevronDown, Hand } from 'lucide-react';
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
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const activePointerId = useRef<number | null>(null);

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

      // Apply deadzone of 0.08 for stability
      const normX = dx / maxRadius;
      const normY = -dy / maxRadius; // pushing up yields positive Y (forward)

      const deadzone = 0.08;
      controller.virtualJoystick.x = Math.abs(normX) > deadzone ? normX : 0;
      controller.virtualJoystick.y = Math.abs(normY) > deadzone ? normY : 0;
    },
    [controller]
  );

  const resetJoystick = useCallback(() => {
    setIsDragging(false);
    activePointerId.current = null;
    setKnobPos({ x: 0, y: 0 });
    if (controller) {
      controller.virtualJoystick.x = 0;
      controller.virtualJoystick.y = 0;
    }
  }, [controller]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    activePointerId.current = e.pointerId;
    setIsDragging(true);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    updateJoystick(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || activePointerId.current !== e.pointerId) return;
    updateJoystick(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerId.current === e.pointerId) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
      resetJoystick();
    }
  };

  // Ensure joystick resets if window loses focus or pointer is canceled
  useEffect(() => {
    window.addEventListener('pointerup', resetJoystick);
    window.addEventListener('pointercancel', resetJoystick);
    return () => {
      window.removeEventListener('pointerup', resetJoystick);
      window.removeEventListener('pointercancel', resetJoystick);
    };
  }, [resetJoystick]);

  const setVertical = (val: number) => {
    if (controller) {
      controller.virtualVertical = val;
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none select-none z-30 lg:hidden">
      {/* Left: 360° Horizontal Move Joystick */}
      <div className="absolute bottom-28 left-5 pointer-events-auto flex flex-col items-center">
        <div
          ref={joystickBaseRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="w-32 h-32 rounded-full bg-black/40 border-2 border-white/20 backdrop-blur-md relative flex items-center justify-center touch-none shadow-2xl active:border-[#ebcad8]/60 transition-colors"
          style={{ touchAction: 'none' }}
        >
          {/* Subtle Directional Compass Markings */}
          <span className="absolute top-1.5 text-[9px] uppercase tracking-wider text-white/30 font-semibold">
            ▲
          </span>
          <span className="absolute bottom-1.5 text-[9px] uppercase tracking-wider text-white/30 font-semibold">
            ▼
          </span>
          <span className="absolute left-2 text-[9px] uppercase tracking-wider text-white/30 font-semibold">
            ◀
          </span>
          <span className="absolute right-2 text-[9px] uppercase tracking-wider text-white/30 font-semibold">
            ▶
          </span>

          {/* Inner ring */}
          <div className="w-16 h-16 rounded-full border border-white/10 pointer-events-none" />

          {/* Moving Knob */}
          <div
            className={`w-14 h-14 rounded-full border border-white/60 shadow-xl absolute flex items-center justify-center transition-all ${
              isDragging
                ? 'bg-[#ebcad8] text-[#2c243b] scale-105 ring-4 ring-[#ebcad8]/30'
                : 'bg-gradient-to-tr from-[#ebcad8]/80 to-[#beb5e9]/80 text-[#2c243b]'
            }`}
            style={{
              transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
              transition: isDragging ? 'none' : 'transform 0.15s ease-out',
            }}
          >
            <div className="w-4 h-4 rounded-full bg-white/60 shadow-inner" />
          </div>
        </div>
        <span className="mt-1.5 text-[10px] text-white/50 tracking-wider font-medium">
          Move & Strafe
        </span>
      </div>

      {/* Right: Elevation (Up/Down Altitude) and Interact Button */}
      <div className="absolute bottom-28 right-5 pointer-events-auto flex flex-col gap-2.5 items-center">
        {/* Interact button when near an interactive object */}
        {hoveredObjectName && (
          <button
            onClick={onInteract}
            className="w-14 h-14 rounded-full bg-[#ebcad8] text-[#2c243b] shadow-2xl flex items-center justify-center font-bold active:scale-90 transition-transform border-2 border-white/80 animate-bounce"
            title="Interact"
          >
            <Hand className="w-7 h-7" />
          </button>
        )}

        {/* Fly Upwards Button */}
        <button
          onPointerDown={() => setVertical(1)}
          onPointerUp={() => setVertical(0)}
          onPointerLeave={() => setVertical(0)}
          onPointerCancel={() => setVertical(0)}
          className="w-12 h-12 rounded-full bg-black/40 border border-white/25 backdrop-blur-md text-white flex flex-col items-center justify-center shadow-lg active:bg-[#ebcad8] active:text-[#2c243b] active:scale-95 transition-all"
          title="Fly Upward"
        >
          <ChevronUp className="w-5 h-5" />
          <span className="text-[8px] font-bold uppercase tracking-tighter -mt-1">Up</span>
        </button>

        {/* Fly Downwards Button */}
        <button
          onPointerDown={() => setVertical(-1)}
          onPointerUp={() => setVertical(0)}
          onPointerLeave={() => setVertical(0)}
          onPointerCancel={() => setVertical(0)}
          className="w-12 h-12 rounded-full bg-black/40 border border-white/25 backdrop-blur-md text-white flex flex-col items-center justify-center shadow-lg active:bg-[#ebcad8] active:text-[#2c243b] active:scale-95 transition-all"
          title="Fly Downward"
        >
          <span className="text-[8px] font-bold uppercase tracking-tighter -mb-1">Down</span>
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
