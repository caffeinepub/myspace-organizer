/**
 * Quotes collection page with add/edit/delete, favorite toggle, and random quote display.
 * Primary CTA buttons use the accent color. Timestamps shown in "DD MMM YYYY, h:mm A" format.
 */
import React, { useState } from 'react';
import { useDataStore, Quote } from '../store/dataStore';
import { formatDateTime } from '../utils/formatDateTime';
import { Plus, Trash2, Heart, X, Quote as QuoteIcon, Shuffle } from 'lucide-react';
import { toast } from 'sonner';

export default function QuotePage() {
  const { quotes, addQuote, updateQuote, deleteQuote } = useDataStore();
  const [showForm, setShowForm] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');
  const [featured, setFeatured] = useState<Quote | null>(
    quotes.length > 0 ? quotes[Math.floor(Math.random() * quotes.length)] : null
  );
  const [form, setForm] = useState({ text: '', author: '' });

  const filtered = filter === 'favorites' ? quotes.filter((q) => q.isFavorite) : quotes;

  const resetForm = () => {
    setForm({ text: '', author: '' });
    setEditingQuote(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.text.trim()) {
      toast.error('Quote text is required');
      return;
    }
    if (editingQuote) {
      updateQuote(editingQuote.id, form);
      toast.success('Quote updated');
    } else {
      addQuote({ ...form, isFavorite: false });
      toast.success('Quote saved');
    }
    resetForm();
  };

  const handleEdit = (quote: Quote) => {
    setForm({ text: quote.text, author: quote.author });
    setEditingQuote(quote);
    setShowForm(true);
  };

  const handleShuffle = () => {
    if (quotes.length === 0) return;
    const random = quotes[Math.floor(Math.random() * quotes.length)];
    setFeatured(random);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quotes</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all"
          style={{ background: 'var(--accent)', color: 'var(--accent-text, #1a1a1a)' }}
        >
          <Plus className="w-4 h-4" />
          Add Quote
        </button>
      </div>

      {/* Featured Quote */}
      {featured && (
        <div
          className="rounded-2xl p-6 relative"
          style={{
            background: 'linear-gradient(135deg, var(--accent-soft), transparent)',
            border: '1px solid var(--accent)',
          }}
        >
          <QuoteIcon className="w-8 h-8 mb-3 opacity-40" style={{ color: 'var(--accent)' }} />
          <p className="text-lg font-medium italic leading-relaxed">"{featured.text}"</p>
          {featured.author && (
            <p className="text-sm text-muted-foreground mt-2">— {featured.author}</p>
          )}
          <button
            onClick={handleShuffle}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <Shuffle className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          </button>
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-card rounded-xl border border-border/50 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">{editingQuote ? 'Edit Quote' : 'New Quote'}</h3>
            <button onClick={resetForm} className="p-1 hover:bg-muted/50 rounded">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Quote *
              </label>
              <textarea
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
                placeholder="Enter quote text..."
                rows={3}
                className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 resize-none"
                style={{ '--tw-ring-color': 'var(--accent)' } as React.CSSProperties}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Author</label>
              <input
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                placeholder="e.g. Mark Twain"
                className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': 'var(--accent)' } as React.CSSProperties}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-lg text-sm border border-border/50 hover:bg-muted/50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{ background: 'var(--accent)', color: 'var(--accent-text, #1a1a1a)' }}
              >
                {editingQuote ? 'Update' : 'Save Quote'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2">
        {(['all', 'favorites'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-4 py-1.5 rounded-full text-sm font-medium transition-all border"
            style={
              filter === f
                ? {
                    background: 'var(--accent-soft)',
                    borderColor: 'var(--accent)',
                    color: 'var(--accent)',
                  }
                : { borderColor: 'var(--border)', color: 'var(--muted-foreground)' }
            }
          >
            {f === 'all' ? 'All' : '❤️ Favorites'}
          </button>
        ))}
      </div>

      {/* Quotes List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <QuoteIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No quotes yet</p>
          <p className="text-sm">Add your favorite quotes!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((quote) => (
            <div
              key={quote.id}
              className="bg-card rounded-xl border border-border/50 p-4"
            >
              <p className="italic text-sm leading-relaxed">"{quote.text}"</p>
              {quote.author && (
                <p className="text-xs text-muted-foreground mt-1">— {quote.author}</p>
              )}
              <div className="flex items-center justify-between mt-3">
                <span className="text-[10px] text-muted-foreground">
                  {formatDateTime(quote.createdAt)}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => updateQuote(quote.id, { isFavorite: !quote.isFavorite })}
                    className="p-1.5 rounded-lg transition-colors"
                    style={quote.isFavorite ? { color: 'var(--accent)' } : {}}
                  >
                    <Heart
                      className="w-4 h-4"
                      fill={quote.isFavorite ? 'var(--accent)' : 'none'}
                    />
                  </button>
                  <button
                    onClick={() => handleEdit(quote)}
                    className="p-1.5 hover:bg-muted/50 rounded-lg transition-colors text-muted-foreground"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => {
                      deleteQuote(quote.id);
                      toast.success('Quote deleted');
                    }}
                    className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
