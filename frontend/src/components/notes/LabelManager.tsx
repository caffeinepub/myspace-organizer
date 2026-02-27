import React, { useState } from 'react';
import { X, Plus, Edit2, Trash2, Check, Tag, AlertTriangle } from 'lucide-react';
import { useLabels } from '../../hooks/useLabels';
import { useNotes } from '../../hooks/useNotes';
import type { Label } from '../../db/schema';

interface LabelManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LabelManager({ isOpen, onClose }: LabelManagerProps) {
  const { labels, createLabel, updateLabel, deleteLabel } = useLabels();
  const { bulkReassignLabel } = useNotes();
  const [newLabelName, setNewLabelName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const isReserved = (name: string) => name.trim().toLowerCase() === 'all';

  const handleCreate = async () => {
    if (!newLabelName.trim()) return;
    if (isReserved(newLabelName)) return;
    await createLabel(newLabelName.trim());
    setNewLabelName('');
  };

  const handleStartEdit = (label: Label) => {
    if (isReserved(label.name)) return;
    if (label.id === undefined) return;
    setEditingId(label.id);
    setEditingName(label.name);
  };

  const handleSaveEdit = async () => {
    if (!editingName.trim() || editingId === null) return;
    if (isReserved(editingName)) return;
    const label = labels.find(l => l.id === editingId);
    if (!label) return;
    await updateLabel({ ...label, name: editingName.trim() });
    setEditingId(null);
    setEditingName('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleRequestDelete = (id: number) => {
    setConfirmDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (confirmDeleteId === null) return;
    setIsDeleting(true);
    try {
      await deleteLabel(confirmDeleteId, bulkReassignLabel);
    } finally {
      setIsDeleting(false);
      setConfirmDeleteId(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDeleteId(null);
  };

  const confirmLabel = labels.find(l => l.id === confirmDeleteId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      {/* Delete confirmation overlay */}
      {confirmDeleteId !== null && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60">
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-5">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle size={20} className="text-destructive shrink-0" />
              <h3 className="font-semibold text-foreground">Delete label?</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-5">
              The label <span className="font-medium text-foreground">"{confirmLabel?.name}"</span> will be removed from all notes. This cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleCancelDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg text-sm hover:bg-muted transition-colors text-muted-foreground disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg text-sm bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting && (
                  <span className="w-3 h-3 border-2 border-destructive-foreground border-t-transparent rounded-full animate-spin" />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Tag size={18} className="text-accent" />
            <h2 className="font-semibold text-foreground">Manage Labels</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted transition-colors">
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>

        <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
          {labels.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No labels yet. Add one below.</p>
          )}
          {labels.map(label => {
            const reserved = isReserved(label.name);
            return (
              <div key={label.id} className="flex items-center gap-2 group">
                {editingId === label.id ? (
                  <>
                    <input
                      value={editingName}
                      onChange={e => setEditingName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleSaveEdit();
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveEdit}
                      className="p-1.5 rounded-lg bg-accent text-accent-foreground hover:opacity-90 transition-opacity"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                    >
                      <X size={14} className="text-muted-foreground" />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm text-foreground">{label.name}</span>
                    {!reserved && (
                      <>
                        <button
                          onClick={() => handleStartEdit(label)}
                          className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-muted transition-all"
                          title="Rename label"
                        >
                          <Edit2 size={14} className="text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => label.id !== undefined && handleRequestDelete(label.id)}
                          className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-all"
                          title="Delete label"
                        >
                          <Trash2 size={14} className="text-destructive" />
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <input
              value={newLabelName}
              onChange={e => setNewLabelName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              placeholder="New label name..."
              className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button
              onClick={handleCreate}
              disabled={!newLabelName.trim() || isReserved(newLabelName)}
              className="px-3 py-2 rounded-lg bg-accent text-accent-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
