import { useState, useEffect, useCallback } from 'react';
import { db } from '../db/db';
import type { QuoteData } from '../db/schema';
import { showSuccessToast, showErrorToast } from '../store/toastStore';
import { isSameDay } from 'date-fns';

export function useQuote() {
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      // Get active quote or first quote
      const all = await db.quotes.toArray();
      const active = all.find(q => q.isActive) || all[0] || null;
      setQuote(active);
    } catch {
      showErrorToast('Failed to load quote');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const saveQuote = useCallback(async (updated: QuoteData) => {
    try {
      if (updated.id) {
        await db.quotes.put(updated);
      } else {
        const id = await db.quotes.add(updated);
        updated = { ...updated, id };
      }
      setQuote(updated);
      showSuccessToast('Quote saved!');
    } catch {
      showErrorToast('Failed to save quote');
    }
  }, []);

  const rotateQuote = useCallback(async () => {
    if (!quote || quote.quoteList.length === 0) return;
    try {
      let newQuote = quote;
      if (quote.rotateMode === 'shuffle') {
        const idx = Math.floor(Math.random() * quote.quoteList.length);
        const picked = quote.quoteList[idx];
        newQuote = { ...quote, text: picked.text, author: picked.author, lastRotated: Date.now() };
      } else if (quote.rotateMode === 'daily') {
        if (!quote.lastRotated || !isSameDay(new Date(quote.lastRotated), new Date())) {
          const idx = Math.floor(Math.random() * quote.quoteList.length);
          const picked = quote.quoteList[idx];
          newQuote = { ...quote, text: picked.text, author: picked.author, lastRotated: Date.now() };
        }
      }
      if (newQuote !== quote) {
        await db.quotes.put(newQuote);
        setQuote(newQuote);
      }
    } catch {
      showErrorToast('Failed to rotate quote');
    }
  }, [quote]);

  return { quote, loading, saveQuote, rotateQuote, reload: load };
}
