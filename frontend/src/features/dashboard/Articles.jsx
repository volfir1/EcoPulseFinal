import React, { useState, useEffect, useCallback } from 'react';
import { Clock, ExternalLink, X, RefreshCw, Bookmark, Share2, AlertCircle } from 'lucide-react';

// Map energy categories to their colors
const categoryColors = {
  solar: '#FFB800',
  hydro: '#2E90E5',
  wind: '#64748B',
  biomass: '#16A34A',
  geothermal: '#FF6B6B',
  general: '#6366F1'
};

// Enhanced RSS feed selection with multiple options
const RSS_FEEDS = [
  {
    url: 'https://www.renewableenergyworld.com/feed/',
    name: 'Renewable Energy World',
    reliable: true
  },
  {
    url: 'https://cleantechnica.com/feed/',
    name: 'CleanTechnica',
    reliable: true
  },
  {
    url: 'https://www.solarpowerworldonline.com/feed/',
    name: 'Solar Power World', 
    reliable: true
  },
  // Additional high-quality feeds with good image support
  {
    url: 'https://renewablesnow.com/rss/',
    name: 'Renewables Now',
    reliable: true
  },
  {
    url: 'https://feeds.feedburner.com/PvMagazine-GlobalPvSolarWebsite',
    name: 'PV Magazine',
    reliable: true
  },
  {
    url: 'https://www.utilitydive.com/feeds/renewable-energy/',
    name: 'Utility Dive',
    reliable: true
  }
];

// Dedicated fallback images for each category
const FALLBACK_IMAGES = {
  solar: [
    'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&auto=format&fit=crop',
    'https://images.pexels.com/photos/356036/pexels-photo-356036.jpeg?w=800&auto=format&fit=crop'
  ],
  wind: [
    'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1548337138-e87d889cc369?w=800&auto=format&fit=crop',
    'https://images.pexels.com/photos/414837/pexels-photo-414837.jpeg?w=800&auto=format&fit=crop'
  ],
  hydro: [
    'https://images.unsplash.com/photo-1544964656-b557ba862fa3?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1623961993776-c23062bf31e8?w=800&auto=format&fit=crop',
    'https://images.pexels.com/photos/2553401/pexels-photo-2553401.jpeg?w=800&auto=format&fit=crop'
  ],
  geothermal: [
    'https://images.unsplash.com/photo-1527669538566-7300c2a0475a?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1675181656581-e47ee01224f5?w=800&auto=format&fit=crop',
    'https://images.pexels.com/photos/4993225/pexels-photo-4993225.jpeg?w=800&auto=format&fit=crop'
  ],
  biomass: [
    'https://images.unsplash.com/photo-1608042314453-ae338d80c427?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1518569656558-1f25fdc6d538?w=800&auto=format&fit=crop',
    'https://images.pexels.com/photos/5546922/pexels-photo-5546922.jpeg?w=800&auto=format&fit=crop'
  ],
  general: [
    'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800&auto=format&fit=crop',
    'https://images.pexels.com/photos/9875441/pexels-photo-9875441.jpeg?w=800&auto=format&fit=crop'
  ]
};

// Multiple CORS proxy options (with fallbacks)
const CORS_PROXIES = [
  'https://api.rss2json.com/v1/api.json?rss_url=',
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?'
];

// Function to preload images
const preloadImages = () => {
  const allImages = [];
  Object.values(FALLBACK_IMAGES).forEach(categoryImages => {
    categoryImages.forEach(imageUrl => {
      allImages.push(imageUrl);
    });
  });
  
  // Preload first 10 images
  allImages.slice(0, 10).forEach(imageUrl => {
    const img = new Image();
    img.src = imageUrl;
  });
};

const RenewableEnergyNews = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [imageLoadStats, setImageLoadStats] = useState({ success: 0, failed: 0 });
  const [debugMode, setDebugMode] = useState(false);

  // Preload fallback images when component mounts
  useEffect(() => {
    preloadImages();
  }, []);

  useEffect(() => {
    // Check for cached articles first
    const cachedArticles = localStorage.getItem('renewable-news-cache');
    const cacheTimestamp = localStorage.getItem('renewable-news-timestamp');
    const now = new Date().getTime();
    
    if (cachedArticles && cacheTimestamp) {
      // Use cache if it's less than 3 hours old
      if (now - parseInt(cacheTimestamp) < 3 * 60 * 60 * 1000) {
        setArticles(JSON.parse(cachedArticles));
        setLastUpdated(new Date(parseInt(cacheTimestamp)));
        setLoading(false);
        console.log('Using cached news data');
        return;
      }
    }
    
    // Otherwise fetch fresh data
    fetchRenewableNews();
  }, []);

  // Function to get a random fallback image for a category
  const getRandomFallbackImage = (category) => {
    const images = FALLBACK_IMAGES[category] || FALLBACK_IMAGES.general;
    return images[Math.floor(Math.random() * images.length)];
  };

  // Enhanced image validation - checks if an image URL is likely to be valid
  const isValidImageUrl = (url) => {
    if (!url) return false;
    
    // Filter out common invalid image patterns
    const invalidPatterns = [
      'spacer.gif', 'pixel.gif', 'blank.gif', 'tracker', 'track.',
      'counter.', 'count.', '1x1.', 'logo_', 'favicon', 'icon-', 
      '.svg', 'button', 'banner', 'header', 'footer'
    ];
    
    const lowercaseUrl = url.toLowerCase();
    
    // Check for invalid patterns
    if (invalidPatterns.some(pattern => lowercaseUrl.includes(pattern))) {
      return false;
    }
    
    // Check for valid image extensions
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    if (!validExtensions.some(ext => lowercaseUrl.endsWith(ext)) && 
        !lowercaseUrl.includes('.jpg?') && 
        !lowercaseUrl.includes('.jpeg?') && 
        !lowercaseUrl.includes('.png?') && 
        !lowercaseUrl.includes('.webp?')) {
      // If it doesn't end with a valid extension, check if it's a content delivery URL
      const cdnPatterns = ['cloudinary', 'cloudfront', 'imgix', 'unsplash', 'pexels', 'googleapis', 'wp-content'];
      if (!cdnPatterns.some(cdn => lowercaseUrl.includes(cdn))) {
        return false;
      }
    }
    
    // Check minimum length
    if (url.length < 10) return false;
    
    return true;
  };

  // Improved image extraction that uses multiple techniques
  const extractImageFromHtml = (html) => {
    if (!html) return null;
    
    try {
      // Create a DOM parser to properly extract images from HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // First, look for og:image meta tags (best quality images for sharing)
      const ogImage = doc.querySelector('meta[property="og:image"]');
      if (ogImage && ogImage.getAttribute('content')) {
        const ogImageUrl = ogImage.getAttribute('content');
        if (isValidImageUrl(ogImageUrl)) {
          return ogImageUrl;
        }
      }
      
      // Try to find all images
      const images = Array.from(doc.querySelectorAll('img'));
      
      // Find largest images first (most likely to be content images)
      const validImages = images
        .filter(img => {
          const src = img.getAttribute('src');
          if (!isValidImageUrl(src)) return false;
          
          // Skip tiny images (likely icons, bullets, etc.)
          const width = parseInt(img.getAttribute('width') || '0');
          const height = parseInt(img.getAttribute('height') || '0');
          
          if ((width > 0 && width < 100) || (height > 0 && height < 100)) {
            return false;
          }
          
          return true;
        })
        .sort((a, b) => {
          // Sort by size (prefer larger images)
          const aWidth = parseInt(a.getAttribute('width') || '0');
          const aHeight = parseInt(a.getAttribute('height') || '0');
          const bWidth = parseInt(b.getAttribute('width') || '0');
          const bHeight = parseInt(b.getAttribute('height') || '0');
          
          const aSize = aWidth * aHeight;
          const bSize = bWidth * bHeight;
          
          return bSize - aSize;
        });
      
      if (validImages.length > 0) {
        // Get the src of the first valid (and largest) image
        let imageSrc = validImages[0].getAttribute('src');
        
        // Ensure URL is absolute
        if (imageSrc.startsWith('/')) {
          // Try to use the feed domain to make it absolute
          try {
            const feedDomain = new URL(html.match(/<link>([^<]+)<\/link>/)?.[1] || '').origin;
            imageSrc = feedDomain + imageSrc;
          } catch (e) {
            // If we can't extract the domain, try a default one
            imageSrc = 'https://www.renewableenergyworld.com' + imageSrc;
          }
        }
        
        return imageSrc;
      }
    } catch (e) {
      console.error('Error parsing HTML for images:', e);
    }
    
    // Fallback to regex if DOM parsing fails
    try {
      const imgRegex = /<img[^>]+src="([^">]+)"[^>]*>/g;
      const matches = [];
      let match;
      
      while ((match = imgRegex.exec(html)) !== null) {
        if (isValidImageUrl(match[1])) {
          matches.push(match[1]);
        }
      }
      
      return matches.length > 0 ? matches[0] : null;
    } catch (e) {
      console.error('Error with regex image extraction:', e);
      return null;
    }
  };

  // Comprehensive method to extract the best image from an RSS item
  const getBestImage = (item) => {
    // Check for standard RSS image properties
    if (item.enclosure?.link && isValidImageUrl(item.enclosure.link)) {
      return item.enclosure.link;
    }
    
    if (item.enclosure?.url && isValidImageUrl(item.enclosure.url)) {
      return item.enclosure.url;
    }
    
    if (item.thumbnail && isValidImageUrl(item.thumbnail)) {
      return item.thumbnail;
    }
    
    // Check for media extensions
    if (item['media:content']?.url && isValidImageUrl(item['media:content'].url)) {
      return item['media:content'].url;
    }
    
    if (item['media:thumbnail']?.url && isValidImageUrl(item['media:thumbnail'].url)) {
      return item['media:thumbnail'].url;
    }
    
    // Check for image property
    if (item.image) {
      const imageSrc = typeof item.image === 'string' ? item.image : item.image.url || item.image.href;
      if (isValidImageUrl(imageSrc)) return imageSrc;
    }
    
    // Try to extract image from content or description
    const contentImage = extractImageFromHtml(item.content);
    if (contentImage) return contentImage;
    
    const descriptionImage = extractImageFromHtml(item.description);
    if (descriptionImage) return descriptionImage;
    
    // If we still don't have an image, check if the title mentions a specific energy type
    // and provide a relevant fallback image
    const title = (item.title || '').toLowerCase();
    
    if (title.includes('solar') || title.includes('photovoltaic') || title.includes('pv ')) {
      return getRandomFallbackImage('solar');
    } else if (title.includes('wind') || title.includes('turbine')) {
      return getRandomFallbackImage('wind');
    } else if (title.includes('hydro') || title.includes('dam') || title.includes('water power')) {
      return getRandomFallbackImage('hydro');
    } else if (title.includes('geothermal') || title.includes('heat pump')) {
      return getRandomFallbackImage('geothermal');
    } else if (title.includes('biomass') || title.includes('biofuel') || title.includes('biogas')) {
      return getRandomFallbackImage('biomass');
    }
    
    // Return null as a last resort - the component will use a colored SVG placeholder
    return null;
  };

  // Try multiple CORS proxies in sequence
  const fetchWithCorsProxy = async (feedUrl, proxyIndex = 0) => {
    if (proxyIndex >= CORS_PROXIES.length) {
      throw new Error('All CORS proxies failed');
    }
    
    try {
      const proxyUrl = CORS_PROXIES[proxyIndex] + encodeURIComponent(feedUrl);
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.warn(`CORS proxy ${proxyIndex + 1} failed, trying next...`);
      return fetchWithCorsProxy(feedUrl, proxyIndex + 1);
    }
  };

  // Improved fetch function with better error handling
  const fetchRenewableNews = async () => {
    setLoading(true);
    setError(null);
    setImageLoadStats({ success: 0, failed: 0 });
    
    try {
      let allArticles = [];
      
      // Start with reliable feeds first
      const reliableFeeds = RSS_FEEDS.filter(feed => feed.reliable);
      const otherFeeds = RSS_FEEDS.filter(feed => !feed.reliable);
      const prioritizedFeeds = [...reliableFeeds, ...otherFeeds];
      
      // Try to fetch from each RSS feed
      const feedPromises = prioritizedFeeds.map(feed => 
        fetchWithCorsProxy(feed.url)
          .then(data => {
            console.log(`Successfully fetched from ${feed.name}`);
            
            if (data.status === 'ok' && data.items && data.items.length > 0) {
              if (debugMode) {
                console.log(`Sample item structure from ${feed.name}:`, 
                  JSON.stringify(data.items[0], null, 2));
              }
              
              // Process the articles
              return Promise.all(data.items.map(async (item, index) => {
                // Clean up description (remove HTML)
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = item.description || '';
                const cleanDescription = tempDiv.textContent || tempDiv.innerText || '';
                
                // Determine category based on content
                const fullText = (item.title + ' ' + cleanDescription).toLowerCase();
                let category = 'general';
                
                if (fullText.includes('solar') || fullText.includes('photovoltaic') || fullText.includes('pv ')) {
                  category = 'solar';
                } else if (fullText.includes('wind') || fullText.includes('turbine')) {
                  category = 'wind';
                } else if (fullText.includes('hydro') || fullText.includes('hydroelectric') || 
                           fullText.includes('dam') || fullText.includes('water power')) {
                  category = 'hydro';
                } else if (fullText.includes('geothermal') || fullText.includes('heat pump')) {
                  category = 'geothermal';
                } else if (fullText.includes('biomass') || fullText.includes('biofuel') || 
                           fullText.includes('biogas')) {
                  category = 'biomass';
                }
                
                // Extract the best image from the item
                let imageUrl = getBestImage(item);
                
                // If we have an image, test if it's loadable
                if (imageUrl) {
                  try {
                    // Test if image loads (without adding to DOM)
                    const imgLoadPromise = new Promise((resolve, reject) => {
                      const img = new Image();
                      img.onload = () => {
                        setImageLoadStats(prev => ({ 
                          ...prev, 
                          success: prev.success + 1 
                        }));
                        resolve(true);
                      };
                      img.onerror = () => {
                        setImageLoadStats(prev => ({ 
                          ...prev, 
                          failed: prev.failed + 1 
                        }));
                        reject(new Error('Image failed to load'));
                      };
                      img.src = imageUrl;
                    });
                    
                    await imgLoadPromise;
                  } catch (imgError) {
                    console.log(`Image failed to load: ${imageUrl}`);
                    // If the original image doesn't load, use a category-appropriate fallback
                    imageUrl = getRandomFallbackImage(category);
                  }
                } else {
                  // No image found, use a category-appropriate fallback
                  imageUrl = getRandomFallbackImage(category);
                }
                
                // Calculate read time (rough estimate based on word count)
                const wordCount = cleanDescription.split(/\s+/).length;
                const readTime = Math.max(1, Math.min(15, Math.ceil(wordCount / 200)));
                
                // Return the formatted article
                return {
                  id: `${feed.name}-${index}`,
                  title: item.title,
                  description: cleanDescription.substring(0, 500) + (cleanDescription.length > 500 ? '...' : ''),
                  url: item.link,
                  urlToImage: imageUrl,
                  publishedAt: item.pubDate,
                  source: { name: feed.name },
                  category,
                  readTime
                };
              }));
            }
            return [];
          })
          .catch(err => {
            console.warn(`Error fetching from ${feed.name}:`, err);
            return [];
          })
      );
      
      // Wait for all feed fetches to complete
      const feedResults = await Promise.all(feedPromises);
      
      // Combine all articles
      feedResults.forEach(articles => {
        if (articles && articles.length) {
          allArticles = [...allArticles, ...articles];
        }
      });
      
      // If we got articles
      if (allArticles.length > 0) {
        // Sort by date (newest first)
        allArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
        
        // Remove potential duplicates (simple title comparison)
        const uniqueArticles = [];
        const titleSet = new Set();
        
        allArticles.forEach(article => {
          if (!titleSet.has(article.title)) {
            titleSet.add(article.title);
            uniqueArticles.push(article);
          }
        });
        
        console.log(`Successfully processed ${uniqueArticles.length} articles with ${imageLoadStats.success} valid images`);
        
        // Update state
        setArticles(uniqueArticles);
        
        // Save to cache
        const timestamp = new Date().getTime();
        localStorage.setItem('renewable-news-cache', JSON.stringify(uniqueArticles));
        localStorage.setItem('renewable-news-timestamp', timestamp.toString());
        setLastUpdated(new Date(timestamp));
      } else {
        throw new Error('No articles found from any source');
      }
    } catch (err) {
      console.error('Error fetching renewable energy news:', err);
      setError('Unable to load the latest renewable energy news. Please try again later.');
      
      // If we have no articles, use fallbacks
      if (articles.length === 0) {
        setArticles(getFallbackArticles());
        setLastUpdated(new Date());
      }
    } finally {
      setLoading(false);
    }
  };

  // Optimized SVG placeholder generator with better text handling
  const generateColorPlaceholder = (text = 'Renewable Energy', category = 'general') => {
    const colorHex = categoryColors[category]?.replace('#', '') || '6366F1';
    const encodedText = encodeURIComponent(text);
    
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400' viewBox='0 0 800 400'%3E%3Crect width='800' height='400' fill='%23${colorHex}'/%3E%3Ctext x='400' y='200' font-family='Arial' font-size='32' text-anchor='middle' fill='white'%3E${encodedText}%3C/text%3E%3C/svg%3E`;
  };

  // Fallback articles for when all fetches fail (improved with better images)
  const getFallbackArticles = () => {
    return [
      {
        id: 'fallback-1',
        title: 'Solar Power Innovations Driving Renewable Energy Growth',
        description: 'New advances in solar panel efficiency and battery storage are accelerating the transition to clean energy worldwide. Researchers have developed panels that can operate at higher efficiency rates even in low-light conditions, potentially extending solar viability to more regions.',
        urlToImage: getRandomFallbackImage('solar'),
        publishedAt: new Date().toISOString(),
        source: { name: 'Renewable Energy World' },
        url: 'https://www.renewableenergyworld.com/',
        category: 'solar',
        readTime: 6
      },
      {
        id: 'fallback-2',
        title: 'Offshore Wind Projects Expand as Costs Decline',
        description: 'Offshore wind is seeing unprecedented growth as technology improvements drive down costs. New floating turbine designs allow wind farms to be installed in deeper waters, opening up vast new areas for renewable energy development without visual impact on coastal communities.',
        urlToImage: getRandomFallbackImage('wind'),
        publishedAt: new Date(Date.now() - 86400000).toISOString(),
        source: { name: 'CleanTechnica' },
        url: 'https://cleantechnica.com/',
        category: 'wind',
        readTime: 5
      },
      {
        id: 'fallback-3',
        title: 'Hydropower Modernization Projects Boost Efficiency',
        description: 'Aging hydroelectric dams are getting high-tech upgrades that significantly increase their power output without increasing their environmental footprint. New turbine designs, digital controls, and improved flow management are breathing new life into infrastructure that in some cases is over 50 years old.',
        urlToImage: getRandomFallbackImage('hydro'),
        publishedAt: new Date(Date.now() - 172800000).toISOString(),
        source: { name: 'Hydro Review' },
        url: 'https://www.hydroreview.com/',
        category: 'hydro',
        readTime: 7
      },
      {
        id: 'fallback-4',
        title: 'Geothermal Power Plants Set for Major Expansion',
        description: 'Geothermal energy is experiencing renewed interest as countries look to develop always-on renewable energy sources. Enhanced geothermal systems now allow power production in regions previously thought unsuitable for geothermal development, potentially making this stable clean energy source widely available.',
        urlToImage: getRandomFallbackImage('geothermal'),
        publishedAt: new Date(Date.now() - 259200000).toISOString(),
        source: { name: 'Renewable Energy World' },
        url: 'https://www.renewableenergyworld.com/',
        category: 'geothermal',
        readTime: 8
      },
      {
        id: 'fallback-5',
        title: 'Biomass Industry Makes Progress on Sustainability Standards',
        description: 'The biomass industry is introducing new sustainability certifications to address concerns about feedstock sourcing. These standards ensure that biomass energy production does not compete with food production or contribute to deforestation, focusing instead on agricultural waste and sustainable forestry practices.',
        urlToImage: getRandomFallbackImage('biomass'),
        publishedAt: new Date(Date.now() - 345600000).toISOString(),
        source: { name: 'Bioenergy Insight' },
        url: 'https://www.bioenergy-news.com/',
        category: 'biomass',
        readTime: 6
      }
    ];
  };

  // Filter articles based on active filter
  const filteredArticles = activeFilter === 'all' 
    ? articles 
    : articles.filter(article => article.category === activeFilter);

  // Format date for display
  const formatDate = (dateString) => {
    try {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
      return dateString;
    }
  };

  // Format time since publication
  const getTimeSince = (dateString) => {
    try {
      const now = new Date();
      const publishedDate = new Date(dateString);
      const diffInSeconds = Math.floor((now - publishedDate) / 1000);
      
      if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
      return formatDate(dateString);
    } catch (e) {
      return 'recently';
    }
  };

  // Open article in modal
  const openArticleModal = (article) => {
    setSelectedArticle(article);
    setModalOpen(true);
  };

  // Close article modal
  const closeArticleModal = () => {
    setModalOpen(false);
    setTimeout(() => setSelectedArticle(null), 300);
  };

  // Handle manual refresh
  const handleManualRefresh = () => {
    fetchRenewableNews();
  };

  // Enhanced image error handler
  const handleImageError = (e, article) => {
    e.target.onerror = null; // Prevent infinite loop
    
    // Try to use a category-specific fallback image
    const fallbackUrl = getRandomFallbackImage(article.category);
    
    if (fallbackUrl) {
      e.target.src = fallbackUrl;
    } else {
      // If all else fails, use an SVG placeholder
      const categoryText = article.category.charAt(0).toUpperCase() + article.category.slice(1) + ' Energy';
      e.target.src = generateColorPlaceholder(categoryText, article.category);
    }
    
    // Log the failure for debugging
    console.log(`Image replacement applied for article: ${article.title.substring(0, 30)}...`);
  };

  if (loading) {
    return (
      <div className="mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Renewable Energy News</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="animate-pulse rounded-lg overflow-hidden shadow-md bg-white">
              <div className="h-40 bg-gray-200"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-semibold text-gray-800">Renewable Energy News</h2>
        
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <div className="text-xs text-gray-500">
              Last updated: {getTimeSince(lastUpdated)}
              <button 
                onClick={handleManualRefresh}
                disabled={loading}
                className="ml-2 p-1 rounded-full hover:bg-gray-100 disabled:opacity-50"
                title="Refresh now"
              >
                <RefreshCw size={14} className={`${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          )}
          
          <div className="flex flex-wrap gap-2">
            {['all', 'solar', 'wind', 'hydro', 'geothermal', 'biomass'].map(filter => (
              <button
                key={filter}
                className={`px-3 py-1 text-sm rounded-full ${
                  activeFilter === filter 
                    ? `bg-gray-800 text-white` 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
          <p>{error}</p>
        </div>
      )}

      {filteredArticles.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No articles found for this category. Try selecting a different category or refreshing the news.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.slice(0, 9).map(article => (
            <div 
              key={article.id}
              className="rounded-lg overflow-hidden shadow-md bg-white hover:shadow-lg transition-shadow duration-300 cursor-pointer h-full flex flex-col"
              onClick={() => openArticleModal(article)}
            >
              <div className="h-40 bg-gray-200 relative">
                {article.urlToImage ? (
                  <img 
                    src={article.urlToImage} 
                    alt={article.title} 
                    className="w-full h-full object-cover"
                    onError={(e) => handleImageError(e, article)}
                    loading="lazy"
                  />
                ) : (
                  <div 
                    className="w-full h-full flex items-center justify-center text-center px-4"
                    style={{ 
                      backgroundColor: categoryColors[article.category] || categoryColors.general, 
                      color: 'white' 
                    }}
                  >
                    <span className="font-medium">{article.category.charAt(0).toUpperCase() + article.category.slice(1)} Energy</span>
                  </div>
                )}
                <div 
                  className="absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: categoryColors[article.category] || categoryColors.general }}
                >
                  {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
                </div>
              </div>
              <div className="p-4 flex-grow flex flex-col">
                <div className="flex items-center text-xs text-gray-500 mb-2">
                  <Clock size={12} className="mr-1" />
                  <span>{article.readTime} min read</span>
                  <span className="mx-2">•</span>
                  <span>{getTimeSince(article.publishedAt)}</span>
                </div>
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{article.title}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-3 flex-grow">{article.description}</p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs text-gray-500 truncate max-w-[150px]">Source: {article.source.name}</span>
                  <span className="text-sm font-medium text-blue-600">Read more</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Article Modal */}
      {modalOpen && selectedArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-xl flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold text-lg truncate pr-4">{selectedArticle.title}</h3>
              <button 
                onClick={closeArticleModal}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="overflow-y-auto flex-grow p-4">
              {selectedArticle.urlToImage && (
                <div className="mb-4">
                  <img 
                    src={selectedArticle.urlToImage} 
                    alt={selectedArticle.title} 
                    className="w-full h-auto max-h-[400px] object-cover rounded"
                    onError={(e) => handleImageError(e, selectedArticle)}
                  />
                </div>
              )}
              
              <div className="flex flex-wrap items-center text-sm text-gray-500 mb-4 gap-2">
                <span className="font-medium">{selectedArticle.source.name}</span>
                <span>•</span>
                <Clock size={14} className="mx-1" />
                <span>{selectedArticle.readTime} min read</span>
                <span>•</span>
                <span>{formatDate(selectedArticle.publishedAt)}</span>
                <div 
                  className="px-2 py-1 rounded-full text-xs font-medium text-white ml-2"
                  style={{ backgroundColor: categoryColors[selectedArticle.category] || categoryColors.general }}
                >
                  {selectedArticle.category.charAt(0).toUpperCase() + selectedArticle.category.slice(1)}
                </div>
              </div>
              
              <div className="mt-4 mb-6">
                <p className="text-gray-800 whitespace-pre-line leading-relaxed">{selectedArticle.description}</p>
              </div>
              
              <p className="text-gray-600 italic mb-4 border-t pt-4 text-sm">
                This is a preview. Visit the publisher's website to read the full article.
              </p>
            </div>
            
            <div className="p-4 border-t flex justify-between items-center">
              <div className="flex space-x-2">
                <button className="p-2 rounded-full hover:bg-gray-100" title="Save article">
                  <Bookmark size={18} />
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100" title="Share article">
                  <Share2 size={18} />
                </button>
              </div>
              
              <a 
                href={selectedArticle.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                onClick={(e) => e.stopPropagation()}
              >
                Read Full Article <ExternalLink size={16} className="ml-2" />
              </a>
            </div>
          </div>
        </div>
      )}

      {articles.length > 9 && (
        <div className="text-center mt-6">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            Load More News <RefreshCw size={16} className="ml-2" />
          </button>
        </div>
      )}
      
      {/* Debug stats when in debug mode */}
      {debugMode && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg text-xs">
          <h4 className="font-semibold">Debug Info:</h4>
          <p>Images loaded successfully: {imageLoadStats.success}</p>
          <p>Images failed to load: {imageLoadStats.failed}</p>
          <p>Using fallback images: {imageLoadStats.failed > 0 ? 'Yes' : 'No'}</p>
        </div>
      )}
    </div>
  );
};

export default RenewableEnergyNews;