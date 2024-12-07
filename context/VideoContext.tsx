'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type VideoDetails = {
  thumbnailUrl: string;
  videoTitle: string;
  channelTitle: string;
  publishedAt: string;
  videoDescription: string;
} | null;

type VideoContextType = {
  videoDetails: VideoDetails;
  setVideoDetails: (details: VideoDetails) => void;
};

const VideoContext = createContext<VideoContextType | undefined>(undefined);

export function VideoProvider({ children }: { children: ReactNode }) {
  const [videoDetails, setVideoDetails] = useState<VideoDetails>(null);

  return (
    <VideoContext.Provider value={{ videoDetails, setVideoDetails }}>
      {children}
    </VideoContext.Provider>
  );
}

export function useVideo() {
  const context = useContext(VideoContext);
  if (context === undefined) {
    throw new Error('useVideo must be used within a VideoProvider');
  }
  return context;
} 