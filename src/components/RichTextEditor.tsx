import React, { useState, useRef } from 'react';
import { Bold, Italic, List, Heading1, Heading2, Quote, Code, Link as LinkIcon, Eye, Edit3 } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  label?: string;
}

export default function RichTextEditor({ value, onChange, placeholder = "Compile clinical text here...", label }: RichTextEditorProps) {
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Helper to insert markdown tags at selection
  const insertMarkdown = (prefix: string, suffix = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const selectedText = text.substring(start, end);
    const replacement = prefix + (selectedText || placeholder.replace('...', '')) + suffix;

    onChange(text.substring(0, start) + replacement + text.substring(end));

    // Refocus & select new text
    setTimeout(() => {
      textarea.focus();
      const selectionLen = selectedText ? selectedText.length : (replacement.length - prefix.length - suffix.length);
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectionLen);
    }, 10);
  };

  // Simple custom Markdown parser to output stylized HTML elements safely
  const renderMarkdownAsHtml = (md: string) => {
    if (!md) return <p className="text-slate-500 italic font-mono text-xs">No content compiled yet. Write some markdown above to view pre-rendered publication.</p>;
    
    // Split into paragraphs/blocks
    const lines = md.split('\n');
    let inList = false;
    let listItems: string[] = [];
    const elements: React.JSX.Element[] = [];

    const flushList = (key: string | number) => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${key}`} className="list-disc pl-5 mb-4 space-y-1.5 text-slate-300">
            {listItems.map((item, i) => (
              <li key={i} className="text-xs sm:text-sm" dangerouslySetInnerHTML={{ __html: parseLineFormatting(item) }} />
            ))}
          </ul>
        );
        listItems = [];
        inList = false;
      }
    };

    // Helper to parse bold, italic, code
    const parseLineFormatting = (text: string): string => {
      let formatted = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      
      // Bold **bold**
      formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-extrabold">$1</strong>');
      
      // Italic *italic* or _italic_
      formatted = formatted.replace(/\*(.*?)\*/g, '<em class="text-slate-200 italic">$1</em>');
      
      // Inline Code `code`
      formatted = formatted.replace(/`(.*?)`/g, '<code class="bg-slate-950 px-1.5 py-0.5 rounded text-pink-400 font-mono text-xs">$1</code>');
      
      // Link [text](url)
      formatted = formatted.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-cyan-400 hover:underline font-bold font-mono">$1</a>');

      return formatted;
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      // Bullet lists
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        inList = true;
        listItems.push(trimmed.substring(2));
        return;
      } else if (inList) {
        flushList(index);
      }

      // Headers
      if (trimmed.startsWith('# ')) {
        elements.push(
          <h1 key={index} className="text-lg sm:text-xl font-bold font-serif text-white border-b border-slate-900 pb-1.5 mt-5 mb-3 uppercase tracking-wide">
            {trimmed.substring(2)}
          </h1>
        );
      } else if (trimmed.startsWith('## ')) {
        elements.push(
          <h2 key={index} className="text-sm sm:text-md font-bold font-serif text-[#06b6d4] mt-4 mb-2 uppercase tracking-wider">
            {trimmed.substring(3)}
          </h2>
        );
      } else if (trimmed.startsWith('### ')) {
        elements.push(
          <h3 key={index} className="text-xs sm:text-sm font-bold font-serif text-emerald-400 mt-3 mb-1.5 uppercase">
            {trimmed.substring(4)}
          </h3>
        );
      } 
      // Blockquotes
      else if (trimmed.startsWith('> ')) {
        elements.push(
          <blockquote key={index} className="border-l-3 border-[#ec4899] bg-slate-950/40 p-3 pl-4 rounded-r-lg my-3 font-sans italic text-slate-300 text-xs sm:text-sm">
            {trimmed.substring(2)}
          </blockquote>
        );
      } 
      // Empty line
      else if (trimmed === '') {
        elements.push(<div key={index} className="h-2" />);
      } 
      // Standard Paragraph
      else {
        elements.push(
          <p key={index} className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans mb-3.5" dangerouslySetInnerHTML={{ __html: parseLineFormatting(trimmed) }} />
        );
      }
    });

    // Final flush lists if needed
    if (inList) {
      flushList('final');
    }

    return <div className="space-y-1 block align-top select-text">{elements}</div>;
  };

  return (
    <div className="flex flex-col gap-2.5 w-full">
      {label && (
        <div className="flex justify-between items-center bg-slate-950/40 px-1 py-0.5 rounded">
          <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">{label}</label>
          <span className="text-[9px] font-mono text-slate-500 uppercase">Framer Rich-Text Core v1.9</span>
        </div>
      )}

      {/* Main Container */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden focus-within:border-cyan-500/50 transition-all flex flex-col min-h-[260px]">
        
        {/* Editor Toolbar Header */}
        <div className="bg-slate-900/60 border-b border-slate-900/90 px-3 py-2 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => insertMarkdown('**', '**')}
              title="Bold Text (**)"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-850 cursor-pointer transition-colors"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('*', '*')}
              title="Italic Text (*)"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-850 cursor-pointer transition-colors"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <hr className="h-4 border-l border-slate-800 self-center" />
            <button
              type="button"
              onClick={() => insertMarkdown('# ')}
              title="Heading 1"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-850 cursor-pointer transition-colors"
            >
              <Heading1 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('## ')}
              title="Heading 2"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-850 cursor-pointer transition-colors"
            >
              <Heading2 className="w-3.5 h-3.5" />
            </button>
            <hr className="h-4 border-l border-slate-800 self-center" />
            <button
              type="button"
              onClick={() => insertMarkdown('- ')}
              title="Bullet List"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-850 cursor-pointer transition-colors"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('> ')}
              title="Block Quote"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-850 cursor-pointer transition-colors"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('`', '`')}
              title="Inline Code Block"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-850 cursor-pointer transition-colors"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('[Link Title](https://example.com)')}
              title="Add Hyperlink"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-850 cursor-pointer transition-colors"
            >
              <LinkIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Segmented write/preview controls */}
          <div className="bg-slate-950 border border-slate-850 rounded-lg p-0.5 flex gap-1 items-center shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('write')}
              className={`px-2.5 py-1 text-[10px] font-mono rounded cursor-pointer flex items-center gap-1 font-bold ${
                activeTab === 'write'
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/10'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Edit3 className="w-3 h-3" /> Write
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-2.5 py-1 text-[10px] font-mono rounded cursor-pointer flex items-center gap-0.5 font-bold ${
                activeTab === 'preview'
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/10'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" /> Preview
            </button>
          </div>
        </div>

        {/* Dynamic Editor Body Area */}
        <div className="flex-1 flex flex-col relative">
          
          {/* WRITE TAB */}
          <textarea
            ref={textareaRef}
            className={`w-full flex-1 min-h-[190px] max-h-[400px] p-4 text-xs font-mono text-slate-250 bg-transparent placeholder-slate-705 resize-y focus:outline-none focus:ring-0 leading-relaxed ${
              activeTab === 'write' ? 'block' : 'hidden'
            }`}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />

          {/* PREVIEW TAB */}
          <div
            className={`w-full flex-1 min-h-[190px] p-5 bg-slate-950/20 max-h-[400px] overflow-y-auto leading-relaxed text-slate-200 border-none select-text ${
              activeTab === 'preview' ? 'block' : 'hidden'
            }`}
          >
            {renderMarkdownAsHtml(value)}
          </div>
        </div>

      </div>
      <p className="text-[9px] font-mono text-slate-500 text-right">Markdown syntax supported: **bold**, *italics*, # headers, [links](url), - bullets</p>
    </div>
  );
}
