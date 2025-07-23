import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCalendarAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const QuarterSelector = ({ quarters, selected, onSelect }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = isMobile ? 2 : 4;
  
  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Sort quarters chronologically (newest first)
  const sortedQuarters = [...quarters].sort((a, b) => {
    const extract = (q) => {
      const [qPart, year] = q.quarter.split(' ');
      const qNum = parseInt(qPart.replace('Q', ''));
      return { year: parseInt(year), qNum };
    };
    
    const aVal = extract(a);
    const bVal = extract(b);
    
    if (aVal.year !== bVal.year) {
      return bVal.year - aVal.year;
    }
    return bVal.qNum - aVal.qNum;
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedQuarters.length / itemsPerPage);
  const paginatedQuarters = sortedQuarters.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handlePrev = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-blue-800 tracking-tight flex items-center">
          <FaCalendarAlt className="mr-2" /> Select a Quarter
        </h2>
        
        {totalPages > 1 && (
          <div className="flex items-center space-x-2">
            <button 
              onClick={handlePrev}
              disabled={currentPage === 0}
              className={`p-2 rounded-full ${currentPage === 0 ? 'text-gray-300' : 'text-blue-600 hover:bg-blue-100'}`}
              aria-label="Previous quarters"
            >
              <FaChevronLeft />
            </button>
            
            <span className="text-sm text-gray-600">
              {currentPage + 1} / {totalPages}
            </span>
            
            <button 
              onClick={handleNext}
              disabled={currentPage === totalPages - 1}
              className={`p-2 rounded-full ${currentPage === totalPages - 1 ? 'text-gray-300' : 'text-blue-600 hover:bg-blue-100'}`}
              aria-label="Next quarters"
            >
              <FaChevronRight />
            </button>
          </div>
        )}
      </div>
      
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex flex-wrap gap-3"
          >
            {paginatedQuarters.map((quarter) => {
              const isActive = selected.quarter === quarter.quarter;
              return (
                <motion.button
                  key={quarter.quarter}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-full border text-sm font-medium shadow-sm transition-all duration-200 relative overflow-hidden
                    ${isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-blue-600 shadow-md'
                      : 'bg-white text-gray-800 border-gray-300 hover:bg-blue-50 hover:border-blue-400'
                    }`}
                  onClick={() => onSelect(quarter)}
                  aria-pressed={isActive}
                  aria-label={`Select ${quarter.quarter} earnings call`}
                >
                  {quarter.quarter}
                  {isActive && (
                    <motion.span 
                      className="absolute -inset-0.5 bg-blue-200 rounded-full opacity-30 animate-pulse"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1.2 }}
                      transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
                    />
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
      
      {selected && (
        <div className="mt-3 flex items-center">
          <div className="flex-1">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Showing:</span> {selected.date}
            </p>
            {selected.management?.themes?.length > 0 && (
              <div className="mt-1 text-xs text-gray-500">
                <span className="font-medium">Key themes:</span> {selected.management.themes.join(', ')}
              </div>
            )}
          </div>
          
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-green-500 mr-1"></div>
            <span className="text-xs text-gray-500">
              {selected.management?.sentiment === 'positive' ? 'Positive' : 
               selected.management?.sentiment === 'negative' ? 'Negative' : 'Neutral'} sentiment
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuarterSelector;