import React from 'react';
import { elements } from '../ui/colors'; // Import from your colors file

// Unified skeleton components for both client and admin use
const Skeleton = {
  // Base skeleton pulse with energy-specific color variations
  SkeletonPulse: ({ className, energyType }) => {
    const energyColor = elements[energyType] || '#6b7280'; // Default to gray if type not found
    
    return (
      <div 
        className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded ${className}`}
        style={{ 
          '--energy-color-faded': `${energyColor}20` // Using hex with alpha
        }}
      ></div>
    );
  },

  // Energy icon skeleton (sun, droplets, etc.)
  SkeletonIcon: ({ energyType, size = "w-6 h-6" }) => {
    const energyColor = elements[energyType] || '#6b7280';
    
    return (
      <div className={`relative ${size} rounded-full overflow-hidden`}>
        <div className="absolute inset-0 rounded-full animate-pulse"
          style={{ 
            background: `linear-gradient(to top right, ${energyColor}40, ${energyColor}20)`,
          }}
        ></div>
      </div>
    );
  },

  // Button skeleton with energy-specific styling
  SkeletonButton: ({ width = "w-36", energyType }) => {
    const energyColor = elements[energyType] || '#6b7280';
    
    return (
      <div className={`${width} h-10 rounded-md overflow-hidden relative`}>
        <div className="absolute inset-0 animate-pulse bg-gray-200"></div>
        <div 
          className="absolute inset-0 animate-pulse opacity-30"
          style={{ 
            background: `linear-gradient(to right, ${energyColor}30, ${energyColor}10)`
          }}
        ></div>
      </div>
    );
  },

  // Chart skeleton with energy-specific styling
  SkeletonChart: ({ energyType, type = 'area', height = "h-64" }) => {
    const energyColor = elements[energyType] || '#6b7280';
    
    return (
      <div className={`w-full ${height} relative overflow-hidden`}>
        <div className="absolute inset-0 animate-pulse bg-gray-200"></div>
        
        {/* Chart grid lines simulation */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-300"></div>
        <div className="absolute top-0 bottom-0 left-0 w-px bg-gray-300"></div>
        {[...Array(5)].map((_, i) => (
          <div 
            key={i} 
            className="absolute left-0 right-0 h-px bg-gray-300 opacity-50"
            style={{ top: `${20 + i * 15}%` }}
          ></div>
        ))}
        
        {/* Chart visualization based on type */}
        {type === 'area' && (
          <div 
            className="absolute bottom-0 left-0 right-0 animate-pulse"
            style={{ 
              height: '60%', 
              background: `linear-gradient(to top, ${energyColor}50, transparent)`,
              clipPath: 'polygon(0 100%, 20% 80%, 40% 90%, 60% 60%, 80% 70%, 100% 40%, 100% 100%)'
            }}
          ></div>
        )}
        
        {type === 'line' && (
          <div 
            className="absolute bottom-0 left-0 right-0 animate-pulse"
            style={{ 
              height: '0',
              borderTop: `2px solid ${energyColor}`,
              clipPath: 'polygon(0 0, 20% 80%, 40% 30%, 60% 50%, 80% 20%, 100% 70%)'
            }}
          ></div>
        )}
        
        {type === 'bar' && (
          <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between px-4 h-[60%]">
            {[...Array(7)].map((_, i) => (
              <div 
                key={i} 
                className="w-8 mx-1 animate-pulse rounded-t"
                style={{ 
                  height: `${20 + Math.random() * 70}%`,
                  backgroundColor: `${energyColor}80`
                }}
              ></div>
            ))}
          </div>
        )}
      </div>
    );
  },

  // Table skeleton for admin views
  SkeletonTable: ({ energyType, rows = 5 }) => {
    const energyColor = elements[energyType] || '#6b7280';
    const { SkeletonPulse } = Skeleton;
    
    return (
      <div className="w-full overflow-hidden border border-gray-200 rounded-md">
        {/* Table header */}
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <SkeletonPulse className="w-64 h-6" energyType={energyType} />
          <div className="flex gap-2">
            <SkeletonPulse className="w-24 h-8 rounded-md" energyType={energyType} />
            <SkeletonPulse className="w-24 h-8 rounded-md" energyType={energyType} />
          </div>
        </div>
        
        {/* Table toolbar */}
        <div className="p-3 border-b border-gray-200 flex justify-between">
          <SkeletonPulse className="w-48 h-10 rounded-md" energyType={energyType} />
          <div className="flex gap-2">
            <SkeletonPulse className="w-10 h-10 rounded-md" energyType={energyType} />
            <SkeletonPulse className="w-10 h-10 rounded-md" energyType={energyType} />
            <SkeletonPulse className="w-10 h-10 rounded-md" energyType={energyType} />
          </div>
        </div>
        
        {/* Table header row */}
        <div className="flex border-b border-gray-200 bg-gray-50 p-3">
          <SkeletonPulse className="w-12 h-6 mr-4" energyType={energyType} />
          <SkeletonPulse className="w-24 h-6 mr-auto" energyType={energyType} />
          <SkeletonPulse className="w-32 h-6 mx-4" energyType={energyType} />
          <SkeletonPulse className="w-20 h-6 ml-4" energyType={energyType} />
        </div>
        
        {/* Table rows */}
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="flex border-b border-gray-200 p-3">
            <SkeletonPulse className="w-12 h-5 mr-4" energyType={energyType} />
            <SkeletonPulse className="w-20 h-5 mr-auto" energyType={energyType} />
            <SkeletonPulse className="w-28 h-5 mx-4" energyType={energyType} />
            <div className="flex gap-2 ml-4">
              <SkeletonPulse className="w-8 h-8 rounded-full" energyType={energyType} />
              <SkeletonPulse className="w-8 h-8 rounded-full" energyType={energyType} />
            </div>
          </div>
        ))}
        
        {/* Table pagination */}
        <div className="p-3 bg-gray-50 flex justify-between items-center">
          <SkeletonPulse className="w-36 h-5" energyType={energyType} />
          <div className="flex gap-2">
            {[...Array(3)].map((_, i) => (
              <SkeletonPulse key={i} className="w-8 h-8 rounded-md" energyType={energyType} />
            ))}
          </div>
        </div>
      </div>
    );
  },

  // Full energy page loading skeleton for client view
  EnergyPageSkeleton: ({ energyType, CardComponent }) => {
    const { SkeletonPulse, SkeletonIcon, SkeletonButton, SkeletonChart } = Skeleton;
    
    return (
      <div className="p-6">
        {/* Header Section Skeleton */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <SkeletonIcon energyType={energyType} />
              <div className="space-y-2">
                <SkeletonPulse className="w-48 h-8" energyType={energyType} />
                <SkeletonPulse className="w-24 h-4 opacity-70" energyType={energyType} />
              </div>
            </div>
            <div className="flex gap-4 items-center">
              <SkeletonPulse className="w-64 h-10 rounded-md" energyType={energyType} />
              <SkeletonButton energyType={energyType} />
              <SkeletonButton energyType={energyType} />
            </div>
          </div>
        </div>

        {/* Card Component - use generic card styling if CardComponent not provided */}
        <div className="p-6 mb-6" style={{ borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
          <div className="space-y-2 mb-6">
            <SkeletonPulse className="w-48 h-7" energyType={energyType} />
            <SkeletonPulse className="w-64 h-4 opacity-70" energyType={energyType} />
          </div>
          <SkeletonChart energyType={energyType} />
        </div>
      </div>
    );
  },

  // Admin energy page loading skeleton with table
  AdminPageSkeleton: ({ energyType, chartType = 'line' }) => {
    const { SkeletonPulse, SkeletonIcon, SkeletonButton, SkeletonChart, SkeletonTable } = Skeleton;
    
    return (
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gray-100">
              <SkeletonIcon energyType={energyType} />
            </div>
            <div>
              <SkeletonPulse className="w-64 h-8 mb-2" energyType={energyType} />
              <SkeletonPulse className="w-48 h-5" energyType={energyType} />
            </div>
          </div>
          <SkeletonButton width="w-48" energyType={energyType} />
        </div>

        {/* Year Range Filter Card */}
        <div className="mb-6 p-4 rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="flex justify-between items-center">
            <SkeletonPulse className="w-64 h-7" energyType={energyType} />
            <SkeletonPulse className="w-64 h-10 rounded-md" energyType={energyType} />
          </div>
        </div>

        {/* Chart Section */}
        <div className="mb-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <SkeletonPulse className="w-48 h-7 mb-2" energyType={energyType} />
            <div className="flex items-center">
              <SkeletonPulse className="w-32 h-5 mr-2" energyType={energyType} />
              <SkeletonPulse className="w-24 h-7" energyType={energyType} />
            </div>
          </div>
          <div className="p-6 h-80">
            <SkeletonChart energyType={energyType} type={chartType} height="h-full" />
          </div>
        </div>

        {/* Data Table Section */}
        <SkeletonTable energyType={energyType} />
      </div>
    );
  },
  
  // Dashboard card skeleton
  DashboardCardSkeleton: ({ energyType, height = "h-64" }) => {
    const { SkeletonPulse } = Skeleton;
    const energyColor = elements[energyType] || '#6b7280';
    
    return (
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: energyColor }}
            />
            <SkeletonPulse className="w-32 h-6" energyType={energyType} />
          </div>
        </div>
        <div className={`p-4 ${height} flex flex-col`}>
          <SkeletonPulse className="w-24 h-8 mb-1" energyType={energyType} />
          <SkeletonPulse className="w-32 h-4 mb-4" energyType={energyType} />
          <div className="flex-grow">
            <div 
              className="w-full h-full animate-pulse opacity-30 rounded"
              style={{ backgroundColor: energyColor }}
            />
          </div>
        </div>
      </div>
    );
  }
};

export default Skeleton;