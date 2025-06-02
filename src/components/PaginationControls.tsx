"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function PaginationControls({
  currentPage,
  totalPages,
  hasNextPage,
  hasPrevPage,
}: PaginationControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set("page", String(page));
    const search = current.toString();
    const query = search ? `?${search}` : "";
    router.push(`${pathname}${query}`);
  };

  if (totalPages <=1) return null;

  return (
    <div className="mt-8 flex items-center justify-center space-x-4">
      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={!hasPrevPage}
        aria-label="Previous Page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm font-medium">
        Page {currentPage} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={!hasNextPage}
        aria-label="Next Page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
