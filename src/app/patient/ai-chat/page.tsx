'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Loader2, Bot, Send, ShieldAlert, Sparkles, User, RefreshCw, Key, Settings, Check } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

function PatientAiChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [emergencyFlagged, setEmergencyFlagged] = useState(false);

  // Custom AI Key State
  const [userApiKey, setUserApiKey] = useState('');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [keySaved, setKeySaved] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get('prompt');

  useEffect(() => {
    const savedKey = localStorage.getItem('ayurcare_gemini_api_key');
    if (savedKey) {
      setUserApiKey(savedKey);
    }
  }, []);

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (userApiKey.trim()) {
      localStorage.setItem('ayurcare_gemini_api_key', userApiKey.trim());
    } else {
      localStorage.removeItem('ayurcare_gemini_api_key');
    }
    setKeySaved(true);
    setTimeout(() => {
      setKeySaved(false);
      setShowKeyModal(false);
    }, 1200);
  };

  const fetchSession = async () => {
    setSessionLoading(true);
    try {
      const res = await fetch('/api/patient/ai-chat');
      if (res.ok) {
        const json = await res.json();
        const sessions = json.sessions || [];
        if (sessions.length > 0) {
          const latest = sessions[0];
          setSessionId(latest.id);
          setMessages(JSON.parse(latest.messages || '[]'));
          setEmergencyFlagged(latest.flaggedForReview);
        } else {
          setMessages([
            {
              role: 'assistant',
              content: 'Namaste! I am PrakritiAI, your Ayurvedic & Clinical Wellness Assistant. I am here to help you with personalized health advice, herb pharmacology, diet guidance (Pathya/Apathya), and symptom triaging.\n\nWhat health question or symptom would you like to discuss today?',
            }
          ]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSessionLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle URL pre-seeded prompts automatically
  useEffect(() => {
    if (!sessionLoading && initialPrompt && messages.length <= 1) {
      const sendInitialPrompt = async () => {
        const userQuery = initialPrompt.trim();
        const updatedMessages = [...messages, { role: 'user', content: userQuery } as ChatMessage];
        setMessages(updatedMessages);
        setLoading(true);

        try {
          const res = await fetch('/api/patient/ai-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId,
              message: userQuery,
              userApiKey: userApiKey || undefined,
            }),
          });

          if (res.ok) {
            const json = await res.json();
            setSessionId(json.sessionId);
            setMessages(json.history);
            if (json.flagged) {
              setEmergencyFlagged(true);
            }
          }
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      };
      sendInitialPrompt();
    }
  }, [sessionLoading, initialPrompt]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || loading) return;

    const userQuery = inputMsg.trim();
    setInputMsg('');
    
    const updatedMessages = [...messages, { role: 'user', content: userQuery } as ChatMessage];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const res = await fetch('/api/patient/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: userQuery,
          userApiKey: userApiKey || undefined,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setSessionId(json.sessionId);
        setMessages(json.history);
        if (json.flagged) {
          setEmergencyFlagged(true);
        }
      } else {
        const json = await res.json();
        setMessages([
          ...updatedMessages,
          { role: 'assistant', content: `⚠️ Error: ${json.error || 'Server connection failed.'}` }
        ]);
      }
    } catch (err) {
      setMessages([
        ...updatedMessages,
        { role: 'assistant', content: '⚠️ Server connection error. Please try again.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetSession = () => {
    if (confirm('Start a fresh conversation? This clears the active chat window.')) {
      setSessionId(null);
      setEmergencyFlagged(false);
      setMessages([
        {
          role: 'assistant',
          content: 'Namaste! I am PrakritiAI, your Ayurvedic Wellness Assistant. How can I help you with your health balance today?',
        }
      ]);
    }
  };

  return (
    <div className="flex-grow flex flex-col font-sans max-w-4xl mx-auto w-full h-[80vh] border border-slate-100 bg-white rounded-2xl shadow-lg overflow-hidden relative">
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-700 via-amber-500 to-emerald-700 z-10"></div>

      {/* Bot Chat Header */}
      <header className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display font-bold text-slate-800 flex items-center text-sm sm:text-base">
              PrakritiAI <Sparkles className="w-4 h-4 text-amber-500 ml-1.5 fill-amber-100 animate-pulse" />
            </h2>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Ayurvedic Triage Assistant</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowKeyModal(true)}
            className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-600 rounded-lg flex items-center space-x-1 cursor-pointer transition shadow-sm"
            title="Configure Live AI Key"
          >
            <Key className="w-3.5 h-3.5 text-emerald-600" />
            <span>{userApiKey ? 'AI Key Set ✓' : 'Add Gemini Key'}</span>
          </button>

          <button
            onClick={handleResetSession}
            className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-500 rounded-lg flex items-center space-x-1 cursor-pointer transition shadow-sm"
            title="Reset chat session"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>
        </div>
      </header>

      {/* Key Modal */}
      {showKeyModal && (
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <form onSubmit={handleSaveApiKey} className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-800 text-sm flex items-center">
                <Key className="w-4 h-4 text-emerald-600 mr-2" /> Live AI Engine Setup
              </h3>
              <button type="button" onClick={() => setShowKeyModal(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">✕</button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              PrakritiAI uses high-accuracy clinical reasoning. Optionally paste your free <strong>Google Gemini API Key</strong> to connect live cloud model inference.
            </p>
            <input
              type="password"
              placeholder="Paste Google Gemini API Key (AIzaSy...)"
              value={userApiKey}
              onChange={(e) => setUserApiKey(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                className="px-3 py-2 text-xs text-slate-500 hover:text-slate-800 font-semibold"
              >
                Close
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center"
              >
                {keySaved ? <Check className="w-4 h-4 mr-1" /> : null}
                {keySaved ? 'Saved!' : 'Save Key'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Emergency Alert Indicator */}
      {emergencyFlagged && (
        <div className="bg-red-50 border-b border-red-200 p-4 text-xs font-semibold text-red-700 flex items-start space-x-3 animate-pulse">
          <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong>⚠️ CRITICAL SAFETY NOTICE:</strong>
            <p className="leading-relaxed mt-1">
              You described acute symptoms or expressions of emergency distress. This chat was flagged. Please contact local emergency services immediately. For standard Ayurvedic support, consult a verified doctor.
            </p>
          </div>
        </div>
      )}

      {/* Chat Messages Log */}
      <section className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/20">
        {sessionLoading ? (
          <div className="h-full flex items-center justify-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mr-2" />
            <span>Syncing bot logs...</span>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              return (
                <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                  <div className={`flex items-start space-x-3 max-w-[85%] ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      isUser ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-emerald-700" />}
                    </div>
                    <div className={`p-4 rounded-2xl text-xs font-semibold leading-relaxed ${
                      isUser 
                        ? 'bg-emerald-700 text-white rounded-tr-none shadow-sm' 
                        : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none shadow-sm'
                    }`}>
                      <p className="whitespace-pre-line">{msg.content}</p>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {loading && (
              <div className="flex justify-start items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-emerald-700" />
                </div>
                <div className="bg-white border border-slate-100 text-slate-400 rounded-2xl rounded-tl-none p-4 text-xs font-semibold flex items-center shadow-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600 mr-2" />
                  PrakritiAI is generating prompt-specific analysis...
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </>
        )}
      </section>

      {/* Input Message Area */}
      <footer className="p-4 border-t border-slate-100 bg-slate-50/50">
        <form onSubmit={handleSend} className="flex items-center space-x-3">
          <input
            type="text"
            required
            disabled={loading || sessionLoading}
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder="Type your health prompt (e.g. 'I have stomach ache', 'remedies for acidity')..."
            className="flex-grow px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none placeholder-slate-400 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !inputMsg.trim()}
            className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition duration-200 shadow cursor-pointer disabled:opacity-50 flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </footer>
    </div>
  );
}

export default function PatientAiChatPage() {
  return (
    <Suspense fallback={
      <div className="flex-grow flex items-center justify-center min-h-[500px]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    }>
      <PatientAiChat />
    </Suspense>
  );
}
