import React, { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  accentColor?: 'cyan' | 'emerald' | 'amber';
}

export default function TagInput({ tags = [], onChange, placeholder = "Type tag and press comma...", accentColor = "cyan" }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const addTag = (text: string) => {
    const trimmed = text.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInputValue('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      addTag(inputValue);
    }
  };

  const removeTag = (indexToRemove: number) => {
    const updated = tags.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
  };

  const schemes = {
    cyan: {
      bg: 'bg-cyan-950/40 border-cyan-500/20 text-cyan-400',
      xHover: 'hover:bg-cyan-500/20 hover:text-cyan-200',
      focusBorder: 'focus-within:border-cyan-500',
    },
    emerald: {
      bg: 'bg-emerald-950/40 border-emerald-500/20 text-emerald-400',
      xHover: 'hover:bg-emerald-500/20 hover:text-emerald-200',
      focusBorder: 'focus-within:border-emerald-500',
    },
    amber: {
      bg: 'bg-amber-950/40 border-amber-500/20 text-amber-400',
      xHover: 'hover:bg-amber-500/20 hover:text-amber-200',
      focusBorder: 'focus-within:border-amber-500',
    }
  };

  const currentScheme = schemes[accentColor] || schemes.cyan;

  return (
    <div className={`flex flex-wrap items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-2.5 transition-all min-h-[42px] ${currentScheme.focusBorder}`}>
      {tags.map((tag, idx) => (
        <span
          key={idx}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border uppercase tracking-wider font-semibold shadow-inner transition-all ${currentScheme.bg}`}
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(idx)}
            className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors cursor-pointer ${currentScheme.xHover}`}
          >
            <X className="w-2.5 h-2.5" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          if (inputValue.trim()) {
            addTag(inputValue);
          }
        }}
        placeholder={tags.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[120px] bg-transparent text-xs text-white focus:outline-none placeholder-slate-700 font-sans"
      />
    </div>
  );
}
