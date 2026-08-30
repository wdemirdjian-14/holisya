'use client';
import { useEffect, useRef, useState } from 'react';

type Chapter = { sec: number; label: string };

function parseChapters(raw: string): Chapter[] {
  if (!raw) return [];
  return raw.split('\n').map((line) => {
    const m = /^\s*(\d{1,2}):(\d{2})\s+(.*)$/.exec(line);
    if (!m) return null;
    return { sec: parseInt(m[1]) * 60 + parseInt(m[2]), label: m[3].trim() };
  }).filter(Boolean) as Chapter[];
}

export default function VideoPlayer({ video, userEmail }: { video: any; userEmail: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [chapters] = useState<Chapter[]>(() => parseChapters(video?.chapters ?? ''));
  const startedRef = useRef(false);
  const watchedRef = useRef(0);
  const lastTickRef = useRef(0);

  const report = (extra: any = {}) => {
    const v = ref.current;
    if (!v) return;
    navigator.sendBeacon?.('/api/videos/progress', new Blob([JSON.stringify({
      videoId: video.id,
      lastPositionSec: Math.floor(v.currentTime),
      secondsWatched: Math.floor(watchedRef.current),
      completed: extra.completed ?? (v.duration > 0 && v.currentTime >= v.duration - 2),
      isStart: extra.isStart ?? false,
    })], { type: 'application/json' }));
  };

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const onLoaded = () => { if (video?.lastPositionSec && video.lastPositionSec < v.duration - 3) v.currentTime = video.lastPositionSec; };
    const onPlay = () => { if (!startedRef.current) { startedRef.current = true; report({ isStart: true }); } };
    const onTimeUpdate = () => {
      const now = v.currentTime;
      if (now > lastTickRef.current && now - lastTickRef.current < 2) watchedRef.current += now - lastTickRef.current;
      lastTickRef.current = now;
    };
    const onPause = () => report();
    const onEnded = () => report({ completed: true });
    v.addEventListener('loadedmetadata', onLoaded);
    v.addEventListener('play', onPlay);
    v.addEventListener('timeupdate', onTimeUpdate);
    v.addEventListener('pause', onPause);
    v.addEventListener('ended', onEnded);
    const interval = setInterval(() => { if (!v.paused) report(); }, 15000);
    const onUnload = () => report();
    window.addEventListener('beforeunload', onUnload);
    return () => {
      report();
      v.removeEventListener('loadedmetadata', onLoaded);
      v.removeEventListener('play', onPlay);
      v.removeEventListener('timeupdate', onTimeUpdate);
      v.removeEventListener('pause', onPause);
      v.removeEventListener('ended', onEnded);
      window.removeEventListener('beforeunload', onUnload);
      clearInterval(interval);
    };
  }, [video?.id]);

  const seek = (sec: number) => { if (ref.current) { ref.current.currentTime = sec; ref.current.play().catch(() => {}); } };

  return (
    <div>
      <div className="relative rounded-xl overflow-hidden bg-black">
        <video
          ref={ref}
          className="w-full max-h-[70vh]"
          controls
          controlsList="nodownload noplaybackrate noremoteplayback"
          disablePictureInPicture
          playsInline
          onContextMenu={(e) => e.preventDefault()}
          src={`/api/videos/stream?id=${video.id}`}
        />
        {/* Filigrane nominatif dissuasif (déplacé lentement) */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <span className="absolute text-white/20 text-[11px] font-medium whitespace-nowrap animate-[holiWatermark_18s_linear_infinite]">{userEmail}</span>
        </div>
      </div>

      {chapters.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-semibold text-[#3B312D] mb-2">Chapitres</p>
          <div className="flex flex-wrap gap-2">
            {chapters.map((c, i) => (
              <button key={i} onClick={() => seek(c.sec)} className="text-xs px-3 py-1.5 rounded-full bg-[#F8F4EF] text-[#3B312D] hover:bg-[#C98F79] hover:text-white transition-colors">
                {String(Math.floor(c.sec / 60)).padStart(2, '0')}:{String(c.sec % 60).padStart(2, '0')} · {c.label}
              </button>
            ))}
          </div>
        </div>
      )}
      <style jsx global>{`
        @keyframes holiWatermark {
          0%   { top: 8%;  left: 6%; }
          25%  { top: 8%;  left: 70%; }
          50%  { top: 85%; left: 70%; }
          75%  { top: 85%; left: 6%; }
          100% { top: 8%;  left: 6%; }
        }
      `}</style>
    </div>
  );
}
