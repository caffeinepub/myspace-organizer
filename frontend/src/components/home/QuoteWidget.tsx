import React from 'react';
import { Quote, ChevronRight } from 'lucide-react';
import { useQuote } from '../../hooks/useQuote';

interface QuoteWidgetProps {
  onNavigate: () => void;
}

export function QuoteWidget({ onNavigate }: QuoteWidgetProps) {
  const { quote } = useQuote();

  return (
    <button
      onClick={onNavigate}
      className="w-full bg-card rounded-xl border border-border/50 p-4 text-left hover:shadow-card-hover transition-all duration-150 active:scale-[0.98]"
      aria-label="Quote widget, tap to edit"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
            <Quote className="w-4 h-4 text-violet-500" />
          </div>
          <span className="font-semibold text-sm">Daily Quote</span>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </div>

      {quote ? (
        <div
          className="text-sm leading-relaxed"
          style={{
            textAlign: quote.alignment,
            fontFamily: quote.fontFamily,
            fontSize: `${Math.min(quote.fontSize, 18)}px`,
            color: quote.fontColor,
          }}
        >
          <p className="italic">"{quote.text}"</p>
          {quote.author && (
            <p className="text-xs text-muted-foreground mt-1 not-italic">— {quote.author}</p>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic">Tap to add your first quote...</p>
      )}
    </button>
  );
}
