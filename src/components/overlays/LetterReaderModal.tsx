import React, { useState } from 'react';
import { X, Send, Heart, Mail, Clock, Lock, Sparkles } from 'lucide-react';
import { LoveLetter } from '../../types';
import { audioService } from '../../services/audioService';

interface LetterReaderModalProps {
  letters: LoveLetter[];
  activeLetterId?: string;
  onClose: () => void;
  onSendLetter: (letter: Omit<LoveLetter, 'id' | 'created_at' | 'is_read'>) => void;
  onMarkAsRead: (id: string) => void;
  activeRole: 'partner_1' | 'partner_2';
  partner1Name: string;
  partner2Name: string;
}

export const LetterReaderModal: React.FC<LetterReaderModalProps> = ({
  letters,
  activeLetterId,
  onClose,
  onSendLetter,
  onMarkAsRead,
  activeRole,
  partner1Name,
  partner2Name,
}) => {
  const [selectedId, setSelectedId] = useState<string>(activeLetterId || letters[0]?.id || '');
  const [isComposing, setIsComposing] = useState(false);
  const [isOpenAnimation, setIsOpenAnimation] = useState(false);

  // New Letter State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [waxColor, setWaxColor] = useState<'rose' | 'lavender' | 'gold' | 'sky'>('rose');
  const [openWhenPrompt, setOpenWhenPrompt] = useState('');

  const activeLetter = letters.find((l) => l.id === selectedId);

  const handleSelectLetter = (id: string) => {
    setSelectedId(id);
    setIsComposing(false);
    setIsOpenAnimation(true);
    audioService.playPageTurn();
    setTimeout(() => setIsOpenAnimation(false), 500);
    onMarkAsRead(id);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    onSendLetter({
      sender: activeRole,
      recipient: activeRole === 'partner_1' ? 'partner_2' : 'partner_1',
      title,
      content,
      wax_seal_color: waxColor,
      open_when_prompt: openWhenPrompt.trim() || undefined,
    });

    audioService.playChime(1.2);
    setIsComposing(false);
    setTitle('');
    setContent('');
    setOpenWhenPrompt('');
  };

  const getWaxColorStyle = (color: string) => {
    switch (color) {
      case 'rose':
        return 'bg-rose-700 border-rose-400 text-rose-100 shadow-rose-900/50';
      case 'lavender':
        return 'bg-purple-700 border-purple-400 text-purple-100 shadow-purple-900/50';
      case 'gold':
        return 'bg-amber-600 border-amber-300 text-amber-100 shadow-amber-900/50';
      case 'sky':
        return 'bg-sky-700 border-sky-400 text-sky-100 shadow-sky-900/50';
      default:
        return 'bg-rose-700 border-rose-400 text-rose-100';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in select-text">
      <div className="glass-panel w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl border border-white/20">
        {/* Left Sidebar: Letters Inbox */}
        <div className="md:w-1/3 bg-[#1d192c]/90 border-r border-white/10 p-5 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#ebcad8]" />
                <h3 className="font-serif text-lg text-white">Love Letters</h3>
              </div>
              <button
                onClick={() => setIsComposing(true)}
                className="px-3 py-1.5 rounded-full bg-[#ebcad8]/20 hover:bg-[#ebcad8]/30 border border-[#ebcad8]/40 text-xs text-[#fff5e9] font-medium transition-all"
              >
                + Write
              </button>
            </div>

            <div className="space-y-2">
              {letters.map((letItem) => {
                const isSelected = !isComposing && letItem.id === selectedId;
                const senderName =
                  letItem.sender === 'partner_1' ? partner1Name : partner2Name;
                return (
                  <button
                    key={letItem.id}
                    onClick={() => handleSelectLetter(letItem.id)}
                    className={`w-full p-3 rounded-2xl text-left border transition-all ${
                      isSelected
                        ? 'bg-[#ebcad8]/20 border-[#ebcad8] shadow-md'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/70'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-semibold text-[#ebcad8]">
                        From {senderName}
                      </span>
                      {!letItem.is_read && (
                        <span className="w-2 h-2 rounded-full bg-rose-400 shadow-sm" />
                      )}
                    </div>
                    <div className="text-xs font-serif text-white truncate font-medium">
                      {letItem.title}
                    </div>
                    {letItem.open_when_prompt && (
                      <div className="text-[10px] text-white/50 italic mt-0.5 truncate">
                        🏷️ {letItem.open_when_prompt}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 text-[11px] text-white/40 italic text-center">
            &ldquo;Every sealed letter is a piece of forever.&rdquo;
          </div>
        </div>

        {/* Right Content Area: Parchment Paper Reader or Letter Composer */}
        <div className="md:w-2/3 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto bg-[#2a243d]/80 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {isComposing ? (
            /* Composer */
            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <h3 className="text-xl font-serif text-white mb-1">Write a Love Letter</h3>
                <p className="text-xs text-white/60">
                  Seal your thoughts in virtual parchment and deliver it across the island.
                </p>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">
                  Letter Title / Subject
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Open when you need a smile..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-[#ebcad8]"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">
                  Special Prompt (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Open on a rainy afternoon, Open when we are apart..."
                  value={openWhenPrompt}
                  onChange={(e) => setOpenWhenPrompt(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs focus:outline-none focus:border-[#ebcad8]"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">
                  Wax Seal Color
                </label>
                <div className="flex items-center gap-3 mt-1.5">
                  {(['rose', 'lavender', 'gold', 'sky'] as const).map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setWaxColor(color)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform capitalize ${getWaxColorStyle(
                        color
                      )} ${waxColor === color ? 'scale-125 ring-2 ring-white' : 'opacity-70'}`}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">
                  Message Body
                </label>
                <textarea
                  required
                  rows={8}
                  placeholder="My dearest..."
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
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#ebcad8] to-[#beb5e9] text-[#2c243b] font-medium text-xs shadow-lg flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Seal & Send Letter</span>
                </button>
              </div>
            </form>
          ) : activeLetter ? (
            /* Letter Parchment View */
            <div
              className={`bg-[#fffbf2] text-[#3d3345] p-6 sm:p-8 rounded-2xl shadow-xl border border-amber-100/60 relative overflow-hidden transition-all duration-300 ${
                isOpenAnimation ? 'scale-95 opacity-80' : 'scale-100 opacity-100'
              }`}
            >
              {/* Wax Seal Stamp in Header */}
              <div className="flex items-center justify-between border-b border-amber-900/15 pb-4 mb-5">
                <div>
                  {activeLetter.open_when_prompt && (
                    <div className="text-xs font-serif italic text-amber-900/60 mb-1">
                      🏷️ {activeLetter.open_when_prompt}
                    </div>
                  )}
                  <h2 className="text-2xl font-serif font-bold text-amber-950">
                    {activeLetter.title}
                  </h2>
                  <div className="text-xs text-amber-900/50 mt-1">
                    {new Date(activeLetter.created_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                </div>

                {/* Wax Seal */}
                <div
                  className={`w-12 h-12 rounded-full border-2 flex items-center justify-center shadow-md font-serif text-xs font-bold ${getWaxColorStyle(
                    activeLetter.wax_seal_color
                  )}`}
                >
                  <Heart className="w-5 h-5 fill-current" />
                </div>
              </div>

              {/* Letter Content */}
              <div className="font-serif text-base sm:text-lg leading-relaxed text-amber-950/90 whitespace-pre-wrap min-h-[220px]">
                {activeLetter.content}
              </div>

              {/* Footer Signature */}
              <div className="mt-8 pt-4 border-t border-amber-900/15 flex items-center justify-between text-xs text-amber-900/60 font-serif">
                <span>With all my love</span>
                <span className="font-bold text-sm text-amber-950">
                  {activeLetter.sender === 'partner_1' ? partner1Name : partner2Name}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center text-white/50">
              <Mail className="w-12 h-12 mb-3 text-white/30" />
              <p>No letter selected yet. Choose one from the left or write a new one.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
