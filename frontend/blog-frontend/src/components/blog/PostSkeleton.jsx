import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const PostSkeleton = () => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="space-y-4">
        {/* Author Info Skeleton */}
        <div className="flex items-center space-x-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-3 w-16" />
        </div>

        {/* Image Skeleton */}
        <Skeleton className="aspect-video rounded-md" />
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        {/* Title Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-3/4" />
        </div>

        {/* Excerpt Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        {/* Tags Skeleton */}
        <div className="flex space-x-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>

        {/* Read Time Skeleton */}
        <Skeleton className="h-3 w-20" />
      </CardContent>

      <CardFooter className="pt-4">
        <div className="flex items-center justify-between w-full">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-20" />
        </div>
      </CardFooter>
    </Card>
  );
};

export default PostSkeleton;

