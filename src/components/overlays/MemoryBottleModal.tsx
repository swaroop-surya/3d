import React, { useState } from 'react';
import { X, Waves, Send, Sparkles } from 'lucide-react';
import { audioService } from '../../services/audioService';

interface MemoryBottleModalProps {
  onClose: () => void;
  partner1Name: string;
  partner2Name: string;
}

export const MemoryBottleModal: React.FC<MemoryBottleModalProps> = ({
  onClose,
  partner1Name,
  partner2Name,
}) => {
  const [currentMessage, setCurrentMessage] = useState(
    `"If love is an ocean, let this little island be our safe harbor forever. No matter how high the waves or how fast the world spins, my heart will always return to you."`
  );
  const [isWriting, setIsWriting] = useState(false);
  const [newMessage, setNewMessage] = useState('');

  const handleCast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setCurrentMessage(`"${newMessage.trim()}"`);
    audioService.playWaterSplash();
    setIsWriting(false);
    setNewMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in select-text">
      <div className="glass-panel w-full max-w-lg max-h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-white/20">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[#172535] to-[#201d33]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 flex items-center justify-center text-sky-300">
              <Waves className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-serif text-white">Drifting Glass Bottle</h2>
              <p className="text-xs text-sky-200/60">A message pulled from Crystal Lake</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scroll Body */}
        <div className="p-6 sm:p-8 flex flex-col items-center justify-center bg-[#1d2638]/90">
          <div className="w-full p-6 sm:p-8 rounded-3xl bg-[#fffcee] border border-amber-900/15 shadow-xl text-[#392e22] text-center relative">
            <div className="text-[11px] uppercase tracking-widest text-amber-900/40 font-semibold mb-3">
              Lake Wish Scroll
            </div>

            <p className="font-serif text-lg sm:text-xl italic leading-relaxed text-amber-950/90 whitespace-pre-wrap">
              {currentMessage}
            </p>

            <div className="mt-5 pt-3 border-t border-amber-900/10 flex items-center justify-center gap-1.5 text-xs text-amber-900/50">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>Cast into the waters between {partner1Name} & {partner2Name}</span>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={() => setIsWriting(!isWriting)}
              className="px-5 py-2.5 rounded-full bg-[#ebcad8] text-[#2c243b] text-xs font-semibold shadow-md hover:opacity-90 active:scale-95 transition-all"
            >
              Cast a New Note Into Lake
            </button>
          </div>
        </div>

        {/* Composer */}
        {isWriting && (
          <form onSubmit={handleCast} className="p-6 border-t border-white/10 bg-[#161c28] space-y-3">
            <div className="text-xs font-semibold text-[#ebcad8]">Write Message on Scroll</div>
            <textarea
              required
              rows={3}
              placeholder="What wish do you want the water to carry?..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-serif leading-relaxed focus:outline-none focus:border-[#ebcad8]"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsWriting(false)}
                className="px-3 py-1.5 text-xs text-white/50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-sky-400 text-[#16202c] text-xs font-semibold shadow-md"
              >
                Cork & Cast Bottle
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
