import Link from 'next/link';

interface Props {
  currentPage: number;
  totalPages: number;
}

export default function Pagination({ currentPage, totalPages }: Props) {
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  return (
    <div className="flex items-center gap-4 mt-8 justify-center">
      <Link
        href={`?page=${currentPage - 1}`}
        className={`px-4 py-2 border rounded ${isFirstPage ? 'pointer-events-none opacity-50' : 'hover:bg-gray-100'}`}
      >
        Previous
      </Link>

      <span className="font-medium">
        Page {currentPage} of {totalPages}
      </span>

      <Link
        href={`?page=${currentPage + 1}`}
        className={`px-4 py-2 border rounded ${isLastPage ? 'pointer-events-none opacity-50' : 'hover:bg-gray-100'}`}
      >
        Next
      </Link>
    </div>
  );
}
