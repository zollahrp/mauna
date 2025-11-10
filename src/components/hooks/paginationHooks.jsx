import { useState, useMemo } from 'react';

export function usePagination(data, itemsPerPage = 10) {
  const [currentPage, setCurrentPage] = useState(1);
  
  const paginationData = useMemo(() => {
    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = data.slice(startIndex, endIndex);
    
    return {
      currentData,
      totalItems,
      totalPages,
      currentPage,
      itemsPerPage,
      startIndex,
      endIndex
    };
  }, [data, currentPage, itemsPerPage]);
  
  const goToPage = (page) => {
    const pageNumber = Math.max(1, Math.min(page, paginationData.totalPages));
    setCurrentPage(pageNumber);
  };
  
  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(paginationData.totalPages);
  const goToNextPage = () => goToPage(currentPage + 1);
  const goToPreviousPage = () => goToPage(currentPage - 1);
  
  return {
    ...paginationData,
    goToPage,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPreviousPage,
    setCurrentPage
  };
}