import React, { useState } from 'react';
import {
  Compass,
  Heart,
  Volume2,
  VolumeX,
  Sun,
  Sunset,
  Moon,
  CloudSun,
  Sparkles,
  CloudRain,
  Wind,
  Layers,
  User,
  Sliders,
} from 'lucide-react';
import { IslandLocationId, RelationshipSettings, TimeOfDay, WeatherState } from '../../types';
import { ISLAND_LOCATIONS } from '../../three/CameraController';

interface TopBarProps {
  settings: RelationshipSettings;
  currentLocationId: IslandLocationId;
  activeRole: 'partner_1' | 'partner_2';
  onSwitchRole: (role: 'partner_1' | 'partner_2') => void;
  timeOfDay: TimeOfDay;
  onTimeOfDayChange: (t: TimeOfDay) => void;
  weather: WeatherState;
  onWeatherChange: (w: WeatherState) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenDashboard: () => void;
  onOpenSettings: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  settings,
  currentLocationId,
  activeRole,
  onSwitchRole,
  timeOfDay,
  onTimeOfDayChange,
  weather,
  onWeatherChange,
  isMuted,
  onToggleMute,
  onOpenDashboard,
  onOpenSettings,
}) => {
  const [showAtmosphereMenu, setShowAtmosphereMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const currentLocation =
    ISLAND_LOCATIONS.find((l) => l.id === currentLocationId) || ISLAND_LOCATIONS[0];
  const activePartnerName =
    activeRole === 'partner_1' ? settings.partner1_name : settings.partner2_name;

  return (
    <header className="fixed top-0 left-0 right-0 z-40 p-2.5 sm:p-5 flex items-center justify-between pointer-events-none select-none">
      {/* Left: Brand & Current Location */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <div className="glass-panel px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl flex items-center gap-2">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl bg-gradient-to-tr from-[#ebcad8] to-[#beb5e9] flex items-center justify-center text-[#2c243b] shrink-0">
            <Heart className="w-3.5 h-3.5 fill-[#2c243b]" />
          </div>
          <div className="truncate max-w-[120px] xs:max-w-[160px] sm:max-w-none">
            <div className="text-[11px] sm:text-xs font-semibold tracking-wide text-white truncate">
              {settings.couple_name}’s Island
            </div>
            <div className="text-[10px] sm:text-[11px] text-[#ebcad8] font-medium flex items-center gap-1 truncate">
              <Compass className="w-2.5 h-2.5 text-[#ebcad8] shrink-0" />
              <span className="truncate">{currentLocation.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Controls & Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto shrink-0">
        {/* Atmosphere Menu Button */}
        <div className="relative">
          <button
            onClick={() => {
              setShowAtmosphereMenu(!showAtmosphereMenu);
              setShowProfileMenu(false);
            }}
            className="glass-panel p-2 sm:px-3 sm:py-2 rounded-2xl flex items-center gap-1.5 text-xs text-white/80 hover:text-white transition-colors"
            title="Lighting & Weather"
          >
            {timeOfDay === 'sunset' && <Sunset className="w-4 h-4 text-[#ffb088]" />}
            {timeOfDay === 'morning' && <Sun className="w-4 h-4 text-[#ffe299]" />}
            {timeOfDay === 'afternoon' && <CloudSun className="w-4 h-4 text-[#bae3ff]" />}
            {timeOfDay === 'night' && <Moon className="w-4 h-4 text-[#c7beea]" />}
            <span className="hidden md:inline capitalize">{timeOfDay}</span>
          </button>

          {showAtmosphereMenu && (
            <div className="absolute right-0 mt-2 w-52 glass-panel p-3 rounded-2xl shadow-2xl flex flex-col gap-3 z-50">
              <div>
                <div className="text-[10px] tracking-wider uppercase text-white/40 mb-1.5 font-semibold">
                  Time of Day
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['morning', 'afternoon', 'sunset', 'night'] as TimeOfDay[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        onTimeOfDayChange(t);
                        setShowAtmosphereMenu(false);
                      }}
                      className={`px-2.5 py-1.5 rounded-xl text-xs capitalize text-left flex items-center gap-1.5 transition-colors ${
                        timeOfDay === t
                          ? 'bg-[#ebcad8]/30 text-white font-medium border border-[#ebcad8]/40'
                          : 'text-white/60 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {t === 'morning' && <Sun className="w-3.5 h-3.5 text-[#ffe299]" />}
                      {t === 'afternoon' && <CloudSun className="w-3.5 h-3.5 text-[#bae3ff]" />}
                      {t === 'sunset' && <Sunset className="w-3.5 h-3.5 text-[#ffb088]" />}
                      {t === 'night' && <Moon className="w-3.5 h-3.5 text-[#c7beea]" />}
                      <span>{t}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-white/10 pt-2">
                <div className="text-[10px] tracking-wider uppercase text-white/40 mb-1.5 font-semibold">
                  Weather Atmosphere
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {(
                    [
                      { id: 'petal_breeze', label: 'Petals', icon: Wind },
                      { id: 'clear', label: 'Clear', icon: Sun },
                      { id: 'gentle_rain', label: 'Rain', icon: CloudRain },
                      { id: 'dreamy_stars', label: 'Stars', icon: Sparkles },
                    ] as const
                  ).map((w) => {
                    const Icon = w.icon;
                    return (
                      <button
                        key={w.id}
                        onClick={() => {
                          onWeatherChange(w.id);
                          setShowAtmosphereMenu(false);
                        }}
                        className={`px-2.5 py-1.5 rounded-xl text-xs text-left flex items-center gap-1.5 transition-colors ${
                          weather === w.id
                            ? 'bg-[#beb5e9]/30 text-white font-medium border border-[#beb5e9]/40'
                            : 'text-white/60 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 text-[#beb5e9]" />
                        <span>{w.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Audio Ambient Mute Button */}
        <button
          onClick={onToggleMute}
          className="glass-panel p-2 sm:p-2.5 rounded-2xl text-white/80 hover:text-white transition-colors"
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-white/40" />
          ) : (
            <Volume2 className="w-4 h-4 text-[#ebcad8]" />
          )}
        </button>

        {/* Active Partner Profile Button */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowAtmosphereMenu(false);
            }}
            className="glass-panel p-1.5 sm:px-3 sm:py-2 rounded-2xl flex items-center gap-1.5 text-xs text-white hover:border-[#ebcad8]/40 transition-colors"
            title={`Active: ${activePartnerName}`}
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#ebcad8] to-[#beb5e9] flex items-center justify-center text-[10px] font-bold text-[#2c243b]">
              {activePartnerName.charAt(0)}
            </div>
            <span className="hidden sm:inline font-medium">{activePartnerName}</span>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 glass-panel p-2 rounded-2xl shadow-2xl flex flex-col gap-1 z-50">
              <div className="px-2.5 py-1.5 text-[10px] tracking-wider uppercase text-white/40 font-semibold">
                Exploring As
              </div>
              <button
                onClick={() => {
                  onSwitchRole('partner_1');
                  setShowProfileMenu(false);
                }}
                className={`px-2.5 py-2 rounded-xl text-xs text-left flex items-center justify-between ${
                  activeRole === 'partner_1'
                    ? 'bg-[#ebcad8]/20 text-[#ebcad8] font-medium'
                    : 'text-white/70 hover:bg-white/5'
                }`}
              >
                <span>{settings.partner1_name}</span>
                {activeRole === 'partner_1' && <span className="text-[10px]">● Active</span>}
              </button>
              <button
                onClick={() => {
                  onSwitchRole('partner_2');
                  setShowProfileMenu(false);
                }}
                className={`px-2.5 py-2 rounded-xl text-xs text-left flex items-center justify-between ${
                  activeRole === 'partner_2'
                    ? 'bg-[#beb5e9]/20 text-[#beb5e9] font-medium'
                    : 'text-white/70 hover:bg-white/5'
                }`}
              >
                <span>{settings.partner2_name}</span>
                {activeRole === 'partner_2' && <span className="text-[10px]">● Active</span>}
              </button>

              <div className="border-t border-white/10 mt-1 pt-1">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onOpenSettings();
                  }}
                  className="w-full px-2.5 py-2 rounded-xl text-xs text-white/70 hover:text-white hover:bg-white/5 text-left flex items-center gap-2"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Relationship Settings</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Full Dashboard Button */}
        <button
          onClick={onOpenDashboard}
          className="glass-panel p-2 sm:px-3.5 sm:py-2 rounded-2xl flex items-center gap-1.5 text-xs font-medium text-[#fff5e9] bg-[#ebcad8]/20 hover:bg-[#ebcad8]/30 border border-[#ebcad8]/40 transition-all shadow-md active:scale-95"
          title="Open Dashboard"
        >
          <Layers className="w-3.5 h-3.5 text-[#ebcad8]" />
          <span className="hidden sm:inline">Dashboard</span>
        </button>
      </div>
    </header>
  );
};
