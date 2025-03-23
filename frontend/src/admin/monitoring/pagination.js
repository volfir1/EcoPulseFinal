// src/admin/common/Pagination.jsx
import React from 'react';
import { 
  Box, 
  Button, 
  IconButton, 
  Typography 
} from '@mui/material';
import { 
  KeyboardArrowLeft, 
  KeyboardArrowRight, 
  FirstPage, 
  LastPage 
} from '@mui/icons-material';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  showPageNumbers = true, 
  size = 'medium' 
}) => {
  if (totalPages <= 1) return null;

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handleFirst = () => {
    if (currentPage !== 1) {
      onPageChange(1);
    }
  };

  const handleLast = () => {
    if (currentPage !== totalPages) {
      onPageChange(totalPages);
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <Button
          key={i}
          variant={i === currentPage ? 'contained' : 'outlined'}
          color="primary"
          size={size}
          onClick={() => onPageChange(i)}
          className="mx-1"
        >
          {i}
        </Button>
      );
    }
    return pageNumbers;
  };

  return (
    <Box className="flex justify-center items-center gap-2">
      <IconButton 
        onClick={handleFirst} 
        disabled={currentPage === 1}
        size={size}
      >
        <FirstPage />
      </IconButton>
      
      <IconButton 
        onClick={handlePrevious} 
        disabled={currentPage === 1}
        size={size}
      >
        <KeyboardArrowLeft />
      </IconButton>
      
      {showPageNumbers && (
        <Box className="flex mx-2">
          {renderPageNumbers()}
        </Box>
      )}
      
      {!showPageNumbers && (
        <Typography variant="body2" className="mx-2">
          Page {currentPage} of {totalPages}
        </Typography>
      )}
      
      <IconButton 
        onClick={handleNext} 
        disabled={currentPage === totalPages}
        size={size}
      >
        <KeyboardArrowRight />
      </IconButton>
      
      <IconButton 
        onClick={handleLast} 
        disabled={currentPage === totalPages}
        size={size}
      >
        <LastPage />
      </IconButton>
    </Box>
  );
};

export default Pagination;