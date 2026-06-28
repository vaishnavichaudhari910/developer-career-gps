import { useState, useRef, useEffect } from 'react';
import { useSelector }                 from 'react-redux';
import { Send, Bot, User, Loader }     from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const SUGGESTIONS = [
  'How do I become a Full Stack Developer?',
  'What projects should I build as a fresher?',
  'How to crack a React interview?',
  'What salary should I expect?',
  'Should I learn TypeScript or Next.js first?',
];

export default function CoachPage() {
  const { user }                    = useSelector(state => state.auth);
  const [messages,  setMessages]    = useState([]);
  const [input,     setInput]       = useState('');
  const [loading,   setLoading]     = useState(false);
  const [convId,    setConvId]      = useState(null);
  const bottomRef                   = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');

    const userMsg = { role: 'user', content: msg };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const { data } = await api.post('/coach/chat', {
        message:        msg,
        conversationId: convId
      });
      setConvId(data.data.conversationId);
      setMessages(prev => [...prev, { role: 'assistant', content: data.data.message }]);
    } catch {
      toast.error('Coach unavailable. Try again.');
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">AI Career Coach</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Chat with GPS Coach for personalized career advice</p>
      </div>

      {/* Chat Window */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 flex flex-col overflow-hidden">

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* Welcome */}
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Bot className="w-7 h-7 text-indigo-500" />
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-white">GPS Coach</h3>
              <p className="text-sm text-gray-400 mt-1 mb-6">
                Hi {user?.name?.split(' ')[0]}! I'm your AI career coach. Ask me anything.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {SUGGESTIONS.map((s, i) => (
                  <button key={i} onClick={() => sendMessage(s)}
                    className="px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors text-left">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message Bubbles */}
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                ${msg.role === 'user'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                {msg.role === 'user'
                  ? <User className="w-4 h-4" />
                  : <Bot className="w-4 h-4" />}
              </div>
              <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed
                ${msg.role === 'user'
                  ? 'bg-indigo-500 text-white rounded-tr-sm'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-sm'}`}>
                {msg.content}
              </div>
            </div>
          ))}

          {/* Loading */}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <Bot className="w-4 h-4 text-gray-500" />
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-tl-sm px-4 py-3">
                <Loader className="w-4 h-4 text-gray-400 animate-spin" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex gap-3">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Ask GPS Coach anything..."
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
            <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
              className="p-3 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 text-white rounded-xl transition-colors">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}