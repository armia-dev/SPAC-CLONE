import React, { useState, useEffect, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

// Fallback pickleball images in case local assets in /src/assets/images are not loaded
const SAMPLE_FALLBACKS = [
  'https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1622163642998-1ea32b0bbc67?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
];

const GALLERY_IMAGES = [
  {
    id: 1,
    src: '/src/assets/pickleballbg.jpg',
    alt: 'Player serving on court',
  },
  {
    id: 2,
    src: '/src/assets/pickleball1.jpg',
    alt: 'Pickleball paddles and ball near net',
  },
  {
    id: 3,
    src: '/src/assets/pickleball2.jpg',
    alt: 'Player holding ball and paddle',
  },
  {
    id: 4,
    src: '/src/assets/pickleball3.jpg',
    alt: 'Pickleball doubles match in action',
  },
  {
    id: 5,
    src: '/src/assets/pickleball4.jpg',
    alt: 'Pickleball balls and paddles in court shadow',
  },
  {
    id: 6,
    src: '/src/assets/pickleball5.jpg',
    alt: 'Player with bucket hat hitting ball',
  },
  {
    id: 7,
    src: '/src/assets/pickleball6.jpg',
    alt: 'Empty pickleball court with blue surface',
  },
  {
    id: 8,
    src: '/src/assets/pickleball7.jpg',
    alt: 'Low angle players paddle tap through net',
  },
  {
    id: 9,
    src: '/src/assets/pickleball8jpg',
    alt: 'Pickleball balls and paddles in court shadow',
  },
  {
    id: 10,
    src: '/src/assets/pickleball1.jpg',
    alt: 'Player with bucket hat hitting ball',
  },
  {
    id: 11,
    src: '/src/assets/pickleball2.jpg',
    alt: 'Empty pickleball court with blue surface',
  },
  {
    id: 12,
    src: '/src/assets/pickleball3.jpg',
    alt: 'Low angle players paddle tap through net',
  },
  {
    id: 13,
    src: '/src/assets/pickleball4.jpg',
    alt: 'Player serving on court',
  },
  {
    id: 14,
    src: '/src/assets/images/gallery_paddles_net_1791919705650.jpg',
    alt: 'Pickleball paddles and ball near net',
  },
  {
    id: 15,
    src: '/src/assets/images/gallery_player_visor_1791919705966.jpg',
    alt: 'Player holding ball and paddle',
  },
  {
    id: 16,
    src: '/src/assets/images/gallery_doubles_match_1791919705888.jpg',
    alt: 'Pickleball doubles match in action',
  },
  {
    id: 17,
    src: '/src/assets/images/pickleball_paddles_flatlay_1791905471360.jpg',
    alt: 'Pickleball balls and paddles in court shadow',
  },
  {
    id: 18,
    src: '/src/assets/images/gallery_player_buckethat_1791919706241.jpg',
    alt: 'Player with bucket hat hitting ball',
  },
  {
    id: 19,
    src: '/src/assets/images/court_hero_banner_1791905470447.jpg',
    alt: 'Empty pickleball court with blue surface',
  },
  {
    id: 20,
    src: '/src/assets/images/court_players_paddle_tap_1791905472024.jpg',
    alt: 'Low angle players paddle tap through net',
  },
  {
    id: 21,
    src: '/src/assets/images/pickleball_paddles_flatlay_1791905471360.jpg',
    alt: 'Pickleball balls and paddles in court shadow',
  },
  {
    id: 22,
    src: '/src/assets/images/gallery_player_buckethat_1791919706241.jpg',
    alt: 'Player with bucket hat hitting ball',
  },
  {
    id: 23,
    src: '/src/assets/images/court_hero_banner_1791905470447.jpg',
    alt: 'Empty pickleball court with blue surface',
  },
  {
    id: 24,
    src: '/src/assets/images/court_players_paddle_tap_1791905472024.jpg',
    alt: 'Low angle players paddle tap through net',
  },
  {
    id: 25,
    src: '/src/assets/images/player_ready_serve_1791905472128.jpg',
    alt: 'Player serving on court',
  },
  {
    id: 26,
    src: '/src/assets/images/gallery_paddles_net_1791919705650.jpg',
    alt: 'Pickleball paddles and ball near net',
  },
  {
    id: 27,
    src: '/src/assets/images/gallery_player_visor_1791919705966.jpg',
    alt: 'Player holding ball and paddle',
  },
  {
    id: 28,
    src: '/src/assets/images/gallery_doubles_match_1791919705888.jpg',
    alt: 'Pickleball doubles match in action',
  },
  {
    id: 29,
    src: '/src/assets/images/pickleball_paddles_flatlay_1791905471360.jpg',
    alt: 'Pickleball balls and paddles in court shadow',
  },
  {
    id: 30,
    src: '/src/assets/images/gallery_player_buckethat_1791919706241.jpg',
    alt: 'Player with bucket hat hitting ball',
  },
  {
    id: 31,
    src: '/src/assets/images/court_hero_banner_1791905470447.jpg',
    alt: 'Empty pickleball court with blue surface',
  },
  {
    id: 32,
    src: '/src/assets/images/court_players_paddle_tap_1791905472024.jpg',
    alt: 'Low angle players paddle tap through net',
  },
  {
    id: 33,
    src: '/src/assets/images/pickleball_paddles_flatlay_1791905471360.jpg',
    alt: 'Pickleball balls and paddles in court shadow',
  },
  {
    id: 34,
    src: '/src/assets/images/gallery_player_buckethat_1791919706241.jpg',
    alt: 'Player with bucket hat hitting ball',
  },
  {
    id: 35,
    src: '/src/assets/images/court_hero_banner_1791905470447.jpg',
    alt: 'Empty pickleball court with blue surface',
  },
  {
    id: 36,
    src: '/src/assets/images/court_players_paddle_tap_1791905472024.jpg',
    alt: 'Low angle players paddle tap through net',
  },
];

const IMAGES_PER_PAGE = 20;

export default function Gallery({ images = GALLERY_IMAGES, itemsPerPage = IMAGES_PER_PAGE }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);

  // Calculate total pages dynamically based on available images
  const totalImages = images.length;
  const totalPages = Math.max(1, Math.ceil(totalImages / itemsPerPage));

  // Automatically adjust current page if total images count changes
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Compute slice of images for current page (20 images per page)
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalImages);
  const displayedImages = useMemo(() => {
    return images.slice(startIndex, endIndex);
  }, [images, startIndex, endIndex]);

  // Handle page navigation
  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages && pageNumber !== currentPage) {
      setCurrentPage(pageNumber);
      const galleryElement = document.getElementById('gallery-section');
      if (galleryElement) {
        galleryElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Lightbox Modal Handlers
  const openModal = (globalIndex) => {
    setSelectedImageIndex(globalIndex);
  };

  const closeModal = () => {
    setSelectedImageIndex(null);
  };

  const prevImage = (e) => {
    if (e) e.stopPropagation();
    setSelectedImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const nextImage = (e) => {
    if (e) e.stopPropagation();
    setSelectedImageIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  // Keyboard navigation for modal
  useEffect(() => {
    if (selectedImageIndex === null) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageIndex, images.length]);

  // Construct pagination page numbers with ellipses for large page counts
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [];
    if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, '...', totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
    return pages;
  };

  // Graceful fallback for missing local asset files
  const handleImageError = (e, index) => {
    const fallback = SAMPLE_FALLBACKS[index % SAMPLE_FALLBACKS.length];
    if (e.currentTarget.src !== fallback) {
      e.currentTarget.src = fallback;
    }
  };

  return (
    <div
      id="gallery-section"
      style={{
        fontFamily: "'Be Vietnam Pro', sans-serif",
      }}
      className="w-full flex flex-col pb-12"
    >
      {/* Title & Subtitle matching the design */}
      <div className="pt-2 sm:pt-4 pb-6 sm:pb-8">
        <h1 className="text-3xl sm:text-4xl md:text-[44px] font-extrabold text-[#121212] tracking-tight leading-none">
          Gallery
        </h1>
        <p className="text-base sm:text-lg md:text-[20px] text-[#121212] font-normal mt-2 sm:mt-3 leading-snug">
          Courts, facilities, events, and game day moments.
        </p>
      </div>

      {/* 4-column Image Grid showing only images */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 min-h-[300px]">
        {displayedImages.map((img, index) => {
          const globalIndex = startIndex + index;
          return (
            <div
              key={`${img.id}-${globalIndex}`}
              onClick={() => openModal(globalIndex)}
              className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer bg-neutral-200 shadow-xs hover:shadow-md transition-all duration-200 hover:scale-[1.01]"
            >
              <img
                src={img.src}
                alt={img.alt}
                onError={(e) => handleImageError(e, globalIndex)}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          );
        })}
      </div>

      {/* Pagination Controls Section */}
      <div className="mt-8 pt-6 border-t border-neutral-300/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Dynamic Image Range & Count Info */}
        <div className="text-sm font-medium text-neutral-700 order-2 sm:order-1 text-center sm:text-left">
          {totalImages > 0 ? (
            <>
              Showing <span className="font-bold text-[#121212]">{startIndex + 1}</span>–
              <span className="font-bold text-[#121212]">{endIndex}</span> of{' '}
              <span className="font-bold text-[#121212]">{totalImages}</span> images
              <span className="text-neutral-500 ml-2">
                (Page {currentPage} of {totalPages})
              </span>
            </>
          ) : (
            <span>No images in gallery</span>
          )}
        </div>

        {/* Navigation Buttons (Previous, Page Numbers, Next) */}
        <nav
          aria-label="Gallery Pagination"
          className="flex items-center gap-1.5 sm:gap-2 order-1 sm:order-2 flex-wrap justify-center"
        >
          {/* Previous Page Button */}
          <button
            type="button"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            aria-label="Previous page"
            className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-150 select-none ${
              currentPage <= 1
                ? 'opacity-40 cursor-not-allowed bg-neutral-200 text-neutral-500'
                : 'bg-white hover:bg-[#121212] hover:text-[#ccff00] text-[#121212] border border-neutral-300 shadow-xs cursor-pointer active:scale-95'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden xs:inline">Prev</span>
          </button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {getPageNumbers().map((item, idx) => {
              if (item === '...') {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-neutral-500 font-bold select-none text-sm"
                  >
                    …
                  </span>
                );
              }

              const pageNum = Number(item);
              const isActive = pageNum === currentPage;

              return (
                <button
                  key={`page-${pageNum}`}
                  type="button"
                  onClick={() => goToPage(pageNum)}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={`Go to page ${pageNum}`}
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-sm font-bold flex items-center justify-center transition-all duration-150 select-none cursor-pointer ${
                    isActive
                      ? 'bg-[#121212] text-[#ccff00] shadow-sm ring-2 ring-[#ccff00]/40 scale-105'
                      : 'bg-white hover:bg-neutral-100 text-[#121212] border border-neutral-300 hover:border-neutral-400 active:scale-95'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          {/* Next Page Button */}
          <button
            type="button"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            aria-label="Next page"
            className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-150 select-none ${
              currentPage >= totalPages
                ? 'opacity-40 cursor-not-allowed bg-neutral-200 text-neutral-500'
                : 'bg-white hover:bg-[#121212] hover:text-[#ccff00] text-[#121212] border border-neutral-300 shadow-xs cursor-pointer active:scale-95'
            }`}
          >
            <span className="hidden xs:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </nav>
      </div>

      {/* Full View Modal Popup */}
      {selectedImageIndex !== null && images[selectedImageIndex] && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={closeModal}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 sm:p-8 animate-fadeIn"
        >
          {/* Modal Container */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl max-h-[90vh] w-full flex flex-col items-center justify-center"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={closeModal}
              className="absolute -top-12 right-0 sm:right-2 text-white hover:text-[#ccff00] p-2 rounded-full bg-black/50 hover:bg-black transition-colors cursor-pointer"
              aria-label="Close full view"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Image Frame */}
            <div className="relative w-full max-h-[80vh] flex items-center justify-center rounded-2xl overflow-hidden bg-black/60 shadow-2xl">
              <img
                src={images[selectedImageIndex].src}
                alt={images[selectedImageIndex].alt}
                onError={(e) => handleImageError(e, selectedImageIndex)}
                className="max-h-[80vh] w-auto max-w-full object-contain rounded-xl"
              />

              {/* Prev Navigation */}
              <button
                type="button"
                onClick={prevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black text-white hover:text-[#ccff00] transition-colors cursor-pointer shadow-lg"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Next Navigation */}
              <button
                type="button"
                onClick={nextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black text-white hover:text-[#ccff00] transition-colors cursor-pointer shadow-lg"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Counter */}
            <div className="mt-3 text-xs sm:text-sm font-medium text-neutral-300">
              {selectedImageIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
