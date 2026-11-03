import React, { useState } from 'react';
import { X, Music, Play, Pause, ExternalLink, Plus, Disc, Heart } from 'lucide-react';
import { SoundtrackTrack } from '../../types';
import { audioService } from '../../services/audioService';

interface MusicPavilionModalProps {
  tracks: SoundtrackTrack[];
  onClose: () => void;
  onAddTrack: (track: Omit<SoundtrackTrack, 'id'>) => void;
  activeRole: 'partner_1' | 'partner_2';
}

export const MusicPavilionModal: React.FC<MusicPavilionModalProps> = ({
  tracks,
  onClose,
  onAddTrack,
  activeRole,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);

  // New Song Form State
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [memoryNote, setMemoryNote] = useState('');

  const currentTrack = tracks[currentTrackIndex] || tracks[0];

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    audioService.playChime(isPlaying ? 0.8 : 1.2);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !artist.trim()) return;

    onAddTrack({
      title,
      artist,
      external_url: externalUrl.trim() || undefined,
      memory_note: memoryNote.trim() || undefined,
      added_by: activeRole,
      duration: '3:30',
    });

    setShowAddForm(false);
    setTitle('');
    setArtist('');
    setExternalUrl('');
    setMemoryNote('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in select-text">
      <div className="glass-panel w-full max-w-2xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-white/20">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[#2c1c38] to-[#1c182d]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#ebcad8]/20 flex items-center justify-center text-[#ebcad8]">
              <Disc className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <h2 className="text-xl font-serif text-white">Music Pavilion Turntable</h2>
              <p className="text-xs text-white/50">Our private relationship soundtrack</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Center Vinyl Player Card */}
        <div className="p-6 border-b border-white/10 bg-black/30 flex flex-col items-center text-center">
          {/* Animated Turntable Vinyl */}
          <div className="relative w-40 h-40 rounded-full bg-[#111] border-4 border-[#222] shadow-2xl flex items-center justify-center mb-5 overflow-hidden">
            {/* Vinyl grooves */}
            <div className="absolute inset-2 rounded-full border border-white/5" />
            <div className="absolute inset-5 rounded-full border border-white/5" />
            <div className="absolute inset-8 rounded-full border border-white/5" />
            <div className="absolute inset-11 rounded-full border border-white/5" />

            {/* Center Label */}
            <div
              className={`w-16 h-16 rounded-full bg-gradient-to-tr from-[#ebcad8] to-[#beb5e9] flex items-center justify-center shadow-md text-[#2c243b] ${
                isPlaying ? 'animate-spin' : ''
              }`}
              style={{ animationDuration: '4s' }}
            >
              <Heart className="w-5 h-5 fill-[#2c243b]" />
            </div>
          </div>

          {currentTrack && (
            <div className="max-w-md">
              <h3 className="text-xl font-serif text-white font-bold">{currentTrack.title}</h3>
              <p className="text-xs text-[#ebcad8] mt-0.5">{currentTrack.artist}</p>
              {currentTrack.memory_note && (
                <p className="text-xs text-white/70 font-serif italic mt-2 border-t border-white/5 pt-2">
                  &ldquo;{currentTrack.memory_note}&rdquo;
                </p>
              )}
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center gap-4 mt-5">
            <button
              onClick={togglePlay}
              className="w-12 h-12 rounded-full bg-[#ebcad8] text-[#2c243b] flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>
          </div>
        </div>

        {/* Playlist & Add Song */}
        <div className="p-6 overflow-y-auto flex-1 bg-[#231e33]/90">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-white uppercase tracking-wider">
              Soundtrack Playlist ({tracks.length})
            </span>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs text-white flex items-center gap-1 transition-all"
            >
              <Plus className="w-3 h-3" />
              <span>Add Song</span>
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAdd} className="mb-5 p-4 rounded-2xl bg-white/5 border border-white/15 space-y-3">
              <div className="text-xs font-semibold text-[#ebcad8]">Add Song to Pavilion</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Song Title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs focus:outline-none focus:border-[#ebcad8]"
                />
                <input
                  type="text"
                  required
                  placeholder="Artist Name..."
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs focus:outline-none focus:border-[#ebcad8]"
                />
              </div>
              <input
                type="url"
                placeholder="Spotify / YouTube Link (optional)..."
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs focus:outline-none focus:border-[#ebcad8]"
              />
              <input
                type="text"
                placeholder="What memory does this song remind you of?..."
                value={memoryNote}
                onChange={(e) => setMemoryNote(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs focus:outline-none focus:border-[#ebcad8]"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 text-xs text-white/50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[#ebcad8] text-[#2c243b] text-xs font-semibold shadow-md"
                >
                  Save Song
                </button>
              </div>
            </form>
          )}

          <div className="space-y-2">
            {tracks.map((track, idx) => {
              const isSelected = idx === currentTrackIndex;
              return (
                <div
                  key={track.id}
                  onClick={() => {
                    setCurrentTrackIndex(idx);
                    setIsPlaying(true);
                  }}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#ebcad8]/20 border-[#ebcad8] shadow-md'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-xs text-[#ebcad8] font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="text-xs font-serif font-bold text-white">{track.title}</div>
                      <div className="text-[11px] text-white/50">{track.artist}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {track.external_url && (
                      <a
                        href={track.external_url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10"
                        title="Open external link"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <span className="text-[10px] text-white/40">{track.duration || '3:30'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
