import { Camera, Eye, EyeOff, File, Paperclip, X } from "lucide-react";
import { useRef, useState } from "react";
import type { LockerEntry } from "./lockerStorage";

interface Props {
  entry?: LockerEntry;
  onSave: (entry: LockerEntry) => void;
  onClose: () => void;
}

type EntryType = "password" | "email" | "note" | "file";

const TYPE_LABELS: Record<EntryType, string> = {
  password: "🔑 Password",
  email: "📧 Email",
  note: "📝 Secure Note",
  file: "📁 File/Camera",
};

export function LockerEntryForm({ entry, onSave, onClose }: Props) {
  const [type, setType] = useState<EntryType>(entry?.type ?? "password");
  const [title, setTitle] = useState(entry?.title ?? "");
  const [username, setUsername] = useState(entry?.username ?? "");
  const [password, setPassword] = useState(entry?.password ?? "");
  const [url, setUrl] = useState(entry?.url ?? "");
  const [email, setEmail] = useState(entry?.email ?? "");
  const [content, setContent] = useState(entry?.content ?? "");
  const [showPassword, setShowPassword] = useState(false);
  const [attachments, setAttachments] = useState<
    Array<{ name: string; dataUrl: string; mimeType: string }>
  >(entry?.attachments ?? []);
  const [showAttachOptions, setShowAttachOptions] = useState(false);
  const [error, setError] = useState("");

  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const readFiles = (files: FileList) => {
    for (const file of Array.from(files)) {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachments((prev) => [
          ...prev,
          {
            name: file.name,
            dataUrl: reader.result as string,
            mimeType: file.type,
          },
        ]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    const now = new Date().toISOString();
    const saved: LockerEntry = {
      id: entry?.id ?? crypto.randomUUID(),
      type,
      title: title.trim(),
      username: username || undefined,
      password: password || undefined,
      url: url || undefined,
      email: email || undefined,
      content: content || undefined,
      attachments: attachments.length > 0 ? attachments : undefined,
      createdAt: entry?.createdAt ?? now,
      updatedAt: now,
    };
    onSave(saved);
  };

  return (
    <div
      className="bg-card rounded-2xl border border-border/50 w-full max-w-lg mx-4 flex flex-col"
      style={{ maxHeight: "90vh" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50 shrink-0">
        <h2 className="font-semibold text-sm">
          {entry ? "Edit Entry" : "Add Entry"}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="overflow-y-auto p-4 space-y-4 flex-1">
        {/* Type selector */}
        <div>
          <p className="text-xs font-medium mb-2">Type</p>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(TYPE_LABELS) as EntryType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                data-ocid="locker.entry.tab"
                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                  type === t
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/50 border-border/50 hover:bg-muted"
                }`}
              >
                {TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label
            htmlFor="entry-title"
            className="text-xs font-medium block mb-1"
          >
            Title *
          </label>
          <input
            id="entry-title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setError("");
            }}
            placeholder="Entry name"
            data-ocid="locker.entry.input"
            className="w-full bg-muted/50 rounded-lg p-2.5 text-sm border border-border/50 outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Password fields */}
        {type === "password" && (
          <>
            <div>
              <label
                htmlFor="entry-username"
                className="text-xs font-medium block mb-1"
              >
                Username
              </label>
              <input
                id="entry-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username or email"
                className="w-full bg-muted/50 rounded-lg p-2.5 text-sm border border-border/50 outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label
                htmlFor="entry-password"
                className="text-xs font-medium block mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="entry-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-muted/50 rounded-lg p-2.5 pr-10 text-sm border border-border/50 outline-none focus:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label
                htmlFor="entry-url"
                className="text-xs font-medium block mb-1"
              >
                URL
              </label>
              <input
                id="entry-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://"
                className="w-full bg-muted/50 rounded-lg p-2.5 text-sm border border-border/50 outline-none focus:border-primary transition-colors"
              />
            </div>
          </>
        )}

        {/* Email fields */}
        {type === "email" && (
          <>
            <div>
              <label
                htmlFor="entry-email"
                className="text-xs font-medium block mb-1"
              >
                Email Address
              </label>
              <input
                id="entry-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-muted/50 rounded-lg p-2.5 text-sm border border-border/50 outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label
                htmlFor="entry-email-password"
                className="text-xs font-medium block mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="entry-email-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-muted/50 rounded-lg p-2.5 pr-10 text-sm border border-border/50 outline-none focus:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Note fields */}
        {type === "note" && (
          <div>
            <label
              htmlFor="entry-content"
              className="text-xs font-medium block mb-1"
            >
              Content
            </label>
            <textarea
              id="entry-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Your secure note..."
              rows={5}
              className="w-full bg-muted/50 rounded-lg p-2.5 text-sm border border-border/50 outline-none focus:border-primary transition-colors resize-none"
            />
          </div>
        )}

        {/* Attachments */}
        <div>
          <p className="text-xs font-medium mb-2">Attachments</p>
          {attachments.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-2">
              {attachments.map((att, attIdx) => (
                <div key={`${att.name}-${attIdx}`} className="relative">
                  {att.mimeType.startsWith("image/") ? (
                    <img
                      src={att.dataUrl}
                      alt={att.name}
                      className="w-full h-20 object-contain rounded-lg bg-muted"
                    />
                  ) : (
                    <div className="w-full h-20 flex flex-col items-center justify-center bg-muted rounded-lg">
                      <File className="w-6 h-6 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground mt-1 truncate w-full px-1 text-center">
                        {att.name}
                      </span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      setAttachments((prev) =>
                        prev.filter((_, idx) => idx !== attIdx),
                      )
                    }
                    className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full"
                    aria-label="Remove attachment"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {showAttachOptions ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  cameraRef.current?.click();
                  setShowAttachOptions(false);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-muted rounded-lg text-xs font-medium border border-border/50 hover:bg-muted/80 transition-colors"
                data-ocid="locker.entry.upload_button"
              >
                <Camera className="w-3.5 h-3.5" /> Camera
              </button>
              <button
                type="button"
                onClick={() => {
                  fileRef.current?.click();
                  setShowAttachOptions(false);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-muted rounded-lg text-xs font-medium border border-border/50 hover:bg-muted/80 transition-colors"
                data-ocid="locker.entry.dropzone"
              >
                <File className="w-3.5 h-3.5" /> Add Files
              </button>
              <button
                type="button"
                onClick={() => setShowAttachOptions(false)}
                className="p-2 bg-muted rounded-lg border border-border/50 hover:bg-muted/80 transition-colors"
                aria-label="Cancel"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowAttachOptions(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-muted rounded-lg text-xs font-medium border border-border/50 hover:bg-muted/80 transition-colors"
              data-ocid="locker.entry.open_modal_button"
            >
              <Paperclip className="w-3.5 h-3.5" /> Add Attachment
            </button>
          )}

          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => e.target.files && readFiles(e.target.files)}
          />
          <input
            ref={fileRef}
            type="file"
            accept="*/*"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && readFiles(e.target.files)}
          />
        </div>

        {error && (
          <p className="text-xs text-destructive p-2 bg-destructive/10 rounded-lg">
            {error}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border/50 flex gap-2 shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-2.5 bg-muted rounded-lg text-sm font-medium border border-border/50 hover:bg-muted/80 transition-colors"
          data-ocid="locker.entry.cancel_button"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          data-ocid="locker.entry.save_button"
        >
          {entry ? "Save Changes" : "Add Entry"}
        </button>
      </div>
    </div>
  );
}
