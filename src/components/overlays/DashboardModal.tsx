import React, { useState } from 'react';
import {
  X,
  Image,
  BookOpen,
  Mail,
  CheckSquare,
  Calendar,
  Music,
  Sliders,
  Search,
  Plus,
  Heart,
  Star,
  MapPin,
  Trash2,
  Check,
  Sparkles,
} from 'lucide-react';
import {
  Memory,
  MemoryAlbum,
  DiaryEntry,
  LoveLetter,
  BucketListItem,
  SpecialDate,
  SoundtrackTrack,
  RelationshipSettings,
  MemoryPlacement,
} from '../../types';

interface DashboardModalProps {
  settings: RelationshipSettings;
  memories: Memory[];
  albums: MemoryAlbum[];
  diary: DiaryEntry[];
  letters: LoveLetter[];
  bucketList: BucketListItem[];
  specialDates: SpecialDate[];
  soundtrack: SoundtrackTrack[];
  placements: MemoryPlacement[];
  onClose: () => void;
  onUpdateSettings: (settings: Partial<RelationshipSettings>) => void;
  onAddMemory: (memory: Omit<Memory, 'id' | 'created_at'>) => void;
  onDeleteMemory: (id: string) => void;
  onToggleBucketItem: (id: string) => void;
  onAddBucketItem: (item: Omit<BucketListItem, 'id' | 'is_completed'>) => void;
  onAssignToFrame: (frameId: string, memoryId?: string) => void;
  activeRole: 'partner_1' | 'partner_2';
}

export const DashboardModal: React.FC<DashboardModalProps> = ({
  settings,
  memories,
  albums,
  diary,
  letters,
  bucketList,
  specialDates,
  soundtrack,
  placements,
  onClose,
  onUpdateSettings,
  onAddMemory,
  onDeleteMemory,
  onToggleBucketItem,
  onAddBucketItem,
  onAssignToFrame,
  activeRole,
}) => {
  const [activeTab, setActiveTab] = useState<
    'memories' | 'diary' | 'letters' | 'bucket' | 'milestones' | 'soundtrack' | 'settings'
  >('memories');

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  // New Memory Modal inside Dashboard
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newLoc, setNewLoc] = useState('Floating Island');

  // New Bucket Item State
  const [showBucketForm, setShowBucketForm] = useState(false);
  const [bucketTitle, setBucketTitle] = useState('');
  const [bucketCategory, setBucketCategory] = useState<BucketListItem['category']>('places');

  const filteredMemories = memories.filter((m) => {
    if (favoritesOnly && !m.is_favorite) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        m.title.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.location_name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCreateMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    onAddMemory({
      title: newTitle.trim(),
      description: newDesc.trim(),
      media_url: newUrl.trim(),
      media_type: 'image',
      memory_date: newDate,
      location_name: newLoc.trim(),
      uploaded_by: activeRole,
      is_favorite: false,
    });

    setShowUploadForm(false);
    setNewTitle('');
    setNewDesc('');
    setNewUrl('');
  };

  const handleCreateBucket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bucketTitle.trim()) return;

    onAddBucketItem({
      title: bucketTitle.trim(),
      category: bucketCategory,
      created_by: activeRole,
    });

    setShowBucketForm(false);
    setBucketTitle('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in select-text">
      <div className="glass-panel w-full max-w-5xl h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-white/20">
        {/* Top Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#1f1a2e]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#ebcad8] to-[#beb5e9] flex items-center justify-center text-[#2c243b]">
              <Heart className="w-5 h-5 fill-[#2c243b]" />
            </div>
            <div>
              <h2 className="text-xl font-serif text-white">{settings.couple_name}’s Island Dashboard</h2>
              <p className="text-xs text-white/50">Manage photos, letters, diaries, dreams & island settings</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="px-5 py-2.5 border-b border-white/10 bg-white/5 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
          {[
            { id: 'memories', label: `Photographs (${memories.length})`, icon: Image },
            { id: 'diary', label: `Diary (${diary.length})`, icon: BookOpen },
            { id: 'letters', label: `Letters (${letters.length})`, icon: Mail },
            { id: 'bucket', label: `Bucket List (${bucketList.length})`, icon: CheckSquare },
            { id: 'milestones', label: `Dates (${specialDates.length})`, icon: Calendar },
            { id: 'soundtrack', label: `Music (${soundtrack.length})`, icon: Music },
            { id: 'settings', label: `Settings`, icon: Sliders },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-xl font-medium shrink-0 flex items-center gap-2 transition-all ${
                  isActive
                    ? 'bg-[#ebcad8] text-[#2c243b] shadow-md font-semibold'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-[#231e33]/90">
          {/* TAB 1: MEMORIES & PHOTOGRAPHS */}
          {activeTab === 'memories' && (
            <div>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search memories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/10 border border-white/20 text-xs text-white focus:outline-none focus:border-[#ebcad8]"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => setFavoritesOnly(!favoritesOnly)}
                    className={`px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 border transition-all ${
                      favoritesOnly
                        ? 'bg-rose-500/30 border-rose-400 text-rose-200'
                        : 'bg-white/5 border-white/10 text-white/60'
                    }`}
                  >
                    <Star className="w-3.5 h-3.5" />
                    <span>Favorites</span>
                  </button>

                  <button
                    onClick={() => setShowUploadForm(true)}
                    className="px-4 py-2 rounded-xl bg-[#ebcad8] text-[#2c243b] text-xs font-semibold shadow-md flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Upload Photograph</span>
                  </button>
                </div>
              </div>

              {/* Upload Form Modal */}
              {showUploadForm && (
                <form onSubmit={handleCreateMemory} className="mb-6 p-5 rounded-3xl bg-white/5 border border-white/20 space-y-3">
                  <div className="text-sm font-semibold text-white">Upload / Add New Memory</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Title of memory..."
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs focus:outline-none focus:border-[#ebcad8]"
                    />
                    <input
                      type="url"
                      required
                      placeholder="Image URL (e.g. Unsplash, Supabase URL)..."
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      className="px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs focus:outline-none focus:border-[#ebcad8]"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="date"
                      required
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs focus:outline-none focus:border-[#ebcad8]"
                    />
                    <input
                      type="text"
                      placeholder="Location name..."
                      value={newLoc}
                      onChange={(e) => setNewLoc(e.target.value)}
                      className="px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs focus:outline-none focus:border-[#ebcad8]"
                    />
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Describe this precious moment..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs focus:outline-none focus:border-[#ebcad8]"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowUploadForm(false)}
                      className="px-3 py-1.5 text-xs text-white/50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-[#ebcad8] text-[#2c243b] text-xs font-semibold shadow-md"
                    >
                      Add Memory
                    </button>
                  </div>
                </form>
              )}

              {/* Grid of Memories */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredMemories.map((mem) => {
                  const assignedPlacement = placements.find((p) => p.memory_id === mem.id);
                  return (
                    <div
                      key={mem.id}
                      className="rounded-3xl overflow-hidden bg-white/5 border border-white/10 flex flex-col group hover:border-[#ebcad8]/40 transition-all"
                    >
                      <div className="relative h-44 overflow-hidden bg-black/40">
                        <img
                          src={mem.media_url}
                          alt={mem.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {assignedPlacement && (
                          <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] text-[#ebcad8] flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-[#ebcad8]" />
                            <span>In 3D {assignedPlacement.label}</span>
                          </div>
                        )}
                        <button
                          onClick={() => onDeleteMemory(mem.id)}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white/40 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="p-4 flex flex-col justify-between flex-1">
                        <div>
                          <div className="flex items-center justify-between text-[11px] text-white/40 mb-1">
                            <span>{mem.memory_date}</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>{mem.location_name}</span>
                            </span>
                          </div>
                          <h4 className="text-sm font-serif font-bold text-white mb-1">
                            {mem.title}
                          </h4>
                          <p className="text-xs text-white/70 font-serif line-clamp-2 italic">
                            &ldquo;{mem.description}&rdquo;
                          </p>
                        </div>

                        {/* Quick 3D Frame Assignment Dropdown */}
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <label className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mb-1 block">
                            Assigned 3D Frame
                          </label>
                          <select
                            value={assignedPlacement?.id || ''}
                            onChange={(e) => {
                              const targetPlacementId = e.target.value;
                              if (targetPlacementId) {
                                onAssignToFrame(targetPlacementId, mem.id);
                              } else if (assignedPlacement) {
                                onAssignToFrame(assignedPlacement.id, undefined);
                              }
                            }}
                            className="w-full px-2.5 py-1.5 rounded-xl bg-white/10 border border-white/15 text-xs text-white focus:outline-none"
                          >
                            <option value="" className="bg-[#231e33] text-white">
                              -- Not Assigned in 3D Scene --
                            </option>
                            {placements.map((p) => (
                              <option key={p.id} value={p.id} className="bg-[#231e33] text-white">
                                {p.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: SHARED DIARY OVERVIEW */}
          {activeTab === 'diary' && (
            <div className="space-y-3">
              <div className="text-xs text-white/60 mb-2">
                All saved chronicles from our scrapbooks and journal entries.
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {diary.map((d) => (
                  <div key={d.id} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between text-xs text-white/50 mb-1">
                      <span className="text-[#ebcad8] font-medium">{d.mood.toUpperCase()}</span>
                      <span>{d.entry_date}</span>
                    </div>
                    <h4 className="text-sm font-serif font-bold text-white mb-2">{d.title}</h4>
                    <p className="text-xs text-white/80 font-serif leading-relaxed line-clamp-3">
                      {d.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: LOVE LETTERS OVERVIEW */}
          {activeTab === 'letters' && (
            <div className="space-y-3">
              <div className="text-xs text-white/60 mb-2">
                All letters exchanged between {settings.partner1_name} and {settings.partner2_name}.
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {letters.map((l) => (
                  <div key={l.id} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between text-[11px] text-[#ebcad8] mb-1">
                      <span>From {l.sender === 'partner_1' ? settings.partner1_name : settings.partner2_name}</span>
                      <span>{new Date(l.created_at).toLocaleDateString()}</span>
                    </div>
                    <h4 className="text-sm font-serif font-bold text-white mb-1">{l.title}</h4>
                    {l.open_when_prompt && (
                      <div className="text-[10px] text-white/50 italic mb-2">
                        🏷️ {l.open_when_prompt}
                      </div>
                    )}
                    <p className="text-xs text-white/70 font-serif line-clamp-3 leading-relaxed">
                      {l.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: BUCKET LIST */}
          {activeTab === 'bucket' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-white/60">
                  Shared bucket list of adventures, trips, food, and future goals.
                </span>
                <button
                  onClick={() => setShowBucketForm(!showBucketForm)}
                  className="px-3 py-1.5 rounded-full bg-[#ebcad8] text-[#2c243b] text-xs font-semibold shadow-md flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Dream Item</span>
                </button>
              </div>

              {showBucketForm && (
                <form onSubmit={handleCreateBucket} className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/15 space-y-3">
                  <div className="text-xs font-semibold text-[#ebcad8]">New Bucket List Dream</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="e.g. See Northern Lights, Visit Kyoto..."
                      value={bucketTitle}
                      onChange={(e) => setBucketTitle(e.target.value)}
                      className="px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs focus:outline-none focus:border-[#ebcad8]"
                    />
                    <select
                      value={bucketCategory}
                      onChange={(e) => setBucketCategory(e.target.value as any)}
                      className="px-3.5 py-2 rounded-xl bg-[#231e33] border border-white/20 text-white text-xs focus:outline-none"
                    >
                      <option value="places">Places to Visit</option>
                      <option value="food">Food to Try</option>
                      <option value="movies">Movies to Watch</option>
                      <option value="experiences">Experiences</option>
                      <option value="goals">Future Goals</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowBucketForm(false)}
                      className="px-3 py-1.5 text-xs text-white/50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-[#ebcad8] text-[#2c243b] text-xs font-semibold shadow-md"
                    >
                      Save Dream
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {bucketList.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onToggleBucketItem(item.id)}
                    className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-[#ebcad8]/40 transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                          item.is_completed
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                            : 'border-white/20 text-transparent'
                        }`}
                      >
                        <Check className="w-4 h-4" />
                      </div>
                      <div>
                        <div
                          className={`text-xs font-serif ${
                            item.is_completed ? 'line-through text-white/40' : 'text-white font-medium'
                          }`}
                        >
                          {item.title}
                        </div>
                        <div className="text-[10px] text-[#ebcad8] capitalize">{item.category}</div>
                      </div>
                    </div>

                    {item.completed_date && (
                      <span className="text-[10px] text-emerald-300/70">
                        Done on {item.completed_date}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: SPECIAL DATES */}
          {activeTab === 'milestones' && (
            <div className="space-y-3">
              <div className="text-xs text-white/60 mb-2">
                All celebrated relationship milestones and future anniversaries.
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {specialDates.map((sd) => (
                  <div key={sd.id} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between text-xs text-[#ebcad8] mb-1">
                      <span className="capitalize font-semibold">{sd.category.replace('_', ' ')}</span>
                      <span>{sd.date}</span>
                    </div>
                    <h4 className="text-sm font-serif font-bold text-white mb-1">{sd.title}</h4>
                    <p className="text-xs text-white/70 font-serif">{sd.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: SOUNDTRACK */}
          {activeTab === 'soundtrack' && (
            <div className="space-y-3">
              <div className="text-xs text-white/60 mb-2">
                Soundtrack associated with moments on the island.
              </div>
              <div className="space-y-2">
                {soundtrack.map((tr) => (
                  <div key={tr.id} className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-serif font-bold text-white">{tr.title}</div>
                      <div className="text-[11px] text-white/50">{tr.artist}</div>
                      {tr.memory_note && (
                        <div className="text-[11px] text-[#ebcad8] font-serif italic mt-1">
                          &ldquo;{tr.memory_note}&rdquo;
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-white/40">{tr.duration || '3:30'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: SETTINGS & BACKEND */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h3 className="text-base font-semibold text-white mb-1">Couple Details</h3>
                <p className="text-xs text-white/50">Personalize your names and anniversary date.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-white/40 uppercase font-semibold">Couple Island Name</label>
                  <input
                    type="text"
                    value={settings.couple_name}
                    onChange={(e) => onUpdateSettings({ couple_name: e.target.value })}
                    className="w-full mt-1 px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-white/40 uppercase font-semibold">Anniversary Start Date</label>
                  <input
                    type="date"
                    value={settings.start_date}
                    onChange={(e) => onUpdateSettings({ start_date: e.target.value, anniversary_date: e.target.value })}
                    className="w-full mt-1 px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-white/40 uppercase font-semibold">Partner 1 Name</label>
                  <input
                    type="text"
                    value={settings.partner1_name}
                    onChange={(e) => onUpdateSettings({ partner1_name: e.target.value })}
                    className="w-full mt-1 px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-white/40 uppercase font-semibold">Partner 2 Name</label>
                  <input
                    type="text"
                    value={settings.partner2_name}
                    onChange={(e) => onUpdateSettings({ partner2_name: e.target.value })}
                    className="w-full mt-1 px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-white/40 uppercase font-semibold">Island Tagline</label>
                <input
                  type="text"
                  value={settings.tagline}
                  onChange={(e) => onUpdateSettings({ tagline: e.target.value })}
                  className="w-full mt-1 px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-white/40 uppercase font-semibold">Featured Relationship Quote</label>
                <textarea
                  rows={2}
                  value={settings.featured_quote}
                  onChange={(e) => onUpdateSettings({ featured_quote: e.target.value })}
                  className="w-full mt-1 px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-white/10">
                <h4 className="text-xs font-semibold text-white mb-2">Backend & Database Status</h4>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-white/70 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Database Engine:</span>
                    <span className="font-mono text-emerald-300">PostgreSQL (Supabase RLS enabled)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Storage Engine:</span>
                    <span className="font-mono text-[#ebcad8]">Local Resilient Sync + Private Buckets</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Authentication:</span>
                    <span className="font-mono text-purple-300">Authorized Two-Partner Policy</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
