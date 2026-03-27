export function SkeletonCard() {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200 dark:bg-gray-700" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/2" />
        <div className="flex gap-3 pt-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-12" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-16" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonText({ lines = 3 }) {
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg"
          style={{ width: `${100 - i * 15}%` }} />
      ))}
    </div>
  );
}

export function SkeletonMenuItem() {
  return (
    <div className="flex gap-4 p-4 animate-pulse border-b border-gray-100 dark:border-gray-700">
      <div className="flex-1 space-y-2">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-full" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/3" />
      </div>
      <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-xl shrink-0" />
    </div>
  );
}
