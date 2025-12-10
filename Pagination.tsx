import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  // Generates the page numbers to display, including ellipses for many pages
  const getPaginationItems = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 7; // The maximum number of pagination items to show

    // If there are not enough pages to require truncation, show all page numbers
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    // Always show the first page
    pages.push(1);

    // Show ellipsis after the first page if the current page is far from the start
    if (currentPage > 4) {
      pages.push('...');
    }

    // Determine the range of pages to display around the current page
    const startPage = Math.max(2, currentPage - 2);
    const endPage = Math.min(totalPages - 1, currentPage + 2);

    // Add the calculated page numbers to the list
    for (let i = startPage; i <= endPage; i++) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }

    // Show ellipsis before the last page if the current page is far from the end
    if (currentPage < totalPages - 3) {
      if (!pages.includes('...')) {
        pages.push('...');
      }
    }

    // Always show the last page
    if (!pages.includes(totalPages)) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPaginationItems();

  return (
    <div className="flex justify-center items-center gap-2 flex-wrap">
      {pages.map((page, index) =>
        typeof page === 'string' ? (
          <span key={`ellipsis-${index}`} className="px-2 py-2 text-slate-500">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              currentPage === page
                ? 'bg-ocean-600 text-white shadow-md'
                : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {page}
          </button>
        )
      )}
      {currentPage < totalPages && (
        <button
          onClick={() => onPageChange(currentPage + 1)}
          className="px-3 py-1 rounded-md text-sm font-medium transition-colors bg-white text-slate-500 hover:bg-slate-100 border border-slate-200 flex items-center gap-1"
        >
          Next <span className="text-xs">▶</span>
        </button>
      )}
    </div>
  );
};

export default Pagination;
