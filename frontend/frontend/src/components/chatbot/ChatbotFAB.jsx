import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
  SparklesIcon, XMarkIcon, PaperAirplaneIcon, TrashIcon,
} from '@heroicons/react/24/outline';
import { toggleChatbot, selectChatOpen, selectChatMessages, selectChatTyping, sendChatMessage, clearChat } from '../../store/slices/chatbotSlice.js';
import ReactMarkdown from 'react-markdown';

const QUICK_ACTIONS = [
  { label: '🍕 Recommend food', prompt: 'What food do you recommend for tonight?' },
  { label: '🏷️ Best coupons', prompt: 'What are the best coupons available right now?' },
  { label: '⚡ Fastest delivery', prompt: 'Which restaurants have the fastest delivery?' },
  { label: '🌿 Veg options', prompt: 'Show me the best vegetarian restaurants' },
];

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="w-7 h-7 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full
                      flex items-center justify-center text-white text-xs font-bold shrink-0">
        AI
      </div>
      <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex gap-1.5 items-center">
          {[0, 1, 2].map((i) => (
            <motion.div key={i}
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
              className="w-2 h-2 bg-gray-400 dark:bg-gray-400 rounded-full"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ChatMessage({ message }) {
  const isUser = message.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {!isUser && (
        <div className="w-7 h-7 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full
                        flex items-center justify-center text-white text-xs font-bold shrink-0">
          AI
        </div>
      )}
      <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
        isUser
          ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-br-sm'
          : `bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-sm ${message.isError ? 'border border-red-300 dark:border-red-700' : ''}`
      }`}>
        {isUser ? (
          <p>{message.content}</p>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none
                          prose-p:my-1 prose-strong:text-gray-900 dark:prose-strong:text-white">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function ChatbotFAB() {
  const dispatch = useDispatch();
  const isOpen = useSelector(selectChatOpen);
  const messages = useSelector(selectChatMessages);
  const isTyping = useSelector(selectChatTyping);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  const handleSend = (text = input) => {
    const msg = text.trim();
    if (!msg || isTyping) return;
    dispatch(sendChatMessage(msg));
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="w-80 sm:w-96 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl
                       border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden"
            style={{ height: '520px' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-pink-500 px-4 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                  <SparklesIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">FoodRush AI</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-white/80 text-xs">Always ready to help</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button onClick={() => dispatch(clearChat())}
                    className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    title="Clear chat">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => dispatch(toggleChatbot())}
                  className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center pb-4">
                  <div className="text-5xl mb-4">🤖</div>
                  <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">Hi! I'm FoodRush AI</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                    I can help with food recommendations, coupons, and more!
                  </p>
                  <div className="grid grid-cols-2 gap-2 w-full">
                    {QUICK_ACTIONS.map((action) => (
                      <button key={action.label} onClick={() => handleSend(action.prompt)}
                        className="text-xs text-left bg-orange-50 dark:bg-orange-900/20
                                   text-orange-600 dark:text-orange-400 border border-orange-200
                                   dark:border-orange-800 rounded-xl px-3 py-2
                                   hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors">
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => <ChatMessage key={i} message={msg} />)}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-gray-100 dark:border-gray-800">
              <div className="flex gap-2 items-end">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything..."
                  rows={1}
                  className="flex-1 resize-none rounded-xl border border-gray-200 dark:border-gray-700
                             bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white px-3 py-2.5
                             focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                  style={{ maxHeight: '100px' }}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isTyping}
                  className="bg-gradient-to-r from-orange-500 to-pink-500 text-white p-2.5
                             rounded-xl disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB Button */}
      <motion.button
        onClick={() => dispatch(toggleChatbot())}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 bg-gradient-to-br from-orange-500 to-pink-500 text-white
                   rounded-2xl shadow-xl shadow-orange-300 dark:shadow-orange-900/50
                   flex items-center justify-center relative"
        aria-label="Open AI assistant"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isOpen ? 'x' : 'sparkle'}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {isOpen
              ? <XMarkIcon className="w-6 h-6" />
              : <SparklesIcon className="w-6 h-6" />
            }
          </motion.div>
        </AnimatePresence>

        {/* Pulse ring */}
        {!isOpen && (
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-2xl bg-orange-400"
            style={{ zIndex: -1 }}
          />
        )}
      </motion.button>
    </div>
  );
}
