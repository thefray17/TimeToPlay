import type { Court } from '@/lib/types';
import CourtCard from './court-card';
import { Skeleton } from './ui/skeleton';

type CourtListProps = {
  courts: Court[];
  isLoading: boolean;
};

export default function CourtList({ courts, isLoading }: CourtListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex flex-col space-y-3">
            <Skeleton className="h-[224px] w-full rounded-2xl" />
            <div className="space-y-2 px-1">
              <Skeleton className="h-5 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (courts.length === 0) {
    return (
      <div className="text-center py-16 px-4 border-2 border-dashed rounded-lg">
        <h2 className="text-xl font-semibold">No Courts Found</h2>
        <p className="text-muted-foreground mt-2">
          Try adjusting your search filters to find available courts.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {courts.map((court) => (
        <CourtCard key={court.id} court={court} />
      ))}
    </div>
  );
}
