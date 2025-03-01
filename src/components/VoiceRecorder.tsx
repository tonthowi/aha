'use client';

import { useState, useEffect } from 'react';
import { useDeepgram } from '../lib/contexts/DeepgramContext';
import { motion } from 'framer-motion';
import { MicrophoneIcon, StopIcon } from '@heroicons/react/24/outline';

interface VoiceRecorderProps {
  onTranscriptChange?: (transcript: string) => void;
}

export default function VoiceRecorder({ onTranscriptChange }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const { connectToDeepgram, disconnectFromDeepgram, connectionState, realtimeTranscript } = useDeepgram();

  const handleStartRecording = async () => {
    await connectToDeepgram();
    setIsRecording(true);
  };

  const handleStopRecording = async () => {
    disconnectFromDeepgram();
    setIsRecording(false);
  };

  useEffect(() => {
    if (realtimeTranscript && onTranscriptChange) {
      onTranscriptChange(realtimeTranscript);
    }
  }, [realtimeTranscript, onTranscriptChange]);

  return (
    <div className="w-full max-w-md">
      <button
        onClick={isRecording ? handleStopRecording : handleStartRecording}
        className={`w-full py-2 px-4 rounded-lg flex items-center justify-center gap-2 ${
          isRecording 
            ? 'bg-black text-white hover:bg-black/90' 
            : 'bg-white text-black border border-[#e6e6e6] hover:bg-[#f7f7f7]'
        } font-medium transition-colors card-shadow-hover`}
      >
        {isRecording ? (
          <>
            <StopIcon className="w-5 h-5" />
            <span>Stop Recording</span>
          </>
        ) : (
          <>
            <MicrophoneIcon className="w-5 h-5" />
            <span>Start Recording</span>
          </>
        )}
      </button>
      {isRecording && (
        <div className="mt-4 p-4 bg-white rounded-xl card-shadow-hover">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-8 h-8 bg-black rounded-full mx-auto mb-4"
          />
          <p className="text-sm text-[#666666]">{realtimeTranscript || "Listening..."}</p>
        </div>
      )}
    </div>
  );
}