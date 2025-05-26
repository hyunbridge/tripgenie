"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, MapPin, Star, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createItinerary } from "@/app/actions/travel"
import { useState, useTransition } from "react"
import { useToast } from "@/hooks/use-toast"
import { SearchResultUI } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import PlanLoadingSkeleton from "@/app/plan/[id]/loading"

export default function DestinationsContent({ searchResult }: { searchResult: SearchResultUI }) {
  const [isPending, startTransition] = useTransition()
  const [loadingDestination, setLoadingDestination] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const handleSelectDestination = async (destination: any) => {
    setLoadingDestination(destination.id)
    startTransition(async () => {
      try {
        const result = await createItinerary(
          destination.city,
          destination.country,
          searchResult.startDate,
          searchResult.endDate,
          searchResult.travelType,
          searchResult.interests.join(', '),
          destination.imageUrl,
          searchResult.id
        )
        
        if (result.success && result.planId) {
          router.push(`/plan/${result.planId}`)
        } else {
          throw new Error(result.error || "여행 계획 생성에 실패했습니다.")
        }
      } catch (error) {
        toast({
          title: "오류 발생",
          description: "여행 계획 생성 중 오류가 발생했습니다. 다시 시도해주세요.",
          variant: "destructive",
        })
        setLoadingDestination(null)
      }
    })
  }

  if (loadingDestination) {
    return <PlanLoadingSkeleton />
  }

  if (!searchResult || !searchResult.results?.destinations) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-sky-50 to-white py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center text-sky-600 hover:text-sky-800">
              <ArrowLeft className="h-4 w-4 mr-1" />
              메인으로 돌아가기
            </Link>
            <h1 className="text-3xl font-bold mt-4 text-slate-800">여행지를 찾을 수 없습니다</h1>
            <p className="text-slate-600">검색 ID ({searchResult?.id}) 에 해당하는 여행지 정보를 찾을 수 없거나, 데이터가 없습니다. 다시 시도해주세요.</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 to-white py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sky-600 hover:text-sky-800">
            <ArrowLeft className="h-4 w-4 mr-1" />
            메인으로 돌아가기
          </Link>
          <div className="flex items-center gap-2 mt-4">
            <Sparkles className="h-6 w-6 text-sky-500" />
            <h1 className="text-3xl font-bold text-slate-800">AI 추천 여행지</h1>
          </div>
          <p className="text-slate-600">
            {searchResult.travelType} 여행으로 {searchResult.interests.join(', ')}을(를) 즐길 수 있는 여행지를 찾았습니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {searchResult.results.destinations.map((destination: any) => (
            <Card
              key={destination.id}
              className="overflow-hidden group hover:shadow-lg transition-all duration-300 bg-white/90 backdrop-blur-sm border-white/50"
            >
              <div className="relative h-48">
                <Image
                  src={destination.imageUrl || "/placeholder.svg?height=200&width=350"}
                  alt={destination.city}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-2 right-2">
                  <Badge className="bg-white/90 text-sky-700 backdrop-blur-sm">
                    <Star className="h-3 w-3 fill-amber-500 text-amber-500 mr-1" />
                    {destination.rating}
                  </Badge>
                </div>
                <div className="absolute top-2 left-2">
                  <Badge className="bg-sky-500/90 text-white backdrop-blur-sm">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI 추천
                  </Badge>
                </div>
              </div>
              <CardContent className="p-5">
                <div className="flex items-center mb-2">
                  <MapPin className="h-4 w-4 text-sky-500 mr-1" />
                  <h2 className="text-xl font-semibold">
                    {destination.city}, <span className="text-slate-500 text-sm">{destination.country}</span>
                  </h2>
                </div>
                <p className="text-slate-600 mb-3">{destination.summary}</p>

                <div className="bg-sky-50 p-3 rounded-lg mb-4">
                  <p className="text-sm text-sky-800 font-medium mb-1">추천 이유</p>
                  <p className="text-sm text-sky-700">{destination.whyRecommended}</p>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {destination.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="bg-sky-100 text-sky-700 hover:bg-sky-200">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="text-xs text-slate-500 mb-4 space-y-1">
                  <div>최적 방문 시기: {destination.bestTimeToVisit}</div>
                  <div>예상 예산: {destination.estimatedBudget}</div>
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 disabled:opacity-50"
                  disabled={isPending || loadingDestination !== null}
                  onClick={() => handleSelectDestination(destination)}
                >
                  여기로 떠날게요
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  )
} 