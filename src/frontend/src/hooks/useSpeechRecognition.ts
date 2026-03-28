import { useCallback, useEffect, useRef, useState } from "react";

// Use a local interface to avoid relying on missing DOM lib types
interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

function getSpeechRecognitionAPI(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  return (
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition ||
    null
  );
}

interface UseSpeechRecognitionReturn {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const SpeechRecognitionAPI = getSpeechRecognitionAPI();
  const isSupported = !!SpeechRecognitionAPI;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Whether the user has requested listening to be active
  const shouldListenRef = useRef(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  // Guard to prevent overlapping start() calls
  const isRecognitionActiveRef = useRef(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: SpeechRecognitionAPI is stable
  useEffect(() => {
    if (!isSupported || !SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    // Use continuous: false — most reliable on mobile (Android Chrome).
    // We manually restart on onend if the user still wants to listen.
    // This prevents the "replaying entire results array" issue where
    // resultIndex resets to 0 and all previous text is re-appended.
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onstart = () => {
      isRecognitionActiveRef.current = true;
    };

    recognition.onresult = (event: any) => {
      // With continuous: false, the results array contains only the
      // current utterance — no risk of replaying previous sessions.
      let finalText = "";
      let interimText = "";

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }

      if (finalText) {
        // Append only this utterance's final text — never re-appends old text
        setTranscript((prev) => {
          const trimmed = finalText.trim();
          if (!trimmed) return prev;
          return prev ? `${prev} ${trimmed}` : trimmed;
        });
      }

      setInterimTranscript(interimText);
    };

    recognition.onerror = (event: any) => {
      isRecognitionActiveRef.current = false;
      // "no-speech" and "aborted" are non-fatal — just restart if needed
      if (event.error === "aborted" || event.error === "no-speech") {
        return;
      }
      setError(`Speech recognition error: ${event.error}`);
      shouldListenRef.current = false;
      setIsListening(false);
    };

    recognition.onend = () => {
      isRecognitionActiveRef.current = false;
      setInterimTranscript("");
      // If user still wants to listen, restart the recognition.
      // This handles mobile auto-stop after silence.
      if (shouldListenRef.current) {
        try {
          recognition.start();
        } catch {
          // If start throws (e.g. already started race), ignore
        }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      shouldListenRef.current = false;
      recognition.abort();
    };
  }, [isSupported]); // eslint-disable-line react-hooks/exhaustive-deps

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    setError(null);
    setTranscript("");
    setInterimTranscript("");
    shouldListenRef.current = true;
    if (!isRecognitionActiveRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        // Already started — ignore
      }
    } else {
      setIsListening(true);
    }
  }, []);

  const stopListening = useCallback(() => {
    shouldListenRef.current = false;
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch {
      // Ignore if already stopped
    }
    setIsListening(false);
    setInterimTranscript("");
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
}
