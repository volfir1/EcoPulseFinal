import { useState, useEffect } from 'react';

/**
 * Custom hook for controlling the carousel
 * @param {number} totalSlides - Total number of slides
 * @param {number} interval - Auto-rotation interval in milliseconds (set to null to disable auto-rotation)
 * @returns {object} Carousel controls and state
 */
export const useCarousel = (totalSlides, interval = null) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-rotate carousel only if interval is provided
  useEffect(() => {
    if (interval === null) return; // Skip setting up the timer if interval is null
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, interval);
    
    return () => clearInterval(timer);
  }, [totalSlides, interval]);

  // Navigation functions
  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return {
    currentSlide,
    goToNextSlide,
    goToPrevSlide,
    goToSlide
  };
};


/**
 * Custom hook for responsive behaviors
 * @returns {object} Responsive state information
 */
export const useResponsive = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setIsDesktop(width >= 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return { isMobile, isTablet, isDesktop };
};

/**
 * Custom hook for scroll animations
 * @returns {object} Scroll position and functions
 */
export const useScrollEffect = () => {
  const [scrollY, setScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return { scrollY, isScrolled };
};