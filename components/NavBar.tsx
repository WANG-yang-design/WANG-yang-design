import React from 'react';
import { Cloud, Wifi } from 'lucide-react';

interface NavBarProps {
  isOnline: boolean;
}

export const NavBar: React.FC<NavBarProps> = ({ isOnline }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-b border-white/5 z-50 flex items-center justify-between px-4 md:px-8">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-primary to-purple-600 rounded-xl shadow-lg shadow-primary/20">
          <Cloud className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-white leading-none">OmniCloud</h1>
          <span className="text-xs text-zinc-500 font-medium">Universal Storage</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${isOnline ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
          <Wifi className="w-3 h-3" />
          {isOnline ? 'Server Connected' : 'Offline'}
        </div>
      </div>
    </nav>
  );
};