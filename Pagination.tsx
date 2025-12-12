// Pagination.tsx

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / pageSize);

  if (totalPages <= 1) {
    return null;
  }

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

  return (
    <div className="flex justify-center items-center mt-8">
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className="flex items-center px-4 py-2 mx-1 text-gray-400 bg-gray-800 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft size={20} />
        <span className="ml-2">Previous</span>
      </button>

      <div className="text-gray-400 px-4">
        Page {currentPage} of {totalPages}
      </div>

      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="flex items-center px-4 py-2 mx-1 text-gray-400 bg-gray-800 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="mr-2">Next</span>
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default Pagination;
