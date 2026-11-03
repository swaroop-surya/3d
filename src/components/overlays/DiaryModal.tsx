import React, { useState } from 'react';
import { X, BookOpen, Calendar, Lock, Globe, Plus, Sparkles, Smile } from 'lucide-react';
import { DiaryEntry } from '../../types';
import { audioService } from '../../services/audioService';

interface DiaryModalProps {
  entries: DiaryEntry[];
  onClose: () => void;
  onAddEntry: (entry: Omit<DiaryEntry, 'id' | 'created_at'>) => void;
  onDeleteEntry: (id: string) => void;
  activeRole: 'partner_1' | 'partner_2';
  partner1Name: string;
  partner2Name: string;
}

export const DiaryModal: React.FC<DiaryModalProps> = ({
  entries,
  onClose,
  onAddEntry,
  onDeleteEntry,
  activeRole,
  partner1Name,
  partner2Name,
}) => {
  const [filter, setFilter] = useState<'all' | 'shared' | 'personal'>('all');
  const [isComposing, setIsComposing] = useState(false);

  // New Entry Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<DiaryEntry['mood']>('peaceful');
  const [isPrivate, setIsPrivate] = useState(false);
  const [mediaUrl, setMediaUrl] = useState('');

  // Enforce Privacy Policy: Personal entries written by the other partner are NOT accessible
  const accessibleEntries = entries.filter((e) => {
    if (!e.is_private) return true;
    return e.author === activeRole;
  });

  const filteredEntries = accessibleEntries.filter((e) => {
    if (filter === 'shared') return !e.is_private;
    if (filter === 'personal') return e.is_private;
    return true;
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    onAddEntry({
      title,
      content,
      entry_date: new Date().toISOString().split('T')[0],
      mood,
      author: activeRole,
      is_private: isPrivate,
      media_url: mediaUrl.trim() || undefined,
    });

    audioService.playPageTurn();
    setIsComposing(false);
    setTitle('');
    setContent('');
    setMediaUrl('');
    setIsPrivate(false);
  };

  const MOOD_EMOJIS: Record<DiaryEntry['mood'], { label: string; emoji: string; color: string }> = {
    joyful: { label: 'Joyful', emoji: '✨', color: 'bg-amber-400/20 text-amber-300' },
    peaceful: { label: 'Peaceful', emoji: '🍃', color: 'bg-emerald-400/20 text-emerald-300' },
    loving: { label: 'Loving', emoji: '💖', color: 'bg-rose-400/20 text-rose-300' },
    nostalgic: { label: 'Nostalgic', emoji: '🌙', color: 'bg-indigo-400/20 text-indigo-300' },
    warm: { label: 'Warm', emoji: '☕', color: 'bg-orange-400/20 text-orange-300' },
    dreamy: { label: 'Dreamy', emoji: '🌸', color: 'bg-purple-400/20 text-purple-300' },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in select-text">
      <div className="glass-panel w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-white/20">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#1f1a2e]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#ebcad8]/20 flex items-center justify-center text-[#ebcad8]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-serif text-white">Relationship Scrapbook & Diary</h2>
              <p className="text-xs text-white/50">
                Shared chronicles and private personal reflections.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isComposing && (
              <button
                onClick={() => setIsComposing(true)}
                className="px-4 py-2 rounded-xl bg-[#ebcad8] text-[#2c243b] text-xs font-semibold shadow-md flex items-center gap-1.5 hover:opacity-90 active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Write Entry</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        {!isComposing && (
          <div className="px-6 py-3 border-b border-white/10 bg-white/5 flex items-center gap-2 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                filter === 'all'
                  ? 'bg-white/20 text-white font-medium'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              All Entries ({accessibleEntries.length})
            </button>
            <button
              onClick={() => setFilter('shared')}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
                filter === 'shared'
                  ? 'bg-[#ebcad8]/30 text-[#ebcad8] font-medium'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Globe className="w-3 h-3" />
              <span>Shared With Us</span>
            </button>
            <button
              onClick={() => setFilter('personal')}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
                filter === 'personal'
                  ? 'bg-purple-400/30 text-purple-200 font-medium'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Lock className="w-3 h-3" />
              <span>My Private Reflections</span>
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-[#272138]/90">
          {isComposing ? (
            /* Entry Composer */
            <form onSubmit={handleSave} className="max-w-2xl mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-serif text-white">New Diary Entry</h3>
                <span className="text-xs text-[#ebcad8]">
                  Author: {activeRole === 'partner_1' ? partner1Name : partner2Name}
                </span>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">
                  Entry Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. The quiet morning with spiced chai..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-[#ebcad8]"
                />
              </div>

              {/* Mood Selector */}
              <div>
                <label className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">
                  Mood
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-1.5">
                  {(Object.keys(MOOD_EMOJIS) as DiaryEntry['mood'][]).map((mKey) => {
                    const m = MOOD_EMOJIS[mKey];
                    return (
                      <button
                        key={mKey}
                        type="button"
                        onClick={() => setMood(mKey)}
                        className={`p-2 rounded-xl text-xs flex flex-col items-center gap-1 border transition-all ${
                          mood === mKey
                            ? `${m.color} border-current shadow-md scale-105`
                            : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                        }`}
                      >
                        <span className="text-base">{m.emoji}</span>
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Privacy Mode Toggle */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                    {isPrivate ? (
                      <Lock className="w-3.5 h-3.5 text-purple-300" />
                    ) : (
                      <Globe className="w-3.5 h-3.5 text-[#ebcad8]" />
                    )}
                    <span>{isPrivate ? 'Private Personal Diary' : 'Shared With Partner'}</span>
                  </div>
                  <div className="text-[11px] text-white/50">
                    {isPrivate
                      ? 'Only you can see this entry; hidden from your partner.'
                      : 'Both of you can read and cherish this memory together.'}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsPrivate(!isPrivate)}
                  className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                    isPrivate ? 'bg-purple-600' : 'bg-[#ebcad8]'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white shadow-md transition-transform ${
                      isPrivate ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Photo URL */}
              <div>
                <label className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">
                  Photo Attachment (Optional Image URL)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs focus:outline-none focus:border-[#ebcad8]"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">
                  Journal Reflection
                </label>
                <textarea
                  required
                  rows={6}
                  placeholder="Pour your thoughts onto this page..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full mt-1 px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white text-sm font-serif leading-relaxed focus:outline-none focus:border-[#ebcad8]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsComposing(false)}
                  className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#ebcad8] text-[#2c243b] font-medium text-xs shadow-lg hover:opacity-90 active:scale-95 transition-all"
                >
                  Save Entry
                </button>
              </div>
            </form>
          ) : (
            /* Entries Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredEntries.map((item) => {
                const moodObj = MOOD_EMOJIS[item.mood];
                const authorName = item.author === 'partner_1' ? partner1Name : partner2Name;
                return (
                  <div
                    key={item.id}
                    className="p-5 rounded-3xl bg-white/5 border border-white/10 hover:border-white/25 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium flex items-center gap-1 ${moodObj.color}`}
                        >
                          <span>{moodObj.emoji}</span>
                          <span>{moodObj.label}</span>
                        </span>

                        <div className="flex items-center gap-2 text-[11px] text-white/50">
                          {item.is_private ? (
                            <span className="flex items-center gap-1 text-purple-300">
                              <Lock className="w-3 h-3" />
                              <span>Personal</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[#ebcad8]">
                              <Globe className="w-3 h-3" />
                              <span>Shared</span>
                            </span>
                          )}
                          <span>•</span>
                          <span>{item.entry_date}</span>
                        </div>
                      </div>

                      <h3 className="text-lg font-serif text-white font-semibold mb-2">
                        {item.title}
                      </h3>

                      <p className="text-xs text-white/80 font-serif leading-relaxed line-clamp-4 whitespace-pre-wrap mb-3">
                        {item.content}
                      </p>

                      {item.media_url && (
                        <div className="w-full h-32 rounded-2xl overflow-hidden mb-3">
                          <img
                            src={item.media_url}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/5 text-[11px] text-white/40">
                      <span>Written by {authorName}</span>
                      {item.author === activeRole && (
                        <button
                          onClick={() => onDeleteEntry(item.id)}
                          className="hover:text-rose-400 transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
