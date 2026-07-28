export default function SkeletonCard() {
  return (
    <div className="card p-4 space-y-3">
      <div className="skeleton h-40 w-full" />
      <div className="skeleton h-4 w-3/4" />
      <div className="skeleton h-4 w-1/2" />
      <div className="flex gap-2 pt-2">
        <div className="skeleton h-8 w-20" />
        <div className="skeleton h-8 w-20" />
      </div>
    </div>
  );
}
