import { useCallback, useEffect, useRef, useState } from "react";

// Use a local interface to avoid relying on missing DOM lib types
interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
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

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  // Tracks the highest result index already processed as final, to prevent
  // mobile browsers from replaying old final results and causing duplication.
  const processedUpToRef = useRef(0);

  // biome-ignore lint/correctness/useExhaustiveDependencies: SpeechRecognitionAPI is stable
  useEffect(() => {
    if (!isSupported || !SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let finalText = "";
      let interimText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          // Only process each result index once — mobile browsers sometimes
          // re-fire onresult with resultIndex=0 replaying all prior finals.
          if (i >= processedUpToRef.current) {
            finalText += result[0].transcript;
            processedUpToRef.current = i + 1;
          }
        } else {
          interimText += result[0].transcript;
        }
      }

      if (finalText) {
        setTranscript((prev) => prev + finalText);
      }
      setInterimTranscript(interimText);
    };

    recognition.onerror = (event: any) => {
      if (event.error === "aborted") return;
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setInterimTranscript("");
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, [isSupported]); // eslint-disable-line react-hooks/exhaustive-deps

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    setError(null);
    setTranscript("");
    setInterimTranscript("");
    // Reset processed index so a fresh session starts from 0
    processedUpToRef.current = 0;
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch {
      // Already started — ignore
    }
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setIsListening(false);
    setInterimTranscript("");
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
    processedUpToRef.current = 0;
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
