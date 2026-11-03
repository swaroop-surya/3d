import React, { useState } from 'react';
import { X, Sparkles, Star, Lock, Unlock, Clock, Send, Plus, Check } from 'lucide-react';
import { SpecialDate, TimeCapsule, BucketListItem } from '../../types';

interface ObservatoryModalProps {
  specialDates: SpecialDate[];
  timeCapsules: TimeCapsule[];
  bucketList: BucketListItem[];
  onClose: () => void;
  onAddTimeCapsule: (capsule: Omit<TimeCapsule, 'id' | 'is_unlocked'>) => void;
  activeRole: 'partner_1' | 'partner_2';
  partner1Name: string;
  partner2Name: string;
}

export const ObservatoryModal: React.FC<ObservatoryModalProps> = ({
  specialDates,
  timeCapsules,
  bucketList,
  onClose,
  onAddTimeCapsule,
  activeRole,
  partner1Name,
  partner2Name,
}) => {
  const [activeTab, setActiveTab] = useState<'constellation' | 'capsules' | 'dreams'>('constellation');
  const [showCapsuleForm, setShowCapsuleForm] = useState(false);

  // New Time Capsule State
  const [capsuleTitle, setCapsuleTitle] = useState('');
  const [capsuleMessage, setCapsuleMessage] = useState('');
  const [unlockDate, setUnlockDate] = useState('2028-06-15');

  const handleCreateCapsule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!capsuleTitle.trim() || !capsuleMessage.trim()) return;

    onAddTimeCapsule({
      title: capsuleTitle,
      message: capsuleMessage,
      created_by: activeRole,
      unlock_date: `${unlockDate}T00:00:00Z`,
    });

    setShowCapsuleForm(false);
    setCapsuleTitle('');
    setCapsuleMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in select-text">
      <div className="glass-panel w-full max-w-3xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-white/20">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[#17132e] to-[#251e44]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#beb5e9]/20 flex items-center justify-center text-[#beb5e9]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-serif text-white">The Hilltop Observatory</h2>
              <p className="text-xs text-[#beb5e9]/70">Constellations, future dreams & time capsules</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="px-6 py-3 border-b border-white/10 bg-white/5 flex items-center gap-2 text-xs">
          <button
            onClick={() => setActiveTab('constellation')}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
              activeTab === 'constellation'
                ? 'bg-[#beb5e9]/30 text-white font-medium border border-[#beb5e9]/40'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Star className="w-3.5 h-3.5 text-[#beb5e9]" />
            <span>Milestone Constellations</span>
          </button>

          <button
            onClick={() => setActiveTab('capsules')}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
              activeTab === 'capsules'
                ? 'bg-[#ebcad8]/30 text-white font-medium border border-[#ebcad8]/40'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-[#ebcad8]" />
            <span>Time Capsules ({timeCapsules.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('dreams')}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
              activeTab === 'dreams'
                ? 'bg-[#b8d4b4]/30 text-white font-medium border border-[#b8d4b4]/40'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#b8d4b4]" />
            <span>Shared Dreams ({bucketList.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-[#1e1933]/90">
          {activeTab === 'constellation' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-white/70 font-serif leading-relaxed">
                ✨ Each glowing star in the island night sky mirrors an unforgettable chapter in our love story. Look upward through the brass telescope to trace the celestial map we have drawn together.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {specialDates.map((d, i) => (
                  <div
                    key={d.id}
                    className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3 hover:border-[#beb5e9]/40 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#beb5e9]/20 flex items-center justify-center text-[#beb5e9] shrink-0 mt-0.5">
                      <Star className="w-4 h-4 fill-current" />
                    </div>
                    <div>
                      <div className="text-xs font-serif font-bold text-white">{d.title}</div>
                      <div className="text-[10px] text-[#ebcad8] mt-0.5">{d.date}</div>
                      {d.description && (
                        <p className="text-[11px] text-white/60 mt-1 line-clamp-2">{d.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'capsules' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-white/60">
                  Letters sealed in time, unlockable only when the future arrives.
                </span>
                <button
                  onClick={() => setShowCapsuleForm(!showCapsuleForm)}
                  className="px-3 py-1.5 rounded-full bg-[#ebcad8] text-[#2c243b] text-xs font-semibold shadow-md flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Lock New Capsule</span>
                </button>
              </div>

              {showCapsuleForm && (
                <form onSubmit={handleCreateCapsule} className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/15 space-y-3">
                  <div className="text-xs font-semibold text-[#ebcad8]">Create Time Capsule</div>
                  <div>
                    <label className="text-[10px] text-white/40 uppercase font-semibold">Capsule Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. To Us on Our 5-Year Anniversary..."
                      value={capsuleTitle}
                      onChange={(e) => setCapsuleTitle(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs focus:outline-none focus:border-[#ebcad8]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-white/40 uppercase font-semibold">Unlock Date</label>
                    <input
                      type="date"
                      required
                      value={unlockDate}
                      onChange={(e) => setUnlockDate(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs focus:outline-none focus:border-[#ebcad8]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-white/40 uppercase font-semibold">Message To Future Selves</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="What do you want us to remember? Where do you hope we are?..."
                      value={capsuleMessage}
                      onChange={(e) => setCapsuleMessage(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs focus:outline-none focus:border-[#ebcad8]"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCapsuleForm(false)}
                      className="px-3 py-1.5 text-xs text-white/50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-[#ebcad8] text-[#2c243b] text-xs font-semibold shadow-md"
                    >
                      Lock Capsule
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-3">
                {timeCapsules.map((tc) => {
                  const isUnlocked = new Date(tc.unlock_date) <= new Date();
                  const unlockStr = new Date(tc.unlock_date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  });
                  return (
                    <div
                      key={tc.id}
                      className={`p-5 rounded-2xl border transition-all ${
                        isUnlocked
                          ? 'bg-emerald-950/20 border-emerald-500/40'
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {isUnlocked ? (
                            <Unlock className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Lock className="w-4 h-4 text-amber-300" />
                          )}
                          <h4 className="text-sm font-serif font-bold text-white">{tc.title}</h4>
                        </div>
                        <span className="text-[11px] text-white/40 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Unlocks: {unlockStr}</span>
                        </span>
                      </div>

                      {isUnlocked ? (
                        <p className="text-xs text-white/80 font-serif leading-relaxed whitespace-pre-wrap mt-2 p-3 rounded-xl bg-black/20 border border-white/5">
                          {tc.message}
                        </p>
                      ) : (
                        <div className="p-3 rounded-xl bg-black/20 text-xs text-white/40 font-serif italic text-center">
                          🔒 This message is securely sealed until {unlockStr}.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'dreams' && (
            <div className="space-y-3">
              <div className="text-xs text-white/60 mb-2">
                Our shared dreams and bucket list aspirations reflected among the stars.
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {bucketList.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-5 h-5 rounded-lg flex items-center justify-center border ${
                          item.is_completed
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                            : 'border-white/20 text-transparent'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div
                          className={`text-xs font-serif ${
                            item.is_completed ? 'line-through text-white/40' : 'text-white'
                          }`}
                        >
                          {item.title}
                        </div>
                        <div className="text-[10px] text-[#ebcad8] capitalize">{item.category}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
