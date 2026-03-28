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

  // Tracks the full accumulated final text seen so far in this session.
  // By comparing total-final-text length against this ref (text-based, not
  // index-based) we avoid every mobile quirk where resultIndex resets to 0
  // or the browser replays the entire results array on each onresult event.
  const committedFinalRef = useRef("");

  // biome-ignore lint/correctness/useExhaustiveDependencies: SpeechRecognitionAPI is stable
  useEffect(() => {
    if (!isSupported || !SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      // Rebuild the COMPLETE final text and interim text from the full
      // results array on every event.  This is deliberately not using
      // event.resultIndex because on Android Chrome it is often 0 even
      // after several results, causing the whole array to be "replayed".
      let totalFinalText = "";
      let interimText = "";

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          totalFinalText += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }

      // Only append the portion of final text that is genuinely new —
      // i.e., beyond what we have already committed to the transcript state.
      if (totalFinalText.length > committedFinalRef.current.length) {
        const newPortion = totalFinalText.slice(
          committedFinalRef.current.length,
        );
        committedFinalRef.current = totalFinalText;
        setTranscript((prev) => prev + newPortion);
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
    // Reset the committed-text buffer so a fresh session starts clean
    committedFinalRef.current = "";
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
    committedFinalRef.current = "";
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
