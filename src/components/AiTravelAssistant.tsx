import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Compass, MapPin, Calendar, Users, Coffee, Shield, RefreshCw, Copy, Check, ArrowRight } from 'lucide-react';
import { ChatMessage, PageRoute } from '../types';

interface AiTravelAssistantProps {
  initialDestination?: string;
  tripContext?: {
    destination?: string;
    startLocation?: string;
    dates?: string;
    travelers?: number;
    interests?: string[];
  };
  onNavigate?: (page: PageRoute) => void;
  onApplyPlan?: (destination: string) => void;
  isFloatingModal?: boolean;
  onCloseModal?: () => void;
}

export const AiTravelAssistant: React.FC<AiTravelAssistantProps> = ({
  initialDestination,
  tripContext,
  onNavigate,
  onApplyPlan,
  isFloatingModal = false,
  onCloseModal,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: initialDestination
        ? `Hello! I’m Aura, your AI travel companion for ${initialDestination}. Tell me what you’d love to experience or what you’re planning, and I’ll help you make the most of your trip.`
        : `Hello! I’m Aura, your AI travel companion. Tell me where you’re going or what you’re looking for, and I’ll help you plan your trip.`,
      timestamp: Date.now(),
      suggestedPrompts: initialDestination
        ? [
            `Plan a 3-day itinerary for ${initialDestination}`,
            `What are the top attractions in ${initialDestination}?`,
            `What is a realistic daily budget for ${initialDestination}?`,
            `Tips for packing & safety in ${initialDestination}`,
          ]
        : [
            'Plan a 3-day trip',
            'Suggest budget-friendly destinations',
            'Find top attractions',
            'Tips for packing & travel',
          ],
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || inputMessage).trim();
    if (!messageContent || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageContent,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          tripContext: tripContext || { destination: initialDestination },
        }),
      });

      if (!response.ok) {
        throw new Error(`Chat request failed with status ${response.status}`);
      }

      const data = await response.json();
      const assistantReply = data.reply || data.fallbackReply || "I'm here to help! Could you please clarify your destination or travel dates?";

      const aiResponse: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: assistantReply,
        timestamp: Date.now(),
        suggestedPrompts: [
          'Can you customize this with more scenic nature walks?',
          'What are the best local vegetarian restaurants nearby?',
          'How should I get around efficiently without heavy transit?',
        ],
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackResponse: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: `Here is a peaceful tip: When planning your visit to ${initialDestination || 'your destination'}, aim to visit major monuments between 8:30 AM and 11:00 AM. Keep afternoons for shaded cafes, artisan galleries, and gardens to avoid midday fatigue.`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, fallbackResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderInlineText = (text: string) =>
    text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
      part.startsWith('**') && part.endsWith('**') ? (
        <strong key={index}>{part.slice(2, -2)}</strong>
      ) : (
        part
      )
    );

  const formatText = (text: string) => {
    // Simple markdown-style bold & list formatter. Render content as React nodes
    // so AI responses never become executable HTML.
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('### ') || line.startsWith('## ')) {
        return (
          <h4
            key={idx}
            className="font-serif font-bold text-[#183B32] text-base mt-3 mb-1"
          >
            {renderInlineText(line.replace(/#+\s/, ''))}
          </h4>
        );
      }
      if (line.startsWith('* ') || line.startsWith('- ')) {
        return (
          <li
            key={idx}
            className="ml-4 list-disc text-sm text-[#2D312E] leading-relaxed my-0.5"
          >
            {renderInlineText(line.replace(/^[\*\-]\s/, ''))}
          </li>
        );
      }
      if (line.trim() === '') {
        return <div key={idx} className="h-2" />;
      }
      return (
        <p
          key={idx}
          className="text-sm text-[#2D312E] leading-relaxed mb-1.5"
        >
          {renderInlineText(line)}
        </p>
      );
    });
  };

  return (
    <div
      className={`flex flex-col bg-[#FAF7F2] ${
        isFloatingModal
          ? 'h-[85vh] max-h-[700px] w-full max-w-2xl rounded-3xl border border-[#E5DFD3] shadow-2xl overflow-hidden'
          : 'min-h-[600px] rounded-3xl border border-[#E5DFD3] calm-card overflow-hidden shadow-sm'
      }`}
    >
      {/* Top Header */}
      <div className="bg-[#FAF7F2] px-6 py-4 border-b border-[#E5DFD3] flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#183B32] to-[#245246] text-[#E0B466] flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-base text-[#183B32]">
                Aura • Gemini Travel Assistant
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EFE9DE] text-[#183B32] font-semibold uppercase tracking-wider">
                Live AI
              </span>
            </div>
            <p className="text-xs text-[#57605B]">
              {tripContext?.destination
                ? `Context: Exploring ${tripContext.destination}`
                : 'Smart routes, food spots, local secrets & itinerary planning'}
            </p>
          </div>
        </div>

        {isFloatingModal && onCloseModal && (
          <button
            onClick={onCloseModal}
            className="p-2 rounded-full hover:bg-[#EFE9DE] text-[#57605B] transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Message Stream */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-peaceful-bg-pattern">
        {messages.map((msg) => {
          const isAi = msg.role === 'assistant';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isAi ? 'items-start' : 'items-end'} animate-fade-in`}
            >
              <div className="flex items-start gap-2.5 max-w-[90%] sm:max-w-[82%]">
                {isAi && (
                  <div className="w-7 h-7 rounded-xl bg-[#183B32] text-[#E0B466] flex items-center justify-center shrink-0 mt-1 shadow-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`p-4 rounded-2xl shadow-xs transition-all ${
                    isAi
                      ? 'bg-[#FFFFFF] text-[#202422] border border-[#E7DFD1] rounded-tl-sm'
                      : 'bg-[#183B32] text-[#FAF7F2] rounded-tr-sm'
                  }`}
                >
                  {isAi ? (
                    <div>{formatText(msg.content)}</div>
                  ) : (
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  )}

                  <div
                    className={`mt-2.5 pt-2 flex items-center justify-between text-[10px] ${
                      isAi
                        ? 'border-t border-[#F0EBE0] text-[#8C938E]'
                        : 'border-t border-[#245246] text-[#FAF7F2]/70'
                    }`}
                  >
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {isAi && (
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="flex items-center gap-1 hover:text-[#183B32] transition-colors cursor-pointer"
                        title="Copy text"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-[#183B32]" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Prompt suggestions for last AI message */}
              {isAi && msg.suggestedPrompts && (
                <div className="mt-2.5 ml-9 flex flex-wrap gap-1.5">
                  {msg.suggestedPrompts.map((prompt, pIdx) => (
                    <button
                      key={pIdx}
                      onClick={() => handleSendMessage(prompt)}
                      className="text-xs px-3 py-1.5 rounded-full bg-[#FAF7F2] hover:bg-[#FFFFFF] border border-[#E2DACB] text-[#4E3C2F] font-medium transition-all hover:scale-102 active:scale-98 shadow-2xs text-left"
                    >
                      ✨ {prompt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2.5 text-xs text-[#57605B] bg-[#FFFFFF] border border-[#E7DFD1] px-4 py-3 rounded-2xl w-fit animate-pulse">
            <div className="w-4 h-4 border-2 border-[#183B32] border-t-transparent rounded-full animate-spin" />
            <span>Aura is crafting thoughtful travel recommendations...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Bar */}
      <div className="p-4 bg-[#FAF7F2] border-t border-[#E5DFD3] shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask Aura anything about destinations, routes, packing, or food..."
            className="flex-1 px-4 py-3 rounded-2xl bg-[#FFFFFF] border border-[#E2DACB] text-sm text-[#202422] placeholder:text-[#8C938E] focus:outline-none focus:ring-2 focus:ring-[#183B32]/30 focus:border-[#183B32] transition-all"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="p-3 rounded-2xl bg-[#183B32] hover:bg-[#245246] disabled:opacity-40 disabled:cursor-not-allowed text-[#FAF7F2] shadow-sm transition-all active:scale-95 cursor-pointer"
            aria-label="Send message to AI assistant"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
