function SkeletonBox({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-secondary/50 ${className}`} />
}

export function ProductCardSkeleton() {
  return (
    <div className="block">
      <SkeletonBox className="aspect-[3/4] mb-4 w-full" />
      <SkeletonBox className="h-3 w-16 mb-2" />
      <SkeletonBox className="h-4 w-3/4 mb-2" />
      <SkeletonBox className="h-4 w-20" />
    </div>
  )
}

export function ProductDetailSkeleton() {
  return (
    <main className="py-8 md:py-12">
      <div className="container">
        <SkeletonBox className="h-4 w-16 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
          <SkeletonBox className="aspect-[3/4] w-full" />
          <div className="space-y-4 pt-4">
            <SkeletonBox className="h-3 w-12" />
            <SkeletonBox className="h-10 w-3/4" />
            <SkeletonBox className="h-8 w-24" />
            <SkeletonBox className="h-20 w-full" />
            <SkeletonBox className="h-12 w-full" />
            <div className="flex gap-2">
              {[1, 2, 3, 4].map(i => <SkeletonBox key={i} className="h-8 w-12" />)}
            </div>
            <SkeletonBox className="h-14 w-full" />
          </div>
        </div>
      </div>
    </main>
  )
}

export function BlogPostSkeleton() {
  return (
    <div className="border border-border p-6">
      <SkeletonBox className="aspect-video w-full mb-4" />
      <SkeletonBox className="h-3 w-20 mb-2" />
      <SkeletonBox className="h-6 w-full mb-2" />
      <SkeletonBox className="h-6 w-3/4 mb-3" />
      <SkeletonBox className="h-4 w-full mb-1" />
      <SkeletonBox className="h-4 w-5/6 mb-4" />
      <SkeletonBox className="h-3 w-24" />
    </div>
  )
}
