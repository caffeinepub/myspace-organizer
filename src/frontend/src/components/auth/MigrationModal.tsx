import { Upload } from "lucide-react";
import React from "react";
import { useSyncService } from "../../hooks/useSyncService";
import { showSuccessToast } from "../../store/toastStore";
import { Modal } from "../common/Modal";

interface MigrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MIGRATION_SKIPPED_KEY = "ii_migration_skipped";

export function MigrationModal({ isOpen, onClose }: MigrationModalProps) {
  const { syncToBackend, isSyncing } = useSyncService();

  const handleUpload = async () => {
    await syncToBackend();
    showSuccessToast("Data synced to your account ✓");
    localStorage.setItem(MIGRATION_SKIPPED_KEY, "true");
    onClose();
  };

  const handleSkip = () => {
    localStorage.setItem(MIGRATION_SKIPPED_KEY, "true");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleSkip}
      title="Migrate your data"
      size="sm"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Upload className="w-5 h-5 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            You have existing data on this device. Would you like to upload it
            to your account so it's accessible on any device?
          </p>
        </div>
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={handleUpload}
            disabled={isSyncing}
            data-ocid="migration.confirm_button"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isSyncing ? "Uploading..." : "Upload to my account"}
          </button>
          <button
            type="button"
            onClick={handleSkip}
            data-ocid="migration.cancel_button"
            className="px-4 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
          >
            Skip
          </button>
        </div>
      </div>
    </Modal>
  );
}

export { MIGRATION_SKIPPED_KEY };
