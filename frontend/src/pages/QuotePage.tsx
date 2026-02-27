import React, { useState, useEffect } from 'react';
import { ArrowLeft, Shuffle, Calendar, Save, Plus, Trash2 } from 'lucide-react';
import { useQuote } from '../hooks/useQuote';
import type { QuoteData } from '../db/schema';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

interface QuotePageProps {
  onBack: () => void;
}

const FONT_OPTIONS = [
  'Inter',
  'Poppins',
  'Roboto',
  'Open Sans',
  'Georgia',
  'serif',
  'Montserrat',
  'Lato',
  'Nunito',
  'Playfair Display',
  'Merriweather',
  'Source Sans 3',
  'JetBrains Mono',
  'Castellar',
];

const FONT_FAMILY_MAP: Record<string, string> = {
  'Inter': 'Inter, sans-serif',
  'Poppins': 'Poppins, sans-serif',
  'Roboto': 'Roboto, sans-serif',
  'Open Sans': 'Open Sans, sans-serif',
  'Georgia': 'Georgia, serif',
  'serif': 'serif',
  'Montserrat': 'Montserrat, sans-serif',
  'Lato': 'Lato, sans-serif',
  'Nunito': 'Nunito, sans-serif',
  'Playfair Display': 'Playfair Display, serif',
  'Merriweather': 'Merriweather, serif',
  'Source Sans 3': 'Source Sans 3, sans-serif',
  'JetBrains Mono': 'JetBrains Mono, monospace',
  'Castellar': 'Castellar, "Cinzel Decorative", Cinzel, serif',
};

export function QuotePage({ onBack }: QuotePageProps) {
  const { quote, loading, saveQuote } = useQuote();
  const [text, setText] = useState('');
  const [author, setAuthor] = useState('');
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>('center');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [fontSize, setFontSize] = useState(20);
  const [fontColor, setFontColor] = useState('#1e293b');
  const [backgroundBlur, setBackgroundBlur] = useState(false);
  const [rotateMode, setRotateMode] = useState<'none' | 'shuffle' | 'daily'>('none');
  const [quoteList, setQuoteList] = useState<Array<{ text: string; author?: string }>>([]);
  const [newQuoteText, setNewQuoteText] = useState('');
  const [newQuoteAuthor, setNewQuoteAuthor] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (quote) {
      setText(quote.text);
      setAuthor(quote.author || '');
      setAlignment(quote.alignment);
      setFontFamily(quote.fontFamily);
      setFontSize(quote.fontSize);
      setFontColor(quote.fontColor);
      setBackgroundBlur(quote.backgroundBlur);
      setRotateMode(quote.rotateMode);
      setQuoteList(quote.quoteList);
    }
  }, [quote]);

  const handleSave = async () => {
    setSaving(true);
    const updated: QuoteData = {
      ...(quote || {}),
      text,
      author: author || undefined,
      alignment,
      fontFamily,
      fontSize,
      fontColor,
      backgroundBlur,
      isActive: true,
      rotateMode,
      quoteList,
      lastRotated: quote?.lastRotated || Date.now(),
    };
    await saveQuote(updated);
    setSaving(false);
  };

  const addToList = () => {
    if (!newQuoteText.trim()) return;
    setQuoteList(prev => [...prev, { text: newQuoteText.trim(), author: newQuoteAuthor.trim() || undefined }]);
    setNewQuoteText('');
    setNewQuoteAuthor('');
  };

  const removeFromList = (idx: number) => {
    setQuoteList(prev => prev.filter((_, i) => i !== idx));
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-muted transition-colors" aria-label="Go back">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-xl font-bold">Quote & Motivation</h1>
      </div>

      {/* Live Preview */}
      <div
        className={`rounded-2xl border border-border/50 p-6 mb-4 min-h-[120px] flex flex-col items-center justify-center ${backgroundBlur ? 'backdrop-blur-sm bg-card/80' : 'bg-card'}`}
        style={{ textAlign: alignment }}
      >
        <p
          className="italic leading-relaxed"
          style={{ fontFamily: FONT_FAMILY_MAP[fontFamily] || fontFamily, fontSize: `${fontSize}px`, color: fontColor }}
        >
          "{text || 'Your quote will appear here...'}"
        </p>
        {author && (
          <p className="text-sm text-muted-foreground mt-2 not-italic" style={{ fontFamily: FONT_FAMILY_MAP[fontFamily] || fontFamily }}>
            — {author}
          </p>
        )}
      </div>

      {/* Editor */}
      <div className="bg-card rounded-xl border border-border/50 p-4 space-y-4 mb-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Quote Text</label>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Enter your quote..."
            className="w-full bg-muted/50 rounded-lg p-3 text-sm outline-none resize-none min-h-[80px] border border-border/50 focus:border-primary transition-colors"
            aria-label="Quote text"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Author (optional)</label>
          <Input value={author} onChange={e => setAuthor(e.target.value)} placeholder="Author name" aria-label="Author" />
        </div>

        {/* Alignment */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Alignment</label>
          <div className="flex gap-2">
            {(['left', 'center', 'right'] as const).map(a => (
              <button
                key={a}
                onClick={() => setAlignment(a)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors capitalize
                  ${alignment === a ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'}`}
                aria-label={`Align ${a}`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Font */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Font Family</label>
          <select
            value={fontFamily}
            onChange={e => setFontFamily(e.target.value)}
            className="w-full bg-muted/50 rounded-lg p-2 text-sm border border-border/50 outline-none"
            aria-label="Font family"
            style={{ fontFamily: FONT_FAMILY_MAP[fontFamily] || fontFamily }}
          >
            {FONT_OPTIONS.map(f => (
              <option key={f} value={f} style={{ fontFamily: FONT_FAMILY_MAP[f] || f }}>
                {f}
              </option>
            ))}
          </select>
        </div>

        {/* Font size */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Font Size: {fontSize}px</label>
          <Slider
            value={[fontSize]}
            onValueChange={([v]) => setFontSize(v)}
            min={12}
            max={36}
            step={1}
            aria-label="Font size"
          />
        </div>

        {/* Font color */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-muted-foreground">Font Color</label>
          <input
            type="color"
            value={fontColor}
            onChange={e => setFontColor(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer border border-border"
            aria-label="Font color"
          />
          <span className="text-xs text-muted-foreground">{fontColor}</span>
        </div>

        {/* Background blur */}
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-muted-foreground">Background Blur</label>
          <button
            onClick={() => setBackgroundBlur(!backgroundBlur)}
            className={`w-10 h-5 rounded-full transition-colors ${backgroundBlur ? 'bg-primary' : 'bg-muted'}`}
            role="switch"
            aria-checked={backgroundBlur}
            aria-label="Toggle background blur"
          >
            <span className={`block w-4 h-4 rounded-full bg-white shadow transition-transform mx-0.5 ${backgroundBlur ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* Rotate mode */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Rotation Mode</label>
          <div className="flex gap-2">
            {([
              { value: 'none', label: 'None', icon: null },
              { value: 'shuffle', label: 'Shuffle', icon: Shuffle },
              { value: 'daily', label: 'Daily', icon: Calendar },
            ] as const).map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setRotateMode(value)}
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium border transition-colors
                  ${rotateMode === value ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'}`}
                aria-label={`Set rotation to ${label}`}
              >
                {Icon && <Icon className="w-3 h-3" />}
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quote list */}
      <div className="bg-card rounded-xl border border-border/50 p-4 mb-4">
        <h3 className="text-sm font-semibold mb-3">Quote Library ({quoteList.length})</h3>
        <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
          {quoteList.map((q, idx) => (
            <div key={idx} className="flex items-start gap-2 p-2 bg-muted/50 rounded-lg">
              <div className="flex-1 min-w-0">
                <p className="text-xs line-clamp-2">"{q.text}"</p>
                {q.author && <p className="text-[10px] text-muted-foreground">— {q.author}</p>}
              </div>
              <button
                onClick={() => removeFromList(idx)}
                className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                aria-label={`Remove quote: ${q.text}`}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <textarea
            value={newQuoteText}
            onChange={e => setNewQuoteText(e.target.value)}
            placeholder="Add a quote to the library..."
            className="w-full bg-muted/50 rounded-lg p-2 text-xs outline-none resize-none border border-border/50 focus:border-primary transition-colors"
            rows={2}
            aria-label="New quote text"
          />
          <div className="flex gap-2">
            <Input
              value={newQuoteAuthor}
              onChange={e => setNewQuoteAuthor(e.target.value)}
              placeholder="Author (optional)"
              className="text-xs h-8"
              aria-label="New quote author"
            />
            <Button onClick={addToList} size="sm" className="h-8 gap-1" aria-label="Add quote to library">
              <Plus className="w-3 h-3" /> Add
            </Button>
          </div>
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving} className="w-full gap-2" aria-label="Save quote settings">
        <Save className="w-4 h-4" />
        {saving ? 'Saving...' : 'Save Quote'}
      </Button>
    </div>
  );
}
