"use client";

import React, { useState, useRef, useEffect } from "react";
import { SUPPORTED_LANGUAGES } from "@/lib/voice";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
}

export function VoiceInput({ onTranscript }: VoiceInputProps) {
  const [selectedLang, setSelectedLang] = useState("en-IN");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const onTranscriptRef = useRef(onTranscript);

  // Keep callback reference updated without triggering re-initialization
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Speech Recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript;
      if (transcript.trim()) {
        onTranscriptRef.current(transcript.trim());
      }
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      // Ignore routine lifecycle halts
      if (event.error === "no-speech" || event.error === "aborted") {
        setIsListening(false);
        return;
      }

      if (event.error === "not-allowed") {
        alert("Microphone permission was denied. Check your browser settings.");
      } else {
        console.error("Speech error:", event.error);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onabort = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore cleanup abort
        }
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Use Chrome or Edge.");
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.warn("Stop error:", err);
      }
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang = selectedLang;
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err: any) {
        // If already started, stop and restart cleanly
        if (err.name === "InvalidStateError") {
          recognitionRef.current.stop();
          setIsListening(false);
        } else {
          console.error("Start error:", err);
          setIsListening(false);
        }
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={selectedLang}
        onChange={(e) => setSelectedLang(e.target.value)}
        disabled={isListening}
        className="rounded-md border bg-background px-2 py-1 text-sm outline-none"
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={toggleListening}
        className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
          isListening
            ? "bg-red-600 text-white animate-pulse"
            : "bg-primary text-primary-foreground hover:opacity-90"
        }`}
      >
        {isListening ? "Listening... Speak now" : "🎤 Voice"}
      </button>
    </div>
  );
}