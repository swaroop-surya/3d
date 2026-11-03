import {
  Memory,
  MemoryAlbum,
  DiaryEntry,
  LoveLetter,
  LoveReason,
  BucketListItem,
  SpecialDate,
  SoundtrackTrack,
  TimeCapsule,
  RelationshipSettings,
  Profile,
  MemoryPlacement,
} from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const STORAGE_KEYS = {
  SETTINGS: 'fmi_relationship_settings',
  MEMORIES: 'fmi_memories',
  ALBUMS: 'fmi_albums',
  PLACEMENTS: 'fmi_placements',
  DIARY: 'fmi_diary',
  LETTERS: 'fmi_letters',
  REASONS: 'fmi_reasons',
  BUCKET_LIST: 'fmi_bucket_list',
  SPECIAL_DATES: 'fmi_special_dates',
  SOUNDTRACK: 'fmi_soundtrack',
  TIME_CAPSULES: 'fmi_time_capsules',
  ACTIVE_USER: 'fmi_active_user',
};

// Default aesthetic seed memories with high quality scenic illustrations
const INITIAL_SETTINGS: RelationshipSettings = {
  couple_name: 'Elena & Julian',
  partner1_name: 'Elena',
  partner2_name: 'Julian',
  start_date: '2023-06-15',
  anniversary_date: '2023-06-15',
  tagline: 'A little world, containing our little moments.',
  featured_quote: 'In all the universe, across all the stars, my heart will always find yours.',
  background_theme: 'sunset',
  weather: 'petal_breeze',
  is_multiplayer_enabled: true,
};

const INITIAL_MEMORIES: Memory[] = [
  {
    id: 'mem-1',
    title: 'First Sunset on the Coast',
    description: 'The golden light turned the ocean into liquid honey. We promised that wherever life takes us, we would always watch the sunset together.',
    media_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    media_type: 'image',
    memory_date: '2023-07-20',
    location_name: 'Sunset Viewpoint Cliff',
    uploaded_by: 'partner_1',
    album_id: 'album-1',
    is_favorite: true,
    assigned_frame_id: 'frame_cliff',
    created_at: '2023-07-21T10:00:00Z',
  },
  {
    id: 'mem-2',
    title: 'Cherry Blossom Picnic',
    description: 'Pink blossoms drifting softly around us. You surprised me with matcha mochi and handwritten notes tucked into my favorite book.',
    media_url: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=1200&q=80',
    media_type: 'image',
    memory_date: '2024-04-12',
    location_name: 'Cherry Blossom Garden',
    uploaded_by: 'partner_2',
    album_id: 'album-1',
    is_favorite: true,
    assigned_frame_id: 'frame_garden',
    created_at: '2024-04-13T14:30:00Z',
  },
  {
    id: 'mem-3',
    title: 'The Cozy Rainstorm by the Fireplace',
    description: 'Heavy rain tapping against the cottage glass window while the fireplace crackled. We brewed spiced chai and talked until 3 AM.',
    media_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
    media_type: 'image',
    memory_date: '2023-11-04',
    location_name: 'The Memory House',
    uploaded_by: 'partner_1',
    album_id: 'album-2',
    is_favorite: true,
    assigned_frame_id: 'frame_fireplace',
    created_at: '2023-11-05T08:15:00Z',
  },
  {
    id: 'mem-4',
    title: 'Stargazing at the High Ridge',
    description: 'Looking up into the infinite celestial sea, wrapping ourselves in one wool blanket and counting shooting stars.',
    media_url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
    media_type: 'image',
    memory_date: '2024-08-19',
    location_name: 'The Observatory',
    uploaded_by: 'partner_2',
    album_id: 'album-2',
    is_favorite: false,
    assigned_frame_id: 'frame_museum_1',
    created_at: '2024-08-20T19:00:00Z',
  },
  {
    id: 'mem-5',
    title: 'Morning Light at the Lake Pier',
    description: 'Mist rising from the crystal water, water lilies blooming in soft lilac, and the gentle chime of distant wind bells.',
    media_url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
    media_type: 'image',
    memory_date: '2024-10-02',
    location_name: 'Crystal Lake',
    uploaded_by: 'partner_1',
    album_id: 'album-1',
    is_favorite: true,
    assigned_frame_id: 'frame_museum_2',
    created_at: '2024-10-03T09:40:00Z',
  },
  {
    id: 'mem-6',
    title: 'Vinyl Waltz in the Pavilion',
    description: 'Dancing with bare feet on the wooden deck while vintage French music floated out over the clouds.',
    media_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
    media_type: 'image',
    memory_date: '2025-01-14',
    location_name: 'Music Pavilion',
    uploaded_by: 'partner_2',
    album_id: 'album-2',
    is_favorite: false,
    assigned_frame_id: 'frame_museum_3',
    created_at: '2025-01-15T16:00:00Z',
  },
];

const INITIAL_ALBUMS: MemoryAlbum[] = [
  {
    id: 'album-1',
    title: 'Seasons of Us',
    description: 'Sunsets, garden blossoms, and spontaneous adventures.',
    cover_url: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=600&q=80',
    created_at: '2023-07-01T00:00:00Z',
  },
  {
    id: 'album-2',
    title: 'Quiet Moments',
    description: 'Fireplaces, lazy mornings, and coffee conversations.',
    cover_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
    created_at: '2023-11-01T00:00:00Z',
  },
];

const INITIAL_PLACEMENTS: MemoryPlacement[] = [
  {
    id: 'frame_fireplace',
    memory_id: 'mem-3',
    location_id: 'memory_house',
    label: 'Cottage Fireplace Mantel',
    object_type: 'photo_frame',
    position: [0, 2.2, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
  },
  {
    id: 'frame_cliff',
    memory_id: 'mem-1',
    location_id: 'sunset_viewpoint',
    label: 'Sunset Viewpoint Easel',
    object_type: 'photo_frame',
    position: [24, 6.2, 18],
    rotation: [0, -0.6, 0],
    scale: [1.2, 1.2, 1.2],
  },
  {
    id: 'frame_garden',
    memory_id: 'mem-2',
    location_id: 'cherry_garden',
    label: 'Cherry Blossom Tree Frame',
    object_type: 'polaroid',
    position: [-16, 2.5, 12],
    rotation: [0, 0.4, 0],
    scale: [1, 1, 1],
  },
  {
    id: 'frame_museum_1',
    memory_id: 'mem-4',
    location_id: 'photo_museum',
    label: 'Museum Gallery North Wall',
    object_type: 'photo_frame',
    position: [18, 3.2, -14],
    rotation: [0, 3.14, 0],
    scale: [1.3, 1.3, 1.3],
  },
  {
    id: 'frame_museum_2',
    memory_id: 'mem-5',
    location_id: 'photo_museum',
    label: 'Museum Gallery Center Arch',
    object_type: 'photo_frame',
    position: [21, 3.2, -14],
    rotation: [0, 3.14, 0],
    scale: [1.3, 1.3, 1.3],
  },
  {
    id: 'frame_museum_3',
    memory_id: 'mem-6',
    location_id: 'photo_museum',
    label: 'Museum Gallery East Wall',
    object_type: 'photo_frame',
    position: [24, 3.2, -14],
    rotation: [0, 3.14, 0],
    scale: [1.3, 1.3, 1.3],
  },
];

const INITIAL_LETTERS: LoveLetter[] = [
  {
    id: 'let-1',
    sender: 'partner_1',
    recipient: 'partner_2',
    title: 'Open when you need a gentle reminder of how loved you are',
    content: `My dearest Julian,

If you are reading this right now, take a deep breath and relax your shoulders.
Whatever is weighing on your mind today, remember that you are capable, resilient, and deeply cherished.

I remember when you stayed up with me while I was nervous about my exhibition, making little origami stars until dawn. Every moment with you feels like home.

You are my favorite thought of the day, every day.
Forever yours,
Elena`,
    wax_seal_color: 'rose',
    is_read: false,
    open_when_prompt: 'Open when you need a gentle reminder',
    created_at: '2024-02-14T00:00:00Z',
  },
  {
    id: 'let-2',
    sender: 'partner_2',
    recipient: 'partner_1',
    title: 'The Little Things I Love About You',
    content: `Elena,

Today I watched you hummingbird around the kitchen trying to make raspberry scones, with flour on your nose and that delighted smile when they puffed up in the oven.

It's the smallest moments that make my heart overflow: the way you hold my arm when we cross the street, how you hum when you concentrate, and how our hands fit together like they were sculpted to hold each other.

Thank you for building this beautiful life with me.

Julian`,
    wax_seal_color: 'lavender',
    is_read: true,
    created_at: '2024-06-15T09:00:00Z',
  },
  {
    id: 'let-3',
    sender: 'partner_1',
    recipient: 'partner_2',
    title: 'To Read on Our Next Anniversary',
    content: `To my love,
Another year around the sun together. Look how much our little world has grown! 
Every laugh, every road trip, every quiet evening has woven itself into our story.
I can't wait for all the unwritten chapters ahead.`,
    wax_seal_color: 'gold',
    is_read: false,
    open_when_prompt: 'Open on our anniversary',
    created_at: '2025-06-15T00:00:00Z',
  },
];

const INITIAL_DIARY: DiaryEntry[] = [
  {
    id: 'diary-1',
    title: 'The Rainy Sunday Sourdough Experiment',
    content: 'It poured rain all afternoon. We decided to bake bread from scratch. Floured counters, jazz playing in the background, and the delicious scent of warm bread filling the cottage. Absolute perfection.',
    entry_date: '2024-10-14',
    mood: 'peaceful',
    author: 'partner_1',
    is_private: false,
    media_url: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=600&q=80',
    created_at: '2024-10-14T18:00:00Z',
  },
  {
    id: 'diary-2',
    title: 'We Finally Booked Kyoto!',
    content: 'Tickets booked! March 2026 for the peak blossom season. We spent two hours looking at traditional ryokans with garden onsens. We are actually doing this!',
    entry_date: '2025-01-08',
    mood: 'joyful',
    author: 'partner_2',
    is_private: false,
    created_at: '2025-01-08T21:10:00Z',
  },
  {
    id: 'diary-3',
    title: 'Watching You Read in the Afternoon Sun',
    content: 'The sunlight filtered through the sheer curtains right onto your hair. You were so absorbed in your novel, occasionally taking sips of cold brew. In that exact second, I felt an overwhelming wave of gratitude for our shared life.',
    entry_date: '2025-02-18',
    mood: 'loving',
    author: 'partner_1',
    is_private: true,
    created_at: '2025-02-18T16:20:00Z',
  },
];

const INITIAL_REASONS: LoveReason[] = [
  {
    id: 'r-1',
    author: 'partner_2',
    reason: 'The way your eyes crinkle with genuine joy when you see street dogs.',
    color_tag: '#EBCAD8',
    created_at: '2024-03-01T00:00:00Z',
  },
  {
    id: 'r-2',
    author: 'partner_1',
    reason: 'How you always warm up the car on freezing mornings before I get in.',
    color_tag: '#BEB5E9',
    created_at: '2024-03-05T00:00:00Z',
  },
  {
    id: 'r-3',
    author: 'partner_2',
    reason: 'The soft way you squeeze my hand three times when we are in a crowded room.',
    color_tag: '#F2DCE6',
    created_at: '2024-04-10T00:00:00Z',
  },
  {
    id: 'r-4',
    author: 'partner_1',
    reason: 'How you believe in my dreams even when self-doubt creeps in.',
    color_tag: '#B8D4B4',
    created_at: '2024-05-18T00:00:00Z',
  },
  {
    id: 'r-5',
    author: 'partner_2',
    reason: 'Our silly kitchen slow dances while waiting for pasta water to boil.',
    color_tag: '#FFF5E9',
    created_at: '2024-07-22T00:00:00Z',
  },
  {
    id: 'r-6',
    author: 'partner_1',
    reason: 'The gentle forehead kisses before you head out for work.',
    color_tag: '#A9D7E5',
    created_at: '2024-09-02T00:00:00Z',
  },
];

const INITIAL_BUCKET: BucketListItem[] = [
  {
    id: 'b-1',
    title: 'Sleep under the Northern Lights in an Aurora glass igloo',
    category: 'places',
    is_completed: false,
    created_by: 'partner_1',
  },
  {
    id: 'b-2',
    title: 'Take a private cooking class in Florence, Italy',
    category: 'food',
    is_completed: false,
    created_by: 'partner_2',
  },
  {
    id: 'b-3',
    title: 'Studio Ghibli movie marathon in a living room blanket fort',
    category: 'movies',
    is_completed: true,
    completed_date: '2024-11-20',
    notes: 'Built with 6 pillows, fairy lights, and hot chocolate with mini marshmallows!',
    created_by: 'partner_1',
  },
  {
    id: 'b-4',
    title: 'Plant a Japanese cherry tree in our future garden',
    category: 'goals',
    is_completed: false,
    created_by: 'partner_2',
  },
  {
    id: 'b-5',
    title: 'Sunrise hot air balloon flight over Cappadocia',
    category: 'experiences',
    is_completed: false,
    created_by: 'partner_1',
  },
];

const INITIAL_SPECIAL_DATES: SpecialDate[] = [
  {
    id: 'sd-1',
    title: 'The Rainy Afternoon We First Met',
    date: '2023-06-15',
    category: 'first_met',
    description: 'We both reached for the same copy of Murakami in the corner bookstore.',
    icon: 'Sparkles',
  },
  {
    id: 'sd-2',
    title: 'First Roadtrip to Big Sur',
    date: '2023-09-22',
    category: 'trip',
    description: 'Windows down, Pacific breeze, and singing along to 90s indie songs.',
    icon: 'Compass',
  },
  {
    id: 'sd-3',
    title: 'One-Year Anniversary Under the Lanterns',
    date: '2024-06-15',
    category: 'anniversary',
    description: 'Dinner on the terrace with fairy lights and our promise for the future.',
    icon: 'Heart',
  },
  {
    id: 'sd-4',
    title: 'Elena’s Birthday Surprise',
    date: '2024-08-30',
    category: 'birthday',
    description: 'Surprise weekend cabin retreat with all her closest childhood friends.',
    icon: 'Cake',
  },
  {
    id: 'sd-5',
    title: 'Two-Year Anniversary Celebration',
    date: '2025-06-15',
    category: 'anniversary',
    description: 'Reflecting on our growing journey and floating memory island.',
    icon: 'Crown',
  },
];

const INITIAL_SOUNDTRACK: SoundtrackTrack[] = [
  {
    id: 'st-1',
    title: 'La Vie En Rose (Acoustic Piano)',
    artist: 'Edith Piaf / Romantic Variations',
    external_url: 'https://open.spotify.com',
    memory_note: 'Our official dance song at the music pavilion',
    added_by: 'partner_1',
    duration: '3:24',
  },
  {
    id: 'st-2',
    title: 'Nuvole Bianche',
    artist: 'Ludovico Einaudi',
    external_url: 'https://open.spotify.com',
    memory_note: 'The song playing during our late night cottage reading',
    added_by: 'partner_2',
    duration: '5:57',
  },
  {
    id: 'st-3',
    title: 'Golden Hour (Cello & Harp)',
    artist: 'JVKE / Classical Mix',
    external_url: 'https://open.spotify.com',
    memory_note: 'Sunset at the cliff overlook',
    added_by: 'partner_1',
    duration: '3:30',
  },
];

const INITIAL_CAPSULES: TimeCapsule[] = [
  {
    id: 'tc-1',
    title: 'To Us on Our 5-Year Anniversary',
    message: 'Remember the tiny studio apartment, the squeaky floorboards, and how big our dreams felt. Are we living near the water now? Have we planted the cherry blossom tree? Whatever answers you have, I know we are still each others home.',
    unlock_date: '2028-06-15T00:00:00Z',
    created_by: 'partner_1',
    is_unlocked: false,
  },
];

export const storageService = {
  // Helpers
  get<T>(key: string, fallback: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  },

  set<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
  },

  // Active Profile / Auth
  getActiveRole(): 'partner_1' | 'partner_2' {
    return this.get<'partner_1' | 'partner_2'>(STORAGE_KEYS.ACTIVE_USER, 'partner_1');
  },

  setActiveRole(role: 'partner_1' | 'partner_2'): void {
    this.set(STORAGE_KEYS.ACTIVE_USER, role);
  },

  // Settings
  getSettings(): RelationshipSettings {
    return this.get<RelationshipSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  },

  updateSettings(settings: Partial<RelationshipSettings>): RelationshipSettings {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    this.set(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  },

  // Memories
  getMemories(): Memory[] {
    return this.get<Memory[]>(STORAGE_KEYS.MEMORIES, INITIAL_MEMORIES);
  },

  addMemory(memory: Omit<Memory, 'id' | 'created_at'>): Memory {
    const list = this.getMemories();
    const newMemory: Memory = {
      ...memory,
      id: `mem-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    list.unshift(newMemory);
    this.set(STORAGE_KEYS.MEMORIES, list);
    return newMemory;
  },

  updateMemory(id: string, updates: Partial<Memory>): Memory | null {
    const list = this.getMemories();
    const idx = list.findIndex((m) => m.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates };
    this.set(STORAGE_KEYS.MEMORIES, list);
    return list[idx];
  },

  deleteMemory(id: string): void {
    const list = this.getMemories().filter((m) => m.id !== id);
    this.set(STORAGE_KEYS.MEMORIES, list);
  },

  // Placements in 3D scene
  getPlacements(): MemoryPlacement[] {
    return this.get<MemoryPlacement[]>(STORAGE_KEYS.PLACEMENTS, INITIAL_PLACEMENTS);
  },

  assignMemoryToFrame(frameId: string, memoryId?: string): void {
    const placements = this.getPlacements();
    const idx = placements.findIndex((p) => p.id === frameId);
    if (idx !== -1) {
      placements[idx].memory_id = memoryId;
      this.set(STORAGE_KEYS.PLACEMENTS, placements);
    }
  },

  // Albums
  getAlbums(): MemoryAlbum[] {
    return this.get<MemoryAlbum[]>(STORAGE_KEYS.ALBUMS, INITIAL_ALBUMS);
  },

  addAlbum(album: Omit<MemoryAlbum, 'id' | 'created_at'>): MemoryAlbum {
    const list = this.getAlbums();
    const newAlbum: MemoryAlbum = {
      ...album,
      id: `album-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    list.push(newAlbum);
    this.set(STORAGE_KEYS.ALBUMS, list);
    return newAlbum;
  },

  // Diary
  getDiary(): DiaryEntry[] {
    return this.get<DiaryEntry[]>(STORAGE_KEYS.DIARY, INITIAL_DIARY);
  },

  addDiary(entry: Omit<DiaryEntry, 'id' | 'created_at'>): DiaryEntry {
    const list = this.getDiary();
    const newEntry: DiaryEntry = {
      ...entry,
      id: `diary-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    list.unshift(newEntry);
    this.set(STORAGE_KEYS.DIARY, list);
    return newEntry;
  },

  deleteDiary(id: string): void {
    const list = this.getDiary().filter((d) => d.id !== id);
    this.set(STORAGE_KEYS.DIARY, list);
  },

  // Letters
  getLetters(): LoveLetter[] {
    return this.get<LoveLetter[]>(STORAGE_KEYS.LETTERS, INITIAL_LETTERS);
  },

  addLetter(letter: Omit<LoveLetter, 'id' | 'created_at' | 'is_read'>): LoveLetter {
    const list = this.getLetters();
    const newLetter: LoveLetter = {
      ...letter,
      id: `let-${Date.now()}`,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    list.unshift(newLetter);
    this.set(STORAGE_KEYS.LETTERS, list);
    return newLetter;
  },

  markLetterAsRead(id: string): void {
    const list = this.getLetters();
    const idx = list.findIndex((l) => l.id === id);
    if (idx !== -1) {
      list[idx].is_read = true;
      this.set(STORAGE_KEYS.LETTERS, list);
    }
  },

  // Love reasons
  getReasons(): LoveReason[] {
    return this.get<LoveReason[]>(STORAGE_KEYS.REASONS, INITIAL_REASONS);
  },

  addReason(reasonText: string, author: 'partner_1' | 'partner_2'): LoveReason {
    const list = this.getReasons();
    const palette = ['#EBCAD8', '#BEB5E9', '#F2DCE6', '#B8D4B4', '#FFF5E9', '#A9D7E5'];
    const randomColor = palette[Math.floor(Math.random() * palette.length)];
    const newReason: LoveReason = {
      id: `r-${Date.now()}`,
      author,
      reason: reasonText,
      color_tag: randomColor,
      created_at: new Date().toISOString(),
    };
    list.push(newReason);
    this.set(STORAGE_KEYS.REASONS, list);
    return newReason;
  },

  // Bucket list
  getBucketList(): BucketListItem[] {
    return this.get<BucketListItem[]>(STORAGE_KEYS.BUCKET_LIST, INITIAL_BUCKET);
  },

  addBucketItem(item: Omit<BucketListItem, 'id' | 'is_completed'>): BucketListItem {
    const list = this.getBucketList();
    const newItem: BucketListItem = {
      ...item,
      id: `b-${Date.now()}`,
      is_completed: false,
    };
    list.push(newItem);
    this.set(STORAGE_KEYS.BUCKET_LIST, list);
    return newItem;
  },

  toggleBucketItem(id: string): void {
    const list = this.getBucketList();
    const idx = list.findIndex((b) => b.id === id);
    if (idx !== -1) {
      list[idx].is_completed = !list[idx].is_completed;
      if (list[idx].is_completed) {
        list[idx].completed_date = new Date().toISOString().split('T')[0];
      }
      this.set(STORAGE_KEYS.BUCKET_LIST, list);
    }
  },

  // Special Dates
  getSpecialDates(): SpecialDate[] {
    return this.get<SpecialDate[]>(STORAGE_KEYS.SPECIAL_DATES, INITIAL_SPECIAL_DATES);
  },

  addSpecialDate(date: Omit<SpecialDate, 'id'>): SpecialDate {
    const list = this.getSpecialDates();
    const newDate: SpecialDate = {
      ...date,
      id: `sd-${Date.now()}`,
    };
    list.push(newDate);
    this.set(STORAGE_KEYS.SPECIAL_DATES, list);
    return newDate;
  },

  // Soundtrack
  getSoundtrack(): SoundtrackTrack[] {
    return this.get<SoundtrackTrack[]>(STORAGE_KEYS.SOUNDTRACK, INITIAL_SOUNDTRACK);
  },

  addSoundtrack(track: Omit<SoundtrackTrack, 'id'>): SoundtrackTrack {
    const list = this.getSoundtrack();
    const newTrack: SoundtrackTrack = {
      ...track,
      id: `st-${Date.now()}`,
    };
    list.push(newTrack);
    this.set(STORAGE_KEYS.SOUNDTRACK, list);
    return newTrack;
  },

  // Time capsules
  getTimeCapsules(): TimeCapsule[] {
    return this.get<TimeCapsule[]>(STORAGE_KEYS.TIME_CAPSULES, INITIAL_CAPSULES);
  },

  addTimeCapsule(capsule: Omit<TimeCapsule, 'id' | 'is_unlocked'>): TimeCapsule {
    const list = this.getTimeCapsules();
    const newCapsule: TimeCapsule = {
      ...capsule,
      id: `tc-${Date.now()}`,
      is_unlocked: new Date(capsule.unlock_date) <= new Date(),
    };
    list.push(newCapsule);
    this.set(STORAGE_KEYS.TIME_CAPSULES, list);
    return newCapsule;
  },
};
