
import { useState, useEffect, useRef } from 'react';

// Fix for TypeScript: Add type definitions for Web Speech API which are not yet standardized
// and may not be present in the default TypeScript lib files. This will fix errors for
// `SpeechRecognition`, `webkitSpeechRecognition`, `SpeechRecognitionEvent`, and `SpeechRecognitionErrorEvent`.
interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
}

interface SpeechRecognitionStatic {
    new(): SpeechRecognition;
}

interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string;
    readonly message: string;
}

interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly[index: number]: SpeechRecognitionAlternative;
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
}

declare global {
    interface Window {
        SpeechRecognition: SpeechRecognitionStatic;
        webkitSpeechRecognition: SpeechRecognitionStatic;
    }
}

// Check for SpeechRecognition API
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition: SpeechRecognition | null = SpeechRecognition ? new SpeechRecognition() : null;

if (recognition) {
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';
}

export const useSpeechToText = (onTranscript: (transcript: string) => void) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const stopListening = useRef(() => {}).current; // placeholder

  useEffect(() => {
    if (!recognition) {
      setError("Speech recognition not supported in this browser.");
      return;
    }

    const handleResult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        onTranscript(finalTranscript);
        // Directly call recognition.stop() as stopListening function creates stale closure issues
        if (recognition) {
            recognition.stop();
            setIsListening(false);
        }
      }
    };

    const handleError = (event: SpeechRecognitionErrorEvent) => {
      setError(event.error);
      setIsListening(false);
    };
    
    const handleEnd = () => {
        setIsListening(false);
    }

    recognition.addEventListener('result', handleResult as EventListener);
    recognition.addEventListener('error', handleError as EventListener);
    recognition.addEventListener('end', handleEnd);

    return () => {
      recognition.removeEventListener('result', handleResult as EventListener);
      recognition.removeEventListener('error', handleError as EventListener);
      recognition.removeEventListener('end', handleEnd);
    };
  }, [onTranscript]);

  const startListening = () => {
    if (isListening || !recognition) return;
    try {
      recognition.start();
      setIsListening(true);
      setError(null);
    } catch (e) {
      setError("Failed to start speech recognition. Another instance may be running.");
      setIsListening(false);
    }
  };

  const stopListeningFn = () => {
    if (!isListening || !recognition) return;
    recognition.stop();
    setIsListening(false);
  };
  
  const toggleListening = () => {
    if (isListening) {
      stopListeningFn();
    } else {
      startListening();
    }
  }

  return { isListening, error, toggleListening, hasRecognitionSupport: !!recognition };
};
