
import React, { useRef, useState, useEffect } from 'react';
import { X, Download, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { FileItem, FileCategory } from '../types';
import { ApiService } from '../services/apiService';
import { getCategoryFromMime } from '../utils/fileUtils';

interface MediaPreviewProps {
  item: FileItem | null;
  externalUrl?: string | null; // For direct URL playing
  onClose: () => void;
}

export const MediaPreview: React.FC<MediaPreviewProps> = ({ item, externalUrl, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  
  // Seeker State
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const sourceUrl = externalUrl ? externalUrl : (item ? ApiService.getDownloadUrl(item.id) : '');
  const category = externalUrl ? FileCategory.VIDEO : (item ? getCategoryFromMime(item.filetype) : FileCategory.DOCUMENT);
  const title = externalUrl ? 'Network Stream' : (item?.text || 'Untitled');

  useEffect(() => {
    // Reset state when source changes
    setIsPlaying(false);
    setPlaybackRate(1.0);
    setCurrentTime(0);
    setDuration(0);
  }, [sourceUrl]);

  if (!item && !externalUrl) return null;

  const handleTogglePlay = () => {
    const media = videoRef.current || audioRef.current;
    if (media) {
      if (media.paused) {
        media.play();
        setIsPlaying(true);
      } else {
        media.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed);
    const media = videoRef.current || audioRef.current;
    if (media) media.playbackRate = speed;
  };

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLMediaElement>) => {
    setCurrentTime(e.currentTarget.currentTime);
    setDuration(e.currentTarget.duration || 0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    const media = videoRef.current || audioRef.current;
    if (media) media.currentTime = time;
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl h-full md:h-[90vh] flex flex-col md:flex-row bg-surface rounded-none md:rounded-2xl overflow-hidden shadow-2xl border border-white/10">
        
        {/* Main Content Area */}
        <div className="flex-1 flex items-center justify-center bg-black relative overflow-hidden group">
          {category === FileCategory.IMAGE && (
            <img 
              src={sourceUrl} 
              alt={title} 
              className="max-w-full max-h-full object-contain"
            />
          )}

          {category === FileCategory.VIDEO && (
            <div className="relative w-full h-full flex items-center justify-center">
              <video 
                ref={videoRef}
                src={sourceUrl}
                className="max-w-full max-h-full"
                controls={false}
                onClick={handleTogglePlay}
                onEnded={() => setIsPlaying(false)}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleTimeUpdate}
              />
              {/* Custom Play Overlay */}
              {!isPlaying && (
                <button 
                  onClick={handleTogglePlay}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors z-10"
                >
                  <div className="p-6 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl group-hover:scale-110 transition-transform">
                     <Play className="w-12 h-12 text-white fill-white" />
                  </div>
                </button>
              )}
            </div>
          )}

          {category === FileCategory.AUDIO && (
            <div className="flex flex-col items-center gap-8 p-12">
               <div className="w-48 h-48 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center animate-pulse-slow shadow-2xl shadow-primary/30">
                 <Volume2 className="w-20 h-20 text-white" />
               </div>
               <audio 
                ref={audioRef} 
                src={sourceUrl} 
                onEnded={() => setIsPlaying(false)} 
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleTimeUpdate}
               />
            </div>
          )}

          {category === FileCategory.DOCUMENT && (
            <div className="text-center p-8">
              <p className="text-zinc-400 mb-4">Preview not available for this document type.</p>
              <a 
                href={sourceUrl} 
                target="_blank" 
                rel="noreferrer"
                className="px-6 py-3 bg-primary hover:bg-primaryHover text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download to View
              </a>
            </div>
          )}
        </div>

        {/* Sidebar / Controls */}
        <div className="w-full md:w-80 bg-surfaceHighlight border-l border-white/5 flex flex-col">
           <div className="p-6 border-b border-white/5 flex items-start justify-between shrink-0">
              <div>
                <h3 className="font-semibold text-white line-clamp-2">{title}</h3>
                <p className="text-xs text-zinc-400 mt-1 uppercase tracking-wider font-bold">{category}</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-5 h-5 text-zinc-400 hover:text-white" />
              </button>
           </div>

           {/* Player Controls */}
           {(category === FileCategory.VIDEO || category === FileCategory.AUDIO) && (
             <div className="p-6 flex flex-col gap-6 overflow-y-auto">
                
                {/* Progress Bar */}
                <div className="space-y-2">
                   <div className="flex justify-between text-xs text-zinc-400 font-medium font-mono">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                   </div>
                   <input 
                    type="range" 
                    min={0} 
                    max={duration || 100} 
                    value={currentTime} 
                    onChange={handleSeek}
                    className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-primary hover:accent-primaryHover transition-all"
                   />
                </div>

                {/* Playback Actions */}
                <div className="flex items-center justify-center gap-4">
                  <button 
                    onClick={handleTogglePlay}
                    className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-white/10"
                  >
                    {isPlaying ? <Pause className="w-6 h-6 fill-black" /> : <Play className="w-6 h-6 fill-black ml-1" />}
                  </button>
                </div>

                {/* Speed Control */}
                <div className="space-y-2">
                   <label className="text-xs font-medium text-zinc-500 uppercase">Playback Speed</label>
                   <div className="grid grid-cols-4 gap-2">
                      {[0.5, 1.0, 1.5, 2.0].map(rate => (
                        <button
                          key={rate}
                          onClick={() => handleSpeedChange(rate)}
                          className={`py-1.5 rounded text-xs font-medium transition-colors ${playbackRate === rate ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}
                        >
                          {rate}x
                        </button>
                      ))}
                   </div>
                </div>

                {/* Volume */}
                <div className="flex items-center justify-between bg-black/20 p-3 rounded-lg border border-white/5">
                    <div className="flex items-center gap-3">
                      {isMuted ? <VolumeX className="w-4 h-4 text-zinc-500" /> : <Volume2 className="w-4 h-4 text-zinc-300" />}
                      <span className="text-sm text-zinc-300">Volume</span>
                    </div>
                    <button 
                      onClick={() => {
                        const nextMute = !isMuted;
                        setIsMuted(nextMute);
                        const media = videoRef.current || audioRef.current;
                        if(media) media.muted = nextMute;
                      }}
                      className="text-xs text-primary hover:text-primaryHover font-medium"
                    >
                      {isMuted ? 'Unmute' : 'Mute'}
                    </button>
                </div>
             </div>
           )}

           {/* Actions */}
           <div className="mt-auto p-6 border-t border-white/5 space-y-3 shrink-0">
             <a 
               href={sourceUrl}
               download
               className="flex items-center justify-center gap-2 w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium transition-colors border border-white/5 hover:border-white/10"
             >
               <Download className="w-4 h-4" />
               Download File
             </a>
           </div>
        </div>
      </div>
    </div>
  );
};
