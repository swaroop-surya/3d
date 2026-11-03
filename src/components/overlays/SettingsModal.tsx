import React, { useState } from 'react';
import { X, Heart, Sliders, Database, Check, Shield } from 'lucide-react';
import { RelationshipSettings } from '../../types';

interface SettingsModalProps {
  settings: RelationshipSettings;
  onClose: () => void;
  onUpdateSettings: (settings: Partial<RelationshipSettings>) => void;
  activeRole: 'partner_1' | 'partner_2';
  onSwitchRole: (role: 'partner_1' | 'partner_2') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onClose,
  onUpdateSettings,
  activeRole,
  onSwitchRole,
}) => {
  const [coupleName, setCoupleName] = useState(settings.couple_name);
  const [partner1Name, setPartner1Name] = useState(settings.partner1_name);
  const [partner2Name, setPartner2Name] = useState(settings.partner2_name);
  const [startDate, setStartDate] = useState(settings.start_date);
  const [tagline, setTagline] = useState(settings.tagline);
  const [quote, setQuote] = useState(settings.featured_quote);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      couple_name: coupleName,
      partner1_name: partner1Name,
      partner2_name: partner2Name,
      start_date: startDate,
      anniversary_date: startDate,
      tagline,
      featured_quote: quote,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in select-text">
      <div className="glass-panel w-full max-w-lg max-h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-white/20">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[#281d33] to-[#1c182d]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#ebcad8]/20 flex items-center justify-center text-[#ebcad8]">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-serif text-white">Relationship Sanctuary Settings</h2>
              <p className="text-xs text-white/50">Private preferences for our 3D world</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto flex-1 space-y-4 bg-[#231e33]/90">
          <div>
            <label className="text-[10px] text-white/40 uppercase font-semibold">Couple Island Title</label>
            <input
              type="text"
              required
              value={coupleName}
              onChange={(e) => setCoupleName(e.target.value)}
              className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs focus:outline-none focus:border-[#ebcad8]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-white/40 uppercase font-semibold">Partner 1</label>
              <input
                type="text"
                required
                value={partner1Name}
                onChange={(e) => setPartner1Name(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs focus:outline-none focus:border-[#ebcad8]"
              />
            </div>
            <div>
              <label className="text-[10px] text-white/40 uppercase font-semibold">Partner 2</label>
              <input
                type="text"
                required
                value={partner2Name}
                onChange={(e) => setPartner2Name(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs focus:outline-none focus:border-[#ebcad8]"
              />
            </div>
          </div>

          {/* Active Partner Switcher */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-[11px] text-white/50 mb-2">Switch Active Partner Profile:</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onSwitchRole('partner_1')}
                className={`py-2 rounded-xl text-xs font-medium transition-all ${
                  activeRole === 'partner_1'
                    ? 'bg-[#ebcad8] text-[#2c243b] shadow-md font-semibold'
                    : 'bg-white/5 text-white/60 hover:text-white'
                }`}
              >
                {partner1Name}
              </button>
              <button
                type="button"
                onClick={() => onSwitchRole('partner_2')}
                className={`py-2 rounded-xl text-xs font-medium transition-all ${
                  activeRole === 'partner_2'
                    ? 'bg-[#beb5e9] text-[#2c243b] shadow-md font-semibold'
                    : 'bg-white/5 text-white/60 hover:text-white'
                }`}
              >
                {partner2Name}
              </button>
            </div>
          </div>

          <div>
            <label className="text-[10px] text-white/40 uppercase font-semibold">Anniversary Start Date</label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs focus:outline-none focus:border-[#ebcad8]"
            />
          </div>

          <div>
            <label className="text-[10px] text-white/40 uppercase font-semibold">Island Tagline</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs focus:outline-none focus:border-[#ebcad8]"
            />
          </div>

          <div>
            <label className="text-[10px] text-white/40 uppercase font-semibold">Featured Relationship Quote</label>
            <textarea
              rows={3}
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              className="w-full mt-1 px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-serif leading-relaxed focus:outline-none focus:border-[#ebcad8]"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            {savedSuccess ? (
              <span className="text-xs text-emerald-300 flex items-center gap-1 font-medium">
                <Check className="w-3.5 h-3.5" />
                <span>Settings Saved!</span>
              </span>
            ) : (
              <span />
            )}

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#ebcad8] text-[#2c243b] font-medium text-xs shadow-md hover:opacity-90 active:scale-95 transition-all"
            >
              Save Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
