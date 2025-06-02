
import { Skeleton } from "@/components/ui/skeleton";
import NewsGridSkeleton from "@/components/news/NewsGridSkeleton";

export default function CategoryPageSkeleton() {
  return (
    <div>
      <Skeleton className="h-9 w-1/2 mb-4" /> {/* Title skeleton */}
      <Skeleton className="h-12 w-full mb-6" /> {/* Tabs skeleton */}
      <NewsGridSkeleton />
    </div>
  );
}
