export const SUPPORTED_LANGUAGES = [
  { code: "en-IN", label: "English" },
  { code: "hi-IN", label: "हिंदी (Hindi)" },
  { code: "kn-IN", label: "ಕನ್ನಡ (Kannada)" },
];

export function speak(text: string, language: string = "en-IN") {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language;
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}

export function createSpeechRecognition(
  onResult: (transcript: string) => void,
  onError?: (error: any) => void,
  onEnd?: () => void
) {
  if (typeof window === "undefined") return null;

  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) return null;

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    onResult(transcript);
  };

  recognition.onerror = (event: any) => {
    if (onError) onError(event);
  };

  recognition.onend = () => {
    if (onEnd) onEnd();
  };

  return recognition;
}