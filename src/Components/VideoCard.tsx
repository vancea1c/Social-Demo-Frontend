// VideoCard.tsx
import React, { useRef, useEffect } from "react";

interface VideoCardProps {
  src: string;
  // add any other props you need (e.g. className, poster, etc.)
}

const VideoCard: React.FC<VideoCardProps> = ({ src }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.muted = true;
    vid.playsInline = true;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            vid.play().catch(() => {
            });
          } else {
            vid.pause();
          }
        });
      },
      {
        root: null, 
        threshold: 0.9, 
      }
    );

    observer.observe(vid);

    return () => {
      observer.unobserve(vid);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="w-full max-w-md mx-auto bg-gray-800 rounded overflow-hidden shadow-lg">
      <video
        ref={videoRef}
        src={src}
        loop
        controls
        className="rounded max-h-200 object-cover"
      />
    </div>
  );
};

export default VideoCard;
