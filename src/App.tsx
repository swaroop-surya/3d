import React, { useState, useRef, useEffect } from 'react';
import { WorldCanvas } from './three/WorldCanvas';
import { CameraController } from './three/CameraController';
import { EntryScreen } from './components/EntryScreen';
import { TopBar } from './components/HUD/TopBar';
import { BottomDock } from './components/HUD/BottomDock';
import { MobileControls } from './components/HUD/MobileControls';

// Overlays
import { PhotoModal } from './components/overlays/PhotoModal';
import { LetterReaderModal } from './components/overlays/LetterReaderModal';
import { DiaryModal } from './components/overlays/DiaryModal';
import { DaysTogetherModal } from './components/overlays/DaysTogetherModal';
import { MusicPavilionModal } from './components/overlays/MusicPavilionModal';
import { ObservatoryModal } from './components/overlays/ObservatoryModal';
import { LoveReasonsModal } from './components/overlays/LoveReasonsModal';
import { MemoryBottleModal } from './components/overlays/MemoryBottleModal';
import { DashboardModal } from './components/overlays/DashboardModal';
import { SettingsModal } from './components/overlays/SettingsModal';

import { storageService } from './services/storageService';
import { audioService } from './services/audioService';
import {
  InteractiveObjectData,
  IslandLocationId,
  Memory,
  RelationshipSettings,
  TimeOfDay,
  WeatherState,
} from './types';

export default function App() {
  const [hasEntered, setHasEntered] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Couple Data State
  const [settings, setSettings] = useState<RelationshipSettings>(() => storageService.getSettings());
  const [activeRole, setActiveRole] = useState<'partner_1' | 'partner_2'>(() =>
    storageService.getActiveRole()
  );
  const [memories, setMemories] = useState<Memory[]>(() => storageService.getMemories());
  const [albums, setAlbums] = useState(() => storageService.getAlbums());
  const [placements, setPlacements] = useState(() => storageService.getPlacements());
  const [diary, setDiary] = useState(() => storageService.getDiary());
  const [letters, setLetters] = useState(() => storageService.getLetters());
  const [reasons, setReasons] = useState(() => storageService.getReasons());
  const [bucketList, setBucketList] = useState(() => storageService.getBucketList());
  const [specialDates, setSpecialDates] = useState(() => storageService.getSpecialDates());
  const [soundtrack, setSoundtrack] = useState(() => storageService.getSoundtrack());
  const [timeCapsules, setTimeCapsules] = useState(() => storageService.getTimeCapsules());

  // Environment & Atmosphere
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(settings.background_theme);
  const [weather, setWeather] = useState<WeatherState>(settings.weather);
  const [currentLocationId, setCurrentLocationId] = useState<IslandLocationId>('memory_house');
  const [compassAngle, setCompassAngle] = useState(0);

  // 3D Interactions & Camera
  const controllerRef = useRef<CameraController | null>(null);
  const [hoveredObject, setHoveredObject] = useState<InteractiveObjectData | null>(null);
  const [isInspecting, setIsInspecting] = useState(false);

  // Active Overlay Modals
  const [activeModal, setActiveModal] = useState<
    | 'photo'
    | 'letter'
    | 'diary'
    | 'days_together'
    | 'music'
    | 'observatory'
    | 'reasons'
    | 'bottle'
    | 'dashboard'
    | 'settings'
    | null
  >(null);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [selectedLetterId, setSelectedLetterId] = useState<string | undefined>();

  // Compass angle polling
  useEffect(() => {
    const timer = setInterval(() => {
      if (controllerRef.current) {
        setCompassAngle(controllerRef.current.getCompassAngle());
        setIsInspecting(controllerRef.current.getIsInspecting());
      }
    }, 100);
    return () => clearInterval(timer);
  }, []);

  // Atmospheric sounds when theme changes
  useEffect(() => {
    if (hasEntered) {
      audioService.updateTheme(timeOfDay);
    }
  }, [timeOfDay, hasEntered]);

  const handleEnterWorld = () => {
    setHasEntered(true);
    if (!isMuted) {
      audioService.startAtmosphere(timeOfDay);
    }
  };

  const handleToggleMute = () => {
    const muted = audioService.toggleMute();
    setIsMuted(muted);
  };

  const handleFlyToLocation = (loc: IslandLocationId) => {
    setCurrentLocationId(loc);
    if (controllerRef.current) {
      controllerRef.current.flyToLocation(loc);
    }
  };

  const handleExitInspection = () => {
    if (controllerRef.current) {
      controllerRef.current.exitInspection();
      setIsInspecting(false);
    }
  };

  // Object Click Routing to appropriate contextual modal
  const handleSelectObject = (objData: InteractiveObjectData) => {
    // Smoothly focus camera towards object
    if (controllerRef.current) {
      controllerRef.current.inspectObject(objData.position);
      setIsInspecting(true);
    }

    switch (objData.type) {
      case 'photo_frame': {
        const frameId = objData.dataPayload?.frameId || objData.id;
        const assignedPlacement = placements.find((p) => p.id === frameId);
        const mem =
          memories.find((m) => m.id === assignedPlacement?.memory_id) ||
          memories.find((m) => m.assigned_frame_id === frameId) ||
          memories[0];

        setSelectedMemory(mem || null);
        setActiveModal('photo');
        break;
      }

      case 'mailbox':
      case 'letter_desk':
        setActiveModal('letter');
        break;

      case 'bookshelf':
        setActiveModal('diary');
        break;

      case 'fireplace':
        setActiveModal('days_together');
        break;

      case 'record_player':
        setActiveModal('music');
        break;

      case 'telescope':
      case 'constellation_star':
        setActiveModal('observatory');
        break;

      case 'treasure_chest':
        setActiveModal('reasons');
        break;

      case 'memory_bottle':
      case 'wish_fountain':
        setActiveModal('bottle');
        break;

      case 'memory_album':
        setActiveModal('dashboard');
        break;

      case 'memory_bench':
      case 'viewpoint_bench': {
        // Open featured cliff / sunset memory
        const cliffMem = memories.find((m) => m.assigned_frame_id === 'frame_cliff') || memories[0];
        setSelectedMemory(cliffMem);
        setActiveModal('photo');
        break;
      }

      case 'lantern': {
        setActiveModal('reasons');
        break;
      }

      default:
        break;
    }
  };

  // State update handlers
  const handleUpdateSettings = (updates: Partial<RelationshipSettings>) => {
    const updated = storageService.updateSettings(updates);
    setSettings(updated);
  };

  const handleSwitchRole = (role: 'partner_1' | 'partner_2') => {
    storageService.setActiveRole(role);
    setActiveRole(role);
  };

  const handleUpdateMemory = (id: string, updates: Partial<Memory>) => {
    const updated = storageService.updateMemory(id, updates);
    if (updated) {
      setMemories(storageService.getMemories());
      if (selectedMemory && selectedMemory.id === id) {
        setSelectedMemory(updated);
      }
    }
  };

  const handleDeleteMemory = (id: string) => {
    storageService.deleteMemory(id);
    const updatedList = storageService.getMemories();
    setMemories(updatedList);
    if (selectedMemory?.id === id) {
      setSelectedMemory(updatedList[0] || null);
    }
  };

  const handleAssignToFrame = (frameId: string, memoryId?: string) => {
    storageService.assignMemoryToFrame(frameId, memoryId);
    setPlacements(storageService.getPlacements());

    // Update memory record link as well
    if (memoryId) {
      storageService.updateMemory(memoryId, { assigned_frame_id: frameId });
    }
    setMemories(storageService.getMemories());
  };

  const handleAddMemory = (newMem: Omit<Memory, 'id' | 'created_at'>) => {
    storageService.addMemory(newMem);
    setMemories(storageService.getMemories());
  };

  const handleAddDiary = (newEntry: Omit<any, 'id' | 'created_at'>) => {
    storageService.addDiary(newEntry);
    setDiary(storageService.getDiary());
  };

  const handleDeleteDiary = (id: string) => {
    storageService.deleteDiary(id);
    setDiary(storageService.getDiary());
  };

  const handleSendLetter = (letter: Omit<any, 'id' | 'created_at' | 'is_read'>) => {
    storageService.addLetter(letter);
    setLetters(storageService.getLetters());
  };

  const handleMarkLetterRead = (id: string) => {
    storageService.markLetterAsRead(id);
    setLetters(storageService.getLetters());
  };

  const handleAddReason = (reasonText: string, author: 'partner_1' | 'partner_2') => {
    storageService.addReason(reasonText, author);
    setReasons(storageService.getReasons());
  };

  const handleToggleBucket = (id: string) => {
    storageService.toggleBucketItem(id);
    setBucketList(storageService.getBucketList());
  };

  const handleAddBucket = (item: Omit<any, 'id' | 'is_completed'>) => {
    storageService.addBucketItem(item);
    setBucketList(storageService.getBucketList());
  };

  const handleAddSpecialDate = (dateItem: Omit<any, 'id'>) => {
    storageService.addSpecialDate(dateItem);
    setSpecialDates(storageService.getSpecialDates());
  };

  const handleAddTrack = (track: Omit<any, 'id'>) => {
    storageService.addSoundtrack(track);
    setSoundtrack(storageService.getSoundtrack());
  };

  const handleAddTimeCapsule = (capsule: Omit<any, 'id' | 'is_unlocked'>) => {
    storageService.addTimeCapsule(capsule);
    setTimeCapsules(storageService.getTimeCapsules());
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#181622] font-sans">
      {/* 1. Main 3D Interactive World Canvas */}
      <WorldCanvas
        timeOfDay={timeOfDay}
        weather={weather}
        onHoverObject={(obj) => setHoveredObject(obj)}
        onSelectObject={(obj) => handleSelectObject(obj)}
        activeLocation={currentLocationId}
        onLocationChange={(loc) => setCurrentLocationId(loc)}
        controllerRef={controllerRef}
        memories={memories}
      />

      {/* 2. Opening Cinematic Entry Screen */}
      {!hasEntered && (
        <EntryScreen
          settings={settings}
          onEnter={handleEnterWorld}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* 3. Top HUD Bar */}
      {hasEntered && (
        <TopBar
          settings={settings}
          currentLocationId={currentLocationId}
          activeRole={activeRole}
          onSwitchRole={handleSwitchRole}
          timeOfDay={timeOfDay}
          onTimeOfDayChange={(t) => {
            setTimeOfDay(t);
            handleUpdateSettings({ background_theme: t });
          }}
          weather={weather}
          onWeatherChange={(w) => {
            setWeather(w);
            handleUpdateSettings({ weather: w });
          }}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onOpenDashboard={() => setActiveModal('dashboard')}
          onOpenSettings={() => setActiveModal('settings')}
        />
      )}

      {/* 4. Unified Bottom Control Dock */}
      {hasEntered && (
        <BottomDock
          currentLocationId={currentLocationId}
          onFlyToLocation={handleFlyToLocation}
          isInspecting={isInspecting}
          onExitInspection={handleExitInspection}
          hoveredObjectName={hoveredObject?.title}
          compassAngle={compassAngle}
        />
      )}

      {/* 5. Mobile Touch Controls */}
      {hasEntered && (
        <MobileControls
          controller={controllerRef.current}
          onInteract={() => hoveredObject && handleSelectObject(hoveredObject)}
          hoveredObjectName={hoveredObject?.title}
        />
      )}

      {/* 6. Modals & Overlays */}
      {activeModal === 'photo' && (
        <PhotoModal
          memory={selectedMemory}
          allMemories={memories}
          placements={placements}
          onClose={() => setActiveModal(null)}
          onUpdateMemory={handleUpdateMemory}
          onDeleteMemory={handleDeleteMemory}
          onAssignToFrame={handleAssignToFrame}
          onSelectMemory={(m) => setSelectedMemory(m)}
          onUploadNew={() => setActiveModal('dashboard')}
          activeRole={activeRole}
        />
      )}

      {activeModal === 'letter' && (
        <LetterReaderModal
          letters={letters}
          activeLetterId={selectedLetterId}
          onClose={() => setActiveModal(null)}
          onSendLetter={handleSendLetter}
          onMarkAsRead={handleMarkLetterRead}
          activeRole={activeRole}
          partner1Name={settings.partner1_name}
          partner2Name={settings.partner2_name}
        />
      )}

      {activeModal === 'diary' && (
        <DiaryModal
          entries={diary}
          onClose={() => setActiveModal(null)}
          onAddEntry={handleAddDiary}
          onDeleteEntry={handleDeleteDiary}
          activeRole={activeRole}
          partner1Name={settings.partner1_name}
          partner2Name={settings.partner2_name}
        />
      )}

      {activeModal === 'days_together' && (
        <DaysTogetherModal
          settings={settings}
          specialDates={specialDates}
          onClose={() => setActiveModal(null)}
          onAddSpecialDate={handleAddSpecialDate}
        />
      )}

      {activeModal === 'music' && (
        <MusicPavilionModal
          tracks={soundtrack}
          onClose={() => setActiveModal(null)}
          onAddTrack={handleAddTrack}
          activeRole={activeRole}
        />
      )}

      {activeModal === 'observatory' && (
        <ObservatoryModal
          specialDates={specialDates}
          timeCapsules={timeCapsules}
          bucketList={bucketList}
          onClose={() => setActiveModal(null)}
          onAddTimeCapsule={handleAddTimeCapsule}
          activeRole={activeRole}
          partner1Name={settings.partner1_name}
          partner2Name={settings.partner2_name}
        />
      )}

      {activeModal === 'reasons' && (
        <LoveReasonsModal
          reasons={reasons}
          onClose={() => setActiveModal(null)}
          onAddReason={handleAddReason}
          activeRole={activeRole}
          partner1Name={settings.partner1_name}
          partner2Name={settings.partner2_name}
        />
      )}

      {activeModal === 'bottle' && (
        <MemoryBottleModal
          onClose={() => setActiveModal(null)}
          partner1Name={settings.partner1_name}
          partner2Name={settings.partner2_name}
        />
      )}

      {activeModal === 'dashboard' && (
        <DashboardModal
          settings={settings}
          memories={memories}
          albums={albums}
          diary={diary}
          letters={letters}
          bucketList={bucketList}
          specialDates={specialDates}
          soundtrack={soundtrack}
          placements={placements}
          onClose={() => setActiveModal(null)}
          onUpdateSettings={handleUpdateSettings}
          onAddMemory={handleAddMemory}
          onDeleteMemory={handleDeleteMemory}
          onToggleBucketItem={handleToggleBucket}
          onAddBucketItem={handleAddBucket}
          onAssignToFrame={handleAssignToFrame}
          activeRole={activeRole}
        />
      )}

      {activeModal === 'settings' && (
        <SettingsModal
          settings={settings}
          onClose={() => setActiveModal(null)}
          onUpdateSettings={handleUpdateSettings}
          activeRole={activeRole}
          onSwitchRole={handleSwitchRole}
        />
      )}
    </div>
  );
}
