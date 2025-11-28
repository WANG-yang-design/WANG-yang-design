
import React, { useState, useEffect, useCallback } from 'react';
import { ApiService } from './services/apiService';
import { FileItem, FileCategory } from './types';
import { getCategoryFromMime, getIconForCategory } from './utils/fileUtils';
import { NavBar } from './components/NavBar';
import { MediaPreview } from './components/MediaPreview';
import { 
  Upload, 
  Search, 
  Filter, 
  Link as LinkIcon, 
  LayoutGrid, 
  List as ListIcon,
  PlayCircle,
  RefreshCw,
  AlertCircle,
  Download
} from 'lucide-react';

function App() {
  const [items, setItems] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<FileCategory>(FileCategory.ALL);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<FileItem | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadText, setUploadText] = useState('');
  
  // External Link State
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [externalLink, setExternalLink] = useState('');
  const [playingExternalUrl, setPlayingExternalUrl] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.getList();
      // Reverse to show newest first if ID is somewhat chronological or backend appends
      setItems(data.reverse()); 
    } catch (error) {
      console.error(error);
      setError("Failed to connect to the server. Please check your network connection or ensure the server address is correct.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsUploading(true);
    const file = e.target.files[0];
    
    try {
      // Use filename as text if description is empty, or use the user provided description
      const description = uploadText.trim() || file.name;
      await ApiService.uploadFile(file, description);
      setUploadText(''); // Reset text
      await fetchItems(); // Refresh list
    } catch (error) {
      alert("Upload failed. Please check the server connection.");
    } finally {
      setIsUploading(false);
    }
  };

  const handlePlayExternal = () => {
    if (!externalLink) return;
    setPlayingExternalUrl(externalLink);
    setShowLinkInput(false);
  };

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesCategory = activeCategory === FileCategory.ALL || getCategoryFromMime(item.filetype) === activeCategory;
    const matchesSearch = (item.text || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = [
    { id: FileCategory.ALL, label: 'All Files' },
    { id: FileCategory.DOCUMENT, label: 'Documents' },
    { id: FileCategory.IMAGE, label: 'Images' },
    { id: FileCategory.VIDEO, label: 'Videos' },
    { id: FileCategory.AUDIO, label: 'Music' },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <NavBar isOnline={!error && !loading} />

      <main className="pt-24 px-4 md:px-8 max-w-7xl mx-auto space-y-8">
        
        {/* Top Action Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Upload Card */}
          <div className="lg:col-span-2 bg-surface border border-white/5 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            
            <h2 className="text-xl font-semibold mb-4 text-white">Upload Content</h2>
            <div className="flex flex-col md:flex-row gap-4">
              <input 
                type="text" 
                placeholder="Optional description..." 
                value={uploadText}
                onChange={(e) => setUploadText(e.target.value)}
                className="bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary/50 text-white flex-1"
              />
              <div className="relative group">
                 <input 
                   type="file" 
                   id="file-upload" 
                   className="hidden" 
                   onChange={handleUpload} 
                   disabled={isUploading}
                 />
                 <label 
                   htmlFor="file-upload"
                   className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium cursor-pointer transition-all ${isUploading ? 'bg-zinc-700 cursor-wait' : 'bg-primary hover:bg-primaryHover text-white shadow-lg shadow-primary/20'}`}
                 >
                   {isUploading ? (
                     <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                   ) : (
                     <Upload className="w-5 h-5" />
                   )}
                   <span>{isUploading ? 'Uploading...' : 'Select File'}</span>
                 </label>
              </div>
            </div>
            <p className="mt-3 text-xs text-zinc-500">Supports: JPG, PNG, MP4, MP3, PDF, DOCX, etc.</p>
          </div>

          {/* Network Stream Card */}
          <div className="bg-surface border border-white/5 rounded-2xl p-6 relative">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold text-white">Network Stream</h2>
              <button onClick={() => setShowLinkInput(!showLinkInput)} className="text-primary hover:text-white transition-colors">
                <LinkIcon className="w-5 h-5" />
              </button>
            </div>
            
            {showLinkInput ? (
               <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                 <input 
                   type="text" 
                   placeholder="https://example.com/video.mp4" 
                   className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                   value={externalLink}
                   onChange={(e) => setExternalLink(e.target.value)}
                 />
                 <button 
                  onClick={handlePlayExternal}
                  className="w-full py-2 bg-secondary/80 hover:bg-secondary text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                 >
                   <PlayCircle className="w-4 h-4" />
                   Play Stream
                 </button>
               </div>
            ) : (
              <div className="h-24 flex flex-col items-center justify-center text-zinc-500 border border-dashed border-zinc-700 rounded-lg cursor-pointer hover:border-zinc-500 hover:text-zinc-400 transition-colors" onClick={() => setShowLinkInput(true)}>
                 <LinkIcon className="w-6 h-6 mb-2 opacity-50" />
                 <span className="text-xs">Paste URL to play</span>
              </div>
            )}
          </div>
        </div>

        {/* Gallery Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-20 z-40 py-4 bg-background/95 backdrop-blur">
          
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-white/5 overflow-x-auto max-w-full no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeCategory === cat.id ? 'bg-white/10 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'}`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
             {/* Search */}
             <div className="relative">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search files..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-surface border border-white/5 rounded-lg text-sm text-white focus:outline-none focus:border-white/20 w-full md:w-64"
                />
             </div>
             
             {/* View Toggle */}
             <div className="flex bg-surface rounded-lg p-1 border border-white/5">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  <ListIcon className="w-4 h-4" />
                </button>
             </div>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
            <p className="text-zinc-500 text-sm animate-pulse">Syncing with Cloud...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 text-center px-4">
            <div className="p-4 bg-red-500/10 rounded-full mb-4">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Connection Failed</h3>
            <p className="text-zinc-400 text-sm max-w-md mb-6">{error}</p>
            <button 
              onClick={fetchItems}
              className="flex items-center gap-2 px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retry Connection
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-surface/50 rounded-3xl border border-dashed border-white/5">
             <Filter className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
             <h3 className="text-lg font-medium text-white">No files found</h3>
             <p className="text-zinc-500 text-sm mt-1">Try adjusting your filters or upload a new file.</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" 
            : "flex flex-col gap-2"
          }>
            {filteredItems.map((item) => {
              const category = getCategoryFromMime(item.filetype);
              const CategoryIcon = getIconForCategory(category);
              
              if (viewMode === 'list') {
                 // List View Item
                 return (
                   <div 
                    key={item.id} 
                    onClick={() => setSelectedItem(item)}
                    className="group flex items-center gap-4 p-4 bg-surface hover:bg-white/5 border border-white/5 rounded-xl cursor-pointer transition-colors"
                   >
                     <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                       <CategoryIcon className="w-5 h-5 text-zinc-400 group-hover:text-white" />
                     </div>
                     <div className="flex-1 min-w-0">
                       <h4 className="text-sm font-medium text-white truncate group-hover:text-primary transition-colors">{item.text || item.id}</h4>
                       <p className="text-xs text-zinc-500 truncate">{item.filetype || 'Unknown Type'}</p>
                     </div>
                     <button className="p-2 text-zinc-500 hover:text-white hover:bg-white/10 rounded-full">
                       <PlayCircle className="w-5 h-5" />
                     </button>
                   </div>
                 );
              }

              // Grid View Item
              return (
                <div key={item.id} 
                  onClick={() => setSelectedItem(item)}
                  className="group relative aspect-square bg-surface border border-white/5 rounded-xl overflow-hidden cursor-pointer hover:border-primary/50 transition-all hover:shadow-xl hover:shadow-black/50"
                >
                  {/* Thumbnail / Icon Area */}
                  <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/50">
                     {category === FileCategory.IMAGE ? (
                       <img 
                        src={ApiService.getDownloadUrl(item.id)} 
                        alt={item.text}
                        loading="lazy"
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          // e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                       />
                     ) : (
                        <div className="flex flex-col items-center gap-2 text-zinc-500 group-hover:text-white transition-colors">
                           <CategoryIcon className="w-10 h-10" />
                        </div>
                     )}
                     
                     {/* Overlay on hover */}
                     <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                        <span className="p-3 bg-white/10 rounded-full text-white">
                           {category === FileCategory.DOCUMENT ? <Download className="w-5 h-5"/> : <PlayCircle className="w-6 h-6" />}
                        </span>
                     </div>
                  </div>

                  {/* Footer Label */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                    <p className="text-xs font-medium text-white truncate">{item.text || 'Untitled'}</p>
                    <p className="text-[10px] text-zinc-400 truncate mt-0.5 uppercase tracking-wider">{item.filetype || category}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Media Preview Modal */}
      {(selectedItem || playingExternalUrl) && (
        <MediaPreview 
          item={selectedItem} 
          externalUrl={playingExternalUrl}
          onClose={() => {
            setSelectedItem(null);
            setPlayingExternalUrl(null);
          }} 
        />
      )}
    </div>
  );
}

export default App;
