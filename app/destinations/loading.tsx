import { Skeleton } from "@/components/ui/skeleton"

export default function DestinationsLoading() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 to-white py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <Skeleton className="h-48 w-full rounded-t-lg" />
              <div className="p-5 space-y-3">
                <div className="flex items-center mb-2">
                  <Skeleton className="h-5 w-5 mr-2 rounded-full" />
                  <Skeleton className="h-6 w-3/4" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />

                <div className="bg-slate-100 p-3 rounded-lg space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-full" />
                </div>

                <div className="flex flex-wrap gap-2 mb-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-12 rounded-full" />
                </div>

                <div className="space-y-1 text-xs">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                </div>

                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
