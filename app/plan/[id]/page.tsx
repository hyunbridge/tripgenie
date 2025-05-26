"use client"

import { Suspense, useCallback, useState, useTransition, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft,
  Calendar,
  Printer,
  Share2,
  Loader2,
  Sparkles,
  Search,
  MessageSquare,
  ThumbsUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useSearchParams, useParams } from "next/navigation"
import { getTravelPlan, updateItineraryWithId } from "@/app/actions/travel"
import { useToast } from "@/hooks/use-toast"
import { TravelPlanUI } from "@/lib/supabase"
import TravelPlanLoading from "./loading"

function TravelPlanContent() {
  const params = useParams<{ id: string }>()
  const planId = params.id
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState("")
  const [travelPlan, setTravelPlan] = useState<TravelPlanUI | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const fetchTravelPlan = useCallback(async () => {
    console.log("[PlanPage] fetchTravelPlan called for planId:", planId);
    if (!planId) return

    try {
      setIsLoading(true)
      const plan = await getTravelPlan(planId)
      console.log("[PlanPage] Fetched travel plan data:", plan);
      setTravelPlan(plan)
    } catch (error) {
      console.error("[PlanPage] Error fetching travel plan:", error)
      toast({
        title: "여행 계획을 불러올 수 없습니다",
        description: "잠시 후 다시 시도해주세요.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [planId, toast])

  useEffect(() => {
    fetchTravelPlan()
  }, [fetchTravelPlan])

  const handleFeedback = async () => {
    console.log("[PlanPage] handleFeedback called");
    if (!feedback.trim() || !planId) {
      toast({
        title: "피드백을 입력해주세요",
        description: "여행 계획에 대한 피드백을 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    startTransition(async () => {
      try {
        const result = await updateItineraryWithId(planId, feedback)
        if (result.success && result.itinerary) {
          setTravelPlan(prevPlan => {
            if (!prevPlan) return null
            return {
              ...prevPlan,
              itinerary: result.itinerary
            }
          })
          setFeedback("")
          toast({
            title: "여행 계획이 수정되었습니다",
            description: "피드백을 반영하여 계획을 업데이트했습니다.",
          })
        } else {
          throw new Error(result.error || "계획 업데이트 실패")
        }
      } catch (error) {
        toast({
          title: "오류 발생",
          description: error instanceof Error ? error.message : "여행 계획 수정 중 오류가 발생했습니다. 다시 시도해주세요.",
          variant: "destructive",
        })
      }
    })
  }

  const handlePrint = () => {
    console.log("[PlanPage] handlePrint called");
    window.print();
  };

  const handleShare = async () => {
    console.log("[PlanPage] handleShare called");
    try {
      const shareUrl = window.location.href;
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "링크가 복사되었습니다",
        description: "이 링크를 공유하여 여행 계획을 공유할 수 있습니다.",
      });
    } catch (error) {
      console.error("[PlanPage] Error copying to clipboard:", error);
      toast({
        title: "링크 복사 실패",
        description: "링크를 복사하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const getBackUrl = useCallback(() => {
    if (travelPlan?.searchId) {
      return `/destinations/${travelPlan.searchId}`;
    }
    return "/destinations";
  }, [travelPlan?.searchId]);

  if (isLoading) {
    return <TravelPlanLoading />
  }

  if (!travelPlan || !travelPlan.itinerary) {
    console.warn("[PlanPage] travelPlan or travelPlan.itinerary is null or undefined. travelPlan:", travelPlan);
    return (
      <main className="min-h-screen bg-gradient-to-b from-sky-50 to-white py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center text-sky-600 hover:text-sky-800">
              <ArrowLeft className="h-4 w-4 mr-1" />
              트립지니 홈으로 돌아가기
            </Link>
            <h1 className="text-3xl font-bold mt-4 text-slate-800">여행 계획을 찾을 수 없습니다</h1>
            <p className="text-slate-600 mt-2">
              요청하신 여행 계획을 찾을 수 없거나, 계획 내용이 비어있습니다. 올바른 링크인지 확인해주세요.
            </p>
          </div>
        </div>
      </main>
    )
  }

  const { destination, startDate, endDate, preferences, itinerary, searchId, imageUrl } = travelPlan;
  const { country, totalDays, travelType, overview, days } = itinerary;
  console.log("[PlanPage] Rendering content with searchId:", searchId);

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 to-white py-8 print:bg-white print:py-0">
      <div className="container mx-auto px-4">
        <div className="mb-6 print:hidden">
          <Link href={getBackUrl()} className="inline-flex items-center text-sky-600 hover:text-sky-800">
            <ArrowLeft className="h-4 w-4 mr-1" />
            트립지니 여행지 목록으로 돌아가기
          </Link>
        </div>

        <div className="relative rounded-xl overflow-hidden h-64 md:h-80 mb-8 print:hidden">
          <Image
            src={imageUrl || "/placeholder.jpg"}
            alt={destination}
            fill
            className="object-cover"
            onError={(e) => { 
              console.error('[PlanPage] Main image load error:', e.currentTarget.src); 
              e.currentTarget.src = '/placeholder.jpg'; 
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-end p-6">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-sky-500/90 text-white backdrop-blur-sm">
                <Sparkles className="h-3 w-3 mr-1" />
                AI 맞춤 계획
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              {destination}
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-white/90">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {startDate} - {endDate} ({totalDays}일)
              </div>
              <div className="hidden sm:block">•</div>
              <div>{travelType} 여행</div>
            </div>
          </div>
        </div>

        <div className="hidden print:block mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            {destination}
          </h1>
          <div className="flex items-center gap-4 mt-2 text-slate-600">
            <div className="flex items-center">
              {startDate} - {endDate} ({totalDays}일)
            </div>
            <div>•</div>
            <div>{travelType} 여행</div>
          </div>
        </div>

        {overview && (
          <Card className="mb-8 bg-white/80 backdrop-blur-sm border-white/50 print:border-none print:bg-transparent print:p-0">
            <CardContent className="p-6 print:p-0">
              <h2 className="text-xl font-semibold mb-3 flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-sky-500 print:hidden" />
                여행 개요
              </h2>
              <p className="text-slate-700">{overview}</p>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-wrap gap-2 mb-8 print:hidden">
          <Button variant="outline" size="sm" className="gap-1" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
            인쇄하기
          </Button>
          <Button variant="outline" size="sm" className="gap-1" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
            공유하기 (링크 복사)
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 print:block">
          <div>
            <div className="hidden print:block space-y-8">
              {days && days.map((day: any) => (
                <div key={day.day} className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-800">{day.title}</h2>
                    <p className="text-slate-600">
                      Day {day.day} - {day.date}
                    </p>
                  </div>

                  <div className="space-y-6">
                    {day.activities && day.activities.map((activity: any, index: number) => (
                      <Card key={index} className="bg-white/80 backdrop-blur-sm border-white/50 print:border-none print:bg-transparent print:shadow-none">
                        <CardContent className="p-5 print:p-0 print:py-2">
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
                                <div className="text-sm text-amber-600 mt-2 bg-amber-50 p-2 rounded print:bg-transparent print:p-0 print:mt-1">
                                  💡 {activity.tips}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="print:hidden">
              <Tabs defaultValue={days && days.length > 0 ? `day${days[0].day}` : undefined}>
                {days && days.length > 0 && (
                  <TabsList
                    className="mb-4 w-full grid"
                    style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}
                  >
                    {days.map((day: any) => (
                      <TabsTrigger key={day.day} value={`day${day.day}`}>
                        Day {day.day}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                )}

                {days && days.map((day: any) => (
                  <TabsContent key={day.day} value={`day${day.day}`} className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-semibold text-slate-800">{day.title}</h2>
                      <p className="text-slate-600">
                        Day {day.day} - {day.date}
                      </p>
                    </div>

                    <div className="space-y-6">
                      {day.activities && day.activities.map((activity: any, index: number) => (
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
          </div>

          <div className="print:hidden">
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
    <Suspense fallback={<TravelPlanLoading />}>
      <TravelPlanContent />
    </Suspense>
  )
}
