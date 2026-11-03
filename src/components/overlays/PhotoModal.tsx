import React, { useState } from 'react';
import {
  X,
  Heart,
  Calendar,
  MapPin,
  Sparkles,
  Check,
  Edit2,
  Trash2,
  Plus,
} from 'lucide-react';
import { Memory, MemoryPlacement } from '../../types';

interface PhotoModalProps {
  memory: Memory | null;
  allMemories: Memory[];
  placements: MemoryPlacement[];
  onClose: () => void;
  onUpdateMemory: (id: string, updates: Partial<Memory>) => void;
  onDeleteMemory: (id: string) => void;
  onAssignToFrame: (frameId: string, memoryId?: string) => void;
  onSelectMemory: (mem: Memory) => void;
  onUploadNew: () => void;
  activeRole: 'partner_1' | 'partner_2';
}

export const PhotoModal: React.FC<PhotoModalProps> = ({
  memory,
  allMemories,
  placements,
  onClose,
  onUpdateMemory,
  onDeleteMemory,
  onAssignToFrame,
  onSelectMemory,
  onUploadNew,
  activeRole,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(memory?.title || '');
  const [description, setDescription] = useState(memory?.description || '');
  const [locationName, setLocationName] = useState(memory?.location_name || '');

  if (!memory) return null;

  const handleSave = () => {
    onUpdateMemory(memory.id, {
      title,
      description,
      location_name: locationName,
    });
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-fade-in select-text">
      <div className="glass-panel w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl border border-white/15">
        {/* Left: High-Res Photo View */}
        <div className="relative md:w-3/5 bg-black/50 flex items-center justify-center overflow-hidden min-h-[300px] md:min-h-[500px]">
          <img
            src={memory.media_url}
            alt={memory.title}
            className="w-full h-full object-cover max-h-[550px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

          {/* Quick Favorite Badge */}
          <button
            onClick={() => onUpdateMemory(memory.id, { is_favorite: !memory.is_favorite })}
            className={`absolute top-4 left-4 p-2.5 rounded-full backdrop-blur-md border transition-all ${
              memory.is_favorite
                ? 'bg-rose-500/80 border-rose-300 text-white shadow-lg'
                : 'bg-black/40 border-white/20 text-white/70 hover:text-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${memory.is_favorite ? 'fill-white' : ''}`} />
          </button>

          {/* Location badge */}
          <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-xs text-white flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#ebcad8]" />
            <span>{memory.location_name}</span>
          </div>
        </div>

        {/* Right: Memory Story & Frame Assignment */}
        <div className="md:w-2/5 p-6 flex flex-col justify-between overflow-y-auto bg-[#231e33]/90">
          <div>
            {/* Top Close & Edit Actions */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-white/10 text-[11px] text-[#ebcad8] font-medium">
                  {memory.uploaded_by === 'partner_1' ? 'Elena’s Memory' : 'Julian’s Memory'}
                </span>
                <span className="text-xs text-white/50 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{memory.memory_date}</span>
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                  title="Edit Memory"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Title & Description */}
            {isEditing ? (
              <div className="space-y-3 mb-6">
                <div>
                  <label className="text-[10px] uppercase text-white/40 font-semibold tracking-wider">
                    Memory Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-[#ebcad8]"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-white/40 font-semibold tracking-wider">
                    Location Name
                  </label>
                  <input
                    type="text"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-[#ebcad8]"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-white/40 font-semibold tracking-wider">
                    Story / Details
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-[#ebcad8]"
                  />
                </div>
                <button
                  onClick={handleSave}
                  className="w-full py-2 rounded-xl bg-[#ebcad8] text-[#2c243b] font-medium text-xs shadow-md"
                >
                  Save Changes
                </button>
              </div>
            ) : (
              <div className="mb-6">
                <h2 className="text-2xl font-serif text-white mb-2 leading-tight">
                  {memory.title}
                </h2>
                <p className="text-sm text-white/80 font-serif leading-relaxed italic border-l-2 border-[#ebcad8]/40 pl-3 py-1">
                  &ldquo;{memory.description}&rdquo;
                </p>
              </div>
            )}

            {/* 3D Frame Assignment Selector */}
            <div className="border-t border-white/10 pt-4 mb-4">
              <label className="text-xs font-semibold text-[#ebcad8] uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>3D Physical Frame Placement</span>
              </label>
              <p className="text-[11px] text-white/50 mb-3">
                Assign this photograph to appear in one of the physical 3D picture frames on the island:
              </p>

              <div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto pr-1">
                {placements.map((p) => {
                  const isAssigned = p.memory_id === memory.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => onAssignToFrame(p.id, isAssigned ? undefined : memory.id)}
                      className={`px-3 py-2 rounded-xl text-xs flex items-center justify-between border transition-all ${
                        isAssigned
                          ? 'bg-[#ebcad8]/30 border-[#ebcad8] text-white font-medium'
                          : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-left">
                        <div className="font-medium">{p.label}</div>
                        <div className="text-[10px] text-white/40 capitalize">
                          {p.location_id.replace('_', ' ')}
                        </div>
                      </div>
                      {isAssigned && <Check className="w-4 h-4 text-[#ebcad8]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Thumbnails Strip */}
          <div className="border-t border-white/10 pt-4">
            <div className="flex items-center justify-between text-xs text-white/50 mb-2">
              <span>All Memories ({allMemories.length})</span>
              <button
                onClick={onUploadNew}
                className="text-[#ebcad8] hover:underline flex items-center gap-1 font-medium"
              >
                <Plus className="w-3 h-3" />
                <span>Add Photo</span>
              </button>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {allMemories.map((m) => (
                <button
                  key={m.id}
                  onClick={() => onSelectMemory(m)}
                  className={`relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                    m.id === memory.id
                      ? 'border-[#ebcad8] scale-105'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={m.media_url} alt={m.title} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
