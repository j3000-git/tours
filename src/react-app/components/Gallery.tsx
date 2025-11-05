import { useState } from 'react';
import { X, Play, Image as ImageIcon, Video } from 'lucide-react';

interface GalleryProps {
  images: string[];
  videos: string[];
}

export default function Gallery({ images, videos }: GalleryProps) {
  const [selectedMedia, setSelectedMedia] = useState<{ type: 'image' | 'video'; src: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'images' | 'videos'>('all');

  const allMedia = [
    ...images.map(img => ({ type: 'image' as const, src: img })),
    ...videos.map(video => ({ type: 'video' as const, src: video }))
  ];

  const getFilteredMedia = () => {
    switch (activeTab) {
      case 'images':
        return images.map(img => ({ type: 'image' as const, src: img }));
      case 'videos':
        return videos.map(video => ({ type: 'video' as const, src: video }));
      default:
        return allMedia;
    }
  };

  const filteredMedia = getFilteredMedia();

  const openModal = (type: 'image' | 'video', src: string) => {
    setSelectedMedia({ type, src });
  };

  const closeModal = () => {
    setSelectedMedia(null);
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Gallery</h2>
      
      {/* Filter Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'all'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          All ({allMedia.length})
        </button>
        <button
          onClick={() => setActiveTab('images')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'images'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Images ({images.length})
        </button>
        <button
          onClick={() => setActiveTab('videos')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'videos'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Videos ({videos.length})
        </button>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredMedia.map((media, index) => (
          <div
            key={index}
            className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group hover:shadow-lg transition-shadow"
            onClick={() => openModal(media.type, media.src)}
          >
            {media.type === 'image' ? (
              <>
                <img
                  src={media.src}
                  alt={`Gallery item ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                <div className="absolute top-2 left-2 bg-white/90 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ImageIcon size={16} className="text-gray-700" />
                </div>
              </>
            ) : (
              <>
                <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="bg-white/20 rounded-full p-4 mb-2 mx-auto w-fit">
                      <Play size={24} className="text-white" />
                    </div>
                    <p className="text-sm">Play Video</p>
                  </div>
                </div>
                <div className="absolute top-2 left-2 bg-white/90 rounded-full p-1">
                  <Video size={16} className="text-gray-700" />
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="relative max-w-6xl max-h-full w-full">
            <button
              onClick={closeModal}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X size={32} />
            </button>
            
            {selectedMedia.type === 'image' ? (
              <img
                src={selectedMedia.src}
                alt="Gallery item"
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
              />
            ) : (
              <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
                <iframe
                  src={selectedMedia.src}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
