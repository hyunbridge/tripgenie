import { Suspense } from "react"
import DestinationsLoading from "../loading"
import DestinationsContent from "./content"
import { getSearchResult } from "@/app/actions/travel"

export default async function DestinationsPage({ params }: { params: { id: string } }) {
  const searchResult = await getSearchResult(params.id)

  return (
    <Suspense fallback={<DestinationsLoading />}>
      <DestinationsContent searchResult={searchResult} />
    </Suspense>
  )
} 