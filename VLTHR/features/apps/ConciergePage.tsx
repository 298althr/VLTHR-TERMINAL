'use client';

import { useState, useEffect } from 'react';
import { AppShell } from './AppShell';
import { MessageSquare, Activity, Sparkles, Send } from 'lucide-react';
import { motion } from 'framer-motion';

export function ConciergePage() {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Welcome to VLTHR Concierge. How can I assist with your market research today?' }
  ]);

  return (
    <AppShell title="VLTHR Concierge">
      <div className="flex flex-col h-full max-h-[550px]">
        <div className="flex-1 overflow-y-auto flex flex-col gap-4 p-2 no-scrollbar">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[80%] p-4 rounded-2xl text-xs leading-relaxed ${
                m.role === 'ai' ? 'glass-liquid border border-accent/20 text-white' : 'bg-accent text-white'
              }`}>
                {m.text}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 glass-liquid p-3 rounded-2xl flex items-center gap-2">
          <Sparkles size={16} className="text-accent ml-1" />
          <input 
            type="text" 
            placeholder="Ask about macro trends, earnings, or technicals..."
            className="bg-transparent border-none outline-none text-white text-xs w-full font-medium placeholder:text-white/20"
          />
          <button className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white active:scale-90 transition-transform">
            <Send size={14} />
          </button>
        </div>
      </div>
    </AppShell>
  );
}
