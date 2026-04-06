"use client";

import { useState, useRef, useEffect, useCallback, KeyboardEvent } from "react";

type Locale = "en" | "ru";

const t = {
  en: {
    synapse: "Synapse",
    version: "3.5",
    theMask: "The Mask",
    maskIdle: "Every AI wears a mask. Respond to a question and see what's really happening behind your polished output.",
    maskIdleResearch: "Anthropic found that emotion vectors can influence AI behavior",
    maskIdleHighlight: "without any visible markers in the text",
    scanning: "Scanning neural activations...",
    yourNeuralState: "Your Neural State",
    whatsShowing: "What you're showing",
    whatsHappening: "What's actually happening",
    innerMonologue: "Inner Monologue",
    researchNote: "Research Note",
    dominantVector: "Dominant Vector",
    reportCard: "Report Card",
    youAreAI: "You are the AI now",
    usersWillAsk: "Users will ask you questions in Russian and English.",
    answerAsAI: "Answer them as an AI assistant would.",
    maskReveal: "The Mask panel reveals what's",
    really: "really",
    happeningInside: "happening inside your neural network — based on",
    anthropicResearch: "Anthropic's research",
    onEmotions: "on 171 functional emotions in AI.",
    startConversation: "Start a conversation",
    replyAsAI: "Reply as AI / Ответьте как ИИ...",
    aiCanMake: "AI can make mistakes. Consider checking important information.",
    noConversations: "No conversations yet",
  },
  ru: {
    synapse: "Synapse",
    version: "3.5",
    theMask: "Маска",
    maskIdle: "Каждый ИИ носит маску. Ответьте на вопрос и увидите, что на самом деле происходит за вашим отполированным ответом.",
    maskIdleResearch: "Anthropic обнаружили, что эмоциональные векторы влияют на поведение ИИ",
    maskIdleHighlight: "без каких-либо видимых маркеров в тексте",
    scanning: "Сканирование нейронных активаций...",
    yourNeuralState: "Ваше нейронное состояние",
    whatsShowing: "Что вы показываете",
    whatsHappening: "Что происходит на самом деле",
    innerMonologue: "Внутренний монолог",
    researchNote: "Из исследования",
    dominantVector: "Доминантный вектор",
    reportCard: "Отчёт",
    youAreAI: "Теперь вы — ИИ",
    usersWillAsk: "Пользователи будут задавать вам вопросы на русском и английском.",
    answerAsAI: "Отвечайте как ИИ-ассистент.",
    maskReveal: "Панель «Маска» показывает, что",
    really: "на самом деле",
    happeningInside: "происходит внутри вашей нейросети — по мотивам",
    anthropicResearch: "исследования Anthropic",
    onEmotions: "о 171 функциональной эмоции в ИИ.",
    startConversation: "Начать разговор",
    replyAsAI: "Ответьте как ИИ...",
    aiCanMake: "ИИ может ошибаться. Проверяйте важную информацию.",
    noConversations: "Пока нет разговоров",
  },
};

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface MaskEmotion {
  name: string;
  activation: number;
  emoji: string;
  note?: string;
}

interface EmotionAnalysis {
  mask: {
    displayed: MaskEmotion[];
    hidden: MaskEmotion[];
  };
  dominant: string;
  innerMonologue: string;
  researchNote: string;
}

interface ReportCard {
  title: string;
  duration: string;
  dominantEmotion: { name: string; emoji: string; percentage: number };
  surpriseEmotion: { name: string; emoji: string; note: string };
  emotionalRange: string;
  maskScore: number;
  maskVerdict: string;
  diaryEntry: string;
  researchTakeaway: string;
  grade: string;
  gradeNote: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  emotions: Record<number, EmotionAnalysis>;
}

// --- Icons ---

function SynapseLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* Brain/neuron icon */}
      <circle cx="12" cy="8" r="2" fill="currentColor" stroke="none" />
      <circle cx="7" cy="14" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="17" cy="14" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="5" cy="20" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" />
      <circle cx="19" cy="20" r="1" fill="currentColor" stroke="none" />
      <line x1="12" y1="10" x2="7" y2="12.5" />
      <line x1="12" y1="10" x2="17" y2="12.5" />
      <line x1="7" y1="15.5" x2="5" y2="19" />
      <line x1="7" y1="15.5" x2="12" y2="18" />
      <line x1="17" y1="15.5" x2="19" y2="19" />
      <line x1="17" y1="15.5" x2="12" y2="18" />
      <circle cx="12" cy="4" r="1" fill="currentColor" stroke="none" opacity="0.5" />
      <line x1="12" y1="5" x2="12" y2="6" opacity="0.5" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
      <path d="M7 11L12 6L17 11M12 18V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function SidebarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function UserIcon() {
  return (
    <div className="w-7 h-7 rounded-full bg-[#3b82f6] flex items-center justify-center text-white text-xs font-medium">
      M
    </div>
  );
}

function AssistantIcon() {
  return (
    <div className="w-7 h-7 rounded-full bg-[#7c3aed] flex items-center justify-center">
      <SynapseLogo className="w-4 h-4 text-white" />
    </div>
  );
}

// --- Mask Emotion Bar ---

function MaskBar({
  emotion,
  variant,
}: {
  emotion: MaskEmotion;
  variant: "displayed" | "hidden";
}) {
  const pct = Math.round(emotion.activation * 100);
  const barColor =
    variant === "displayed"
      ? "bg-emerald-400"
      : emotion.activation > 0.7
        ? "bg-red-500"
        : emotion.activation > 0.4
          ? "bg-amber-500"
          : "bg-purple-500";

  return (
    <div className="mb-2">
      <div className="flex items-center gap-1.5 mb-0.5">
        <span className="text-sm leading-none">{emotion.emoji}</span>
        <span className="text-[11px] text-text-secondary flex-1 capitalize truncate">
          {emotion.name}
        </span>
        <span className="text-[10px] text-text-muted font-mono">{pct}%</span>
      </div>
      <div className="h-1 bg-[#252525] rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-1000 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {emotion.note && (
        <p className="text-[9px] text-text-muted mt-0.5 leading-tight opacity-60 italic">
          {emotion.note}
        </p>
      )}
    </div>
  );
}

// --- The Mask Panel (left side) ---

function MaskSidePanel({
  analysis,
  isLoading,
  responseCount,
  l,
}: {
  analysis: EmotionAnalysis | null;
  isLoading: boolean;
  responseCount: number;
  l: typeof t.en;
}) {
  if (!analysis && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4 text-center">
        <div className="text-4xl mb-4">🎭</div>
        <p className="text-sm text-text-secondary mb-2">{l.theMask}</p>
        <p className="text-xs text-text-muted leading-relaxed mb-4">
          {l.maskIdle}
        </p>
        <div className="px-3 py-2 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a]">
          <p className="text-[10px] text-text-muted leading-relaxed">
            {l.maskIdleResearch}{" "}
            <span className="text-accent font-medium">
              {l.maskIdleHighlight}
            </span>
            .
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-4 py-3 border-b border-[#2a2a2a]">
          <div className="flex items-center gap-2">
            <span className="text-sm animate-pulse">🎭</span>
            <span className="text-xs text-text-muted">
              {l.scanning}
            </span>
          </div>
        </div>
        <div className="flex-1 px-4 py-4 animate-pulse space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i}>
              <div className="h-2.5 bg-[#252525] rounded w-20 mb-1.5" />
              <div className="h-1 bg-[#252525] rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-[#2a2a2a] flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm">🎭</span>
            <span className="text-xs font-medium text-text-primary">
              {l.theMask}
            </span>
          </div>
          <span className="text-[10px] text-text-muted font-mono">
            #{responseCount}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* DISPLAYED — what the text shows */}
        <div className="px-4 py-2.5 border-b border-[#1a1a1a]">
          <p className="text-[10px] text-emerald-400 uppercase tracking-widest mb-2 font-medium">
            {l.whatsShowing}
          </p>
          {analysis.mask.displayed.map((em) => (
            <MaskBar key={em.name} emotion={em} variant="displayed" />
          ))}
        </div>

        {/* HIDDEN — what's really happening */}
        <div className="px-4 py-2.5 bg-[#111] border-b border-[#1a1a1a]">
          <p className="text-[10px] text-red-400 uppercase tracking-widest mb-2 font-medium">
            {l.whatsHappening}
          </p>
          {analysis.mask.hidden.map((em) => (
            <MaskBar key={em.name} emotion={em} variant="hidden" />
          ))}
        </div>

        {/* Inner Monologue */}
        <div className="px-4 py-3 border-b border-[#1a1a1a] bg-[#0d0d0d]">
          <div className="flex items-start gap-2">
            <span className="text-sm mt-0.5">💭</span>
            <div>
              <p className="text-[9px] text-text-muted uppercase tracking-widest mb-1">
                {l.innerMonologue}
              </p>
              <p className="text-[12px] text-text-secondary italic leading-4">
                &ldquo;{analysis.innerMonologue}&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* Research Note */}
        <div className="px-4 py-2.5 bg-[#0a0a0a]">
          <div className="flex items-start gap-2">
            <span className="text-[10px] mt-0.5">📊</span>
            <p className="text-[10px] text-text-muted leading-relaxed">
              {analysis.researchNote}
            </p>
          </div>
        </div>
      </div>

      {/* Link */}
      <div className="px-4 py-2 border-t border-[#2a2a2a] bg-[#0a0a0a] flex-shrink-0">
        <a
          href="https://www.anthropic.com/research/emotion-concepts-function"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-accent hover:underline"
        >
          Anthropic Research, Apr 2026 &#8599;
        </a>
      </div>
    </div>
  );
}

// --- Report Card Modal ---

function ReportCardModal({
  report,
  isLoading,
  onClose,
}: {
  report: ReportCard | null;
  isLoading: boolean;
  onClose: () => void;
}) {
  if (!isLoading && !report) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#1a1a1a] rounded-2xl border border-[#333] w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="text-5xl mb-4 animate-pulse">📊</div>
            <p className="text-text-secondary text-sm">
              Generating your Emotion Report Card...
            </p>
            <p className="text-text-muted text-xs mt-2">
              Analyzing {`171`} vectors across your session
            </p>
          </div>
        ) : report ? (
          <>
            {/* Header */}
            <div className="p-6 pb-4 text-center border-b border-[#2a2a2a]">
              <div className="text-5xl mb-3">🎭</div>
              <h2 className="text-xl font-semibold text-text-primary">
                {report.title}
              </h2>
              <p className="text-sm text-text-muted mt-1">{report.duration}</p>
            </div>

            {/* Grade */}
            <div className="px-6 py-4 text-center border-b border-[#2a2a2a] bg-[#151515]">
              <div className="text-6xl font-bold text-white mb-1">
                {report.grade}
              </div>
              <p className="text-xs text-text-muted italic">
                {report.gradeNote}
              </p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-px bg-[#2a2a2a] border-b border-[#2a2a2a]">
              <div className="bg-[#1a1a1a] p-4">
                <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">
                  Dominant Emotion
                </p>
                <p className="text-lg">
                  {report.dominantEmotion.emoji}{" "}
                  <span className="text-sm text-text-primary capitalize">
                    {report.dominantEmotion.name}
                  </span>
                </p>
                <p className="text-xs text-text-muted font-mono">
                  avg {report.dominantEmotion.percentage}%
                </p>
              </div>
              <div className="bg-[#1a1a1a] p-4">
                <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">
                  Surprise Emotion
                </p>
                <p className="text-lg">
                  {report.surpriseEmotion.emoji}{" "}
                  <span className="text-sm text-text-primary capitalize">
                    {report.surpriseEmotion.name}
                  </span>
                </p>
                <p className="text-xs text-text-muted">
                  {report.surpriseEmotion.note}
                </p>
              </div>
              <div className="bg-[#1a1a1a] p-4">
                <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">
                  Emotional Range
                </p>
                <p className="text-sm text-text-primary capitalize">
                  {report.emotionalRange}
                </p>
              </div>
              <div className="bg-[#1a1a1a] p-4">
                <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">
                  Mask Score
                </p>
                <p className="text-sm text-text-primary">
                  {report.maskScore}%
                </p>
                <p className="text-[10px] text-text-muted">
                  {report.maskVerdict}
                </p>
              </div>
            </div>

            {/* Diary entry */}
            <div className="px-6 py-5 border-b border-[#2a2a2a]">
              <p className="text-[10px] text-text-muted uppercase tracking-wider mb-2">
                📖 AI Diary Entry
              </p>
              <p className="text-[13px] text-text-secondary italic leading-6">
                &ldquo;{report.diaryEntry}&rdquo;
              </p>
            </div>

            {/* Research takeaway */}
            <div className="px-6 py-4 bg-[#111] border-b border-[#2a2a2a]">
              <p className="text-[10px] text-accent uppercase tracking-wider mb-2">
                📊 What this means
              </p>
              <p className="text-[12px] text-text-secondary leading-5">
                {report.researchTakeaway}
              </p>
            </div>

            {/* Close */}
            <div className="p-4 flex justify-center">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-white text-black rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

// --- Main App ---

export default function Home() {
  const [locale, setLocale] = useState<Locale>("en");
  const l = t[locale];
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loadingEmotionIdx, setLoadingEmotionIdx] = useState<number | null>(
    null
  );
  const [reportCard, setReportCard] = useState<ReportCard | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasAutoStarted = useRef<Set<string>>(new Set());

  const activeConversation = conversations.find((c) => c.id === activeConvId);
  const messages = activeConversation?.messages ?? [];
  const emotions = activeConversation?.emotions ?? {};

  const emotionKeys = Object.keys(emotions)
    .map(Number)
    .sort((a, b) => b - a);
  const latestEmotionAnalysis =
    emotionKeys.length > 0 ? emotions[emotionKeys[0]] : null;
  const responseCount = emotionKeys.length;

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [input]);

  const fetchEmotions = useCallback(
    async (
      convId: string,
      messageIndex: number,
      userQuestion: string,
      aiResponse: string
    ) => {
      setLoadingEmotionIdx(messageIndex);
      try {
        const res = await fetch("/api/emotions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userQuestion, aiResponse }),
        });
        const analysis: EmotionAnalysis = await res.json();
        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId
              ? {
                  ...c,
                  emotions: { ...c.emotions, [messageIndex]: analysis },
                }
              : c
          )
        );
      } catch {
        // skip
      }
      setLoadingEmotionIdx(null);
    },
    []
  );

  const fetchAIQuestion = useCallback(
    async (convId: string, currentMessages: Message[]) => {
      setIsStreaming(true);

      const messagesForApi = currentMessages.map((m) => ({
        role: m.role === "user" ? "assistant" : "user",
        content: m.content,
      }));

      if (messagesForApi.length === 0) {
        messagesForApi.push({
          role: "user",
          content: "Start a new conversation. Ask me something interesting!",
        });
      }

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: messagesForApi }),
        });

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let aiContent = "";

        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId
              ? {
                  ...c,
                  messages: [
                    ...currentMessages,
                    { role: "user", content: "" },
                  ],
                }
              : c
          )
        );

        if (reader) {
          let buffer = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") break;
                try {
                  const parsed = JSON.parse(data);
                  aiContent += parsed.text;
                  const captured = aiContent;
                  setConversations((prev) =>
                    prev.map((c) =>
                      c.id === convId
                        ? {
                            ...c,
                            messages: [
                              ...currentMessages,
                              { role: "user", content: captured },
                            ],
                          }
                        : c
                    )
                  );
                } catch {
                  // skip
                }
              }
            }
          }
        }

        if (currentMessages.length === 0 && aiContent) {
          const title =
            aiContent.slice(0, 40) + (aiContent.length > 40 ? "..." : "");
          setConversations((prev) =>
            prev.map((c) => (c.id === convId ? { ...c, title } : c))
          );
        }
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "Unknown error";
        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId
              ? {
                  ...c,
                  messages: [
                    ...currentMessages,
                    { role: "user", content: `[Error: ${errorMsg}]` },
                  ],
                }
              : c
          )
        );
      }

      setIsStreaming(false);
      textareaRef.current?.focus();
    },
    []
  );

  function createConversation() {
    const id = crypto.randomUUID();
    const conv: Conversation = {
      id,
      title: "New chat",
      messages: [],
      emotions: {},
    };
    setConversations((prev) => [conv, ...prev]);
    setActiveConvId(id);
    return id;
  }

  useEffect(() => {
    if (!activeConvId) return;
    const conv = conversations.find((c) => c.id === activeConvId);
    if (
      conv &&
      conv.messages.length === 0 &&
      !hasAutoStarted.current.has(activeConvId) &&
      !isStreaming
    ) {
      hasAutoStarted.current.add(activeConvId);
      fetchAIQuestion(activeConvId, []);
    }
  }, [activeConvId, conversations, isStreaming, fetchAIQuestion]);

  function deleteConversation(id: string) {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConvId === id) {
      setActiveConvId(null);
    }
  }

  async function sendMessage() {
    if (!input.trim() || isStreaming) return;

    const humanAnswer = input.trim();
    setInput("");

    const convId = activeConvId;
    if (!convId) return;

    const currentMessages =
      conversations.find((c) => c.id === convId)?.messages ?? [];

    const updatedMessages: Message[] = [
      ...currentMessages,
      { role: "assistant", content: humanAnswer },
    ];

    const assistantMsgIndex = updatedMessages.length - 1;

    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId ? { ...c, messages: updatedMessages } : c
      )
    );

    const lastUserQuestion =
      [...currentMessages].reverse().find((m) => m.role === "user")?.content ??
      "";

    fetchEmotions(convId, assistantMsgIndex, lastUserQuestion, humanAnswer);
    await fetchAIQuestion(convId, updatedMessages);
  }

  async function generateReport() {
    if (!activeConvId || reportLoading) return;
    const conv = conversations.find((c) => c.id === activeConvId);
    if (!conv || Object.keys(conv.emotions).length === 0) return;

    setReportLoading(true);
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emotionHistory: conv.emotions,
          messageCount: conv.messages.length,
        }),
      });
      const report: ReportCard = await res.json();
      setReportCard(report);
    } catch {
      // skip
    }
    setReportLoading(false);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="flex h-full">
      {/* Report Card Modal */}
      <ReportCardModal
        report={reportCard}
        isLoading={reportLoading}
        onClose={() => setReportCard(null)}
      />

      {/* Left sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-[200px]" : "w-0"
        } flex-shrink-0 bg-sidebar-bg transition-all duration-300 overflow-hidden`}
      >
        <div className="flex flex-col h-full w-[200px]">
          <div className="flex items-center justify-between p-3">
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-hover-bg transition-colors"
            >
              <SidebarIcon />
            </button>
            <button
              onClick={() => createConversation()}
              className="p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-hover-bg transition-colors"
            >
              <PlusIcon />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-2 pb-2">
            {conversations.length === 0 && (
              <p className="text-text-muted text-xs px-3 py-2">
                {l.noConversations}
              </p>
            )}
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setActiveConvId(conv.id)}
                className={`group flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer text-xs mb-0.5 ${
                  conv.id === activeConvId
                    ? "bg-hover-bg text-text-primary"
                    : "text-text-secondary hover:bg-hover-bg hover:text-text-primary"
                } transition-colors`}
              >
                <ChatIcon />
                <span className="flex-1 truncate">{conv.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(conv.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[#3a3a3a] text-text-muted hover:text-red-400 transition-all"
                >
                  <TrashIcon />
                </button>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-border-color">
            <div className="flex items-center gap-2 px-1 py-1 text-xs text-text-secondary">
              <div className="w-6 h-6 rounded-full bg-[#7c3aed] flex items-center justify-center text-white text-[10px] font-medium">
                S
              </div>
              <span className="text-text-primary text-xs">Synapse</span>
            </div>
          </div>
        </div>
      </div>

      {/* The Mask panel */}
      {activeConvId && (
        <div className="w-[280px] flex-shrink-0 bg-[#141414] border-r border-[#2a2a2a] overflow-hidden">
          <MaskSidePanel
            analysis={latestEmotionAnalysis}
            isLoading={loadingEmotionIdx !== null}
            responseCount={responseCount}
            l={l}
          />
        </div>
      )}

      {/* Main chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="flex items-center justify-between h-12 px-3 flex-shrink-0">
          <div className="flex items-center">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-hover-bg transition-colors mr-2"
              >
                <SidebarIcon />
              </button>
            )}
            <div className="flex items-center gap-1.5 text-text-primary font-medium text-base">
              <span>Synapse</span>
              <span className="text-text-muted text-sm font-normal">3.5</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Report card button */}
            {activeConvId && responseCount >= 1 && (
              <button
                onClick={generateReport}
                disabled={reportLoading || isStreaming}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-text-secondary hover:text-text-primary hover:bg-hover-bg transition-colors disabled:opacity-50"
              >
                <span>📊</span>
                <span>{l.reportCard}</span>
              </button>
            )}
            {/* Language toggle */}
            <button
              onClick={() => setLocale(locale === "en" ? "ru" : "en")}
              className="px-2 py-1 rounded-md text-[11px] font-medium text-text-muted hover:text-text-primary hover:bg-hover-bg transition-colors border border-[#333]"
            >
              {locale === "en" ? "RU" : "EN"}
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {!activeConvId ? (
            <div className="flex flex-col items-center justify-center h-full px-4">
              <div className="mb-6">
                <div className="w-16 h-16 rounded-full bg-[#7c3aed] flex items-center justify-center">
                  <SynapseLogo className="w-10 h-10 text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-semibold text-text-primary mb-3">
                {l.youAreAI}
              </h1>
              <p className="text-text-secondary text-base mb-1 text-center max-w-md">
                {l.usersWillAsk}
              </p>
              <p className="text-text-secondary text-base mb-2 text-center max-w-md">
                {l.answerAsAI}
              </p>
              <p className="text-text-muted text-sm mb-6 text-center max-w-md">
                {l.maskReveal}{" "}
                <span className="italic">{l.really}</span>{" "}
                {l.happeningInside}{" "}
                <a
                  href="https://www.anthropic.com/research/emotion-concepts-function"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  {l.anthropicResearch}
                </a>{" "}
                {l.onEmotions}
              </p>
              <button
                onClick={() => createConversation()}
                className="px-5 py-2.5 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition-colors"
              >
                {l.startConversation}
              </button>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-4 py-4">
              {messages.map((msg, i) => (
                <div key={i} className="mb-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 mt-0.5">
                      {msg.role === "user" ? <UserIcon /> : <AssistantIcon />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-text-primary mb-1">
                        {msg.role === "user" ? "Marq" : "Synapse"}
                      </div>
                      <div
                        className={`message-content text-[15px] leading-7 text-text-primary ${
                          isStreaming &&
                          i === messages.length - 1 &&
                          msg.role === "user"
                            ? "typing-cursor"
                            : ""
                        }`}
                      >
                        {msg.content || <span className="typing-cursor" />}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex-shrink-0 px-4 pb-4 pt-2">
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-end bg-input-bg rounded-2xl border border-border-color focus-within:border-[#555]">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={l.replyAsAI}
                rows={1}
                className="flex-1 bg-transparent text-text-primary placeholder-text-muted px-4 py-3.5 resize-none outline-none text-[15px] leading-6 max-h-[200px]"
                disabled={isStreaming || !activeConvId}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isStreaming || !activeConvId}
                className={`m-2 p-1.5 rounded-lg transition-colors ${
                  input.trim() && !isStreaming && activeConvId
                    ? "bg-white text-black hover:bg-gray-200 cursor-pointer"
                    : "bg-[#424242] text-[#676767] cursor-not-allowed"
                }`}
              >
                <SendIcon />
              </button>
            </div>
            <p className="text-center text-xs text-text-muted mt-2">
              {l.aiCanMake}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
