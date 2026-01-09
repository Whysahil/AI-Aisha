import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Mic, MicOff, PhoneOff, Activity } from 'lucide-react';
import { ConnectionState } from '../types';
import { SYSTEM_INSTRUCTION, VOICE_MODEL } from '../constants';
import { createPcmBlob, base64ToUint8Array, decodeAudioData } from '../utils/audio';

interface VoiceModeProps {
  onEndCall: () => void;
}

const VoiceMode: React.FC<VoiceModeProps> = ({ onEndCall }) => {
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0); // For visualizer

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sessionRef = useRef<any>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const aiRef = useRef<GoogleGenAI | null>(null);

  useEffect(() => {
    // Initialize AI client
    aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY });
    connect();

    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const connect = async () => {
    setConnectionState(ConnectionState.CONNECTING);
    try {
      // Audio Context Setup
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000, // Matching model output
      });

      // Input Stream (Microphone)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Audio Processing for Input
      const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000, // Matching model input expectation
      });
      const source = inputAudioContext.createMediaStreamSource(stream);
      const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
      
      scriptProcessor.onaudioprocess = (e) => {
        if (isMuted) return;
        
        const inputData = e.inputBuffer.getChannelData(0);
        
        // Calculate volume for visualizer
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += Math.abs(inputData[i]);
        }
        const avg = sum / inputData.length;
        setVolume(Math.min(avg * 500, 100)); // Scale for visual

        const pcmBlob = createPcmBlob(inputData);
        
        // Send to model
        if (sessionRef.current) {
             sessionRef.current.sendRealtimeInput({ media: pcmBlob });
        }
      };

      source.connect(scriptProcessor);
      scriptProcessor.connect(inputAudioContext.destination);

      // Connect to Gemini Live API
      const session = await aiRef.current!.live.connect({
        model: VOICE_MODEL,
        callbacks: {
          onopen: () => {
            setConnectionState(ConnectionState.CONNECTED);
            console.log("Connected to Live API");
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Audio Output
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && audioContextRef.current) {
              try {
                const ctx = audioContextRef.current;
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                
                const audioBuffer = await decodeAudioData(
                  base64ToUint8Array(base64Audio),
                  ctx,
                  24000,
                  1
                );

                const sourceNode = ctx.createBufferSource();
                sourceNode.buffer = audioBuffer;
                sourceNode.connect(ctx.destination);
                
                sourceNode.addEventListener('ended', () => {
                   sourcesRef.current.delete(sourceNode);
                });

                sourceNode.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                sourcesRef.current.add(sourceNode);

              } catch (err) {
                console.error("Audio decoding error:", err);
              }
            }
            
            // Handle Interruption
            if (message.serverContent?.interrupted) {
                sourcesRef.current.forEach(node => {
                    try { node.stop(); } catch(e) {}
                });
                sourcesRef.current.clear();
                nextStartTimeRef.current = 0;
            }
          },
          onclose: () => {
            setConnectionState(ConnectionState.DISCONNECTED);
          },
          onerror: (err) => {
            console.error("Live API Error:", err);
            setConnectionState(ConnectionState.ERROR);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: SYSTEM_INSTRUCTION,
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Fenrir' } } // Fenrir is softer/deeper, but for GF maybe Kore or try different ones. Zephyr is nice. Let's use Zephyr for soft female tone.
          }
        }
      });
      sessionRef.current = session;

    } catch (error) {
      console.error("Connection failed:", error);
      setConnectionState(ConnectionState.ERROR);
    }
  };

  const disconnect = () => {
    if (sessionRef.current) {
        // No explicit close method on the session object returned by connect?
        // The instructions say use session.close(), but let's check safety.
        // Assuming session object has close based on prompt instructions.
         try { (sessionRef.current as any).close(); } catch(e) {}
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setConnectionState(ConnectionState.DISCONNECTED);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-950 flex flex-col items-center justify-center p-6 animate-fade-in">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-gray-950 to-gray-950 pointer-events-none" />

      {/* Avatar / Visualizer */}
      <div className="relative z-10 flex flex-col items-center justify-center space-y-8 w-full max-w-md">
        <div className="relative">
            {/* Pulse Effect */}
            <div className={`absolute inset-0 rounded-full bg-pink-500/20 blur-xl transition-all duration-300 ${connectionState === ConnectionState.CONNECTED ? 'scale-150 animate-pulse' : 'scale-100'}`} style={{ opacity: volume / 100 + 0.2 }} />
            
            <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-pink-500/30 shadow-[0_0_30px_rgba(236,72,153,0.3)] relative bg-gray-900 flex items-center justify-center">
                 <img 
                    src="https://picsum.photos/400/400?grayscale&blur=2" 
                    alt="Aisha" 
                    className="w-full h-full object-cover opacity-80"
                 />
                 {/* Overlay to darken image */}
                 <div className="absolute inset-0 bg-pink-900/20 mix-blend-overlay" />
            </div>
        </div>

        <div className="text-center space-y-2">
            <h2 className="text-2xl font-light text-white tracking-widest">AISHA</h2>
            <div className="flex items-center justify-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${connectionState === ConnectionState.CONNECTED ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
                <span className="text-sm text-gray-400 uppercase tracking-widest text-xs">
                    {connectionState === ConnectionState.CONNECTED ? 'Voice Active' : connectionState === ConnectionState.CONNECTING ? 'Connecting...' : 'Disconnected'}
                </span>
            </div>
        </div>

        {/* Status Text / Transcript Placeholder */}
        <div className="h-12 flex items-center justify-center text-pink-300/80 text-sm font-medium animate-pulse">
            {connectionState === ConnectionState.CONNECTED ? "Listening..." : "Waiting for connection..."}
        </div>
      </div>

      {/* Controls */}
      <div className="relative z-10 mt-16 flex items-center space-x-8">
        <button 
            onClick={toggleMute}
            className={`p-4 rounded-full transition-all duration-200 ${isMuted ? 'bg-white text-gray-900' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
        >
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
        </button>

        <button 
            onClick={onEndCall}
            className="p-6 rounded-full bg-red-500/90 text-white shadow-lg hover:bg-red-600 transition-all duration-200 hover:scale-105 active:scale-95"
        >
            <PhoneOff size={32} fill="currentColor" />
        </button>
      </div>
    </div>
  );
};

export default VoiceMode;
