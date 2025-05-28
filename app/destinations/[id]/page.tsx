import { Suspense } from "react"
import DestinationsLoading from "../loading"
import DestinationsContent from "./content"
import { getSearchResult } from "@/app/actions/travel"

export default async function DestinationsPage({ params }: { params: { id: string } }) {
  const awaitedParams = await params;
  const searchResult = await getSearchResult(awaitedParams.id)

  return (
    <Suspense fallback={<DestinationsLoading />}>
      <DestinationsContent searchResult={searchResult} />
    </Suspense>
  )
} 