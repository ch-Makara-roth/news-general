import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export default function NewsSkeleton() {
  return (
    <Card className="flex flex-col overflow-hidden">
      <CardHeader className="p-0">
        <Skeleton className="h-48 w-full" />
      </CardHeader>
      <CardContent className="flex-grow p-4">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-5/6 mb-3" />
        <Skeleton className="h-3 w-1/2 mb-1" />
        <Skeleton className="h-3 w-1/3" />
      </CardContent>
      <CardFooter className="p-4 flex justify-between">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-24" />
      </CardFooter>
    </Card>
  );
}
