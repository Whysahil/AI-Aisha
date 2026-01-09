import React from 'react';
import { Message } from '../types';

interface ChatBubbleProps {
  message: Message;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in-up`}>
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm md:text-base leading-relaxed shadow-md
        ${
          isUser
            ? 'bg-pink-600 text-white rounded-tr-sm'
            : 'bg-gray-800 text-pink-100 border border-gray-700 rounded-tl-sm'
        }`}
      >
        {message.text}
        <div className={`text-[10px] mt-1 opacity-60 ${isUser ? 'text-pink-200' : 'text-gray-400'}`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
