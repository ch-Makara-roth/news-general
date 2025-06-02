
import NewsSkeleton from "./NewsSkeleton";

export default function NewsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <NewsSkeleton key={index} />
      ))}
    </div>
  );
}
