import React, { useState } from 'react';
import { X, Heart, Sparkles, RefreshCw, Plus } from 'lucide-react';
import confetti from 'canvas-confetti';
import { LoveReason } from '../../types';
import { audioService } from '../../services/audioService';

interface LoveReasonsModalProps {
  reasons: LoveReason[];
  onClose: () => void;
  onAddReason: (reason: string, author: 'partner_1' | 'partner_2') => void;
  activeRole: 'partner_1' | 'partner_2';
  partner1Name: string;
  partner2Name: string;
}

export const LoveReasonsModal: React.FC<LoveReasonsModalProps> = ({
  reasons,
  onClose,
  onAddReason,
  activeRole,
  partner1Name,
  partner2Name,
}) => {
  const [currentReason, setCurrentReason] = useState<LoveReason>(
    reasons[Math.floor(Math.random() * reasons.length)] || reasons[0]
  );
  const [isUnfolding, setIsUnfolding] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newReasonText, setNewReasonText] = useState('');

  const drawRandom = () => {
    setIsUnfolding(true);
    audioService.playPageTurn();

    // Trigger sweet heart / pastel confetti
    confetti({
      particleCount: 25,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#ebcad8', '#beb5e9', '#f2dce6', '#fff5e9'],
    });

    setTimeout(() => {
      const remaining = reasons.filter((r) => r.id !== currentReason.id);
      const next =
        remaining.length > 0
          ? remaining[Math.floor(Math.random() * remaining.length)]
          : reasons[0];
      setCurrentReason(next);
      setIsUnfolding(false);
    }, 300);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReasonText.trim()) return;

    onAddReason(newReasonText.trim(), activeRole);
    setShowAddForm(false);
    setNewReasonText('');
    audioService.playChime(1.2);
  };

  const authorName =
    currentReason?.author === 'partner_1' ? partner1Name : partner2Name;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in select-text">
      <div className="glass-panel w-full max-w-lg max-h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-white/20">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[#3b2333] to-[#261d36]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 flex items-center justify-center text-rose-300">
              <Heart className="w-5 h-5 fill-rose-400" />
            </div>
            <div>
              <h2 className="text-xl font-serif text-white">Reasons Why I Love You</h2>
              <p className="text-xs text-rose-200/60">Our little jar of infinite fondness ({reasons.length} slips)</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Center Paper Slip Card */}
        <div className="p-6 sm:p-8 flex flex-col items-center justify-center text-center bg-[#251e36]">
          <div
            className={`w-full max-w-sm p-6 sm:p-8 rounded-3xl shadow-2xl border transition-all duration-300 relative ${
              isUnfolding ? 'scale-90 opacity-60 rotate-2' : 'scale-100 opacity-100 rotate-0'
            }`}
            style={{
              backgroundColor: currentReason?.color_tag || '#FFF5E9',
              color: '#38283a',
              borderColor: 'rgba(0,0,0,0.08)',
            }}
          >
            {/* Little washi tape effect on top of slip */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-5 bg-white/40 backdrop-blur-sm rounded-sm border border-black/5 rotate-1" />

            <div className="text-[11px] uppercase tracking-widest text-black/50 font-semibold mb-3">
              Reason Written by {authorName}
            </div>

            <p className="font-serif text-xl sm:text-2xl leading-relaxed italic text-black/90 min-h-[90px] flex items-center justify-center">
              &ldquo;{currentReason?.reason}&rdquo;
            </p>

            <div className="mt-4 pt-3 border-t border-black/10 flex items-center justify-center gap-1 text-[11px] text-black/40">
              <Sparkles className="w-3 h-3 text-rose-500" />
              <span>Folded with love</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={drawRandom}
              className="px-5 py-2.5 rounded-full bg-[#ebcad8] text-[#2c243b] text-xs font-semibold shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Draw Another Reason</span>
            </button>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Slip</span>
            </button>
          </div>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <form onSubmit={handleAdd} className="p-6 border-t border-white/10 bg-[#1c172a] space-y-3">
            <div className="text-xs font-semibold text-[#ebcad8]">Slip a New Reason into the Jar</div>
            <textarea
              required
              rows={3}
              placeholder="I love the way you..."
              value={newReasonText}
              onChange={(e) => setNewReasonText(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-serif leading-relaxed focus:outline-none focus:border-[#ebcad8]"
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
                Fold & Place in Jar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
