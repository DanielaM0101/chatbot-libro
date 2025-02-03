import React from 'react'
import YouTube from 'react-youtube'

interface VideoPlayerProps {
  videoId: string
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId }) => {
  const opts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 0,
      modestbranding: 1,
      rel: 0,
    },
  }

  const isValidVideoId = (id: string): boolean => {
    if (!id || typeof id !== 'string') return false;
    if (id === 'NULL' || id === 'EMPTY') return false;
    return id.length >= 11 && id.length <= 12;
  }

  if (!isValidVideoId(videoId)) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg p-4">
        <p className="text-gray-500 text-center">
          No hay video demostrativo disponible para este tema.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <YouTube 
        videoId={videoId} 
        opts={opts}
        className="w-full h-full"
        iframeClassName="w-full h-full rounded-lg"
        onError={(e: any) => {
          console.error('Error loading video:', e);
        }}
      />
    </div>
  )
}

export default VideoPlayer

