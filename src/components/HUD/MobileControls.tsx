import React, { useRef, useState } from 'react';
import { ArrowUp, ArrowDown, Hand } from 'lucide-react';
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
  const joystickRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsActive(true);
    handleTouchMove(e);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!joystickRef.current || !controller) return;
    const rect = joystickRef.current.getBoundingClientRect();
    const touch = e.touches[0];

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let dx = touch.clientX - centerX;
    let dy = touch.clientY - centerY;
    const maxDist = rect.width / 2;

    const dist = Math.hypot(dx, dy);
    if (dist > maxDist) {
      dx = (dx / dist) * maxDist;
      dy = (dy / dist) * maxDist;
    }

    setKnobPos({ x: dx, y: dy });
    controller.virtualJoystick.x = dx / maxDist;
    controller.virtualJoystick.y = -dy / maxDist;
  };

  const handleTouchEnd = () => {
    setIsActive(false);
    setKnobPos({ x: 0, y: 0 });
    if (controller) {
      controller.virtualJoystick.x = 0;
      controller.virtualJoystick.y = 0;
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none select-none z-30 lg:hidden">
      {/* Left: Virtual Joystick */}
      <div className="absolute bottom-28 left-6 pointer-events-auto">
        <div
          ref={joystickRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="w-28 h-28 rounded-full bg-black/30 border border-white/20 backdrop-blur-md relative flex items-center justify-center touch-none"
        >
          <div
            className="w-12 h-12 rounded-full bg-[#ebcad8]/70 border border-white/50 shadow-lg absolute transition-transform"
            style={{
              transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
            }}
          />
        </div>
      </div>

      {/* Right: Vertical Controls & Interact */}
      <div className="absolute bottom-28 right-6 pointer-events-auto flex flex-col gap-2.5 items-center">
        {hoveredObjectName && (
          <button
            onClick={onInteract}
            className="w-13 h-13 rounded-full bg-[#ebcad8] text-[#2c243b] shadow-xl flex items-center justify-center font-bold active:scale-95"
            title="Interact"
          >
            <Hand className="w-6 h-6" />
          </button>
        )}

        <button
          onTouchStart={() => controller && (controller.virtualVertical = 1)}
          onTouchEnd={() => controller && (controller.virtualVertical = 0)}
          className="w-11 h-11 rounded-full bg-black/30 border border-white/20 backdrop-blur-md text-white flex items-center justify-center active:bg-white/20"
        >
          <ArrowUp className="w-5 h-5" />
        </button>

        <button
          onTouchStart={() => controller && (controller.virtualVertical = -1)}
          onTouchEnd={() => controller && (controller.virtualVertical = 0)}
          className="w-11 h-11 rounded-full bg-black/30 border border-white/20 backdrop-blur-md text-white flex items-center justify-center active:bg-white/20"
        >
          <ArrowDown className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
