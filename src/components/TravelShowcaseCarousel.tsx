import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, MapPin } from 'lucide-react';
import { SHOWCASE_CAROUSEL_SLIDES, CarouselSlide } from '../data/carouselData';

export interface TravelShowcaseCarouselProps {
  /**
   * 'hero-bg': Renders as absolute background inside an isolate parent container
   * 'banner': Standalone full-width visual hero banner with text overlay and controls
   * 'card': Compact rounded card carousel (for sidebars, modals, or split screens)
   */
  variant?: 'hero-bg' | 'banner' | 'card';
  className?: string;
  autoPlayInterval?: number;
  showControls?: boolean;
  showDots?: boolean;
  showCaptions?: boolean;
  overlayGradient?: 'dark' | 'subtle-dark' | 'light' | 'emerald';
  children?: React.ReactNode;
  heightClass?: string;
}

export const TravelShowcaseCarousel: React.FC<TravelShowcaseCarouselProps> = ({
  variant = 'banner',
  className = '',
  autoPlayInterval = 5000,
  showControls = true,
  showDots = true,
  showCaptions = true,
  overlayGradient = 'dark',
  children,
  heightClass = 'h-[360px] sm:h-[440px]',
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const slides = SHOWCASE_CAROUSEL_SLIDES;

  const nextSlide = useCallback(() => {
    setActiveIndex((current) => (current + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setActiveIndex((current) => (current - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setActiveIndex(index);
  };

  useEffect(() => {
    if (slides.length < 2 || isHovered) return;
    const interval = window.setInterval(nextSlide, autoPlayInterval);
    return () => window.clearInterval(interval);
  }, [slides.length, isHovered, autoPlayInterval, nextSlide]);

  // Standardized overlay gradient styles
  const getOverlayGradientClass = () => {
    switch (overlayGradient) {
      case 'subtle-dark':
        return 'bg-gradient-to-b from-black/35 via-black/15 to-[#FAF7F2]/80';
      case 'light':
        return 'bg-gradient-to-b from-black/25 via-transparent to-[#FAF7F2]';
      case 'emerald':
        return 'bg-gradient-to-b from-black/40 via-[#183B32]/30 to-[#102923]/90';
      case 'dark':
      default:
        return 'bg-gradient-to-t from-black/80 via-black/30 to-black/40';
    }
  };

  // 1. HERO BACKGROUND VARIANT (Sits inside a relative hero container)
  if (variant === 'hero-bg') {
    return (
      <div 
        className={`absolute inset-0 -z-10 overflow-hidden bg-[#102923] ${className}`}
        aria-hidden="true"
      >
        {slides.map((slide, index) => (
          <img
            key={slide.id}
            src={slide.image}
            alt={slide.title}
            className={`absolute inset-0 h-full w-full object-cover brightness-110 contrast-115 saturate-110 transition-opacity duration-1000 ${
              index === activeIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
            }`}
            style={{ transition: 'opacity 1s ease-in-out, transform 8s ease-out' }}
            referrerPolicy="no-referrer"
          />
        ))}
        {/* Uniform Overlay */}
        <div className={`absolute inset-0 ${getOverlayGradientClass()}`} />
        {children}
      </div>
    );
  }

  // 2. STANDALONE BANNER VARIANT (With overlays, indicator pills, and optional controls)
  if (variant === 'banner') {
    const currentSlide = slides[activeIndex];

    return (
      <div
        className={`relative w-full overflow-hidden rounded-3xl bg-[#102923] shadow-lg border border-[#EAE3D6] ${heightClass} ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Slides Images with exact uniform brightness & contrast */}
        {slides.map((slide, index) => (
          <img
            key={slide.id}
            src={slide.image}
            alt={slide.title}
            className={`absolute inset-0 h-full w-full object-cover brightness-110 contrast-115 saturate-110 transition-all duration-1000 ${
              index === activeIndex
                ? 'opacity-100 scale-100'
                : 'opacity-0 scale-105 pointer-events-none'
            }`}
            style={{ transition: 'opacity 1s ease-in-out, transform 7s ease-out' }}
            referrerPolicy="no-referrer"
          />
        ))}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/35" />

        {/* Overlay Content / Custom Children or Captions */}
        <div className="absolute inset-0 z-10 p-6 sm:p-8 flex flex-col justify-between text-[#FAF7F2]">
          {/* Top Tag & Slide Counter */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-[11px] font-bold text-[#E0B466] uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-[#E0B466]" />
              {currentSlide.tag}
            </span>

            <div className="px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-[11px] font-bold text-white/90">
              {activeIndex + 1} / {slides.length}
            </div>
          </div>

          {/* Children or Bottom Text Caption */}
          {children ? (
            <div className="my-auto">{children}</div>
          ) : (
            showCaptions && (
              <div className="max-w-xl space-y-1.5 animate-fade-in" key={currentSlide.id}>
                <div className="flex items-center gap-1.5 text-xs text-[#E0B466] font-semibold">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Featured Inspiration</span>
                </div>
                <h3 className="font-serif font-bold text-2xl sm:text-3xl text-white tracking-tight drop-shadow-md">
                  {currentSlide.title}
                </h3>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed drop-shadow-sm">
                  {currentSlide.subtitle}
                </p>
              </div>
            )
          )}

          {/* Bottom Bar: Dots & Controls */}
          <div className="flex items-center justify-between pt-2">
            {/* Dots */}
            {showDots && (
              <div className="flex items-center gap-1.5" aria-label="Carousel slide dots">
                {slides.map((slide, index) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => goToSlide(index)}
                    className={`h-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-white/80 cursor-pointer ${
                      index === activeIndex
                        ? 'w-7 bg-[#E0B466]'
                        : 'w-2 bg-white/60 hover:bg-white'
                    }`}
                    aria-label={`Go to slide ${index + 1}: ${slide.title}`}
                    aria-pressed={index === activeIndex}
                  />
                ))}
              </div>
            )}

            {/* Navigation Arrows */}
            {showControls && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={prevSlide}
                  className="p-2 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/20 text-white transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  className="p-2 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/20 text-white transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 3. COMPACT CARD VARIANT (For split screens, modals, cards)
  const currentSlide = slides[activeIndex];
  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl bg-[#102923] border border-[#EAE3D6] shadow-sm ${heightClass} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {slides.map((slide, index) => (
        <img
          key={slide.id}
          src={slide.image}
          alt={slide.title}
          className={`absolute inset-0 h-full w-full object-cover brightness-110 contrast-115 saturate-110 transition-opacity duration-1000 ${
            index === activeIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
          }`}
          style={{ transition: 'opacity 1s ease-in-out, transform 7s ease-out' }}
          referrerPolicy="no-referrer"
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

      <div className="absolute inset-0 z-10 p-4 flex flex-col justify-between text-[#FAF7F2]">
        <div className="flex items-center justify-between">
          <span className="px-2.5 py-0.5 rounded-full bg-black/50 backdrop-blur-xs text-[10px] font-bold text-[#E0B466] border border-white/20">
            {currentSlide.tag}
          </span>
          <span className="text-[10px] font-bold text-white/80">
            {activeIndex + 1}/{slides.length}
          </span>
        </div>

        <div>
          <h4 className="font-serif font-bold text-base text-white truncate drop-shadow-sm">
            {currentSlide.title}
          </h4>
          <p className="text-[11px] text-white/80 truncate">
            {currentSlide.subtitle}
          </p>
          
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/20">
            <div className="flex gap-1">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goToSlide(i)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    i === activeIndex ? 'w-4 bg-[#E0B466]' : 'w-1.5 bg-white/50'
                  }`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>

            <div className="flex gap-1">
              <button
                type="button"
                onClick={prevSlide}
                className="p-1 rounded-full bg-black/40 hover:bg-black/60 text-white cursor-pointer"
                aria-label="Previous"
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                className="p-1 rounded-full bg-black/40 hover:bg-black/60 text-white cursor-pointer"
                aria-label="Next"
              >
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
