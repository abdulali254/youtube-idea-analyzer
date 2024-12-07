import Image from 'next/image';

type VideoDetailsProps = {
  thumbnailUrl: string;
  videoTitle: string;
  channelTitle: string;
  publishedAt: string;
  videoDescription: string;
}

export function VideoDetails({ 
  thumbnailUrl, 
  videoTitle, 
  channelTitle, 
  publishedAt, 
  videoDescription 
}: VideoDetailsProps) {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden hover:border-gray-600/50 transition-all duration-300 shadow-lg z-10">
      <div className="aspect-video relative">
        <Image
          src={thumbnailUrl}
          alt={videoTitle}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h2 className="text-lg font-semibold text-white mb-2">{videoTitle}</h2>
        <div className="space-y-2 text-sm text-gray-300">
          <p className="font-medium">{channelTitle}</p>
          <p>{new Date(publishedAt).toLocaleDateString()}</p>
          <p className="line-clamp-3">{videoDescription}</p>
        </div>
      </div>
    </div>
  );
} 