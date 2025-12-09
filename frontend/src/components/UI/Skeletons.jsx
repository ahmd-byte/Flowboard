// Loading Skeleton Components

export const BoardSkeleton = () => (
  <div className="h-36 rounded-2xl skeleton" />
);

export const CardSkeleton = () => (
  <div className="bg-neutral-800/50 p-3 rounded-xl mb-2 space-y-2">
    <div className="h-4 w-3/4 skeleton" />
    <div className="h-3 w-1/2 skeleton" />
  </div>
);

export const ListSkeleton = () => (
  <div className="w-72 flex-shrink-0 bg-neutral-900/50 rounded-2xl p-3 mr-4">
    <div className="h-5 w-24 skeleton mb-4" />
    <CardSkeleton />
    <CardSkeleton />
    <CardSkeleton />
  </div>
);

export const StatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="bg-neutral-900 rounded-2xl p-6 border border-neutral-800">
        <div className="h-4 w-20 skeleton mb-3" />
        <div className="h-8 w-16 skeleton" />
      </div>
    ))}
  </div>
);

export const ProfileSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center gap-4">
      <div className="w-20 h-20 rounded-full skeleton" />
      <div className="space-y-2">
        <div className="h-5 w-32 skeleton" />
        <div className="h-4 w-48 skeleton" />
      </div>
    </div>
  </div>
);

export const TableRowSkeleton = () => (
  <div className="flex items-center gap-4 p-4 border-b border-neutral-800">
    <div className="w-10 h-10 rounded-full skeleton" />
    <div className="flex-1 space-y-2">
      <div className="h-4 w-1/3 skeleton" />
      <div className="h-3 w-1/4 skeleton" />
    </div>
    <div className="h-6 w-20 skeleton rounded-full" />
  </div>
);

