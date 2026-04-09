/**
 * @copyright 2026 hentertrabelsi
 * @contact Email: hentertrabelsi@gmail.com
 * @discord #susuxo
 * 
 * All rights reserved. This software is proprietary and confidential.
 * You may not use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software without explicit permission.
 */
import React, { useState, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { Send, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  playerColor: string;
  message: string;
  timestamp: number;
}

export function Chat({ socket }: { socket: Socket | null }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!socket) return;

    const handleChat = (msg: ChatMessage) => {
      setMessages((prev) => [...prev.slice(-49), msg]);
    };

    socket.on('chat', handleChat);
    return () => {
      socket.off('chat', handleChat);
    };
  }, [socket]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only toggle if not typing in an input or textarea
      if (e.key.toLowerCase() === 't' && 
          document.activeElement?.tagName !== 'INPUT' && 
          document.activeElement?.tagName !== 'TEXTAREA') {
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket || !inputValue.trim()) return;
    socket.emit('chat', inputValue.trim());
    setInputValue('');
  };

  return (
    <div className="fixed bottom-48 left-6 md:bottom-6 md:left-6 w-[calc(100%-3rem)] sm:w-80 z-50 pointer-events-auto">
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[300px] md:h-96"
          >
            {/* Header */}
            <div className="p-3 bg-white/5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare size={18} className="text-vibrant-cyan" />
                <span className="text-white font-black italic uppercase text-sm tracking-wider">Live Chat</span>
                <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-white/40 font-mono">[T]</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/40 hover:text-white transition-colors cursor-pointer"
              >
                <span className="text-xs font-bold uppercase">Hide</span>
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-white/10"
            >
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-white/20 italic text-xs">
                  No messages yet...
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="flex flex-col">
                    <div className="flex items-baseline gap-2">
                      <span 
                        className="font-black text-[10px] uppercase italic"
                        style={{ color: msg.playerColor }}
                      >
                        {msg.playerName}
                      </span>
                      <span className="text-[8px] text-white/20">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-white/90 text-sm break-words leading-tight">
                      {msg.message}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-3 bg-white/5 border-t border-white/10 flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-vibrant-cyan/50 transition-colors"
                maxLength={100}
              />
              <button
                type="submit"
                className="bg-vibrant-cyan hover:bg-vibrant-cyan/80 text-black p-2 rounded-lg transition-colors cursor-pointer"
              >
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="bg-vibrant-cyan text-black p-3 md:p-4 rounded-full shadow-2xl cursor-pointer flex items-center justify-center"
          >
            <MessageSquare size={20} className="md:w-6 md:h-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}


/**
 * @copyright 2026 hentertrabelsi - All Rights Reserved
 */
