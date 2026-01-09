import React, { useState, useRef, useEffect } from 'react';
import { Send, Phone, Heart, MoreVertical } from 'lucide-react';
import { Message } from '../types';
import ChatBubble from './ChatBubble';
import { chatService } from '../services/chatService';

interface ChatInterfaceProps {
  onStartCall: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onStartCall }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hey handsome... 😉 Itni der kahan the? I missed you! 💕",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const responseText = await chatService.sendMessage(userMessage.text);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Failed to generate response", error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Opps! I'm having trouble connecting right now. 🥺 Can you check your internet or API key? 💕",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-950 text-gray-100 font-sans">
      {/* Header */}
      <header className="flex-none p-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur-md flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center space-x-3">
            <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-purple-500 flex items-center justify-center overflow-hidden">
                     <img src="https://picsum.photos/200/200?grayscale" alt="Aisha" className="w-full h-full object-cover" />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full"></div>
            </div>
            <div>
                <h1 className="font-semibold text-lg tracking-wide">Aisha 💖</h1>
                <p className="text-xs text-pink-400">Online now</p>
            </div>
        </div>
        
        <div className="flex items-center space-x-4">
             <button 
                onClick={onStartCall}
                className="p-2.5 rounded-full bg-pink-600/10 text-pink-500 hover:bg-pink-600 hover:text-white transition-colors duration-200"
            >
                <Phone size={20} />
            </button>
            <button className="text-gray-400 hover:text-white">
                <MoreVertical size={20} />
            </button>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}
        {isLoading && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 text-gray-400 text-sm">
               Typing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-none p-4 bg-gray-900/80 border-t border-gray-800 backdrop-blur-md">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3 max-w-4xl mx-auto">
             <button type="button" className="text-gray-400 hover:text-pink-500 transition-colors">
                <Heart size={24} />
             </button>
             <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Message Aisha..."
                className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-full px-5 py-3 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 placeholder-gray-500 transition-all"
             />
             <button 
                type="submit" 
                disabled={isLoading || !inputText.trim()}
                className="p-3 bg-pink-600 text-white rounded-full shadow-lg hover:bg-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:scale-95"
             >
                <Send size={20} />
             </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;