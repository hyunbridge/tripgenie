"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Calendar, Users } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Sparkles } from "lucide-react"
import Image from "next/image"
import { useSearchParams } from "next/navigation"

interface TravelPlanLoadingProps {
  creating?: boolean;
}

export default function TravelPlanLoading({ creating }: TravelPlanLoadingProps) {
  const searchParams = useSearchParams()
  const destination = searchParams.get("destination")
  const country = searchParams.get("country")
  const startDate = searchParams.get("startDate")
  const endDate = searchParams.get("endDate")
  const travelType = searchParams.get("travelType")
  const imageUrl = searchParams.get("imageUrl")
  
  const showAiPopup = creating || searchParams.get('creating') === 'true';

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 to-white py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <Link href="/destinations" className="inline-flex items-center text-sky-600 hover:text-sky-800">
            <ArrowLeft className="h-4 w-4 mr-1" />
            트립지니 여행지 목록으로 돌아가기
          </Link>
        </div>

        {/* AI 생성 중 표시 - 중앙 팝업 (creating이 true일 때만 표시) */}
        {showAiPopup && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full mx-4 space-y-6 relative overflow-hidden">
              {/* 배경 그라데이션 효과 */}
              <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-sky-50 opacity-50"></div>
              
              {/* 메인 콘텐츠 */}
              <div className="relative">
                <div className="flex items-center justify-center">
                  <div className="relative">
                    {/* 별 아이콘 주변의 링 애니메이션 */}
                    <div className="absolute inset-0 rounded-full bg-sky-200 animate-ping opacity-20"></div>
                    <div className="absolute inset-0 rounded-full bg-sky-100 animate-pulse"></div>
                    {/* 빛나는 효과를 위한 그라데이션 배경 */}
                    <div className="relative bg-gradient-to-br from-sky-100 to-white rounded-full p-4 shadow-lg">
                      <Sparkles className="h-8 w-8 text-sky-500 animate-[spin_3s_linear_infinite]" />
                    </div>
                  </div>
                </div>
                <div className="text-center space-y-3 mt-6">
                  <h2 className="text-2xl font-bold text-slate-800">AI가 여행 계획을 생성하고 있어요</h2>
                  <p className="text-slate-600">
                    {destination && country && travelType 
                      ? `${destination}, ${country}에서의 ${travelType} 여행 계획을 만들고 있습니다.`
                      : "여행 계획을 만들고 있습니다."}
                    <br />
                    <span className="text-slate-600">잠시만 기다려주세요...</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 메인 이미지 */}
        <div className="relative rounded-xl overflow-hidden h-64 md:h-80 mb-8">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={destination || "여행지 이미지"}
              fill
              className="object-cover"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.jpg"
              }}
            />
          ) : (
            <Skeleton className="absolute inset-0" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-end p-6">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-sky-500/90 text-white backdrop-blur-sm">
                <Sparkles className="h-3 w-3 mr-1" />
                AI 맞춤 계획
              </Badge>
            </div>
            {destination && country ? (
              <>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {destination}, {country}
                </h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-white/90">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {startDate} - {endDate}
                  </div>
                  <div className="hidden sm:block">•</div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {travelType} 여행
                  </div>
                </div>
              </>
            ) : (
              <>
                <Skeleton className="h-10 w-2/3 mb-2" />
                <Skeleton className="h-6 w-1/2" />
              </>
            )}
          </div>
        </div>

        {/* 여행 개요 스켈레톤 */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm border-white/50">
          <CardContent className="p-6">
            <div className="flex items-center mb-3">
              <Sparkles className="h-5 w-5 mr-2 text-sky-500" />
              <h2 className="text-xl font-semibold">여행 개요</h2>
            </div>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>

        {/* 일정 스켈레톤 */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          <div className="space-y-6">
            {[1, 2, 3].map((day) => (
              <Card key={day} className="bg-white/80 backdrop-blur-sm border-white/50">
                <CardContent className="p-5">
                  <Skeleton className="h-8 w-1/3 mb-4" />
                  <div className="space-y-6">
                    {[1, 2, 3].map((activity) => (
                      <div key={activity} className="flex gap-3">
                        <Skeleton className="h-6 w-16" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 피드백 섹션 스켈레톤 */}
          <div>
            <Card className="bg-white/80 backdrop-blur-sm border-white/50 sticky top-4">
              <CardHeader>
                <CardTitle>
                  <Skeleton className="h-6 w-32" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
