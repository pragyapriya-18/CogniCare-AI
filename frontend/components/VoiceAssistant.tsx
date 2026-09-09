"use client";

import React, { useState, useRef, useEffect } from "react";
import { SUPPORTED_LANGUAGES, createSpeechRecognition } from "@/lib/voice";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
}

export function VoiceInput({ onTranscript }: VoiceInputProps) {
  const [selectedLang, setSelectedLang] = useState("en-IN");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const recognition = createSpeechRecognition(
      (text) => {
        onTranscript(text);
        setIsListening(false);
      },
      (error) => {
        console.error("Speech recognition error:", error);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );

    recognitionRef.current = recognition;
  }, [onTranscript]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang = selectedLang;
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error(err);
        setIsListening(false);
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={selectedLang}
        onChange={(e) => setSelectedLang(e.target.value)}
        disabled={isListening}
        className="rounded-md border bg-background px-2 py-1 text-sm"
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
        className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
          isListening ? "bg-red-500 text-white animate-pulse" : "bg-primary text-primary-foreground"
        }`}
      >
        {isListening ? "Listening..." : "🎤 Voice"}
      </button>
    </div>
  );
}