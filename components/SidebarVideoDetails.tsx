'use client';

import { useVideo } from '@/context/VideoContext';
import { VideoDetails } from '@/components/VideoDetails';

export function SidebarVideoDetails() {
  const { videoDetails } = useVideo();

  console.log('Current video details:', videoDetails);

  if (!videoDetails) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4 text-gray-400 text-center" >
        Enter a YouTube URL to see video details
      </div>
    );
  }

  if (!videoDetails.thumbnailUrl || !videoDetails.videoTitle) {
    console.log('Missing required video details:', videoDetails);
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4 text-gray-400 text-center" >
        Invalid video details
      </div>
    );
  }

  return <VideoDetails {...videoDetails} />;
} 