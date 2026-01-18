// PROJECT: CanvasFlow Pro
// MODULE: AI Chat Sidebar Component

// Web Speech API type declarations
interface SpeechRecognitionEvent extends Event {
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  readonly isFinal: boolean;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: Event) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useLanguage } from '@/contexts/LanguageContext';
import { Language } from '@/lib/i18n';
import { Project } from '@/hooks/useProjects';
import { Activity } from '@/hooks/useActivities';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Bot, Send, Loader2, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ToolCall {
  id: string;
  function: {
    name: string;
    arguments: string;
  };
}

interface AIChatSidebarProps {
  projects: Project[];
  activities: Activity[];
  onCreateProject: (name: string) => void;
  onMoveActivity: (activityId: string, status: 'todo' | 'doing' | 'finished') => void;
}

const chatTranslations: Record<string, {
  title: string;
  placeholder: string;
  createdProject: string;
  movedActivity: string;
  switchedLanguage: string;
  errorSending: string;
  listening: string;
  voiceNotSupported: string;
  speakingEnabled: string;
  speakingDisabled: string;
}> = {
  en: {
    title: 'AI Assistant',
    placeholder: 'Ask me anything...',
    createdProject: 'Created project:',
    movedActivity: 'Moved activity to',
    switchedLanguage: 'Switched language to',
    errorSending: 'Failed to send message',
    listening: 'Listening...',
    voiceNotSupported: 'Voice input not supported in this browser',
    speakingEnabled: 'Voice output enabled',
    speakingDisabled: 'Voice output disabled',
  },
  es: {
    title: 'Asistente IA',
    placeholder: 'Pregúntame lo que quieras...',
    createdProject: 'Proyecto creado:',
    movedActivity: 'Actividad movida a',
    switchedLanguage: 'Idioma cambiado a',
    errorSending: 'Error al enviar mensaje',
    listening: 'Escuchando...',
    voiceNotSupported: 'Entrada de voz no soportada en este navegador',
    speakingEnabled: 'Salida de voz activada',
    speakingDisabled: 'Salida de voz desactivada',
  },
  de: {
    title: 'KI-Assistent',
    placeholder: 'Frag mich etwas...',
    createdProject: 'Projekt erstellt:',
    movedActivity: 'Aktivität verschoben nach',
    switchedLanguage: 'Sprache geändert zu',
    errorSending: 'Nachricht senden fehlgeschlagen',
    listening: 'Hören...',
    voiceNotSupported: 'Spracheingabe in diesem Browser nicht unterstützt',
    speakingEnabled: 'Sprachausgabe aktiviert',
    speakingDisabled: 'Sprachausgabe deaktiviert',
  },
  fr: {
    title: 'Assistant IA',
    placeholder: 'Demandez-moi...',
    createdProject: 'Projet créé:',
    movedActivity: 'Activité déplacée vers',
    switchedLanguage: 'Langue changée en',
    errorSending: 'Échec de l\'envoi du message',
    listening: 'Écoute...',
    voiceNotSupported: 'Entrée vocale non prise en charge dans ce navigateur',
    speakingEnabled: 'Sortie vocale activée',
    speakingDisabled: 'Sortie vocale désactivée',
  },
  it: {
    title: 'Assistente IA',
    placeholder: 'Chiedimi qualcosa...',
    createdProject: 'Progetto creato:',
    movedActivity: 'Attività spostata a',
    switchedLanguage: 'Lingua cambiata in',
    errorSending: 'Invio messaggio fallito',
    listening: 'Ascoltando...',
    voiceNotSupported: 'Input vocale non supportato in questo browser',
    speakingEnabled: 'Uscita vocale attivata',
    speakingDisabled: 'Uscita vocale disattivata',
  },
};

export const AIChatSidebar = ({
  projects,
  activities,
  onCreateProject,
  onMoveActivity,
}: AIChatSidebarProps) => {
  const { language, setLanguage } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeakingEnabled, setIsSpeakingEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const ct = chatTranslations[language as keyof typeof chatTranslations] || chatTranslations.en;

  // Language mapping for Web Speech API
  const langMap: Record<string, string> = {
    en: 'en-US',
    es: 'es-ES',
    de: 'de-DE',
    fr: 'fr-FR',
    it: 'it-IT',
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error(ct.voiceNotSupported);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = langMap[language] || 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join('');
      setInput(transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Text-to-Speech function
  const speakText = (text: string) => {
    if (!isSpeakingEnabled || !text.trim()) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langMap[language] || 'en-US';
    utterance.rate = 1;
    utterance.pitch = 1;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const toggleSpeaking = () => {
    if (isSpeaking) {
      stopSpeaking();
    }
    setIsSpeakingEnabled(!isSpeakingEnabled);
    toast.success(!isSpeakingEnabled ? ct.speakingEnabled : ct.speakingDisabled);
  };

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleToolCalls = (toolCalls: ToolCall[]) => {
    for (const call of toolCalls) {
      const args = JSON.parse(call.function.arguments);

      switch (call.function.name) {
        case 'create_project':
          onCreateProject(args.name);
          toast.success(`${ct.createdProject} ${args.name}`);
          break;
        case 'move_activity':
          onMoveActivity(args.activity_id, args.new_status);
          toast.success(`${ct.movedActivity} ${args.new_status}`);
          break;
        case 'switch_language':
          setLanguage(args.language as Language);
          toast.success(`${ct.switchedLanguage} ${args.language}`);
          break;
      }
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          messages: newMessages,
          projects,
          activities,
          language,
        },
      });

      if (error) throw error;

      const choice = data.choices?.[0];
      if (!choice) throw new Error('No response from AI');

      // Handle tool calls
      if (choice.message?.tool_calls) {
        handleToolCalls(choice.message.tool_calls);
      }

      // Add assistant message and speak it
      const assistantContent = choice.message?.content || '';
      if (assistantContent) {
        setMessages((prev) => [...prev, { role: 'assistant', content: assistantContent }]);
        speakText(assistantContent);
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast.error(ct.errorSending);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        >
          <Bot className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] flex flex-col p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            {ct.title}
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={cn(
                  'flex',
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-lg px-4 py-2 text-sm',
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Button
              onClick={toggleSpeaking}
              size="icon"
              variant={isSpeakingEnabled ? 'secondary' : 'outline'}
              title={isSpeakingEnabled ? ct.speakingEnabled : ct.speakingDisabled}
            >
              {isSpeakingEnabled ? (
                <Volume2 className={cn("h-4 w-4", isSpeaking && "animate-pulse text-primary")} />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
            </Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? ct.listening : ct.placeholder}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={toggleListening}
              disabled={isLoading}
              size="icon"
              variant={isListening ? 'destructive' : 'outline'}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Button onClick={sendMessage} disabled={isLoading || !input.trim()} size="icon">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
