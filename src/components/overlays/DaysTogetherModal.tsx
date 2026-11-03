import React, { useState, useEffect } from 'react';
import { X, Flame, Heart, Calendar, Sparkles, Plus, Award } from 'lucide-react';
import { RelationshipSettings, SpecialDate } from '../../types';

interface DaysTogetherModalProps {
  settings: RelationshipSettings;
  specialDates: SpecialDate[];
  onClose: () => void;
  onAddSpecialDate: (date: Omit<SpecialDate, 'id'>) => void;
}

export const DaysTogetherModal: React.FC<DaysTogetherModalProps> = ({
  settings,
  specialDates,
  onClose,
  onAddSpecialDate,
}) => {
  const [now, setNow] = useState(new Date());
  const [showAddDate, setShowAddDate] = useState(false);

  // New Milestone State
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<SpecialDate['category']>('milestone');
  const [description, setDescription] = useState('');

  // Live tick every second
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const startDate = new Date(settings.start_date);
  const diffMs = Math.max(0, now.getTime() - startDate.getTime());

  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const years = Math.floor(totalDays / 365);
  const remainingDaysAfterYears = totalDays % 365;
  const months = Math.floor(remainingDaysAfterYears / 30);
  const days = remainingDaysAfterYears % 30;

  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
  const seconds = Math.floor((diffMs / 1000) % 60);

  const handleAddDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddSpecialDate({
      title,
      date,
      category,
      description,
    });

    setShowAddDate(false);
    setTitle('');
    setDescription('');
  };

  const sortedDates = [...specialDates].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in select-text">
      <div className="glass-panel w-full max-w-2xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-white/20">
        {/* Header with Warm Fireplace Theme */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[#3b2123] to-[#241a33]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300">
              <Flame className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-serif text-white">The Hearth of Us</h2>
              <p className="text-xs text-amber-200/60">
                Together since {new Date(settings.start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Counter Display */}
        <div className="p-6 border-b border-white/10 bg-black/20 flex flex-col items-center text-center">
          <div className="text-xs uppercase tracking-widest text-[#ebcad8] font-semibold mb-3 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 fill-[#ebcad8]" />
            <span>Loving Each Other For</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3 w-full max-w-xl">
            {[
              { val: years, label: 'Years' },
              { val: months, label: 'Months' },
              { val: days, label: 'Days' },
              { val: hours, label: 'Hours' },
              { val: minutes, label: 'Minutes' },
              { val: seconds, label: 'Seconds' },
            ].map((unit, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center shadow-inner"
              >
                <span className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-wider">
                  {unit.val}
                </span>
                <span className="text-[10px] text-white/50 uppercase tracking-wider mt-0.5">
                  {unit.label}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 text-xs font-serif italic text-white/60">
            That&rsquo;s <strong className="text-amber-300 font-sans">{totalDays.toLocaleString()}</strong> continuous days of laughter, warmth, and shared dreams.
          </div>
        </div>

        {/* Milestone Timeline */}
        <div className="p-6 overflow-y-auto flex-1 bg-[#231e33]/90">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-semibold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#ebcad8]" />
              <span>Relationship Milestones</span>
            </div>
            <button
              onClick={() => setShowAddDate(!showAddDate)}
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs text-white flex items-center gap-1 transition-all"
            >
              <Plus className="w-3 h-3" />
              <span>Add Date</span>
            </button>
          </div>

          {showAddDate && (
            <form onSubmit={handleAddDate} className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/15 space-y-3">
              <div className="text-xs font-semibold text-[#ebcad8]">New Relationship Milestone</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Milestone title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs focus:outline-none focus:border-[#ebcad8]"
                />
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs focus:outline-none focus:border-[#ebcad8]"
                />
              </div>
              <input
                type="text"
                placeholder="Description / memory note..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs focus:outline-none focus:border-[#ebcad8]"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddDate(false)}
                  className="px-3 py-1.5 text-xs text-white/50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[#ebcad8] text-[#2c243b] text-xs font-semibold shadow-md"
                >
                  Save Milestone
                </button>
              </div>
            </form>
          )}

          <div className="relative border-l-2 border-white/15 ml-4 pl-6 space-y-6">
            {sortedDates.map((item) => (
              <div key={item.id} className="relative group">
                {/* Dot marker */}
                <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-[#ebcad8] border-2 border-[#231e33] shadow" />

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:border-[#ebcad8]/40 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-serif font-bold text-white text-sm">
                      {item.title}
                    </span>
                    <span className="text-[11px] text-[#ebcad8] font-medium">
                      {item.date}
                    </span>
                  </div>
                  {item.description && (
                    <p className="text-xs text-white/70 font-serif leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
