/** grey placeholders shown while ads load: the page keeps its shape instead of a lone spinner */
export default function AdSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2" role="status" aria-label="Loading">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="card flex animate-pulse overflow-hidden !p-0">
          <div className="min-h-[7.5rem] w-[8.25rem] shrink-0 bg-brand-100 sm:w-48" />
          <div className="flex-1 space-y-2.5 p-3.5"><div className="h-4 w-3/4 rounded bg-brand-100" /><div className="h-3 w-1/2 rounded bg-brand-100" /><div className="h-3 w-2/3 rounded bg-brand-100" /><div className="h-5 w-1/3 rounded bg-brand-100" /></div>
        </div>
      ))}
    </div>
  );
}
