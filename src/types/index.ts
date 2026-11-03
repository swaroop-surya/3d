export type TimeOfDay = 'morning' | 'afternoon' | 'sunset' | 'night';
export type WeatherState = 'clear' | 'gentle_rain' | 'petal_breeze' | 'dreamy_stars';

export interface Profile {
  id: string;
  name: string;
  role: 'partner_1' | 'partner_2';
  avatar_url?: string;
  favorite_color?: string;
  nickname?: string;
}

export interface RelationshipSettings {
  couple_name: string;
  partner1_name: string;
  partner2_name: string;
  start_date: string; // ISO date 'YYYY-MM-DD'
  anniversary_date: string;
  tagline: string;
  featured_quote: string;
  background_theme: TimeOfDay;
  weather: WeatherState;
  is_multiplayer_enabled: boolean;
}

export interface Memory {
  id: string;
  title: string;
  description: string;
  media_url: string;
  media_type: 'image' | 'video';
  memory_date: string;
  location_name: string;
  uploaded_by: 'partner_1' | 'partner_2';
  album_id?: string;
  is_favorite: boolean;
  assigned_frame_id?: string; // Links to a 3D frame placement
  created_at: string;
}

export interface MemoryAlbum {
  id: string;
  title: string;
  description: string;
  cover_url?: string;
  created_at: string;
}

export interface MemoryPlacement {
  id: string;
  memory_id?: string;
  location_id: IslandLocationId;
  label: string;
  object_type: 'photo_frame' | 'polaroid' | 'banner';
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

export interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  entry_date: string;
  mood: 'joyful' | 'peaceful' | 'loving' | 'nostalgic' | 'warm' | 'dreamy';
  author: 'partner_1' | 'partner_2';
  is_private: boolean; // if true, only author can view
  media_url?: string;
  created_at: string;
}

export interface LoveLetter {
  id: string;
  sender: 'partner_1' | 'partner_2';
  recipient: 'partner_1' | 'partner_2';
  title: string;
  content: string;
  wax_seal_color: 'rose' | 'lavender' | 'gold' | 'sky';
  is_read: boolean;
  scheduled_for?: string; // If set, locked until this date
  open_when_prompt?: string; // e.g., "Open when you miss me", "Open on a rainy afternoon"
  created_at: string;
}

export interface LoveReason {
  id: string;
  author: 'partner_1' | 'partner_2';
  reason: string;
  color_tag: string;
  created_at: string;
}

export interface BucketListItem {
  id: string;
  title: string;
  category: 'places' | 'food' | 'movies' | 'experiences' | 'goals';
  is_completed: boolean;
  completed_date?: string;
  notes?: string;
  created_by: 'partner_1' | 'partner_2';
}

export interface SpecialDate {
  id: string;
  title: string;
  date: string; // 'YYYY-MM-DD'
  category: 'anniversary' | 'birthday' | 'first_met' | 'trip' | 'milestone';
  description: string;
  icon?: string;
}

export interface SoundtrackTrack {
  id: string;
  title: string;
  artist: string;
  external_url?: string;
  memory_note?: string;
  added_by: 'partner_1' | 'partner_2';
  duration?: string;
}

export interface TimeCapsule {
  id: string;
  title: string;
  message: string;
  media_url?: string;
  created_by: 'partner_1' | 'partner_2';
  unlock_date: string; // ISO date
  is_unlocked: boolean;
}

export type IslandLocationId =
  | 'memory_house'
  | 'cherry_garden'
  | 'crystal_lake'
  | 'photo_museum'
  | 'post_office'
  | 'observatory'
  | 'music_pavilion'
  | 'sunset_viewpoint';

export interface LocationMeta {
  id: IslandLocationId;
  name: string;
  description: string;
  position: [number, number, number]; // Camera target position
  lookAt: [number, number, number];
  icon: string;
}

export type InteractiveObjectType =
  | 'photo_frame'
  | 'memory_album'
  | 'fireplace'
  | 'bookshelf'
  | 'letter_desk'
  | 'mailbox'
  | 'memory_tree'
  | 'flower_memory'
  | 'memory_bench'
  | 'lantern'
  | 'memory_bottle'
  | 'wish_fountain'
  | 'telescope'
  | 'constellation_star'
  | 'record_player'
  | 'treasure_chest'
  | 'viewpoint_bench';

export interface InteractiveObjectData {
  id: string;
  type: InteractiveObjectType;
  title: string;
  subtitle?: string;
  locationId: IslandLocationId;
  position: [number, number, number];
  dataPayload?: any;
}
