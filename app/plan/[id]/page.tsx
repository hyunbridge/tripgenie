"use client"

import { Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft,
  Calendar,
  Download,
  Printer,
  Share2,
  ThumbsUp,
  MessageSquare,
  Loader2,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useSearchParams } from "next/navigation"
import { updateItinerary } from "@/app/actions/travel"
import { useState, useTransition, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

function TravelPlanContent() {
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState("")
  const [currentItinerary, setCurrentItinerary] = useState<any>(null)
  const { toast } = useToast()

  const destination = searchParams.get("destination") || ""
  const country = searchParams.get("country") || ""
  const startDate = searchParams.get("startDate") || ""
  const endDate = searchParams.get("endDate") || ""
  const travelType = searchParams.get("travelType") || ""
  const interests = searchParams.get("interests") || ""
  const itineraryParam = searchParams.get("itinerary")

  let travelPlan = null
  try {
    if (itineraryParam) {
      travelPlan = JSON.parse(itineraryParam)
    }
  } catch (error) {
    console.error("Error parsing itinerary:", error)
  }

  // useEffect를 사용하여 초기 상태 설정
  useEffect(() => {
    if (travelPlan && !currentItinerary) {
      setCurrentItinerary(travelPlan)
    }
  }, [travelPlan, currentItinerary])

  const handleFeedback = async () => {
    if (!feedback.trim()) {
      toast({
        title: "피드백을 입력해주세요",
        description: "여행 계획에 대한 피드백을 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    startTransition(async () => {
      try {
        const result = await updateItinerary(currentItinerary, feedback)
        if (result.success) {
          setCurrentItinerary(result.itinerary)
          setFeedback("")
          toast({
            title: "여행 계획이 수정되었습니다",
            description: "피드백을 반영하여 계획을 업데이트했습니다.",
          })
        } else {
          throw new Error(result.error)
        }
      } catch (error) {
        toast({
          title: "오류 발생",
          description: "여행 계획 수정 중 오류가 발생했습니다. 다시 시도해주세요.",
          variant: "destructive",
        })
      }
    })
  }

  if (!travelPlan) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-sky-50 to-white py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <Link href="/destinations" className="inline-flex items-center text-sky-600 hover:text-sky-800">
              <ArrowLeft className="h-4 w-4 mr-1" />
              트립지니 여행지 목록으로 돌아가기
            </Link>
            <h1 className="text-3xl font-bold mt-4 text-slate-800">여행 계획을 찾을 수 없습니다</h1>
            <p className="text-slate-600">다시 시도해주세요.</p>
          </div>
        </div>
      </main>
    )
  }

  const displayPlan = currentItinerary || travelPlan

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 to-white py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <Link href="/destinations" className="inline-flex items-center text-sky-600 hover:text-sky-800">
            <ArrowLeft className="h-4 w-4 mr-1" />
            트립지니 여행지 목록으로 돌아가기
          </Link>
        </div>

        <div className="relative rounded-xl overflow-hidden h-64 md:h-80 mb-8">
          <Image
            src="/placeholder.svg?height=300&width=800"
            alt={displayPlan.destination}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-end p-6">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-sky-500/90 text-white backdrop-blur-sm">
                <Sparkles className="h-3 w-3 mr-1" />
                AI 맞춤 계획
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              {displayPlan.destination}, {displayPlan.country}
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-white/90">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {startDate} - {endDate} ({displayPlan.totalDays}일)
              </div>
              <div className="hidden sm:block">•</div>
              <div>{travelType} 여행</div>
            </div>
          </div>
        </div>

        {displayPlan.overview && (
          <Card className="mb-8 bg-white/80 backdrop-blur-sm border-white/50">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-3 flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-sky-500" />
                여행 개요
              </h2>
              <p className="text-slate-700">{displayPlan.overview}</p>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-wrap gap-2 mb-8">
          <Button variant="outline" size="sm" className="gap-1">
            <Download className="h-4 w-4" />
            PDF 저장
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <Printer className="h-4 w-4" />
            인쇄하기
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <Share2 className="h-4 w-4" />
            공유하기
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          <div>
            <Tabs defaultValue="day1">
              <TabsList
                className="mb-4 w-full grid"
                style={{ gridTemplateColumns: `repeat(${displayPlan.days.length}, 1fr)` }}
              >
                {displayPlan.days.map((day: any) => (
                  <TabsTrigger key={day.day} value={`day${day.day}`}>
                    Day {day.day}
                  </TabsTrigger>
                ))}
              </TabsList>

              {displayPlan.days.map((day: any) => (
                <TabsContent key={day.day} value={`day${day.day}`} className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-800">{day.title}</h2>
                    <p className="text-slate-600">
                      Day {day.day} - {day.date}
                    </p>
                  </div>

                  <div className="space-y-6">
                    {day.activities.map((activity: any, index: number) => (
                      <Card key={index} className="bg-white/80 backdrop-blur-sm border-white/50">
                        <CardContent className="p-5">
                          <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                            <div className="font-semibold text-sky-600 min-w-[60px]">{activity.time}</div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{activity.title}</h3>
                              <p className="text-slate-600 mt-1">{activity.description}</p>
                              <div className="text-sm text-slate-500 mt-1">📍 {activity.location}</div>
                              {activity.estimatedCost && (
                                <div className="text-sm text-green-600 mt-1">💰 {activity.estimatedCost}</div>
                              )}
                              {activity.tips && (
                                <div className="text-sm text-amber-600 mt-2 bg-amber-50 p-2 rounded">
                                  💡 {activity.tips}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          <div>
            <Card className="bg-white/80 backdrop-blur-sm border-white/50 sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  여행 계획 피드백
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600">
                  이 여행 계획에 대한 피드백을 남겨주세요. AI가 계획을 수정해드립니다.
                </p>
                <Textarea
                  placeholder="예: 첫째 날 일정이 너무 빡빡해요. 좀 더 여유롭게 조정해주세요."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
                <Button className="w-full" onClick={handleFeedback} disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      AI가 수정 중...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      피드백 보내기
                    </>
                  )}
                </Button>
                <Separator />
                <div className="text-center">
                  <p className="text-sm text-slate-600 mb-2">이 여행 계획이 마음에 드시나요?</p>
                  <Button variant="outline" className="gap-1">
                    <ThumbsUp className="h-4 w-4" />
                    좋아요
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function TravelPlanPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gradient-to-b from-sky-50 to-white py-8">
          <div className="container mx-auto px-4 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-sky-500" />
              <p className="text-slate-600">여행 계획을 불러오는 중...</p>
            </div>
          </div>
        </main>
      }
    >
      <TravelPlanContent />
    </Suspense>
  )
}
