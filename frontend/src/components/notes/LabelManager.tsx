import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { useLabels } from '../../hooks/useLabels';
import { Modal } from '../common/Modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const LABEL_COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#f43f5e', '#0ea5e9', '#14b8a6', '#f97316'];

interface LabelManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LabelManager({ isOpen, onClose }: LabelManagerProps) {
  const { labels, createLabel, updateLabel, deleteLabel } = useLabels();
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(LABEL_COLORS[0]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await createLabel(newName.trim(), newColor);
    setNewName('');
  };

  const handleUpdate = async (id: number) => {
    const label = labels.find(l => l.id === id);
    if (!label || !editName.trim()) return;
    await updateLabel({ ...label, name: editName.trim() });
    setEditingId(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Labels" size="md">
      <div className="space-y-4">
        {/* Create new label */}
        <div className="flex gap-2">
          <Input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            placeholder="New label name"
            className="flex-1"
            aria-label="New label name"
          />
          <div className="flex gap-1">
            {LABEL_COLORS.slice(0, 4).map(c => (
              <button
                key={c}
                onClick={() => setNewColor(c)}
                className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${newColor === c ? 'border-foreground scale-110' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
                aria-label={`Select color ${c}`}
              />
            ))}
          </div>
          <Button onClick={handleCreate} size="sm" className="gap-1" aria-label="Create label">
            <Plus className="w-3 h-3" />
          </Button>
        </div>

        {/* Labels list */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {labels.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No labels yet</p>
          ) : (
            labels.map(label => (
              <div key={label.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: label.color }} />
                {editingId === label.id ? (
                  <Input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleUpdate(label.id!); if (e.key === 'Escape') setEditingId(null); }}
                    className="flex-1 h-7 text-xs"
                    autoFocus
                    aria-label={`Edit label name for ${label.name}`}
                  />
                ) : (
                  <span className="flex-1 text-sm">{label.name}</span>
                )}
                {editingId === label.id ? (
                  <div className="flex gap-1">
                    <button onClick={() => handleUpdate(label.id!)} className="p-1 text-primary hover:bg-primary/10 rounded" aria-label="Save label name">
                      <Check className="w-3 h-3" />
                    </button>
                    <button onClick={() => setEditingId(null)} className="p-1 text-muted-foreground hover:bg-muted rounded" aria-label="Cancel edit">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-1">
                    <button
                      onClick={() => { setEditingId(label.id!); setEditName(label.name); }}
                      className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                      aria-label={`Edit label ${label.name}`}
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => label.id && deleteLabel(label.id)}
                      className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                      aria-label={`Delete label ${label.name}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}
