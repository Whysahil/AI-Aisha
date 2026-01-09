import React, { useState } from 'react';
import ChatInterface from './components/ChatInterface';
import VoiceMode from './components/VoiceMode';

const App: React.FC = () => {
  const [isVoiceMode, setIsVoiceMode] = useState(false);

  return (
    <div className="h-screen w-full bg-gray-950 text-white overflow-hidden">
      {isVoiceMode ? (
        <VoiceMode onEndCall={() => setIsVoiceMode(false)} />
      ) : (
        <ChatInterface onStartCall={() => setIsVoiceMode(true)} />
      )}
    </div>
  );
};

export default App;
