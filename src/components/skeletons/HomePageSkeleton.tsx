
import { Skeleton } from "@/components/ui/skeleton";
import NewsGridSkeleton from "@/components/news/NewsGridSkeleton";

export default function HomePageSkeleton() {
  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <Skeleton className="h-9 w-48 sm:w-1/3" /> {/* Title skeleton */}
        <Skeleton className="h-10 w-full sm:w-[200px]" /> {/* Selector skeleton */}
      </div>
      <NewsGridSkeleton />
    </div>
  );
}
